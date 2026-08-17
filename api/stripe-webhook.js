// api/stripe-webhook.js
// Dedicated Vercel serverless route for Stripe webhooks.
//
// Vercel must NOT parse the request body — Stripe webhook signature
// verification requires the raw body as a Buffer. We disable the body
// parser via the exported `config` object so req.body arrives as a
// raw Buffer, then delegate to the shared stripeWebhook handler.

const { stripeWebhook } = require('./stripe');

// Disable Vercel's built-in body parsing so we get the raw Buffer.
module.exports.config = {
  api: {
    bodyParser: false,
  },
};

module.exports = async function handler(req, res) {
  // With bodyParser:false, Vercel populates req.body as a Buffer.
  // The stripeWebhook handler reads `req.rawBody || req.body`, so
  // mirror the Buffer onto req.rawBody to make the fallback explicit
  // and robust regardless of how the handler accesses the raw body.
  if (req.body && !req.rawBody) {
    req.rawBody = req.body;
  }

  return stripeWebhook(req, res);
};
