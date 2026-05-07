// netlify/functions/shopify-checkout.js
// Creates a Shopify checkout from cart items and returns the webUrl
// Uses existing env vars: SHOPIFY_STORE_DOMAIN + SHOPIFY_STOREFRONT_TOKEN

const SHOPIFY_DOMAIN   = process.env.SHOPIFY_STORE_DOMAIN;
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;
const API_URL          = `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`;

const CORS = {
  'Access-Control-Allow-Origin':  'https://awakenagain.com',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

// ── Product ID → Shopify handle map ──────────────────────────────────────────
// These handles are auto-generated from product titles when imported.
// Format: lowercase, spaces → hyphens, special chars removed.
const HANDLE_MAP = {
  // ── Herbal Remedy Capsules ──
  'dreamease':              'dreamease-capsules',
  'chill-pill':             'chill-pill-capsules',
  'sacred-balance':         'sacred-balance-capsules',
  'vital-connect':          'vital-connect-capsules',
  'age-reversal-balm':      'age-reversal-balm',
  'pain-relief-balm':       'pain-relief-balm',
  'hair-serum':             'hair-serum',

  // ── Ritual Bundles ──
  'bundle-detox':           'gentle-detox-ritual',
  'bundle-stress':          'stress-relief-ritual',
  'bundle-focus':           'focus-clarity-ritual',
  'bundle-mood':            'happy-calm-ritual',
  'bundle-energy':          'energized-focused-ritual',

  // ── Signature Soaps ──
  'soap-lavender-fairy':    'lavender-fairy-dream',
  'soap-gaias-rose':        'gaias-rose',
  'soap-eucalyptus-mint':   'eucalyptus-mint-spa-renewal',
  'soap-cinnamon-comfort':  'warm-cinnamon-comfort',
  'soap-orange-lily':       'orange-lily-goddess',
  'soap-citrus-glow':       'citrus-goddess-glow',
  'soap-sacred-forest':     'sacred-forest-ritual',
  'soap-mountain-air':      'fresh-mountain-air',
  'soap-garden-bloom':      'sunlit-garden-bloom',

  // ── Custom / catch-all ──
  'custom-soap':            'custom-botanical-soap',
  'custom-remedy':          'custom-herbal-remedy',
  'custom-tea':             'custom-tea-blend',
  'custom-tincture':        'herbal-tincture',
  'custom-balm':            'herbal-balm',
  'custom-salve':           'herbal-salve',
  'custom-serum':           'botanical-serum',
  'custom-capsules':        'herbal-capsules',
  'custom-poultice':        'herbal-poultice',
};

// ── Get Shopify variant ID by product handle ──────────────────────────────────
async function getVariantByHandle(handle) {
  const query = `
    query getVariant($handle: String!) {
      productByHandle(handle: $handle) {
        variants(first: 1) {
          edges {
            node {
              id
              availableForSale
            }
          }
        }
      }
    }
  `;
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables: { handle } }),
  });
  const { data } = await res.json();
  const node = data?.productByHandle?.variants?.edges?.[0]?.node;
  return node?.availableForSale ? node.id : null;
}

// ── Create Shopify checkout ───────────────────────────────────────────────────
async function createCheckout(lineItems, customNote) {
  const mutation = `
    mutation checkoutCreate($input: CheckoutCreateInput!) {
      checkoutCreate(input: $input) {
        checkout {
          id
          webUrl
          totalPriceV2 { amount currencyCode }
        }
        checkoutUserErrors { code field message }
      }
    }
  `;
  const input = {
    lineItems,
    note: customNote || '',
    customAttributes: [
      { key: 'source', value: 'awakenagain-netlify' },
    ],
  };
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query: mutation, variables: { input } }),
  });
  const { data } = await res.json();
  const errors = data?.checkoutCreate?.checkoutUserErrors;
  if (errors?.length) throw new Error(errors.map(e => e.message).join(', '));
  return data?.checkoutCreate?.checkout?.webUrl;
}

// ── Handler ───────────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };

  if (!SHOPIFY_DOMAIN || !STOREFRONT_TOKEN) {
    return {
      statusCode: 503,
      headers: CORS,
      body: JSON.stringify({
        error: 'Shopify not configured. Add SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN in Netlify environment variables.',
      }),
    };
  }

  try {
    const { items, note } = JSON.parse(event.body);
    if (!items?.length) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'No items in cart' }) };

    const lineItems = [];
    const notFound  = [];

    for (const item of items) {
      // Try direct handle first, then look up from HANDLE_MAP
      const handle = HANDLE_MAP[item.id] || HANDLE_MAP[item.id?.toLowerCase()] || item.handle;
      if (!handle) { notFound.push(`unknown id: ${item.id}`); continue; }

      const variantId = await getVariantByHandle(handle);
      if (!variantId) {
        // Build a custom attribute line item using the catch-all custom product
        const customHandle = item.name?.toLowerCase().includes('soap') ? 'custom-botanical-soap' : 'custom-herbal-remedy';
        const fallbackId = await getVariantByHandle(customHandle);
        if (fallbackId) {
          const attrs = item.options
            ? Object.entries(item.options).map(([k, v]) => ({ key: k, value: String(v) }))
            : [];
          attrs.push({ key: '_item_name', value: item.name || 'Custom Item' });
          lineItems.push({ variantId: fallbackId, quantity: item.qty || 1, customAttributes: attrs });
        } else {
          notFound.push(handle);
        }
        continue;
      }

      const attrs = item.options
        ? Object.entries(item.options).map(([k, v]) => ({ key: k, value: String(v) }))
        : [];

      lineItems.push({ variantId, quantity: item.qty || 1, customAttributes: attrs });
    }

    if (notFound.length) {
      console.warn('Products not matched in Shopify:', notFound.join(', '));
    }

    if (!lineItems.length) {
      return {
        statusCode: 422,
        headers: CORS,
        body: JSON.stringify({ error: 'No products matched in Shopify. Check HANDLE_MAP in shopify-checkout.js.' }),
      };
    }

    const checkoutUrl = await createCheckout(lineItems, note);
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ url: checkoutUrl }) };

  } catch (err) {
    console.error('Shopify checkout error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
