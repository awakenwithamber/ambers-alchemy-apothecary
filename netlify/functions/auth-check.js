// netlify/functions/auth-check.js
// Grimior paywall — checks Shopify for active subscription orders
// Uses SHOPIFY_STORE_DOMAIN + SHOPIFY_ADMIN_TOKEN (Admin API, not Storefront)
// GET /.netlify/functions/auth-check?email=xxx

const https = require('https');

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const ADMIN_TOKEN    = process.env.SHOPIFY_ADMIN_TOKEN; // Admin API token (different from Storefront)

const CORS = {
  'Access-Control-Allow-Origin':  'https://awakenagain.com',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };

  const { email } = event.queryStringParameters || {};

  if (!email) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ access: false, error: 'Email required' }) };
  }

  // ── Admin always gets full access ──
  if (email.toLowerCase() === 'awaken@consultant.com') {
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ access: true, tier: 'admin' }) };
  }

  if (!SHOPIFY_DOMAIN || !ADMIN_TOKEN) {
    console.error('Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_TOKEN env vars');
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ access: false, error: 'Auth service unavailable' }) };
  }

  try {
    // ── Look up customer by email in Shopify ──
    const customers = await shopifyGet(
      `/admin/api/2024-01/customers/search.json?query=email:${encodeURIComponent(email)}&limit=1`
    );

    if (!customers.customers || customers.customers.length === 0) {
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ access: false, tier: 'none' }) };
    }

    const customer = customers.customers[0];
    const customerId = customer.id;

    // ── Check if customer has orders tagged as "grimior-subscription" ──
    // OR check if they have placed any order for the Grimior subscription product
    const orders = await shopifyGet(
      `/admin/api/2024-01/customers/${customerId}/orders.json?status=any&limit=50`
    );

    let hasActiveSubscription = false;

    if (orders.orders && orders.orders.length > 0) {
      hasActiveSubscription = orders.orders.some(order => {
        // Check order tags for subscription marker
        const tags = (order.tags || '').toLowerCase();
        if (tags.includes('grimior') || tags.includes('subscription')) return true;

        // Check line items for Grimior subscription product
        return (order.line_items || []).some(item => {
          const title = (item.title || '').toLowerCase();
          const sku   = (item.sku || '').toLowerCase();
          return (
            title.includes('grimior') ||
            title.includes('subscription') ||
            sku.includes('grimior') ||
            sku.includes('sub-333')
          );
        });
      });
    }

    // ── Also check customer tags (set manually or via subscription app) ──
    const customerTags = (customer.tags || '').toLowerCase();
    if (customerTags.includes('grimior') || customerTags.includes('subscriber')) {
      hasActiveSubscription = true;
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        access: hasActiveSubscription,
        tier: hasActiveSubscription ? 'subscriber' : 'none',
      }),
    };

  } catch (err) {
    console.error('Auth check error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ access: false, error: 'Auth check failed' }) };
  }
};

// ── Shopify Admin API GET helper ──────────────────────────────────────────────
function shopifyGet(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SHOPIFY_DOMAIN,
      path,
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': ADMIN_TOKEN,
        'Content-Type': 'application/json',
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}
