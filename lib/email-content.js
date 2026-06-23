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

// ── Grimoire subscriber lifecycle emails ───────────────────────────────────
// These map onto the existing on-site Stripe subscription + email-OTP access
// model. Access is granted by entering the subscription email on the grimoire
// page to receive a one-time code — never by email address alone.

function grimoireUrl() {
  return siteUrl() + '/grimoir';
}
function giftUrl() {
  // A dedicated gift asset can be set via env; otherwise send members to the
  // grimoire page so the call-to-action always resolves to a working link.
  return process.env.GRIMOIRE_GIFT_URL || grimoireUrl();
}
function manageUrl() {
  // Stripe Customer Portal link if configured; otherwise the grimoire page
  // (where they can re-subscribe / manage access).
  return process.env.STRIPE_PORTAL_URL || grimoireUrl();
}

function firstName(sub = {}) {
  const n = sub.customer_name || sub.name || '';
  return n ? String(n).split(' ')[0] : 'Seer';
}

const GRIMOIRE_BENEFITS_HTML = `
  <div style="margin:22px 0;padding:18px 20px;background:#f3f7f2;border-left:3px solid ${GREEN};border-radius:8px;">
    <div style="color:${GREEN};font-weight:bold;font-size:15px;margin-bottom:8px;">✦ Your subscriber benefits</div>
    <div style="font-size:14px;line-height:1.7;color:${INK};">
      ✦ Full access to the Grimoire of Remembered Light<br>
      ✦ Member-only pricing across the apothecary<br>
      ✦ Monthly articles, seasonal teachings &amp; ritual guides by email<br>
      ✦ New recipes, herbal wisdom &amp; moon practices each month
    </div>
  </div>`;

const GRIMOIRE_BENEFITS_TEXT =
  "\nYour subscriber benefits:\n- Full access to the Grimoire of Remembered Light\n- Member-only pricing across the apothecary\n- Monthly articles, seasonal teachings & ritual guides by email\n- New recipes, herbal wisdom & moon practices each month\n";

function discountLineHtml(sub = {}) {
  if (!sub.discount_code) return '';
  return `<p style="margin:0 0 14px;">Your member code is <strong style="color:${GOLD};">${esc(sub.discount_code)}</strong> — keep it close.</p>`;
}
function discountLineText(sub = {}) {
  return sub.discount_code ? `\nYour member code is ${sub.discount_code} — keep it close.\n` : '';
}

// 1) Welcome / access granted ───────────────────────────────────────────────
function grimoireWelcome(sub = {}) {
  const url = grimoireUrl();
  const inner = `
    <p style="margin:0 0 14px;">Hello ${esc(firstName(sub))},</p>
    <p style="margin:0 0 14px;">The Grimoire of Remembered Light is now open for you — the rituals, the herbal wisdom, the moon practices, the sacred dates, and the quiet teachings carried through this line for generations.</p>
    <p style="margin:0 0 14px;">To return at any time, visit the grimoire page and enter <strong>this email address</strong>. You'll receive a one-time code to unlock the full book — the pages will recognize you.</p>
    ${btn(url, 'Open the Full Grimoire')}
    ${GRIMOIRE_BENEFITS_HTML}
    ${discountLineHtml(sub)}
    <p style="margin:14px 0 0;">Your free gift is on its way in a separate email. May this book be a lantern.</p>`;

  const text = `Hello ${firstName(sub)},

The Grimoire of Remembered Light is now open for you — the rituals, the herbal wisdom, the moon practices, the sacred dates, and the quiet teachings carried through this line for generations.

To return at any time, visit the grimoire page and enter this email address. You'll receive a one-time code to unlock the full book — the pages will recognize you.

Open the Full Grimoire: ${url}
${GRIMOIRE_BENEFITS_TEXT}${discountLineText(sub)}
Your free gift is on its way in a separate email. May this book be a lantern.

With herbal blessings,
Amber
${BRAND}`;

  return { subject: 'The book recognizes you. Welcome back, Seer.', html: shell(inner), text };
}

