// POST /.netlify/functions/save-remedy-session
//
// Persists progress in the custom remedy / custom soap builder. Lets
// a customer return later, and gives staff enough context to help if
// the customer asks Lunna or books a consultation.

import { getStore } from "@netlify/blobs";
import { readJson, methodNotAllowed, badRequest, ok, serverError, cleanEmail, cleanString, safeKey } from "../lib/http.mjs";

export default async (req) => {
  if (req.method !== "POST") return methodNotAllowed(req.method);
  const body = await readJson(req);
  if (!body) return badRequest("invalid JSON body");

  const email = cleanEmail(body.email);
  const customerId = cleanString(body.customer_id || "", 120) || null;
  const sessionId = cleanString(body.session_id || "", 120);
  const selectedSymptoms = Array.isArray(body.selected_symptoms) ? body.selected_symptoms.slice(0, 40).map((s) => cleanString(s, 80)) : [];
  const selectedHerbs = Array.isArray(body.selected_herbs) ? body.selected_herbs.slice(0, 40).map((s) => cleanString(s, 80)) : [];
  const suggestedRemedyType = cleanString(body.suggested_remedy_type || "", 80);
  const cartPayload = body.cart_payload && typeof body.cart_payload === "object" ? body.cart_payload : null;

  if (!email && !sessionId && selectedSymptoms.length === 0 && selectedHerbs.length === 0) {
    return badRequest("nothing to save");
  }

  const now = new Date();
  const key = sessionId || `RB-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`;
  const store = getStore("remedy-builder-sessions");

  let existing = null;
  try {
    existing = await store.get(key, { type: "json" });
  } catch (_) {
    existing = null;
  }

  const record = {
    id: key,
    customer_id: customerId,
    email: email || existing?.email || null,
    selected_symptoms: selectedSymptoms.length ? selectedSymptoms : existing?.selected_symptoms || [],
    selected_herbs: selectedHerbs.length ? selectedHerbs : existing?.selected_herbs || [],
    suggested_remedy_type: suggestedRemedyType || existing?.suggested_remedy_type || "",
    cart_payload: cartPayload || existing?.cart_payload || null,
    created_at: existing?.created_at || now.toISOString(),
    updated_at: now.toISOString(),
  };

  try {
    await store.setJSON(key, record);
    if (record.email) {
      const index = getStore("remedy-sessions-by-email");
      await index.setJSON(safeKey(record.email), { latest_id: key, email: record.email, updated_at: now.toISOString() });
    }
  } catch (err) {
    console.error("save-remedy-session write failed:", err && err.message ? err.message : err);
    return serverError("could not save builder session");
  }

  return ok({ id: key });
};
