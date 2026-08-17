// Shared admin-notification utility.
//
// Order-related notifications MUST always be delivered to both admin
// addresses. Both recipients are configured via environment variables
// so they can be updated without a code change, but the defaults match
// the project spec:
//   ADMIN_ORDER_EMAIL_1 = awaken@consultant.com
//   ADMIN_ORDER_EMAIL_2 = perfectlyme347@gmail.com
//
// sendAdminOrderEmail() attempts independent delivery to each recipient
// and NEVER short-circuits: a failure for one address does not prevent
// the other from being sent. Every attempt is logged (and persisted to
// the "admin-email-log" blob store for audit) so a silent failure is
// impossible.

import { getStore } from "@netlify/blobs";

const DEFAULT_RECIPIENT_1 = "awaken@consultant.com";
const DEFAULT_RECIPIENT_2 = "perfectlyme347@gmail.com";

const MAX_RETRIES = 2; // one retry per recipient on transient failure

function getAdminRecipients() {
  const r1 = (process.env.ADMIN_ORDER_EMAIL_1 || DEFAULT_RECIPIENT_1).trim();
  const r2 = (process.env.ADMIN_ORDER_EMAIL_2 || DEFAULT_RECIPIENT_2).trim();
  const list = [r1, r2].filter(Boolean);
  // de-duplicate if both env vars are accidentally identical
  return Array.from(new Set(list));
}

function getFromAddress() {
  return (
    process.env.ADMIN_ORDER_FROM_EMAIL ||
    process.env.QUIZ_LEAD_FROM_EMAIL ||
    "Amber's Alchemy Apothecary <hello@awakenagain.com>"
  );
}

async function sendOneViaResend({ to, subject, html, text, from }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, skipped: true, reason: "RESEND_API_KEY not set" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html, text }),
    });
    if (!res.ok) {
      let detail = "";
      try {
        detail = await res.text();
      } catch (_) {}
      return { ok: false, status: res.status, error: detail.slice(0, 400) };
    }
    const data = await res.json().catch(() => ({}));
    return { ok: true, id: data.id || null };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err).slice(0, 400) };
  }
}

async function sendWithRetry(args) {
  let lastResult = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    lastResult = await sendOneViaResend(args);
    if (lastResult.ok || lastResult.skipped) return { ...lastResult, attempts: attempt };
    // small backoff between retries — non-blocking, bounded
    await new Promise((r) => setTimeout(r, 150 * attempt));
  }
  return { ...lastResult, attempts: MAX_RETRIES };
}

// Dual-delivery admin send. Returns a structured result describing both attempts.
// The caller should NEVER short-circuit on a single failure: order delivery
// to one recipient succeeding is still useful when the other fails.
export async function sendAdminOrderEmail({ subject, html, text, orderId, submissionId }) {
  const recipients = getAdminRecipients();
  const from = getFromAddress();
  const startedAt = new Date().toISOString();

  const results = await Promise.all(
    recipients.map(async (to) => {
      const r = await sendWithRetry({ to, subject, html, text, from });
      return { to, ...r };
    })
  );

  const anyOk = results.some((r) => r.ok);
  const allOk = results.every((r) => r.ok);

  const logEntry = {
    startedAt,
    finishedAt: new Date().toISOString(),
    orderId: orderId || null,
    submissionId: submissionId || null,
    subject,
    recipients,
    results,
    anyOk,
    allOk,
  };

  // Persist an audit log — never throw from logging
  try {
    const store = getStore("admin-email-log");
    const key = `${Date.now()}_${(orderId || submissionId || "nokey").toString().replace(/[^a-z0-9_-]+/gi, "_")}`;
    await store.setJSON(key, logEntry);
  } catch (err) {
    console.error("admin-email-log write failed:", err && err.message ? err.message : err);
  }

  // Always log to console for CI/runtime visibility
  if (allOk) {
    console.log("[admin-email] delivered to all recipients:", recipients.join(", "));
  } else if (anyOk) {
    console.warn("[admin-email] partial delivery:", JSON.stringify(results));
  } else {
    console.error("[admin-email] delivery failed to all recipients:", JSON.stringify(results));
  }

  return logEntry;
}

export function getAdminRecipientsList() {
  return getAdminRecipients();
}
