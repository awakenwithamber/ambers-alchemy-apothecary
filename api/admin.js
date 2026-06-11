// api/admin.js
// Admin dashboard auth + data endpoints. Login validates ADMIN_PASSWORD and
// issues a short-lived JWT signed with GRIMOIRE_JWT_SECRET. All data routes
// are protected by requireAdmin.

const jwt = require('jsonwebtoken');
const { getAdminClient } = require('../lib/supabase');

const TOKEN_TTL = '12h';

function getJwtSecret() {
  const s = process.env.GRIMOIRE_JWT_SECRET;
  if (!s) throw new Error('GRIMOIRE_JWT_SECRET not configured');
  return s;
}

// POST /api/admin/login  { password }
exports.login = (req, res) => {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return res.status(503).json({ ok: false, error: 'Admin login not configured. Set ADMIN_PASSWORD.' });
  }
  const { password } = req.body || {};
  if (!password || password !== expected) {
    return res.status(401).json({ ok: false, error: 'Incorrect password' });
  }
  try {
    const token = jwt.sign({ role: 'admin' }, getJwtSecret(), { expiresIn: TOKEN_TTL });
    res.json({ ok: true, token });
  } catch (err) {
    console.error('[admin-login]', err.message);
    res.status(500).json({ ok: false, error: 'Could not issue token' });
  }
};

// Middleware: verify the admin JWT (Authorization: Bearer <token> or x-admin-token)
exports.requireAdmin = (req, res, next) => {
  const auth = req.headers.authorization || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const token = bearer || req.headers['x-admin-token'] || '';
  if (!token) return res.status(401).json({ ok: false, error: 'Missing admin token' });
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (decoded.role !== 'admin') return res.status(403).json({ ok: false, error: 'Forbidden' });
    next();
  } catch {
    res.status(401).json({ ok: false, error: 'Invalid or expired token' });
  }
};

async function fetchTable(table, orderCol) {
  const sb = getAdminClient();
  const { data, error } = await sb.from(table).select('*').order(orderCol, { ascending: false }).limit(1000);
  if (error) throw new Error(error.message);
  return data || [];
}

// GET /api/admin/summary — counts for dashboard cards
exports.summary = async (req, res) => {
  try {
    const sb = getAdminClient();
    const tables = [
      ['orders', 'orders'],
      ['form_submissions', 'submissions'],
      ['quiz_leads', 'leads'],
      ['grimoir_subscribers', 'subscribers'],
      ['reviews', 'reviews'],
    ];
    const counts = {};
    await Promise.all(
      tables.map(async ([table, key]) => {
        const { count, error } = await sb.from(table).select('*', { count: 'exact', head: true });
        counts[key] = error ? 0 : count || 0;
      })
    );
    res.json({ ok: true, counts });
  } catch (err) {
    console.error('[admin-summary]', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
};

exports.orders = async (req, res) => {
  try { res.json({ ok: true, rows: await fetchTable('orders', 'submitted_at') }); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
};

exports.submissions = async (req, res) => {
  try { res.json({ ok: true, rows: await fetchTable('form_submissions', 'created_at') }); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
};

exports.leads = async (req, res) => {
  try { res.json({ ok: true, rows: await fetchTable('quiz_leads', 'submitted_at') }); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
};

exports.subscribers = async (req, res) => {
  try { res.json({ ok: true, rows: await fetchTable('grimoir_subscribers', 'subscribed_at') }); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
};

exports.reviews = async (req, res) => {
  try { res.json({ ok: true, rows: await fetchTable('reviews', 'created_at') }); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
};
