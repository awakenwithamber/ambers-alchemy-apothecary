// POST /.netlify/functions/order-create
//
// Mirrors a frontend-initiated order into Netlify Blobs, upserts the
// customer record, marks first-order discount usage when appropriate,
// and dispatches a dual-recipient admin notification.
//
// Intentionally NON-AUTHORITATIVE for payment/inventory: if Shopify (or
// any other system) is the source of truth for payment, this function
// mirrors data for enrichment/follow-up only. It does not process
// payments or mutate external inventory.

import { getStore } from "@netlify/blobs";
import { readJson, methodNotAllowed, badRequest, ok, serverError, cleanEmail, cleanString, safeKey, escapeHtml } from "../lib/http.mjs";
import { sendAdminOrderEmail } from "../lib/admin-email.mjs";

function moneyFmt(n) {
  const v = Number(n);
  if (!isFinite(v)) return "—";
  return `$${v.toFixed(2)}`;
}

function itemsToHtml(items) {
  if (!Array.isArray(items) || items.length === 0) return "<em>No line items provided.</em>";
  const rows = items
    .map((it) => {
      const name = escapeHtml(cleanString(it.product_name || it.name || "Item", 200));
      const qty = Number(it.quantity) || 1;
      const unit = moneyFmt(it.unit_price || it.price);
      return `<tr><td style="padding:6px 10px;">${name}</td><td style="padding:6px 10px;">${qty}</td><td style="padding:6px 10px;">${unit}</td></tr>`;
    })
    .join("");
  return `<table style="border-collapse:collapse;width:100%;font-family:Georgia,serif;">
  <thead><tr><th align="left" style="padding:6px 10px;border-bottom:1px solid #d8c49a;">Item</th><th align="left" style="padding:6px 10px;border-bottom:1px solid #d8c49a;">Qty</th><th align="left" style="padding:6px 10px;border-bottom:1px solid #d8c49a;">Unit</th></tr></thead>
  <tbody>${rows}</tbody></table>`;
}

