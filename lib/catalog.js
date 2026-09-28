// lib/catalog.js
// Server-side price catalog — the authoritative source of truth for item prices.
// The browser MUST NOT control what amount is charged.
// createPaymentIntent uses this module to compute totals before creating a Stripe PI.

// Free-shipping thresholds (Master Source of Truth, 26 Sept 2026):
// $100 general, $75 for verified Living Grimoire members.
const SHIPPING_THRESHOLD = 100;
const MEMBER_SHIPPING_THRESHOLD = 75;
const SHIPPING_RATE = 6.99;
// Living Grimoire member benefit: 10% storewide. Applied only when membership
// has been verified server-side — never from a client flag.
const MEMBER_DISCOUNT_RATE = 0.10;

// No universal sales-tax rate is assumed. Amber sets SALES_TAX_RATE_PERCENT in
// the Netlify environment once the tax workflow is decided; default is 0.
function getTaxRate() {
  const pct = Number(process.env.SALES_TAX_RATE_PERCENT || 0);
  return Number.isFinite(pct) && pct > 0 && pct < 20 ? pct / 100 : 0;
}

// Balms and oil-style preparations: $11.77 per ounce (Amber, Sept 2026).
const PER_OUNCE_PRICE = 11.77;
const OUNCE_SIZES = [1, 2, 3, 4];
const PER_OUNCE_PRODUCTS = [
  "Amber's Beauty Balm",
  'Ultimate Pain Relieving Balm',
  'Botanical Hair & Scalp Serum',
];

// Soap size/shape pricing (Amber, 23 Sept 2026).
const SOAP_VARIANTS = [
  { id: 'small-rose',    label: 'Small Rose \u00B7 2 oz',                   price: 4.77 },
  { id: 'medium-rose',   label: 'Medium Rose \u00B7 3 oz',                  price: 8.44 },
  { id: 'plain-rect',    label: 'Plain Rectangular \u00B7 3 oz',            price: 7.44 },
  { id: 'large-waves',   label: 'Large Rectangular with Waves \u00B7 4 oz', price: 11.77 },
  { id: 'large-flowers', label: 'Large Circular with Flowers \u00B7 4 oz',  price: 11.77 },
];
const SOAP_NAMES = [
  'Lavender Fairy Dream',
  "Gaia's Rose",
  'Eucalyptus Mint Spa Renewal',
  'Warm Cinnamon Comfort',
  'Orange Lily Goddess',
  'Citrus Goddess Glow',
  'Sacred Forest Ritual',
  'Fresh Mountain Air',
  'Sunlit Garden Bloom',
];

// Renamed products keep their legacy cart names working (retired terms are
// no longer displayed, but old saved carts still resolve to the same item).
const LEGACY_NAME_ALIASES = {
  "Amber's Age Reversal Beauty Balm": "Amber's Beauty Balm",
  'Miracle Hair Regrowth Serum': 'Botanical Hair & Scalp Serum',
  "Gaia's Rose Garden": "Gaia's Rose",
  'Eucalyptus Mint Renewal': 'Eucalyptus Mint Spa Renewal',
};

// Maps exact cart item names → unit price (USD).
// Product names follow the pattern: productName + ' (' + sizeLabel + ')'
// where sizeLabel is the text before the ' — ' in the size option label.
const CATALOG = {
  // ---- Regular products ----
  // Balms/serum (per-ounce) and soaps (size/shape) are generated below.
  'Vital Vitality (30-Day Supply \u00B7 60 Capsules)': 47.99,
  'Immune-At-Ease (30-Day Supply)': 30.00,
  'Lucid Dream Tea (20 Tea Bags)': 12.99,
  'Lucid Dream Tea (1oz Loose Leaf)': 9.99,
  'DreamEase Sleep Capsules (30-Day Supply)': 29.99,
  'Omega-Collagen Boosters (30-Day Supply)': 34.00,
  'Vital Connect (30-Day Supply)': 34.00,
  'Sacred Balance (30-Day Supply)': 32.00,
  'Chill Pill (30-Day Supply)': 30.00,
  'Vital Flow (30-Day Supply)': 30.00,
  'Happy Pill (30-Day Supply)': 32.00,
  'Alchemy Tea Blend (1oz Loose Leaf)': 12.99,
  'Alchemy Tea Blend (2oz Loose Leaf)': 22.99,

  // Capsule formulas shown in the shop at $34.00 that were missing from the
  // server catalog (so they could never be checked out). Matches the displayed
  // price; the $34.47 capsule standard awaits Amber's reconciliation.
  'Detox Formula (30-Day Supply)': 34.00,
  'Mood & Clarity Formula (30-Day Supply)': 34.00,
  'Vital Clarity Formula (30-Day Supply)': 34.00,

  // ---- Soap bundles ----
  'Full Soap Collection (All 5 Bars)': 49.99,
  '5 Custom Soaps Collection': 54.99,
  'Full Soap Collection (All 9 Bars)': 99.99,
  '9 Custom Soaps Collection': 109.99,

  // ---- Wellness bundles ----
  'The Gentle Detox Ritual': 47.99,
  'The Stress Relief Ritual': 49.99,
  'The Focus & Clarity Ritual': 49.99,
  'The Happy & Calm Ritual': 51.99,
  'The Energized & Focused Ritual': 52.99,

  // ---- Services ----
  'Care & Divination Reading': 55.00,
  'Aura & Space Cleansing': 88.00,
  'Past Life Regression': 111.00,
  'Generational Trauma Healing': 125.00,
  'Chakra Balancing': 77.00,
  'Crystal Rebirthing': 95.00,

};

