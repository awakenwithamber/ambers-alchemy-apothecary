// netlify/functions/shopify-checkout.js
// Creates a Shopify checkout from cart items and returns the secure checkout URL.
// Environment variables required in Netlify:
//   SHOPIFY_STORE_DOMAIN  — e.g. ambers-alchemy.myshopify.com
//   SHOPIFY_STOREFRONT_TOKEN — Storefront API access token (public-safe)

const SHOPIFY_DOMAIN   = process.env.SHOPIFY_STORE_DOMAIN;
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;
const API_URL          = `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`;

// ─── Shopify handle → known variant lookup (populated after product import) ───
// After you import your CSV and publish products, replace "REPLACE_ME" values
// with the real Shopify variant IDs from Products → each product → copy variant ID.
// Format: "product-handle": "gid://shopify/ProductVariant/NUMBERS"
const VARIANT_MAP = {
  "the-gentle-detox-ritual":      "REPLACE_ME",
  "the-stress-relief-ritual":     "REPLACE_ME",
  "the-focus-clarity-ritual":     "REPLACE_ME",
  "the-happy-calm-ritual":        "REPLACE_ME",
  "the-energized-focused-ritual": "REPLACE_ME",
  "lavender-fairy-dream-soap":    "REPLACE_ME",
  "gaias-rose-soap":              "REPLACE_ME",
  "eucalyptus-mint-spa-renewal-soap": "REPLACE_ME",
  "warm-cinnamon-comfort-soap":   "REPLACE_ME",
  "orange-lily-goddess-soap":     "REPLACE_ME",
  "citrus-goddess-glow-soap":     "REPLACE_ME",
  "sacred-forest-ritual-soap":    "REPLACE_ME",
  "fresh-mountain-air-soap":      "REPLACE_ME",
  "sunlit-garden-bloom-soap":     "REPLACE_ME",
  "soap-full-collection-9-bars":  "REPLACE_ME",
  "custom-herbal-tea-bags":       "REPLACE_ME",
  "custom-loose-leaf-blend":      "REPLACE_ME",
  "custom-herbal-tincture":       "REPLACE_ME",
  "custom-herbal-balm":           "REPLACE_ME",
  "custom-herbal-salve":          "REPLACE_ME",
  "custom-botanical-serum":       "REPLACE_ME",
  "custom-herbal-capsules":       "REPLACE_ME",
};

// ─── GraphQL: look up a product variant by handle ────────────────────────────
async function getVariantByHandle(handle) {
  const query = `
    query getVariant($handle: String!) {
      productByHandle(handle: $handle) {
        id
        title
        variants(first: 1) {
          edges {
            node {
              id
              price { amount currencyCode }
              availableForSale
            }
          }
        }
      }
    }
  `;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables: { handle } }),
  });

  const { data } = await res.json();
  const variant = data?.productByHandle?.variants?.edges?.[0]?.node;
  return variant?.id || null;
}

// ─── GraphQL: create Shopify checkout ────────────────────────────────────────
async function createShopifyCheckout(lineItems, customerNote, email) {
  const mutation = `
    mutation checkoutCreate($input: CheckoutCreateInput!) {
      checkoutCreate(input: $input) {
        checkout {
          id
          webUrl
          totalPriceV2 { amount currencyCode }
        }
        checkoutUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const input = {
    lineItems,
    note: customerNote || "",
    ...(email ? { email } : {}),
    customAttributes: [
      { key: "source", value: "ambers-alchemy-netlify" },
      { key: "payment_method", value: "card" }
    ],
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query: mutation, variables: { input } }),
  });

  const { data } = await res.json();
  return data?.checkoutCreate;
}

// ─── Main handler ─────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { items, note, email } = JSON.parse(event.body);

    if (!items || items.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "No items in cart" }) };
    }

    // Build Shopify line items
    const lineItems = [];

    for (const item of items) {
      let variantId = null;

      // 1. Try the local map first (fast, no API call needed)
      if (item.handle && VARIANT_MAP[item.handle] && VARIANT_MAP[item.handle] !== "REPLACE_ME") {
        variantId = VARIANT_MAP[item.handle];
      }

      // 2. Fall back to live Storefront API lookup by handle
      if (!variantId && item.handle) {
        variantId = await getVariantByHandle(item.handle);
      }

      if (variantId) {
        lineItems.push({ variantId, quantity: item.quantity || 1 });
      } else {
        // If we still can't find a variant, log it but don't break checkout
        console.warn(`Could not find Shopify variant for: ${item.handle || item.title}`);
      }
    }

    if (lineItems.length === 0) {
      return {
        statusCode: 422,
        headers,
        body: JSON.stringify({
          error: "Could not match cart items to Shopify products. Make sure products are published in Shopify and variant IDs are set in VARIANT_MAP.",
        }),
      };
    }

    const result = await createShopifyCheckout(lineItems, note, email);

    if (result?.checkoutUserErrors?.length > 0) {
      return {
        statusCode: 422,
        headers,
        body: JSON.stringify({ error: result.checkoutUserErrors[0].message }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        checkoutUrl: result?.checkout?.webUrl,
        total: result?.checkout?.totalPriceV2?.amount,
      }),
    };

  } catch (err) {
    console.error("Shopify checkout error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error. Please try again." }),
    };
  }
};
