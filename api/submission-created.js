const { getAdminClient } = require('../lib/supabase');

const REVIEW_REQUEST_DELAY_DAYS = 10;

exports.handle = async (req, res) => {
  const body = req.body || {};
  const payload = body.payload || body;
  const data = payload.data || payload;

  const orderId = data['transaction-id'] || data.transactionId || `ORD-${Date.now()}`;
  const email = (data['email'] || data.email || '').toLowerCase().trim();

  const now = new Date();
  const sendAt = new Date(now.getTime() + REVIEW_REQUEST_DELAY_DAYS * 24 * 60 * 60 * 1000);

  const order = {
    order_id: orderId,
    customer_name: data['customer-name'] || data.customerName,
    email,
    phone: data['phone'] || data.phone,
    shipping_address: data['shipping-address'] ? `${data['shipping-address']}, ${data['city-state-zip']}` : null,
    product: data['product-ordered'] || data.product,
    quantity: data['quantity'] || data.quantity,
    notes: data['order-notes'] || data.notes,
    transaction_id: data['transaction-id'] || data.transactionId,
    payment_status: data['payment-status'] || data.paymentStatus,
    order_total: data['order-total'] || data.orderTotal,
    submitted_at: payload.created_at || now.toISOString(),
    send_review_at: sendAt.toISOString(),
    review_sent: false,
  };

  const sb = getAdminClient();
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

  res.json({ ok: true, orderId });
};