for (const product of PER_OUNCE_PRODUCTS) {
  for (const oz of OUNCE_SIZES) {
    CATALOG[`${product} (${oz}oz)`] = Math.round(PER_OUNCE_PRICE * oz * 100) / 100;
  }
}
for (const soap of SOAP_NAMES) {
  for (const v of SOAP_VARIANTS) CATALOG[`${soap} (${v.label})`] = v.price;
}

// Maps a legacy cart name (e.g. "Miracle Hair Regrowth Serum (2oz)") to its
// current catalog key, or returns the name unchanged.
function canonicalName(rawName) {
  const name = String(rawName || '').trim();
  for (const [legacy, current] of Object.entries(LEGACY_NAME_ALIASES)) {
    if (name === legacy || name.startsWith(legacy + ' (')) return current + name.slice(legacy.length);
  }
  return name;
}

// Custom creations (custom-creations.js, guided-flow.js) and the soap builder
// (js/soap-builder.js) produce items with user-controlled names, so they can't
// be priced by name lookup. Instead the client sends a trusted FORM KEY
// (`customForm`) and, for remedies, a herb count (`herbCount`). The price is
// derived ENTIRELY server-side from this table — the client-supplied price is
// never trusted. Form keys correspond 1:1 to the `data-type` values rendered in
// index.html and to the `recommendedForm` keys used by the guided flow.
const CUSTOM_FORMS = {
  'tea-bags': 12.99,
  'loose-tea': 9.99,
  'tincture': 24.99,
  'balm': 18.99,
  'salve': 16.99,
  'serum': 22.99,
  'poultice': 14.99,
  'capsule': 28.99,
  'custom-soap': 13.99, // fixed-price custom botanical soap (no per-herb pricing)
};

// Forms that price additional herbs. Each selected botanical adds a flat amount.
const HERB_PRICE_FORMS = new Set([
  'tea-bags', 'loose-tea', 'tincture', 'balm', 'salve', 'serum', 'poultice', 'capsule',
]);
const HERB_UNIT_PRICE = 0.23;
const MAX_HERBS = 24; // generous upper bound; clamps absurd/abusive counts

// Human-readable canonical labels for custom forms. These are used to build the
// authoritative paid-order line-item descriptions stored in Stripe PI metadata,
// so the client's free-text item name never becomes trusted fulfilment data.
const CUSTOM_FORM_LABELS = {
  'tea-bags': 'Custom Tea Bags',
  'loose-tea': 'Custom Loose-Leaf Tea',
  'tincture': 'Custom Tincture',
  'balm': 'Custom Balm',
  'salve': 'Custom Salve',
  'serum': 'Custom Serum',
  'poultice': 'Custom Poultice',
  'capsule': 'Custom Capsules',
  'custom-soap': 'Custom Botanical Soap',
};

function clampHerbCount(raw) {
  let herbCount = Math.round(Number(raw));
  if (!Number.isFinite(herbCount) || herbCount < 0) herbCount = 0;
  if (herbCount > MAX_HERBS) herbCount = MAX_HERBS;
  return herbCount;
}

/**
 * Resolve the authoritative unit price for a single cart item.
 *
 * Fixed catalog items (exact name match): the server catalog price is returned
 *   regardless of what the client sent.
 * Custom items: priced from the trusted `customForm` key (validated against
 *   CUSTOM_FORMS) plus a bounded `herbCount` at a fixed per-herb rate. The
 *   client-supplied price/unitPrice is ignored entirely.
 * Anything else: rejected (fail closed) — no client-controlled pricing path
 *   remains for checkout.
 *
 * @param {{name: string, qty: number, customForm?: string, herbCount?: number}} item
 * @returns {number} resolved unit price in USD
 */
function resolvePrice(item) {
  const name = canonicalName(item.name);

  if (Object.prototype.hasOwnProperty.call(CATALOG, name)) {
    return CATALOG[name];
  }

  const form = String(item.customForm || '').trim();
  if (form && Object.prototype.hasOwnProperty.call(CUSTOM_FORMS, form)) {
    let price = CUSTOM_FORMS[form];
    if (HERB_PRICE_FORMS.has(form)) {
      price += clampHerbCount(item.herbCount) * HERB_UNIT_PRICE;
    }
    return Math.round(price * 100) / 100;
  }

  // No name match and no recognised custom form — refuse to guess a price.
  throw new Error(
    `Unrecognised item "${name}" (no catalog match, no valid custom form). ` +
    `Checkout pricing is server-authoritative; this item cannot be priced.`
  );
}

