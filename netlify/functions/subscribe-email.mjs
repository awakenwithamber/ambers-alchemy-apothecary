// POST /.netlify/functions/subscribe-email
//
// Adds an email subscriber to the "email-subscribers" blob store.
// De-duplicates on the email key so repeated submissions don't spawn
// extra rows. Accepts an optional source tag (e.g. "footer", "homepage",
// "quiz") so follow-ups can segment by entry point.

import { getStore } from "@netlify/blobs";
import { readJson, methodNotAllowed, badRequest, ok, serverError, cleanEmail, cleanString, safeKey } from "../lib/http.mjs";

export default async (req) => {
  if (req.method !== "POST") return methodNotAllowed(req.method);
  const body = await readJson(req);
  if (!body) return badRequest("invalid JSON body");

  const email = cleanEmail(body.email);
  if (!email) return badRequest("valid email required");
  const name = cleanString(body.name || "", 80);
  const source = cleanString(body.source || "web", 40);

  const now = new Date();
  const key = safeKey(email);
  const store = getStore("email-subscribers");

  let existing = null;
  try {
    existing = await store.get(key, { type: "json" });
  } catch (_) {
    existing = null;
  }

  const record = {
    id: key,
    email,
    name: name || existing?.name || "",
    source: existing?.source || source,
    subscribed_at: existing?.subscribed_at || now.toISOString(),
    last_seen_at: now.toISOString(),
  };

  try {
    await store.setJSON(key, record);
  } catch (err) {
    console.error("subscribe-email write failed:", err && err.message ? err.message : err);
    return serverError("could not save subscriber");
  }

  return ok({ email, new_subscriber: !existing });
};
