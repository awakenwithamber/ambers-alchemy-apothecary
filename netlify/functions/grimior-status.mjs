// Looks up a Grimior subscriber by email. Returns {active: boolean}.
// First reads the cached record from Netlify Blobs, then verifies live with
// Stripe (if configured) so canceled subscriptions stop granting access. The
// blob record is refreshed from the live result.

import { getStore } from "@netlify/blobs";

export default async (req) => {
  const url = new URL(req.url);
  const email = (url.searchParams.get('email') || '').toLowerCase().trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ active: false, error: 'Invalid email.' }, { status: 400 });
  }

  const store = getStore('grimior-subscribers');
  let record = null;
  try { record = await store.get(email, { type: 'json' }); } catch (e) { record = null; }

  // No record at all — definitely not a subscriber.
  if (!record) {
    return Response.json({ active: false, email });
  }

  const stripeKey = Netlify.env.get('STRIPE_SECRET_KEY');
  let active = !!record.active;
  let status = record.status || 'unknown';

  // Verify live with Stripe if we have a subscription id and a key.
  if (stripeKey && record.subscriptionId) {
    try {
      const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${encodeURIComponent(record.subscriptionId)}`, {
        headers: { 'Authorization': `Bearer ${stripeKey}` }
      });
      const sub = await subRes.json();
      if (!sub.error) {
        status = sub.status || status;
        active = status === 'active' || status === 'trialing';
        try {
          await store.setJSON(email, {
            ...record,
            status,
            active,
            lastCheckedAt: new Date().toISOString()
          });
        } catch (e) { /* non-fatal */ }
      }
    } catch (e) {
      // Network failure: fall back to cached record.
    }
  }

  return Response.json({ active, status, email });
};

export const config = {
  path: '/api/grimior-status',
  method: 'GET',
};
