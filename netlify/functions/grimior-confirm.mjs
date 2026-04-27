// Confirms a Stripe Checkout Session after a successful Grimior subscription
// and stores the subscriber record in Netlify Blobs (store: "grimior-subscribers").
// The client calls this when returning from Stripe with ?grimior_session_id=...

import { getStore } from "@netlify/blobs";

export default async (req) => {
  const stripeKey = Netlify.env.get('STRIPE_SECRET_KEY');
  const url = new URL(req.url);
  const sessionId = url.searchParams.get('session_id');

  if (!sessionId) {
    return Response.json({ active: false, error: 'Missing session_id' }, { status: 400 });
  }
  if (!stripeKey) {
    return Response.json({ active: false, error: 'Subscription gate not configured.' }, { status: 500 });
  }

  try {
    const sRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=subscription`, {
      headers: { 'Authorization': `Bearer ${stripeKey}` },
    });
    const session = await sRes.json();
    if (session.error) {
      return Response.json({ active: false, error: session.error.message }, { status: 400 });
    }

    const email = (session.customer_email
                || (session.customer_details && session.customer_details.email)
                || (session.metadata && session.metadata.email)
                || '').toLowerCase().trim();

    const subscription = session.subscription && typeof session.subscription === 'object'
      ? session.subscription
      : null;

    const subscriptionId = subscription
      ? subscription.id
      : (typeof session.subscription === 'string' ? session.subscription : '');

    const status = subscription ? subscription.status : (session.payment_status === 'paid' ? 'active' : 'pending');
    const active = status === 'active' || status === 'trialing';

    if (email) {
      const store = getStore('grimior-subscribers');
      const now = new Date().toISOString();
      await store.setJSON(email, {
        email,
        subscriptionId,
        customerId: session.customer || '',
        status,
        active,
        createdAt: now,
        lastCheckedAt: now,
        sessionId
      });
    }

    return Response.json({ active, email, status });
  } catch (err) {
    return Response.json({ active: false, error: 'Could not confirm session.' }, { status: 500 });
  }
};

export const config = {
  path: '/api/grimior-confirm',
  method: 'GET',
};
