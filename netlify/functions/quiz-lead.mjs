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
import {
  escapeHtml,
  groundingThought,
  renderHtmlEmail,
  renderTextEmail
} from "./lib/voice.mjs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ADMIN_NOTIFY_TO = 'awaken@consultant.com';
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

function prettyHerbName(id) {
  if (!id) return '';
  return String(id)
    .split('-')
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function buildGuestEmail({ firstName, resultSummary, email }) {
  const greetName = firstName ? escapeHtml(firstName) : 'friend';
  const primaryPattern = resultSummary && resultSummary.primaryPattern
    ? escapeHtml(resultSummary.primaryPattern)
    : '';
  const allyList = Array.isArray(resultSummary && resultSummary.allies)
    ? resultSummary.allies.map(prettyHerbName).filter(Boolean)
    : [];

  const subject = firstName
    ? `${firstName}, I\u2019ve been thinking about your answers \u2728`
    : 'I\u2019ve been sitting with your answers \u2728';

  const alliesHtml = allyList.length
    ? `<ul style="padding-left:18px;margin:10px 0 18px;color:#3b2a5e;font-family:Georgia,serif;line-height:1.7;">${allyList
        .map((n) => `<li style="margin:4px 0;">\u2726 ${escapeHtml(n)}</li>`)
        .join('')}</ul>`
    : '';

  const patternLine = primaryPattern
    ? `<p style="font-family:Georgia,serif;color:#3b2a5e;line-height:1.7;">What you shared pointed most gently toward <strong>${primaryPattern}</strong> \u2014 something so many people carry quietly, without ever saying it aloud. The herbs below aren\u2019t a fix. They\u2019re companions, chosen for what your body seems to be quietly asking for right now.</p>`
    : '';

  const bodyHtml = `
    <p style="font-family:Georgia,serif;color:#3b2a5e;line-height:1.7;">${greetName}, thank you for trusting me with your answers to the quiz. I don\u2019t take that lightly \u2014 sharing where you\u2019re weary or out of balance takes a kind of quiet courage, and I felt it in what you wrote.</p>
    ${patternLine}
    ${allyList.length ? '<p style="font-family:Georgia,serif;color:#3b2a5e;line-height:1.7;margin:18px 0 6px;"><strong>The allies I\u2019d reach for, were I sitting beside you</strong></p>' : ''}
    ${alliesHtml}
    <p style="font-family:Georgia,serif;color:#3b2a5e;line-height:1.7;">Be gentle with yourself this week. Warm food, quiet evenings, small rituals that ask nothing of you. There\u2019s no rush here, and nothing to earn.</p>`;

  const html = renderHtmlEmail({
    kicker: 'A note, just for you',
    heading: firstName ? `${greetName}, your deeper reading is here.` : 'Your deeper reading is here.',
    bodyHtml,
    grounding: groundingThought(email || firstName || 'guest'),
    link: {
      lead: 'And whenever \u2014 if ever \u2014 it feels right,',
      label: 'a remedy is waiting quietly for you in the apothecary',
      href: 'https://awakenagain.com/'
    },
    disclaimerHtml: 'These botanical companions support general wellness and are not intended to diagnose, treat, cure, or prevent any disease. Please consult a qualified healthcare professional for medical concerns.'
  });

  const bodyText = `${firstName || 'Friend'}, thank you for trusting me with your answers to the quiz. Sharing where you're weary or out of balance takes a kind of quiet courage, and I felt it in what you wrote.

${primaryPattern ? `What you shared pointed most gently toward: ${resultSummary.primaryPattern} \u2014 something so many people carry quietly.\n` : ''}${allyList.length ? `The allies I'd reach for, were I sitting beside you: ${allyList.join(', ')}\n` : ''}
Be gentle with yourself this week. Warm food, quiet evenings, small rituals that ask nothing of you. There's no rush here, and nothing to earn.`;

  const text = renderTextEmail({
    heading: '',
    bodyText,
    grounding: groundingThought(email || firstName || 'guest'),
    link: {
      lead: 'And whenever \u2014 if ever \u2014 it feels right,',
      label: 'a remedy is waiting for you at',
      href: 'https://awakenagain.com/'
    },
    disclaimerText: 'These botanical companions support general wellness and are not intended to diagnose, treat, cure, or prevent any disease. Please consult a qualified healthcare professional for medical concerns.'
  });

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
        const guest = buildGuestEmail({ firstName, resultSummary, email });
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