// 2) Free gift delivery ─────────────────────────────────────────────────────
function grimoireFreeGift(sub = {}) {
  const url = giftUrl();
  const inner = `
    <p style="margin:0 0 14px;">Hello ${esc(firstName(sub))},</p>
    <p style="margin:0 0 14px;">A gift is waiting for you. As a new member of the Grimoire, you receive a free digital gift to mark the beginning of your practice.</p>
    ${btn(url, 'Download Your Free Gift')}
    <p style="margin:0 0 14px;">This is yours to keep, print, and use however feels right. Pin it, tuck it into your journal — this is only the beginning.</p>`;

  const text = `Hello ${firstName(sub)},

A gift is waiting for you. As a new member of the Grimoire, you receive a free digital gift to mark the beginning of your practice.

Download Your Free Gift: ${url}

This is yours to keep, print, and use however feels right. This is only the beginning.

With herbal blessings,
Amber
${BRAND}`;

  return { subject: 'Your free gift from the Grimoire — welcome, Seer', html: shell(inner), text };
}

// 3) Reactivation (canceled / payment failed → inactive) ────────────────────
function grimoireReactivation(sub = {}) {
  const url = grimoireUrl();
  const inner = `
    <p style="margin:0 0 14px;">Hello ${esc(firstName(sub))},</p>
    <p style="margin:0 0 14px;">The Grimoire of Remembered Light has gone quiet for your account — whether your subscription was canceled, a payment didn't go through, or something else came up.</p>
    <p style="margin:0 0 14px;">The pages are patient. They will wait for you.</p>
    ${btn(url, 'Reactivate Your Subscription')}
    <p style="margin:0 0 14px;">When you reactivate, your full access is restored immediately, along with your member benefits and monthly teachings.</p>
    <p style="margin:14px 0 0;">If you have any questions, simply reply to this email.</p>`;

  const text = `Hello ${firstName(sub)},

The Grimoire of Remembered Light has gone quiet for your account — whether your subscription was canceled, a payment didn't go through, or something else came up.

The pages are patient. They will wait for you.

Reactivate Your Subscription: ${url}

When you reactivate, your full access is restored immediately, along with your member benefits and monthly teachings.

If you have any questions, just reply to this email.

With herbal blessings,
Amber
${BRAND}`;

  return { subject: 'Your grimoire has gone quiet — reactivate your subscription', html: shell(inner), text };
}

// 4) Payment reminder (invoice.payment_failed, before cancellation) ──────────
function grimoirePaymentReminder(sub = {}) {
  const url = manageUrl();
  const inner = `
    <p style="margin:0 0 14px;">Hello ${esc(firstName(sub))},</p>
    <p style="margin:0 0 14px;">We noticed a recent payment for your Grimoire subscription didn't go through. This sometimes happens when a card expires or billing details change.</p>
    <p style="margin:0 0 14px;">To keep your full access to the grimoire and your member benefits, please update your payment information.</p>
    ${btn(url, 'Update Your Billing Details')}
    <p style="margin:0 0 14px;">If the payment isn't resolved, your subscription will become inactive and access will be paused. The book will be here when you're ready.</p>`;

  const text = `Hello ${firstName(sub)},

We noticed a recent payment for your Grimoire subscription didn't go through. This sometimes happens when a card expires or billing details change.

To keep your full access to the grimoire and your member benefits, please update your payment information.

Update Your Billing Details: ${url}

If the payment isn't resolved, your subscription will become inactive and access will be paused.

With herbal blessings,
Amber
${BRAND}`;

  return { subject: 'A gentle reminder — your grimoire subscription needs attention', html: shell(inner), text };
}

