// Triggered automatically when a Netlify Form submission is created.
//
// EMERGENCY CHECKOUT PAYMENT ENFORCEMENT:
// This handler is the authoritative source of truth for order payment status.
// It re-verifies every order against Stripe before marking it paid. Any order
// that cannot be cryptographically verified as paid is forced to
// "pending-payment" regardless of what the client submitted. Fulfillment
// signals (review-request queue, paid confirmation emails) are only created
// for verified-paid orders. Admin notifications are sent for all orders.

import { getStore } from "@netlify/blobs";

const REVIEW_REQUEST_DELAY_DAYS = 10;
const ADMIN_EMAILS = ['awaken@consultant.com', 'perfectlyme347@gmail.com'];
const MAIL_FROM = process.env.QUIZ_LEAD_FROM_EMAIL
  || "Amber\u2019s Alchemy Apothecary <hello@awakenagain.com>";

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseCurrencyToCents(val) {
  if (val == null) return null;
  const digits = String(val).replace(/[^0-9.]/g, '');
  if (!digits) return null;
  const num = Number.parseFloat(digits);
  if (!Number.isFinite(num)) return null;
  return Math.round(num * 100);
}

// Verify a PaymentIntent against Stripe. Returns:
//  { verified: true, paid: true, stripeAmount, stripeStatus } when succeeded,
//  { verified: true, paid: false, stripeStatus } when it exists but is not paid,
//  { verified: false, reason } when we cannot confirm (missing key, network, etc).
async function verifyStripePayment(piId) {
  if (!piId || typeof piId !== 'string' || !piId.startsWith('pi_')) {
    return { verified: true, paid: false, stripeStatus: 'not-a-payment-intent' };
  }
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return { verified: false, reason: 'missing-stripe-key' };
  }
  try {
    const res = await fetch(`https://api.stripe.com/v1/payment_intents/${encodeURIComponent(piId)}`, {
      headers: { 'Authorization': `Bearer ${stripeKey}` },
    });
    if (!res.ok) {
      return { verified: false, reason: `stripe-http-${res.status}` };
    }
    const pi = await res.json();
    const status = pi.status || 'unknown';
    const paid = status === 'succeeded';
    return {
      verified: true,
      paid,
      stripeStatus: status,
      stripeAmount: typeof pi.amount_received === 'number' ? pi.amount_received : pi.amount,
    };
  } catch (err) {
    return { verified: false, reason: 'stripe-exception' };
  }
}

async function sendViaResend({ to, subject, html, text, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { skipped: true, reason: 'no-provider-configured' };
  try {
    const body = {
      from: MAIL_FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    };
    if (replyTo) body.reply_to = replyTo;
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('Resend send failed:', res.status, detail);
      return { sent: false, error: 'provider-error', detail };
    }
    return { sent: true };
  } catch (err) {
    console.error('Resend send error:', err);
    return { sent: false, error: 'provider-exception' };
  }
}

