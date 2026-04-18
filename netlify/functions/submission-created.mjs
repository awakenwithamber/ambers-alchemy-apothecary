// Triggered automatically when a Netlify Form submission is created.
//
// Routes each form to its appropriate handler:
//   * checkout-order    → persist order + queue post-purchase review request
//   * newsletter-signup → persist subscriber + optional admin notification
//   * custom-remedy     → persist consultation request + notify admin
//   * custom-soap       → persist soap atelier request + notify admin
//
// Every handler stores data in Netlify Blobs (authoritative source of truth) and
// sends email notifications via Resend when RESEND_API_KEY is configured. Silent
// failures are logged but never raise to the user-visible client — the 200 OK
// from the form endpoint is Netlify's receipt that the submission was stored.

import { getStore } from "@netlify/blobs";

const REVIEW_REQUEST_DELAY_DAYS = 10;
const ADMIN_NOTIFY_TO = 'awaken@consultant.com';
const GUEST_FROM = process.env.QUIZ_LEAD_FROM_EMAIL || "Amber\u2019s Alchemy Apothecary <hello@awakenagain.com>";

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

async function handleCheckoutOrder(payload) {
  const data = payload.data || {};
  const orderId = data['transaction-id'] || `ORD-${Date.now()}`;
  const email = (data['email'] || '').toLowerCase().trim();
  const now = new Date();
  const sendAt = new Date(now.getTime() + REVIEW_REQUEST_DELAY_DAYS * 24 * 60 * 60 * 1000);

  const order = {
    orderId,
    customerName: data['customer-name'],
    email,
    phone: data['phone'],
    shippingAddress: `${data['shipping-address']}, ${data['city-state-zip']}`,
    product: data['product-ordered'],
    quantity: data['quantity'],
    notes: data['order-notes'],
    transactionId: data['transaction-id'],
    paymentStatus: data['payment-status'],
    orderTotal: data['order-total'],
    submittedAt: payload.created_at || now.toISOString(),
  };

  const orders = getStore('orders');
  await orders.setJSON(orderId, order);

  if (email) {
    const reviewRequests = getStore('review-requests');
    await reviewRequests.setJSON(orderId, {
      orderId,
      email,
      customerName: data['customer-name'],
      product: data['product-ordered'],
      sendAt: sendAt.toISOString(),
      reminderAt: new Date(sendAt.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'queued',
      initialSent: false,
      reminderSent: false,
      createdAt: now.toISOString(),
    });
  }
}

async function handleNewsletterSignup(payload) {
  const data = payload.data || {};
  const email = (data['email'] || '').toLowerCase().trim();
  if (!email) return;

  const sourceTag = (data['source-tag'] || 'homepage-signup').slice(0, 40);
  const name = (data['name'] || '').trim().slice(0, 80);
  const now = new Date();
  const createdAt = payload.created_at || now.toISOString();

  const subscribers = getStore('newsletter-subscribers');
  const existing = await subscribers.get(email, { type: 'json' }).catch(() => null);
  const record = {
    email,
    name: name || (existing && existing.name) || '',
    sourceTag,
    firstSeenAt: (existing && existing.firstSeenAt) || createdAt,
    lastSeenAt: createdAt,
    signupCount: ((existing && existing.signupCount) || 0) + 1,
    status: 'subscribed'
  };
  await subscribers.setJSON(email, record);

  // Welcome email to subscriber + admin alert.
  const welcomeSubject = 'Your Herbal Healing Guide is on its way \u2728';
  const welcomeHtml = `<!doctype html><html><body style="margin:0;padding:0;background:#f7f1ea;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f1ea;padding:28px 12px;">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;box-shadow:0 10px 30px rgba(60,30,110,0.12);overflow:hidden;">
          <tr><td style="padding:28px;text-align:center;font-family:Georgia,serif;color:#3b2a5e;">
            <div style="font-family:'Cinzel',Georgia,serif;letter-spacing:0.18em;font-size:12px;color:#6b4f9b;text-transform:uppercase;">\u2726 Welcome to the Apothecary</div>
            <h1 style="font-family:'Cinzel',Georgia,serif;font-size:22px;margin:10px 0 12px;">${escapeHtml(name || 'Friend')}, your guide is arriving.</h1>
            <p style="line-height:1.6;">Thank you for subscribing. Amber\u2019s Beginner\u2019s Guide to Herbal Healing \u2014 twenty herbs and how to use them \u2014 will arrive in your inbox shortly.</p>
            <p style="line-height:1.6;">In the meantime, feel free to wander back to the apothecary whenever the mood strikes.</p>
            <a href="https://awakenagain.com/" style="display:inline-block;margin-top:14px;padding:12px 22px;background:linear-gradient(135deg,#6b4f9b,#3b2a5e);color:#fff;text-decoration:none;border-radius:999px;font-family:'Cinzel',Georgia,serif;letter-spacing:0.08em;font-size:13px;">Return to the Apothecary \u2728</a>
          </td></tr>
        </table>
      </td></tr>
    </table></body></html>`;
  const welcomeText = `${name || 'Friend'}, thank you for subscribing. Amber's Beginner's Guide to Herbal Healing is on its way.`;

  const adminSubject = `New Newsletter Subscriber \u2014 ${name || email}`;
  const adminHtml = `<!doctype html><html><body style="font-family:Georgia,serif;color:#222;line-height:1.5;">
    <h2 style="margin:0 0 8px;">New Newsletter Signup</h2>
    <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
      <tr><td><strong>Name</strong></td><td>${escapeHtml(name || '\u2014')}</td></tr>
      <tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
      <tr><td><strong>Source</strong></td><td>${escapeHtml(sourceTag)}</td></tr>
      <tr><td><strong>Timestamp</strong></td><td>${escapeHtml(createdAt)}</td></tr>
      <tr><td><strong>Total signups</strong></td><td>${record.signupCount}</td></tr>
    </table>
  </body></html>`;
  const adminText = `New newsletter signup: ${name || email} <${email}> (source: ${sourceTag})`;

  // Only send welcome on first signup so refresh/resubmit doesn't spam.
  const sends = [];
  if (record.signupCount === 1) {
    sends.push(sendViaResend({ to: email, subject: welcomeSubject, html: welcomeHtml, text: welcomeText }));
  }
  sends.push(sendViaResend({ to: ADMIN_NOTIFY_TO, subject: adminSubject, html: adminHtml, text: adminText }));
  await Promise.all(sends);
}

async function handleCustomRemedy(payload) {
  const data = payload.data || {};
  const email = (data['email'] || '').toLowerCase().trim();
  if (!email) return;

  const sourceTag = (data['source-tag'] || 'custom-remedy').slice(0, 40);
  const now = new Date();
  const createdAt = payload.created_at || now.toISOString();
  const key = email.replace(/[^a-z0-9]+/gi, '_') + '_' + Date.now();

  const record = {
    key,
    email,
    name: (data['name'] || '').trim().slice(0, 120),
    symptoms: (data['symptoms'] || '').slice(0, 4000),
    remedyType: data['remedy-type'] || '',
    medications: (data['medications'] || '').slice(0, 1000),
    supplements: (data['supplements'] || '').slice(0, 1000),
    allergies: (data['allergies'] || '').slice(0, 1000),
    pregnancyStatus: data['pregnancy-status'] || '',
    notes: (data['notes'] || '').slice(0, 4000),
    ageConfirmed: data['age-confirmed'] === 'yes',
    interactionAcknowledged: data['interaction-acknowledged'] === 'yes',
    sourceTag,
    createdAt,
    status: 'pending-review'
  };

  const store = getStore('custom-remedy-requests');
  await store.setJSON(key, record);

  const customerSubject = 'We received your herbal consultation request \u2728';
  const customerHtml = `<!doctype html><html><body style="margin:0;padding:0;background:#f7f1ea;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f1ea;padding:28px 12px;">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;box-shadow:0 10px 30px rgba(60,30,110,0.12);overflow:hidden;">
          <tr><td style="padding:28px;text-align:center;font-family:Georgia,serif;color:#3b2a5e;">
            <div style="font-family:'Cinzel',Georgia,serif;letter-spacing:0.18em;font-size:12px;color:#6b4f9b;text-transform:uppercase;">\u2726 Consultation Request Received</div>
            <h1 style="font-family:'Cinzel',Georgia,serif;font-size:22px;margin:10px 0 12px;">${escapeHtml(record.name || 'Friend')}, thank you for trusting Amber.</h1>
            <p style="line-height:1.6;text-align:left;">Amber has received your consultation notes and will review them personally. You can expect a response within 24\u201348 hours with your custom formula recommendation.</p>
            <p style="line-height:1.6;text-align:left;">If anything changes in the meantime, simply reply to this email and your note will reach her directly.</p>
          </td></tr>
        </table>
      </td></tr>
    </table></body></html>`;
  const customerText = `${record.name || 'Friend'}, thank you for your consultation request. Amber will respond within 24\u201348 hours.`;

  const adminSubject = `New Custom Remedy Request \u2014 ${record.name || email}`;
  const adminHtml = `<!doctype html><html><body style="font-family:Georgia,serif;color:#222;line-height:1.5;">
    <h2 style="margin:0 0 8px;">New Custom Remedy Request</h2>
    <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
      <tr><td><strong>Submission</strong></td><td>${escapeHtml(key)}</td></tr>
      <tr><td><strong>Name</strong></td><td>${escapeHtml(record.name || '\u2014')}</td></tr>
      <tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
      <tr><td><strong>Remedy type</strong></td><td>${escapeHtml(record.remedyType || '\u2014')}</td></tr>
      <tr><td><strong>Symptoms</strong></td><td><pre style="white-space:pre-wrap;margin:0;font-family:inherit;">${escapeHtml(record.symptoms)}</pre></td></tr>
      <tr><td><strong>Medications</strong></td><td>${escapeHtml(record.medications || '\u2014')}</td></tr>
      <tr><td><strong>Supplements</strong></td><td>${escapeHtml(record.supplements || '\u2014')}</td></tr>
      <tr><td><strong>Allergies</strong></td><td>${escapeHtml(record.allergies || '\u2014')}</td></tr>
      <tr><td><strong>Pregnancy</strong></td><td>${escapeHtml(record.pregnancyStatus || '\u2014')}</td></tr>
      <tr><td><strong>Notes</strong></td><td><pre style="white-space:pre-wrap;margin:0;font-family:inherit;">${escapeHtml(record.notes)}</pre></td></tr>
      <tr><td><strong>Source</strong></td><td>${escapeHtml(sourceTag)}</td></tr>
      <tr><td><strong>Submitted</strong></td><td>${escapeHtml(createdAt)}</td></tr>
    </table>
  </body></html>`;
  const adminText = [
    `New Custom Remedy Request`,
    `Submission: ${key}`,
    `Name: ${record.name}`,
    `Email: ${email}`,
    `Remedy type: ${record.remedyType}`,
    `Symptoms: ${record.symptoms}`,
    `Medications: ${record.medications}`,
    `Supplements: ${record.supplements}`,
    `Allergies: ${record.allergies}`,
    `Pregnancy: ${record.pregnancyStatus}`,
    `Notes: ${record.notes}`,
    `Source: ${sourceTag}`
  ].join('\n');

  await Promise.all([
    sendViaResend({ to: email, subject: customerSubject, html: customerHtml, text: customerText }),
    sendViaResend({ to: ADMIN_NOTIFY_TO, subject: adminSubject, html: adminHtml, text: adminText })
  ]);
}

async function handleCustomSoap(payload) {
  const data = payload.data || {};
  const email = (data['email'] || '').toLowerCase().trim();
  if (!email) return;

  const sourceTag = (data['source-tag'] || 'custom-soap').slice(0, 40);
  const now = new Date();
  const createdAt = payload.created_at || now.toISOString();
  const key = email.replace(/[^a-z0-9]+/gi, '_') + '_' + Date.now();

  const record = {
    key,
    email,
    name: (data['name'] || '').trim().slice(0, 120),
    scent: data['scent'] || '',
    color: data['color'] || '',
    shape: data['shape'] || '',
    botanical: data['botanical'] || '',
    quantity: data['quantity'] || '',
    notes: (data['notes'] || '').slice(0, 2000),
    sourceTag,
    createdAt,
    status: 'pending-review'
  };

  const store = getStore('custom-soap-requests');
  await store.setJSON(key, record);

  const customerSubject = 'Your custom soap request has been received \u2728';
  const customerHtml = `<!doctype html><html><body style="margin:0;padding:0;background:#f7f1ea;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f1ea;padding:28px 12px;">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;box-shadow:0 10px 30px rgba(60,30,110,0.12);overflow:hidden;">
          <tr><td style="padding:28px;text-align:center;font-family:Georgia,serif;color:#3b2a5e;">
            <div style="font-family:'Cinzel',Georgia,serif;letter-spacing:0.18em;font-size:12px;color:#6b4f9b;text-transform:uppercase;">\u2726 Custom Soap Request</div>
            <h1 style="font-family:'Cinzel',Georgia,serif;font-size:22px;margin:10px 0 12px;">${escapeHtml(record.name || 'Friend')}, your request is with Amber.</h1>
            <p style="line-height:1.6;text-align:left;">Amber will confirm your scent, botanicals, and shipping details within 1\u20132 business days. Custom bars typically ship within 7\u201310 business days after confirmation.</p>
            <p style="line-height:1.6;text-align:left;">Reply to this email if you need to change anything.</p>
          </td></tr>
        </table>
      </td></tr>
    </table></body></html>`;
  const customerText = `${record.name || 'Friend'}, Amber has received your custom soap request and will confirm details within 1-2 business days.`;

  const adminSubject = `New Custom Soap Order \u2014 ${record.name || email}`;
  const adminHtml = `<!doctype html><html><body style="font-family:Georgia,serif;color:#222;line-height:1.5;">
    <h2 style="margin:0 0 8px;">New Custom Soap Order</h2>
    <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
      <tr><td><strong>Submission</strong></td><td>${escapeHtml(key)}</td></tr>
      <tr><td><strong>Name</strong></td><td>${escapeHtml(record.name || '\u2014')}</td></tr>
      <tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
      <tr><td><strong>Scent</strong></td><td>${escapeHtml(record.scent || '\u2014')}</td></tr>
      <tr><td><strong>Color</strong></td><td>${escapeHtml(record.color || '\u2014')}</td></tr>
      <tr><td><strong>Shape</strong></td><td>${escapeHtml(record.shape || '\u2014')}</td></tr>
      <tr><td><strong>Botanical</strong></td><td>${escapeHtml(record.botanical || '\u2014')}</td></tr>
      <tr><td><strong>Quantity</strong></td><td>${escapeHtml(record.quantity || '\u2014')}</td></tr>
      <tr><td><strong>Notes</strong></td><td><pre style="white-space:pre-wrap;margin:0;font-family:inherit;">${escapeHtml(record.notes)}</pre></td></tr>
      <tr><td><strong>Source</strong></td><td>${escapeHtml(sourceTag)}</td></tr>
      <tr><td><strong>Submitted</strong></td><td>${escapeHtml(createdAt)}</td></tr>
    </table>
  </body></html>`;
  const adminText = [
    `New Custom Soap Order`,
    `Submission: ${key}`,
    `Name: ${record.name}`,
    `Email: ${email}`,
    `Scent: ${record.scent}`,
    `Color: ${record.color}`,
    `Shape: ${record.shape}`,
    `Botanical: ${record.botanical}`,
    `Quantity: ${record.quantity}`,
    `Notes: ${record.notes}`,
    `Source: ${sourceTag}`
  ].join('\n');

  await Promise.all([
    sendViaResend({ to: email, subject: customerSubject, html: customerHtml, text: customerText }),
    sendViaResend({ to: ADMIN_NOTIFY_TO, subject: adminSubject, html: adminHtml, text: adminText })
  ]);
}

export default async (req) => {
  try {
    const body = await req.json();
    const payload = body.payload;
    if (!payload) return new Response('OK');

    const formName = payload.form_name;
    if (formName === 'checkout-order') {
      await handleCheckoutOrder(payload);
    } else if (formName === 'newsletter-signup') {
      await handleNewsletterSignup(payload);
    } else if (formName === 'custom-remedy') {
      await handleCustomRemedy(payload);
    } else if (formName === 'custom-soap') {
      await handleCustomSoap(payload);
    }

    return new Response('OK');
  } catch (err) {
    console.error('submission-created error:', err);
    return new Response('Error', { status: 500 });
  }
};
