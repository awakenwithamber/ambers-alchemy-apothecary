// node --test tests/ — server-authoritative pricing in lib/catalog.js.
// Expected values are the Sept 2026 prices recorded in CLAUDE.md.

import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const catalog = require("../lib/catalog.js");
const { CATALOG, SOAP_VARIANTS, SOAP_NAMES, computeCartTotal, resolvePrice } = catalog;

delete process.env.SALES_TAX_RATE_PERCENT;

test("shipping thresholds and rate", () => {
  assert.equal(catalog.SHIPPING_THRESHOLD, 100);
  assert.equal(catalog.MEMBER_SHIPPING_THRESHOLD, 75);
  assert.equal(catalog.SHIPPING_RATE, 6.99);
});

test("per-ounce balms are $11.77/oz", () => {
  assert.equal(catalog.PER_OUNCE_PRICE, 11.77);
  const oneOz = Object.keys(CATALOG).find((k) => k.endsWith("(1oz)") && CATALOG[k] === 11.77);
  assert.ok(oneOz, "a 1oz per-ounce product is priced at 11.77");
  const base = oneOz.slice(0, -"(1oz)".length);
  assert.equal(CATALOG[`${base}(2oz)`], 23.54);
  assert.equal(CATALOG[`${base}(4oz)`], 47.08);
});

test("soap variant prices", () => {
  const prices = Object.fromEntries(SOAP_VARIANTS.map((v) => [v.id, v.price]));
  assert.deepEqual(prices, {
    "small-rose": 4.77,
    "medium-rose": 8.44,
    "plain-rect": 7.44,
    "large-waves": 11.77,
    "large-flowers": 11.77,
  });
  const soap = SOAP_NAMES[0];
  for (const v of SOAP_VARIANTS) assert.equal(CATALOG[`${soap} (${v.label})`], v.price);
});

test("client-supplied price is ignored", () => {
  const name = `${SOAP_NAMES[0]} (${SOAP_VARIANTS[0].label})`;
  const t = computeCartTotal([{ name, qty: 2, price: 0.01 }]);
  assert.equal(t.subtotal, Math.round(SOAP_VARIANTS[0].price * 2 * 100) / 100);
});

test("unknown items are refused, not guessed", () => {
  assert.throws(() => resolvePrice({ name: "Totally Made Up Product", qty: 1 }), /Unrecognised item/);
  assert.throws(() => computeCartTotal([]), /Cart is empty/);
  assert.throws(() => computeCartTotal([{ name: Object.keys(CATALOG)[0], qty: 0 }]), /Invalid quantity/);
});

test("shipping: $6.99 under $100, free at $100, member free at $75", () => {
  const large = SOAP_VARIANTS.find((v) => v.id === "large-waves");
  const soap = `${SOAP_NAMES[0]} (${large.label})`; // 11.77

  const small = computeCartTotal([{ name: soap, qty: 1 }]);
  assert.equal(small.shipping, 6.99);
  assert.equal(small.total, 18.76);
  assert.equal(small.amountCents, 1876);

  const nine = computeCartTotal([{ name: soap, qty: 9 }]); // 105.93
  assert.equal(nine.subtotal, 105.93);
  assert.equal(nine.shipping, 0);

  // 7 × 11.77 = 82.39; member 10% off = 74.15 < 75 → shipping; 8 × = 94.16 → 84.74 ≥ 75 → free
  const m7 = computeCartTotal([{ name: soap, qty: 7 }], { memberVerified: true });
  assert.equal(m7.freeShippingThreshold, 75);
  assert.equal(m7.shipping, 6.99);
  const m8 = computeCartTotal([{ name: soap, qty: 8 }], { memberVerified: true });
  assert.equal(m8.shipping, 0);
  const n8 = computeCartTotal([{ name: soap, qty: 8 }]);
  assert.equal(n8.shipping, 6.99);
});

test("no sales tax unless SALES_TAX_RATE_PERCENT is set", () => {
  const t = computeCartTotal([{ name: Object.keys(CATALOG)[0], qty: 1 }]);
  assert.equal(t.tax, 0);
});