function buildAdminEmail(order, verification) {
  const statusLabel = order.paymentStatus === 'paid'
    ? 'PAID \u2014 verified by Stripe'
    : 'PENDING PAYMENT \u2014 awaiting verification';
  const bgColor = order.paymentStatus === 'paid' ? '#1f7a3a' : '#8a5a00';
  const subject = order.paymentStatus === 'paid'
    ? `[PAID] Order ${order.orderId} \u2014 ${order.customerName || 'customer'}`
    : `[PENDING] Order ${order.orderId} awaiting payment \u2014 ${order.customerName || 'customer'}`;

  const verificationNote = order.paymentStatus === 'paid'
    ? `Stripe verification: ${escapeHtml(verification.stripeStatus || 'succeeded')} (amount ${verification.stripeAmount != null ? '$' + (verification.stripeAmount / 100).toFixed(2) : 'n/a'}).`
    : order.paymentMethod === 'stripe'
      ? `Card payment did not succeed. Stripe status: ${escapeHtml(verification.stripeStatus || 'unknown')}. Do not fulfill.`
      : `Customer indicated they are paying via ${escapeHtml(order.paymentMethod || 'external app')}. Verify payment received before fulfilling.`;

  const html = `
    <div style="font-family:Georgia,serif;color:#2a1f3d;max-width:640px;">
      <h2 style="margin:0 0 6px;color:${bgColor};">${escapeHtml(statusLabel)}</h2>
      <p style="margin:0 0 18px;color:#555;">Order <strong>${escapeHtml(order.orderId)}</strong> submitted at ${escapeHtml(order.submittedAt)}.</p>
      <p style="margin:0 0 18px;padding:10px 14px;background:#f6efe2;border-left:4px solid ${bgColor};font-size:0.95em;">${verificationNote}</p>
      <table style="width:100%;border-collapse:collapse;font-family:Georgia,serif;">
        <tr><td style="padding:6px 10px;color:#666;">Customer</td><td style="padding:6px 10px;"><strong>${escapeHtml(order.customerName || '')}</strong></td></tr>
        <tr><td style="padding:6px 10px;color:#666;">Email</td><td style="padding:6px 10px;">${escapeHtml(order.email || '')}</td></tr>
        <tr><td style="padding:6px 10px;color:#666;">Phone</td><td style="padding:6px 10px;">${escapeHtml(order.phone || '')}</td></tr>
        <tr><td style="padding:6px 10px;color:#666;">Shipping</td><td style="padding:6px 10px;">${escapeHtml(order.shippingAddress || '')}</td></tr>
        <tr><td style="padding:6px 10px;color:#666;">Product</td><td style="padding:6px 10px;">${escapeHtml(order.product || '')}</td></tr>
        <tr><td style="padding:6px 10px;color:#666;">Quantity</td><td style="padding:6px 10px;">${escapeHtml(order.quantity || '')}</td></tr>
        <tr><td style="padding:6px 10px;color:#666;">Order total</td><td style="padding:6px 10px;"><strong>${escapeHtml(order.orderTotal || '')}</strong></td></tr>
        <tr><td style="padding:6px 10px;color:#666;">Transaction ID</td><td style="padding:6px 10px;font-family:monospace;">${escapeHtml(order.transactionId || '')}</td></tr>
        <tr><td style="padding:6px 10px;color:#666;">Payment method</td><td style="padding:6px 10px;">${escapeHtml(order.paymentMethod || 'unknown')}</td></tr>
        <tr><td style="padding:6px 10px;color:#666;">Notes</td><td style="padding:6px 10px;">${escapeHtml(order.notes || '')}</td></tr>
      </table>
      ${order.paymentStatus === 'paid' ? '' : `
      <p style="margin:22px 0 8px;color:#2a1f3d;"><strong>Next step:</strong></p>
      <ol style="color:#2a1f3d;">
        <li>Confirm ${escapeHtml(order.orderTotal || '')} received in ${escapeHtml(order.paymentMethod === 'cashapp' ? 'Cash App' : (order.paymentMethod === 'venmo' ? 'Venmo' : 'Venmo/Cash App'))}.</li>
        <li>Once verified, mark the order paid via the admin verify endpoint.</li>
        <li>Do not ship until payment is verified.</li>
      </ol>`}
    </div>
  `;
  const text = [
    statusLabel,
    `Order ${order.orderId} submitted at ${order.submittedAt}`,
    verificationNote.replace(/<[^>]+>/g, ''),
    `Customer: ${order.customerName || ''}`,
    `Email: ${order.email || ''}`,
    `Phone: ${order.phone || ''}`,
    `Shipping: ${order.shippingAddress || ''}`,
    `Product: ${order.product || ''}`,
    `Quantity: ${order.quantity || ''}`,
    `Order total: ${order.orderTotal || ''}`,
    `Transaction ID: ${order.transactionId || ''}`,
    `Payment method: ${order.paymentMethod || 'unknown'}`,
    `Notes: ${order.notes || ''}`,
  ].join('\n');
  return { subject, html, text };
}

