// Shared helpers for Netlify Functions (JSON request handling + input validation).

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function methodNotAllowed(method, allowed = ["POST"]) {
  return new Response(JSON.stringify({ ok: false, error: `method ${method} not allowed` }), {
    status: 405,
    headers: { "Content-Type": "application/json", Allow: allowed.join(", ") },
  });
}

export async function readJson(req) {
  try {
    const body = await req.json();
    if (body && typeof body === "object") return body;
  } catch (_) {}
  return null;
}

export function badRequest(message) {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}

export function ok(data = {}) {
  return new Response(JSON.stringify({ ok: true, ...data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export function serverError(message = "internal error") {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}

export function cleanString(raw, max = 300) {
  if (raw == null) return "";
  return String(raw).replace(/[<>]/g, "").trim().slice(0, max);
}

export function cleanEmail(raw) {
  const s = String(raw || "").trim().toLowerCase();
  if (!EMAIL_RE.test(s)) return "";
  return s.slice(0, 254);
}

export function safeKey(raw) {
  return String(raw || "").replace(/[^a-z0-9_-]+/gi, "_").slice(0, 120);
}

export function escapeHtml(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
