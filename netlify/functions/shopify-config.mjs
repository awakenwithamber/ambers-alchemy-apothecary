/**
 * shopify-config — returns Shopify Storefront credentials for the browser.
 *
 * When SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN are set as Netlify
 * environment variables, the browser can read them via GET /api/shopify-config
 * and enable the Shopify Buy Button / Checkout path. When the variables are
 * not set, the endpoint returns `configured: false` and the site falls back
 * to the existing Stripe + Venmo / Cash App flow without any user-visible error.
 *
 * Only the PUBLIC Storefront token is returned — never the Admin API token.
 */

export default async () => {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || '';
  const token = process.env.SHOPIFY_STOREFRONT_TOKEN || '';
  const checkoutReturn = process.env.SHOPIFY_CHECKOUT_RETURN_URL || '';

  const configured = Boolean(domain && token);

  return Response.json(
    {
      ok: true,
      configured,
      domain: configured ? domain : null,
      storefrontToken: configured ? token : null,
      checkoutReturnUrl: checkoutReturn || null,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json',
      },
    }
  );
};

export const config = {
  path: '/api/shopify-config',
};
