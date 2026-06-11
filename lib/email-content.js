// lib/email-content.js
// Branded HTML/plain-text email templates for Amber's Alchemy Apothecary.
// Templates are provider-agnostic — they just return { subject, html, text }.

const BRAND = "Awaken Again · Amber's Alchemy Apothecary";
const GOLD = '#b8893a';
const GREEN = '#4a7c59';
const CREAM = '#faf6ee';
const INK = '#3a3329';

function siteUrl() {
  if (process.env.PUBLIC_SITE_URL) return process.env.PUBLIC_SITE_URL.replace(/\/$/, '');
  if (process.env.REPLIT_DEV_DOMAIN) return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  return 'https://awakenagain.com';
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function shell(innerHtml, footerHtml) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${CREAM};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdf9;border:1px solid #ece2cf;border-radius:16px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#2a2418,#3a3120);padding:28px 32px;text-align:center;">
          <div style="color:${GOLD};font-size:13px;letter-spacing:3px;text-transform:uppercase;">✦ Awaken Again ✦</div>
          <div style="color:#f3ead4;font-family:Georgia,serif;font-size:21px;margin-top:6px;">Amber's Alchemy Apothecary</div>
        </td></tr>
        <tr><td style="padding:34px 32px;color:${INK};font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.65;">
          ${innerHtml}
        </td></tr>
        <tr><td style="background:#f6efe0;padding:22px 32px;text-align:center;color:#8a7f6a;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;">
          ${footerHtml || ''}
          <div style="margin-top:10px;">With herbal blessings,<br><strong style="color:${GREEN};">Amber</strong></div>
          <div style="margin-top:10px;">${esc(BRAND)}</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function btn(href, label) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0;"><tr><td style="border-radius:10px;background:${GOLD};">
    <a href="${esc(href)}" style="display:inline-block;padding:13px 26px;color:#fff;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;letter-spacing:0.5px;">${esc(label)}</a>
  </td></tr></table>`;
}

const SUBSCRIPTION_BLURB_HTML = `
  <div style="margin:24px 0;padding:18px 20px;background:#f3f7f2;border-left:3px solid ${GREEN};border-radius:8px;">
    <div style="color:${GREEN};font-weight:bold;font-size:15px;margin-bottom:6px;">✦ Join Amber's Living Grimoire — Inner Circle</div>
    <div style="font-size:14px;line-height:1.6;color:${INK};">For just <strong>$3.33/month</strong>, members receive new grimoire entries &amp; seasonal rituals, member-only pricing, early access to small-batch releases, and herbal guidance straight from Amber's workbench.</div>
  </div>`;

const SUBSCRIPTION_BLURB_TEXT =
  "\nJoin Amber's Living Grimoire — Inner Circle ($3.33/month): new grimoire entries & seasonal rituals, member-only pricing, early access to small-batch releases, and herbal guidance from Amber.\n";

// ── Purchase confirmation (transactional) ──────────────────────────────────
function purchaseConfirmation(order = {}) {
  const name = order.customer_name ? String(order.customer_name).split(' ')[0] : 'friend';
  const product = order.product || 'your items';
  const total = order.order_total ? `$${String(order.order_total).replace(/^\$/, '')}` : null;
  const url = siteUrl();

  const inner = `
    <p style="margin:0 0 14px;">Dear ${esc(name)},</p>
    <p style="margin:0 0 14px;">Thank you, truly, for your order — it means the world to a small apothecary like mine. Your remedies are being prepared by hand with intention and care. 🌿</p>
    <div style="margin:18px 0;padding:16px 18px;background:#faf6ee;border:1px solid #ece2cf;border-radius:8px;font-size:14px;">
      <strong>Your order:</strong> ${esc(product)}${total ? `<br><strong>Total:</strong> ${esc(total)}` : ''}
    </div>
    <p style="margin:0 0 14px;"><strong>What to expect:</strong> because everything is crafted fresh in small batches, I'll send you <strong>shipping updates</strong> as your items make their way to you — so you'll always know when your remedies are on their way.</p>
    ${SUBSCRIPTION_BLURB_HTML}
    ${btn(url + '/grimoir', 'Explore the Inner Circle')}
    <p style="margin:14px 0 0;">If you have any questions about your order, simply reply to this email and I'll personally help.</p>`;

  const text = `Dear ${name},

Thank you for your order — it means the world to a small apothecary like mine. Your remedies are being prepared by hand with intention and care.

Your order: ${product}${total ? `\nTotal: ${total}` : ''}

What to expect: because everything is crafted fresh in small batches, I'll send you shipping updates as your items make their way to you — so you'll always know when your remedies are on their way.
${SUBSCRIPTION_BLURB_TEXT}
Explore the Inner Circle: ${url}/grimoir

If you have any questions, just reply to this email.

With herbal blessings,
Amber
${BRAND}`;

  return { subject: '✦ Thank you for your order — Amber\'s Alchemy Apothecary', html: shell(inner), text };
}

