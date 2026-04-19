/*!
 * Shopify Checkout Bridge
 * ------------------------
 * Wires existing cart / checkout buttons on the page to the Netlify Function
 * at /api/shopify-checkout, which returns a hosted Shopify checkout URL.
 *
 * How it picks up a button
 *   Any element matching one of these is treated as a "Pay by Card" trigger:
 *     - [data-shopify-checkout]
 *     - #shopifyCheckoutBtn, #payByCardBtn
 *     - .js-shopify-checkout
 *
 * How it finds cart items (first match wins)
 *   1. window.getShopifyCart()  → must return an array of items
 *   2. window.shopifyCart       → an array of items
 *   3. window.cart              → an array of items
 *   4. localStorage.cart        → JSON-encoded array of items
 *   5. Button attribute data-cart (JSON)  or  data-variant-id + data-quantity
 *
 * Item shape (any of these keys work for the variant id)
 *   { variantId | merchandiseId | shopify_variant_id | id, quantity, title }
 *
 * Optional buyer info
 *   Elements with these ids are read if present: cartEmail, cartNotes.
 *
 * Public API
 *   window.ShopifyCheckoutBridge.startCheckout(items?, options?)
 */
(function () {
  'use strict';

  var ENDPOINT = '/api/shopify-checkout';
  var RETURN_TO_PATH = '/thank-you';

  var SELECTORS = [
    '[data-shopify-checkout]',
    '#shopifyCheckoutBtn',
    '#payByCardBtn',
    '.js-shopify-checkout',
  ].join(',');

  function qs(id) {
    return document.getElementById(id);
  }

  function readValue(id) {
    var el = qs(id);
    return el && typeof el.value === 'string' ? el.value.trim() : '';
  }

  function normaliseItem(raw) {
    if (!raw || typeof raw !== 'object') return null;
    var variantId =
      raw.variantId ||
      raw.merchandiseId ||
      raw.shopify_variant_id ||
      raw.shopifyVariantId ||
      raw.id ||
      null;
    if (!variantId) return null;
    var qty = parseInt(raw.quantity != null ? raw.quantity : raw.qty, 10);
    if (!qty || qty < 1) qty = 1;
    return {
      variantId: String(variantId),
      quantity: qty,
      title: raw.title || raw.name || undefined,
    };
  }

  function readCartFromStorage() {
    try {
      var raw = window.localStorage && window.localStorage.getItem('cart');
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  function readCartFromButton(btn) {
    if (!btn) return null;
    var dataCart = btn.getAttribute('data-cart');
    if (dataCart) {
      try {
        var parsed = JSON.parse(dataCart);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    var variantId = btn.getAttribute('data-variant-id');
    if (variantId) {
      return [
        {
          variantId: variantId,
          quantity: parseInt(btn.getAttribute('data-quantity'), 10) || 1,
          title: btn.getAttribute('data-title') || undefined,
        },
      ];
    }
    return null;
  }

  function collectCart(btn) {
    var raw = null;

    if (typeof window.getShopifyCart === 'function') {
      try {
        raw = window.getShopifyCart();
      } catch (e) {
        raw = null;
      }
    }
    if (!Array.isArray(raw) && Array.isArray(window.shopifyCart)) raw = window.shopifyCart;
    if (!Array.isArray(raw) && Array.isArray(window.cart)) raw = window.cart;
    if (!Array.isArray(raw)) raw = readCartFromStorage();
    if (!Array.isArray(raw)) raw = readCartFromButton(btn);

    if (!Array.isArray(raw)) return [];
    return raw.map(normaliseItem).filter(Boolean);
  }

  function setLoading(btn, loading) {
    if (!btn) return;
    if (loading) {
      if (btn.dataset.originalLabel == null) {
        btn.dataset.originalLabel = btn.textContent || '';
      }
      btn.setAttribute('aria-busy', 'true');
      btn.disabled = true;
      btn.classList.add('is-loading');
      btn.textContent = 'Redirecting…';
    } else {
      btn.removeAttribute('aria-busy');
      btn.disabled = false;
      btn.classList.remove('is-loading');
      if (btn.dataset.originalLabel != null) {
        btn.textContent = btn.dataset.originalLabel;
        delete btn.dataset.originalLabel;
      }
    }
  }

  function showMessage(message) {
    if (!message) return;
    if (typeof window.showToast === 'function') {
      try {
        window.showToast(message);
        return;
      } catch (e) {}
    }
    try {
      window.alert(message);
    } catch (e) {}
  }

  async function startCheckout(items, options) {
    options = options || {};
    var button = options.button || null;

    var cart = Array.isArray(items) ? items.map(normaliseItem).filter(Boolean) : collectCart(button);

    if (!cart.length) {
      showMessage('Your cart is empty or no items are linked to Shopify yet.');
      return { ok: false, reason: 'empty-cart' };
    }

    var email = options.email || readValue('cartEmail') || readValue('customerEmail') || '';
    var note = options.note || readValue('cartNotes') || '';

    var returnTo =
      options.returnTo ||
      (typeof window !== 'undefined' && window.location
        ? window.location.origin + RETURN_TO_PATH
        : '');

    setLoading(button, true);

    try {
      var response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          email: email || undefined,
          note: note || undefined,
          returnTo: returnTo || undefined,
        }),
      });

      var data = {};
      try {
        data = await response.json();
      } catch (e) {}

      if (!response.ok || !data.checkoutUrl) {
        showMessage(data.error || 'Could not start card checkout. Please try Venmo or Cash App.');
        return { ok: false, reason: 'server-error', data: data };
      }

      window.location.href = data.checkoutUrl;
      return { ok: true, checkoutUrl: data.checkoutUrl };
    } catch (err) {
      showMessage('Card checkout is temporarily unavailable. Please try Venmo or Cash App.');
      return { ok: false, reason: 'network-error', error: err };
    } finally {
      setLoading(button, false);
    }
  }

  function bindButton(btn) {
    if (!btn || btn.dataset.shopifyCheckoutBound === '1') return;
    btn.dataset.shopifyCheckoutBound = '1';
    btn.addEventListener('click', function (event) {
      event.preventDefault();
      startCheckout(null, { button: btn });
    });
  }

  function bindAll(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var nodes = scope.querySelectorAll(SELECTORS);
    for (var i = 0; i < nodes.length; i++) bindButton(nodes[i]);
  }

  function init() {
    bindAll(document);
    if (typeof MutationObserver === 'function') {
      var observer = new MutationObserver(function (mutations) {
        for (var m = 0; m < mutations.length; m++) {
          var added = mutations[m].addedNodes;
          for (var n = 0; n < added.length; n++) {
            var node = added[n];
            if (node && node.nodeType === 1) {
              if (node.matches && node.matches(SELECTORS)) bindButton(node);
              if (node.querySelectorAll) bindAll(node);
            }
          }
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.ShopifyCheckoutBridge = {
    startCheckout: startCheckout,
    bind: bindButton,
    bindAll: bindAll,
    endpoint: ENDPOINT,
  };
})();
