// Creates a "pending payment" order when a customer submits the checkout form.
// - persists the order in Netlify Blobs (`orders` store)
// - sends admin + customer emails (Resend if RESEND_API_KEY is set; otherwise
//   falls back to a webhook via ORDER_EMAIL_WEBHOOK; otherwise relies on the
//   Netlify Form notifications already configured on the `checkout-order` form)
// - the order is NOT marked paid; fulfillment waits for manual confirmation

import { getStore } from '@netlify/blobs';

const ADMIN_EMAILS = ['awaken@consultant.com', 'perfectlyme347@gmail.com'];
const FROM_EMAIL = "Amber's Alchemy Apothecary <orders@awakenagain.com>";
const CASHAPP_URL = 'https://cash.app/$AmberPatten92';
const VENMO_URL = 'https://venmo.com/code?user_id=3573264899114195665&created=1776543987';

export default async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  let body;
  try { body = await req.json(); }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const orderId = String(body?.orderId || `AAA-${Date.now()}`).slice(0, 64);
  const customer = body?.customer || {};
  const cart = Array.isArray(body?.cart) ? body.cart : [];
  const totals = body?.totals || {};
  const method = String(body?.paymentMethod || 'Cash App');
  const methodUrl = /venmo/i.test(method) ? VENMO_URL : CASHAPP_URL;

  if (!cart.length) {
    return Response.json({ error: 'Cart is empty' }, { status: 400 });
  }

  const now = new Date();
  const order = {
    orderId,
    transactionId: orderId,
    customerName: customer.name || '',
    email: (customer.email || '').toLowerCase().trim(),
    phone: customer.phone || '',
    shippingAddress: [customer.address, customer.cityStateZip].filter(Boolean).join(', '),
    product: cart.map((i) => `${i?.name || ''} x${i?.qty || 1}`).join(', '),
    quantity: cart.reduce((s, i) => s + (Number(i?.qty) || 0), 0),
    notes: customer.notes || '',
    paymentMethod: /venmo/i.test(method) ? 'Venmo' : 'Cash App',
    paymentStatus: 'pending-payment',
    paymentProvider: /venmo/i.test(method) ? 'venmo' : 'cashapp',
    orderTotal: typeof totals.total === 'number' ? `$${totals.total.toFixed(2)}` : '',
    totals: {
      subtotal: Number(totals.subtotal || 0),
      shipping: Number(totals.shipping || 0),
      tax: Number(totals.tax || 0),
      total: Number(totals.total || 0),
    },
    currency: 'USD',
    submittedAt: now.toISOString(),
  };

  try {
    const orders = getStore('orders');
    await orders.setJSON(order.orderId, order);
  } catch (err) {
    console.error('blob persist error', err);
  }

  const emailResult = await sendOrderEmails(order, methodUrl);

  return Response.json({
    ok: true,
    orderId: order.orderId,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    total: order.totals.total,
    currency: order.currency,
    emailResult,
  });
};

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

