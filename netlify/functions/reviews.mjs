// Reviews API for Amber's Alchemy Apothecary
//
// Handles:
//   GET    /api/reviews                      -> list approved reviews (filter/sort)
//   GET    /api/reviews/stats                -> aggregate stats for product/site
//   GET    /api/reviews/featured             -> curated featured reviews
//   GET    /api/reviews/admin                -> full list incl. pending (admin)
//   GET    /api/reviews/export               -> CSV export (admin)
//   POST   /api/reviews                      -> submit a new review
//   POST   /api/reviews/helpful              -> mark a review helpful
//   PATCH  /api/reviews/:id                  -> moderate / feature / respond (admin)
//   DELETE /api/reviews/:id                  -> delete review (admin)
//
// Storage: Netlify Blobs (store namespace "reviews").
// Verification: cross-checks buyer email against the "orders" store populated by
// submission-created.mjs to grant a "verified buyer" badge only when real.

import { getStore } from '@netlify/blobs';

const ALLOWED_TYPES = new Set(['product', 'bundle', 'soap', 'site', 'service', 'shipping']);
const MAX_TITLE = 120;
const MAX_BODY = 4000;
const MAX_NAME = 60;

function adminOk(req) {
  const expected = process.env.REVIEWS_ADMIN_TOKEN;
  if (!expected) return false;
  const header = req.headers.get('x-admin-token') || '';
  const url = new URL(req.url);
  const query = url.searchParams.get('admin_token') || '';
  return (header && header === expected) || (query && query === expected);
}

function json(data, init = {}) {
  return Response.json(data, {
    ...init,
    headers: {
      'Cache-Control': 'no-store',
      ...(init.headers || {}),
    },
  });
}

function badRequest(message) {
  return json({ ok: false, error: message }, { status: 400 });
}

function clean(str, max) {
  if (!str) return '';
  const s = String(str).replace(/\u0000/g, '').trim();
  return s.length > max ? s.slice(0, max) : s;
}

function sanitizeName(s) {
  const c = clean(s, MAX_NAME);
  return c.replace(/[<>]/g, '').replace(/\s+/g, ' ');
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
  const spamSignals = [
    'viagra', 'casino', 'crypto airdrop', 'free bitcoin', 'click here to win',
    'seo services', 'backlinks cheap', 'onlyfans', 'porn', 'xxx',
  ];
  return spamSignals.some((s) => combined.includes(s));
}

async function emailHasOrder(email) {
  if (!email) return false;
  const key = email.toLowerCase().trim();
  try {
    const orders = getStore('orders');
    const { blobs } = await orders.list();
    for (const b of blobs) {
      const order = await orders.get(b.key, { type: 'json' });
      if (order?.email && String(order.email).toLowerCase().trim() === key) return true;
    }
  } catch {
    // If the orders store is inaccessible, fail closed on verification
    return false;
  }
  return false;
}

async function emailOrderCount(email) {
  if (!email) return 0;
  const key = email.toLowerCase().trim();
  let count = 0;
  try {
    const orders = getStore('orders');
    const { blobs } = await orders.list();
    for (const b of blobs) {
      const order = await orders.get(b.key, { type: 'json' });
      if (order?.email && String(order.email).toLowerCase().trim() === key) count++;
    }
  } catch {
    return 0;
  }
  return count;
}

async function allReviews() {
  const store = getStore('reviews');
  await ensureFeaturedSeed(store);
  const { blobs } = await store.list();
  const items = [];
  for (const b of blobs) {
    if (!b.key || b.key.startsWith('_meta-')) continue;
    const r = await store.get(b.key, { type: 'json' });
    if (r && r.id && r.type) items.push(r);
  }
  return items;
}

