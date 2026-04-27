// Creates a Stripe Checkout Session for The Grimior subscription ($3.33 / month).
// Inline price_data is supported by Stripe Checkout in subscription mode, so no
// pre-created Price ID is required. Subscriber access is later tied to email.
//
// Requires STRIPE_SECRET_KEY environment variable. Falls back gracefully if
// Stripe is not configured by returning a clear error to the client.

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const stripeKey = Netlify.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) {
    return Response.json(
      { error: 'Subscription gate is not yet configured. Please contact awaken@consultant.com.' },
      { status: 500 }
    );
  }

  let payload;
  try { payload = await req.json(); } catch (e) {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const email = String(payload.email || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'A valid email is required.' }, { status: 400 });
  }

  const url = new URL(req.url);
  const origin = url.origin;
  const successUrl = `${origin}/?grimior=success&grimior_session_id={CHECKOUT_SESSION_ID}#the-grimior`;
  const cancelUrl  = `${origin}/?grimior=cancel#the-grimior`;

  const params = new URLSearchParams();
  params.append('mode', 'subscription');
  params.append('success_url', successUrl);
  params.append('cancel_url', cancelUrl);
  params.append('customer_email', email);
  params.append('client_reference_id', email);
  params.append('allow_promotion_codes', 'true');
  // $3.33 / month — 333 cents, recurring monthly
  params.append('line_items[0][quantity]', '1');
  params.append('line_items[0][price_data][currency]', 'usd');
  params.append('line_items[0][price_data][unit_amount]', '333');
  params.append('line_items[0][price_data][product_data][name]', 'The Grimior — A True Book of Light Magic');
  params.append('line_items[0][price_data][product_data][description]', 'Monthly access to all 88 pages, exclusive promo codes, monthly featured product, seasonal rituals, and new content as it is added.');
  params.append('line_items[0][price_data][recurring][interval]', 'month');
  params.append('subscription_data[metadata][product]', 'grimior');
  params.append('subscription_data[metadata][email]', email);
  params.append('metadata[product]', 'grimior');
  params.append('metadata[email]', email);

  try {
    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    const session = await stripeRes.json();
    if (session.error) {
      return Response.json({ error: session.error.message || 'Stripe error.' }, { status: 400 });
    }
    return Response.json({ url: session.url, id: session.id });
  } catch (err) {
    return Response.json({ error: 'Could not reach the gate. Please try again.' }, { status: 500 });
  }
};

export const config = {
  path: '/api/grimior-subscribe',
  method: 'POST',
};
