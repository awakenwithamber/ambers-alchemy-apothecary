// Shared admin-notification helper.
//
// CRITICAL ORDER-EMAIL POLICY (non-negotiable):
// Every order-related admin notification MUST be delivered to BOTH site
// owners. Each new order flow, form handler, webhook, or automation added
// later MUST route its admin notification through `sendAdminNotification()`
// below — do not call the email provider with a single hard-coded recipient.
//
// The helper fans out one independent provider request per recipient so that
// a transient failure to one mailbox cannot silently drop delivery to the
// other. Every attempt (success, provider-error, or skip) is appended to the
// `admin-notification-log` blob store with timestamp, flow, order/submission
// id, recipient, and provider response, so failed sends can be audited and
// retried.
//
// Recipients can be overridden via the `ADMIN_ORDER_EMAIL_1` /
// `ADMIN_ORDER_EMAIL_2` environment variables but the defaults are the two
// canonical owner inboxes and MUST stay dual.

import { getStore } from '@netlify/blobs';

const DEFAULT_ADMIN_EMAILS = [
  'awaken@consultant.com',
  'perfectlyme347@gmail.com'
];

const MAX_RETRIES = 1; // one retry on provider error per recipient

function resolveAdminEmails() {
  const fromEnv = [
    process.env.ADMIN_ORDER_EMAIL_1,
    process.env.ADMIN_ORDER_EMAIL_2
  ].filter((addr) => typeof addr === 'string' && addr.includes('@'));
  const configured = fromEnv.length >= 2 ? fromEnv : DEFAULT_ADMIN_EMAILS;
  // Deduplicate while preserving order, in case both env vars point to the
  // same address — we still want to guarantee at least the two defaults.
  const unique = Array.from(new Set(configured.map((a) => a.trim().toLowerCase())));
  if (unique.length < 2) {
    // Top up with defaults so dual delivery is always enforced.
    for (const addr of DEFAULT_ADMIN_EMAILS) {
      const lower = addr.toLowerCase();
      if (!unique.includes(lower)) unique.push(lower);
      if (unique.length >= 2) break;
    }
  }
  return unique;
}

export const ADMIN_EMAILS = resolveAdminEmails();

const GUEST_FROM =
  process.env.QUIZ_LEAD_FROM_EMAIL ||
  'Amber\u2019s Alchemy Apothecary <hello@awakenagain.com>';

async function postOneRecipient({ to, subject, html, text, apiKey }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from: GUEST_FROM, to: [to], subject, html, text })
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    return { sent: false, status: res.status, detail };
  }
  const body = await res.json().catch(() => ({}));
  return { sent: true, providerId: body && body.id };
}

async function appendLog(entry) {
  try {
    const store = getStore('admin-notification-log');
    const logKey = `${entry.timestamp}_${entry.orderId || entry.submissionId || 'unknown'}_${entry.recipient}`
      .replace(/[^a-z0-9_\-:.@]+/gi, '_')
      .slice(0, 220);
    await store.setJSON(logKey, entry);
  } catch (err) {
    // Never let logging failures mask delivery results.
    console.error('admin-notify log write failed:', err);
  }
}

async function deliverToRecipient({ recipient, subject, html, text, flow, orderId, submissionId }) {
  const apiKey = process.env.RESEND_API_KEY;
  const baseEntry = {
    flow,
    orderId: orderId || null,
    submissionId: submissionId || null,
    recipient,
    subject
  };

  if (!apiKey) {
    const entry = {
      ...baseEntry,
      timestamp: new Date().toISOString(),
      success: false,
      skipped: true,
      reason: 'no-provider-configured',
      attempts: 0
    };
    console.warn('admin-notify skipped (RESEND_API_KEY missing)', {
      flow,
      recipient,
      orderId,
      submissionId
    });
    await appendLog(entry);
    return entry;
  }

  let lastError = null;
  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      const result = await postOneRecipient({ to: recipient, subject, html, text, apiKey });
      if (result.sent) {
        const entry = {
          ...baseEntry,
          timestamp: new Date().toISOString(),
          success: true,
          attempts: attempt,
          providerId: result.providerId || null
        };
        console.log('admin-notify sent', {
          flow,
          recipient,
          orderId,
          submissionId,
          attempts: attempt,
          providerId: result.providerId || null
        });
        await appendLog(entry);
        return entry;
      }
      lastError = {
        reason: 'provider-error',
        status: result.status,
        detail: (result.detail || '').slice(0, 500)
      };
    } catch (err) {
      lastError = {
        reason: 'provider-exception',
        message: (err && err.message) || String(err)
      };
    }
    // Brief backoff before retry.
    if (attempt <= MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    }
  }

  const entry = {
    ...baseEntry,
    timestamp: new Date().toISOString(),
    success: false,
    attempts: MAX_RETRIES + 1,
    error: lastError
  };
  console.error('admin-notify FAILED after retries', {
    flow,
    recipient,
    orderId,
    submissionId,
    error: lastError
  });
  await appendLog(entry);
  return entry;
}

// Public API: fire one independent delivery per admin recipient so a single
// failure cannot drop both sides of the fan-out. Returns a summary with the
// full list of per-recipient attempt records.
export async function sendAdminNotification({ subject, html, text, flow, orderId, submissionId }) {
  const recipients = ADMIN_EMAILS;
  const results = await Promise.all(
    recipients.map((recipient) =>
      deliverToRecipient({ recipient, subject, html, text, flow, orderId, submissionId })
    )
  );
  const delivered = results.filter((r) => r.success).length;
  const summary = {
    flow,
    orderId: orderId || null,
    submissionId: submissionId || null,
    recipients,
    delivered,
    attempted: recipients.length,
    results
  };
  if (delivered === 0) {
    console.error('admin-notify: zero recipients reached', summary);
  } else if (delivered < recipients.length) {
    console.warn('admin-notify: partial delivery', summary);
  }
  return summary;
}
