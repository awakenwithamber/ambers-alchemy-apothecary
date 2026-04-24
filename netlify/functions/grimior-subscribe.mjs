// Grimior / Real Magic — start subscription checkout (Shopify).
// Returns a Shopify cart permalink for the recurring $3.33/month
// subscription variant. Shopify checkout handles payment, wallet methods
// (Shop Pay, Apple Pay, Google Pay, Cash App Pay, Venmo, card), promo
// codes, and recurring billing via whichever Shopify-compatible
// subscription app is installed (Shopify Subscriptions, Recharge,
// Appstle, Awtomic, etc.). No Stripe logic exists in this file.
//
// Env:
//   SHOPIFY_DOMAIN                  — required to build a checkout URL
//   SHOPIFY_SUBSCRIPTION_VARIANT_ID — variant ID of the $3.33/month plan
//   ADMIN_ORDER_EMAIL_1/2           — admin notify recipients
//
// If either Shopify var is missing the join request is still captured
// and admin is dual-notified so Amber can onboard the subscriber by hand.
import { getStore } from '@netlify/blobs';
import { sendToAll, escapeHtml } from './_email.mjs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(v, max = 200) {
  return String(v == null ? '' : v).replace(/[<>]/g, '').trim().slice(0, max);
}

function cleanDomain(v) {
  return String(v || '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
}

function safeKey(email) { return String(email).replace(/[^a-z0-9]+/gi, '_').toLowerCase(); }

function buildShopifySubscriptionUrl({ domain, variantId, email, name, successUrl }) {
  if (!domain || !variantId) return null;
  const qs = [];
  qs.push('checkout%5Bemail%5D=' + encodeURIComponent(email));
  qs.push('attributes%5BProduct%5D=' + encodeURIComponent('grimior-real-magic'));
  if (name) qs.push('attributes%5BCustomer%20Name%5D=' + encodeURIComponent(name));
  if (successUrl) qs.push('return_to=' + encodeURIComponent(successUrl));
  return `https://${domain}/cart/${encodeURIComponent(variantId)}:1?${qs.join('&')}`;
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
  const rawSuccess = clean(body.successUrl, 400);
  const origin = rawSuccess ? (() => { try { return new URL(rawSuccess).origin; } catch { return ''; } })() : '';
  const successUrl = rawSuccess || (origin ? origin + '/?grimior=success' : '');

  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: 'invalid-email' }, { status: 400 });
  }

  // Always record the intent so admins see join attempts even if Shopify isn't configured.
  try {
    const intents = getStore('grimior-intents');
    const key = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    await intents.setJSON(key, {
      email, name,
      at: new Date().toISOString(),
      stage: 'checkout-requested',
      provider: 'shopify',
    });
  } catch (err) {
    console.error('grimior-intent log failed', err);
  }

  const domain = cleanDomain(process.env.SHOPIFY_DOMAIN);
  const variantId = String(process.env.SHOPIFY_SUBSCRIPTION_VARIANT_ID || '').trim();

  if (!domain || !variantId) {
    await notifyAdminsPending({ email, name, detail:
      !domain ? 'SHOPIFY_DOMAIN not set' :
      !variantId ? 'SHOPIFY_SUBSCRIPTION_VARIANT_ID not set' : '' });
    return Response.json({
      pending: true,
      message: 'Shopify subscription is not yet configured. Amber has been notified and will onboard this subscriber directly.',
    });
  }

  const checkoutUrl = buildShopifySubscriptionUrl({ domain, variantId, email, name, successUrl });
  if (!checkoutUrl) {
    await notifyAdminsPending({ email, name, detail: 'could-not-build-shopify-url' });
    return Response.json({ pending: true, error: 'url-build-failed' });
  }

  // Reserve a pending member record keyed by email — activation is flipped
  // by the Shopify webhook (orders/paid or subscription_contracts/activate).
  try {
    const subs = getStore('grimior-subscribers');
    const existing = await subs.get(safeKey(email), { type: 'json' }).catch(() => null);
    await subs.setJSON(safeKey(email), {
      ...(existing || {}),
      email, name,
      provider: 'shopify',
      shopifyVariantId: variantId,
      status: (existing && existing.status) || 'pending',
      updatedAt: new Date().toISOString(),
    });
  } catch (err) { console.error('grimior-subscribers write failed', err); }

  return Response.json({ checkoutUrl });
};

async function notifyAdminsPending({ email, name, detail }) {
  try {
    await sendToAll({
      subject: '✦ Grimior subscription request — manual onboarding needed',
      purpose: 'grimior-join-pending',
      orderId: email,
      html: `
        <h2>New Grimior / Real Magic join request</h2>
        <p>A visitor attempted to subscribe to The Grimior but Shopify subscription checkout was not available.</p>
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

export const config = {
  path: '/.netlify/functions/grimior-subscribe',
  method: 'POST',
};
