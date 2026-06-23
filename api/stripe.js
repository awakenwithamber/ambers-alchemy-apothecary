// api/stripe.js
// Stripe payment routes: cart checkout (PaymentIntent) + Grimoire subscription checkout

const { getAdminClient } = require('../lib/supabase');
const { computeCartTotal, resolveLineItems } = require('../lib/catalog');
const { sendMail } = require('../lib/mailer');
const emailContent = require('../lib/email-content');

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return require('stripe')(key);
}

// ── Resilient subscriber writes ─────────────────────────────────────────────
// The grimoir_subscribers table is being extended with new columns
// (subscription_status, current_period_end, discount_code, free_gift_sent,
// welcome_email_sent, shopify_tag_applied, updated_at). Until that migration is
// applied in Supabase, writes that reference the new columns would fail. These
// helpers try the richer payload first and transparently fall back to the
// core columns, so subscription activation never breaks.
function isMissingColumnErr(err) {
  if (!err) return false;
  if (err.code === 'PGRST204') return true;
  const m = `${err.message || ''} ${err.details || ''} ${err.hint || ''}`;
  return /does not exist/i.test(m) && /column/i.test(m)
    || /could not find the .* column/i.test(m);
}

async function resilientUpsert(sb, rich, base) {
  let { error } = await sb.from('grimoir_subscribers').upsert(rich, { onConflict: 'email' });
  if (error && isMissingColumnErr(error)) {
    ({ error } = await sb.from('grimoir_subscribers').upsert(base, { onConflict: 'email' }));
  }
  return error;
}

async function resilientUpdate(sb, richPatch, basePatch, col, val) {
  let { error } = await sb.from('grimoir_subscribers').update(richPatch).eq(col, val);
  if (error && isMissingColumnErr(error)) {
    ({ error } = await sb.from('grimoir_subscribers').update(basePatch).eq(col, val));
  }
  return error;
}

