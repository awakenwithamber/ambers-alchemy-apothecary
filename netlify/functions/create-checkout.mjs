// Creates a Shopify cart via the Storefront API and returns the hosted
// checkout URL. Tokens stay server-side and are never exposed to the client.
//
// Required environment variables (set in Netlify UI):
//   SHOPIFY_STOREFRONT_TOKEN  Public Storefront API access token
//   SHOPIFY_STORE_DOMAIN      e.g. "my-shop.myshopify.com"
//
// Request body:
//   {
//     "items": [
//       { "variantId": "gid://shopify/ProductVariant/123", "quantity": 1,
//         "title": "Optional item name shown in custom attributes" }
//     ],
//     "email": "optional@buyer.com",
//     "note": "optional order note",
//     "returnTo": "https://awakenagain.com/thank-you"
//   }
//
// Response: { "checkoutUrl": "https://.../checkouts/..." }

const API_VERSION = '2024-10';

function bad(status, message) {
  return Response.json({ error: message }, { status });
}

function normaliseVariantId(id) {
  if (!id) return null;
  const raw = String(id).trim();
  if (!raw) return null;
  if (raw.startsWith('gid://shopify/ProductVariant/')) return raw;
  if (/^\d+$/.test(raw)) return `gid://shopify/ProductVariant/${raw}`;
  return raw;
}

export default async (req) => {
  if (req.method !== 'POST') {
    return bad(405, 'Method not allowed');
  }

  const token = Netlify.env.get('SHOPIFY_STOREFRONT_TOKEN');
  const domain = Netlify.env.get('SHOPIFY_STORE_DOMAIN');

  if (!token || !domain) {
    return bad(
      500,
      'Card checkout is not configured yet. Please set SHOPIFY_STOREFRONT_TOKEN and SHOPIFY_STORE_DOMAIN in Netlify, or use Venmo / Cash App.'
    );
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return bad(400, 'Invalid JSON body');
  }

  const rawItems = Array.isArray(payload?.items) ? payload.items : [];
  const lines = [];
  const skipped = [];

  for (const item of rawItems) {
    const variantId = normaliseVariantId(item?.variantId || item?.merchandiseId);
    const quantity = Math.max(1, parseInt(item?.quantity, 10) || 1);
    if (!variantId) {
      skipped.push(item?.title || 'unnamed item');
      continue;
    }
    const attributes = [];
    if (item?.title) attributes.push({ key: 'Item', value: String(item.title).slice(0, 250) });
    if (item?.note) attributes.push({ key: 'Note', value: String(item.note).slice(0, 250) });
    lines.push({ merchandiseId: variantId, quantity, attributes });
  }

  if (!lines.length) {
    return bad(
      400,
      skipped.length
        ? 'None of the cart items are linked to a Shopify product yet. Add a Shopify variant ID to each product or pay by Venmo / Cash App.'
        : 'Cart is empty.'
    );
  }

  const buyerIdentity = {};
  if (payload?.email && typeof payload.email === 'string') {
    buyerIdentity.email = payload.email.trim().slice(0, 250);
  }

  const note = typeof payload?.note === 'string' ? payload.note.slice(0, 2000) : undefined;

  const query = `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart { id checkoutUrl }
        userErrors { field message }
      }
    }
  `;

  const input = { lines };
  if (Object.keys(buyerIdentity).length) input.buyerIdentity = buyerIdentity;
  if (note) input.note = note;

  const endpoint = `https://${domain.replace(/^https?:\/\//, '').replace(/\/+$/, '')}/api/${API_VERSION}/graphql.json`;

  let shopifyResponse;
  try {
    shopifyResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
        Accept: 'application/json',
      },
      body: JSON.stringify({ query, variables: { input } }),
    });
  } catch {
    return bad(502, 'Could not reach Shopify. Please try again or use Venmo / Cash App.');
  }

  if (!shopifyResponse.ok) {
    return bad(502, `Shopify rejected the request (${shopifyResponse.status}).`);
  }

  let json;
  try {
    json = await shopifyResponse.json();
  } catch {
    return bad(502, 'Unexpected response from Shopify.');
  }

  if (json?.errors?.length) {
    return bad(502, json.errors[0]?.message || 'Shopify API error.');
  }

  const userErrors = json?.data?.cartCreate?.userErrors || [];
  if (userErrors.length) {
    return bad(400, userErrors[0]?.message || 'Shopify could not build this cart.');
  }

  const checkoutUrl = json?.data?.cartCreate?.cart?.checkoutUrl;
  if (!checkoutUrl) {
    return bad(502, 'Shopify did not return a checkout URL.');
  }

  const returnTo = typeof payload?.returnTo === 'string' ? payload.returnTo : '';
  const finalUrl = returnTo ? `${checkoutUrl}${checkoutUrl.includes('?') ? '&' : '?'}return_to=${encodeURIComponent(returnTo)}` : checkoutUrl;

  return Response.json({
    checkoutUrl: finalUrl,
    skipped: skipped.length ? skipped : undefined,
  });
};

export const config = {
  path: '/api/create-checkout',
  method: 'POST',
};
