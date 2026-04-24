// Grimior / Real Magic — activation handler.
// Called after Stripe redirects the subscriber back to the site with
// ?grimior=success&session_id=... We verify the session with Stripe
// (when configured), mark the subscriber as active in Netlify Blobs,
// assign a one-time welcome promo code, and dual-notify admins.
//
// Works safely even when Stripe is not configured — in that case we
// simply return the best-effort state we already have on file.
import { getStore } from '@netlify/blobs';
import { sendToAll, sendToCustomer, escapeHtml } from './_email.mjs';

function safeKey(email) { return String(email).replace(/[^a-z0-9]+/gi, '_').toLowerCase(); }

function monthCode() {
  // Build a month-tagged code like GRIMIOR-2026-04-A1B2
  const d = new Date();
  const yy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const suffix = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'MOON';
  return `GRIMIOR-${yy}${mm}-${suffix}`;
}

async function fetchStripeSession(sessionId) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !sessionId) return null;
  try {
    const res = await fetch('https://api.stripe.com/v1/checkout/sessions/' + encodeURIComponent(sessionId), {
      headers: { 'Authorization': 'Bearer ' + key },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('stripe session fetch failed', err);
    return null;
  }
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method-not-allowed' }), {
      status: 405, headers: { 'Content-Type': 'application/json' },
    });
  }

  let body = {};
  try { body = await req.json(); } catch { /* ignore */ }
  const sessionId = String(body.sessionId || '').slice(0, 200);

  const session = await fetchStripeSession(sessionId);
  const email = (session && session.customer_details && session.customer_details.email) ||
                (session && session.customer_email) || '';
  const name  = (session && session.customer_details && session.customer_details.name) || '';
  const paid  = session && (session.payment_status === 'paid' || session.status === 'complete');

  if (!email) {
    // Without Stripe verification we still try to return state for any
    // client-provided email, but we never grant access without a record.
    return Response.json({ active: false, error: 'no-email-on-session' }, { status: 200 });
  }

  try {
    const subs = getStore('grimior-subscribers');
    const key = safeKey(email);
    const prior = await subs.get(key, { type: 'json' }).catch(() => null);

    // Set 35-day soft expiration; real source of truth is Stripe
    // subscription lifecycle (webhook can extend when wired up).
    const expiresAt = new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString();
    const promoCode = (prior && prior.promoCode) || monthCode();

    const record = {
      ...(prior || {}),
      email,
      name: name || (prior && prior.name) || '',
      status: paid ? 'active' : (prior && prior.status) || 'pending',
      stripeSessionId: sessionId || (prior && prior.stripeSessionId) || null,
      stripeSubscriptionId: (session && session.subscription) || (prior && prior.stripeSubscriptionId) || null,
      stripeCustomerId: (session && session.customer) || (prior && prior.stripeCustomerId) || null,
      activatedAt: paid ? new Date().toISOString() : (prior && prior.activatedAt) || null,
      expiresAt: paid ? expiresAt : (prior && prior.expiresAt) || null,
      promoCode,
      updatedAt: new Date().toISOString(),
    };
    await subs.setJSON(key, record);

    if (paid) {
      // Notify admins (dual delivery, independent, audited).
      await sendToAll({
        subject: '✦ New Grimior subscriber — welcome them!',
        purpose: 'grimior-subscription-activated',
        orderId: email,
        html: `
          <h2>New Grimior / Real Magic subscriber</h2>
          <p>A visitor has successfully subscribed to The Grimior.</p>
          <ul>
            <li><strong>Email:</strong> ${escapeHtml(email)}</li>
            <li><strong>Name:</strong> ${escapeHtml(name || '—')}</li>
            <li><strong>Subscription:</strong> ${escapeHtml(record.stripeSubscriptionId || 'unknown')}</li>
            <li><strong>Welcome promo code:</strong> ${escapeHtml(promoCode)}</li>
            <li><strong>Access expires:</strong> ${escapeHtml(expiresAt)}</li>
          </ul>`,
        text: `New Grimior subscriber: ${email} ${name ? '(' + name + ')' : ''} — promo ${promoCode}`,
      });

      // Customer welcome email.
      await sendToCustomer({
        to: email,
        subject: '✦ Welcome to The Grimior / Real Magic',
        purpose: 'grimior-welcome',
        orderId: email,
        html: `
          <h2>Welcome to The Grimior / Real Magic</h2>
          <p>${name ? escapeHtml(name) + ',' : 'Dear one,'}</p>
          <p>The grimoire is now open to you. Step inside any time — the candlelight is warm and the pages are ready.</p>
          <h3>What you unlocked</h3>
          <ul>
            <li>Every grimoire page — rituals, remedies, recipes, seasonal work.</li>
            <li>10% off every full apothecary order.</li>
            <li>Free shipping on orders over $50.</li>
            <li>Weekly featured deals and a monthly subscriber-only promo code.</li>
          </ul>
          <h3>Your first promo code</h3>
          <p><strong style="font-size:1.1rem;letter-spacing:0.08em;">${escapeHtml(promoCode)}</strong></p>
          <p>Use it at checkout for 10% off your first order as a member.</p>
          <p style="opacity:0.7;font-size:0.85rem;">Cancel anytime from your Stripe receipt email. Questions? Reply to this note or write to Amber at awaken@consultant.com.</p>
        `,
        text: `Welcome to The Grimior / Real Magic. Your first promo code: ${promoCode}`,
      });
    }

    return Response.json({
      active: !!paid,
      email,
      expiresAt: paid ? expiresAt : null,
      promoCode: paid ? promoCode : null,
    });
  } catch (err) {
    console.error('grimior-activate error', err);
    return Response.json({ active: false, error: 'activate-failed' }, { status: 500 });
  }
};

export const config = {
  path: '/.netlify/functions/grimior-activate',
  method: 'POST',
};
