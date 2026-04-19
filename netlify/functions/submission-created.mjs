// Triggered automatically when a Netlify Form submission is created.
// Stores order data in Netlify Blobs for record-keeping. A review request is
// only queued once the order is actually paid — pending-payment orders wait
// for Amber's manual confirmation before entering the review pipeline.

import { getStore } from "@netlify/blobs";

const REVIEW_REQUEST_DELAY_DAYS = 10;

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
    const paymentStatus = (data['payment-status'] || '').toLowerCase();
    const isPaid = paymentStatus === 'paid';

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
      paymentStatus: data['payment-status'] || 'pending-payment',
      paymentMethod: data['payment-method'] || '',
      orderTotal: data['order-total'],
      submittedAt: payload.created_at || now.toISOString(),
    };

    const orders = getStore('orders');
    // Preserve any richer record already written by place-order (totals, etc.).
    try {
      const existing = await orders.get(orderId, { type: 'json' });
      if (existing && typeof existing === 'object') {
        await orders.setJSON(orderId, { ...existing, ...order });
      } else {
        await orders.setJSON(orderId, order);
      }
    } catch {
      await orders.setJSON(orderId, order);
    }

    if (email && isPaid) {
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

    return new Response('OK');
  } catch (err) {
    console.error('submission-created error:', err);
    return new Response('Error', { status: 500 });
  }
};

