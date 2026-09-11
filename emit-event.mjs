// netlify/lib/emit-event.mjs
// One outbound webhook for all site automations (Zapier / Make / n8n).
// Server-side only. Import from any Netlify Function:
//   import { emitEvent } from "../lib/emit-event.mjs";
//   await emitEvent("contact.submitted", { name, email, message });
// Never throws — a failed webhook must never break checkout or a form.

import { createHmac, randomUUID } from "node:crypto";

const EVENT_TYPES = new Set([
  "order.paid",             // PayPal capture verified server-side
  "order.manual_pending",   // Cash App / Venmo order created, awaiting Amber's verification
  "contact.submitted",
  "consultation.requested",
  "soap.requested",
]);

const MAX_STRING = 5000;
const MAX_ARRAY = 100;
const TIMEOUT_MS = 5000;

function clean(value, depth = 0) {
  if (value == null || depth > 5) return null;
  if (typeof value === "string") return value.slice(0, MAX_STRING);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.slice(0, MAX_ARRAY).map((v) => clean(v, depth + 1));
  if (typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = clean(v, depth + 1);
    return out;
  }
  return null;
}

export async function emitEvent(type, data = {}) {
  const url = process.env.AUTOMATION_WEBHOOK_URL;
  if (!url) return { sent: false, reason: "no_url" };

  if (!EVENT_TYPES.has(type)) {
    console.warn(`[emit-event] unknown event type: ${type}`);
    return { sent: false, reason: "unknown_type" };
  }

  const event = {
    id: randomUUID(),
    type,
    created_at: new Date().toISOString(),
    source: "awakenagain.com",
    data: clean(data),
  };
  const body = JSON.stringify(event);
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const headers = {
    "Content-Type": "application/json",
    "User-Agent": "AwakenAgain-Automation/1.0",
    "X-Awaken-Event": type,
    "X-Awaken-Id": event.id,
    "X-Awaken-Timestamp": timestamp,
  };

  // Optional signature for receivers that can verify it (n8n, Make, Zapier Code step):
  // HMAC-SHA256 of `${timestamp}.${rawBody}` with AUTOMATION_WEBHOOK_SECRET.
  const secret = process.env.AUTOMATION_WEBHOOK_SECRET;
  if (secret) {
    const sig = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
    headers["X-Awaken-Signature"] = `sha256=${sig}`;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(`[emit-event] ${type} ${event.id} -> HTTP ${res.status}`);
      return { sent: false, reason: `http_${res.status}`, id: event.id };
    }
    return { sent: true, id: event.id };
  } catch (err) {
    // Never log the URL — it is a secret.
    console.error(`[emit-event] ${type} ${event.id} failed: ${err.name}`);
    return { sent: false, reason: err.name, id: event.id };
  }
}
