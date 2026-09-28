// POST /api/stripe-webhook — the only place a card order becomes paid.
//
// Register this URL in the Stripe dashboard (Developers → Webhooks) for:
//   payment_intent.succeeded, payment_intent.payment_failed,
//   charge.refunded, charge.dispute.created
// and put the endpoint's signing secret in STRIPE_WEBHOOK_SECRET.
//
// The raw body is verified against STRIPE_WEBHOOK_SECRET. An order moves to
// `payment_verified` only when the PaymentIntent amount and currency match
// the stored order total; any mismatch becomes `payment_exception` for Amber
// to review. Status changes are conditional updates, so Stripe's retries
// never send a second email or overwrite an order that has moved on.

import { getDatabase } from "@netlify/database";
import Stripe from "stripe";
import mailer from "../../lib/mailer.js";
import { json, audit, env, orderNotifyEmail, escapeHtml } from "../../lib/orders.mjs";

const HANDLED = [
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "charge.refunded",
  "charge.dispute.created",
];

async function sendPaidEmails(order) {
  const total = (order.total_cents / 100).toFixed(2);
  try {
    await mailer.sendMail({
      to: order.customer_email,
      subject: `Payment confirmed — order ${order.order_number}`,
      html: `<p>Thank you, ${escapeHtml(order.customer_name)}.</p>
        <p>Your card payment of <strong>$${total}</strong> for order
        <strong>${escapeHtml(order.order_number)}</strong> is confirmed. Amber will begin preparing your order.</p>`,
    });
    await mailer.sendMail({
      to: orderNotifyEmail(),
      subject: `Paid: order ${order.order_number} — $${total} (card)`,
      text: `Stripe confirmed payment for order ${order.order_number} ($${total}). It is ready to prepare.`,
    });
  } catch (err) {
    console.error("[stripe-webhook] email failed:", err.message);
  }
}

async function findOrderByIntent(db, paymentIntentId) {
  if (!paymentIntentId) return null;
  const [order] = await db.sql`
    SELECT id, order_number, status, total_cents, customer_name, customer_email
    FROM orders WHERE stripe_payment_intent_id = ${paymentIntentId}
  `;
  return order || null;
}

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const secret = env("STRIPE_WEBHOOK_SECRET");
  const key = env("STRIPE_SECRET_KEY");
  if (!secret || !key) return json({ error: "Webhook not configured" }, 503);

  const signature = req.headers.get("stripe-signature");
  if (!signature) return json({ error: "Missing signature" }, 400);
  const rawBody = await req.text();
  const stripe = new Stripe(key);

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, secret);
  } catch (err) {
    console.warn("[stripe-webhook] signature verification failed");
    return json({ error: "Invalid signature" }, 400);
  }

  if (!HANDLED.includes(event.type)) {
    return json({ received: true, ignored: event.type });
  }

  const obj = event.data.object;
  // PaymentIntent events carry the intent; charge/dispute events point to it.
  const paymentIntentId = event.type.startsWith("payment_intent.") ? obj.id : obj.payment_intent;
  const db = getDatabase();

  let order;
  try {
    order = await findOrderByIntent(db, paymentIntentId);
  } catch (err) {
    // Returning 500 makes Stripe retry later instead of dropping the event.
    console.error("[stripe-webhook] order lookup failed:", err.message);
    return json({ error: "Temporary failure" }, 500);
  }
  if (!order) {
    await audit(db, "stripe.unmatched_event", paymentIntentId || event.id, { type: event.type, event_id: event.id });
    return json({ received: true, matched: false });
  }

  if (event.type === "payment_intent.payment_failed") {
    // The order stays awaiting_payment so the customer can retry the card.
    await audit(db, "order.card_payment_failed", order.order_number, {
      event_id: event.id,
      reason: obj.last_payment_error ? obj.last_payment_error.code : null,
    }, "stripe");
    return json({ received: true });
  }

  if (event.type === "charge.refunded") {
    const full = obj.amount_refunded >= obj.amount;
    if (full) {
      await db.sql`UPDATE orders SET status = 'refunded', updated_at = now() WHERE id = ${order.id} AND status <> 'refunded'`;
    }
    await audit(db, full ? "order.refunded" : "order.partially_refunded", order.order_number, {
      event_id: event.id, amount_refunded: obj.amount_refunded, amount: obj.amount,
    }, "stripe");
    return json({ received: true });
  }

  if (event.type === "charge.dispute.created") {
    await db.sql`UPDATE orders SET status = 'payment_exception', updated_at = now() WHERE id = ${order.id}`;
    await audit(db, "order.payment_disputed", order.order_number, {
      event_id: event.id, reason: obj.reason, amount: obj.amount,
    }, "stripe");
    await mailer.sendMail({
      to: orderNotifyEmail(),
      subject: `Dispute opened: order ${order.order_number}`,
      text: `A card dispute was opened for order ${order.order_number}. Review it in the Stripe dashboard.`,
    }).catch(() => {});
    return json({ received: true });
  }

  // payment_intent.succeeded
  const amountOk = obj.amount_received === order.total_cents && obj.currency === "usd";
  const [changed] = amountOk
    ? await db.sql`
        UPDATE orders SET status = 'payment_verified', payment_verified_at = now(), updated_at = now()
        WHERE id = ${order.id} AND status IN ('submitted', 'awaiting_payment', 'payment_exception')
        RETURNING id
      `
    : await db.sql`
        UPDATE orders SET status = 'payment_exception', updated_at = now()
        WHERE id = ${order.id} AND status IN ('submitted', 'awaiting_payment', 'payment_exception')
        RETURNING id
      `;

  if (!changed) {
    // Already verified (a retried event) or moved on (processing, shipped…).
    return json({ received: true, unchanged: order.status });
  }

  await audit(db, amountOk ? "order.payment_verified" : "order.payment_amount_mismatch", order.order_number, {
    event_id: event.id, amount_received: obj.amount_received, expected: order.total_cents, currency: obj.currency,
  }, "stripe");
  if (amountOk) await sendPaidEmails(order);

  return json({ received: true });
};

export const config = { path: "/api/stripe-webhook" };
