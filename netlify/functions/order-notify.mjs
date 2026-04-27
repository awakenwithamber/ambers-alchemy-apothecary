// order-notify.js — fires admin email on every Shopify order.
// Triggered by Shopify orders/create webhook.

import crypto from 'node:crypto';

function verifyShopifyHmac(rawBody, hmacHeader, secret) {
  if (!secret || !hmacHeader) return true; // skip verification if no secret configured (degraded mode)
  const calculated = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');
  try {
    return crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(hmacHeader));
  } catch (e) { return false; }
}

async function sendEmail({ to, subject, body, fromEmail }) {
  const klaviyoKey = Netlify.env.get('KLAVIYO_API_KEY');
  const sendgridKey = Netlify.env.get('SENDGRID_API_KEY');

  if (sendgridKey) {
    try {
      const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean).map(e => ({ email: e }));
      const r = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${sendgridKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalizations: [{ to: recipients, subject }],
          from: { email: fromEmail || 'noreply@awakenagain.app', name: 'Grimior Notifications' },
          content: [{ type: 'text/plain', value: body }]
        })
      });
      return r.ok;
    } catch (e) { /* fall through */ }
  }

  if (klaviyoKey) {
    try {
      for (const recipient of (Array.isArray(to) ? to : [to]).filter(Boolean)) {
        await fetch('https://a.klaviyo.com/api/events/', {
          method: 'POST',
          headers: {
            'Authorization': `Klaviyo-API-Key ${klaviyoKey}`,
            'revision': '2024-10-15',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            data: {
              type: 'event',
              attributes: {
                properties: { subject, body },
                metric: { data: { type: 'metric', attributes: { name: 'Admin Order Notification' } } },
                profile: { data: { type: 'profile', attributes: { email: recipient } } }
              }
            }
          })
        });
      }
      return true;
    } catch (e) { return false; }
  }
  return false;
}

export default async (req) => {
  const raw = await req.text();
  const hmac = req.headers.get('x-shopify-hmac-sha256');
  const secret = Netlify.env.get('SHOPIFY_WEBHOOK_SECRET');

  if (!verifyShopifyHmac(raw, hmac, secret)) {
    return new Response('Invalid HMAC', { status: 401 });
  }

  let order;
  try { order = JSON.parse(raw); } catch (e) {
    return new Response('Invalid body', { status: 400 });
  }

  const orderNumber = order.order_number || order.name || order.id;
  const customerEmail = order.email || (order.customer && order.customer.email) || 'unknown';
  const total = order.total_price || order.current_total_price || '0.00';
  const items = (order.line_items || []).map(i => `${i.quantity}× ${i.name}`).join(', ');
  const tags = order.tags || (order.customer && order.customer.tags) || '';
  const isSubscriber = /grimior-subscriber/i.test(tags);
  const ship = order.shipping_address || {};
  const shop = Netlify.env.get('SHOPIFY_SHOP_DOMAIN') || 'shop';

  const subscriberFlag = isSubscriber ? '\n[GRIMIOR SUBSCRIBER — FREE GIFT INCLUDED]\n' : '';

  const body = `NEW ORDER PLACED — #${orderNumber}
${subscriberFlag}
Customer: ${customerEmail}
Total: $${total}
Items: ${items}
Ship to: ${ship.address1 || ''}, ${ship.city || ''}, ${ship.province_code || ship.province || ''} ${ship.zip || ''}

View in Shopify: https://${shop}/admin/orders/${order.id}
`;

  const adminEmail = Netlify.env.get('ADMIN_EMAIL') || 'awaken@consultant.com';
  const backupEmail = Netlify.env.get('BACKUP_EMAIL') || 'dare2be4ree@gmail.com';
  const fromEmail = Netlify.env.get('NOTIFICATION_FROM_EMAIL');

  await sendEmail({
    to: [adminEmail, backupEmail],
    subject: `✦ New Order #${orderNumber} — Grimior Shop`,
    body,
    fromEmail
  });

  return Response.json({ ok: true, orderNumber });
};

export const config = {
  path: '/api/order-notify',
  method: 'POST'
};
