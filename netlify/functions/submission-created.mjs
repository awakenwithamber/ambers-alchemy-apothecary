// Triggered automatically when a Netlify Form submission is created.
// Stores order data in Netlify Blobs for record-keeping, notifies admins
// for every incoming order, and queues a polite review request to be sent
// after the customer has had time with the product.

import { getStore } from "@netlify/blobs";

const REVIEW_REQUEST_DELAY_DAYS = 10;
const ADMIN_NOTIFY_TO = ['awaken@consultant.com', 'perfectlyme347@gmail.com'];
const ADMIN_FROM = process.env.ORDER_NOTIFY_FROM_EMAIL
  || process.env.QUIZ_LEAD_FROM_EMAIL
  || "Amber's Alchemy Apothecary <hello@awakenagain.com>";

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildAdminOrderEmail(order) {
  const subject = `NEW ORDER (Pending Payment) — ${order.orderId} — ${order.customerName || 'Customer'}`;
  const rows = [
    ['Order Number', order.orderId],
    ['Customer Name', order.customerName || '—'],
    ['Customer Email', order.email || '—'],
    ['Phone', order.phone || '—'],
    ['Shipping Address', order.shippingAddress || '—'],
    ['Items', order.product || '—'],
    ['Quantity', order.quantity || '—'],
    ['Order Total', order.orderTotal || '—'],
    ['Payment Method', order.paymentMethod || '—'],
    ['Payment Status', order.paymentStatus || 'pending-payment'],
    ['Notes', order.notes || '—'],
    ['Submitted At', order.submittedAt || ''],
  ];
  const html = `<!doctype html><html><body style="font-family:Georgia,serif;color:#222;line-height:1.5;">
    <h2 style="margin:0 0 8px;">New Order — Pending Payment</h2>
    <p style="margin:0 0 12px;color:#555;">A new order has been placed. It will remain pending until payment is received via Cash App or Venmo.</p>
    <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;border:1px solid #ddd;">
      ${rows.map(([k, v]) => `<tr><td style="border:1px solid #eee;"><strong>${escapeHtml(k)}</strong></td><td style="border:1px solid #eee;">${escapeHtml(v)}</td></tr>`).join('')}
    </table>
    <p style="margin:14px 0 0;color:#555;">Verify payment in Cash App or Venmo before marking the order as paid and shipping.</p>
  </body></html>`;
  const text = [
    'New Order — Pending Payment',
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    'Verify payment in Cash App or Venmo before marking the order as paid and shipping.',
  ].join('\n');
  return { subject, html, text };
}

async function sendViaResend({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { skipped: true, reason: 'no-provider-configured' };
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: ADMIN_FROM,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('Resend send failed:', res.status, detail);
      return { sent: false, error: 'provider-error' };
    }
    return { sent: true };
  } catch (err) {
    console.error('Resend send error:', err);
    return { sent: false, error: 'provider-exception' };
  }
}

export default async (req) => {
  try {
    const body = await req.json();
    const payload = body.payload;

    if (!payload || payload.form_name !== 'checkout-order') {
      return new Response('OK');
    }

    const data = payload.data || {};
    const orderId = data['order-id'] || data['transaction-id'] || `ORD-${Date.now()}`;
    const email = (data['email'] || '').toLowerCase().trim();
    const now = new Date();
    const sendAt = new Date(now.getTime() + REVIEW_REQUEST_DELAY_DAYS * 24 * 60 * 60 * 1000);

    const order = {
      orderId,
      customerName: data['customer-name'],
      email,
      phone: data['phone'],
      shippingAddress: `${data['shipping-address'] || ''}, ${data['city-state-zip'] || ''}`.replace(/^,\s*|,\s*$/g, ''),
      product: data['product-ordered'],
      quantity: data['quantity'],
      notes: data['order-notes'],
      transactionId: data['transaction-id'],
      paymentStatus: data['payment-status'] || 'pending-payment',
      paymentMethod: data['payment-method'] || data['payment-choice'] || '',
      orderTotal: data['order-total'],
      submittedAt: payload.created_at || now.toISOString(),
    };

    const orders = getStore('orders');
    await orders.setJSON(orderId, order);

    // Notify admins for every submitted order (never implies paid).
    try {
      const adminMsg = buildAdminOrderEmail(order);
      await sendViaResend({
        to: ADMIN_NOTIFY_TO,
        subject: adminMsg.subject,
        html: adminMsg.html,
        text: adminMsg.text,
      });
    } catch (notifyErr) {
      console.error('admin notify failed:', notifyErr);
    }

    // Only queue a review request once payment is actually received. Pending
    // orders are NOT queued — review-reminders.mjs can pick them up after
    // an admin manually marks the order paid.
    if (email && order.paymentStatus === 'paid') {
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
