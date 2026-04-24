// Grimior / Real Magic — membership status lookup.
// GET /.netlify/functions/grimior-status?email=you@example.com
// Returns { active, expiresAt, promoCode? } based on records in the
// grimior-subscribers blob store. Server-side only.
import { getStore } from '@netlify/blobs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeKey(email) { return String(email).replace(/[^a-z0-9]+/gi, '_').toLowerCase(); }

export default async (req) => {
  const url = new URL(req.url);
  const email = String(url.searchParams.get('email') || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return Response.json({ active: false, error: 'invalid-email' }, { status: 400 });
  }
  try {
    const subs = getStore('grimior-subscribers');
    const rec = await subs.get(safeKey(email), { type: 'json' }).catch(() => null);
    if (!rec) return Response.json({ active: false });
    const active = rec.status === 'active' &&
      (!rec.expiresAt || Date.parse(rec.expiresAt) > Date.now());
    return Response.json({
      active,
      expiresAt: rec.expiresAt || null,
      promoCode: active ? (rec.promoCode || null) : null,
    });
  } catch (err) {
    console.error('grimior-status error', err);
    return Response.json({ active: false, error: 'lookup-failed' }, { status: 500 });
  }
};

export const config = {
  path: '/.netlify/functions/grimior-status',
  method: 'GET',
};
