// Triggered automatically when a Netlify Form submission is created.
// Stores order data in Netlify Blobs for record-keeping, queues a polite
// review request, and dispatches a dual-recipient admin order email so
// BOTH configured admin addresses always receive the details.

import { getStore } from "@netlify/blobs";
import { sendAdminOrderEmail } from "../lib/admin-email.mjs";

const REVIEW_REQUEST_DELAY_DAYS = 10;

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildAdminEmail(order) {
  const subject = `🌿 New Order ${order.orderId} — ${order.customerName || order.email || 'Guest'}`;
  const html = `<div style="font-family:Georgia,serif;color:#322;max-width:640px;margin:0 auto;padding:20px;">
    <h2 style="color:#3b2a5e;">New Order via Checkout Form</h2>
    <p><strong>Order ID:</strong> ${escapeHtml(order.orderId)}</p>
    <p><strong>Customer:</strong> ${escapeHtml(order.customerName || '(no name)')} &lt;${escapeHtml(order.email || 'no email')}&gt;</p>
    <p><strong>Phone:</strong> ${escapeHtml(order.phone || '—')}</p>
    <p><strong>Product:</strong> ${escapeHtml(order.product || '—')}</p>
    <p><strong>Quantity:</strong> ${escapeHtml(order.quantity || '—')}</p>
    <p><strong>Total:</strong> ${escapeHtml(order.orderTotal || '—')}</p>
    <p><strong>Payment:</strong> ${escapeHtml(order.paymentStatus || '—')} (txn ${escapeHtml(order.transactionId || '—')})</p>
    <p><strong>Ship to:</strong> ${escapeHtml(order.shippingAddress || '—')}</p>
    ${order.notes ? `<h3>Notes</h3><p>${escapeHtml(order.notes)}</p>` : ''}
  </div>`;
  const text = [
    `New Order ${order.orderId}`,
    `Customer: ${order.customerName || '(no name)'} <${order.email || 'no email'}>`,
    `Product: ${order.product} x${order.quantity}`,
    `Total: ${order.orderTotal}`,
    `Ship to: ${order.shippingAddress}`,
  ].join('\n');
  return { subject, html, text };
}

export default async (req) => {
  try {
    const body = await req.json();
    const payload = body.payload;

    if (!payload || payload.form_name !== 'checkout-order') {
      return new Response('OK');
    }

    const data = payload.data || {};
    const orderId = data['transaction-id'] || `ORD-${Date.now()}`;
    const email = (data['email'] || '').toLowerCase().trim();
    const now = new Date();
    const sendAt = new Date(now.getTime() + REVIEW_REQUEST_DELAY_DAYS * 24 * 60 * 60 * 1000);

    const order = {
      orderId,
      customerName: data['customer-name'],
      email,
      phone: data['phone'],
      shippingAddress: `${data['shipping-address']}, ${data['city-state-zip']}`,
      product: data['product-ordered'],
      quantity: data['quantity'],
      notes: data['order-notes'],
      transactionId: data['transaction-id'],
      paymentStatus: data['payment-status'],
      orderTotal: data['order-total'],
      submittedAt: payload.created_at || now.toISOString(),
    };

    const orders = getStore('orders');
    await orders.setJSON(orderId, order);

    if (email) {
      const reviewRequests = getStore('review-requests');
      await reviewRequests.setJSON(orderId, {
        orderId,
        email,
        customerName: data['customer-name'],
        product: data['product-ordered'],
        sendAt: sendAt.toISOString(),
        reminderAt: new Date(sendAt.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'queued',
        initialSent: false,
        reminderSent: false,
        createdAt: now.toISOString(),
      });
    }

    // Dual-recipient admin notification — MUST be delivered to both
    // ADMIN_ORDER_EMAIL_1 and ADMIN_ORDER_EMAIL_2. Never short-circuits
    // on a single-recipient failure and always writes an audit log.
    try {
      const mail = buildAdminEmail(order);
      await sendAdminOrderEmail({
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        orderId,
        submissionId: payload.id || null,
      });
    } catch (err) {
      console.error('admin-email dispatch error:', err && err.message ? err.message : err);
    }

    return new Response('OK');
  } catch (err) {
    console.error('submission-created error:', err);
    return new Response('Error', { status: 500 });
  }
};
