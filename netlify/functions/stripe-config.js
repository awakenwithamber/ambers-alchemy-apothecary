// netlify/functions/stripe-config.js
// Returns the Stripe publishable key (safe to expose to the browser).
// The key is read from the STRIPE_PUBLISHABLE_KEY Netlify environment variable —
// never hardcode keys here.

const CORS = {
  'Access-Control-Allow-Origin':  'https://awakenagain.com',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };

  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    return {
      statusCode: 503,
      headers: CORS,
      body: JSON.stringify({
        error: 'Stripe not configured. Set STRIPE_PUBLISHABLE_KEY in Netlify environment variables.',
      }),
    };
  }

  return { statusCode: 200, headers: CORS, body: JSON.stringify({ publishableKey }) };
};
