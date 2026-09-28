// POST /api/cart/quote — authoritative cart totals for display.
// The cart drawer shows these numbers; checkout recomputes them again.

import { json, quote, sanitizeItems, clean } from "../../lib/orders.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  try {
    const items = sanitizeItems(body.items);
    const { totals, promo, promoRejected } = quote(items, clean(body.promoCode, 40));
    return json({
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping: totals.shipping,
      tax: totals.tax,
      total: totals.total,
      freeShippingThreshold: totals.freeShippingThreshold,
      lineItems: totals.lineItems,
      promo: promo ? { code: promo.code, applied: true } : null,
      promoRejected,
    });
  } catch (err) {
    return json({ error: err.message }, 400);
  }
};

export const config = { path: "/api/cart/quote" };
