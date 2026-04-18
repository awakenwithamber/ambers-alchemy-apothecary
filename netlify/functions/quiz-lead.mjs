// Captures wellness-quiz leads (email + optional first name + optional SMS)
// and persists them to Netlify Blobs for later re-engagement (abandoned-results
// recovery, wellness drip, seasonal launches, refill reminders).
//
// Also handles the "extended personalized results" request made from the
// results page: de-duplicates repeat submissions per session, stores a
// dedicated record with the quiz result summary, and dispatches a
// personalized guest email plus an admin notification when an email
// provider (Resend) is configured.

import { getStore } from "@netlify/blobs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ADMIN_NOTIFY_TO = ['awaken@consultant.com', 'perfectlyme347@gmail.com'];
const GUEST_FROM = process.env.QUIZ_LEAD_FROM_EMAIL || 'Amber\u2019s Alchemy Apothecary <hello@awakenagain.com>';
const EXTENDED_DEDUPE_WINDOW_MS = 6 * 60 * 60 * 1000; // 6 hours

function sanitizePhone(raw) {
  if (!raw) return '';
  const digits = String(raw).replace(/[^\d+]/g, '');
  return digits.slice(0, 20);
}

function sanitizeName(raw) {
  if (!raw) return '';
  return String(raw).replace(/[<>]/g, '').trim().slice(0, 60);
}

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function prettyHerbName(id) {
  if (!id) return '';
  return String(id)
    .split('-')
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function buildGuestEmail({ firstName, resultSummary }) {
  const greetName = firstName ? escapeHtml(firstName) : 'Friend';
  const primaryPattern = resultSummary && resultSummary.primaryPattern
    ? escapeHtml(resultSummary.primaryPattern)
    : '';
  const allyList = Array.isArray(resultSummary && resultSummary.allies)
    ? resultSummary.allies.map(prettyHerbName).filter(Boolean)
    : [];

  const subject = firstName
    ? `${firstName}, Your Full Results Are Ready \u2728`
    : 'Your Personalized Herbal Guidance Is Here \u2728';

  const alliesHtml = allyList.length
    ? `<ul style="padding-left:18px;margin:10px 0 18px;color:#3b2a5e;font-family:Georgia,serif;">${allyList
        .map((n) => `<li style="margin:4px 0;">\u2726 ${escapeHtml(n)}</li>`)
        .join('')}</ul>`
    : '';

  const patternLine = primaryPattern
    ? `<p style="font-family:Georgia,serif;color:#3b2a5e;line-height:1.6;">Your answers pointed most clearly to <strong>${primaryPattern}</strong> \u2014 a pattern many carry quietly. The herbs below were chosen for what your body seems to be asking for right now.</p>`
    : '';

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f7f1ea;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f1ea;padding:28px 12px;">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;box-shadow:0 10px 30px rgba(60,30,110,0.12);overflow:hidden;">
          <tr><td style="padding:28px 28px 8px;text-align:center;">
            <div style="font-family:'Cinzel',Georgia,serif;letter-spacing:0.18em;font-size:12px;color:#6b4f9b;text-transform:uppercase;">\u2726 Your Personalized Results</div>
            <h1 style="font-family:'Cinzel',Georgia,serif;font-size:22px;color:#3b2a5e;margin:10px 0 0;">${greetName}, your deeper reading is here.</h1>
          </td></tr>
          <tr><td style="padding:14px 28px 8px;">
            <p style="font-family:Georgia,serif;color:#3b2a5e;line-height:1.6;">${greetName}, thank you for taking the herbal quiz. Based on your responses, your body may be asking for deeper support, restoration, and balance right now.</p>
            ${patternLine}
            ${allyList.length ? '<p style="font-family:Georgia,serif;color:#3b2a5e;line-height:1.6;margin:18px 0 6px;"><strong>Your herbal allies</strong></p>' : ''}
            ${alliesHtml}
            <p style="font-family:Georgia,serif;color:#3b2a5e;line-height:1.6;">Move gently this week. Favor warm foods, quiet evenings, and small rituals. When you\u2019re ready, your custom remedy is waiting for you in the apothecary.</p>
          </td></tr>
          <tr><td style="padding:10px 28px 28px;text-align:center;">
            <a href="https://awakenagain.com/" style="display:inline-block;padding:12px 22px;background:linear-gradient(135deg,#6b4f9b,#3b2a5e);color:#fff;text-decoration:none;border-radius:999px;font-family:'Cinzel',Georgia,serif;letter-spacing:0.08em;font-size:13px;">Return to the Apothecary \u2728</a>
          </td></tr>
          <tr><td style="padding:18px 28px;border-top:1px solid #eee;font-family:Georgia,serif;font-size:12px;color:#7a6a95;line-height:1.5;text-align:center;">
            These botanical recommendations support general wellness and are not intended to diagnose, treat, cure, or prevent any disease. Please consult a qualified healthcare professional for medical concerns.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  const text = `${firstName || 'Friend'},

Thank you for taking the herbal quiz. Based on your responses, your body may be asking for deeper support, restoration, and balance right now.

${primaryPattern ? `Primary pattern: ${resultSummary.primaryPattern}\n` : ''}${allyList.length ? `Your herbal allies: ${allyList.join(', ')}\n` : ''}
Move gently this week. Favor warm foods, quiet evenings, and small rituals. When you\u2019re ready, your custom remedy is waiting for you at awakenagain.com.

\u2014 Amber\u2019s Alchemy Apothecary`;

  return { subject, html, text };
}

function buildAdminEmail({ firstName, email, record }) {
  const subject = `New Extended-Results Request \u2014 ${firstName || 'Guest'} (${email})`;
  const summary = record.resultSummary || {};
  const allyList = Array.isArray(summary.allies) ? summary.allies.map(prettyHerbName) : [];

  const html = `<!doctype html>
<html><body style="font-family:Georgia,serif;color:#222;line-height:1.5;">
  <h2 style="margin:0 0 8px;">New Extended Results Request</h2>
  <p style="margin:0 0 14px;color:#555;">A guest requested their expanded personalized results from the quiz.</p>
  <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
    <tr><td><strong>Submission ID</strong></td><td>${escapeHtml(record.key)}</td></tr>
    <tr><td><strong>Timestamp</strong></td><td>${escapeHtml(record.createdAt)}</td></tr>
    <tr><td><strong>First name</strong></td><td>${escapeHtml(firstName || '')}</td></tr>
    <tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
    <tr><td><strong>Primary pattern</strong></td><td>${escapeHtml(summary.primaryPattern || '\u2014')}</td></tr>
    <tr><td><strong>Patterns</strong></td><td>${escapeHtml((summary.patternNames || []).join(', ') || '\u2014')}</td></tr>
    <tr><td><strong>Herbal allies</strong></td><td>${escapeHtml(allyList.join(', ') || '\u2014')}</td></tr>
    <tr><td><strong>Symptoms</strong></td><td>${escapeHtml((record.symptoms || []).join(', ') || '\u2014')}</td></tr>
  </table>
</body></html>`;

  const text = [
    'New Extended Results Request',
    `Submission ID: ${record.key}`,
    `Timestamp: ${record.createdAt}`,
    `First name: ${firstName || ''}`,
    `Email: ${email}`,
    `Primary pattern: ${summary.primaryPattern || ''}`,
    `Patterns: ${(summary.patternNames || []).join(', ')}`,
    `Herbal allies: ${allyList.join(', ')}`,
    `Symptoms: ${(record.symptoms || []).join(', ')}`,
  ].join('\n');

  return { subject, html, text };
}

async function sendViaResend({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { skipped: true, reason: 'no-provider-configured' };
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: GUEST_FROM,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text
      })
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('Resend send failed:', res.status, detail);
      return { sent: false, error: 'provider-error' };
    }
    return { sent: true };
  } catch (err) {
    console.error('Resend send error:', err);
    return { sent: false, error: 'provider-exception' };
  }
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid json' }), { status: 400 });
  }

  const email = String(payload.email || '').trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid email' }), { status: 400 });
  }

  const firstName = sanitizeName(payload.firstName);
  const intent = payload.intent === 'extended-results' ? 'extended-results' : 'quiz-lead';
  const sms = sanitizePhone(payload.sms);
  const smsOptIn = !!payload.smsOptIn && !!sms;
  const symptoms = Array.isArray(payload.symptoms) ? payload.symptoms.slice(0, 10) : [];
  const quizAnswers = typeof payload.quizAnswers === 'object' && payload.quizAnswers !== null
    ? payload.quizAnswers
    : {};
  const rawSummary = payload.resultSummary && typeof payload.resultSummary === 'object'
    ? payload.resultSummary
    : {};
  const resultSummary = {
    primaryPattern: typeof rawSummary.primaryPattern === 'string' ? rawSummary.primaryPattern.slice(0, 120) : '',
    patternNames: Array.isArray(rawSummary.patternNames) ? rawSummary.patternNames.slice(0, 5).map(String) : [],
    allies: Array.isArray(rawSummary.allies) ? rawSummary.allies.slice(0, 20).map(String) : []
  };

  const now = new Date();
  const key = email.replace(/[^a-z0-9]+/gi, '_') + '_' + now.getTime();

  const record = {
    key,
    email,
    firstName,
    sms,
    smsOptIn,
    symptoms,
    quizAnswers,
    resultSummary,
    intent,
    source: intent === 'extended-results' ? 'quiz-results-extended' : 'guided-wellness-quiz',
    userAgent: req.headers.get('user-agent') || '',
    createdAt: now.toISOString(),
    status: 'captured'
  };

  try {
    const leads = getStore('quiz-leads');
    await leads.setJSON(key, record);

    // Maintain a simple per-email index so we can look up the most recent
    // lead for an email without scanning the whole store.
    const index = getStore('quiz-leads-index');
    const prior = await index.get(email, { type: 'json' }).catch(() => null);
    await index.setJSON(email, {
      lastKey: key,
      lastAt: record.createdAt,
      firstName: firstName || (prior && prior.firstName) || '',
      smsOptIn
    });

    if (intent === 'extended-results') {
      // Per-email dedupe: if an extended-results email was already sent for
      // this address within the dedupe window, record the request but do
      // NOT resend. This protects against accidental double-submits and
      // page-refresh duplicates.
      const extendedIndex = getStore('quiz-extended-index');
      const lastSend = await extendedIndex.get(email, { type: 'json' }).catch(() => null);
      const lastTs = lastSend && lastSend.sentAt ? Date.parse(lastSend.sentAt) : 0;
      const withinWindow = lastTs && (now.getTime() - lastTs) < EXTENDED_DEDUPE_WINDOW_MS;

      if (!withinWindow) {
        const guest = buildGuestEmail({ firstName, resultSummary });
        const admin = buildAdminEmail({ firstName, email, record });

        const [guestSend, adminSend] = await Promise.all([
          sendViaResend({ to: email, subject: guest.subject, html: guest.html, text: guest.text }),
          sendViaResend({ to: ADMIN_NOTIFY_TO, subject: admin.subject, html: admin.html, text: admin.text })
        ]);

        await extendedIndex.setJSON(email, {
          lastKey: key,
          sentAt: now.toISOString(),
          firstName,
          guestSend,
          adminSend
        });
      } else {
        console.log('quiz-lead: extended-results dedupe hit for', email);
      }
    }
  } catch (err) {
    console.error('quiz-lead persist error:', err);
    return new Response(JSON.stringify({ ok: false, error: 'storage' }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
