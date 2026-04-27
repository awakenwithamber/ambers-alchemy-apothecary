// auth.js — Netlify Identity client helper.
// Provides login, signup, logout, getUser, getToken for the Grimior pages.

(function () {
  const IDENTITY_BASE = `${window.location.origin}/.netlify/identity`;
  const STORAGE_KEY = 'grimior:identity';
  const ADMIN_FALLBACK_KEY = 'grimior:adminEmail';

  function readSession() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }
    catch (e) { return null; }
  }
  function writeSession(sess) {
    if (sess) localStorage.setItem(STORAGE_KEY, JSON.stringify(sess));
    else localStorage.removeItem(STORAGE_KEY);
  }

  async function api(path, opts = {}) {
    const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    const res = await fetch(`${IDENTITY_BASE}${path}`, Object.assign({}, opts, { headers }));
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch (e) { json = null; }
    if (!res.ok) {
      const msg = (json && (json.error_description || json.msg || json.error)) || res.statusText;
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }
    return json;
  }

  async function signup(email, password, fullName) {
    return api('/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, data: { full_name: fullName || '' } })
    });
  }

  async function login(email, password) {
    const params = new URLSearchParams({ grant_type: 'password', username: email, password });
    const res = await fetch(`${IDENTITY_BASE}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    const json = await res.json();
    if (!res.ok) {
      const err = new Error((json && (json.error_description || json.error)) || 'Login failed');
      err.status = res.status;
      throw err;
    }
    const session = {
      access_token: json.access_token,
      refresh_token: json.refresh_token,
      expires_at: Date.now() + (json.expires_in || 3600) * 1000,
      email: email.toLowerCase().trim()
    };
    // Decode JWT for user info
    try {
      const payload = JSON.parse(atob(json.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      session.user = {
        email: payload.email,
        sub: payload.sub,
        full_name: (payload.user_metadata && payload.user_metadata.full_name) || ''
      };
    } catch (e) {}
    writeSession(session);
    return session;
  }

  function logout() {
    writeSession(null);
  }

  function getSession() {
    const s = readSession();
    if (!s) return null;
    if (s.expires_at && s.expires_at < Date.now() - 60000) {
      // Expired (with 60s skew). Could refresh; for simplicity, drop it.
      return null;
    }
    return s;
  }

  function getToken() {
    const s = getSession();
    return s ? s.access_token : null;
  }

  function getUser() {
    const s = getSession();
    if (!s) return null;
    return s.user || { email: s.email };
  }

  function getEmail() {
    const u = getUser();
    if (u && u.email) return u.email;
    // Fallback for legacy email-only access (Stripe path)
    try { return localStorage.getItem(ADMIN_FALLBACK_KEY) || ''; } catch (e) { return ''; }
  }

  function setFallbackEmail(email) {
    try { localStorage.setItem(ADMIN_FALLBACK_KEY, email); } catch (e) {}
  }

  async function authedFetch(url, opts = {}) {
    const token = getToken();
    const headers = Object.assign({}, opts.headers || {});
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const email = getEmail();
    let target = url;
    // Some endpoints accept email as fallback for legacy access
    if (!token && email && !target.includes('email=')) {
      target += target.includes('?') ? `&email=${encodeURIComponent(email)}` : `?email=${encodeURIComponent(email)}`;
    }
    return fetch(target, Object.assign({}, opts, { headers }));
  }

  window.GrimiorAuth = {
    signup, login, logout,
    getSession, getToken, getUser, getEmail,
    setFallbackEmail, authedFetch
  };
})();
