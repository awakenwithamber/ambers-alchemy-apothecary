// Grimior / Real Magic — activation handler (Shopify).
// Called after Shopify redirects the subscriber back to the site with
// ?grimior=success (and optionally ?email=…). We look up the blob record
// written by the grimior-webhook (orders/paid, subscription_contracts/*)
// and, if active, send the welcome email with the monthly promo code.
// Access status itself is the webhook's responsibility — this endpoint
// never marks someone active without server-side confirmation.
//
// Works safely even when Shopify isn't configured — in that case it just
// returns {active:false} and the client renders a friendly "we're setting
// up your membership" message.
import { getStore } from '@netlify/blobs';
import { sendToAll, sendToCustomer, escapeHtml } from './_email.mjs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeKey(email) { return String(email).replace(/[^a-z0-9]+/gi, '_').toLowerCase(); }

function monthCode() {
  const d = new Date();
  const yy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const suffix = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'MOON';
  return `GRIMIOR-${yy}${mm}-${suffix}`;
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method-not-allowed' }), {
      status: 405, headers: { 'Content-Type': 'application/json' },
    });
  }

  let body = {};
  try { body = await req.json(); } catch { /* ignore */ }
  const email = String(body.email || '').trim().toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return Response.json({ active: false, error: 'invalid-email' }, { status: 200 });
  }

  try {
    const subs = getStore('grimior-subscribers');
    const key = safeKey(email);
    const prior = await subs.get(key, { type: 'json' }).catch(() => null);

    const isActive = !!(prior && prior.status === 'active' &&
      (!prior.expiresAt || Date.parse(prior.expiresAt) > Date.now()));

    if (!isActive) {
      return Response.json({
        active: false,
        status: (prior && prior.status) || 'pending',
        message: 'Your Shopify subscription is still being processed. You will have access as soon as the payment is confirmed.',
      });
    }

    // First-time activation-from-client: assign promo code + send welcome emails.
    const promoCode = prior.promoCode || monthCode();
    const name = prior.name || '';
    const expiresAt = prior.expiresAt;
    const alreadyWelcomed = !!prior.welcomeSentAt;

    await subs.setJSON(key, {
      ...prior,
      promoCode,
      welcomeSentAt: alreadyWelcomed ? prior.welcomeSentAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (!alreadyWelcomed) {
      await sendToAll({
        subject: '✦ New Grimior subscriber — welcome them!',
        purpose: 'grimior-subscription-activated',
        orderId: email,
        html: `
          <h2>New Grimior / Real Magic subscriber</h2>
          <p>A visitor has successfully subscribed to The Grimior via Shopify.</p>
          <ul>
            <li><strong>Email:</strong> ${escapeHtml(email)}</li>
            <li><strong>Name:</strong> ${escapeHtml(name || '—')}</li>
            <li><strong>Welcome promo code:</strong> ${escapeHtml(promoCode)}</li>
            <li><strong>Access expires:</strong> ${escapeHtml(expiresAt || '—')}</li>
          </ul>`,
        text: `New Grimior subscriber: ${email} ${name ? '(' + name + ')' : ''} — promo ${promoCode}`,
      });

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
          <p>Use it at checkout for 10% off your next order.</p>
          <p style="opacity:0.7;font-size:0.85rem;">Cancel or manage your subscription any time from your Shopify account or the confirmation email. Questions? Reply to this note or write to Amber at awaken@consultant.com.</p>
        `,
        text: `Welcome to The Grimior / Real Magic. Your first promo code: ${promoCode}`,
      });
    }

    return Response.json({
      active: true,
      email,
      expiresAt: expiresAt || null,
      promoCode,
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
