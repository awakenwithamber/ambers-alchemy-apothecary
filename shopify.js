/*
 * Shopify integration — opt-in.
 *
 * Checks /api/shopify-config on load. When the Netlify env vars
 * SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN are set, this script:
 *   1. Loads the Shopify Buy Button SDK.
 *   2. Exposes window.ShopifyCommerce with helpers to create carts/checkouts
 *      backed by Shopify Storefront API.
 *   3. Lights up any element with [data-shopify-checkout] as a visible button.
 *   4. Intercepts the existing "Proceed to Secure Checkout" button when a
 *      Shopify cart ID is present in localStorage, redirecting to the
 *      Shopify-hosted checkout (which natively supports Apple Pay, Google Pay,
 *      Shop Pay, cards, and region-appropriate wallets).
 *
 * When the env vars are not set, this script becomes a no-op — the existing
 * Stripe + Venmo + Cash App flow is not touched.
 *
 * Post-purchase return:
 *   SHOPIFY_CHECKOUT_RETURN_URL can be set to something like
 *   https://awakenagain.com/?shopify_return=1 to bring the customer back into
 *   the site on success. The `thank-you.js` handler then shows the next-step
 *   panel automatically.
 */
(function () {
  'use strict';

  var CONFIG = null;
  var SDK_LOADED = false;
  var client = null;

  function log() {
    try { if (window.__AWAKEN_DEBUG && window.console) console.log.apply(console, ['[shopify]'].concat([].slice.call(arguments))); } catch (e) {}
  }

  function loadSdk() {
    return new Promise(function (resolve, reject) {
      if (SDK_LOADED && window.ShopifyBuy) { resolve(window.ShopifyBuy); return; }
      var s = document.createElement('script');
      s.src = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
      s.async = true;
      s.onload = function () { SDK_LOADED = true; resolve(window.ShopifyBuy); };
      s.onerror = function () { reject(new Error('Failed to load Shopify Buy SDK')); };
      document.head.appendChild(s);
    });
  }

  async function init() {
    try {
      var res = await fetch('/api/shopify-config', { cache: 'no-store' });
      var data = await res.json();
      if (!data || !data.configured) {
        log('Not configured — Shopify integration idle.');
        window.ShopifyCommerce = { configured: false };
        return;
      }
      CONFIG = data;
      await loadSdk();
      client = window.ShopifyBuy.buildClient({
        domain: CONFIG.domain,
        storefrontAccessToken: CONFIG.storefrontToken,
      });
      expose();
      markBadges();
    } catch (e) {
      log('Init failed, remaining idle:', e && e.message);
      window.ShopifyCommerce = { configured: false, error: String(e && e.message) };
    }
  }

  function expose() {
    window.ShopifyCommerce = {
      configured: true,
      domain: CONFIG.domain,

      /** Look up a Shopify product by handle (slug). */
      async getProductByHandle(handle) {
        if (!client) return null;
        try { return await client.product.fetchByHandle(handle); } catch (e) { return null; }
      },

      /** Create a new Shopify checkout and return it. */
      async createCheckout() {
        if (!client) return null;
        try { return await client.checkout.create(); } catch (e) { return null; }
      },

      /**
       * Add local cart items (array of {title, price, qty, variantId?}) to a
       * Shopify checkout. Items without a variantId can't be sent to Shopify
       * — the caller should fall back to Stripe for those.
       */
      async addItemsToCheckout(checkoutId, items) {
        if (!client || !Array.isArray(items) || !items.length) return null;
        var lineItems = items
          .filter(function (i) { return i && i.variantId; })
          .map(function (i) { return { variantId: i.variantId, quantity: i.qty || 1 }; });
        if (!lineItems.length) return null;
        try { return await client.checkout.addLineItems(checkoutId, lineItems); } catch (e) { return null; }
      },

      /** Read the final web URL for a checkout, including return URL if set. */
      checkoutUrl(checkout) {
        if (!checkout || !checkout.webUrl) return null;
        var url = checkout.webUrl;
        if (CONFIG.checkoutReturnUrl) {
          var sep = url.indexOf('?') === -1 ? '?' : '&';
          url += sep + 'return_to=' + encodeURIComponent(CONFIG.checkoutReturnUrl);
        }
        return url;
      },
    };
  }

  // If Shopify is configured and the page has data-shopify-badge containers,
  // mark them with a "Powered by Shopify — secure checkout" small notice so
  // users see the trust signal where it matters (cart drawer, checkout page).
  function markBadges() {
    document.querySelectorAll('[data-shopify-badge]').forEach(function (el) {
      el.classList.add('shopify-on');
      el.textContent = '🛒 Shopify checkout ready · Apple Pay · Google Pay · Shop Pay';
    });
  }

  // Kick off init once the DOM is interactive.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
