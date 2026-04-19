// Netlify serverless function — creates a Shopify hosted checkout session.
//
// Uses the Shopify Storefront API (cartCreate mutation) to build a cart on the
// server and returns the hosted checkout URL. Credentials stay server-side.
//
// Environment variables (set in Netlify → Site configuration → Environment):
//   SHOPIFY_STORE_DOMAIN      e.g. "your-store.myshopify.com"
//   SHOPIFY_STOREFRONT_TOKEN  Storefront API access token
//
// Request (POST JSON):
//   {
//     "items": [
//       { "variantId": "gid://shopify/ProductVariant/123", "quantity": 2, "title": "optional label" }
//     ],
//     "email": "optional@buyer.com",
//     "note": "optional order note",
//     "returnTo": "https://example.com/thank-you"
//   }
//
// Response: { "checkoutUrl": "https://your-store.myshopify.com/cart/c/..." }

const API_VERSION = '2024-10';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  ...CORS_HEADERS,
};

function respond(statusCode, body) {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  };
}

function normaliseVariantId(id) {
  if (id === undefined || id === null) return null;
  const raw = String(id).trim();
  if (!raw) return null;
  if (raw.startsWith('gid://shopify/ProductVariant/')) return raw;
  if (/^\d+$/.test(raw)) return `gid://shopify/ProductVariant/${raw}`;
  return raw;
}

function cleanDomain(domain) {
  return String(domain || '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '');
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return respond(405, { error: 'Method not allowed. Use POST.' });
  }

  const domain = cleanDomain(process.env.SHOPIFY_STORE_DOMAIN);
  const token = (process.env.SHOPIFY_STOREFRONT_TOKEN || '').trim();

  if (!domain || !token) {
    return respond(500, {
      error:
        'Card checkout is not configured. Please set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN in Netlify environment variables.',
    });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return respond(400, { error: 'Invalid JSON body.' });
  }

  const rawItems = Array.isArray(payload.items) ? payload.items : [];
  const lines = [];
  const skipped = [];

  for (const item of rawItems) {
    const variantId = normaliseVariantId(item && (item.variantId || item.merchandiseId || item.id));
    const quantity = Math.max(1, parseInt(item && item.quantity, 10) || 1);
    if (!variantId) {
      skipped.push((item && item.title) || 'unnamed item');
      continue;
    }
    const attributes = [];
    if (item && item.title) {
      attributes.push({ key: 'Item', value: String(item.title).slice(0, 250) });
    }
    if (item && item.note) {
      attributes.push({ key: 'Note', value: String(item.note).slice(0, 250) });
    }
    lines.push({ merchandiseId: variantId, quantity, attributes });
  }

  if (!lines.length) {
    return respond(400, {
      error: skipped.length
        ? 'No cart items have a Shopify variant ID. Add a Shopify variant ID to each product before using card checkout.'
        : 'Cart is empty.',
      skipped: skipped.length ? skipped : undefined,
    });
  }

  const input = { lines };

  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  if (email) input.buyerIdentity = { email: email.slice(0, 250) };

  const note = typeof payload.note === 'string' ? payload.note.slice(0, 2000) : '';
  if (note) input.note = note;

  const query = `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart { id checkoutUrl }
        userErrors { field message }
      }
    }
  `;

  const endpoint = `https://${domain}/api/${API_VERSION}/graphql.json`;

  let shopifyResponse;
  try {
    shopifyResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({ query, variables: { input } }),
    });
  } catch {
    return respond(502, { error: 'Could not reach Shopify. Please try again in a moment.' });
  }

  if (!shopifyResponse.ok) {
    return respond(502, {
      error: `Shopify rejected the request (HTTP ${shopifyResponse.status}).`,
    });
  }

  let json;
  try {
    json = await shopifyResponse.json();
  } catch {
    return respond(502, { error: 'Unexpected response from Shopify.' });
  }

  if (Array.isArray(json.errors) && json.errors.length) {
    return respond(502, { error: json.errors[0].message || 'Shopify API error.' });
  }

  const userErrors = (json.data && json.data.cartCreate && json.data.cartCreate.userErrors) || [];
  if (userErrors.length) {
    return respond(400, { error: userErrors[0].message || 'Shopify could not build this cart.' });
  }

  const checkoutUrl =
    json.data && json.data.cartCreate && json.data.cartCreate.cart && json.data.cartCreate.cart.checkoutUrl;

  if (!checkoutUrl) {
    return respond(502, { error: 'Shopify did not return a checkout URL.' });
  }

  let finalUrl = checkoutUrl;
  const returnTo = typeof payload.returnTo === 'string' ? payload.returnTo.trim() : '';
  if (returnTo) {
    const separator = checkoutUrl.includes('?') ? '&' : '?';
    finalUrl = `${checkoutUrl}${separator}return_to=${encodeURIComponent(returnTo)}`;
  }

  return respond(200, {
    checkoutUrl: finalUrl,
    skipped: skipped.length ? skipped : undefined,
  });
};
