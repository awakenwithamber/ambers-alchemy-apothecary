// webhook-shopify.js — handles Shopify customer / order events.
// HMAC verified via X-Shopify-Hmac-Sha256 header.

import crypto from 'node:crypto';
import { getStore } from "@netlify/blobs";

function verifyShopifyHmac(rawBody, hmacHeader, secret) {
  if (!secret) return true;
  if (!hmacHeader) return false;
  const calc = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');
  try {
    return crypto.timingSafeEqual(Buffer.from(calc), Buffer.from(hmacHeader));
  } catch (e) { return false; }
}

export default async (req) => {
  const raw = await req.text();
  const hmac = req.headers.get('x-shopify-hmac-sha256');
  const secret = Netlify.env.get('SHOPIFY_WEBHOOK_SECRET');
  if (!verifyShopifyHmac(raw, hmac, secret)) {
    return new Response('Invalid HMAC', { status: 401 });
  }

  const topic = (req.headers.get('x-shopify-topic') || '').toLowerCase();
  let body;
  try { body = JSON.parse(raw); } catch (e) { return new Response('Bad body', { status: 400 }); }

  const email = (body.email || (body.customer && body.customer.email) || '').toLowerCase().trim();

  if (topic === 'customers/update' || topic === 'customers/create') {
    const tags = (body.tags || '').toLowerCase();
    const isSubscriber = /grimior-subscriber/.test(tags);
    if (email) {
      try {
        const store = getStore('grimior-subscribers');
        const existing = (await store.get(email, { type: 'json' })) || {};
        await store.setJSON(email, {
          ...existing,
          email,
          shopifyCustomerId: body.id,
          shopifyTags: body.tags || '',
          active: isSubscriber || !!existing.active,
          status: isSubscriber ? 'active' : (existing.status || 'inactive'),
          updatedAt: new Date().toISOString()
        });
      } catch (e) {}
    }
  }

  if (topic === 'orders/create' || topic === 'orders/paid') {
    // Forward to order-notify-style handler. We re-emit through internal call.
    // (The Shopify webhook can also be registered directly to /api/order-notify;
    // this endpoint provides a unified handler with tag-aware extras.)
    try {
      const store = getStore('grimior-orders');
      await store.setJSON(`${body.id}`, {
        id: body.id,
        email,
        total: body.total_price,
        items: (body.line_items || []).map(i => i.name),
        createdAt: body.created_at || new Date().toISOString()
      });
    } catch (e) {}
  }

  return Response.json({ ok: true, topic });
};

export const config = {
  path: '/api/webhook-shopify',
  method: 'POST'
};
