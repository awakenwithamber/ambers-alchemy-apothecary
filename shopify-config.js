// Shopify configuration + checkout helpers (client side).
// Shopify is the source of truth for products, pricing, cart, checkout,
// payments, promo codes, subscriptions, order confirmations and customer
// wallet methods (Shop Pay, Apple Pay, Google Pay, Cash App Pay, Venmo,
// standard cards). This file builds the Shopify cart-permalink URLs the
// site redirects to at checkout.
//
// Configuration precedence (highest first):
//   1. <meta name="shopify-domain" content="your-store.myshopify.com">
//   2. window.SHOPIFY_DOMAIN (can be assigned early by inline script)
//   3. /.netlify/functions/shopify-config  (reads SHOPIFY_DOMAIN env var)
//
// Variant mapping lives in window.SHOPIFY_VARIANTS (see below) and can be
// populated over time as products are created in Shopify. Any unmapped
// product falls back to a "pending manual processing" path that still
// captures the order + notifies admin — the site never crashes or loses
// an order just because a variant ID is missing.

(function () {
  'use strict';

  // Public variant map. Populate with real Shopify variant IDs as products
  // are created in the Shopify admin. Keys are the internal product `id`
  // from data.js — for size variants, use `${productId}|${sizeLabel}`.
  // Values are the numeric variant ID (string form is fine) from Shopify,
  // e.g. "43215678901234".
  //
  //   window.SHOPIFY_VARIANTS["calming-elixir|3oz — $29.99"] = "43215678901234";
  //
  // Special keys used by the site:
  //   __custom_soap_builder   — custom-soap-builder variant
  //   __custom_remedy_builder — custom-remedy-builder variant
  //   __grimior_subscription  — $3.33/month Grimior / Real Magic subscription
  window.SHOPIFY_VARIANTS = window.SHOPIFY_VARIANTS || {};

  // Product handle map (used when variant IDs are unknown but handles are).
  // Keys match data.js product IDs. Values are Shopify product handles.
  //   window.SHOPIFY_PRODUCT_HANDLES["calming-elixir"] = "calming-elixir";
  window.SHOPIFY_PRODUCT_HANDLES = window.SHOPIFY_PRODUCT_HANDLES || {};

  var state = {
    domain: null,
    configured: false,
    resolvePromise: null,
  };

  function cleanDomain(d) {
    if (!d) return '';
    var s = String(d).trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
    return s;
  }

  function readDomainSync() {
    var meta = document.querySelector('meta[name="shopify-domain"]');
    var metaVal = meta && meta.content ? cleanDomain(meta.content) : '';
    if (metaVal) return metaVal;
    if (window.SHOPIFY_DOMAIN) return cleanDomain(window.SHOPIFY_DOMAIN);
    return '';
  }

  async function resolveDomain() {
    if (state.domain) return state.domain;
    var sync = readDomainSync();
    if (sync) { state.domain = sync; state.configured = true; return sync; }
    try {
      var res = await fetch('/api/shopify-config', { credentials: 'same-origin' });
      if (res.ok) {
        var data = await res.json();
        var d = cleanDomain(data && data.domain);
        if (d) { state.domain = d; state.configured = true; return d; }
      }
    } catch (_) { /* offline / not configured yet */ }
    state.configured = false;
    return '';
  }

  // Return the Shopify variant ID for a cart line item, or null if unmapped.
  function variantIdFor(item) {
    if (!item) return null;
    // Explicit override on the line item itself wins.
    if (item.shopifyVariantId) return String(item.shopifyVariantId);
    var id = item.productId || item.id || item.slug || '';
    if (!id) return null;
    var map = window.SHOPIFY_VARIANTS || {};
    var sized = item.size ? (id + '|' + item.size) : null;
    if (sized && map[sized]) return String(map[sized]);
    if (map[id]) return String(map[id]);
    return null;
  }

  // Returns { mapped: [...lines], unmapped: [...lines] }.
  // `lines` in `mapped` are {variantId, qty, properties}.
  function partitionCart(cart) {
    var mapped = [], unmapped = [];
    (cart || []).forEach(function (item) {
      var variantId = variantIdFor(item);
      if (variantId) {
        mapped.push({
          variantId: variantId,
          qty: Math.max(1, parseInt(item.qty, 10) || 1),
          properties: lineItemProperties(item),
          name: item.name || '',
        });
      } else {
        unmapped.push(item);
      }
    });
    return { mapped: mapped, unmapped: unmapped };
  }

  function lineItemProperties(item) {
    var props = {};
    if (item.form) props['Form'] = item.form;
    if (item.size) props['Size'] = item.size;
    if (item.symptoms) props['Symptoms'] = item.symptoms;
    if (item.herbs) props['Herbs'] = item.herbs;
    if (item.customization) props['Customization'] = item.customization;
    if (item.scent) props['Scent Profile'] = item.scent;
    if (item.intention) props['Intention'] = item.intention;
    return props;
  }

  // Build a Shopify cart permalink:
  //   https://{domain}/cart/{variantId}:{qty},{variantId}:{qty}
  //     ?discount=CODE
  //     &checkout[email]=you@example.com
  //     &attributes[Key]=Value
  //     &note=Order+notes
  //
  // Per-line-item properties are passed via `attributes[Line 1 — Form]=Tincture`
  // etc. so Shopify records them on the order even though cart permalinks
  // do not natively support per-line properties.
  function buildCheckoutUrl(options) {
    var domain = state.domain;
    if (!domain) return null;
    var opts = options || {};
    var lines = opts.lines || [];
    if (!lines.length) return null;
    var cartPath = lines.map(function (l) {
      return encodeURIComponent(l.variantId) + ':' + Math.max(1, parseInt(l.qty, 10) || 1);
    }).join(',');
    var qs = [];
    if (opts.discount) qs.push('discount=' + encodeURIComponent(opts.discount));
    if (opts.email) qs.push('checkout%5Bemail%5D=' + encodeURIComponent(opts.email));
    if (opts.note) qs.push('note=' + encodeURIComponent(String(opts.note).slice(0, 5000)));
    (lines || []).forEach(function (l, idx) {
      var props = l.properties || {};
      Object.keys(props).forEach(function (k) {
        var label = 'Line ' + (idx + 1) + ' — ' + k;
        qs.push('attributes%5B' + encodeURIComponent(label) + '%5D=' +
          encodeURIComponent(String(props[k]).slice(0, 400)));
      });
    });
    if (opts.attributes) {
      Object.keys(opts.attributes).forEach(function (k) {
        qs.push('attributes%5B' + encodeURIComponent(k) + '%5D=' +
          encodeURIComponent(String(opts.attributes[k]).slice(0, 400)));
      });
    }
    var url = 'https://' + domain + '/cart/' + cartPath;
    if (qs.length) url += '?' + qs.join('&');
    return url;
  }

  // Build a subscription permalink — a single recurring variant in the cart.
  // This works with Shopify Subscriptions (Shopify's first-party app) and
  // with every Shopify-compatible subscription provider (Recharge, Appstle,
  // Awtomic, Seal Subscriptions, etc.): Shopify checkout sets the selling
  // plan via the variant configuration, not via the URL.
  function buildSubscriptionUrl(options) {
    var opts = options || {};
    var variantId =
      opts.variantId ||
      (window.SHOPIFY_VARIANTS && window.SHOPIFY_VARIANTS.__grimior_subscription);
    if (!variantId || !state.domain) return null;
    return buildCheckoutUrl({
      lines: [{ variantId: variantId, qty: 1, properties: opts.properties || {} }],
      email: opts.email,
      discount: opts.discount,
      note: opts.note,
      attributes: Object.assign(
        { 'Product': 'grimior-real-magic' },
        opts.attributes || {}
      ),
    });
  }

  // Convenience: fire a redirect to Shopify checkout for a given cart array.
  // Returns a promise that resolves to { ok, url, unmapped, reason }.
  async function redirectToCheckout(cart, options) {
    var opts = options || {};
    await resolveDomain();
    if (!state.domain) return { ok: false, reason: 'not-configured' };
    var partition = partitionCart(cart);
    if (!partition.mapped.length) {
      return { ok: false, reason: 'no-mapped-variants', unmapped: partition.unmapped };
    }
    var url = buildCheckoutUrl({
      lines: partition.mapped,
      email: opts.email,
      discount: opts.discount,
      note: opts.note,
      attributes: opts.attributes,
    });
    if (!url) return { ok: false, reason: 'url-build-failed' };
    return { ok: true, url: url, unmapped: partition.unmapped };
  }

  window.ShopifyCheckout = {
    resolveDomain: resolveDomain,
    buildCheckoutUrl: buildCheckoutUrl,
    buildSubscriptionUrl: buildSubscriptionUrl,
    variantIdFor: variantIdFor,
    partitionCart: partitionCart,
    redirectToCheckout: redirectToCheckout,
    isConfigured: function () { return state.configured; },
    domain: function () { return state.domain; },
  };

  // Resolve the domain eagerly so the rest of the site can build URLs
  // without waiting. Failure here is fine — redirectToCheckout re-resolves.
  resolveDomain();
})();