/**
 * Resolve a single cart item to a CANONICAL, server-authoritative line item.
 *
 * The returned `description` is derived entirely from trusted server data —
 * the catalog key for catalog items, or the form label (+ herb count) for
 * custom items. The client's free-text `name` is never used for custom items,
 * so attacker-controlled names cannot become trusted paid-order fulfilment data.
 *
 * @param {{name?: string, qty?: number, customForm?: string, herbCount?: number}} item
 * @returns {{ description: string, qty: number, unitPrice: number, lineTotal: number }}
 */
function resolveLineItem(item) {
  const qty = Math.round(Number(item.qty) || 0);
  if (qty < 1) throw new Error(`Invalid quantity for "${String(item.name || '').trim()}"`);

  const name = canonicalName(item.name);
  const unitPrice = resolvePrice(item);

  let description;
  if (Object.prototype.hasOwnProperty.call(CATALOG, name)) {
    description = name; // canonical catalog name (matched the catalog key)
  } else {
    const form = String(item.customForm || '').trim();
    const label = CUSTOM_FORM_LABELS[form] || `Custom ${form}`;
    if (HERB_PRICE_FORMS.has(form)) {
      const herbCount = clampHerbCount(item.herbCount);
      description = `${label} (${herbCount} herb${herbCount === 1 ? '' : 's'})`;
    } else {
      description = label;
    }
  }

  return { description, qty, unitPrice, lineTotal: Math.round(unitPrice * qty * 100) / 100 };
}

/**
 * Resolve a full cart into canonical, server-authoritative line items.
 * Throws if the cart is empty or any item cannot be resolved.
 *
 * @param {Array} cartItems
 * @returns {Array<{ description: string, qty: number, unitPrice: number, lineTotal: number }>}
 */
function resolveLineItems(cartItems) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error('Cart is empty');
  }
  return cartItems.map(resolveLineItem);
}

/**
 * Compute the authoritative order total for a cart.
 *
 * `opts.memberVerified` must only be true when Living Grimoire membership was
 * verified server-side. `opts.promo` is a promo already validated by
 * resolvePromo() — never a raw client value.
 *
 * Throws if the cart is empty or any item is unknown.
 *
 * @returns {{ subtotal, discount, shipping, tax, total, amountCents, lineItems }}
 */
function computeCartTotal(cartItems, opts = {}) {
  const lineItems = resolveLineItems(cartItems);
  const round = (n) => Math.round(n * 100) / 100;

  const subtotal = round(lineItems.reduce((s, li) => s + li.lineTotal, 0));

  let discount = 0;
  if (opts.memberVerified) discount += subtotal * MEMBER_DISCOUNT_RATE;
  const promo = opts.promo || null;
  if (promo && promo.type === 'percent') discount += subtotal * (promo.value / 100);
  if (promo && promo.type === 'amount') discount += promo.value;
  discount = round(Math.min(discount, subtotal));

  const threshold = opts.memberVerified ? MEMBER_SHIPPING_THRESHOLD : SHIPPING_THRESHOLD;
  const merchandise = subtotal - discount;
  let shipping = subtotal === 0 || merchandise >= threshold ? 0 : SHIPPING_RATE;
  if (promo && promo.type === 'free-shipping') shipping = 0;

  const tax = round(merchandise * getTaxRate());
  const total = round(merchandise + shipping + tax);

  return {
    subtotal, discount, shipping, tax, total,
    amountCents: Math.round(total * 100),
    freeShippingThreshold: threshold,
    lineItems,
  };
}

/**
 * Validate a promo code against the private PROMO_CODES environment variable
 * (JSON: {"CODE": {"type": "percent"|"amount"|"free-shipping", "value": 10}}).
 * Codes never appear in client source. Returns null when unknown/invalid.
 */
function resolvePromo(rawCode) {
  const code = String(rawCode || '').trim().toUpperCase();
  if (!code || code.length > 40) return null;
  let table = {};
  try { table = JSON.parse(process.env.PROMO_CODES || '{}'); } catch (e) { return null; }
  const entry = table[code];
  if (!entry || !['percent', 'amount', 'free-shipping'].includes(entry.type)) return null;
  const value = Number(entry.value) || 0;
  if (entry.type === 'percent' && (value <= 0 || value > 50)) return null;
  if (entry.type === 'amount' && value <= 0) return null;
  return { code, type: entry.type, value };
}

module.exports = {
  computeCartTotal, resolvePrice, resolveLineItem, resolveLineItems, resolvePromo, canonicalName,
  CATALOG, CUSTOM_FORMS, HERB_UNIT_PRICE, MAX_HERBS,
  SOAP_VARIANTS, SOAP_NAMES, PER_OUNCE_PRICE, SHIPPING_THRESHOLD, MEMBER_SHIPPING_THRESHOLD, SHIPPING_RATE,
};