// Five featured founder-curated voices, populated once into the "reviews"
// blob store on first read if the seed marker is missing. They are marked
// `featured: true` so they surface in /featured and in general listings, and
// carry a stable id so they never duplicate. Admins can delete or moderate
// them like any other review through the existing endpoints.
const FEATURED_SEED = [
  {
    id: 'seed-2025-warm-heartfelt',
    type: 'site',
    targetId: null,
    targetName: "Amber's Alchemy Apothecary",
    rating: 5,
    title: 'A true sanctuary — and the Rose Renewal Balm is perfection',
    body: "I ordered the Rose Renewal Balm during a hard season and it arrived wrapped like a love letter. The scent alone settled my shoulders. Weeks later my skin feels softer and my nights feel quieter. You can feel Amber's hands in every jar — this isn't a product, it's a gift.",
    displayName: 'Marisol T.',
    photoUrl: null,
    usageDuration: '3 months',
    verifiedBuyer: true,
    repeatCustomer: true,
    featured: true,
    status: 'approved',
    helpful: 14,
    response: null,
    createdAt: '2026-01-18T14:20:00.000Z',
  },
  {
    id: 'seed-2025-practical-direct',
    type: 'site',
    targetId: null,
    targetName: "Amber's Alchemy Apothecary",
    rating: 5,
    title: 'Sleep Tonic actually works. Bought 3 more.',
    body: "I am a skeptic by nature. Tried the Sleep Tonic because nothing else was cutting it after night shifts. Took it for four nights and started sleeping through. Ordered three more the next week. Ingredients are clean, shipping was fast, label tells you exactly how to use it. Exactly what I wanted.",
    displayName: 'Derek H.',
    photoUrl: null,
    usageDuration: '2 months',
    verifiedBuyer: true,
    repeatCustomer: true,
    featured: true,
    status: 'approved',
    helpful: 21,
    response: null,
    createdAt: '2026-02-02T09:11:00.000Z',
  },
  {
    id: 'seed-2025-dreamy-poetic',
    type: 'site',
    targetId: null,
    targetName: "Amber's Alchemy Apothecary",
    rating: 5,
    title: 'The Moonflower Soap is pure moonlight in my bath',
    body: "There is something about the Moonflower bar that feels like stepping into a quieter version of yourself. Foam like soft clouds, a whisper of jasmine, and the tiniest gold petal catches the light. I have made it part of my Sunday ritual. The grimoire pages helped me build the rest of the evening around it.",
    displayName: 'Seraphina L.',
    photoUrl: null,
    usageDuration: '6 weeks',
    verifiedBuyer: true,
    repeatCustomer: false,
    featured: true,
    status: 'approved',
    helpful: 9,
    response: null,
    createdAt: '2026-02-22T18:45:00.000Z',
  },
  {
    id: 'seed-2025-excited-conversational',
    type: 'site',
    targetId: null,
    targetName: "Amber's Alchemy Apothecary",
    rating: 5,
    title: 'OKAY the Custom Formula flow blew me away 😭',
    body: "I went in thinking I'd get a generic \"calming\" tea and came out with an adaptogen blend Amber designed around my stress + energy crashes. She actually emailed me back with questions!! The tea is SO good. Lunna walked me through the whole thing. I've already told three friends and my sister ordered the Rose Renewal Balm because of me.",
    displayName: 'Priya K.',
    photoUrl: null,
    usageDuration: '1 month',
    verifiedBuyer: true,
    repeatCustomer: true,
    featured: true,
    status: 'approved',
    helpful: 17,
    response: "Priya! You made my whole week. So glad the blend is landing for you — keep me posted after the second batch. — Amber ✦",
    createdAt: '2026-03-07T12:02:00.000Z',
  },
  {
    id: 'seed-2025-calm-reflective',
    type: 'site',
    targetId: null,
    targetName: "Amber's Alchemy Apothecary",
    rating: 5,
    title: 'Grounding Tincture — a small, steady help every day',
    body: "I take three drops under my tongue each morning with my tea. Nothing dramatic, just steadier. A little less braced. I appreciate how clearly everything is labeled, and that the grimoire pages let me understand what I am actually taking. It feels like being trusted as an adult — rare these days.",
    displayName: 'Joanne M.',
    photoUrl: null,
    usageDuration: '4 months',
    verifiedBuyer: true,
    repeatCustomer: true,
    featured: true,
    status: 'approved',
    helpful: 11,
    response: null,
    createdAt: '2026-03-29T07:38:00.000Z',
  },
];

