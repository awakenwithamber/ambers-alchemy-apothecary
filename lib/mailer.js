// lib/mailer.js
// Email transport wrapper using the Resend SDK.
// Uses process.env.RESEND_API_KEY and process.env.EMAIL_FROM directly.
// If RESEND_API_KEY is not set, sendMail() no-ops gracefully so the rest of
// the app keeps working (orders still record, etc).

function defaultFrom() {
  return process.env.EMAIL_FROM || "Amber's Alchemy Apothecary <onboarding@resend.dev>";
}

// sendMail({ to, subject, html, text, replyTo, bcc })
// Returns { ok, skipped?, id?, error? }
async function sendMail({ to, subject, html, text, replyTo, bcc }) {
  if (!to || !subject) return { ok: false, error: 'to and subject required' };

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[mailer] Resend not configured (RESEND_API_KEY missing) — skipped email "${subject}" to ${Array.isArray(to) ? to.join(',') : to}`);
    return { ok: false, skipped: true };
  }

  try {
    const { Resend } = require('resend');
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: defaultFrom(),
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
