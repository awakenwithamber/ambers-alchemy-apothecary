// Email subscriber capture — stored in Netlify Blobs, de-duplicated per address.
import { getStore } from '@netlify/blobs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(v, max = 120) {
  return String(v == null ? '' : v).replace(/[<>]/g, '').trim().slice(0, max);
}

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  let body;
  try { body = await req.json(); } catch { return new Response('Bad JSON', { status: 400 }); }

  const email = clean(body.email).toLowerCase();
  const name = clean(body.name, 60);
  const source = clean(body.source || 'newsletter', 40);

  if (!email || !EMAIL_RE.test(email)) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid email' }), { status: 400 });
  }

  try {
    const store = getStore('email-subscribers');
    const key = email.replace(/[^a-z0-9]+/gi, '_');
    const prior = await store.get(key, { type: 'json' }).catch(() => null);
    if (prior && prior.email === email) {
      return new Response(JSON.stringify({ ok: true, duplicate: true }), { headers: { 'Content-Type': 'application/json' } });
    }
    await store.setJSON(key, { email, name, source, subscribedAt: new Date().toISOString() });
  } catch (err) {
    console.error('subscribe write failed', err);
    return new Response(JSON.stringify({ ok: false }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
};
