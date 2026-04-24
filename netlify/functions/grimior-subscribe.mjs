// Grimior / Real Magic — start subscription checkout
// Creates a Stripe Checkout session in mode=subscription for $3.33/month.
// If Stripe isn't configured, falls back to a "pending" response that logs
// the join request + notifies admins so Amber can onboard manually.
//
// Env:
//   STRIPE_SECRET_KEY        — required to create the checkout session
//   GRIMIOR_PRICE_ID         — optional pre-created Stripe recurring price ID
//                               (falls back to inline price_data $3.33/month)
//   ADMIN_ORDER_EMAIL_1/2    — admin notify recipients (via _email.mjs)
import { getStore } from '@netlify/blobs';
import { sendToAll, escapeHtml } from './_email.mjs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUBSCRIPTION_CENTS = 333; // $3.33

function clean(v, max = 200) {
  return String(v == null ? '' : v).replace(/[<>]/g, '').trim().slice(0, max);
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method-not-allowed' }), {
      status: 405, headers: { 'Content-Type': 'application/json' },
    });
  }

  let body = {};
  try { body = await req.json(); } catch { /* ignore */ }
  const email = clean(body.email, 160).toLowerCase();
  const name = clean(body.name, 80);
  const origin = clean(body.successUrl, 400) ? new URL(clean(body.successUrl, 400)).origin : '';
  const successUrl = clean(body.successUrl, 400) || (origin ? origin + '/?grimior=success' : '');
  const cancelUrl  = clean(body.cancelUrl, 400)  || (origin ? origin + '/?grimior=cancelled' : '');

  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: 'invalid-email' }, { status: 400 });
  }

  // Always record the intent so admins see join attempts even if Stripe fails.
  try {
    const intents = getStore('grimior-intents');
    const key = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    await intents.setJSON(key, { email, name, at: new Date().toISOString(), stage: 'checkout-requested' });
  } catch (err) {
    console.error('grimior-intent log failed', err);
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    // No Stripe configured — notify admins so Amber can onboard manually.
    await notifyAdminsPending({ email, name });
    return Response.json({
      pending: true,
      message: 'Subscription checkout is not yet configured on this site. Amber has been notified and will onboard this subscriber directly.',
    });
  }

  try {
    const params = new URLSearchParams();
    params.append('mode', 'subscription');
    params.append('customer_email', email);
    params.append('success_url', (successUrl || '/') + (successUrl && successUrl.indexOf('?') === -1 ? '?' : '&') + 'session_id={CHECKOUT_SESSION_ID}');
    params.append('cancel_url', cancelUrl || '/');
    params.append('allow_promotion_codes', 'true');
    params.append('billing_address_collection', 'auto');

    const priceId = process.env.GRIMIOR_PRICE_ID;
    if (priceId) {
      params.append('line_items[0][price]', priceId);
      params.append('line_items[0][quantity]', '1');
    } else {
      // Inline recurring price (falls back when no pre-created Price exists).
      params.append('line_items[0][quantity]', '1');
      params.append('line_items[0][price_data][currency]', 'usd');
      params.append('line_items[0][price_data][unit_amount]', String(SUBSCRIPTION_CENTS));
      params.append('line_items[0][price_data][product_data][name]', 'The Grimior / Real Magic — Monthly Access');
      params.append('line_items[0][price_data][product_data][description]',
        'Subscription access to Amber\'s Alchemy Apothecary living book of light magic. Includes 10% off every order, free shipping over $50, weekly deals, and a monthly promo code.');
      params.append('line_items[0][price_data][recurring][interval]', 'month');
    }

    params.append('metadata[product]', 'grimior-real-magic');
    if (name) params.append('metadata[customer_name]', name);
    params.append('subscription_data[metadata][product]', 'grimior-real-magic');
    if (name) params.append('subscription_data[metadata][customer_name]', name);

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + stripeKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    const session = await res.json();
    if (!res.ok || session.error) {
      console.error('grimior stripe error', session.error || res.status);
      // Record failure + notify admins but give the subscriber a graceful outcome.
      await notifyAdminsPending({ email, name, detail: session.error && session.error.message });
      return Response.json({
        pending: true,
        error: (session.error && session.error.message) || 'stripe-error',
      }, { status: 200 });
    }

    // Reserve a pending member record keyed by email — activation happens on success.
    try {
      const subs = getStore('grimior-subscribers');
      const existing = await subs.get(safeKey(email), { type: 'json' }).catch(() => null);
      await subs.setJSON(safeKey(email), {
        ...(existing || {}),
        email, name,
        stripeCheckoutId: session.id,
        status: (existing && existing.status) || 'pending',
        updatedAt: new Date().toISOString(),
      });
    } catch (err) { console.error('grimior-subscribers write failed', err); }

    return Response.json({ checkoutUrl: session.url, sessionId: session.id });
  } catch (err) {
    console.error('grimior-subscribe exception', err);
    await notifyAdminsPending({ email, name, detail: String(err && err.message || err) });
    return Response.json({ pending: true, error: 'checkout-exception' }, { status: 200 });
  }
};

async function notifyAdminsPending({ email, name, detail }) {
  try {
    await sendToAll({
      subject: '✦ Grimior subscription request — manual onboarding needed',
      purpose: 'grimior-join-pending',
      orderId: email,
      html: `
        <h2>New Grimior / Real Magic join request</h2>
        <p>A visitor attempted to subscribe to The Grimior but Stripe checkout was not available.</p>
        <ul>
          <li><strong>Email:</strong> ${escapeHtml(email)}</li>
          <li><strong>Name:</strong> ${escapeHtml(name || '—')}</li>
          ${detail ? `<li><strong>Detail:</strong> ${escapeHtml(detail)}</li>` : ''}
        </ul>
        <p>Please reach out to onboard them manually.</p>
      `,
      text: `Grimior join request: ${email} ${name ? '(' + name + ')' : ''}${detail ? ' — ' + detail : ''}`,
    });
  } catch (err) { console.error('grimior admin notify failed', err); }
}

function safeKey(email) { return String(email).replace(/[^a-z0-9]+/gi, '_').toLowerCase(); }

export const config = {
  path: '/.netlify/functions/grimior-subscribe',
  method: 'POST',
};