// POST /api/create-payment-intent
// Body: { cartItems: [{name, qty, unitPrice?}], currency, description, customerName, email }
// Amount is computed server-side from lib/catalog — the client-supplied amount field is ignored.
async function createPaymentIntent(req, res) {
  try {
    const stripe = getStripe();
    const { cartItems, description, customerName, email } = req.body;
    // Currency is hardcoded server-side — never trusted from the client.
    // Allowing the client to supply currency would let an attacker swap to a
    // lower-value or zero-decimal currency and undercharge for USD-priced goods.
    const CURRENCY = 'usd';

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: 'cartItems is required' });
    }

    let computed, lineItems;
    try {
      lineItems = resolveLineItems(cartItems);
      computed = computeCartTotal(cartItems);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    const { amountCents, total, subtotal, shipping, tax } = computed;
    // Build the paid-order item summary from canonical, server-derived
    // descriptions — never from the client's free-text item names.
    const itemsSummary = lineItems
      .map(li => `${li.description} x${li.qty} @ $${li.unitPrice.toFixed(2)}`)
      .join(', ')
      .substring(0, 500);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: CURRENCY,
      description,
      metadata: {
        checkout_flow: 'cart',
        customer_name: customerName || '',
        email: email || '',
        items: itemsSummary,
        server_subtotal: subtotal.toFixed(2),
        server_shipping: shipping.toFixed(2),
        server_tax: tax.toFixed(2),
        server_total: total.toFixed(2),
      },
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      serverTotal: total,
      serverSubtotal: subtotal,
      serverShipping: shipping,
      serverTax: tax,
    });
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

    const customerId = (sub.customer && typeof sub.customer === 'object' && sub.customer.id) || sub.customer || null;
    const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;
    const nowIso = new Date().toISOString();

    const supabase = getAdminClient();

    // Has this subscriber already been welcomed? Used to send the welcome + gift
    // emails exactly once. select('*') tolerates the table not yet having the
    // new columns (we read them defensively).
    let alreadyWelcomed = false;
    try {
      const { data: row } = await supabase
        .from('grimoir_subscribers')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();
      if (row && row.welcome_email_sent) alreadyWelcomed = true;
    } catch (_) { /* table/columns may be absent — treat as not welcomed */ }

    const base = {
      email: normalizedEmail,
      active: true,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscribed_at: nowIso,
    };
    const rich = {
      ...base,
      subscription_status: sub.status,
      current_period_end: periodEnd,
      updated_at: nowIso,
    };

    const error = await resilientUpsert(supabase, rich, base);
    if (error) {
      console.error('[grimoire-activate] Supabase upsert error:', error.message);
      return res.status(500).json({ ok: false, error: 'Could not record subscription' });
    }

    // Send the welcome + free-gift emails exactly once (best-effort — never block
    // activation). Claim the send by setting welcome_email_sent/free_gift_sent;
    // if those columns don't exist yet the claim is a no-op and we still send.
    if (!alreadyWelcomed) {
      resilientUpdate(
        supabase,
        { welcome_email_sent: true, free_gift_sent: true, updated_at: nowIso },
        {},
        'email',
        normalizedEmail
      ).catch((e) => console.error('[grimoire-activate] flag update:', e && e.message));

      const welcome = emailContent.grimoireWelcome({ email: normalizedEmail });
      sendMail({ to: normalizedEmail, subject: welcome.subject, html: welcome.html, text: welcome.text })
        .catch((e) => console.error('[grimoire-welcome-email]', e.message));

      const gift = emailContent.grimoireFreeGift({ email: normalizedEmail });
      sendMail({ to: normalizedEmail, subject: gift.subject, html: gift.html, text: gift.text })
        .catch((e) => console.error('[grimoire-gift-email]', e.message));
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
      const nowIso = new Date().toISOString();

      // Look up the subscriber so we can email them and avoid duplicate sends.
      let row = null;
      try {
        ({ data: row } = await supabase
          .from('grimoir_subscribers')
          .select('*')
          .eq('stripe_subscription_id', sub.id)
          .maybeSingle());
      } catch (_) { /* tolerate missing columns */ }

      await resilientUpdate(
        supabase,
        { active: false, expires_at: nowIso, subscription_status: 'canceled', updated_at: nowIso },
        { active: false, expires_at: nowIso },
        'stripe_subscription_id',
        sub.id
      );
      console.log(`[stripe-webhook] Grimoire subscription cancelled: ${sub.id}`);

      // Send the reactivation email (best-effort), only if it was previously active.
      const targetEmail = (row && row.email) || '';
      if (targetEmail && (!row || row.active !== false)) {
        const msg = emailContent.grimoireReactivation({ email: targetEmail });
        sendMail({ to: targetEmail, subject: msg.subject, html: msg.html, text: msg.text })
          .catch((e) => console.error('[grimoire-reactivation-email]', e.message));
      }
    } catch (err) {
      console.error('[stripe-webhook] Supabase update error:', err.message);
    }
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;
    const email = (invoice.customer_email || '').toLowerCase().trim();
    try {
      const supabase = getAdminClient();
      const nowIso = new Date().toISOString();
      if (subscriptionId) {
        await resilientUpdate(
          supabase,
          { subscription_status: 'past_due', updated_at: nowIso },
          {},
          'stripe_subscription_id',
          subscriptionId
        );
      }
      // Resolve the email for the reminder (fall back to the stored row).
      let targetEmail = email;
      if (!targetEmail && subscriptionId) {
        try {
          const { data: row } = await supabase
            .from('grimoir_subscribers')
            .select('email')
            .eq('stripe_subscription_id', subscriptionId)
            .maybeSingle();
          targetEmail = (row && row.email) || '';
        } catch (_) { /* ignore */ }
      }
      if (targetEmail) {
        const msg = emailContent.grimoirePaymentReminder({ email: targetEmail });
        sendMail({ to: targetEmail, subject: msg.subject, html: msg.html, text: msg.text })
          .catch((e) => console.error('[grimoire-payment-reminder-email]', e.message));
        console.log(`[stripe-webhook] Payment failed reminder queued: ${targetEmail}`);
      }
    } catch (err) {
      console.error('[stripe-webhook] payment_failed handling error:', err.message);
    }
  }

  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;
    if (subscriptionId) {
      try {
        const supabase = getAdminClient();
        const nowIso = new Date().toISOString();
        const periodEnd = invoice.lines?.data?.[0]?.period?.end
          ? new Date(invoice.lines.data[0].period.end * 1000).toISOString()
          : null;
        await resilientUpdate(
          supabase,
          { active: true, subscription_status: 'active', current_period_end: periodEnd, updated_at: nowIso },
          { active: true },
          'stripe_subscription_id',
          subscriptionId
        );
      } catch (err) {
        console.error('[stripe-webhook] payment_succeeded handling error:', err.message);
      }
    }
  }

  res.json({ received: true });
}

module.exports = { createPaymentIntent, publishableKey, grimoireSubscribe, grimoireActivate, stripeWebhook };
