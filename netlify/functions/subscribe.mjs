// subscribe.js — creates a Shopify customer + ReCharge subscription
// or returns the Shopify-hosted checkout URL for the $3.33/month subscription product.

import { getStore } from "@netlify/blobs";

export default async (req) => {
  let body = {};
  try { body = await req.json(); } catch (e) { body = {}; }

  const email = (body.email || '').toLowerCase().trim();
  const firstName = (body.first_name || body.firstName || '').trim();
  const lastName = (body.last_name || body.lastName || '').trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ ok: false, error: 'Valid email required.' }, { status: 400 });
  }

  const shop = Netlify.env.get('SHOPIFY_SHOP_DOMAIN');
  const adminToken = Netlify.env.get('SHOPIFY_ADMIN_API_TOKEN');
  const subscribeUrl = Netlify.env.get('GRIMIOR_SUBSCRIBE_CHECKOUT_URL');

  // 1. If a public subscribe checkout URL is configured, return it for direct redirect.
  if (subscribeUrl) {
    return Response.json({
      ok: true,
      checkoutUrl: `${subscribeUrl}${subscribeUrl.includes('?') ? '&' : '?'}checkout[email]=${encodeURIComponent(email)}`,
      email
    });
  }

  // 2. Otherwise create / tag the Shopify customer (subscription is finalized via Shopify checkout).
  if (!shop || !adminToken) {
    return Response.json({
      ok: false,
      error: 'Subscription gateway not yet configured. Please contact awaken@consultant.com.'
    }, { status: 503 });
  }

  try {
    // Find or create Shopify customer
    const lookup = await fetch(`https://${shop}/admin/api/2024-01/customers/search.json?query=email:${encodeURIComponent(email)}`, {
      headers: { 'X-Shopify-Access-Token': adminToken, 'Accept': 'application/json' }
    });
    const lookupJson = await lookup.json();
    let customer = (lookupJson.customers || [])[0];

    if (!customer) {
      const create = await fetch(`https://${shop}/admin/api/2024-01/customers.json`, {
        method: 'POST',
        headers: { 'X-Shopify-Access-Token': adminToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            email,
            first_name: firstName || undefined,
            last_name: lastName || undefined,
            tags: 'grimior-prospect',
            send_email_invite: false
          }
        })
      });
      const createJson = await create.json();
      customer = createJson.customer;
    }

    // Cache record for downstream functions
    try {
      const store = getStore('grimior-subscribers');
      await store.setJSON(email, {
        email,
        shopifyCustomerId: customer && customer.id,
        status: 'pending',
        active: false,
        createdAt: new Date().toISOString()
      });
    } catch (e) { /* non-fatal */ }

    return Response.json({
      ok: true,
      customerId: customer && customer.id,
      email,
      message: 'Customer record prepared. Please complete checkout in Shopify to finalize subscription.'
    });
  } catch (err) {
    return Response.json({ ok: false, error: 'Could not create subscription.' }, { status: 500 });
  }
};

export const config = {
  path: '/api/subscribe',
  method: 'POST'
};
