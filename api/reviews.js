const { getAdminClient } = require('../lib/supabase');

const ALLOWED_TYPES = new Set(['product', 'bundle', 'soap', 'site', 'service', 'shipping']);
const MAX_TITLE = 120;
const MAX_BODY = 4000;
const MAX_NAME = 60;

function adminOk(req) {
  const expected = process.env.REVIEWS_ADMIN_TOKEN;
  if (!expected) return false;
  const header = req.headers['x-admin-token'] || '';
  const query = req.query.admin_token || '';
  return (header && header === expected) || (query && query === expected);
}

function clean(str, max) {
  if (!str) return '';
  const s = String(str).replace(/\u0000/g, '').trim();
  return s.length > max ? s.slice(0, max) : s;
}

function sanitizeName(s) {
  return clean(s, MAX_NAME).replace(/[<>]/g, '').replace(/\s+/g, ' ');
}

function clampRating(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return null;
  return Math.max(1, Math.min(5, Math.round(v)));
}

function looksLikeSpam(body, title) {
  const combined = `${title || ''} ${body || ''}`.toLowerCase();
  if (!combined.trim()) return true;
  const urlCount = (combined.match(/https?:\/\//g) || []).length;
  if (urlCount >= 2) return true;
  const spamSignals = ['viagra', 'casino', 'crypto airdrop', 'free bitcoin', 'seo services', 'backlinks cheap', 'onlyfans', 'porn', 'xxx'];
  return spamSignals.some(s => combined.includes(s));
}

function dbToPublic(r) {
  if (!r) return r;
  return {
    id: r.id,
    type: r.type,
    targetId: r.target_id,
    targetName: r.target_name,
    rating: r.rating,
    title: r.title,
    body: r.body,
    displayName: r.display_name,
    photoUrl: r.photo_url || null,
    usageDuration: r.usage_duration || null,
    repeatCustomer: !!r.repeat_customer,
    verifiedBuyer: !!r.verified_buyer,
    featured: !!r.featured,
    helpful: r.helpful || 0,
    response: r.response || null,
    createdAt: r.created_at,
  };
}

function computeStats(rows) {
  const total = rows.length;
  if (!total) return { total: 0, average: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, verifiedCount: 0 };
  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0, verifiedCount = 0;
  for (const r of rows) {
    breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
    sum += r.rating;
    if (r.verified_buyer) verifiedCount++;
  }
  return { total, average: Math.round((sum / total) * 10) / 10, breakdown, verifiedCount };
}

async function emailOrderCount(email) {
  if (!email) return 0;
  const sb = getAdminClient();
  // Only count orders that were verified as paid by the server (Stripe-confirmed).
  // Pending-external-payment rows and any forged submissions are excluded.
  const { count } = await sb.from('orders').select('*', { count: 'exact', head: true })
    .eq('email', email.toLowerCase().trim())
    .eq('payment_status', 'paid');
  return count || 0;
}

exports.list = async (req, res) => {
  const sb = getAdminClient();
  const { type, targetId, sort = 'recent', verified, minRating, limit = 50, offset = 0 } = req.query;
  let q = sb.from('reviews').select('*').eq('status', 'approved');
  if (type) q = q.eq('type', type);
  if (targetId) q = q.eq('target_id', targetId);
  if (verified === 'true') q = q.eq('verified_buyer', true);
  if (minRating) q = q.gte('rating', Number(minRating));

  const orderMap = { highest: ['rating', false], helpful: ['helpful', false], oldest: ['created_at', true], recent: ['created_at', false], verified: ['verified_buyer', false] };
  const [col, asc] = orderMap[sort] || ['created_at', false];
  q = q.order(col, { ascending: asc });
  q = q.range(Number(offset), Number(offset) + Math.min(Number(limit), 200) - 1);

  const { data, error, count } = await q;
  if (error) return res.status(500).json({ ok: false, error: error.message });

  const { data: allApproved } = await sb.from('reviews').select('rating, verified_buyer').eq('status', 'approved');
  res.json({ ok: true, reviews: (data || []).map(dbToPublic), total: count || 0, stats: computeStats(allApproved || []) });
};

exports.stats = async (req, res) => {
  const sb = getAdminClient();
  const { type, targetId } = req.query;
  let q = sb.from('reviews').select('rating, verified_buyer').eq('status', 'approved');
  if (type) q = q.eq('type', type);
  if (targetId) q = q.eq('target_id', targetId);
  const { data, error } = await q;
  if (error) return res.status(500).json({ ok: false, error: error.message });
  res.json({ ok: true, stats: computeStats(data || []) });
};

exports.featured = async (req, res) => {
  const sb = getAdminClient();
  const limit = Math.min(Number(req.query.limit) || 6, 24);
  let { data } = await sb.from('reviews').select('*').eq('status', 'approved').eq('featured', true).order('created_at', { ascending: false }).limit(limit);
  if (!data || !data.length) {
    const r = await sb.from('reviews').select('*').eq('status', 'approved').gte('rating', 4).order('created_at', { ascending: false }).limit(limit);
    data = r.data || [];
  }
  res.json({ ok: true, reviews: data.map(dbToPublic) });
};

exports.create = async (req, res) => {
  const body = req.body;
  if (body.website || body.honeypot) return res.json({ ok: true, status: 'pending' });

  const type = String(body.type || 'product').toLowerCase();
  if (!ALLOWED_TYPES.has(type)) return res.status(400).json({ ok: false, error: 'Invalid review type' });
  const rating = clampRating(body.rating);
  if (!rating) return res.status(400).json({ ok: false, error: 'Rating must be between 1 and 5' });
  const text = clean(body.body, MAX_BODY);
  if (text.length < 10) return res.status(400).json({ ok: false, error: 'Please share a little more about your experience' });

  const displayName = sanitizeName(body.displayName || body.firstName || 'Anonymous Friend') || 'Anonymous Friend';
  const email = clean(body.email, 120).toLowerCase();
  const orderCount = email ? await emailOrderCount(email) : 0;
  const verifiedBuyer = orderCount > 0;
  const repeatCustomer = body.repeatCustomer === true && orderCount > 1;

  const id = `rv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const record = {
    id, type,
    target_id: clean(body.targetId, 120) || null,
    target_name: clean(body.targetName, 200) || null,
    rating, title: clean(body.title, MAX_TITLE),
    body: text, display_name: displayName, email,
    usage_duration: clean(body.usageDuration, 60) || null,
    photo_url: clean(body.photoUrl, 600) || null,
    repeat_customer: repeatCustomer, verified_buyer: verifiedBuyer,
    featured: false, helpful: 0, response: null,
    status: looksLikeSpam(text, body.title) ? 'rejected' : 'pending',
  };

  const sb = getAdminClient();
  const { error } = await sb.from('reviews').insert(record);
  if (error) return res.status(500).json({ ok: false, error: error.message });
  res.json({ ok: true, id, status: record.status, verifiedBuyer, message: 'Thank you — your review has been received and will be published after a brief review.' });
};

exports.helpful = async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ ok: false, error: 'Missing review id' });
  const sb = getAdminClient();
  const { data: review } = await sb.from('reviews').select('helpful').eq('id', id).single();
  if (!review) return res.status(404).json({ ok: false, error: 'Not found' });
  const helpful = (review.helpful || 0) + 1;
  await sb.from('reviews').update({ helpful }).eq('id', id);
  res.json({ ok: true, helpful });
};

exports.adminList = async (req, res) => {
  if (!adminOk(req)) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  const sb = getAdminClient();
  let q = sb.from('reviews').select('*').order('created_at', { ascending: false });
  if (req.query.status) q = q.eq('status', req.query.status);
  const { data, error } = await q;
  if (error) return res.status(500).json({ ok: false, error: error.message });
  const counts = { pending: 0, approved: 0, rejected: 0, total: data.length };
  for (const r of data) counts[r.status] = (counts[r.status] || 0) + 1;
  res.json({ ok: true, reviews: data, counts });
};

exports.adminUpdate = async (req, res) => {
  if (!adminOk(req)) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  const { id } = req.params;
  const body = req.body;
  const update = { updated_at: new Date().toISOString() };
  if (body.status && ['pending', 'approved', 'rejected'].includes(body.status)) update.status = body.status;
  if (typeof body.featured === 'boolean') update.featured = body.featured;
  if (typeof body.verifiedBuyer === 'boolean') update.verified_buyer = body.verifiedBuyer;
  if (typeof body.response === 'string') {
    update.response = clean(body.response, 2000) || null;
    update.responded_at = body.response ? new Date().toISOString() : null;
  }
  const sb = getAdminClient();
  const { data, error } = await sb.from('reviews').update(update).eq('id', id).select().single();
  if (error) return res.status(500).json({ ok: false, error: error.message });
  res.json({ ok: true, review: data });
};

exports.adminDelete = async (req, res) => {
  if (!adminOk(req)) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  const sb = getAdminClient();
  const { error } = await sb.from('reviews').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ ok: false, error: error.message });
  res.json({ ok: true, id: req.params.id });
};

exports.adminExport = async (req, res) => {
  if (!adminOk(req)) return res.status(401).send('Unauthorized');
  const sb = getAdminClient();
  const { data } = await sb.from('reviews').select('*').order('created_at', { ascending: false });
  const cols = ['id', 'created_at', 'type', 'target_id', 'target_name', 'rating', 'title', 'body', 'display_name', 'email', 'verified_buyer', 'repeat_customer', 'status', 'featured', 'helpful', 'response'];
  const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = [cols.join(','), ...(data || []).map(r => cols.map(c => escape(r[c])).join(','))];
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="reviews-export.csv"');
  res.send(rows.join('\n'));
};
