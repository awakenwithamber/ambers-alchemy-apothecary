// Persists custom remedy / soap builder progress to Netlify Blobs so the user
// can resume — and so Amber has a record of what was being designed.
import { getStore } from '@netlify/blobs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeString(v, max = 500) {
  if (v == null) return '';
  return String(v).replace(/[<>]/g, '').trim().slice(0, max);
}

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  let body;
  try { body = await req.json(); } catch { return new Response('Bad JSON', { status: 400 }); }

  const email = sanitizeString(body.email || '', 120).toLowerCase();
  if (email && !EMAIL_RE.test(email)) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid email' }), { status: 400 });
  }

  const record = {
    id: body.id || `bld-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    email,
    type: sanitizeString(body.type || 'remedy', 40),
    selectedSymptoms: Array.isArray(body.selectedSymptoms) ? body.selectedSymptoms.slice(0, 40).map((s) => sanitizeString(s, 60)) : [],
    selectedHerbs: Array.isArray(body.selectedHerbs) ? body.selectedHerbs.slice(0, 40).map((s) => sanitizeString(s, 60)) : [],
    suggestedFormat: sanitizeString(body.suggestedFormat || '', 60),
    suggestedRemedy: sanitizeString(body.suggestedRemedy || '', 120),
    cartPayload: body.cartPayload && typeof body.cartPayload === 'object' ? body.cartPayload : null,
    notes: sanitizeString(body.notes || '', 800),
    updatedAt: new Date().toISOString(),
  };

  try {
    const store = getStore('builder-sessions');
    await store.setJSON(record.id, record);
  } catch (err) {
    console.error('builder-session write failed', err);
    return new Response(JSON.stringify({ ok: false }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
  return new Response(JSON.stringify({ ok: true, id: record.id }), { headers: { 'Content-Type': 'application/json' } });
};
