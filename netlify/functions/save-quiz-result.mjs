// POST /.netlify/functions/save-quiz-result
//
// Stores a completed herbal-quiz result. Companion to quiz-lead.mjs,
// which handles the partial (just-an-email) capture. This endpoint
// saves the selections & recommended output so the staff can personalize
// follow-ups later.

import { getStore } from "@netlify/blobs";
import { readJson, methodNotAllowed, badRequest, ok, serverError, cleanEmail, cleanString, safeKey } from "../lib/http.mjs";

export default async (req) => {
  if (req.method !== "POST") return methodNotAllowed(req.method);
  const body = await readJson(req);
  if (!body) return badRequest("invalid JSON body");

  const email = cleanEmail(body.email);
  const customerId = cleanString(body.customer_id || "", 120) || null;
  const selectedSymptoms = Array.isArray(body.selected_symptoms) ? body.selected_symptoms.slice(0, 40).map((s) => cleanString(s, 80)) : [];
  const selectedHerbs = Array.isArray(body.selected_herbs) ? body.selected_herbs.slice(0, 40).map((s) => cleanString(s, 80)) : [];
  const recommendedFormat = cleanString(body.recommended_format || "", 80);
  const recommendedFormula = cleanString(body.recommended_formula || "", 200);

  if (!email && selectedSymptoms.length === 0 && selectedHerbs.length === 0) {
    return badRequest("provide email or selection data");
  }

  const now = new Date();
  const id = `QZ-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`;
  const record = {
    id,
    customer_id: customerId,
    email: email || null,
    selected_symptoms: selectedSymptoms,
    selected_herbs: selectedHerbs,
    recommended_format: recommendedFormat,
    recommended_formula: recommendedFormula,
    created_at: now.toISOString(),
  };

  try {
    const store = getStore("quiz-results");
    await store.setJSON(id, record);
    if (email) {
      // per-email latest-pointer for quick lookup
      const index = getStore("quiz-results-by-email");
      await index.setJSON(safeKey(email), { latest_id: id, email, updated_at: now.toISOString() });
    }
  } catch (err) {
    console.error("save-quiz-result write failed:", err && err.message ? err.message : err);
    return serverError("could not save quiz result");
  }

  return ok({ id });
};
