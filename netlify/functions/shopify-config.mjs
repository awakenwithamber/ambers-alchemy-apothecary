// Shopify storefront configuration endpoint.
// Returns the Shopify domain + a minimal variant map so the client can
// build cart permalinks for checkout, subscriptions, and custom builders.
//
// Env vars read at runtime (all optional — missing values fall back to
// pending-manual-processing on the client):
//   SHOPIFY_DOMAIN                  (e.g. "ambers-alchemy.myshopify.com")
//   SHOPIFY_SUBSCRIPTION_VARIANT_ID ($3.33/month Grimior subscription)
//   SHOPIFY_CUSTOM_SOAP_VARIANT_ID  (custom soap builder)
//   SHOPIFY_CUSTOM_REMEDY_VARIANT_ID (custom remedy builder)
//
// Publishable keys are never returned — Shopify hosted checkout does not
// require a client-side secret for cart permalinks.

function cleanDomain(v) {
  return String(v || '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
}

export default async (req) => {
  const domain = cleanDomain(Netlify.env.get('SHOPIFY_DOMAIN'));
  const variants = {};
  const subVar = (Netlify.env.get('SHOPIFY_SUBSCRIPTION_VARIANT_ID') || '').trim();
  const soapVar = (Netlify.env.get('SHOPIFY_CUSTOM_SOAP_VARIANT_ID') || '').trim();
  const remedyVar = (Netlify.env.get('SHOPIFY_CUSTOM_REMEDY_VARIANT_ID') || '').trim();
  if (subVar) variants.__grimior_subscription = subVar;
  if (soapVar) variants.__custom_soap_builder = soapVar;
  if (remedyVar) variants.__custom_remedy_builder = remedyVar;
  return Response.json({
    domain,
    configured: !!domain,
    variants,
  }, {
    headers: { 'Cache-Control': 'public, max-age=60' },
  });
};

export const config = {
  path: '/api/shopify-config',
  method: 'GET',
};
