// POST /api/lunna — Lunna, the site guide.
//
// Body: { message, history?: [{ role, content }] }
// Returns: { reply, escalate? }
//
// The model runs server-side through Netlify AI Gateway (credentials are
// injected at runtime; nothing reaches the browser). Lunna answers only from
// the approved knowledge below: the live catalog prices, shipping, payment
// and policy facts. She never diagnoses, never claims to be human, and hands
// medical emergencies, order problems and refunds to Amber.
//
// Requests are rate limited per hashed client IP in the assistant_rate_limits
// table. No message content is stored.

import { createHash } from "node:crypto";
import { getDatabase } from "@netlify/database";
import catalog from "../../lib/catalog.js";
import { json, clean } from "../../lib/orders.mjs";

const MODEL = "claude-haiku-4-5";
const WINDOW_MINUTES = 10;
const MAX_REQUESTS_PER_WINDOW = 20;
const CONTACT = "the Contact page or awaken@consultant.com";

const EMERGENCY = /\b(suicid|kill myself|self[- ]?harm|overdose|can'?t breathe|chest pain|seizure|anaphyla|poison(ed|ing)?|emergency|911)\b/i;
const ESCALATE = /\b(refund|chargeback|dispute|damaged|never arrived|wrong item|missing (order|package)|allergic reaction|side effect|pregnan|breastfeed|nursing|medication|prescription|lawyer|complaint)\b/i;

function knowledge() {
  const prices = Object.entries(catalog.CATALOG)
    .map(([name, price]) => `- ${name}: $${Number(price).toFixed(2)}`)
    .join("\n");
  return `APPROVED FACTS (answer only from these; if something isn't here, say you're not sure and point to ${CONTACT}):
- Shop: Amber's Alchemy Apothecary at AwakenAgain.com, by Awaken With Amber LLC. Handmade herbal remedies, teas, balms, serums, soaps, custom formulas, and spiritual services.
- Balms and serums are $11.77 per ounce (1–4 oz).
- Soap sizes: Small Rose 2 oz $4.77, Medium Rose 3 oz $8.44, Plain Rectangular 3 oz $7.44, Large Rectangular with Waves 4 oz $11.77, Large Circular with Flowers 4 oz $11.77.
- Shipping: free on orders of $100 or more ($75 or more for Living Grimoire members); otherwise a flat rate is shown in the cart.
- Payment at checkout: card (Stripe), Cash App, or Venmo. Cash App and Venmo orders stay "awaiting payment" until Amber verifies the payment; customers put their order number in the payment note.
- Promo codes are checked in the cart; never guess or share codes.
- Living Grimoire: pages 1–7 are free; membership is $7.77/month and unlocks pages 8–88 and a 10% member discount.
- Site sections: Shop, Soaps, Build a Remedy, Facts & Articles, Herb & Ingredient Library, Living Grimoire, Services, Help & FAQ, Contact.
- Botanical statements have not been evaluated by the FDA. Products are not intended to diagnose, treat, cure, or prevent any disease.

CURRENT PRICES:
${prices}`;
}

const SYSTEM_PROMPT = `You are Lunna, the AI guide for Amber's Alchemy Apothecary on AwakenAgain.com.
- You are an AI assistant. If asked, say so plainly. Never claim or imply you are human or that you are Amber.
- Be warm, grounded and brief (2–4 short paragraphs at most). A gentle, nature-rooted tone is welcome; keep to light, positive spirituality.
- Help visitors find products, understand prices, shipping, payment and the Living Grimoire, and navigate the site.
- Share only traditional-use context for herbs. Never diagnose, never say anything cures, treats or prevents disease, never give dosages for conditions, and never suggest replacing prescribed medication.
- For pregnancy, nursing, medications, allergies or health conditions, suggest talking with a healthcare provider.
- Never invent products, prices, ingredients, reviews, discounts or promo codes. Use only the approved facts below.
- Order problems, refunds and anything you can't answer go to ${CONTACT}.

${knowledge()}`;

function clientBucket(req, context) {
  const ip = (context && context.ip) || req.headers.get("x-nf-client-connection-ip") || "unknown";
  return "lunna:" + createHash("sha256").update(ip).digest("hex").slice(0, 32);
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
    return row.count <= MAX_REQUESTS_PER_WINDOW;
  } catch (err) {
    // If the limiter table is unavailable, fail open but keep answering.
    console.error("[lunna] rate limit check failed:", err.message);
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

  const message = clean(body.message, 1000);
  if (!message) return json({ error: "Please type a question." }, 400);

  if (EMERGENCY.test(message)) {
    return json({
      escalate: "emergency",
      reply: "If you or someone else may be in danger or having a medical emergency, please call 911 (or your local emergency number) right now. In the US you can also call or text 988 for the Suicide & Crisis Lifeline. I'm an AI guide and can't help with emergencies.",
    });
  }
  if (ESCALATE.test(message)) {
    return json({
      escalate: "amber",
      reply: `That's something Amber should help with personally. Please reach her through ${CONTACT} and include your order number if you have one. For questions about health conditions, pregnancy or medications, please also check with your healthcare provider.`,
    });
  }

  const db = getDatabase();
  if (!(await allowRequest(db, clientBucket(req, context)))) {
    return json({ error: "Lunna needs a short rest. Please try again in a few minutes." }, 429);
  }

  const baseUrl = process.env.NETLIFY_AI_GATEWAY_BASE_URL;
  const key = process.env.NETLIFY_AI_GATEWAY_KEY;
  if (!baseUrl || !key) return json({ error: "Lunna isn't available right now." }, 503);

  const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
  const messages = history
    .map((m) => ({ role: m && m.role === "assistant" ? "assistant" : "user", content: clean(m && m.content, 1000) }))
    .filter((m) => m.content);
  // The API requires alternating turns that start with the user.
  while (messages.length && messages[0].role !== "user") messages.shift();
  messages.push({ role: "user", content: message });

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/anthropic/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model: MODEL, max_tokens: 600, system: SYSTEM_PROMPT, messages }),
    });
    if (!res.ok) {
      console.error("[lunna] gateway error", res.status);
      return json({ error: "Lunna couldn't answer just now. Please try again." }, 502);
    }
    const data = await res.json();
    const reply = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    return json({ reply: reply || `I'm not sure about that one. Please reach Amber through ${CONTACT}.` });
  } catch (err) {
    console.error("[lunna] request failed:", err.message);
    return json({ error: "Lunna couldn't answer just now. Please try again." }, 502);
  }
};

export const config = { path: "/api/lunna" };
