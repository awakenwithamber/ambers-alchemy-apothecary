// Grimior / Real Magic — Stripe webhook handler.
// Handles subscription lifecycle events: invoice.paid (renewal),
// customer.subscription.deleted (cancel), invoice.payment_failed.
// Keeps the grimior-subscribers blob store in sync, sends dual admin
// notifications, and (on cancellation) flips access to inactive.
//
// Wire this at Stripe → Webhooks with URL:
//   https://<your-site>/.netlify/functions/grimior-webhook
// and set STRIPE_WEBHOOK_SECRET in Netlify env.
//
// If STRIPE_WEBHOOK_SECRET is not set we still accept unsigned events
// so local testing works — but production should always set the secret.
import { getStore } from '@netlify/blobs';
import { sendToAll, escapeHtml } from './_email.mjs';

function safeKey(email) { return String(email).replace(/[^a-z0-9]+/gi, '_').toLowerCase(); }

async function verifyStripeSignature(rawBody, signatureHeader, secret) {
  if (!secret) return true; // no secret configured — skip verification (dev only)
  if (!signatureHeader) return false;
  try {
    const parts = Object.fromEntries(
      signatureHeader.split(',').map((p) => p.split('=').map((s) => s.trim()))
    );
    const t = parts.t;
    const v1 = parts.v1;
    if (!t || !v1) return false;
    const signedPayload = `${t}.${rawBody}`;
    const enc = new TextEncoder();
    const keyData = enc.encode(secret);
    const cryptoKey = await crypto.subtle.importKey('raw', keyData,
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(signedPayload));
    const hex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
    return hex === v1;
  } catch (err) {
    console.error('stripe signature verify failed', err);
    return false;
  }
}

async function lookupCustomerEmail(customerId) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !customerId) return null;
  try {
    const res = await fetch('https://api.stripe.com/v1/customers/' + encodeURIComponent(customerId), {
      headers: { 'Authorization': 'Bearer ' + key },
    });
    if (!res.ok) return null;
    const c = await res.json();
    return c && c.email ? c.email.toLowerCase() : null;
  } catch (_) { return null; }
}

async function setMember(email, patch, purpose) {
  if (!email) return;
  try {
    const subs = getStore('grimior-subscribers');
    const key = safeKey(email);
    const prior = await subs.get(key, { type: 'json' }).catch(() => null);
    const next = { ...(prior || {}), email, ...patch, updatedAt: new Date().toISOString() };
    await subs.setJSON(key, next);
    await sendToAll({
      subject: `✦ Grimior ${purpose} — ${email}`,
      purpose: 'grimior-' + purpose,
      orderId: email,
      html: `<p>Grimior event: <strong>${escapeHtml(purpose)}</strong></p>
             <p>Email: ${escapeHtml(email)}</p>
             <p>New status: ${escapeHtml(next.status || '')}</p>`,
      text: `Grimior ${purpose} — ${email} (${next.status || ''})`,
    });
  } catch (err) { console.error('grimior setMember failed', err); }
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  const raw = await req.text();
  const sig = req.headers.get('stripe-signature') || '';
  const secret = process.env.STRIPE_WEBHOOK_SECRET || '';
  const ok = await verifyStripeSignature(raw, sig, secret);
  if (!ok) return new Response('bad signature', { status: 400 });

  let event;
  try { event = JSON.parse(raw); } catch { return new Response('bad json', { status: 400 }); }

  try {
    const type = event && event.type;
    const data = (event && event.data && event.data.object) || {};

    if (type === 'invoice.paid') {
      const email = (data.customer_email || await lookupCustomerEmail(data.customer) || '').toLowerCase();
      const periodEnd = data.lines && data.lines.data && data.lines.data[0] && data.lines.data[0].period && data.lines.data[0].period.end;
      const expiresAt = periodEnd ? new Date(periodEnd * 1000).toISOString() : new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString();
      await setMember(email, {
        status: 'active',
        expiresAt,
        lastPaymentAt: new Date().toISOString(),
        stripeCustomerId: data.customer || null,
        stripeSubscriptionId: data.subscription || null,
      }, 'renewed');
    } else if (type === 'checkout.session.completed' && data.mode === 'subscription') {
      const email = (data.customer_email || (data.customer_details && data.customer_details.email) || await lookupCustomerEmail(data.customer) || '').toLowerCase();
      await setMember(email, {
        status: data.payment_status === 'paid' ? 'active' : 'pending',
        stripeSessionId: data.id || null,
        stripeSubscriptionId: data.subscription || null,
        stripeCustomerId: data.customer || null,
        expiresAt: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
      }, 'subscription-activated');
    } else if (type === 'customer.subscription.deleted') {
      const email = (await lookupCustomerEmail(data.customer) || '').toLowerCase();
      await setMember(email, {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(),
      }, 'cancelled');
    } else if (type === 'invoice.payment_failed') {
      const email = (data.customer_email || await lookupCustomerEmail(data.customer) || '').toLowerCase();
      await setMember(email, {
        status: 'past_due',
        lastPaymentFailedAt: new Date().toISOString(),
      }, 'payment-failed');
    }
  } catch (err) {
    console.error('grimior webhook handler error', err);
  }
  return new Response('ok');
};

export const config = {
  path: '/.netlify/functions/grimior-webhook',
  method: 'POST',
};
