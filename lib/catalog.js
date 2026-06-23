// lib/catalog.js
// Server-side price catalog — the authoritative source of truth for item prices.
// The browser MUST NOT control what amount is charged.
// createPaymentIntent uses this module to compute totals before creating a Stripe PI.

const SHIPPING_THRESHOLD = 75;
const SHIPPING_RATE = 6.99;
const TAX_RATE = 0.08;

// Maps exact cart item names → unit price (USD).
// Product names follow the pattern: productName + ' (' + sizeLabel + ')'
// where sizeLabel is the text before the ' — ' in the size option label.
const CATALOG = {
  // ---- Regular products ----
  "Amber's Age Reversal Beauty Balm (2oz)": 21.99,
  "Amber's Age Reversal Beauty Balm (3oz)": 29.99,
  "Amber's Age Reversal Beauty Balm (4oz)": 37.99,
  'Ultimate Pain Relieving Balm (2oz)': 21.99,
  'Ultimate Pain Relieving Balm (3oz)': 29.99,
  'Ultimate Pain Relieving Balm (4oz)': 37.99,
  'Vital Vitality (30-Day Supply \u00B7 60 Capsules)': 47.99,
  'Immune-At-Ease (30-Day Supply)': 30.00,
  'Miracle Hair Regrowth Serum (2oz)': 21.99,
  'Miracle Hair Regrowth Serum (3oz)': 29.99,
  'Miracle Hair Regrowth Serum (4oz)': 37.99,
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

  // ---- Artisan soaps (individual bars) ----
  'Lavender Fairy Dream': 12.99,
  "Gaia's Rose": 12.99,
  'Eucalyptus Mint Spa Renewal': 12.99,
  'Warm Cinnamon Comfort': 12.99,
  'Orange Lily Goddess': 12.99,
  'Citrus Goddess Glow': 12.99,
  'Sacred Forest Ritual': 12.99,
  'Fresh Mountain Air': 12.99,
  'Sunlit Garden Bloom': 12.99,

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

  // ---- Best-seller soap display-name aliases (used in renderBestSellers) ----
  // The best-sellers section uses displayName instead of the canonical soap name.
  "Gaia's Rose Garden": 12.99,
  'Eucalyptus Mint Renewal': 12.99,
};

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
  const name = String(item.name || '').trim();

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

  const name = String(item.name || '').trim();
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
 * Compute the authoritative order total for a cart, applying the same
 * shipping and tax rules as the client-side UI.
 *
 * Throws if the cart is empty, any item is unknown, or any custom-item
 * price is outside the allowed range.
 *
 * @param {Array<{name: string, qty: number, unitPrice?: number}>} cartItems
 * @returns {{ subtotal: number, shipping: number, tax: number, total: number, amountCents: number }}
 */
function computeCartTotal(cartItems) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error('Cart is empty');
  }

  let subtotal = 0;
  for (const item of cartItems) {
    subtotal += resolveLineItem(item).lineTotal;
  }

  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_RATE;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;
  const amountCents = Math.round(total * 100);

  return { subtotal, shipping, tax, total, amountCents };
}

module.exports = { computeCartTotal, resolvePrice, resolveLineItem, resolveLineItems, CATALOG, CUSTOM_FORMS, HERB_UNIT_PRICE, MAX_HERBS };
