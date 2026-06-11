// lib/mailer.js
// Email transport wrapper. Uses the Resend Replit connector when available.
// Until the Resend integration is connected, sendMail() no-ops gracefully so
// the rest of the app keeps working (orders still record, etc).
//
// [integration: resend] — credentials are served by the Replit connector proxy.

let connectionSettings;

async function getResendKeyAndSender() {
  // Direct API key (secret) takes precedence if provided.
  if (process.env.RESEND_API_KEY) {
    return {
      apiKey: process.env.RESEND_API_KEY,
      fromEmail: process.env.EMAIL_FROM || null,
    };
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!hostname || !xReplitToken) return null;

  const res = await fetch(
    `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=resend`,
    { headers: { Accept: 'application/json', X_REPLIT_TOKEN: xReplitToken } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  connectionSettings = data.items?.[0];
  const settings = connectionSettings?.settings || {};
  const apiKey = settings.api_key || settings.apiKey;
  const fromEmail = settings.from_email || process.env.EMAIL_FROM || null;
  if (!apiKey) return null;
  return { apiKey, fromEmail };
}

function defaultFrom(fromEmail) {
  // Prefer a connector/verified sender; fall back to env override.
  return process.env.EMAIL_FROM || fromEmail || "Amber's Alchemy Apothecary <onboarding@resend.dev>";
}

// sendMail({ to, subject, html, text, replyTo, bcc })
// Returns { ok, skipped?, id?, error? }
async function sendMail({ to, subject, html, text, replyTo, bcc }) {
  if (!to || !subject) return { ok: false, error: 'to and subject required' };

  let creds;
  try {
    creds = await getResendKeyAndSender();
  } catch (err) {
    console.error('[mailer] connector lookup failed:', err.message);
    creds = null;
  }

  if (!creds) {
    console.warn(`[mailer] Resend not connected — skipped email "${subject}" to ${Array.isArray(to) ? to.join(',') : to}`);
    return { ok: false, skipped: true };
  }

  try {
    const { Resend } = require('resend');
    const resend = new Resend(creds.apiKey);
    const result = await resend.emails.send({
      from: defaultFrom(creds.fromEmail),
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      ...(replyTo ? { replyTo } : {}),
      ...(bcc ? { bcc: Array.isArray(bcc) ? bcc : [bcc] } : {}),
    });
    if (result.error) {
      console.error('[mailer] send error:', result.error.message || result.error);
      return { ok: false, error: result.error.message || 'send failed' };
    }
    return { ok: true, id: result.data?.id };
  } catch (err) {
    console.error('[mailer] send exception:', err.message);
    return { ok: false, error: err.message };
  }
}

// Send the same message to many recipients individually (so addresses stay
// private and unsubscribe links can be per-recipient). Returns counts.
async function sendBulk(recipients, buildMessage) {
  let sent = 0, failed = 0, skipped = 0;
  for (const r of recipients) {
    const msg = buildMessage(r);
    const res = await sendMail({ to: r.email, subject: msg.subject, html: msg.html, text: msg.text, replyTo: msg.replyTo, bcc: msg.bcc });
    if (res.ok) sent++;
    else if (res.skipped) skipped++;
    else failed++;
  }
  return { sent, failed, skipped, total: recipients.length };
}

module.exports = { sendMail, sendBulk };
