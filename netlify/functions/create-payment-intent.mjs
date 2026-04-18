// Creates a Stripe PaymentIntent for secure card payments
// Requires STRIPE_SECRET_KEY environment variable

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
      { error: 'Payment processing is not configured. Please contact the store owner.' },
      { status: 500 }
    );
  }

  try {
    const { amount, currency, description, metadata } = await req.json();

    if (!amount || amount < 50) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Create PaymentIntent via Stripe API directly (no SDK needed)
    const params = new URLSearchParams();
    params.append('amount', String(Math.round(amount)));
    params.append('currency', currency || 'usd');
    params.append('description', description || 'Amber\'s Alchemy Apothecary Order');
    params.append('automatic_payment_methods[enabled]', 'true');

    if (metadata) {
      for (const [key, value] of Object.entries(metadata)) {
        params.append(`metadata[${key}]`, String(value).substring(0, 500));
      }
    }

    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const paymentIntent = await stripeResponse.json();

    if (paymentIntent.error) {
      return Response.json(
        { error: paymentIntent.error.message },
        { status: 400 }
      );
    }

    return Response.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    return Response.json(
      { error: 'Payment processing error. Please try again.' },
      { status: 500 }
    );
  }
};

export const config = {
  path: '/api/create-payment-intent',
  method: 'POST',
};
