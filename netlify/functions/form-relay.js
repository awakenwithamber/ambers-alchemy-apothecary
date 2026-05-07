// netlify/functions/form-relay.js
// Receives form POSTs from the site and forwards to the correct Zapier webhook
// POST /.netlify/functions/form-relay
// Body: { formType: "contact"|"consultation"|"soap-order"|"order", ...formData }

const https = require('https');

const WEBHOOK_MAP = {
  contact:      process.env.ZAPIER_CONTACT_WEBHOOK,
  consultation: process.env.ZAPIER_CONSULTATION_WEBHOOK,
  'soap-order': process.env.ZAPIER_SOAP_ORDER_WEBHOOK,
  order:        process.env.ZAPIER_ORDER_WEBHOOK,
};

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': 'https://awakenagain.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { formType, ...formData } = body;

  if (!formType || !WEBHOOK_MAP[formType]) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown form type' }) };
  }

  const webhookUrl = WEBHOOK_MAP[formType];
  if (!webhookUrl) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Webhook not configured' }) };
  }

  try {
    await postToZapier(webhookUrl, formData);
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('Zapier relay error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Relay failed' }) };
  }
};

function postToZapier(webhookUrl, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const url = new URL(webhookUrl);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve(body));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}