// ── Weekly promo / digest (marketing — requires unsubscribe) ───────────────
// A small rotating library of warm, useful themes so weekly sends stay fresh
// and never feel like the same blast twice.
const PROMO_THEMES = [
  {
    subject: '✦ This week from the apothecary: a moment of calm',
    heading: 'A Gentle Pause',
    body: 'This week, steep a slow cup of chamomile or tulsi and let yourself exhale. Small rituals are the roots of big change. A few of our calming blends are freshly restocked on the shelf.',
    cta: 'See this week\'s restocks',
    path: '/#shop',
  },
  {
    subject: '✦ Herbal wisdom for the week ahead',
    heading: 'Tend Your Inner Garden',
    body: 'Adaptogens like ashwagandha and holy basil help the body meet stress with steadiness. If you\'ve been running on empty, this might be the week to invite a little balance back in.',
    cta: 'Browse herbal supports',
    path: '/#shop',
  },
  {
    subject: '✦ A small-batch note from Amber',
    heading: 'Made by Hand, in Small Batches',
    body: 'Every salve, tincture, and soap here is crafted in tiny batches so nothing sits on a shelf losing its potency. New seasonal pieces are added often — here\'s what\'s blooming now.',
    cta: 'See what\'s new',
    path: '/#shop',
  },
  {
    subject: '✦ Your weekly ritual inspiration',
    heading: 'Ritual of the Week',
    body: 'Try a simple evening ritual: a warm herbal soak, a few deep breaths, and one intention for tomorrow. Our botanical bath blends and soaps were made for exactly these moments.',
    cta: 'Find your ritual',
    path: '/#shop',
  },
];

function weeklyPromo(unsubscribeUrl, weekIndex = 0) {
  const t = PROMO_THEMES[((weekIndex % PROMO_THEMES.length) + PROMO_THEMES.length) % PROMO_THEMES.length];
  const url = siteUrl();

  const inner = `
    <p style="margin:0 0 8px;color:${GOLD};font-size:13px;letter-spacing:2px;text-transform:uppercase;">From the Apothecary</p>
    <h2 style="margin:0 0 14px;font-family:Georgia,serif;color:${INK};font-size:22px;">${esc(t.heading)}</h2>
    <p style="margin:0 0 16px;">${esc(t.body)}</p>
    ${btn(url + t.path, t.cta)}
    ${SUBSCRIPTION_BLURB_HTML}`;

  const footer = `You're receiving this gentle weekly note because you ordered from or joined Amber's Alchemy Apothecary.
    <br><a href="${esc(unsubscribeUrl)}" style="color:#8a7f6a;text-decoration:underline;">Unsubscribe from weekly notes</a>`;

  const text = `From the Apothecary — ${t.heading}

${t.body}

${t.cta}: ${url + t.path}
${SUBSCRIPTION_BLURB_TEXT}
You're receiving this weekly note because you ordered from or joined Amber's Alchemy Apothecary.
Unsubscribe: ${unsubscribeUrl}

With herbal blessings,
Amber
${BRAND}`;

  return { subject: t.subject, html: shell(inner, footer), text };
}

module.exports = { purchaseConfirmation, weeklyPromo, siteUrl, PROMO_THEMES };