function buildCustomerEmail(order) {
  if (order.paymentStatus === 'paid') {
    const subject = `Thank you! Your order ${order.orderId} is confirmed`;
    const html = `
      <div style="font-family:Georgia,serif;color:#2a1f3d;max-width:560px;">
        <p>Dear ${escapeHtml(order.customerName || 'friend')},</p>
        <p>Your payment has been received and your order is confirmed. Amber will begin preparing your order right away.</p>
        <p><strong>Order:</strong> ${escapeHtml(order.orderId)}<br/>
           <strong>Items:</strong> ${escapeHtml(order.product || '')}<br/>
           <strong>Total:</strong> ${escapeHtml(order.orderTotal || '')}</p>
        <p>With gratitude,<br/>Amber \u2726</p>
      </div>`;
    const text = `Dear ${order.customerName || 'friend'},\n\nYour payment has been received and your order ${order.orderId} is confirmed. Amber will begin preparing your order right away.\n\nItems: ${order.product || ''}\nTotal: ${order.orderTotal || ''}\n\nWith gratitude,\nAmber`;
    return { subject, html, text };
  }
  const payMethod = order.paymentMethod === 'cashapp' ? 'Cash App' : (order.paymentMethod === 'venmo' ? 'Venmo' : 'Venmo or Cash App');
  const subject = `Your order ${order.orderId} is awaiting payment confirmation`;
  const html = `
    <div style="font-family:Georgia,serif;color:#2a1f3d;max-width:560px;">
      <p>Dear ${escapeHtml(order.customerName || 'friend')},</p>
      <p>Your order has been received and is awaiting payment confirmation. Once your payment is received through ${escapeHtml(payMethod)}, your order will be confirmed and Amber will begin preparing it.</p>
      <p><strong>Order:</strong> ${escapeHtml(order.orderId)}<br/>
         <strong>Items:</strong> ${escapeHtml(order.product || '')}<br/>
         <strong>Amount due:</strong> ${escapeHtml(order.orderTotal || '')}</p>
      <p style="color:#8a5a00;"><strong>Please note:</strong> your order is not yet confirmed. It will be confirmed once we match your payment. If you have any questions, reply to this email.</p>
      <p>With gratitude,<br/>Amber \u2726</p>
    </div>`;
  const text = `Dear ${order.customerName || 'friend'},\n\nYour order ${order.orderId} has been received and is awaiting payment confirmation. Once your payment is received through ${payMethod}, your order will be confirmed.\n\nItems: ${order.product || ''}\nAmount due: ${order.orderTotal || ''}\n\nPlease note: your order is not yet confirmed. It will be confirmed once we match your payment.\n\nWith gratitude,\nAmber`;
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
    const now = new Date();
    const email = (data['email'] || '').toLowerCase().trim();
    const rawTxnId = (data['transaction-id'] || '').trim();
    const clientPaymentStatus = (data['payment-status'] || '').trim().toLowerCase();
    const clientPaymentMethod = (data['payment-method'] || '').trim().toLowerCase();
    const orderTotal = data['order-total'] || '';
    const orderTotalCents = parseCurrencyToCents(orderTotal);

    // Server-side payment verification.
    // Never trust client-submitted payment-status. Re-verify against Stripe.
    const verification = await verifyStripePayment(rawTxnId);
    let paymentStatus;
    let paymentMethod;
    if (verification.verified && verification.paid) {
      const amountOk = orderTotalCents == null
        || verification.stripeAmount == null
        || Math.abs(verification.stripeAmount - orderTotalCents) <= 1;
      paymentStatus = amountOk ? 'paid' : 'pending-payment';
      paymentMethod = 'stripe';
    } else {
      // Card not verified-paid: treat as pending regardless of client claim.
      paymentStatus = 'pending-payment';
      if (clientPaymentMethod === 'venmo' || clientPaymentMethod === 'cashapp') {
        paymentMethod = clientPaymentMethod;
      } else if (rawTxnId.startsWith('pi_')) {
        paymentMethod = 'stripe';
      } else if (rawTxnId.startsWith('VENMO-')) {
        paymentMethod = 'venmo';
      } else if (rawTxnId.startsWith('CASHAPP-')) {
        paymentMethod = 'cashapp';
      } else {
        paymentMethod = 'unknown';
      }
    }

    const orderId = rawTxnId || `ORD-${Date.now()}`;

    const order = {
      orderId,
      customerName: (data['customer-name'] || '').trim(),
      email,
      phone: (data['phone'] || '').trim(),
      shippingAddress: `${data['shipping-address'] || ''}, ${data['city-state-zip'] || ''}`.replace(/^,\s*|\s*,\s*$/g, ''),
      product: data['product-ordered'] || '',
      quantity: data['quantity'] || '',
      notes: data['order-notes'] || '',
      transactionId: rawTxnId,
      paymentStatus,
      paymentMethod,
      orderTotal,
      submittedAt: payload.created_at || now.toISOString(),
      verification: {
        clientClaimedStatus: clientPaymentStatus,
        stripeVerified: !!(verification.verified && verification.paid),
        stripeStatus: verification.stripeStatus || null,
        verificationError: verification.verified ? null : (verification.reason || 'unknown'),
        stripeAmountCents: verification.stripeAmount ?? null,
        orderTotalCents: orderTotalCents ?? null,
      },
    };

    const orders = getStore('orders');
    await orders.setJSON(orderId, order);

    // Only queue review requests for truly-paid orders. Unpaid orders must not
    // trigger any downstream "thank you" / fulfillment-adjacent messaging.
    if (email && paymentStatus === 'paid') {
      const sendAt = new Date(now.getTime() + REVIEW_REQUEST_DELAY_DAYS * 24 * 60 * 60 * 1000);
      const reviewRequests = getStore('review-requests');
      await reviewRequests.setJSON(orderId, {
        orderId,
        email,
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

    // Admin notification (always). The admin team must hear about every order,
    // paid or pending, so they can match Venmo/Cash App payments manually.
    try {
      const adminMail = buildAdminEmail(order, verification);
      await sendViaResend({
        to: ADMIN_EMAILS,
        subject: adminMail.subject,
        html: adminMail.html,
        text: adminMail.text,
        replyTo: email || undefined,
      });
    } catch (err) {
      console.error('admin notification error:', err);
    }

    // Customer confirmation \u2014 accurate to actual payment status.
    if (email) {
      try {
        const customerMail = buildCustomerEmail(order);
        await sendViaResend({
          to: email,
          subject: customerMail.subject,
          html: customerMail.html,
          text: customerMail.text,
        });
      } catch (err) {
        console.error('customer notification error:', err);
      }
    }

    // Persist a notification record so the admin dashboard / manual audit has
    // a durable log even when no email provider is configured.
    try {
      const notifications = getStore('admin-notifications');
      await notifications.setJSON(`${orderId}-${paymentStatus}`, {
        orderId,
        paymentStatus,
        paymentMethod,
        email,
        customerName: order.customerName,
        orderTotal,
        transactionId: rawTxnId,
        adminEmails: ADMIN_EMAILS,
        createdAt: now.toISOString(),
      });
    } catch (err) {
      console.error('admin-notifications store error:', err);
    }

    return new Response('OK');
  } catch (err) {
    console.error('submission-created error:', err);
    return new Response('Error', { status: 500 });
  }
};
