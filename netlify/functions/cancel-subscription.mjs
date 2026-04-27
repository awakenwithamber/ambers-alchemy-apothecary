// cancel-subscription.js — cancels the caller's ReCharge subscription.
// Authenticates via Netlify Identity JWT (or admin email override).

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

async function sendCancellationEmail(email, name) {
  const klaviyoKey = Netlify.env.get('KLAVIYO_API_KEY');
  const fromEmail = Netlify.env.get('NOTIFICATION_FROM_EMAIL') || 'noreply@awakenagain.app';
  if (!klaviyoKey) return false;
  try {
    await fetch('https://a.klaviyo.com/api/events/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${klaviyoKey}`,
        'revision': '2024-10-15',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        data: {
          type: 'event',
          attributes: {
            properties: { template: 'grimior-cancelled', from_email: fromEmail },
            metric: { data: { type: 'metric', attributes: { name: 'Grimior Cancellation' } } },
            profile: { data: { type: 'profile', attributes: { email, first_name: name } } }
          }
        }
      })
    });
    return true;
  } catch (e) { return false; }
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
      const body = await req.json();
      email = (body.email || '').toLowerCase().trim();
    } catch (e) {}
  }

  if (!email) {
    return Response.json({ ok: false, error: 'Authentication required.' }, { status: 401 });
  }

  const rechargeKey = Netlify.env.get('RECHARGE_API_KEY');
  let endDate = null;

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
        const sub = (sData.subscriptions || [])[0];
        if (sub) {
          endDate = sub.next_charge_scheduled_at;
          await fetch(`https://api.rechargeapps.com/subscriptions/${sub.id}/cancel`, {
            method: 'POST',
            headers: { 'X-Recharge-Access-Token': rechargeKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cancellation_reason: 'Customer cancelled via profile page',
              send_email: true
            })
          });
        }
      }
    } catch (e) {
      return Response.json({ ok: false, error: 'Could not cancel subscription.' }, { status: 502 });
    }
  }

  // Update local record so UI reflects pending cancellation immediately.
  try {
    const store = getStore('grimior-subscribers');
    const rec = await store.get(email, { type: 'json' });
    if (rec) {
      await store.setJSON(email, {
        ...rec,
        status: 'cancelling',
        cancelledAt: new Date().toISOString(),
        accessUntil: endDate || rec.nextChargeAt || null
      });
    }
  } catch (e) { /* non-fatal */ }

  await sendCancellationEmail(email, '');

  return Response.json({
    ok: true,
    email,
    accessUntil: endDate,
    message: 'Subscription cancelled. Access continues until end of current billing period.'
  });
};

export const config = {
  path: '/api/cancel-subscription',
  method: 'POST'
};
