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
import {
  escapeHtml,
  groundingThought,
  renderHtmlEmail,
  renderTextEmail
} from './lib/voice.mjs';

const SITE_URL = process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://awakenagain.com';

function reviewMessage({ customerName, product, orderId, kind }) {
  const name = customerName?.split(' ')[0] || 'friend';
  const safeName = escapeHtml(name);
  const productHtml = product ? `your <em>${escapeHtml(product)}</em>` : 'your remedies';
  const grounding = groundingThought(orderId || name);

  // The initial note and the gentle reminder carry the same warmth; the
  // reminder simply acknowledges that life is full and there's no pressure.
  const isReminder = kind === 'reminder';
  const subject = isReminder
    ? `No pressure at all — just thinking of you, ${name}`
    : `A quiet thank you, ${name} ☾`;

  const opening = isReminder
    ? `<p style="font-family:Georgia,serif;color:#3b2a5e;line-height:1.7;">${safeName}, I wrote to you a little while ago and wanted to gently reach out once more — not to nudge, only because you’ve been on my mind. Life is full, and that is exactly as it should be.</p>`
    : `<p style="font-family:Georgia,serif;color:#3b2a5e;line-height:1.7;">${safeName}, a little time has passed since ${productHtml} made its way to you, and I’ve been quietly hoping it’s brought you even a small measure of ease.</p>`;

  const bodyHtml = `
    ${opening}
    <p style="font-family:Georgia,serif;color:#3b2a5e;line-height:1.7;">If it ever feels right — only if it feels right — a few honest words about how you’re getting on would mean the world to me. Not for the shop, truly, but because what you share helps the next person who’s tired and searching find something that might hold them too. That’s the whole reason this little apothecary exists.</p>
    <p style="font-family:Georgia,serif;color:#3b2a5e;line-height:1.7;">You can <a href="${SITE_URL}/?review=me" style="color:#6b4f9b;text-decoration:underline;">leave a few words here</a> whenever there’s a quiet moment, or <a href="${SITE_URL}/?google_review=1" style="color:#6b4f9b;text-decoration:underline;">on Google</a> if you’d rather. And if now isn’t the time, that is perfectly all right — this note asks nothing of you.</p>`;

  const html = renderHtmlEmail({
    kicker: 'Thinking of you',
    heading: isReminder ? `Still here, whenever you need me.` : `Thank you, from one human to another.`,
    bodyHtml,
    grounding
  });

  const bodyText = `${name}, ${isReminder
    ? 'I wrote to you a little while ago and wanted to gently reach out once more — not to nudge, only because you have been on my mind. Life is full, and that is exactly as it should be.'
    : `a little time has passed since ${product ? product : 'your remedies'} made its way to you, and I have been quietly hoping it has brought you even a small measure of ease.`}

If it ever feels right — only if it feels right — a few honest words about how you're getting on would mean the world to me. Not for the shop, but because what you share helps the next tired, searching person find something that might hold them too.

Leave a few words on our site: ${SITE_URL}/?review=me
Or on Google: ${SITE_URL}/?google_review=1

And if now isn't the time, that is perfectly all right — this note asks nothing of you.`;

  const text = renderTextEmail({ heading: '', bodyText, grounding });

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

    const message = reviewMessage({ ...record, kind });
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
