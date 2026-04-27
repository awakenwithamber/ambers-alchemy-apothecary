// webhook-recharge.js — handles ReCharge subscription events.
// HMAC verified via X-Recharge-Hmac-Sha256 header.

import crypto from 'node:crypto';
import { getStore } from "@netlify/blobs";

function verifyRechargeHmac(rawBody, hmacHeader, secret) {
  if (!secret) return true;
  if (!hmacHeader) return false;
  const calc = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');
  try {
    return crypto.timingSafeEqual(Buffer.from(calc), Buffer.from(hmacHeader));
  } catch (e) { return false; }
}

async function shopifyTagCustomer(email, action /* 'add' | 'remove' */) {
  const shop = Netlify.env.get('SHOPIFY_SHOP_DOMAIN');
  const adminToken = Netlify.env.get('SHOPIFY_ADMIN_API_TOKEN');
  if (!shop || !adminToken || !email) return;
  try {
    const lookup = await fetch(`https://${shop}/admin/api/2024-01/customers/search.json?query=email:${encodeURIComponent(email)}`, {
      headers: { 'X-Shopify-Access-Token': adminToken }
    });
    const lookupJson = await lookup.json();
    const customer = (lookupJson.customers || [])[0];
    if (!customer) return;

    let tags = (customer.tags || '').split(',').map(t => t.trim()).filter(Boolean);
    if (action === 'add' && !tags.includes('grimior-subscriber')) tags.push('grimior-subscriber');
    if (action === 'remove') tags = tags.filter(t => t !== 'grimior-subscriber');

    await fetch(`https://${shop}/admin/api/2024-01/customers/${customer.id}.json`, {
      method: 'PUT',
      headers: { 'X-Shopify-Access-Token': adminToken, 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer: { id: customer.id, tags: tags.join(', ') } })
    });
  } catch (e) { /* non-fatal */ }
}

async function triggerKlaviyoTemplate(template, email, props = {}) {
  const klaviyoKey = Netlify.env.get('KLAVIYO_API_KEY');
  if (!klaviyoKey || !email) return;
  try {
    await fetch('https://a.klaviyo.com/api/events/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${klaviyoKey}`,
        'revision': '2024-10-15',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        data: {
          type: 'event',
          attributes: {
            properties: { template, ...props },
            metric: { data: { type: 'metric', attributes: { name: `Grimior: ${template}` } } },
            profile: { data: { type: 'profile', attributes: { email } } }
          }
        }
      })
    });
  } catch (e) {}
}

async function updateBlob(email, patch) {
  if (!email) return;
  try {
    const store = getStore('grimior-subscribers');
    const existing = (await store.get(email, { type: 'json' })) || {};
    await store.setJSON(email, { ...existing, ...patch, email, lastEventAt: new Date().toISOString() });
  } catch (e) {}
}

export default async (req) => {
  const raw = await req.text();
  const hmac = req.headers.get('x-recharge-hmac-sha256') || req.headers.get('X-Recharge-Hmac-Sha256');
  const secret = Netlify.env.get('RECHARGE_WEBHOOK_SECRET');

  if (!verifyRechargeHmac(raw, hmac, secret)) {
    return new Response('Invalid HMAC', { status: 401 });
  }

  let body;
  try { body = JSON.parse(raw); } catch (e) {
    return new Response('Invalid body', { status: 400 });
  }

  // Determine the event topic — ReCharge sends X-Recharge-Topic header, or topic in body.
  const topic = (req.headers.get('x-recharge-topic') || body.topic || '').toLowerCase();
  const customerEmail = (
    body.email ||
    (body.customer && body.customer.email) ||
    (body.subscription && body.subscription.email) ||
    (body.charge && body.charge.email) ||
    ''
  ).toLowerCase().trim();

  switch (topic) {
    case 'subscription/activated':
    case 'subscription/created': {
      const sub = body.subscription || body;
      await updateBlob(customerEmail, {
        active: true, status: 'active',
        subscriptionId: sub.id, customerId: sub.customer_id,
        nextChargeAt: sub.next_charge_scheduled_at || null,
        createdAt: sub.created_at || new Date().toISOString()
      });
      await shopifyTagCustomer(customerEmail, 'add');
      await triggerKlaviyoTemplate('grimior-welcome', customerEmail, { renewal_date: sub.next_charge_scheduled_at });
      // Schedule access confirmation 30 minutes later — Klaviyo flow handles delay.
      await triggerKlaviyoTemplate('grimior-access', customerEmail, {});
      break;
    }
    case 'subscription/cancelled':
    case 'subscription/deactivated': {
      const sub = body.subscription || body;
      await updateBlob(customerEmail, {
        active: false, status: 'cancelled',
        accessUntil: sub.next_charge_scheduled_at || null
      });
      await shopifyTagCustomer(customerEmail, 'remove');
      await triggerKlaviyoTemplate('grimior-cancelled', customerEmail, { access_until: sub.next_charge_scheduled_at });
      break;
    }
    case 'charge/paid':
    case 'charge/success': {
      const charge = body.charge || body;
      await updateBlob(customerEmail, {
        active: true, status: 'active',
        lastChargeAt: charge.processed_at || new Date().toISOString(),
        nextChargeAt: charge.scheduled_at || null
      });
      await triggerKlaviyoTemplate('grimior-renewal', customerEmail, { amount: '3.33', month: new Date().toLocaleString('en-US', { month: 'long' }) });
      break;
    }
    case 'charge/failed':
    case 'charge/error': {
      await updateBlob(customerEmail, {
        active: false, status: 'payment_failed'
      });
      await shopifyTagCustomer(customerEmail, 'remove');
      await triggerKlaviyoTemplate('grimior-failed-payment', customerEmail, {});
      break;
    }
    case 'charge/upcoming': {
      const charge = body.charge || body;
      await triggerKlaviyoTemplate('grimior-reminder', customerEmail, {
        renewal_date: charge.scheduled_at,
        amount: '3.33'
      });
      break;
    }
    default:
      // Unhandled — acknowledge
      break;
  }

  return Response.json({ ok: true, topic });
};

export const config = {
  path: '/api/webhook-recharge',
  method: 'POST'
};
