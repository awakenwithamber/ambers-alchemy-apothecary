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
// On-site $3.33/month Grimoire subscription via Stripe Elements (no redirect).
// Body: { email, paymentMethodId }
// Returns { subscriptionId, clientSecret } so the client can confirm on-site.
async function grimoireSubscribe(req, res) {
  try {
    const stripe = getStripe();
    const { email, paymentMethodId } = req.body;

    if (!email || !paymentMethodId) {
      return res.status(400).json({ error: 'email and paymentMethodId required' });
    }
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Find or create the customer
    const existing = await stripe.customers.list({ email: normalizedEmail, limit: 1 });
    let customer = existing.data[0];
    if (!customer) {
      customer = await stripe.customers.create({ email: normalizedEmail });
    }

    // 2. Attach the payment method and make it the default
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id });
    await stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // 3. Reuse a price for the Grimoire product, or create one
    const productName = "Amber's Living Grimoire — Inner Circle";
    let price;
    const prices = await stripe.prices.list({ active: true, limit: 100, expand: ['data.product'] });
    price = prices.data.find(
      (p) => p.recurring && p.unit_amount === 333 && p.currency === 'usd' &&
        p.product && p.product.name === productName
    );
    if (!price) {
      price = await stripe.prices.create({
        currency: 'usd',
        unit_amount: 333,
        recurring: { interval: 'month' },
        product_data: { name: productName },
      });
    }

    // 4. Create the subscription, requiring on-site payment confirmation
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: { source: 'grimoire-subscribe', email: normalizedEmail },
    });

    const clientSecret = subscription.latest_invoice?.payment_intent?.client_secret || null;

    res.json({ subscriptionId: subscription.id, clientSecret });
  } catch (err) {
    console.error('[grimoire-subscribe]', err.message);
    res.status(500).json({ error: err.message });
  }
}

// POST /api/grimoire-activate
// Called by the client after an on-site subscription payment succeeds.
// Verifies the subscription is active in Stripe, then records the subscriber in Supabase.
// Body: { email, subscriptionId }
async function grimoireActivate(req, res) {
  try {
    const stripe = getStripe();
    const { email, subscriptionId } = req.body;

    if (!email || !subscriptionId) {
      return res.status(400).json({ ok: false, error: 'email and subscriptionId required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const sub = await stripe.subscriptions.retrieve(subscriptionId, { expand: ['customer'] });
    if (!sub || !['active', 'trialing'].includes(sub.status)) {
      return res.status(402).json({ ok: false, error: 'Subscription not active', status: sub && sub.status });
    }

    // Verify the requesting email actually owns this subscription (prevents
    // a client from claiming access to an arbitrary active subscription id).
    const subEmail = (
      (sub.customer && typeof sub.customer === 'object' && sub.customer.email) ||
      sub.metadata?.email ||
      ''
    ).toLowerCase().trim();
    if (!subEmail || subEmail !== normalizedEmail) {
      return res.status(403).json({ ok: false, error: 'Subscription does not belong to this email' });
    }

    const supabase = getAdminClient();
    const { error } = await supabase.from('grimoir_subscribers').upsert(
      {
        email: normalizedEmail,
        active: true,
        stripe_subscription_id: subscriptionId,
        subscribed_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    );

    if (error) {
      console.error('[grimoire-activate] Supabase upsert error:', error.message);
      return res.status(500).json({ ok: false, error: 'Could not record subscription' });
    }

    res.json({ ok: true, access: true });
  } catch (err) {
    console.error('[grimoire-activate]', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
}

// POST /api/stripe-webhook
// Handles Stripe webhook events to activate Grimoire subscribers
async function stripeWebhook(req, res) {
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Refuse to process events unless we can cryptographically verify them.
  // Without this, anyone could POST a forged "subscription active" event.
  if (!webhookSecret) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET not configured; rejecting unverifiable event');
    return res.status(503).json({ error: 'Webhook not configured' });
  }
  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, webhookSecret);
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

module.exports = { createPaymentIntent, publishableKey, grimoireSubscribe, grimoireActivate, stripeWebhook };
