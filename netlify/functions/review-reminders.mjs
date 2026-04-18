// Scheduled review-request dispatcher.
//
// Runs daily and looks at the "review-requests" blob store for requests whose
// sendAt/reminderAt has passed and haven't been sent yet. For each due request
// it records that the message was prepared and writes a dispatch record so the
// owner can view/send them manually from the admin dashboard (or connect an
// email/SMS provider later). This function is intentionally side-effect-light
// to avoid accidentally messaging customers without explicit owner setup.
//
// When REVIEW_EMAIL_WEBHOOK is set, each dispatched message is POSTed to that
// URL as JSON — letting Amber plug in her own email provider (Mailgun, Resend,
// Postmark, etc.) without code changes.

import { getStore } from '@netlify/blobs';

const SITE_URL = process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://awakenagain.com';

function reviewMessage({ customerName, product }) {
  const name = customerName?.split(' ')[0] || 'friend';
  const subject = `A quiet thank you from Amber's Alchemy Apothecary`;
  const html = `
    <p>Dear ${name},</p>
    <p>Thank you for your recent order from <strong>Amber's Alchemy Apothecary</strong>.
    If you've had a chance to try ${product ? `your <em>${product}</em>` : 'your remedies'},
    we would be deeply grateful if you shared an honest review. Your experience helps others
    discover the natural support they may be looking for.</p>
    <p style="margin:28px 0;">
      <a href="${SITE_URL}/?review=me" style="background:#8C6A3B;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-family:serif;">Review My Product</a>
      &nbsp;
      <a href="${SITE_URL}/?google_review=1" style="background:#2E1C38;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-family:serif;">Review Us on Google</a>
    </p>
    <p>With gratitude,<br/>Amber ✦</p>
  `;
  const text = `Dear ${name},\n\nThank you for your recent order from Amber's Alchemy Apothecary. If you've had a chance to try ${product ? `your ${product}` : 'your remedies'}, we would be grateful if you shared an honest review.\n\nReview on our site: ${SITE_URL}/?review=me\nReview on Google: ${SITE_URL}/?google_review=1\n\nWith gratitude,\nAmber`;
  return { subject, html, text };
}

export default async () => {
  const store = getStore('review-requests');
  const dispatchStore = getStore('review-dispatch');
  const webhook = process.env.REVIEW_EMAIL_WEBHOOK || '';
  const now = new Date();

  const { blobs } = await store.list();
  let prepared = 0;
  let reminded = 0;

  for (const b of blobs) {
    const record = await store.get(b.key, { type: 'json' });
    if (!record || record.status === 'completed') continue;

    const sendAt = record.sendAt ? new Date(record.sendAt) : null;
    const reminderAt = record.reminderAt ? new Date(record.reminderAt) : null;

    let kind = null;
    if (!record.initialSent && sendAt && sendAt <= now) kind = 'initial';
    else if (record.initialSent && !record.reminderSent && reminderAt && reminderAt <= now) kind = 'reminder';

    if (!kind) continue;

    const message = reviewMessage(record);
    const dispatchId = `${record.orderId}_${kind}_${Date.now().toString(36)}`;
    const dispatchRecord = {
      dispatchId,
      orderId: record.orderId,
      email: record.email,
      customerName: record.customerName,
      product: record.product,
      kind,
      subject: message.subject,
      html: message.html,
      text: message.text,
      preparedAt: now.toISOString(),
      webhookDelivered: false,
      webhookError: null,
    };

    if (webhook) {
      try {
        const res = await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dispatchRecord),
        });
        dispatchRecord.webhookDelivered = res.ok;
        if (!res.ok) dispatchRecord.webhookError = `HTTP ${res.status}`;
      } catch (err) {
        dispatchRecord.webhookError = String(err?.message || err);
      }
    }

    await dispatchStore.setJSON(dispatchId, dispatchRecord);

    if (kind === 'initial') {
      record.initialSent = true;
      record.initialSentAt = now.toISOString();
      prepared++;
    } else {
      record.reminderSent = true;
      record.reminderSentAt = now.toISOString();
      record.status = 'completed';
      reminded++;
    }
    await store.setJSON(record.orderId, record);
  }

  return Response.json({ ok: true, prepared, reminded, total: blobs.length });
};

export const config = {
  schedule: '0 15 * * *', // daily at 15:00 UTC
};
