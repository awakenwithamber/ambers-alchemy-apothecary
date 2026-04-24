// Triggered automatically when a Netlify Form submission is created.
// Stores order data in Netlify Blobs for record-keeping, queues a polite
// review request, and (critically) always dispatches an admin notification
// to BOTH required addresses — no silent failure. Delivery attempts are
// logged in the `email-delivery-log` blob store.

import { getStore } from '@netlify/blobs';
import { sendToAll, escapeHtml } from './_email.mjs';

const REVIEW_REQUEST_DELAY_DAYS = 10;

function buildAdminHtml(order) {
  return `<!doctype html><html><body style="font-family:Georgia,serif;color:#3b2a5e;background:#f7f1ea;padding:24px;">
    <h2 style="font-family:'Cinzel',Georgia,serif;">Checkout Order — ${escapeHtml(order.orderId)}</h2>
    <p><strong>Customer:</strong> ${escapeHtml(order.customerName || '—')} &lt;${escapeHtml(order.email || '—')}&gt;</p>
    <p><strong>Phone:</strong> ${escapeHtml(order.phone || '—')}</p>
    <p><strong>Shipping:</strong> ${escapeHtml(order.shippingAddress || '—')}</p>
    <p><strong>Product:</strong> ${escapeHtml(order.product || '—')}</p>
    <p><strong>Quantity:</strong> ${escapeHtml(String(order.quantity || '—'))}</p>
    <p><strong>Total:</strong> ${escapeHtml(order.orderTotal || '—')}</p>
    <p><strong>Payment:</strong> ${escapeHtml(order.paymentStatus || '—')} (txn ${escapeHtml(order.transactionId || '—')})</p>
    ${order.notes ? `<p><strong>Notes:</strong> ${escapeHtml(order.notes)}</p>` : ''}
    <p style="color:#6b4f9b;font-size:0.85rem;">Submitted at ${escapeHtml(order.submittedAt)}</p>
  </body></html>`;
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
      shippingAddress: `${data['shipping-address'] || ''}, ${data['city-state-zip'] || ''}`.replace(/^, |, $/g, ''),
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

    // Dual-address admin notification — non-negotiable.
    await sendToAll({
      subject: `New Checkout Order — ${orderId}${order.customerName ? ` (${order.customerName})` : ''}`,
      html: buildAdminHtml(order),
      text: `New Order ${orderId}\nCustomer: ${order.customerName || '—'} <${email}>\nProduct: ${order.product || '—'}\nTotal: ${order.orderTotal || '—'}`,
      orderId,
      purpose: 'form-order-admin-notify',
    });

    return new Response('OK');
  } catch (err) {
    console.error('submission-created error:', err);
    return new Response('Error', { status: 500 });
  }
};