// 5) Monthly subscriber send (seasonal) ─────────────────────────────────────
// Twelve seasonal frames keyed by calendar month. Caller may override the
// article / ritual / recipe blocks; sensible seasonal defaults are provided.
const GRIMOIRE_MONTHS = [
  { subject: 'January — Winter stillness and the slow return of light ✦', heading: 'Winter Stillness', reflection: 'January is the deep hush of the year — the old calendar honored this as a time of rest and inward tending. Let yourself move slowly. The light is already returning, one minute at a time.', ritual: 'Light a single white candle at dusk. Name one thing you are releasing and one thing you are quietly growing toward.', recipe: 'A warming cinnamon-and-ginger moon milk before bed — steep, sweeten with honey, and sip slowly.' },
  { subject: 'February — Imbolc, flame, and the first whisper of spring ✦', heading: 'The First Whisper of Spring', reflection: 'February holds Imbolc, the festival of returning light and quickening earth. Beneath the frost, roots are stirring. This is a month for small, tender beginnings.', ritual: 'Place a bowl of seeds on your windowsill overnight. In the morning, hold an intention for what you will plant — in soil or in spirit.', recipe: 'A bright lemon-and-thyme tea to wake the senses after winter\'s long quiet.' },
  { subject: 'March — Spring Equinox: balance, bloom, and beginning ✦', heading: 'Balance & Bloom', reflection: 'The Spring Equinox brings day and night into balance. The old calendar marked it as a threshold — a time to step forward with intention as the world greens around you.', ritual: 'At sunrise or sunset, stand with both feet on the earth. Breathe in balance; breathe out what you no longer carry.', recipe: 'A fresh nettle-and-mint infusion — a green tonic to meet the season.' },
  { subject: 'April — The greening and what you planted in the dark ✦', heading: 'The Greening', reflection: 'April is the full unfurling — what you planted in winter\'s dark begins to show. Tend it gently. Growth asks for patience as much as for sun.', ritual: 'Tend one living thing this month with full attention — a plant, a windowbox, a single herb. Let it remind you that care is a practice.', recipe: 'A dandelion-and-honey simmer pot to fill your home with the scent of spring.' },
  { subject: 'May — Beltane fire, creativity, and the full force of life ✦', heading: 'Beltane Fire', reflection: 'May carries Beltane — the fire festival of vitality, creativity, and abundance. The earth is at full song now. Let yourself be generous with your energy.', ritual: 'Gather flowers or fresh herbs and weave or bundle them. Place them where you\'ll see them daily as a reminder of life\'s fullness.', recipe: 'A rose-and-hibiscus iced tea to celebrate the blooming season.' },
  { subject: 'June — Summer Solstice: the sun at its height ✦', heading: 'The Sun at Its Height', reflection: 'The Summer Solstice is the longest day — the sun at its full power. The old calendar celebrated this peak of light and warmth. Soak it in; the wheel will turn soon enough.', ritual: 'Rise to greet the sunrise, or pause at midday to feel the sun on your skin. Set an intention to carry the light forward.', recipe: 'A chilled chamomile-and-lavender lemonade for the long, golden evenings.' },
  { subject: 'July — Long days, herb harvests, and mid-summer magic ✦', heading: 'The Herb Harvest', reflection: 'July is the season of gathering — herbs are at their most potent now. This is a month to harvest, to dry, and to store the abundance for the darker days ahead.', ritual: 'Harvest or buy a fresh bundle of herbs. Hang them to dry, and as you do, give quiet thanks for the season\'s gifts.', recipe: 'A sun-steeped herbal honey — fresh herbs and raw honey, left in the sun to infuse.' },
  { subject: 'August — Lughnasadh and the wisdom of first harvest ✦', heading: 'The First Harvest', reflection: 'August holds Lughnasadh, the first of the harvest festivals. It is a time of gratitude for what has ripened, and of reflection on what you have tended through the year.', ritual: 'Bake or share bread, or offer something you\'ve made. The first harvest is meant to be celebrated in community.', recipe: 'A golden turmeric-and-honey tea to honor the harvest\'s warmth.' },
  { subject: 'September — Autumn Equinox: gratitude, balance, release ✦', heading: 'Gratitude & Release', reflection: 'The Autumn Equinox returns us to balance as the light begins to wane. The old calendar marked it as a time of thanksgiving and of gently letting go.', ritual: 'Write down what you are grateful for and what you are ready to release. Keep the gratitude; safely burn or bury the rest.', recipe: 'A spiced apple-and-clove simmer pot to welcome the turning season.' },
  { subject: 'October — The veil thins and the ancestors draw near ✦', heading: 'The Thinning Veil', reflection: 'October is the month of deepening dark, when the old calendar held that the veil between worlds grows thin. It is a time for remembrance and quiet honoring.', ritual: 'Light a candle for someone who came before you. Speak their name, or simply hold them in your thoughts.', recipe: 'A rich rosehip-and-cinnamon tea for the cooling nights.' },
  { subject: 'November — Samhain, endings, and the sacred dark ✦', heading: 'The Sacred Dark', reflection: 'November carries Samhain\'s long shadow — the year\'s ending, the descent into the sacred dark. Rest is not idleness here; it is the soil of what comes next.', ritual: 'Make space for stillness. Spend one evening by candlelight, unhurried, letting the dark be a comfort rather than a void.', recipe: 'A grounding mushroom-and-cacao elixir for the deepening cold.' },
  { subject: 'December — Winter Solstice: returning the light ✦', heading: 'Returning the Light', reflection: 'The Winter Solstice is the longest night — and the turning point where the light begins, slowly, to return. The old calendar held vigil through this night, trusting the dawn.', ritual: 'On the longest night, light candles one by one. Sit with them, and welcome the returning light with an intention for the year ahead.', recipe: 'A spiced orange-and-clove mulled infusion to warm the solstice night.' },
];

