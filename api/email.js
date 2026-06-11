// api/email.js
// Customer email flows: purchase confirmation, weekly promo broadcast, and
// unsubscribe handling. Storage via Supabase; transport via lib/mailer.

const crypto = require('crypto');
const { getAdminClient } = require('../lib/supabase');
const { sendMail, sendBulk } = require('../lib/mailer');
const content = require('../lib/email-content');

function unsubToken(email) {
  const secret = process.env.GRIMOIRE_JWT_SECRET;
  if (!secret) throw new Error('GRIMOIRE_JWT_SECRET is required for unsubscribe tokens');
  return crypto.createHmac('sha256', secret).update(String(email).toLowerCase().trim()).digest('hex').slice(0, 32);
}

function unsubscribeUrl(email) {
  const base = content.siteUrl();
  const e = encodeURIComponent(String(email).toLowerCase().trim());
  return `${base}/unsubscribe?email=${e}&token=${unsubToken(email)}`;
}

function validEmail(e) {
  return typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

// Owner address — gets a BCC of every order confirmation, and is the reply-to
// so customer replies reach the shop owner directly.
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'awaken@consultant.com';
const REPLY_TO = process.env.EMAIL_REPLY_TO || OWNER_EMAIL;

// ── Purchase confirmation (best-effort, called after an order is recorded) ──
async function sendPurchaseConfirmation(order) {
  const email = (order && order.email || '').toLowerCase().trim();
  if (!validEmail(email)) return { ok: false, skipped: true };
  const msg = content.purchaseConfirmation(order);
  return sendMail({
    to: email,
    subject: msg.subject,
    html: msg.html,
    text: msg.text,
    replyTo: REPLY_TO,
    bcc: validEmail(OWNER_EMAIL) ? OWNER_EMAIL : undefined,
  });
}

// ── Gather promo recipients across all customer tables, minus unsubscribes ──
async function gatherRecipients() {
  const sb = getAdminClient();
  const map = new Map(); // email -> { email, name }

  const add = (email, name) => {
    if (!validEmail(email)) return;
    const key = email.toLowerCase().trim();
    if (!map.has(key)) map.set(key, { email: key, name: name || null });
  };

  const sources = [
    sb.from('orders').select('email, customer_name'),
    sb.from('grimoir_subscribers').select('email').eq('active', true),
    sb.from('quiz_leads').select('email, first_name'),
    sb.from('form_submissions').select('email, name'),
  ];
  const [orders, subs, leads, forms] = await Promise.all(sources);
  (orders.data || []).forEach((r) => add(r.email, r.customer_name));
  (subs.data || []).forEach((r) => add(r.email));
  (leads.data || []).forEach((r) => add(r.email, r.first_name));
  (forms.data || []).forEach((r) => add(r.email, r.name));

  const { data: unsubs } = await sb.from('email_unsubscribes').select('email');
  (unsubs || []).forEach((u) => map.delete(u.email.toLowerCase().trim()));

  return Array.from(map.values());
}

// ── Send the weekly promo to everyone (manual button OR scheduler) ──────────
// When `weekKey` is supplied (scheduler), we atomically claim that week by
// inserting a promo_sends row with id=weekKey BEFORE sending. If the insert
// conflicts, another instance/run already claimed this week — we skip. This
// guarantees at most one scheduled broadcast per week even across instances.
async function sendWeeklyPromo({ triggeredBy = 'manual', weekKey = null } = {}) {
  const weekIndex = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const sb = getAdminClient();

  // Atomic weekly claim for scheduled sends.
  if (weekKey) {
    const { error: claimErr } = await sb.from('promo_sends').insert({
      id: weekKey,
      subject: '(claimed)',
      recipient_count: 0,
      triggered_by: triggeredBy,
      status: 'claimed',
    });
    if (claimErr) {
      // Duplicate key → already claimed this week.
      return { ok: true, skipped: false, claimed: false, note: 'Week already claimed' };
    }
  }

  const recipients = await gatherRecipients();
  // Rotate content by ISO week so each weekly send differs.
  const sample = content.weeklyPromo(
    unsubscribeUrl(recipients[0] ? recipients[0].email : 'noone@example.com'),
    weekIndex
  );

  let result = { sent: 0, failed: 0, skipped: 0, total: 0 };
  if (recipients.length) {
    result = await sendBulk(recipients, (r) => ({
      ...content.weeklyPromo(unsubscribeUrl(r.email), weekIndex),
      replyTo: REPLY_TO,
    }));
  }

  // Record the outcome.
  try {
    if (weekKey) {
      // Update the claim row with the final result.
      await sb.from('promo_sends').update({
        subject: sample.subject,
        recipient_count: result.sent,
        status: result.sent > 0 ? 'sent' : 'no_delivery',
        sent_at: new Date().toISOString(),
      }).eq('id', weekKey);
    } else if (result.sent > 0) {
      // Manual send: only log when something was actually delivered, so a
      // disconnected/empty run never blocks the scheduler's freshness check.
      await sb.from('promo_sends').insert({
        id: `promo_${Date.now().toString(36)}`,
        subject: sample.subject,
        recipient_count: result.sent,
        triggered_by: triggeredBy,
        status: 'sent',
      });
    }
  } catch (e) {
    console.error('[promo log]', e.message);
  }

  if (!recipients.length) return { ok: true, ...result, note: 'No recipients', subject: sample.subject };
  return { ok: true, ...result, subject: sample.subject };
}

// ── HTTP: admin trigger ──
exports.adminSendPromo = async (req, res) => {
  try {
    const result = await sendWeeklyPromo({ triggeredBy: 'admin' });
    if (result.skipped) return res.status(503).json({ ok: false, error: 'Email service not connected yet.' });
    res.json(result);
  } catch (err) {
    console.error('[adminSendPromo]', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// ── HTTP: recipient + unsubscribe counts for the dashboard ──
exports.stats = async (req, res) => {
  try {
    const sb = getAdminClient();
    const recipients = await gatherRecipients();
    const { count: unsubCount } = await sb.from('email_unsubscribes').select('*', { count: 'exact', head: true });
    const { data: last } = await sb.from('promo_sends').select('*').order('sent_at', { ascending: false }).limit(1);
    res.json({ ok: true, recipients: recipients.length, unsubscribed: unsubCount || 0, lastPromo: last && last[0] || null });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

// ── HTTP: unsubscribe (public, token-verified) ──
exports.unsubscribe = async (req, res) => {
  const email = (req.query.email || '').toLowerCase().trim();
  const token = req.query.token || '';
  const page = (title, msg) => `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;background:#faf6ee;font-family:Georgia,serif;color:#3a3329;">
<div style="max-width:480px;margin:12vh auto;background:#fffdf9;border:1px solid #ece2cf;border-radius:16px;padding:40px 32px;text-align:center;">
<div style="color:#b8893a;letter-spacing:3px;text-transform:uppercase;font-size:12px;">✦ Awaken Again ✦</div>
<h1 style="font-size:22px;margin:14px 0;">${title}</h1>
<p style="line-height:1.6;color:#6a6253;">${msg}</p>
<a href="${content.siteUrl()}" style="display:inline-block;margin-top:18px;color:#4a7c59;">Return to the apothecary →</a>
</div></body></html>`;

  let expected;
  try {
    expected = validEmail(email) ? unsubToken(email) : null;
  } catch (e) {
    console.error('[unsubscribe]', e.message);
    return res.status(503).send(page('Temporarily unavailable', 'We can\'t process unsubscribes right now. Please reply to any email and we\'ll remove you manually.'));
  }
  if (!expected || token !== expected) {
    return res.status(400).send(page('Invalid link', 'This unsubscribe link is invalid or has expired. Please reply to any email and we\'ll remove you manually.'));
  }
  try {
    const sb = getAdminClient();
    await sb.from('email_unsubscribes').upsert({ email }, { onConflict: 'email' });
    res.send(page('You\'re unsubscribed', 'You won\'t receive any more weekly notes from the apothecary. You\'ll still get order confirmations for any purchases. We\'re grateful you stopped by. 🌿'));
  } catch (err) {
    console.error('[unsubscribe]', err.message);
    res.status(500).send(page('Something went wrong', 'We couldn\'t process that just now. Please reply to any email and we\'ll remove you manually.'));
  }
};

module.exports.sendPurchaseConfirmation = sendPurchaseConfirmation;
module.exports.sendWeeklyPromo = sendWeeklyPromo;
module.exports.gatherRecipients = gatherRecipients;
