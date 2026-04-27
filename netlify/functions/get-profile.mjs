// get-profile.js — returns subscriber profile, perks, renewal date, and order history.

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

async function rechargeForEmail(email) {
  const key = Netlify.env.get('RECHARGE_API_KEY');
  if (!key) return null;
  try {
    const cRes = await fetch(`https://api.rechargeapps.com/customers?email=${encodeURIComponent(email)}`, {
      headers: { 'X-Recharge-Access-Token': key, 'Accept': 'application/json' }
    });
    const cData = await cRes.json();
    const customer = (cData.customers || [])[0];
    if (!customer) return null;
    const sRes = await fetch(`https://api.rechargeapps.com/subscriptions?customer_id=${customer.id}`, {
      headers: { 'X-Recharge-Access-Token': key, 'Accept': 'application/json' }
    });
    const sData = await sRes.json();
    const sub = (sData.subscriptions || [])[0];
    return { customer, subscription: sub };
  } catch (e) { return null; }
}

async function shopifyOrdersForEmail(email) {
  const shop = Netlify.env.get('SHOPIFY_SHOP_DOMAIN');
  const token = Netlify.env.get('SHOPIFY_ADMIN_API_TOKEN');
  if (!shop || !token) return [];
  try {
    const r = await fetch(`https://${shop}/admin/api/2024-01/orders.json?email=${encodeURIComponent(email)}&status=any&limit=10`, {
      headers: { 'X-Shopify-Access-Token': token, 'Accept': 'application/json' }
    });
    if (!r.ok) return [];
    const data = await r.json();
    return (data.orders || []).map(o => ({
      number: o.order_number || o.name,
      created: o.created_at,
      total: o.total_price,
      currency: o.currency,
      status: o.financial_status
    }));
  } catch (e) { return []; }
}

function monthlyPromoCode() {
  const month = new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' }).toUpperCase().replace(' ', '');
  return `GRIMIOR-${month}`;
}

export default async (req) => {
  const adminEmail = (Netlify.env.get('ADMIN_UNLOCK_EMAIL') || 'awaken@consultant.com').toLowerCase();
  const auth = req.headers.get('authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  const payload = token ? decodeJwtPayload(token) : null;
  const email = payload && payload.email ? String(payload.email).toLowerCase().trim() : '';

  if (!email) {
    return Response.json({ ok: false, error: 'Authentication required.' }, { status: 401 });
  }

  const isAdmin = email === adminEmail;
  const recharge = await rechargeForEmail(email);

  let memberSince = null;
  let renewalDate = null;
  let status = 'inactive';
  let active = false;

  if (recharge && recharge.subscription) {
    const sub = recharge.subscription;
    status = sub.status || 'unknown';
    active = status === 'active' || status === 'ACTIVE';
    renewalDate = sub.next_charge_scheduled_at || null;
    memberSince = sub.created_at || (recharge.customer && recharge.customer.created_at) || null;
  } else {
    try {
      const store = getStore('grimior-subscribers');
      const rec = await store.get(email, { type: 'json' });
      if (rec) {
        status = rec.status || status;
        active = !!rec.active;
        memberSince = rec.createdAt || null;
        renewalDate = rec.nextChargeAt || rec.accessUntil || null;
      }
    } catch (e) {}
  }

  if (isAdmin) { active = true; status = 'admin'; }

  const orders = await shopifyOrdersForEmail(email);

  const profile = {
    ok: true,
    email,
    name: payload && (payload.user_metadata && payload.user_metadata.full_name) || '',
    role: isAdmin ? 'admin' : (active ? 'subscriber' : 'guest'),
    subscription: { status, active, renewalDate, memberSince },
    perks: active ? [
      { icon: '✦', title: '10% Off Every Order', detail: 'Auto-applied at checkout for tagged subscribers.' },
      { icon: '✦', title: 'Free Gift With Every Purchase', detail: 'Added automatically to every order.' },
      { icon: '✦', title: 'Free Shipping on Orders Over $50', detail: 'Subscriber rate.' },
      { icon: '✦', title: 'Exclusive Promo Code', detail: monthlyPromoCode() },
      { icon: '✦', title: 'Full Grimior Access', detail: '88 pages of light magic.' }
    ] : [],
    orders
  };

  return Response.json(profile);
};

export const config = {
  path: '/api/get-profile',
  method: 'GET'
};
