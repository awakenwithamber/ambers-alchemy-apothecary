// Handles non-quiz form submissions from AwakenAgain.com:
//   - newsletter (welcome email to subscriber + admin notification)
//   - contact (admin notification + confirmation to sender)
//   - custom-soap (admin notification with full request + confirmation to sender)
//   - formula (custom herbal consultation request)
//
// Persists every submission to Netlify Blobs and dispatches email via Resend
// when RESEND_API_KEY is configured. Never fakes success: the response only
// reports ok=true when the blob persist succeeded. The email provider result
// is returned under `email` so the frontend can log it but must not block.

import { getStore } from "@netlify/blobs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ADMIN_NOTIFY_TO = ['awaken@consultant.com', 'perfectlyme347@gmail.com'];
const FROM_EMAIL = process.env.QUIZ_LEAD_FROM_EMAIL || 'Amber\u2019s Alchemy Apothecary <hello@awakenagain.com>';

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeStr(raw, max) {
  if (raw == null) return '';
  return String(raw).replace(/[<>]/g, '').trim().slice(0, max || 500);
}

async function sendViaResend({ to, subject, html, text, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { skipped: true, reason: 'no-provider-configured' };
  try {
    const body = {
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text
    };
    if (replyTo) body.reply_to = replyTo;
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('Resend send failed:', res.status, detail);
      return { sent: false, error: 'provider-error', status: res.status };
    }
    return { sent: true };
  } catch (err) {
    console.error('Resend send error:', err);
    return { sent: false, error: 'provider-exception' };
  }
}

function welcomeEmail(name) {
  const greet = name ? escapeHtml(name) : 'Friend';
  const subject = 'Welcome to Amber\u2019s Alchemy Apothecary \u2728';
  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f7f1ea;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f1ea;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;box-shadow:0 10px 30px rgba(60,30,110,0.12);overflow:hidden;">
        <tr><td style="padding:28px 28px 8px;text-align:center;">
          <div style="font-family:'Cinzel',Georgia,serif;letter-spacing:0.18em;font-size:12px;color:#6b4f9b;text-transform:uppercase;">\u2726 Welcome, dear one</div>
          <h1 style="font-family:'Cinzel',Georgia,serif;font-size:22px;color:#3b2a5e;margin:10px 0 0;">${greet}, the apothecary welcomes you.</h1>
        </td></tr>
        <tr><td style="padding:14px 28px 8px;font-family:Georgia,serif;color:#3b2a5e;line-height:1.6;">
          <p>Thank you for joining the Amber\u2019s Alchemy circle. Your free Herbal Healing Guide is on its way \u2014 look for it in your inbox shortly.</p>
          <p>Each week, expect gentle rituals, seasonal botanicals, and quiet wisdom from the shelves of our apothecary. If a note slips into spam, please mark it safe so the garden keeps reaching you.</p>
        </td></tr>
        <tr><td style="padding:10px 28px 28px;text-align:center;">
          <a href="https://awakenagain.com/" style="display:inline-block;padding:12px 22px;background:linear-gradient(135deg,#6b4f9b,#3b2a5e);color:#fff;text-decoration:none;border-radius:999px;font-family:'Cinzel',Georgia,serif;letter-spacing:0.08em;font-size:13px;">Enter the Apothecary \u2728</a>
        </td></tr>
        <tr><td style="padding:18px 28px;border-top:1px solid #eee;font-family:Georgia,serif;font-size:12px;color:#7a6a95;line-height:1.5;text-align:center;">
          Botanical guidance supports general wellness and is not medical advice. Please consult a qualified healthcare professional for medical concerns.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  const text = `${name || 'Friend'},

Welcome to Amber\u2019s Alchemy Apothecary. Your free Herbal Healing Guide is on its way \u2014 look for it in your inbox shortly.

Each week, expect gentle rituals, seasonal botanicals, and quiet wisdom from the shelves of the apothecary.

\u2014 Amber\u2019s Alchemy Apothecary`;
  return { subject, html, text };
}

