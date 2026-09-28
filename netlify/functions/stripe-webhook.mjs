// POST /api/stripe-webhook — the only place a card order becomes paid.
//
// The raw body is verified against STRIPE_WEBHOOK_SECRET. An order moves to
// `payment_verified` only when the PaymentIntent amount and currency match
// the stored order total; any mismatch becomes `payment_exception` for Amber
// to review.

import { getDatabase } from "@netlify/database";
import Stripe from "stripe";
import { json, audit } from "../../lib/orders.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!secret || !key) return json({ error: "Webhook not configured" }, 503);

  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();
  const stripe = new Stripe(key);

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, secret);
  } catch (err) {
    console.warn("[stripe-webhook] signature verification failed");
    return json({ error: "Invalid signature" }, 400);
  }

  if (!["payment_intent.succeeded", "payment_intent.payment_failed"].includes(event.type)) {
    return json({ received: true, ignored: event.type });
  }

  const pi = event.data.object;
  const db = getDatabase();
  const [order] = await db.sql`
    SELECT id, order_number, status, total_cents
    FROM orders WHERE stripe_payment_intent_id = ${pi.id}
  `;
  if (!order) {
    await audit(db, "stripe.unmatched_payment_intent", pi.id, { type: event.type, amount: pi.amount });
    return json({ received: true, matched: false });
  }

  if (event.type === "payment_intent.payment_failed") {
    await audit(db, "order.card_payment_failed", order.order_number, {
      event_id: event.id,
      reason: pi.last_payment_error ? pi.last_payment_error.code : null,
    });
    return json({ received: true });
  }

  // Webhooks can be retried; never downgrade an order that has moved on.
  if (!["awaiting_payment", "payment_exception", "submitted"].includes(order.status)) {
    return json({ received: true, unchanged: order.status });
  }

  const amountOk = pi.amount_received === order.total_cents && pi.currency === "usd";
  if (amountOk) {
    await db.sql`
      UPDATE orders SET status = 'payment_verified', payment_verified_at = now(), updated_at = now()
      WHERE id = ${order.id}
    `;
  } else {
    await db.sql`UPDATE orders SET status = 'payment_exception', updated_at = now() WHERE id = ${order.id}`;
  }
  await audit(db, amountOk ? "order.payment_verified" : "order.payment_amount_mismatch", order.order_number, {
    event_id: event.id, amount_received: pi.amount_received, expected: order.total_cents, currency: pi.currency,
  }, "stripe");

  return json({ received: true });
};

export const config = { path: "/api/stripe-webhook" };
