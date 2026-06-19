// netlify/functions/session-status.js
// Returns the status of a Stripe Checkout Session so the site can show an order
// confirmation after the embedded checkout completes.
//
// Requires the STRIPE_SECRET_KEY Netlify environment variable. Never hardcode keys.

const CORS = {
  'Access-Control-Allow-Origin':  'https://awakenagain.com',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return {
      statusCode: 503,
      headers: CORS,
      body: JSON.stringify({
        error: 'Stripe not configured. Set STRIPE_SECRET_KEY in Netlify environment variables.',
      }),
    };
  }

  const sessionId = event.queryStringParameters && event.queryStringParameters.session_id;
  if (!sessionId) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing session_id' }) };
  }

  try {
    const stripe = require('stripe')(secretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        status: session.status,                 // 'open' | 'complete' | 'expired'
        payment_status: session.payment_status, // 'paid' | 'unpaid' | 'no_payment_required'
        customer_email: session.customer_details ? session.customer_details.email : null,
        amount_total: session.amount_total,
      }),
    };
  } catch (err) {
    console.error('Stripe session-status error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
