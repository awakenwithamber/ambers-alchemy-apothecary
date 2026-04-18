// Admin endpoint for verifying Venmo / Cash App payments manually.
//
// After Amber sees the payment land in her Venmo or Cash App account, she
// calls this endpoint with the orderId to mark the order as paid. This is the
// only path that can promote a pending-payment order to paid for non-Stripe
// payments. Protected by the ADMIN_VERIFY_TOKEN environment variable.

import { getStore } from "@netlify/blobs";

const REVIEW_REQUEST_DELAY_DAYS = 10;

export default async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
  }

  const adminToken = process.env.ADMIN_VERIFY_TOKEN;
  if (!adminToken) {
    return Response.json({ ok: false, error: 'Admin verification is not configured. Set ADMIN_VERIFY_TOKEN.' }, { status: 500 });
  }

  const providedToken = req.headers.get('x-admin-token') || '';
  if (providedToken !== adminToken) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return Response.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const orderId = String(body.orderId || '').trim();
  const action = String(body.action || 'mark-paid').trim();
  if (!orderId) {
    return Response.json({ ok: false, error: 'orderId is required' }, { status: 400 });
  }

  const orders = getStore('orders');
  const order = await orders.get(orderId, { type: 'json' });
  if (!order) {
    return Response.json({ ok: false, error: 'Order not found' }, { status: 404 });
  }

  const now = new Date();

  if (action === 'mark-paid') {
    order.paymentStatus = 'paid';
    order.manuallyVerifiedAt = now.toISOString();
    order.manuallyVerifiedBy = String(body.verifiedBy || 'admin').slice(0, 60);
    if (body.externalReference) {
      order.externalPaymentReference = String(body.externalReference).slice(0, 120);
    }
    await orders.setJSON(orderId, order);

    // Queue a review request only after the order becomes truly paid.
    if (order.email) {
      const reviewRequests = getStore('review-requests');
      const existing = await reviewRequests.get(orderId, { type: 'json' });
      if (!existing) {
        const sendAt = new Date(now.getTime() + REVIEW_REQUEST_DELAY_DAYS * 24 * 60 * 60 * 1000);
        await reviewRequests.setJSON(orderId, {
          orderId,
          email: order.email,
          customerName: order.customerName,
          product: order.product,
          sendAt: sendAt.toISOString(),
          reminderAt: new Date(sendAt.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'queued',
          initialSent: false,
          reminderSent: false,
          createdAt: now.toISOString(),
        });
      }
    }

    return Response.json({ ok: true, order });
  }

  if (action === 'cancel') {
    order.paymentStatus = 'cancelled';
    order.cancelledAt = now.toISOString();
    order.cancelReason = String(body.reason || '').slice(0, 200);
    await orders.setJSON(orderId, order);
    return Response.json({ ok: true, order });
  }

  return Response.json({ ok: false, error: `Unknown action: ${action}` }, { status: 400 });
};

export const config = {
  path: '/api/admin/verify-order',
  method: 'POST',
};
