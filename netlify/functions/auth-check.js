// netlify/functions/auth-check.js
// Grimoire paywall — checks Supabase grimoir_subscribers table
// GET /.netlify/functions/auth-check?email=xxx

const { getAdminClient } = require('../../lib/supabase');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };

  const { email } = event.queryStringParameters || {};

  if (!email) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ access: false, error: 'Email required' }) };
  }

  const normalizedEmail = email.toLowerCase().trim();

  // ── Admin always gets full access ──
  if (normalizedEmail === 'awaken@consultant.com' || normalizedEmail === 'amber@awakenagain.com') {
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ access: true, tier: 'admin' }) };
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ access: false, error: 'Auth service unavailable' }) };
  }

  try {
    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from('grimoir_subscribers')
      .select('id, email, active, expires_at')
      .eq('email', normalizedEmail)
      .eq('active', true)
      .maybeSingle();

    if (error) {
      console.error('Supabase auth-check error:', error.message);
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ access: false, error: 'Auth check failed' }) };
    }

    if (!data) {
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ access: false, tier: 'none' }) };
    }

    // Check expiry if set
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { statusCode: 200, headers: CORS, body: JSON.stringify({ access: false, tier: 'expired' }) };
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ access: true, tier: 'subscriber' }),
    };

  } catch (err) {
    console.error('Auth check error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ access: false, error: 'Auth check failed' }) };
  }
};
