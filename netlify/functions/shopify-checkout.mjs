// Creates a Shopify Storefront cart from local cart items and returns the
// hosted checkoutUrl. Falls back to the storefront home page if the
// Storefront API can't be reached or no items resolve to a variant.

const STOREFRONT_API_VERSION = '2024-10';

function storeDomain() {
  return Netlify.env.get('SHOPIFY_STORE_DOMAIN') || 'awakenagain-2.myshopify.com';
}

function storefrontToken() {
  return Netlify.env.get('SHOPIFY_STOREFRONT_ACCESS_TOKEN') || '';
}

async function gql(query, variables) {
  const domain = storeDomain();
  const token = storefrontToken();
  if (!token) throw new Error('Storefront access token not configured');
  const res = await fetch(`https://${domain}/api/${STOREFRONT_API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });
  const data = await res.json();
  if (data.errors) throw new Error(data.errors.map(e => e.message).join('; '));
  return data.data;
}

async function findVariantIdByTitle(title) {
  const query = `query($q: String!) { products(first: 1, query: $q) { edges { node { variants(first: 1) { edges { node { id } } } } } } }`;
  try {
    const data = await gql(query, { q: `title:${JSON.stringify(title)}` });
    const edge = data?.products?.edges?.[0];
    const v = edge?.node?.variants?.edges?.[0]?.node?.id;
    return v || null;
  } catch (e) {
    return null;
  }
}

async function createCart(lines, attributes, discountCodes, note, buyer) {
  const mutation = `mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { id checkoutUrl }
      userErrors { field message }
    }
  }`;
  const input = { lines, attributes, note };
  if (discountCodes && discountCodes.length) input.discountCodes = discountCodes;
  if (buyer && buyer.email) input.buyerIdentity = { email: buyer.email };
  const data = await gql(mutation, { input });
  if (data?.cartCreate?.userErrors?.length) {
    throw new Error(data.cartCreate.userErrors.map(e => e.message).join('; '));
  }
  return data?.cartCreate?.cart;
}

export default async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') return new Response('', { headers: cors });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: cors });
  }

  let body = {};
  try { body = await req.json(); } catch (e) { body = {}; }
  const items = Array.isArray(body.items) ? body.items : [];
  const promo = (body.promoCode || '').trim();
  const note = (body.note || '').slice(0, 1000);
  const buyer = body.buyer || {};

  const fallbackUrl = `https://${storeDomain().replace(/^awakenagain-2\.myshopify\.com$/, 'awakenagain-2.myshopify.com')}`;

  if (!storefrontToken()) {
    return new Response(JSON.stringify({
      checkoutUrl: `https://${storeDomain()}`,
      warning: 'Storefront API token is not yet configured; sending shopper to the Shopify storefront. Set SHOPIFY_STOREFRONT_ACCESS_TOKEN in Netlify to enable cart-aware checkout.',
    }), { headers: cors });
  }

  try {
    const lines = [];
    const unmatched = [];
    for (const it of items) {
      const qty = Math.max(1, parseInt(it.qty || 1, 10));
      let merchandiseId = it.variantId || it.merchandiseId || null;
      if (!merchandiseId && it.name) {
        merchandiseId = await findVariantIdByTitle(it.name);
      }
      if (merchandiseId) {
        lines.push({ merchandiseId, quantity: qty });
      } else {
        unmatched.push(`${it.name} x${qty}${it.price ? ` ($${Number(it.price).toFixed(2)})` : ''}`);
      }
    }

    const attributes = [];
    if (unmatched.length) {
      attributes.push({ key: 'Custom Items', value: unmatched.join(' | ').slice(0, 250) });
    }
    if (note) attributes.push({ key: 'Order Notes', value: note.slice(0, 250) });

    const fullNote = [
      unmatched.length ? `Custom items: ${unmatched.join(' | ')}` : '',
      note ? `Notes: ${note}` : '',
    ].filter(Boolean).join('\n');

    if (!lines.length) {
      // Nothing matched a Shopify variant — send shopper to the storefront with note attributes encoded in URL.
      return new Response(JSON.stringify({
        checkoutUrl: `https://${storeDomain()}`,
        warning: 'No cart items mapped to Shopify variants; sending shopper to the storefront homepage.',
        unmatched,
      }), { headers: cors });
    }

    const cart = await createCart(
      lines,
      attributes,
      promo ? [promo] : [],
      fullNote,
      buyer
    );
    if (!cart || !cart.checkoutUrl) throw new Error('No checkout URL returned');

    return new Response(JSON.stringify({ checkoutUrl: cart.checkoutUrl, unmatched }), { headers: cors });
  } catch (err) {
    return new Response(JSON.stringify({
      checkoutUrl: `https://${storeDomain()}`,
      error: 'Shopify cart creation failed; falling back to storefront homepage.',
      message: err.message,
    }), { status: 200, headers: cors });
  }
};

export const config = { path: '/api/shopify-checkout' };