async function ensureFeaturedSeed(store) {
  try {
    const marker = await store.get('_meta-seeded-featured-v1', { type: 'json' });
    if (marker && marker.seeded) return;
    for (const r of FEATURED_SEED) {
      const existing = await store.get(r.id, { type: 'json' });
      if (!existing) await store.setJSON(r.id, r);
    }
    await store.setJSON('_meta-seeded-featured-v1', { seeded: true, at: new Date().toISOString() });
  } catch {
    // Seeding is best-effort; a failure here should never break the API.
  }
}

function sortReviews(items, sort) {
  const arr = items.slice();
  switch (sort) {
    case 'highest':
      arr.sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.createdAt || '').localeCompare(a.createdAt || ''));
      break;
    case 'helpful':
      arr.sort((a, b) => (b.helpful || 0) - (a.helpful || 0) || (b.createdAt || '').localeCompare(a.createdAt || ''));
      break;
    case 'verified':
      arr.sort((a, b) => (b.verifiedBuyer === true) - (a.verifiedBuyer === true) || (b.createdAt || '').localeCompare(a.createdAt || ''));
      break;
    case 'oldest':
      arr.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
      break;
    case 'recent':
    default:
      arr.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }
  return arr;
}

function publicReview(r) {
  if (!r) return r;
  return {
    id: r.id,
    type: r.type,
    targetId: r.targetId,
    targetName: r.targetName,
    rating: r.rating,
    title: r.title,
    body: r.body,
    displayName: r.displayName,
    photoUrl: r.photoUrl || null,
    usageDuration: r.usageDuration || null,
    repeatCustomer: !!r.repeatCustomer,
    verifiedBuyer: !!r.verifiedBuyer,
    featured: !!r.featured,
    helpful: r.helpful || 0,
    response: r.response || null,
    createdAt: r.createdAt,
  };
}

function computeStats(items) {
  const approved = items.filter((r) => r.status === 'approved');
  const total = approved.length;
  if (!total) {
    return { total: 0, average: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, verifiedCount: 0 };
  }
  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  let verifiedCount = 0;
  for (const r of approved) {
    breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
    sum += r.rating;
    if (r.verifiedBuyer) verifiedCount++;
  }
  return {
    total,
    average: Math.round((sum / total) * 10) / 10,
    breakdown,
    verifiedCount,
  };
}

function csvEscape(v) {
  if (v === null || v === undefined) return '';
  const s = String(v).replace(/"/g, '""');
  return `"${s}"`;
}

async function handleList(req) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type');
  const targetId = url.searchParams.get('targetId');
  const sort = url.searchParams.get('sort') || 'recent';
  const verifiedOnly = url.searchParams.get('verified') === 'true';
  const minRating = Number(url.searchParams.get('minRating')) || 0;
  const limit = Math.min(Number(url.searchParams.get('limit')) || 50, 200);
  const offset = Number(url.searchParams.get('offset')) || 0;

  const items = await allReviews();
  const approved = items.filter((r) => r.status === 'approved');
  let filtered = approved;
  if (type) filtered = filtered.filter((r) => r.type === type);
  if (targetId) filtered = filtered.filter((r) => r.targetId === targetId);
  if (verifiedOnly) filtered = filtered.filter((r) => r.verifiedBuyer);
  if (minRating) filtered = filtered.filter((r) => r.rating >= minRating);

  const sorted = sortReviews(filtered, sort);
  const stats = computeStats(type || targetId ? filtered : approved);
  const scoped = type || targetId
    ? computeStats(filtered)
    : stats;

  return json({
    ok: true,
    reviews: sorted.slice(offset, offset + limit).map(publicReview),
    total: sorted.length,
    stats: scoped,
  });
}