function stripHtml(html) {
  return String(html).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function adminEmailHtml(order, methodUrl) {
  return `
    <h2 style="font-family:Georgia,serif;color:#2E1C38">New Order — Pending Payment</h2>
    <p><strong>Order number:</strong> ${escapeHtml(order.orderId)}</p>
    <p><strong>Customer:</strong> ${escapeHtml(order.customerName)} &lt;${escapeHtml(order.email)}&gt;</p>
    ${order.phone ? `<p><strong>Phone:</strong> ${escapeHtml(order.phone)}</p>` : ''}
    <p><strong>Items:</strong> ${escapeHtml(order.product)}</p>
    <p><strong>Quantity:</strong> ${escapeHtml(String(order.quantity))}</p>
    <p><strong>Total due:</strong> ${escapeHtml(order.orderTotal)} ${escapeHtml(order.currency)}</p>
    <p><strong>Selected payment method:</strong> ${escapeHtml(order.paymentMethod)}</p>
    <p><strong>Expected destination:</strong> <a href="${methodUrl}">${methodUrl}</a></p>
    <p><strong>Shipping address:</strong> ${escapeHtml(order.shippingAddress)}</p>
    ${order.notes ? `<p><strong>Order notes:</strong> ${escapeHtml(order.notes)}</p>` : ''}
    <p><strong>Status:</strong> Pending payment — mark paid and ready to fulfill once you see the transfer.</p>
    <p style="color:#8C6A3B">Placed ${new Date(order.submittedAt).toLocaleString()}</p>
  `;
}

function customerEmailHtml(order, methodUrl) {
  const first = (order.customerName || '').split(' ')[0] || 'friend';
  const methodLabel = order.paymentMethod;
  const handleLabel = methodLabel === 'Venmo' ? "Amber's Alchemy on Venmo" : '$AmberPatten92 on Cash App';
  return `
    <div style="font-family:Georgia,serif;color:#2E1C38">
      <h2 style="color:#8C6A3B">Thank you, ${escapeHtml(first)} ✦</h2>
      <p>Your order has been received and is awaiting payment confirmation. Once Amber sees your ${escapeHtml(methodLabel)} payment arrive, she will mark your order paid and begin preparing it for shipment.</p>
      <h3>Your order</h3>
      <p><strong>Order number:</strong> ${escapeHtml(order.orderId)}</p>
      <p><strong>Items:</strong> ${escapeHtml(order.product)}</p>
      <p><strong>Amount due:</strong> ${escapeHtml(order.orderTotal)} ${escapeHtml(order.currency)}</p>
      <p><strong>Send payment to:</strong> ${escapeHtml(handleLabel)}</p>
      <p><a href="${methodUrl}" style="display:inline-block;padding:10px 20px;background:#8C6A3B;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">Open ${escapeHtml(methodLabel)}</a></p>
      <p style="margin-top:16px">Please include your name so Amber can match the payment to this order. If you have questions, reply to this email or write to
      <a href="mailto:awaken@consultant.com">awaken@consultant.com</a>.</p>
      <p>With gratitude,<br/>Amber ✦<br/>Amber's Alchemy Apothecary</p>
    </div>
  `;
}

async function sendOrderEmails(order, methodUrl) {
  const adminSubject = `Pending-payment order ${order.orderId} — ${order.customerName || 'customer'} — ${order.orderTotal}`;
  const customerSubject = `Your Amber's Alchemy order is received ✦ ${order.orderId}`;
  const adminHtml = adminEmailHtml(order, methodUrl);
  const customerHtml = customerEmailHtml(order, methodUrl);
  const adminText = stripHtml(adminHtml);
  const customerText = stripHtml(customerHtml);

  const resendKey = Netlify.env.get('RESEND_API_KEY');
  const fromEmail = Netlify.env.get('ORDER_FROM_EMAIL') || FROM_EMAIL;
  const webhook = Netlify.env.get('ORDER_EMAIL_WEBHOOK');
  const result = { adminDelivered: false, customerDelivered: false, provider: null, error: null };

  if (resendKey) {
    result.provider = 'resend';
    try {
      const adminRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: fromEmail,
          to: ADMIN_EMAILS,
          subject: adminSubject,
          html: adminHtml,
          text: adminText,
        }),
      });
      result.adminDelivered = adminRes.ok;
      if (!adminRes.ok) result.error = `admin: HTTP ${adminRes.status}`;

      if (order.email) {
        const custRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: fromEmail,
            to: [order.email],
            reply_to: 'awaken@consultant.com',
            subject: customerSubject,
            html: customerHtml,
            text: customerText,
          }),
        });
        result.customerDelivered = custRes.ok;
        if (!custRes.ok) result.error = (result.error ? result.error + '; ' : '') + `customer: HTTP ${custRes.status}`;
      }
    } catch (err) {
      result.error = String(err?.message || err);
    }
    return result;
  }

  if (webhook) {
    result.provider = 'webhook';
    try {
      const res = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order,
          admin: { to: ADMIN_EMAILS, subject: adminSubject, html: adminHtml, text: adminText },
          customer: order.email
            ? { to: order.email, subject: customerSubject, html: customerHtml, text: customerText }
            : null,
        }),
      });
      result.adminDelivered = res.ok;
      result.customerDelivered = res.ok && Boolean(order.email);
      if (!res.ok) result.error = `webhook: HTTP ${res.status}`;
    } catch (err) {
      result.error = String(err?.message || err);
    }
    return result;
  }

  // No Resend and no webhook — the existing Netlify Form submission still runs
  // from the client, so Amber's Netlify Form notifications will cover admin
  // delivery. Customer email is best-effort in this mode.
  result.provider = 'netlify-form';
  return result;
}

export const config = {
  path: '/api/place-order',
  method: 'POST',
};
