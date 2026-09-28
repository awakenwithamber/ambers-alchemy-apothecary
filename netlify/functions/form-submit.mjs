// POST /api/form-submit — contact, consultation and free-guide requests.
//
// Body: { formType: "contact" | "consultation" | "soap" | "guide", name, email,
//         subject?, message?, fields?: { label: value }, website? (honeypot) }
// Returns: { ok: true, emailed } — `emailed` is true only when the
// notification to Amber was accepted by the email provider.
//
// Every submission is saved to the contact_messages table first, so nothing
// is lost if email isn't configured. Requests are rate limited per hashed
// client IP (assistant_rate_limits table). Nothing here claims to send the
// visitor an email: the free guide is sent by Amber after she is notified.

import { createHash } from "node:crypto";
import { getDatabase } from "@netlify/database";
import mailer from "../../lib/mailer.js";
import { json, clean, isEmail, orderNotifyEmail } from "../../lib/orders.mjs";

const FORM_TYPES = {
  contact: "Contact message",
  consultation: "Herbal consultation request",
  soap: "Custom soap request",
  guide: "Free Beginner's Guide request",
};
const WINDOW_MINUTES = 10;
const MAX_PER_WINDOW = 8;
const MAX_FIELDS = 20;

function clientBucket(req, context) {
  const ip = (context && context.ip) || req.headers.get("x-nf-client-connection-ip") || "unknown";
  return "form:" + createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

async function allowRequest(db, bucket) {
  try {
    const [row] = await db.sql`
      INSERT INTO assistant_rate_limits (bucket, window_start, count)
      VALUES (${bucket}, now(), 1)
      ON CONFLICT (bucket) DO UPDATE SET
        count = CASE WHEN assistant_rate_limits.window_start < now() - make_interval(mins => ${WINDOW_MINUTES})
                     THEN 1 ELSE assistant_rate_limits.count + 1 END,
        window_start = CASE WHEN assistant_rate_limits.window_start < now() - make_interval(mins => ${WINDOW_MINUTES})
                     THEN now() ELSE assistant_rate_limits.window_start END
      RETURNING count
    `;
    return row.count <= MAX_PER_WINDOW;
  } catch (err) {
    console.error("[form-submit] rate limit check failed:", err.message);
    return true;
  }
}

export default async (req, context) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }
  if (body.website) return json({ error: "Invalid request." }, 400);

  const formType = clean(body.formType, 20);
  if (!FORM_TYPES[formType]) return json({ error: "Unknown form." }, 400);

  const name = clean(body.name, 120);
  const email = clean(body.email, 254).toLowerCase();
  const message = clean(body.message, 4000);
  if (!isEmail(email)) return json({ error: "Please enter a valid email address." }, 400);
  if (formType !== "guide" && (!name || (!message && !body.fields))) {
    return json({ error: "Please fill in your name and message." }, 400);
  }

  const fieldLines = [];
  if (body.fields && typeof body.fields === "object") {
    for (const [label, value] of Object.entries(body.fields).slice(0, MAX_FIELDS)) {
      const v = clean(value, 1000);
      if (v) fieldLines.push(`${clean(label, 60)}: ${v}`);
    }
  }
  const subject = `[${FORM_TYPES[formType]}] ${clean(body.subject, 120) || ""}`.trim();
  const fullMessage = [message, ...fieldLines].filter(Boolean).join("\n") || FORM_TYPES[formType];

  const db = getDatabase();
  if (!(await allowRequest(db, clientBucket(req, context)))) {
    return json({ error: "Too many submissions. Please try again in a few minutes." }, 429);
  }

  try {
    await db.sql`
      INSERT INTO contact_messages (name, email, subject, message)
      VALUES (${name || "Not provided"}, ${email}, ${subject}, ${fullMessage})
    `;
  } catch (err) {
    console.error("[form-submit] save failed:", err.message);
    return json({ error: "We couldn't save your message. Please email awaken@consultant.com." }, 500);
  }

  const sent = await mailer.sendMail({
    to: orderNotifyEmail(),
    replyTo: email,
    subject: `${subject} — ${name || email}`,
    text: [`From: ${name || "Not provided"} <${email}>`, "", fullMessage].join("\n"),
  });

  return json({ ok: true, emailed: Boolean(sent && sent.ok) });
};

export const config = { path: "/api/form-submit" };