function contactConfirmEmail(name, subject) {
  const greet = name ? escapeHtml(name) : 'Friend';
  const subj = subject ? escapeHtml(subject) : 'Your Message';
  const emailSubject = `We received your message \u2014 ${subject || 'Amber\u2019s Alchemy'}`;
  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f7f1ea;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f1ea;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;box-shadow:0 10px 30px rgba(60,30,110,0.12);overflow:hidden;">
        <tr><td style="padding:28px 28px 14px;font-family:Georgia,serif;color:#3b2a5e;line-height:1.6;">
          <h1 style="font-family:'Cinzel',Georgia,serif;font-size:20px;color:#3b2a5e;margin:0 0 10px;">${greet}, your message has been received.</h1>
          <p>Thank you for reaching out regarding <strong>${subj}</strong>. Amber will respond personally within 1\u20133 business days.</p>
          <p>In the meantime, your patience is deeply appreciated.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  const text = `${name || 'Friend'}, thank you for reaching out regarding ${subject || 'Amber\u2019s Alchemy'}. Amber will respond personally within 1\u20133 business days.`;
  return { subject: emailSubject, html, text };
}

function adminNotifyEmail(kind, data) {
  const subject = `New ${kind} submission \u2014 ${data.name || data.email || 'Guest'}`;
  const rows = Object.entries(data)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `<tr><td style="vertical-align:top;padding:4px 10px;color:#555;"><strong>${escapeHtml(k)}</strong></td><td style="padding:4px 10px;white-space:pre-wrap;">${escapeHtml(v)}</td></tr>`)
    .join('');
  const html = `<!doctype html>
<html><body style="font-family:Georgia,serif;color:#222;line-height:1.5;">
  <h2 style="margin:0 0 8px;">New ${escapeHtml(kind)} submission</h2>
  <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${rows}</table>
</body></html>`;
  const text = Object.entries(data)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  return { subject, html, text };
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid-json' }), { status: 400 });
  }

  const kind = sanitizeStr(payload.kind, 40);
  const allowedKinds = ['newsletter', 'contact', 'custom-soap', 'formula', 'soap-remedy'];
  if (!allowedKinds.includes(kind)) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid-kind' }), { status: 400 });
  }

  const email = sanitizeStr(payload.email, 200).toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid-email' }), { status: 400 });
  }

  const name = sanitizeStr(payload.name, 100);
  const message = sanitizeStr(payload.message, 4000);
  const subject = sanitizeStr(payload.subject, 200);
  const details = (payload.details && typeof payload.details === 'object') ? payload.details : {};

  const cleanDetails = {};
  for (const key of Object.keys(details).slice(0, 30)) {
    cleanDetails[sanitizeStr(key, 60)] = sanitizeStr(details[key], 2000);
  }

  const now = new Date();
  const recordKey = `${kind}_${email.replace(/[^a-z0-9]+/gi, '_')}_${now.getTime()}`;
  const record = {
    key: recordKey,
    kind,
    email,
    name,
    subject,
    message,
    details: cleanDetails,
    userAgent: req.headers.get('user-agent') || '',
    createdAt: now.toISOString()
  };

  try {
    const store = getStore('contact-submissions');
    await store.setJSON(recordKey, record);
  } catch (err) {
    console.error('contact-form persist error:', err);
    return new Response(JSON.stringify({ ok: false, error: 'storage' }), { status: 500 });
  }

  const adminData = {
    kind,
    name,
    email,
    subject,
    message,
    ...cleanDetails,
    submittedAt: record.createdAt
  };
  const admin = adminNotifyEmail(kind, adminData);

  let guest = null;
  if (kind === 'newsletter') {
    guest = welcomeEmail(name);
  } else if (kind === 'contact') {
    guest = contactConfirmEmail(name, subject || 'your inquiry');
  } else if (kind === 'custom-soap' || kind === 'soap-remedy') {
    guest = contactConfirmEmail(name, 'your custom soap request');
  } else if (kind === 'formula') {
    guest = contactConfirmEmail(name, 'your custom herbal consultation request');
  }

  const sends = await Promise.all([
    sendViaResend({ to: ADMIN_NOTIFY_TO, subject: admin.subject, html: admin.html, text: admin.text, replyTo: email }),
    guest ? sendViaResend({ to: email, subject: guest.subject, html: guest.html, text: guest.text }) : Promise.resolve({ skipped: true, reason: 'no-guest-template' })
  ]);

  return new Response(JSON.stringify({
    ok: true,
    stored: true,
    email: { admin: sends[0], guest: sends[1] }
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
