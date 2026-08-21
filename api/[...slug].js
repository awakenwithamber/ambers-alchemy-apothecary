// api/[...slug].js
// Vercel catch-all serverless function that mirrors every route from the
// original Express server.js — EXCEPT /api/stripe-webhook, which lives in its
// own dedicated file (api/stripe-webhook.js) so it can receive the raw body.
//
// All existing api/*.js modules export Express-style (req, res) handlers and
// use CommonJS, which Vercel serverless functions are compatible with. This
// file simply wires req.method + the URL path to the correct handler, applies
// the admin.requireAdmin middleware to protected admin routes, and issues
// 307 redirects for the legacy /.netlify/functions/* paths (forwarded here via
// vercel.json rewrites → /api/netlify/*).
//
// CommonJS throughout to match the existing modules.

const reviewsApi = require('./reviews');
const quizLeadApi = require('./quiz-lead');
const submissionApi = require('./submission-created');
const formSubmitApi = require('./form-submit');
const grimoireAuth = require('./grimoire-auth');
const stripeApi = require('./stripe');
const adminApi = require('./admin');
const emailApi = require('./email');
const aiApi = require('./ai');

// ── CORS (mirrors server.js) ─────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://awakenagain.com',
  process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null,
].filter(Boolean);

function applyCors(req, res) {
  const origin = req.headers && req.headers.origin;
  if (!origin || ALLOWED_ORIGINS.some((o) => origin === o) || process.env.NODE_ENV !== 'production') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

// ── Body parsing safety net ──────────────────────────────────────────────────
// Vercel's Node runtime auto-parses application/json into req.body, but a few
// handlers read req.body defensively. Ensure it's always an object so they
// don't throw on `req.body || {}`.
function ensureBody(req) {
  if (req.body === undefined || req.body === null) {
    req.body = {};
  } else if (typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch {
      req.body = {};
    }
  }
}

// ── Netlify-function event adapter (for auth-check) ──────────────────────────
function makeEvent(req) {
  return {
    httpMethod: req.method,
    queryStringParameters: req.query || {},
    headers: req.headers,
    body: req.body && Object.keys(req.body).length ? JSON.stringify(req.body) : req.body || null,
    rawUrl: req.url,
    path: req.pathname,
  };
}

// Small wrapper that turns a Netlify-style (event) => {statusCode, headers, body}
// handler into an Express-style (req, res) one.
function runCjsHandler(handlerModule, req, res) {
  return Promise.resolve(handlerModule.handler(makeEvent(req))).then((result) => {
    Object.entries(result.headers || {}).forEach(([k, v]) => res.setHeader(k, v));
    res.status(result.statusCode || 200).send(result.body || '');
  });
}

// ── Main handler ─────────────────────────────────────────────────────────────
module.exports = async (req, res) => {
  applyCors(req, res);

  // Preflight
  if (req.method === 'OPTIONS') return res.status(200).end();

  ensureBody(req);

  // Parse the path & query. req.url in Vercel is the full path+querystring
  // for the matched /api/* route (e.g. "/api/reviews/abc?x=1").
  const parsed = new URL(req.url, 'http://localhost');
  const path = parsed.pathname; // e.g. "/api/reviews/abc"
  const method = (req.method || 'GET').toUpperCase();

  // ── Exclude stripe-webhook (handled by api/stripe-webhook.js) ──────────────
  if (path === '/api/stripe-webhook') {
    return res.status(404).json({ error: 'Not found' });
  }

  // Helper: run an Express-style handler, catching errors.
  const run = (handler) =>
    Promise.resolve(handler(req, res)).catch((e) => {
      console.error('[catch-all]', path, e.message);
      if (!res.headersSent) res.status(500).json({ error: e.message });
    });

  // Helper: run requireAdmin then the handler.
  const runProtected = (handler) =>
    new Promise((resolve) => {
      adminApi.requireAdmin(req, res, () => {
        resolve(run(handler));
      });
    });

  try {
    // ─────────────────────────────────────────────────────────────────────
    // Reviews — public
    // ─────────────────────────────────────────────────────────────────────
    if (path === '/api/reviews') {
      if (method === 'GET') return run(reviewsApi.list);
      if (method === 'POST') return run(reviewsApi.create);
    }

    if (path === '/api/reviews/stats' && method === 'GET') return run(reviewsApi.stats);
    if (path === '/api/reviews/featured' && method === 'GET') return run(reviewsApi.featured);
    if (path === '/api/reviews/helpful' && method === 'POST') return run(reviewsApi.helpful);

    // Reviews — admin (token-gated inside the handlers themselves)
    if (path === '/api/reviews/admin' && method === 'GET') return run(reviewsApi.adminList);
    if (path === '/api/reviews/export' && method === 'GET') return run(reviewsApi.adminExport);

    // Reviews — by id: /api/reviews/:id  (PATCH update / DELETE)
    if (path.startsWith('/api/reviews/')) {
      const id = decodeURIComponent(path.slice('/api/reviews/'.length));
      // Avoid matching the sub-routes already handled above.
      if (id && id !== 'stats' && id !== 'featured' && id !== 'helpful' && id !== 'admin' && id !== 'export') {
        req.params = { id };
        if (method === 'PATCH') return run(reviewsApi.adminUpdate);
        if (method === 'DELETE') return run(reviewsApi.adminDelete);
      }
    }

    // ─────────────────────────────────────────────────────────────────────
    // Quiz leads
    // ─────────────────────────────────────────────────────────────────────
    if (path === '/api/quiz-lead' && method === 'POST') return run(quizLeadApi.submit);

    // ─────────────────────────────────────────────────────────────────────
    // Grimoire OTP authentication
    // ─────────────────────────────────────────────────────────────────────
    if (path === '/api/grimoire-otp/request' && method === 'POST') return run(grimoireAuth.requestOtp);
    if (path === '/api/grimoire-otp/verify' && method === 'POST') return run(grimoireAuth.verifyOtp);

    // ─────────────────────────────────────────────────────────────────────
    // Stripe payments (webhook excluded — own file)
    // ─────────────────────────────────────────────────────────────────────
    if (path === '/api/stripe-publishable-key' && method === 'GET') return run(stripeApi.publishableKey);
    if (path === '/api/create-payment-intent' && method === 'POST') return run(stripeApi.createPaymentIntent);
    if (path === '/api/grimoire-subscribe' && method === 'POST') return run(stripeApi.grimoireSubscribe);
    if (path === '/api/grimoire-activate' && method === 'POST') return run(stripeApi.grimoireActivate);

    // ─────────────────────────────────────────────────────────────────────
    // Order submission & site forms
    // ─────────────────────────────────────────────────────────────────────
    if (path === '/api/submission-created' && method === 'POST') return run(submissionApi.handle);
    if (path === '/api/form-submit' && method === 'POST') return run(formSubmitApi.submit);

    // ─────────────────────────────────────────────────────────────────────
    // Admin dashboard (JWT-protected)
    // ─────────────────────────────────────────────────────────────────────
    if (path === '/api/admin/login' && method === 'POST') return run(adminApi.login);
    if (path === '/api/admin/summary' && method === 'GET') return runProtected(adminApi.summary);
    if (path === '/api/admin/orders' && method === 'GET') return runProtected(adminApi.orders);
    if (path === '/api/admin/submissions' && method === 'GET') return runProtected(adminApi.submissions);
    if (path === '/api/admin/leads' && method === 'GET') return runProtected(adminApi.leads);
    if (path === '/api/admin/subscribers' && method === 'GET') return runProtected(adminApi.subscribers);
    if (path === '/api/admin/reviews' && method === 'GET') return runProtected(adminApi.reviews);
    if (path === '/api/admin/email-stats' && method === 'GET') return runProtected(emailApi.stats);
    if (path === '/api/admin/send-promo' && method === 'POST') return runProtected(emailApi.adminSendPromo);

    // ─────────────────────────────────────────────────────────────────────
    // Unsubscribe (public, GET with query params)
    // vercel.json rewrites "/unsubscribe" → "/api/unsubscribe"
    // ─────────────────────────────────────────────────────────────────────
    if (path === '/api/unsubscribe' && method === 'GET') return run(emailApi.unsubscribe);

    // ─────────────────────────────────────────────────────────────────────
    // AI herbal advisor (Vercel AI Gateway — VERCEL_OIDC_TOKEN)
    // ─────────────────────────────────────────────────────────────────────
    if (path === '/api/ai/chat' && method === 'POST') return run(aiApi.chat);

    // ─────────────────────────────────────────────────────────────────────
    // Legacy /.netlify/functions/* routes
    // vercel.json rewrites forward these to /api/netlify/<name>, where we
    // either redirect (307) to the new /api/* route or handle inline.
    // ─────────────────────────────────────────────────────────────────────
    if (path.startsWith('/api/netlify/')) {
      const legacyName = path.slice('/api/netlify/'.length);
      const search = parsed.search; // preserves ?query

      // auth-check: kept for backwards-compat, always returns access:false
      if (legacyName === 'auth-check') {
        const authCheck = require('../netlify/functions/auth-check');
        return run(() => runCjsHandler(authCheck, req, res));
      }

      // form-relay: behaves like form-submit for POST
      if (legacyName === 'form-relay') {
        if (method === 'POST') return run(formSubmitApi.submit);
        return res.status(200).end();
      }

      // review-reminders: handled server-side via scheduled tasks
      if (legacyName === 'review-reminders') {
        return res
          .status(200)
          .json({ ok: true, message: 'Review reminders are handled server-side via scheduled tasks.' });
      }

      // Simple 307 redirects to the new canonical /api/* routes
      if (legacyName === 'reviews') {
        return res.redirect(307, '/api/reviews' + search);
      }
      if (legacyName === 'quiz-lead') {
        return res.redirect(307, '/api/quiz-lead' + search);
      }
      if (legacyName === 'submission-created') {
        return res.redirect(307, '/api/submission-created' + search);
      }
    }

    // ─────────────────────────────────────────────────────────────────────
    // No route matched
    // ─────────────────────────────────────────────────────────────────────
    return res.status(404).json({ error: 'Not found', path });
  } catch (e) {
    console.error('[catch-all error]', path, e.message);
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
};
