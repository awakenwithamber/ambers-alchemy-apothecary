// api/form-submit.js
// Stores site form submissions (contact, consultation, soap-order, order,
// email-capture) in Supabase so they appear in the admin dashboard.
// Optionally forwards to a Zapier webhook if one is configured for the type.

const https = require('https');
const { getAdminClient } = require('../lib/supabase');

const ALLOWED_TYPES = new Set([
  'contact',
  'consultation',
  'soap-order',
  'order',
  'email-capture',
]);

const WEBHOOK_MAP = {
  contact: 'ZAPIER_CONTACT_WEBHOOK',
  consultation: 'ZAPIER_CONSULTATION_WEBHOOK',
  'soap-order': 'ZAPIER_SOAP_ORDER_WEBHOOK',
  order: 'ZAPIER_ORDER_WEBHOOK',
};

function clean(str, max) {
  if (str === undefined || str === null) return null;
  const s = String(str).replace(/\u0000/g, '').replace(/[<>]/g, '').trim();
  if (!s) return null;
  return s.length > max ? s.slice(0, max) : s;
}

function postToZapier(webhookUrl, data) {
  return new Promise((resolve) => {
    try {
      const body = JSON.stringify(data);
      const url = new URL(webhookUrl);
      const req = https.request(
        {
          hostname: url.hostname,
          path: url.pathname + url.search,
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
        },
        (r) => { r.on('data', () => {}); r.on('end', resolve); }
      );
      req.on('error', resolve);
      req.write(body);
      req.end();
    } catch {
      resolve();
    }
  });
}

exports.submit = async (req, res) => {
  const body = req.body || {};
  const { formType, ...formData } = body;

  if (!formType || !ALLOWED_TYPES.has(formType)) {
    return res.status(400).json({ ok: false, error: 'Invalid or missing formType' });
  }

  const id = `fs_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const record = {
    id,
    form_type: formType,
    name: clean(formData.name || formData['customer-name'] || formData.fullName, 120),
    email: clean(formData.email, 200),
    phone: clean(formData.phone, 40),
    subject: clean(formData.subject, 200),
    message: clean(formData.message || formData.notes || formData['order-notes'] || formData.details, 4000),
    payload: formData,
  };

  try {
    const sb = getAdminClient();
    const { error } = await sb.from('form_submissions').insert(record);
    if (error) {
      console.error('[form-submit]', error.message);
      return res.status(500).json({ ok: false, error: 'Could not save submission' });
    }
  } catch (err) {
    console.error('[form-submit]', err.message);
    return res.status(500).json({ ok: false, error: 'Could not save submission' });
  }

  // Best-effort forward to Zapier if a webhook is configured (non-blocking failure)
  const webhookEnv = WEBHOOK_MAP[formType];
  const webhookUrl = webhookEnv ? process.env[webhookEnv] : null;
  if (webhookUrl) {
    await postToZapier(webhookUrl, { formType, ...formData });
  }

  res.json({ ok: true, id });
};
