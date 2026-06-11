const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ── CORS ────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://awakenagain.com',
  process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null,
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || ALLOWED_ORIGINS.some(o => origin === o) || process.env.NODE_ENV !== 'production') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── Netlify-function adapter (CommonJS handlers) ─────────────────────────────
function makeEvent(req) {
  return {
    httpMethod: req.method,
    queryStringParameters: req.query || {},
    headers: req.headers,
    body: req.body && Object.keys(req.body).length ? JSON.stringify(req.body) : (req.body || null),
    rawUrl: req.originalUrl,
    path: req.path,
  };
}

async function runCjsHandler(handlerPath, req, res) {
  // Clear require cache so env-var changes are picked up on restart
  delete require.cache[require.resolve(handlerPath)];
  const mod = require(handlerPath);
  const result = await mod.handler(makeEvent(req));
  Object.entries(result.headers || {}).forEach(([k, v]) => res.setHeader(k, v));
  res.status(result.statusCode || 200).send(result.body || '');
}

// ── Netlify-function adapter (ESM handlers using Request/Response API) ────────
async function runEsmHandler(modulePath, req, res) {
  const url = `http://${req.headers.host || `localhost:${PORT}`}${req.originalUrl}`;
  const isBodyless = ['GET', 'HEAD'].includes(req.method);
  const fetchReq = new Request(url, {
    method: req.method,
    headers: req.headers,
    body: isBodyless ? undefined : JSON.stringify(req.body),
  });
  const { default: handler } = await import(modulePath + `?t=${Date.now()}`);
  const response = await handler(fetchReq);
  res.status(response.status);
  for (const [k, v] of response.headers.entries()) {
    res.setHeader(k, v);
  }
  res.send(await response.text());
}

// ── Local blob store (filesystem-backed, replaces @netlify/blobs in dev) ─────
const BLOBS_DIR = path.join(__dirname, '.blobs');
if (!fs.existsSync(BLOBS_DIR)) fs.mkdirSync(BLOBS_DIR, { recursive: true });

function safeKey(k) {
  return k.replace(/[^a-zA-Z0-9_\-:.@]/g, '_');
}

app.get('/_blobs/:store', (req, res) => {
  const dir = path.join(BLOBS_DIR, req.params.store);
  if (!fs.existsSync(dir)) return res.json({ blobs: [] });
  const files = fs.readdirSync(dir).filter(f => !f.startsWith('.'));
  const prefix = req.query.prefix || '';
  const blobs = files
    .filter(f => !prefix || f.startsWith(safeKey(prefix)))
    .map(f => ({
      key: f,
      etag: `"${fs.statSync(path.join(dir, f)).mtime.getTime()}"`,
      size: fs.statSync(path.join(dir, f)).size,
    }));
  res.json({ blobs });
});

app.get('/_blobs/:store/:key', (req, res) => {
  const file = path.join(BLOBS_DIR, req.params.store, safeKey(req.params.key));
  if (!fs.existsSync(file)) return res.status(404).end();
  res.setHeader('ETag', `"${fs.statSync(file).mtime.getTime()}"`);
  res.sendFile(file);
});

app.put('/_blobs/:store/:key', (req, res) => {
  const dir = path.join(BLOBS_DIR, req.params.store);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  let data = '';
  req.on('data', chunk => (data += chunk));
  req.on('end', () => {
    fs.writeFileSync(path.join(dir, safeKey(req.params.key)), data);
    res.status(204).end();
  });
});

app.delete('/_blobs/:store/:key', (req, res) => {
  const file = path.join(BLOBS_DIR, req.params.store, safeKey(req.params.key));
  if (fs.existsSync(file)) fs.unlinkSync(file);
  res.status(204).end();
});

// Set the NETLIFY_BLOBS_CONTEXT env var so @netlify/blobs finds the local server
const blobsContext = Buffer.from(JSON.stringify({
  siteID: 'local-dev',
  token: 'local-dev-token',
  url: `http://localhost:${PORT}/_blobs`,
})).toString('base64');
process.env.NETLIFY_BLOBS_CONTEXT = blobsContext;

// ── Function routes ───────────────────────────────────────────────────────────
app.all('/.netlify/functions/auth-check', async (req, res) => {
  try {
    await runCjsHandler('./netlify/functions/auth-check.js', req, res);
  } catch (e) {
    console.error('[auth-check]', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.all('/.netlify/functions/shopify-checkout', async (req, res) => {
  try {
    await runCjsHandler('./netlify/functions/shopify-checkout.js', req, res);
  } catch (e) {
    console.error('[shopify-checkout]', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.all('/.netlify/functions/form-relay', async (req, res) => {
  try {
    await runCjsHandler('./netlify/functions/form-relay.js', req, res);
  } catch (e) {
    console.error('[form-relay]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Supabase-backed API routes ────────────────────────────────────────────────
const reviewsApi = require('./api/reviews');
const quizLeadApi = require('./api/quiz-lead');
const submissionApi = require('./api/submission-created');

// Reviews – public
app.get('/api/reviews', reviewsApi.list);
app.get('/api/reviews/stats', reviewsApi.stats);
app.get('/api/reviews/featured', reviewsApi.featured);
app.post('/api/reviews', reviewsApi.create);
app.post('/api/reviews/helpful', reviewsApi.helpful);
// Reviews – admin
app.get('/api/reviews/admin', reviewsApi.adminList);
app.get('/api/reviews/export', reviewsApi.adminExport);
app.patch('/api/reviews/:id', reviewsApi.adminUpdate);
app.delete('/api/reviews/:id', reviewsApi.adminDelete);

// Quiz leads
app.post('/api/quiz-lead', quizLeadApi.submit);

// Order submission (Netlify form webhook equivalent)
app.post('/api/submission-created', submissionApi.handle);

// Legacy Netlify function paths (redirect to new routes for backwards compat)
app.all('/.netlify/functions/reviews', async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const p = url.pathname.replace('/.netlify/functions/reviews', '/api/reviews');
  res.redirect(307, p + url.search);
});

app.all('/.netlify/functions/quiz-lead', async (req, res) => {
  res.redirect(307, '/api/quiz-lead');
});

app.all('/.netlify/functions/submission-created', async (req, res) => {
  res.redirect(307, '/api/submission-created');
});

app.all('/.netlify/functions/review-reminders', async (req, res) => {
  res.json({ ok: true, message: 'Review reminders are handled server-side via scheduled tasks.' });
});

// ── Static files ──────────────────────────────────────────────────────────────
app.use(express.static(__dirname, {
  index: 'index.html',
  dotfiles: 'ignore',
}));

// SPA catch-all (mirrors netlify.toml redirects)
app.get('/grimoir', (req, res) => res.sendFile(path.join(__dirname, 'grimoir.html')));
app.get('/grimoire', (req, res) => res.sendFile(path.join(__dirname, 'grimoir.html')));
app.get('/grimior', (req, res) => res.sendFile(path.join(__dirname, 'grimior.html')));

app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✦ Amber's Alchemy Apothecary server running on http://0.0.0.0:${PORT}`);
  console.log(`  Netlify functions available at /.netlify/functions/*`);
  console.log(`  Local blob store at .blobs/`);
});
