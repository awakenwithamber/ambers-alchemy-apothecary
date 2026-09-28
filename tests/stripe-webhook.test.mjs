// node --test tests/ — /api/stripe-webhook refuses unsigned or forged events.
// Uses obviously fake placeholder values; no Stripe account, database or
// network is touched because every case is rejected before those are used.

import { test } from "node:test";
import assert from "node:assert/strict";
import handler from "../netlify/functions/stripe-webhook.mjs";

const FAKE_KEY = "sk_test_fake";
const FAKE_SECRET = "whsec_fake_for_tests";

const event = JSON.stringify({ id: "evt_fake", type: "payment_intent.succeeded", data: { object: { id: "pi_fake" } } });
const post = (headers = {}) =>
  handler(new Request("https://awakenagain.com/api/stripe-webhook", { method: "POST", headers, body: event }));

function withEnv(vars, fn) {
  return async () => {
    const saved = {};
    for (const [k, v] of Object.entries(vars)) {
      saved[k] = process.env[k];
      if (v == null) delete process.env[k];
      else process.env[k] = v;
    }
    try { await fn(); } finally {
      for (const [k, v] of Object.entries(saved)) {
        if (v == null) delete process.env[k];
        else process.env[k] = v;
      }
    }
  };
}

test("returns 503 when the webhook is not configured", withEnv({ STRIPE_WEBHOOK_SECRET: null, STRIPE_SECRET_KEY: null }, async () => {
  assert.equal((await post({ "stripe-signature": "t=1,v1=abc" })).status, 503);
}));

test("rejects a request without a signature", withEnv({ STRIPE_WEBHOOK_SECRET: FAKE_SECRET, STRIPE_SECRET_KEY: FAKE_KEY }, async () => {
  assert.equal((await post()).status, 400);
}));

test("rejects a forged signature", withEnv({ STRIPE_WEBHOOK_SECRET: FAKE_SECRET, STRIPE_SECRET_KEY: FAKE_KEY }, async () => {
  const t = Math.floor(Date.now() / 1000);
  const res = await post({ "stripe-signature": `t=${t},v1=${"0".repeat(64)}` });
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /Invalid signature/);
}));

test("rejects non-POST", async () => {
  const res = await handler(new Request("https://awakenagain.com/api/stripe-webhook"));
  assert.equal(res.status, 405);
});
