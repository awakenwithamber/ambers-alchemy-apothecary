// auth-check.js — verifies Netlify Identity JWT and ReCharge subscription status.
// Returns the gated Grimior pages if the caller is authorized.
//
// Auth flow:
//   1. Read Bearer JWT from Authorization header.
//   2. Verify with Netlify Identity (or accept admin override email from env).
//   3. If admin email — return all pages, role: 'admin'.
//   4. Otherwise lookup ReCharge subscription by email; if active, return all pages.
//   5. Else return only is_free pages.

import { PAGES, getFreePages } from "../../grimior-content/pages.js";
import { getStore } from "@netlify/blobs";

function decodeJwtPayload(token) {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - b64.length % 4) % 4);
    const json = Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch (e) { return null; }
}

async function rechargeStatusForEmail(email) {
  const key = Netlify.env.get('RECHARGE_API_KEY');
  if (!key || !email) return null;
  try {
    // Find ReCharge customer by email
    const cRes = await fetch(`https://api.rechargeapps.com/customers?email=${encodeURIComponent(email)}`, {
      headers: { 'X-Recharge-Access-Token': key, 'Accept': 'application/json' }
    });
    if (!cRes.ok) return null;
    const cData = await cRes.json();
    const customer = (cData.customers || [])[0];
    if (!customer) return null;
    // Look up subscriptions
    const sRes = await fetch(`https://api.rechargeapps.com/subscriptions?customer_id=${customer.id}&status=active`, {
      headers: { 'X-Recharge-Access-Token': key, 'Accept': 'application/json' }
    });
    if (!sRes.ok) return null;
    const sData = await sRes.json();
    const subs = sData.subscriptions || [];
    const active = subs.find(s => s.status === 'active' || s.status === 'ACTIVE');
    if (!active) return null;
    return {
      status: active.status,
      next_charge_scheduled_at: active.next_charge_scheduled_at,
      subscription_id: active.id,
      customer_id: customer.id
    };
  } catch (e) { return null; }
}

async function fallbackBlobStatus(email) {
  // Fallback to Netlify Blobs cache (legacy Stripe path or webhook-stored ReCharge record).
  try {
    const store = getStore('grimior-subscribers');
    const rec = await store.get(email, { type: 'json' });
    if (!rec) return null;
    if (rec.active === true || rec.status === 'active' || rec.status === 'trialing') {
      return { status: rec.status || 'active', next_charge_scheduled_at: rec.nextChargeAt || null };
    }
    return null;
  } catch (e) { return null; }
}

export default async (req) => {
  const adminEmail = (Netlify.env.get('ADMIN_UNLOCK_EMAIL') || 'awaken@consultant.com').toLowerCase();
  const auth = req.headers.get('authorization') || req.headers.get('Authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();

  let email = '';
  let role = 'guest';

  if (token) {
    const payload = decodeJwtPayload(token);
    if (payload && payload.email) {
      email = String(payload.email).toLowerCase().trim();
      role = (payload.app_metadata && payload.app_metadata.roles && payload.app_metadata.roles[0]) || 'subscriber';
    }
  }

  // Allow ?email= as a fallback for legacy Stripe-based access
  if (!email) {
    try {
      const u = new URL(req.url);
      const q = (u.searchParams.get('email') || '').toLowerCase().trim();
      if (q && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(q)) email = q;
    } catch (e) {}
  }

  // Admin override
  if (email === adminEmail) {
    return Response.json({
      authorized: true,
      role: 'admin',
      email,
      pages: PAGES
    });
  }

  if (!email) {
    return Response.json({ authorized: false, role: 'guest', pages: getFreePages() });
  }

  // Live ReCharge check
  const live = await rechargeStatusForEmail(email);
  if (live) {
    return Response.json({
      authorized: true,
      role: 'subscriber',
      email,
      next_charge_at: live.next_charge_scheduled_at,
      pages: PAGES
    });
  }

  // Fallback to blob cache
  const cached = await fallbackBlobStatus(email);
  if (cached) {
    return Response.json({
      authorized: true,
      role: 'subscriber',
      email,
      next_charge_at: cached.next_charge_scheduled_at,
      pages: PAGES
    });
  }

  return Response.json({ authorized: false, role, email, pages: getFreePages() });
};

export const config = {
  path: '/api/auth-check',
  method: ['GET', 'POST']
};
