// tarot-of-day.js — serves the daily tarot card to active subscribers.
// Same card all day across all subscribers for shared synchronicity.

import { TAROT_DECK } from "../../grimior-content/tarot.js";
import { getStore } from "@netlify/blobs";

function decodeJwtPayload(token) {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - b64.length % 4) % 4);
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
  } catch (e) { return null; }
}

function dayOfYearSeed() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 0));
  const diff = now - start;
  const day = Math.floor(diff / (1000 * 60 * 60 * 24));
  return now.getUTCFullYear() * 1000 + day;
}

async function isAuthorized(email) {
  const adminEmail = (Netlify.env.get('ADMIN_UNLOCK_EMAIL') || 'awaken@consultant.com').toLowerCase();
  if (email === adminEmail) return true;

  const rechargeKey = Netlify.env.get('RECHARGE_API_KEY');
  if (rechargeKey) {
    try {
      const cRes = await fetch(`https://api.rechargeapps.com/customers?email=${encodeURIComponent(email)}`, {
        headers: { 'X-Recharge-Access-Token': rechargeKey, 'Accept': 'application/json' }
      });
      const cData = await cRes.json();
      const customer = (cData.customers || [])[0];
      if (customer) {
        const sRes = await fetch(`https://api.rechargeapps.com/subscriptions?customer_id=${customer.id}&status=active`, {
          headers: { 'X-Recharge-Access-Token': rechargeKey, 'Accept': 'application/json' }
        });
        const sData = await sRes.json();
        if ((sData.subscriptions || []).length > 0) return true;
      }
    } catch (e) {}
  }

  // Fallback to blob cache
  try {
    const store = getStore('grimior-subscribers');
    const rec = await store.get(email, { type: 'json' });
    if (rec && (rec.active || rec.status === 'active' || rec.status === 'trialing')) return true;
  } catch (e) {}

  return false;
}

export default async (req) => {
  const auth = req.headers.get('authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  let email = '';
  if (token) {
    const payload = decodeJwtPayload(token);
    if (payload && payload.email) email = String(payload.email).toLowerCase().trim();
  }
  if (!email) {
    try {
      const u = new URL(req.url);
      const q = (u.searchParams.get('email') || '').toLowerCase().trim();
      if (q) email = q;
    } catch (e) {}
  }

  if (!email) {
    return Response.json({ ok: false, error: 'Authentication required.' }, { status: 401 });
  }

  if (!(await isAuthorized(email))) {
    return Response.json({ ok: false, error: 'Subscription required to draw the daily card.' }, { status: 403 });
  }

  const seed = dayOfYearSeed();
  const card = TAROT_DECK[seed % TAROT_DECK.length];

  // Optional: log view to subscriber profile
  try {
    const store = getStore('grimior-tarot-views');
    await store.setJSON(`${email}-${seed}`, { email, seed, cardId: card.id, viewedAt: new Date().toISOString() });
  } catch (e) {}

  return Response.json({ ok: true, card, date: new Date().toISOString().slice(0, 10) });
};

export const config = {
  path: '/api/tarot-of-day',
  method: 'GET'
};
