// Logs an anonymous Lunna assistant session to Netlify Blobs.
// Useful for understanding which goals visitors self-select so content can be tuned.
import { getStore } from '@netlify/blobs';

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  let body;
  try { body = await req.json(); } catch { return new Response('Bad JSON', { status: 400 }); }

  const goal = typeof body.goal === 'string' ? body.goal.slice(0, 40) : '';
  const followup = typeof body.followup === 'string' ? body.followup.slice(0, 40) : '';
  const at = new Date().toISOString();

  try {
    const store = getStore('lunna-sessions');
    const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await store.setJSON(key, { goal, followup, at, ua: req.headers.get('user-agent') || '' });
  } catch (err) {
    console.error('lunna-session write failed', err);
    return new Response(JSON.stringify({ ok: false }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
};
