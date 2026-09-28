// POST /api/checkout — creates an order and starts payment.
//
// Body: { items, customer: { name, email, phone, address, cityStateZip },
//         notes, paymentMethod: "card" | "cashapp" | "venmo", promoCode,
//         idempotencyKey }
//
// Every total is recalculated here from lib/catalog.js. The order is stored
// as `awaiting_payment`:
//   - card    -> a Stripe PaymentIntent is created; only the signature-verified
//                webhook (/api/stripe-webhook) can mark it `payment_verified`.
//   - cashapp / venmo -> the customer gets the amount + order number to put in
//                the payment note; Amber verifies the payment by hand.

import { getDatabase } from "@netlify/database";
import Stripe from "stripe";
import mailer from "../../lib/mailer.js";
import {
  json, clean, isEmail, sanitizeItems, quote, newOrderNumber, toCents, splitLineName,
  manualPaymentInstructions, audit, PAYMENT_METHODS, env, orderNotifyEmail, stripeConfigured, escapeHtml,
} from "../../lib/orders.mjs";

// Returns true only when the customer confirmation email was accepted by the
// email provider, so the browser never claims an email that wasn't sent.
async function notify(order, totals, method) {
  const lines = totals.lineItems.map((li) => `${li.description} × ${li.qty} — $${li.lineTotal.toFixed(2)}`);
  const methodLabel = { card: "Card (Stripe)", cashapp: "Cash App", venmo: "Venmo" }[method];
  try {
    await mailer.sendMail({
      to: orderNotifyEmail(),
      subject: `New order ${order.order_number} — ${methodLabel} — awaiting payment`,
      text: [
        `Order ${order.order_number} (${methodLabel})`,
        `Status: awaiting payment`,
        `Customer: ${order.customer_name} <${order.customer_email}>`,
        ...lines,
        `Total: $${totals.total.toFixed(2)}`,
        method === "card" ? "Stripe will confirm payment via webhook." : "Verify the payment note shows this order number before marking it paid.",
      ].join("\n"),
    });
    const manual = method !== "card";
    const sent = await mailer.sendMail({
      to: order.customer_email,
      subject: `Your order ${order.order_number} — Amber's Alchemy Apothecary`,
      html: `<p>Thank you, ${escapeHtml(order.customer_name)}.</p>
        <p>Your order number is <strong>${escapeHtml(order.order_number)}</strong>.</p>
        <p>${lines.map(escapeHtml).join("<br>")}</p>
        <p><strong>Total: $${totals.total.toFixed(2)}</strong></p>
        <p>${manual
          ? `Status: <strong>awaiting payment</strong>. Please send $${totals.total.toFixed(2)} by ${methodLabel} and put <strong>${escapeHtml(order.order_number)}</strong> in the payment note. Amber confirms every payment by hand before your order is prepared.`
          : "We'll email you once your card payment is confirmed."}</p>`,
    });
    return Boolean(sent && sent.ok);
  } catch (err) {
    console.error("[checkout] notification failed:", err.message);
    return false;
  }
}

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  // Honeypot: bots fill every field.
  if (body.website) return json({ error: "Invalid request." }, 400);

  const method = clean(body.paymentMethod, 20);
  if (!PAYMENT_METHODS.includes(method)) return json({ error: "Please choose Card, Cash App, or Venmo." }, 400);
  if (method === "card" && !stripeConfigured()) {
    return json({ error: "Card payments aren't available yet. Please choose Cash App or Venmo." }, 503);
  }

  const c = body.customer || {};
  const customer = {
    name: clean(c.name, 120),
    email: clean(c.email, 254).toLowerCase(),
    phone: clean(c.phone, 30),
    address: clean(c.address, 200),
    cityStateZip: clean(c.cityStateZip, 120),
  };
  if (!customer.name || !isEmail(customer.email) || !customer.address || !customer.cityStateZip) {
    return json({ error: "Please enter your name, a valid email, and your full shipping address." }, 400);
  }

  let items, totals, promo, promoRejected;
  try {
    items = sanitizeItems(body.items);
    ({ totals, promo, promoRejected } = quote(items, clean(body.promoCode, 40)));
  } catch (err) {
    return json({ error: err.message }, 400);
  }
  if (promoRejected) return json({ error: "That promo code isn't valid. Remove it to continue." }, 400);
  if (totals.amountCents < 50) return json({ error: "Order total is too small to process." }, 400);

  const idempotencyKey = clean(body.idempotencyKey, 80) || null;
  const db = getDatabase();

  // A retried submit (double click, flaky network) returns the same order.
  if (idempotencyKey) {
    const [existing] = await db.sql`
      SELECT order_number, status, payment_method, total_cents, stripe_payment_intent_id
      FROM orders WHERE idempotency_key = ${idempotencyKey}
    `;
    if (existing) {
      if (existing.total_cents !== totals.amountCents || existing.payment_method !== method) {
        return json({ error: "Your cart changed. Please refresh and try again." }, 409);
      }
      if (method === "card" && !existing.stripe_payment_intent_id) {
        return json({ error: "Card payment couldn't be started for this order. Please refresh and try again, or choose Cash App or Venmo." }, 409);
      }
      return respond(existing.order_number, existing.stripe_payment_intent_id, null);
    }
  }

  const orderNumber = newOrderNumber();
  const needsReview = items.some((i) => i.customForm);
  const notes = clean(body.notes, 1000) || null;
  const shippingAddress = JSON.stringify({ line1: customer.address, cityStateZip: customer.cityStateZip });

  let order;
  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");
    const inserted = await client.query(
      `INSERT INTO orders (order_number, status, customer_name, customer_email, customer_phone, shipping_address,
         payment_method, subtotal_cents, shipping_cents, discount_cents, tax_cents, total_cents, promo_code,
         requires_formulation_review, idempotency_key, notes)
       VALUES ($1, 'awaiting_payment', $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING id, order_number, customer_name, customer_email`,
      [orderNumber, customer.name, customer.email, customer.phone || null, shippingAddress, method,
        toCents(totals.subtotal), toCents(totals.shipping), toCents(totals.discount), toCents(totals.tax),
        totals.amountCents, promo ? promo.code : null, needsReview, idempotencyKey, notes],
    );
    order = inserted.rows[0];
    for (const [index, li] of totals.lineItems.entries()) {
      const { productId, productName, variantLabel } = splitLineName(li.description);
      const source = items[index] || {}; // resolveLineItems preserves cart order
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, variant_label, quantity,
           unit_price_cents, line_total_cents, customization)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
        [order.id, productId, productName, variantLabel, li.qty, toCents(li.unitPrice), toCents(li.lineTotal),
          source.customForm ? JSON.stringify({ customForm: source.customForm, herbCount: source.herbCount }) : null],
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[checkout] order insert failed:", err.message);
    return json({ error: "We couldn't save your order. Please try again." }, 500);
  } finally {
    client.release();
  }

  let paymentIntentId = null;
  if (method === "card") {
    try {
      const stripe = new Stripe(env("STRIPE_SECRET_KEY"));
      const pi = await stripe.paymentIntents.create(
        {
          amount: totals.amountCents,
          currency: "usd",
          receipt_email: customer.email,
          description: `Order ${orderNumber} — Amber's Alchemy Apothecary`,
          metadata: { order_number: orderNumber },
          automatic_payment_methods: { enabled: true, allow_redirects: "never" },
        },
        { idempotencyKey: `pi-${orderNumber}` },
      );
      paymentIntentId = pi.id;
      await db.sql`UPDATE orders SET stripe_payment_intent_id = ${pi.id}, updated_at = now() WHERE id = ${order.id}`;
    } catch (err) {
      console.error("[checkout] PaymentIntent failed:", err.message);
      await db.sql`UPDATE orders SET status = 'payment_exception', updated_at = now() WHERE id = ${order.id}`;
      await audit(db, "order.payment_intent_failed", orderNumber, { message: err.message });
      return json({ error: "Card payment couldn't be started. Please try again or choose Cash App or Venmo." }, 502);
    }
  }

  await audit(db, "order.created", orderNumber, {
    method, total_cents: totals.amountCents, items: totals.lineItems.length, promo: promo ? promo.code : null,
  }, "customer");
  const emailSent = await notify(order, totals, method);

  return respond(orderNumber, paymentIntentId, emailSent);

  // emailSent is null for a retried submit (the email went out, or not, the
  // first time).
  async function respond(number, piId, emailSent) {
    const base = {
      orderNumber: number,
      status: "awaiting_payment",
      paymentMethod: method,
      totals: {
        subtotal: totals.subtotal, discount: totals.discount, shipping: totals.shipping,
        tax: totals.tax, total: totals.total,
      },
      lineItems: totals.lineItems,
      emailSent,
    };
    if (method === "card") {
      const stripe = new Stripe(env("STRIPE_SECRET_KEY"));
      const pi = await stripe.paymentIntents.retrieve(piId);
      return json({ ...base, stripe: { clientSecret: pi.client_secret } });
    }
    return json({ ...base, manual: manualPaymentInstructions(method, number, totals.total) });
  }
};

export const config = { path: "/api/checkout" };
