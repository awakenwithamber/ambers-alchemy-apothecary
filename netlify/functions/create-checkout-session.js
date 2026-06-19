// netlify/functions/create-checkout-session.js
// Creates a Stripe EMBEDDED Checkout Session from the customer's cart and returns
// its client_secret. The embedded checkout renders on-site (ui_mode: 'embedded'),
// so the customer never leaves the page to a Stripe-hosted checkout.
//
// Requires the STRIPE_SECRET_KEY Netlify environment variable. Never hardcode keys.

const CORS = {
  'Access-Control-Allow-Origin':  'https://awakenagain.com',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

// Mirrors the cart/checkout math used on the site (app.js / js/cart.js):
// free shipping at $75+, otherwise $6.99, plus 8% tax.
function buildLineItems(items) {
  const lineItems = items.map((item) => {
    const unitAmount = Math.round(Number(item.price) * 100);
    if (!item.name || !Number.isFinite(unitAmount) || unitAmount <= 0) {
      throw new Error('Invalid cart item.');
    }
    return {
      quantity: Math.max(1, parseInt(item.qty, 10) || 1),
      price_data: {
        currency: 'usd',
        unit_amount: unitAmount,
        product_data: {
          name: String(item.name).slice(0, 250),
        },
      },
    };
  });

  const subtotal = items.reduce((sum, i) => sum + Number(i.price) * (parseInt(i.qty, 10) || 1), 0);
  const shipping = subtotal >= 75 ? 0 : 6.99;
  const tax = subtotal * 0.08;

  if (shipping > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(shipping * 100),
        product_data: { name: 'Shipping' },
      },
    });
  }

  if (tax > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(tax * 100),
        product_data: { name: 'Sales Tax (8%)' },
      },
    });
  }

  return lineItems;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') {
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

  try {
    const stripe = require('stripe')(secretKey);
    const { items } = JSON.parse(event.body || '{}');

    if (!Array.isArray(items) || items.length === 0) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'No items in cart' }) };
    }

    const lineItems = buildLineItems(items);

    // Return the shopper to the site after payment (stays on our domain).
    const origin = event.headers.origin || process.env.URL || '';
    const returnUrl = `${origin}/?checkout=complete&session_id={CHECKOUT_SESSION_ID}`;

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'payment',
      line_items: lineItems,
      return_url: returnUrl,
      automatic_tax: { enabled: false },
    });

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ clientSecret: session.client_secret }) };
  } catch (err) {
    console.error('Stripe create-checkout-session error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
