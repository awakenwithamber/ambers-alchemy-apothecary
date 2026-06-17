// Shared brand voice for every automated email sent from awakenagain.com.
//
// The intention behind all of these messages is the same: someone is reaching
// through time and space — not to sell, but to hold space. To say "I see you,
// I feel the weight you're carrying, and you don't have to carry it alone."
//
// Tone pillars: warm & present, uplifting without bypassing, shouldering the
// weight together, and celebratory of small things. Every email should feel
// like it comes from one continuous voice — Amber's — not a system, and should
// close with warmth rather than a call-to-action push.
//
// This module is a helper (it lives in a subdirectory with no matching
// function file), so Netlify does not deploy it as an endpoint. The customer-
// facing email functions import these building blocks so the voice and the look
// stay consistent everywhere.

export function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// How Amber signs off — warmth, not a button. Used to close every email.
export const SIGNATURE_HTML =
  '<p style="font-family:Georgia,serif;color:#3b2a5e;line-height:1.7;margin:22px 0 4px;">Holding a little of the weight with you,</p>' +
  '<p style="font-family:\'Cinzel\',Georgia,serif;color:#3b2a5e;font-size:18px;margin:0;">Amber ☾</p>' +
  '<p style="font-family:Georgia,serif;color:#7a6a95;font-size:13px;margin:2px 0 0;">Amber’s Alchemy Apothecary</p>';

export const SIGNATURE_TEXT =
  'Holding a little of the weight with you,\nAmber ☾\nAmber’s Alchemy Apothecary';

// A handful of grounding reflections drawn from the philosophy Amber returns to
// again and again — manifestation as shared agreement, mindset as a daily
// practice, abundance as service. They are written to be felt, not preached.
// One is woven into every email so no message is ever only about a transaction.
const GROUNDING_THOUGHTS = [
  {
    html:
      'Here’s something I hold close: it only takes two people to make a thing real — one to have the idea, and one to agree that it already is. So let this be me agreeing with whatever quiet hope you’re carrying. It’s real. Keep saying it, even on the days you don’t believe it yet — say it until you do.',
    text:
      'Something I hold close: it only takes two people to make a thing real — one to have the idea, and one to agree that it already is. Let this be me agreeing with whatever quiet hope you’re carrying. It’s real. Keep saying it, even on the days you don’t believe it yet — say it until you do.'
  },
  {
    html:
      'A small practice, if it serves you: tonight, write down the heavy thoughts and the light ones side by side. Whichever list runs longer is simply where your mind has been living lately — not where it has to stay. Where you find a heavy one, set a light one gently beside it. Not to pretend the heaviness away, only to keep it company.',
    text:
      'A small practice, if it serves you: tonight, write down the heavy thoughts and the light ones side by side. Whichever list runs longer is simply where your mind has been living lately — not where it has to stay. Where you find a heavy one, set a light one beside it. Not to pretend the heaviness away, only to keep it company.'
  },
  {
    html:
      'The world can feel heavy right now — I won’t pretend otherwise. But what you send out into it has a way of returning tenfold, so let your wanting be the kind that lifts someone besides yourself too. Abundance built on genuine care never seems to run dry.',
    text:
      'The world can feel heavy right now — I won’t pretend otherwise. But what you send out into it has a way of returning tenfold, so let your wanting be the kind that lifts someone besides yourself too. Abundance built on genuine care never seems to run dry.'
  },
  {
    html:
      'Whatever you’re carrying as you read this — you don’t have to set it down all at once, and you certainly don’t have to carry it alone. Let me hold one corner of it with you today.',
    text:
      'Whatever you’re carrying as you read this — you don’t have to set it down all at once, and you certainly don’t have to carry it alone. Let me hold one corner of it with you today.'
  },
  {
    html:
      'And if you managed one small good thing today — drank the water, answered the message, simply kept going — let it count. It counts. The small things are quietly the whole thing.',
    text:
      'And if you managed one small good thing today — drank the water, answered the message, simply kept going — let it count. It counts. The small things are quietly the whole thing.'
  }
];

// Pick a grounding thought from a stable seed (an email address, an order id)
// so the same person tends to receive a consistent, intentional reflection
// rather than something that feels randomly bolted on.
export function groundingThought(seed) {
  const s = String(seed || '');
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  }
  return GROUNDING_THOUGHTS[hash % GROUNDING_THOUGHTS.length];
}

function groundingBlockHtml(thought) {
  return (
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">' +
    '<tr><td style="padding:16px 18px;background:#f3eef9;border-left:3px solid #6b4f9b;border-radius:0 10px 10px 0;">' +
    `<p style="font-family:Georgia,serif;color:#4a3a6e;line-height:1.7;font-style:italic;margin:0;">${thought.html}</p>` +
    '</td></tr></table>'
  );
}

// Wrap email content in the shared apothecary look — soft parchment background,
// a quiet kicker, a serif heading, the body, a grounding reflection, and
// Amber's warm sign-off. `link` is rendered as a gentle in-flow invitation, not
// a hard call-to-action button.
export function renderHtmlEmail({ kicker, heading, bodyHtml, grounding, link, disclaimerHtml }) {
  const groundingHtml = grounding ? groundingBlockHtml(grounding) : '';
  const linkHtml = link && link.href
    ? `<p style="font-family:Georgia,serif;color:#3b2a5e;line-height:1.7;margin:18px 0 0;">${escapeHtml(link.lead || 'Whenever you’re ready,')} <a href="${escapeHtml(link.href)}" style="color:#6b4f9b;text-decoration:underline;">${escapeHtml(link.label)}</a>.</p>`
    : '';
  const disclaimer = disclaimerHtml
    ? `<tr><td style="padding:18px 28px;border-top:1px solid #eee;font-family:Georgia,serif;font-size:12px;color:#7a6a95;line-height:1.5;text-align:center;">${disclaimerHtml}</td></tr>`
    : '';

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f7f1ea;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f1ea;padding:28px 12px;">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;box-shadow:0 10px 30px rgba(60,30,110,0.12);overflow:hidden;">
          <tr><td style="padding:28px 28px 6px;text-align:center;">
            <div style="font-family:'Cinzel',Georgia,serif;letter-spacing:0.18em;font-size:12px;color:#6b4f9b;text-transform:uppercase;">✦ ${escapeHtml(kicker)}</div>
            <h1 style="font-family:'Cinzel',Georgia,serif;font-size:22px;color:#3b2a5e;margin:10px 0 0;line-height:1.35;">${escapeHtml(heading)}</h1>
          </td></tr>
          <tr><td style="padding:14px 28px 8px;">
            ${bodyHtml}
            ${groundingHtml}
            ${linkHtml}
            ${SIGNATURE_HTML}
          </td></tr>
          ${disclaimer}
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

// Assemble the plain-text counterpart in the same voice and order.
export function renderTextEmail({ heading, bodyText, grounding, link, disclaimerText }) {
  const parts = [];
  if (heading) parts.push(heading, '');
  if (bodyText) parts.push(bodyText, '');
  if (grounding) parts.push(grounding.text, '');
  if (link && link.href) parts.push(`${link.lead || 'Whenever you’re ready,'} ${link.label}: ${link.href}`, '');
  parts.push(SIGNATURE_TEXT);
  if (disclaimerText) parts.push('', disclaimerText);
  return parts.join('\n');
}
