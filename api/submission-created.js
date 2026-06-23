const { getAdminClient } = require('../lib/supabase');
const { sendPurchaseConfirmation } = require('./email');

const REVIEW_REQUEST_DELAY_DAYS = 10;

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return require('stripe')(key);
}

exports.handle = async (req, res) => {
  const body = req.body || {};
  const payload = body.payload || body;
  const data = payload.data || payload;

  const clientPaymentStatus = data['payment-status'] || data.paymentStatus || '';
  const clientTransactionId = data['transaction-id'] || data.transactionId || '';

  // When the client claims the payment is paid, verify with Stripe before
  // accepting the order. The transaction-id for Stripe PaymentIntents always
  // starts with "pi_". Any claim of "paid" without a verifiable PI is rejected.
  let verifiedPaymentStatus = clientPaymentStatus;
  let verifiedOrderTotal = data['order-total'] || data.orderTotal;
  let verifiedProduct = data['product-ordered'] || data.product;
  let orderId;

  if (clientPaymentStatus === 'paid') {
    if (!clientTransactionId || !clientTransactionId.startsWith('pi_')) {
      return res.status(400).json({ ok: false, error: 'Invalid payment reference' });
    }
    try {
      const stripe = getStripe();
      const pi = await stripe.paymentIntents.retrieve(clientTransactionId);
      if (!pi || pi.status !== 'succeeded') {
        return res.status(402).json({ ok: false, error: 'Payment not verified' });
      }
      // Reject PIs denominated in anything other than USD — currency manipulation
      // could allow an attacker to pay in a lower-value currency.
      if (pi.currency !== 'usd') {
        console.warn('[submission-created] Non-USD currency on PI:', pi.id, pi.currency);
        return res.status(402).json({ ok: false, error: 'Payment currency not accepted' });
      }

      // Require the checkout_flow marker written server-side at PI creation.
      // Any PI created outside the store's cart flow (e.g., a PI from a test or
      // a different integration) will be missing this field and must be rejected,
      // preventing a legitimate PI from a different context being replayed here.
      if (!pi.metadata || pi.metadata.checkout_flow !== 'cart') {
        console.warn('[submission-created] PI missing checkout_flow marker:', pi.id);
        return res.status(402).json({ ok: false, error: 'Payment not associated with a cart checkout' });
      }

      // Require that the server-recorded items string is present — without it we
      // cannot bind the order to specific goods. Never fall back to client product
      // fields for paid orders.
      if (!pi.metadata.items) {
        console.warn('[submission-created] PI missing items metadata:', pi.id);
        return res.status(402).json({ ok: false, error: 'Payment record is incomplete' });
      }

      // Bind the submitted email to the purchaser email stored in PI metadata.
      // This prevents one person's succeeded PI from being claimed by a different email.
      const submittedEmail = (data['email'] || data.email || '').toLowerCase().trim();
      const piEmail = (pi.metadata.email || '').toLowerCase().trim();
      if (piEmail && submittedEmail && piEmail !== submittedEmail) {
        console.warn('[submission-created] Email mismatch: submitted=%s pi=%s', submittedEmail, piEmail);
        return res.status(403).json({ ok: false, error: 'Order email does not match payment record' });
      }

      // Use Stripe's authoritative amount, not the client-submitted total.
      verifiedOrderTotal = `$${(pi.amount / 100).toFixed(2)}`;
      verifiedPaymentStatus = 'paid';
      orderId = pi.id;

      // Use the server-recorded items string from PI metadata as the authoritative
      // product description. This prevents swapping a cheap cart for an expensive one
      // after a legitimate payment.
      verifiedProduct = pi.metadata.items;
    } catch (err) {
      console.error('[submission-created] Stripe verification failed:', err.message);
      return res.status(402).json({ ok: false, error: 'Payment verification failed' });
    }
  } else {
    // Non-paid orders (e.g. pending-external-payment): use the transaction-id
    // as supplied, or generate a fallback. These are never marked paid here.
    orderId = clientTransactionId || `ORD-${Date.now()}`;
  }

  const email = (data['email'] || data.email || '').toLowerCase().trim();

  const now = new Date();
  const sendAt = new Date(now.getTime() + REVIEW_REQUEST_DELAY_DAYS * 24 * 60 * 60 * 1000);

  const sb = getAdminClient();

  // For paid Stripe orders, guard against replay/double-submission:
  // if a paid record for this PI already exists, return success without re-writing
  // the core financial fields.
  if (clientPaymentStatus === 'paid') {
    const { data: existing } = await sb
      .from('orders')
      .select('order_id, payment_status')
      .eq('order_id', orderId)
      .maybeSingle();

    if (existing && existing.payment_status === 'paid') {
      console.log('[submission-created] Duplicate paid order ignored for PI:', orderId);
      return res.json({ ok: true, orderId });
    }
  }

  const order = {
    order_id: orderId,
    customer_name: data['customer-name'] || data.customerName,
    email,
    phone: data['phone'] || data.phone,
    shipping_address: data['shipping-address'] ? `${data['shipping-address']}, ${data['city-state-zip']}` : null,
    product: verifiedProduct,
    quantity: data['quantity'] || data.quantity,
    notes: data['order-notes'] || data.notes,
    transaction_id: orderId,
    payment_status: verifiedPaymentStatus,
    order_total: verifiedOrderTotal,
    submitted_at: payload.created_at || now.toISOString(),
    send_review_at: sendAt.toISOString(),
    review_sent: false,
  };

  const { error } = await sb.from('orders').upsert(order, { onConflict: 'order_id' });
  if (error) {
    console.error('[submission-created]', error.message);
    return res.status(500).json({ ok: false, error: error.message });
  }

  // Also create a review request record
  const rrId = `rr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  await sb.from('review_requests').insert({
    id: rrId,
    order_id: orderId,
    email,
    customer_name: order.customer_name,
    product: order.product,
    send_at: sendAt.toISOString(),
    sent: false,
  });

  // Send the purchase confirmation email (best-effort — never block the order).
  // Atomically claim the send by setting confirmation_sent_at only when it's
  // still null, so webhook retries for the same order can't double-send.
  if (email) {
    try {
      const { data: claimed } = await sb
        .from('orders')
        .update({ confirmation_sent_at: now.toISOString() })
        .eq('order_id', orderId)
        .is('confirmation_sent_at', null)
        .select('order_id');
      if (claimed && claimed.length) {
        sendPurchaseConfirmation(order).catch((e) => console.error('[purchase-email]', e.message));
      }
    } catch (e) {
      console.error('[purchase-email-claim]', e.message);
    }
  }

  res.json({ ok: true, orderId });
};
