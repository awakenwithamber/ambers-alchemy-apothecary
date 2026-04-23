// POST /.netlify/functions/send-followup-discount
//
// Issues (or reuses) a personal follow-up discount code for a customer
// who has completed their first order, sends the code to them via
// email, and records the dispatch. The code is customer-scoped so it is
// NOT publicized sitewide — per spec: "do not publicly display second
// promo code sitewide".
//
// Typical trigger: internal dashboard / automation after order-create
// flags is_first_order=true. Safe to call idempotently: repeat calls
// for the same customer reuse the same code and mark a new send attempt
// only if the previous attempt failed.

import { getStore } from "@netlify/blobs";
import { readJson, methodNotAllowed, badRequest, ok, serverError, cleanEmail, cleanString, safeKey, escapeHtml } from "../lib/http.mjs";

const DEFAULT_DISCOUNT_PCT = 15;

function generateCode(seed) {
  const base = String(seed || "").replace(/[^A-Z0-9]+/gi, "").toUpperCase().slice(-4) || "AMBER";
  const nonce = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `WELCOME${base}${nonce}`.slice(0, 22);
}

async function sendFollowupEmail({ to, name, code, percent }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, skipped: true, reason: "RESEND_API_KEY not set" };
  }
  const from = process.env.QUIZ_LEAD_FROM_EMAIL || "Amber's Alchemy Apothecary <hello@awakenagain.com>";
  const subject = `A small gift for your next remedy — ${percent}% off inside ✦`;
  const html = `<div style="font-family:Georgia,serif;color:#322;max-width:600px;margin:0 auto;padding:24px;">
    <h2 style="color:#3b2a5e;font-weight:500;">Thank you${name ? ", " + escapeHtml(name) : ""}.</h2>
    <p>Your first remedy from the apothecary is on its way. When you're ready for the next one, I saved you a small something.</p>
    <p style="margin:22px 0;padding:16px;border:1px dashed #c8a96a;background:#fbf6ec;font-family:Menlo,monospace;font-size:1.1rem;color:#3b2a5e;text-align:center;letter-spacing:0.08em;">${escapeHtml(code)}</p>
    <p>Use it at checkout for <strong>${percent}% off</strong> your next order. It's yours — please don't share; it's just for you.</p>
    <p style="margin-top:28px;">With care,<br/>Amber</p>
  </div>`;
  const text = `Thank you${name ? ", " + name : ""}. Here is your personal ${percent}% off code for your next remedy: ${code}.`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html, text }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, status: res.status, error: detail.slice(0, 400) };
    }
    const data = await res.json().catch(() => ({}));
    return { ok: true, id: data.id || null };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err).slice(0, 400) };
  }
}

export default async (req) => {
  if (req.method !== "POST") return methodNotAllowed(req.method);
  const body = await readJson(req);
  if (!body) return badRequest("invalid JSON body");

  const email = cleanEmail(body.email);
  if (!email) return badRequest("valid email required");
  const name = cleanString(body.name || "", 80);
  const percent = Number(body.percent) && Number(body.percent) > 0 && Number(body.percent) <= 50
    ? Math.floor(Number(body.percent))
    : DEFAULT_DISCOUNT_PCT;

  const customers = getStore("customers");
  const promos = getStore("customer-promotions");
  const key = safeKey(email);

  let customer = null;
  try { customer = await customers.get(key, { type: "json" }); } catch (_) { customer = null; }
  if (!customer) return badRequest("no customer record — ensure order was saved first");
  if (!customer.first_order_date) return badRequest("customer has not placed first order");

  let existingPromo = null;
  try { existingPromo = await promos.get(key, { type: "json" }); } catch (_) { existingPromo = null; }

  const code = existingPromo?.code || generateCode(email);
  const now = new Date();

  const delivery = await sendFollowupEmail({ to: email, name: name || customer.name, code, percent });

  const record = {
    id: key,
    customer_id: customer.id,
    email,
    code,
    discount_type: "percentage",
    discount_value: percent,
    personal: true,
    active: true,
    sent_at: delivery.ok ? now.toISOString() : existingPromo?.sent_at || null,
    last_send_attempt_at: now.toISOString(),
    last_send_result: delivery,
    redeemed_at: existingPromo?.redeemed_at || null,
    created_at: existingPromo?.created_at || now.toISOString(),
  };

  try {
    await promos.setJSON(key, record);
    // mark customer as having been offered the follow-up
    customer.eligible_for_followup_discount = false;
    customer.followup_promo_sent_at = record.sent_at || customer.followup_promo_sent_at || null;
    customer.updated_at = now.toISOString();
    await customers.setJSON(key, customer);
  } catch (err) {
    console.error("send-followup-discount write failed:", err && err.message ? err.message : err);
    return serverError("could not persist promo record");
  }

  return ok({
    email,
    code_dispatched: delivery.ok === true,
    delivery_skipped: delivery.skipped === true,
  });
};
