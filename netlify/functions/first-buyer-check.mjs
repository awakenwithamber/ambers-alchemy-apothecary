// Returns first-time-buyer eligibility for an email.
// Reads from the customers blob store and reports whether a first-order
// discount is still available.
import { getStore } from '@netlify/blobs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async (req) => {
  let email = '';
  if (req.method === 'GET') {
    const url = new URL(req.url);
    email = String(url.searchParams.get('email') || '').toLowerCase().trim();
  } else if (req.method === 'POST') {
    try {
      const body = await req.json();
      email = String(body.email || '').toLowerCase().trim();
    } catch { /* ignore */ }
  } else {
    return new Response('Method not allowed', { status: 405 });
  }

  if (!email || !EMAIL_RE.test(email)) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid email' }), { status: 400 });
  }

  try {
    const store = getStore('customers');
    const key = email.replace(/[^a-z0-9]+/gi, '_');
    const record = await store.get(key, { type: 'json' }).catch(() => null);
    const eligible = !record || !record.hasUsedFirstOrderDiscount;
    return new Response(
      JSON.stringify({ ok: true, firstTimeEligible: eligible, hasPurchased: !!(record && record.firstOrderDate) }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('first-buyer-check failed', err);
    return new Response(JSON.stringify({ ok: false }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
