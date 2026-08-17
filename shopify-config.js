// Shopify configuration + checkout helpers (client side).
// Shopify is the source of truth for products, pricing, cart, checkout,
// payments, promo codes, subscriptions, order confirmations and customer
// wallet methods (Shop Pay, Apple Pay, Google Pay, Cash App Pay, Venmo,
// standard cards).

(function () {
  'use strict';

  window.SHOPIFY_VARIANTS = window.SHOPIFY_VARIANTS || {};
  window.SHOPIFY_PRODUCT_HANDLES = window.SHOPIFY_PRODUCT_HANDLES || {};

  var state = {
    domain: null,
    configured: false,
  };

  function cleanDomain(d) {
    if (!d) return '';
    var s = String(d).trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
    return s;
  }

  async function resolveDomain() {
    if (state.domain) return state.domain;
    var meta = document.querySelector('meta[name="shopify-domain"]');
    var metaVal = meta && meta.content ? cleanDomain(meta.content) : '';
    if (metaVal) { state.domain = metaVal; state.configured = true; return metaVal; }
    try {
      var res = await fetch('/api/shopify-config', { credentials: 'same-origin' });
      if (res.ok) {
        var data = await res.json();
        var d = cleanDomain(data && data.domain);
        if (d) { state.domain = d; state.configured = true; return d; }
      }
    } catch (_) { /* offline */ }
    state.configured = false;
    return '';
  }

  window.ShopifyCheckout = {
    resolveDomain: resolveDomain,
    isConfigured: function () { return state.configured; },
    domain: function () { return state.domain; },
  };

  resolveDomain();
})();