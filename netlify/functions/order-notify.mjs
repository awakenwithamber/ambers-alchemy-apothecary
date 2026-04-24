// Direct order-notification endpoint. Called either by the client on checkout
// completion OR by the submission-created hook. Always dispatches to BOTH
// admin addresses. Logs every attempt.
import { getStore } from '@netlify/blobs';
import { sendToAll, sendToCustomer, escapeHtml } from './_email.mjs';

function clean(v, max = 500) {
  return String(v == null ? '' : v).replace(/[<>]/g, '').trim().slice(0, max);
}

function buildAdminHtml(order) {
  const itemsRows = (order.items || []).map((it) => `
    <tr>
      <td>${escapeHtml(it.name || '')}</td>
      <td>${escapeHtml(String(it.quantity || 1))}</td>
      <td>$${escapeHtml(String(it.price || ''))}</td>
    </tr>
  `).join('');
  return `<!doctype html><html><body style="font-family:Georgia,serif;color:#3b2a5e;background:#f7f1ea;padding:24px;">
    <h2 style="font-family:'Cinzel',Georgia,serif;">New Order — ${escapeHtml(order.orderId)}</h2>
    <p><strong>Customer:</strong> ${escapeHtml(order.customerName)} &lt;${escapeHtml(order.email)}&gt;</p>
    <p><strong>Phone:</strong> ${escapeHtml(order.phone || '—')}</p>
    <p><strong>Shipping:</strong> ${escapeHtml(order.shippingAddress || '—')}</p>
    <p><strong>Total:</strong> $${escapeHtml(String(order.total || ''))}</p>
    ${itemsRows ? `<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;margin-top:10px;"><tr><th>Item</th><th>Qty</th><th>Price</th></tr>${itemsRows}</table>` : ''}
    ${order.notes ? `<p><strong>Notes:</strong> ${escapeHtml(order.notes)}</p>` : ''}
    <p style="color:#6b4f9b;font-size:0.85rem;">Submitted at ${escapeHtml(order.submittedAt)}</p>
  </body></html>`;
}

function buildCustomerHtml(order, discountCode) {
  const discountBlock = discountCode
    ? `<p style="padding:14px;background:#f4edde;border-left:3px solid #d4a843;border-radius:8px;">✦ <strong>A little thank-you:</strong> Use code <strong>${escapeHtml(discountCode)}</strong> on your next order.</p>`
    : '';
  return `<!doctype html><html><body style="font-family:Georgia,serif;color:#3b2a5e;background:#f7f1ea;padding:24px;">
    <h2 style="font-family:'Cinzel',Georgia,serif;">Thank you, ${escapeHtml(order.customerName || 'friend')}.</h2>
    <p>Your order <strong>${escapeHtml(order.orderId)}</strong> has been received. Amber will confirm shipping details within one business day.</p>
    ${discountBlock}
    <p style="color:#6b4f9b;font-size:0.85rem;">With love, Amber's Alchemy Apothecary</p>
  </body></html>`;
}

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  let body;
  try { body = await req.json(); } catch { return new Response('Bad JSON', { status: 400 }); }

  const orderId = clean(body.orderId || `ORD-${Date.now()}`, 60);
  const email = clean(body.email || '', 120).toLowerCase();
  const customerName = clean(body.customerName || '', 120);

  const order = {
    orderId,
    customerName,
    email,
    phone: clean(body.phone || '', 40),
    shippingAddress: clean(body.shippingAddress || '', 500),
    items: Array.isArray(body.items) ? body.items.slice(0, 40).map((it) => ({
      name: clean(it && it.name || '', 120),
      quantity: Number(it && it.quantity) || 1,
      price: clean(String(it && it.price || ''), 20),
    })) : [],
    subtotal: clean(String(body.subtotal || ''), 20),
    total: clean(String(body.total || ''), 20),
    notes: clean(body.notes || '', 800),
    paymentStatus: clean(body.paymentStatus || '', 40),
    submittedAt: new Date().toISOString(),
  };

  // Persist mirrored order
  try {
    const orders = getStore('orders');
    await orders.setJSON(orderId, order);
  } catch (err) {
    console.error('orders write failed', err);
  }

  // First-time-buyer bookkeeping + follow-up discount
  let discountCode = null;
  if (email) {
    try {
      const customers = getStore('customers');
      const key = email.replace(/[^a-z0-9]+/gi, '_');
      const prior = await customers.get(key, { type: 'json' }).catch(() => null);
      const now = new Date().toISOString();

      if (!prior) {
        discountCode = `AWAKEN-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
        await customers.setJSON(key, {
          email,
          name: customerName,
          firstOrderDate: now,
          hasUsedFirstOrderDiscount: true,
          eligibleForFollowupDiscount: true,
          followupDiscountCode: discountCode,
          createdAt: now,
          updatedAt: now,
        });
      } else {
        await customers.setJSON(key, {
          ...prior,
          name: customerName || prior.name,
          hasUsedFirstOrderDiscount: true,
          updatedAt: now,
        });
      }
    } catch (err) {
      console.error('customer upsert failed', err);
    }
  }

  const subject = `New Order — ${order.orderId} (${customerName || email || 'guest'})`;
  const adminHtml = buildAdminHtml(order);
  const adminText = `New Order ${order.orderId}\nCustomer: ${customerName} <${email}>\nTotal: $${order.total}`;

  const adminResult = await sendToAll({ subject, html: adminHtml, text: adminText, orderId, purpose: 'order-admin-notify' });

  let customerResult = { sent: false, skipped: true };
  if (email) {
    customerResult = await sendToCustomer({
      to: email,
      subject: `Your Order ${order.orderId} — Amber's Alchemy Apothecary`,
      html: buildCustomerHtml(order, discountCode),
      text: `Thank you for your order ${order.orderId}. Amber will confirm shortly.`,
      orderId,
      purpose: 'order-customer-notify',
    });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      orderId,
      admin: { anySent: adminResult.anySent, allSent: adminResult.allSent, results: adminResult.results },
      customer: customerResult,
      followupDiscountCode: discountCode, // for frontend display to first-time buyers only
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
};
