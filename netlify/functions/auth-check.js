// netlify/functions/auth-check.js
// This endpoint no longer performs subscriber look-ups by email alone.
// Grimoire access is now gated by the two-step OTP flow:
//   POST /api/grimoire-otp/request  — sends a code to a verified subscriber
//   POST /api/grimoire-otp/verify   — validates the code and grants access
// This handler is kept mounted for backwards-compatibility but always returns
// access: false so that any stale client-side calls fail safely.

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }, body: '' };
  }
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access: false }),
  };
};