function grimoireMonthly(opts = {}) {
  const idx = Number.isInteger(opts.monthIndex)
    ? ((opts.monthIndex % 12) + 12) % 12
    : new Date().getMonth();
  const m = GRIMOIRE_MONTHS[idx];
  const url = grimoireUrl();
  const unsubscribeUrl = opts.unsubscribeUrl || url;

  const article = opts.article || m.reflection;
  const ritual = opts.ritual || m.ritual;
  const recipe = opts.recipe || m.recipe;

  const inner = `
    <p style="margin:0 0 8px;color:${GOLD};font-size:13px;letter-spacing:2px;text-transform:uppercase;">From the Grimoire</p>
    <h2 style="margin:0 0 14px;font-family:Georgia,serif;color:${INK};font-size:22px;">${esc(m.heading)}</h2>
    <p style="margin:0 0 18px;">Hello, Seer,</p>
    <p style="margin:0 0 18px;">${esc(article)}</p>
    <div style="margin:18px 0;padding:16px 18px;background:#faf6ee;border:1px solid #ece2cf;border-radius:8px;">
      <div style="color:${GREEN};font-weight:bold;font-size:14px;margin-bottom:6px;">This Month's Ritual</div>
      <div style="font-size:14px;line-height:1.65;">${esc(ritual)}</div>
    </div>
    <div style="margin:18px 0;padding:16px 18px;background:#faf6ee;border:1px solid #ece2cf;border-radius:8px;">
      <div style="color:${GREEN};font-weight:bold;font-size:14px;margin-bottom:6px;">This Month's Recipe</div>
      <div style="font-size:14px;line-height:1.65;">${esc(recipe)}</div>
    </div>
    ${btn(url, 'Open the Grimoire')}
    <p style="margin:14px 0 0;">The full grimoire is always open for you — new pages and seasonal additions are added regularly.</p>`;

  const footer = `You're receiving this as an active Grimoire subscriber.
    <br><a href="${esc(unsubscribeUrl)}" style="color:#8a7f6a;text-decoration:underline;">Manage your subscription</a>`;

  const text = `From the Grimoire — ${m.heading}

Hello, Seer,

${article}

This Month's Ritual
${ritual}

This Month's Recipe
${recipe}

Open the Grimoire: ${url}

The full grimoire is always open for you — new pages and seasonal additions are added regularly.

With herbal blessings,
Amber
${BRAND}

Manage your subscription: ${unsubscribeUrl}`;

  return { subject: m.subject, html: shell(inner, footer), text };
}

module.exports = {
  purchaseConfirmation,
  weeklyPromo,
  siteUrl,
  PROMO_THEMES,
  grimoireWelcome,
  grimoireFreeGift,
  grimoireReactivation,
  grimoirePaymentReminder,
  grimoireMonthly,
  GRIMOIRE_MONTHS,
};
