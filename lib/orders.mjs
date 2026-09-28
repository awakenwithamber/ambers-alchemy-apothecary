// lib/orders.mjs
// Shared helpers for the Netlify checkout functions (cart-quote, checkout,
// stripe-webhook, order-status). Server-side only.
//
// Payment rules (Amber, Sept 2026): checkout offers Card (Stripe), Cash App
// and Venmo.
//   - Card orders become `payment_verified` only from a signature-verified
//     Stripe webhook whose amount matches the order total.
//   - Cash App / Venmo orders stay `awaiting_payment` until Amber verifies
//     the payment by hand. The order number must be in the payment note.

import { randomBytes } from "node:crypto";
import catalog from "./catalog.js";

export const { computeCartTotal, resolvePromo } = catalog;

export const ORDER_STATUSES = [
  "submitted",
  "awaiting_payment",
  "payment_verified",
  "processing",
  "shipped",
  "cancelled",
  "refunded",
  "payment_exception",
];

export const PAYMENT_METHODS = ["card", "cashapp", "venmo"];

// Approved manual payment destinations. The Venmo link was supplied with the
// site and is still UNVERIFIED — Amber must confirm it opens her account.
export const CASHAPP_HANDLE = "$AmberPatten92";
export const VENMO_URL = "https://venmo.com/code?user_id=3573264899114195665&created=1781193245";

// Reads a server-side environment variable. Netlify.env is preferred on
// Netlify; process.env keeps the code portable to other Node hosts.
export function env(name) {
  const netlify = globalThis.Netlify;
  const value = netlify && netlify.env ? netlify.env.get(name) : undefined;
  return value != null && value !== "" ? value : process.env[name];
}

export function orderNotifyEmail() {
  return env("ORDER_NOTIFY_EMAIL") || "awaken@consultant.com";
}

// Card checkout needs all three Stripe variables. Without the webhook secret
// an order could never be verified, so card stays off until it is set.
export function stripeConfigured() {
  return Boolean(env("STRIPE_SECRET_KEY") && env("STRIPE_PUBLISHABLE_KEY") && env("STRIPE_WEBHOOK_SECRET"));
}

export function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ITEMS = 40;

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export function clean(value, max = 200) {
  return String(value == null ? "" : value).replace(/[<>]/g, "").trim().slice(0, max);
}

export function isEmail(value) {
  return EMAIL_RE.test(String(value || "")) && String(value).length <= 254;
}

// Only name/qty/customForm/herbCount are read from the client. Any price the
// browser sends is ignored; lib/catalog.js prices everything.
export function sanitizeItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) throw new Error("Your cart is empty.");
  if (rawItems.length > MAX_ITEMS) throw new Error("Too many items in one order.");
  return rawItems.map((i) => ({
    name: clean(i && i.name, 240),
    qty: Math.min(Math.max(parseInt(i && i.qty, 10) || 1, 1), 99),
    customForm: clean(i && i.customForm, 40),
    herbCount: Math.max(parseInt(i && i.herbCount, 10) || 0, 0),
  }));
}

// Quote with a promo code. Unknown codes are reported, never explained.
export function quote(items, promoCode) {
  const promo = promoCode ? resolvePromo(promoCode) : null;
  // Membership is never trusted from the browser. Until Living Grimoire
  // entitlement is verified server-side on Netlify, members get the
  // general rules.
  const totals = computeCartTotal(items, { promo, memberVerified: false });
  return { totals, promo, promoRejected: Boolean(promoCode) && !promo };
}

// e.g. AA-260928-7KQ4M — short enough to type into a Cash App/Venmo note.
export function newOrderNumber(now = new Date()) {
  const ymd = now.toISOString().slice(2, 10).replace(/-/g, "");
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = randomBytes(5);
  let suffix = "";
  for (const b of bytes) suffix += alphabet[b % alphabet.length];
  return `AA-${ymd}-${suffix}`;
}

export function toCents(n) {
  return Math.round(Number(n) * 100);
}

// "Ultimate Pain Relieving Balm (2oz)" -> { productId, productName, variantLabel }
export function splitLineName(description) {
  const m = /^(.*?)\s*\(([^()]*)\)\s*$/.exec(description);
  const productName = m ? m[1] : description;
  const variantLabel = m ? m[2] : null;
  const productId = productName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
  return { productId, productName, variantLabel };
}

export function manualPaymentInstructions(method, orderNumber, total) {
  const amount = Number(total).toFixed(2);
  if (method === "cashapp") {
    return {
      method,
      label: "Cash App",
      handle: CASHAPP_HANDLE,
      url: `https://cash.app/${CASHAPP_HANDLE}/${amount}`,
      amount,
      note: orderNumber,
    };
  }
  return { method, label: "Venmo", url: VENMO_URL, amount, note: orderNumber };
}

export async function audit(db, event, subjectId, detail, actor = "system") {
  try {
    await db.sql`
      INSERT INTO audit_log (event, actor, subject_type, subject_id, detail)
      VALUES (${event}, ${actor}, ${"order"}, ${subjectId}, ${JSON.stringify(detail || {})}::jsonb)
    `;
  } catch (err) {
    console.error("[audit] failed to record", event, err.message);
  }
}