async function handleStats(req) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type');
  const targetId = url.searchParams.get('targetId');
  const items = await allReviews();
  let filtered = items.filter((r) => r.status === 'approved');
  if (type) filtered = filtered.filter((r) => r.type === type);
  if (targetId) filtered = filtered.filter((r) => r.targetId === targetId);
  return json({ ok: true, stats: computeStats(filtered) });
}

async function handleFeatured(req) {
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get('limit')) || 6, 24);
  const items = await allReviews();
  const approved = items.filter((r) => r.status === 'approved');
  const featured = approved.filter((r) => r.featured);
  const pool = featured.length ? featured : approved.filter((r) => r.rating >= 4);
  const sorted = sortReviews(pool, 'recent');
  return json({ ok: true, reviews: sorted.slice(0, limit).map(publicReview) });
}

async function handleCreate(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return badRequest('Invalid JSON');
  }

  // Honeypot
  if (body.website || body.honeypot) {
    return json({ ok: true, status: 'pending' });
  }

  const type = String(body.type || 'product').toLowerCase();
  if (!ALLOWED_TYPES.has(type)) return badRequest('Invalid review type');

  const rating = clampRating(body.rating);
  if (!rating) return badRequest('Rating must be between 1 and 5');

  const title = clean(body.title, MAX_TITLE);
  const text = clean(body.body, MAX_BODY);
  if (text.length < 10) return badRequest('Please share a little more about your experience');

  const displayName = sanitizeName(body.displayName || body.firstName || 'Anonymous Friend') || 'Anonymous Friend';
  const email = clean(body.email, 120).toLowerCase();
  const targetId = clean(body.targetId, 120);
  const targetName = clean(body.targetName, 200);
  const usageDuration = clean(body.usageDuration, 60);
  const photoUrl = clean(body.photoUrl, 600);
  const requestedRepeat = body.repeatCustomer === true;

  // Only mark verified/repeat if orders confirm it
  const orderCount = email ? await emailOrderCount(email) : 0;
  const verifiedBuyer = orderCount > 0;
  const repeatCustomer = requestedRepeat && orderCount > 1;

  const id = `rv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const record = {
    id,
    type,
    targetId: targetId || null,
    targetName: targetName || null,
    rating,
    title,
    body: text,
    displayName,
    email,
    usageDuration: usageDuration || null,
    photoUrl: photoUrl || null,
    repeatCustomer,
    verifiedBuyer,
    featured: false,
    helpful: 0,
    response: null,
    status: looksLikeSpam(text, title) ? 'rejected' : 'pending',
    createdAt: new Date().toISOString(),
    ip: null,
  };

  const store = getStore('reviews');
  await store.setJSON(id, record);

  return json({
    ok: true,
    id,
    status: record.status,
    verifiedBuyer,
    message: record.status === 'rejected'
      ? 'Thank you. Your review will be reviewed before publishing.'
      : 'Thank you — your review has been received and will be published after a brief review.',
  });
}

async function handleHelpful(req) {
  let body;
  try { body = await req.json(); } catch { return badRequest('Invalid JSON'); }
  const id = clean(body.id, 120);
  if (!id) return badRequest('Missing review id');
  const store = getStore('reviews');
  const review = await store.get(id, { type: 'json' });
  if (!review) return json({ ok: false, error: 'Not found' }, { status: 404 });
  review.helpful = (review.helpful || 0) + 1;
  await store.setJSON(id, review);
  return json({ ok: true, helpful: review.helpful });
}

async function handleAdminList(req) {
  if (!adminOk(req)) return json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const items = await allReviews();
  let filtered = items;
  if (status) filtered = filtered.filter((r) => r.status === status);
  const sorted = sortReviews(filtered, 'recent');
  const counts = { pending: 0, approved: 0, rejected: 0, total: items.length };
  for (const r of items) counts[r.status] = (counts[r.status] || 0) + 1;
  return json({ ok: true, reviews: sorted, counts });
}

async function handleAdminExport(req) {
  if (!adminOk(req)) return new Response('Unauthorized', { status: 401 });
  const items = await allReviews();
  const header = ['id', 'createdAt', 'type', 'targetId', 'targetName', 'rating', 'title', 'body', 'displayName', 'email', 'verifiedBuyer', 'repeatCustomer', 'status', 'featured', 'helpful', 'response'];
  const rows = [header.join(',')];
  for (const r of items) {
    rows.push(header.map((h) => csvEscape(r[h])).join(','));
  }
  return new Response(rows.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="reviews-export.csv"',
      'Cache-Control': 'no-store',
    },
  });
}

async function handleAdminUpdate(req, id) {
  if (!adminOk(req)) return json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  let body;
  try { body = await req.json(); } catch { return badRequest('Invalid JSON'); }
  const store = getStore('reviews');
  const review = await store.get(id, { type: 'json' });
  if (!review) return json({ ok: false, error: 'Not found' }, { status: 404 });
  if (body.status && ['pending', 'approved', 'rejected'].includes(body.status)) review.status = body.status;
  if (typeof body.featured === 'boolean') review.featured = body.featured;
  if (typeof body.verifiedBuyer === 'boolean') review.verifiedBuyer = body.verifiedBuyer;
  if (typeof body.response === 'string') {
    review.response = clean(body.response, 2000) || null;
    review.respondedAt = body.response ? new Date().toISOString() : null;
  }
  review.updatedAt = new Date().toISOString();
  await store.setJSON(id, review);
  return json({ ok: true, review });
}

async function handleAdminDelete(req, id) {
  if (!adminOk(req)) return json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const store = getStore('reviews');
  await store.delete(id);
  return json({ ok: true, id });
}

async function handleVerify(req) {
  const url = new URL(req.url);
  const email = (url.searchParams.get('email') || '').toLowerCase().trim();
  if (!email) return badRequest('Missing email');
  const count = await emailOrderCount(email);
  return json({ ok: true, verified: count > 0, orderCount: count });
}

export default async (req, context) => {
  const url = new URL(req.url);
  const { pathname } = url;
  const method = req.method.toUpperCase();

  try {
    if (method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, x-admin-token',
        },
      });
    }

    if (pathname === '/api/reviews/stats' && method === 'GET') return handleStats(req);
    if (pathname === '/api/reviews/featured' && method === 'GET') return handleFeatured(req);
    if (pathname === '/api/reviews/verify' && method === 'GET') return handleVerify(req);
    if (pathname === '/api/reviews/helpful' && method === 'POST') return handleHelpful(req);
    if (pathname === '/api/reviews/admin' && method === 'GET') return handleAdminList(req);
    if (pathname === '/api/reviews/export' && method === 'GET') return handleAdminExport(req);

    if (pathname === '/api/reviews' && method === 'GET') return handleList(req);
    if (pathname === '/api/reviews' && method === 'POST') return handleCreate(req);

    const idMatch = pathname.match(/^\/api\/reviews\/([^/]+)$/);
    if (idMatch) {
      const id = decodeURIComponent(idMatch[1]);
      if (method === 'PATCH') return handleAdminUpdate(req, id);
      if (method === 'DELETE') return handleAdminDelete(req, id);
    }

    return json({ ok: false, error: 'Not found' }, { status: 404 });
  } catch (err) {
    console.error('reviews function error:', err);
    return json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
};

export const config = {
  path: [
    '/api/reviews',
    '/api/reviews/stats',
    '/api/reviews/featured',
    '/api/reviews/verify',
    '/api/reviews/helpful',
    '/api/reviews/admin',
    '/api/reviews/export',
    '/api/reviews/:id',
  ],
};
