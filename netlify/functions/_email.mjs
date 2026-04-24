// Shared email helper — delivers to BOTH admin addresses via Resend when configured.
// Logs every attempt (success + failure) to Netlify Blobs for auditable delivery.
//
// Env vars:
//   RESEND_API_KEY            — optional; when set, emails are dispatched
//   QUIZ_LEAD_FROM_EMAIL      — optional From identity
//   ADMIN_ORDER_EMAIL_1       — primary admin recipient (default awaken@consultant.com)
//   ADMIN_ORDER_EMAIL_2       — secondary admin recipient (default perfectlyme347@gmail.com)

import { getStore } from '@netlify/blobs';

export const ADMIN_RECIPIENTS = [
  process.env.ADMIN_ORDER_EMAIL_1 || 'awaken@consultant.com',
  process.env.ADMIN_ORDER_EMAIL_2 || 'perfectlyme347@gmail.com',
].filter(Boolean);

const FROM = process.env.QUIZ_LEAD_FROM_EMAIL
  || "Amber's Alchemy Apothecary <hello@awakenagain.com>";

export function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendOne({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { to, sent: false, skipped: true, reason: 'no-provider-configured' };
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to: [to], subject, html, text }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return { to, sent: false, error: 'provider-error', status: res.status, detail };
    }
    return { to, sent: true };
  } catch (err) {
    return { to, sent: false, error: 'provider-exception', detail: String(err && err.message || err) };
  }
}

/**
 * Send one email to a list of recipients independently. Every delivery is
 * attempted even if another fails, and all attempts are logged.
 * Returns { results, anySent, allSent }.
 */
export async function sendToAll({ recipients, subject, html, text, orderId = '', purpose = 'admin-notify' }) {
  const to = Array.isArray(recipients) && recipients.length ? recipients : ADMIN_RECIPIENTS;
  const results = await Promise.all(
    to.map((addr) => sendOne({ to: addr, subject, html, text }))
  );

  // Audit log — never silent
  try {
    const log = getStore('email-delivery-log');
    const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await log.setJSON(key, {
      purpose,
      orderId,
      subject,
      recipients: to,
      results,
      at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('email-delivery-log write failed', err);
  }

  const anySent = results.some((r) => r.sent);
  const allSent = results.length > 0 && results.every((r) => r.sent);
  if (!anySent) {
    console.error('[email] all admin deliveries failed or skipped', { to, subject, results });
  }
  return { results, anySent, allSent };
}

export async function sendToCustomer({ to, subject, html, text, orderId = '', purpose = 'customer-notify' }) {
  if (!to) return { sent: false, error: 'no-recipient' };
  const result = await sendOne({ to, subject, html, text });
  try {
    const log = getStore('email-delivery-log');
    const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await log.setJSON(key, { purpose, orderId, subject, recipients: [to], results: [result], at: new Date().toISOString() });
  } catch (err) {
    console.error('email-delivery-log write failed', err);
  }
  return result;
}
