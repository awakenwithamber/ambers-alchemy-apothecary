// Grimior / Real Magic — Shopify webhook handler.
// Handles subscription / order lifecycle events from Shopify + whichever
// Shopify-compatible subscription app is installed. Keeps the
// grimior-subscribers blob store in sync, sends dual admin notifications,
// and flips access to cancelled / past_due when appropriate.
//
// Wire this at Shopify Admin → Settings → Notifications → Webhooks with:
//   URL:     https://<your-site>/.netlify/functions/grimior-webhook
//   Topics:  orders/paid, orders/create, orders/cancelled,
//            subscription_contracts/create,
//            subscription_contracts/update,
//            subscription_contracts/activate,
//            subscription_contracts/pause,
//            subscription_contracts/cancel,
//            subscription_contracts/failed_payment
// and set SHOPIFY_WEBHOOK_SECRET in Netlify env to the webhook signing key.
//
// If SHOPIFY_WEBHOOK_SECRET is not set the handler still accepts events
// so local testing works — but production should always set the secret.
import { getStore } from '@netlify/blobs';
import { sendToAll, escapeHtml } from './_email.mjs';

function safeKey(email) { return String(email).replace(/[^a-z0-9]+/gi, '_').toLowerCase(); }

async function verifyShopifyHmac(rawBody, hmacHeader, secret) {
  if (!secret) return true; // no secret configured — skip verification (dev only)
  if (!hmacHeader) return false;
  try {
    const enc = new TextEncoder();
    const keyData = enc.encode(secret);
    const cryptoKey = await crypto.subtle.importKey(
      'raw', keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(rawBody));
    // Shopify sends base64 of the HMAC bytes.
    const bytes = new Uint8Array(sig);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const computed = btoa(binary);
    // Constant-time compare
    if (computed.length !== hmacHeader.length) return false;
    let mismatch = 0;
    for (let i = 0; i < computed.length; i++) {
      mismatch |= computed.charCodeAt(i) ^ hmacHeader.charCodeAt(i);
    }
    return mismatch === 0;
  } catch (err) {
    console.error('shopify hmac verify failed', err);
    return false;
  }
}

async function setMember(email, patch, purpose) {
  if (!email) return;
  try {
    const subs = getStore('grimior-subscribers');
    const key = safeKey(email);
    const prior = await subs.get(key, { type: 'json' }).catch(() => null);
    const next = { ...(prior || {}), email, provider: 'shopify', ...patch, updatedAt: new Date().toISOString() };
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

// Extract the customer email from a Shopify webhook payload. Orders payloads
// nest the email under `customer.email` or top-level `email`. Subscription
// contract payloads nest it under `customer.email`.
function extractEmail(data) {
  if (!data) return '';
  const fromTop = (data.email || '').trim();
  if (fromTop) return fromTop.toLowerCase();
  const c = data.customer || {};
  if (c.email) return String(c.email).trim().toLowerCase();
  const b = data.billing_address || {};
  if (b.email) return String(b.email).trim().toLowerCase();
  return '';
}

// Detect whether this Shopify event relates to the Grimior subscription.
// Any of the following count:
//   - attributes on the order / contract include `Product: grimior-real-magic`
//   - a line item references the configured subscription variant ID
//   - the product title contains "Grimior" / "Real Magic"
function isGrimiorEvent(data) {
  const subVar = String(process.env.SHOPIFY_SUBSCRIPTION_VARIANT_ID || '').trim();
  try {
    const attrs = Array.isArray(data.note_attributes) ? data.note_attributes : [];
    for (const a of attrs) {
      if ((a.name || '').toLowerCase() === 'product' &&
          String(a.value || '').toLowerCase().includes('grimior')) return true;
    }
    const lines = data.line_items || data.lines || [];
    for (const l of lines) {
      if (subVar && (String(l.variant_id || '') === subVar || String(l.id || '') === subVar)) return true;
      const title = String(l.title || l.product_title || '').toLowerCase();
      if (title.includes('grimior') || title.includes('real magic')) return true;
    }
    if (subVar && String(data.variant_id || '') === subVar) return true;
    const productTitle = String(data.product_title || '').toLowerCase();
    if (productTitle.includes('grimior') || productTitle.includes('real magic')) return true;
  } catch (_) { /* ignore */ }
  return false;
}

function nextPeriodEndIso(data) {
  // Subscription contracts expose `next_billing_date`. For order events we
  // approximate with a 35-day window so members keep access until the next
  // renewal event comes in.
  if (data && data.next_billing_date) {
    const t = Date.parse(data.next_billing_date);
    if (!isNaN(t)) return new Date(t).toISOString();
  }
  return new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString();
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  const raw = await req.text();
  const hmac = req.headers.get('x-shopify-hmac-sha256') || '';
  const topic = (req.headers.get('x-shopify-topic') || '').toLowerCase();
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET || '';
  const ok = await verifyShopifyHmac(raw, hmac, secret);
  if (!ok) return new Response('bad signature', { status: 401 });

  let data;
  try { data = JSON.parse(raw); } catch { return new Response('bad json', { status: 400 }); }

  try {
    if (!isGrimiorEvent(data)) {
      // Not a Grimior-related event; still ack so Shopify doesn't retry.
      return new Response('ok');
    }
    const email = extractEmail(data);
    if (!email) return new Response('ok');

    if (topic === 'orders/paid' ||
        topic === 'orders/create' ||
        topic === 'subscription_contracts/create' ||
        topic === 'subscription_contracts/activate' ||
        topic === 'subscription_contracts/update') {
      await setMember(email, {
        status: 'active',
        expiresAt: nextPeriodEndIso(data),
        lastPaymentAt: new Date().toISOString(),
        shopifyOrderId: data.id || null,
        shopifyCustomerId: (data.customer && data.customer.id) || null,
      }, 'renewed');
    } else if (topic === 'subscription_contracts/pause') {
      await setMember(email, {
        status: 'paused',
        pausedAt: new Date().toISOString(),
      }, 'paused');
    } else if (topic === 'subscription_contracts/cancel' || topic === 'orders/cancelled') {
      await setMember(email, {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(),
      }, 'cancelled');
    } else if (topic === 'subscription_contracts/failed_payment') {
      await setMember(email, {
        status: 'past_due',
        lastPaymentFailedAt: new Date().toISOString(),
      }, 'payment-failed');
    }
  } catch (err) {
    console.error('grimior shopify webhook error', err);
  }
  return new Response('ok');
};

export const config = {
  path: '/.netlify/functions/grimior-webhook',
  method: 'POST',
};
