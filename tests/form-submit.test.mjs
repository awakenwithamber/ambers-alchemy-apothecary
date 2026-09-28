// node --test tests/ — /api/form-submit input validation.
// Only the paths that reject before touching the database are exercised, so
// no database, email provider or network is needed.

import { test } from "node:test";
import assert from "node:assert/strict";
import handler from "../netlify/functions/form-submit.mjs";

const post = (body) =>
  handler(
    new Request("https://awakenagain.com/api/form-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
    { ip: "203.0.113.9" },
  );

test("rejects non-POST", async () => {
  const res = await handler(new Request("https://awakenagain.com/api/form-submit"), {});
  assert.equal(res.status, 405);
});

test("rejects malformed JSON", async () => {
  assert.equal((await post("{not json")).status, 400);
});

test("rejects the honeypot field", async () => {
  const res = await post({ formType: "contact", name: "A", email: "a@example.com", message: "hi", website: "spam" });
  assert.equal(res.status, 400);
});

test("rejects unknown form types", async () => {
  const res = await post({ formType: "payment", name: "A", email: "a@example.com", message: "hi" });
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /Unknown form/);
});

test("rejects invalid email", async () => {
  const res = await post({ formType: "contact", name: "A", email: "not-an-email", message: "hi" });
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /valid email/);
});

test("contact form requires name and message", async () => {
  const res = await post({ formType: "contact", email: "a@example.com" });
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /name and message/);
});
