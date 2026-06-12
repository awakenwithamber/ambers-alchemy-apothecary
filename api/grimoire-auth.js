// api/grimoire-auth.js
// Grimoire paywall — two-step OTP authentication.
// Step 1: POST /api/grimoire-otp/request  { email }
//   → If the email belongs to an active subscriber, send a 6-digit OTP.
//   → Always returns the same generic message to avoid oracle behaviour.
// Step 2: POST /api/grimoire-otp/verify   { email, otp }
//   → Validates the OTP; on success returns { access: true }.

const crypto = require('crypto');
const { getAdminClient } = require('../lib/supabase');
const { sendMail } = require('../lib/mailer');

// ── In-memory OTP store ───────────────────────────────────────────────────────
// Maps normalised email → { hash, expires, attempts }
// Fine for a single-instance Replit deployment; a short-lived token in Supabase
// would be required for multi-instance scale.
const otpStore = new Map();

const OTP_TTL_MS       = 10 * 60 * 1000; // 10 minutes
const OTP_MAX_ATTEMPTS = 5;

// ── Simple sliding-window rate limiter ───────────────────────────────────────
// Maps rate-limit key → { count, resetAt }
const rateLimiter = new Map();
const RATE_WINDOW_MS   = 15 * 60 * 1000; // 15 minutes
const RATE_MAX_REQUEST = 5;  // max OTP requests per email per window
const RATE_MAX_VERIFY  = 10; // max verify attempts per email per window

function checkRate(key, max) {
  const now = Date.now();
  let entry = rateLimiter.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimiter.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function validEmail(e) {
  return typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

function hashOtp(otp, email) {
  const secret = process.env.GRIMOIRE_JWT_SECRET;
  if (!secret) throw new Error('GRIMOIRE_JWT_SECRET is required');
  return crypto
    .createHmac('sha256', secret)
    .update(`${email.toLowerCase().trim()}:${otp}`)
    .digest('hex');
}

// ── Step 1: request an OTP ────────────────────────────────────────────────────
exports.requestOtp = async (req, res) => {
  const email = (req.body?.email || '').toLowerCase().trim();

  if (!validEmail(email)) {
    return res.status(400).json({ ok: false, error: 'Valid email required' });
  }

  if (!checkRate(`req:${email}`, RATE_MAX_REQUEST)) {
    return res.status(429).json({ ok: false, error: 'Too many requests. Please try again later.' });
  }

  // Check subscriber status. We deliberately do NOT reveal the result in the
  // response — the message is the same whether the email is recognised or not.
  let isSubscriber = false;
  try {
    const sb = getAdminClient();
    const { data, error } = await sb
      .from('grimoir_subscribers')
      .select('id, expires_at')
      .eq('email', email)
      .eq('active', true)
      .maybeSingle();

    if (error) {
      console.error('[grimoire-auth] DB error on requestOtp:', error.message);
      return res.status(500).json({ ok: false, error: 'Service unavailable. Please try again.' });
    }

    if (data) {
      const notExpired = !data.expires_at || new Date(data.expires_at) > new Date();
      isSubscriber = notExpired;
    }
  } catch (e) {
    console.error('[grimoire-auth] requestOtp exception:', e.message);
    return res.status(500).json({ ok: false, error: 'Service unavailable. Please try again.' });
  }

  if (isSubscriber) {
    let hash;
    try {
      const otp = generateOtp();
      hash = hashOtp(otp, email);
      otpStore.set(email, { hash, expires: Date.now() + OTP_TTL_MS, attempts: 0 });

      sendMail({
        to: email,
        subject: 'Your Grimoire Access Code',
        html: `
<div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;color:#3a3329;">
  <p style="color:#b8893a;letter-spacing:3px;text-transform:uppercase;font-size:12px;text-align:center;">✦ Awaken Again ✦</p>
  <h2 style="text-align:center;font-size:20px;">Your one-time access code</h2>
  <p style="text-align:center;font-size:2rem;letter-spacing:6px;font-weight:bold;color:#4a7c59;">${otp}</p>
  <p style="color:#6a6253;font-size:13px;text-align:center;">This code expires in 10 minutes.<br>If you didn't request this, you can ignore this email.</p>
</div>`,
        text: `Your one-time Grimoire access code is: ${otp}\n\nThis code expires in 10 minutes. If you didn't request this, you can ignore this email.`,
      }).catch((e) => console.error('[grimoire-auth] OTP email send failed:', e.message));
    } catch (e) {
      console.error('[grimoire-auth] OTP generation failed:', e.message);
      return res.status(500).json({ ok: false, error: 'Service unavailable. Please try again.' });
    }
  }

  // Always respond identically regardless of subscriber status.
  return res.json({
    ok: true,
    message: 'If an active subscription is linked to that email, a one-time code has been sent.',
  });
};

// Generic failure message used for ALL verify failures that are not rate-limit
// or input-validation errors. A single constant prevents an attacker from
// distinguishing "no OTP issued (non-subscriber)" from "wrong OTP (subscriber)"
// by observing response differences.
const VERIFY_FAIL_MSG = 'Invalid or expired code. Please request a new code.';

// ── Step 2: verify the OTP ────────────────────────────────────────────────────
exports.verifyOtp = async (req, res) => {
  const email = (req.body?.email || '').toLowerCase().trim();
  const otp   = (req.body?.otp   || '').replace(/\s/g, '');

  if (!validEmail(email) || !otp) {
    return res.status(400).json({ ok: false, error: 'Email and code are required' });
  }

  if (!checkRate(`ver:${email}`, RATE_MAX_VERIFY)) {
    return res.status(429).json({ ok: false, error: 'Too many attempts. Please try again later.' });
  }

  const entry = otpStore.get(email);

  // No entry (non-subscriber or code never requested): return the same message
  // as a wrong code so callers cannot tell whether this email is a subscriber.
  if (!entry || Date.now() > entry.expires) {
    if (entry) otpStore.delete(email);
    return res.status(400).json({ ok: false, error: VERIFY_FAIL_MSG });
  }

  let expectedHash;
  try {
    expectedHash = hashOtp(otp, email);
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'Service unavailable. Please try again.' });
  }

  if (expectedHash !== entry.hash) {
    entry.attempts = (entry.attempts || 0) + 1;
    if (entry.attempts >= OTP_MAX_ATTEMPTS) {
      otpStore.delete(email);
    }
    // Same generic message regardless of how many attempts remain.
    return res.status(400).json({ ok: false, error: VERIFY_FAIL_MSG });
  }

  // Code is correct — consume it immediately (single-use).
  otpStore.delete(email);

  return res.json({ ok: true, access: true, tier: 'subscriber' });
};
