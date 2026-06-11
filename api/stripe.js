// api/stripe.js
// Stripe payment routes: cart checkout (PaymentIntent) + Grimoire subscription checkout

const { getAdminClient } = require('../lib/supabase');

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return require('stripe')(key);
}

// POST /api/create-payment-intent
// Body: { amount (cents), currency, description, metadata }
async function createPaymentIntent(req, res) {
  try {
    const stripe = getStripe();
    const { amount, currency = 'usd', description, metadata } = req.body;

    if (!amount || amount < 50) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      description,
      metadata: metadata || {},
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret, id: paymentIntent.id });
  } catch (err) {
    console.error('[create-payment-intent]', err.message);
    res.status(500).json({ error: err.message });
  }
}

// GET /api/stripe-publishable-key
// Returns the publishable key so client JS can init Stripe
async function publishableKey(req, res) {
  const key = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!key) return res.status(500).json({ error: 'Stripe not configured' });
  res.json({ key });
}

// POST /api/grimoire-subscribe
// Creates a Stripe Checkout Session for the $3.33/month Grimoire subscription
// Returns { url } to redirect to
async function grimoireSubscribe(req, res) {
  try {
    const stripe = getStripe();
    const { email } = req.body;

    const host = req.headers.host || 'awakenagain.com';
    const protocol = host.includes('localhost') || host.includes('replit') ? 'https' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: "Amber's Living Grimoire — Inner Circle",
              description: '88 pages of botanical rituals, protection workings, light magic, and sacred herbalism. Cancel anytime.',
              images: [],
            },
            unit_amount: 333,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/grimoir?subscribed=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/grimoir`,
      metadata: { source: 'grimoire-subscribe' },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('[grimoire-subscribe]', err.message);
    res.status(500).json({ error: err.message });
  }
}

// POST /api/stripe-webhook
// Handles Stripe webhook events to activate Grimoire subscribers
async function stripeWebhook(req, res) {
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, webhookSecret);
    } else {
      event = req.body;
    }
  } catch (err) {
    console.error('[stripe-webhook] signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature invalid' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = (session.customer_email || session.customer_details?.email || '').toLowerCase().trim();

    if (email && session.mode === 'subscription') {
      try {
        const supabase = getAdminClient();
        await supabase.from('grimoir_subscribers').upsert(
          { email, active: true, stripe_subscription_id: session.subscription, subscribed_at: new Date().toISOString() },
          { onConflict: 'email' }
        );
        console.log(`[stripe-webhook] Grimoire subscriber activated: ${email}`);
      } catch (err) {
        console.error('[stripe-webhook] Supabase upsert error:', err.message);
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object;
    try {
      const supabase = getAdminClient();
      await supabase.from('grimoir_subscribers')
        .update({ active: false, expires_at: new Date().toISOString() })
        .eq('stripe_subscription_id', sub.id);
      console.log(`[stripe-webhook] Grimoire subscription cancelled: ${sub.id}`);
    } catch (err) {
      console.error('[stripe-webhook] Supabase update error:', err.message);
    }
  }

  res.json({ received: true });
}

module.exports = { createPaymentIntent, publishableKey, grimoireSubscribe, stripeWebhook };