export default async (req) => {
  if (req.method !== "POST") return methodNotAllowed(req.method);
  const body = await readJson(req);
  if (!body) return badRequest("invalid JSON body");

  const email = cleanEmail(body.email);
  if (!email) return badRequest("valid email required");

  const customerName = cleanString(body.customer_name || body.customerName, 120);
  const subtotal = Number(body.subtotal) || 0;
  const discount = Number(body.discount_amount || body.discount || 0) || 0;
  const total = Number(body.total || subtotal - discount);
  const source = cleanString(body.source || "web", 40);
  const promoCode = cleanString(body.promo_code || "", 40);
  const items = Array.isArray(body.items) ? body.items.slice(0, 40) : [];

  const now = new Date();
  const orderId = cleanString(body.order_id || `ORD-${now.getTime()}`, 80);

  const orders = getStore("orders");
  const customers = getStore("customers");
  const customerKey = safeKey(email);

  let existingCustomer = null;
  try {
    existingCustomer = await customers.get(customerKey, { type: "json" });
  } catch (_) {
    existingCustomer = null;
  }
  const isFirstOrder = !existingCustomer || !existingCustomer.first_order_date;

  const customerRecord = {
    id: existingCustomer?.id || customerKey,
    name: customerName || existingCustomer?.name || "",
    email,
    first_order_date: existingCustomer?.first_order_date || now.toISOString(),
    has_used_first_order_discount: existingCustomer?.has_used_first_order_discount || Boolean(promoCode && isFirstOrder),
    eligible_for_followup_discount: existingCustomer?.eligible_for_followup_discount ?? true,
    total_orders: (existingCustomer?.total_orders || 0) + 1,
    created_at: existingCustomer?.created_at || now.toISOString(),
    updated_at: now.toISOString(),
  };

  const orderRecord = {
    id: orderId,
    customer_id: customerRecord.id,
    customer_name: customerName,
    email,
    order_status: cleanString(body.order_status || "received", 40),
    payment_status: cleanString(body.payment_status || "unknown", 40),
    subtotal,
    discount_amount: discount,
    total,
    promo_code: promoCode,
    source,
    is_first_order: isFirstOrder,
    items: items.map((it) => ({
      product_id: cleanString(it.product_id || it.id || "", 80),
      product_name: cleanString(it.product_name || it.name || "", 200),
      quantity: Number(it.quantity) || 1,
      unit_price: Number(it.unit_price || it.price) || 0,
    })),
    shipping: body.shipping ? {
      name: cleanString(body.shipping.name, 120),
      address: cleanString(body.shipping.address, 200),
      city: cleanString(body.shipping.city, 80),
      region: cleanString(body.shipping.region || body.shipping.state, 80),
      postal: cleanString(body.shipping.postal || body.shipping.zip, 20),
      country: cleanString(body.shipping.country, 80),
    } : null,
    notes: cleanString(body.notes, 1000),
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  try {
    await Promise.all([
      orders.setJSON(orderId, orderRecord),
      customers.setJSON(customerKey, customerRecord),
    ]);
  } catch (err) {
    console.error("order-create write failed:", err && err.message ? err.message : err);
    return serverError("could not persist order");
  }

  // Queue follow-up discount eligibility for post-first-order
  if (isFirstOrder && customerRecord.eligible_for_followup_discount) {
    try {
      const queue = getStore("followup-discount-queue");
      await queue.setJSON(customerKey, {
        email,
        customer_id: customerRecord.id,
        order_id: orderId,
        queued_at: now.toISOString(),
        status: "queued",
      });
    } catch (err) {
      console.warn("followup queue write failed:", err && err.message ? err.message : err);
    }
  }

  // Dual-admin notification (never short-circuits on a single failure)
  const subject = `🌿 New Order ${orderId} — ${customerName || email}`;
  const html = `<div style="font-family:Georgia,serif;color:#322;max-width:640px;margin:0 auto;padding:20px;">
    <h2 style="color:#3b2a5e;">New Order Received</h2>
    <p><strong>Order:</strong> ${escapeHtml(orderId)}</p>
    <p><strong>Customer:</strong> ${escapeHtml(customerName || "(no name)")} &lt;${escapeHtml(email)}&gt;</p>
    <p><strong>Source:</strong> ${escapeHtml(source)}</p>
    <p><strong>Subtotal:</strong> ${escapeHtml(moneyFmt(subtotal))} &nbsp;|&nbsp; <strong>Discount:</strong> ${escapeHtml(moneyFmt(discount))} &nbsp;|&nbsp; <strong>Total:</strong> ${escapeHtml(moneyFmt(total))}</p>
    ${promoCode ? `<p><strong>Promo:</strong> ${escapeHtml(promoCode)}</p>` : ""}
    <h3>Items</h3>
    ${itemsToHtml(orderRecord.items)}
    ${orderRecord.notes ? `<h3>Notes</h3><p>${escapeHtml(orderRecord.notes)}</p>` : ""}
  </div>`;
  const text = `New Order ${orderId}\nCustomer: ${customerName} <${email}>\nTotal: ${moneyFmt(total)}\nItems: ${orderRecord.items.map((i) => `${i.product_name} x${i.quantity}`).join(", ")}`;

  let emailLog = null;
  try {
    emailLog = await sendAdminOrderEmail({ subject, html, text, orderId });
  } catch (err) {
    console.error("admin email dispatch threw:", err && err.message ? err.message : err);
  }

  return ok({
    order_id: orderId,
    is_first_order: isFirstOrder,
    email_delivery: emailLog
      ? { any_ok: emailLog.anyOk, all_ok: emailLog.allOk, recipient_count: emailLog.recipients.length }
      : { any_ok: false, all_ok: false, recipient_count: 0 },
  });
};
