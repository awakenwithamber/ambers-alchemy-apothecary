/**
 * shopify-checkout-bridge.js
 * Amber's Alchemy Apothecary
 *
 * Adds 💳 Pay by Card to the existing checkout alongside Cash App & Venmo.
 * Targets your site's exact DOM — no other changes to your site.
 */

(function () {
  'use strict';

  /* ── 1. Product name → Shopify handle map ──────────────────────────────── */
  var HANDLES = {
    'The Gentle Detox Ritual':           'the-gentle-detox-ritual',
    'The Stress Relief Ritual':          'the-stress-relief-ritual',
    'The Focus & Clarity Ritual':        'the-focus-clarity-ritual',
    'The Focus and Clarity Ritual':      'the-focus-clarity-ritual',
    'The Happy & Calm Ritual':           'the-happy-calm-ritual',
    'The Happy and Calm Ritual':         'the-happy-calm-ritual',
    'The Energized & Focused Ritual':    'the-energized-focused-ritual',
    'The Energized and Focused Ritual':  'the-energized-focused-ritual',
    'Lavender Fairy Dream':              'lavender-fairy-dream-soap',
    "Gaia's Rose":                       'gaias-rose-soap',
    'Eucalyptus Mint Spa Renewal':       'eucalyptus-mint-spa-renewal-soap',
    'Warm Cinnamon Comfort':             'warm-cinnamon-comfort-soap',
    'Orange Lily Goddess':               'orange-lily-goddess-soap',
    'Citrus Goddess Glow':               'citrus-goddess-glow-soap',
    'Sacred Forest Ritual':              'sacred-forest-ritual-soap',
    'Fresh Mountain Air':                'fresh-mountain-air-soap',
    'Sunlit Garden Bloom':               'sunlit-garden-bloom-soap',
    'Full Collection':                   'soap-full-collection-9-bars',
    'All 9 Bars':                        'soap-full-collection-9-bars',
    'Handmade Tea Bags':                 'custom-herbal-tea-bags',
    'Loose Leaf Custom Blend':           'custom-loose-leaf-blend',
    'Loose Leaf':                        'custom-loose-leaf-blend',
    'Herbal Tincture':                   'custom-herbal-tincture',
    'Herbal Balm':                       'custom-herbal-balm',
    'Herbal Salve':                      'custom-herbal-salve',
    'Botanical Serum':                   'custom-botanical-serum',
    'Herbal Poultice':                   'custom-herbal-poultice',
    'Herbal Capsules':                   'custom-herbal-capsules',
    'Custom Soap':                       'custom-soap-single',
    'DreamEase':                         'dreamease-capsules',
    'Chill Pill':                        'chill-pill',
    'Sacred Balance':                    'sacred-balance',
    'Hair Serum':                        'hair-serum',
    'Vital Connect':                     'vital-connect',
    'Age Reversal Balm':                 'age-reversal-balm',
    'Pain Relief Balm':                  'pain-relief-balm',
    'Lucid Dream Tea':                   'lucid-dream-tea',
  };

  function handleFor(name) {
    if (!name) return null;
    name = name.trim();
    if (HANDLES[name]) return HANDLES[name];
    var lower = name.toLowerCase();
    for (var key in HANDLES) {
      if (lower.indexOf(key.toLowerCase()) !== -1 ||
          key.toLowerCase().indexOf(lower) !== -1) {
        return HANDLES[key];
      }
    }
    return null;
  }

  /* ── 2. Read cart items from your site ─────────────────────────────────── */
  // Your site stores the cart in window.cart (or similar global).
  // This function tries multiple common patterns to find the items.
  function readCart() {
    var items = [];

    // Pattern A: window.cart.items array (most common)
    if (window.cart && Array.isArray(window.cart.items)) {
      items = window.cart.items;
    }
    // Pattern B: window.cartItems
    else if (window.cartItems && Array.isArray(window.cartItems)) {
      items = window.cartItems;
    }
    // Pattern C: localStorage
    else {
      var keys = ['ambers-cart', 'cart', 'cartData', 'amber_cart'];
      for (var i = 0; i < keys.length; i++) {
        try {
          var raw = localStorage.getItem(keys[i]);
          if (raw) {
            var parsed = JSON.parse(raw);
            var arr = parsed.items || parsed;
            if (Array.isArray(arr) && arr.length) { items = arr; break; }
          }
        } catch (e) {}
      }
    }

    // Pattern D: DOM scrape — read your cart item elements directly
    if (!items.length) {
      // Your site renders cart items inside the cart drawer/panel
      var cartRows = document.querySelectorAll(
        '.cart-item, [data-cart-item], .cart-line, .cart-product'
      );
      cartRows.forEach(function (row) {
        var nameEl  = row.querySelector('.cart-item-name, .item-name, .product-name, [data-name]');
        var qtyEl   = row.querySelector('input[type="number"], .qty, .quantity, [data-qty]');
        var priceEl = row.querySelector('.price, .item-price, .cart-price, [data-price]');
        var name    = nameEl ? nameEl.textContent.trim() : null;
        if (name) {
          items.push({
            name:     name,
            quantity: qtyEl ? (parseInt(qtyEl.value || qtyEl.textContent) || 1) : 1,
            price:    priceEl ? priceEl.textContent.trim() : '',
          });
        }
      });
    }

    return items.map(function (item) {
      var name = item.name || item.title || item.product_name || '';
      return {
        title:    name,
        handle:   handleFor(name),
        quantity: parseInt(item.quantity || item.qty || 1, 10),
        price:    item.price || item.line_price || '',
      };
    });
  }

  function readTotal() {
    // Try window.cart first
    if (window.cart) {
      if (window.cart.total)     return parseFloat(String(window.cart.total).replace(/[^0-9.]/g, ''));
      if (window.cart.subtotal)  return parseFloat(String(window.cart.subtotal).replace(/[^0-9.]/g, ''));
    }
    // Try DOM — your site has elements like ".cart-total", "#cart-total"
    var selectors = [
      '#cart-total', '.cart-total', '[data-cart-total]',
      '#total-amount', '.total-amount', '.cart-total-price',
      '.summary-total', '#order-total',
    ];
    for (var i = 0; i < selectors.length; i++) {
      var el = document.querySelector(selectors[i]);
      if (el) {
        var num = parseFloat(el.textContent.replace(/[^0-9.]/g, ''));
        if (!isNaN(num) && num > 0) return num;
      }
    }
    return null;
  }

  /* ── 3. Build the card payment button block ────────────────────────────── */
  function buildCardBlock() {
    var wrap = document.createElement('div');
    wrap.id = 'shopify-card-wrap';
    wrap.innerHTML = [
      '<div style="margin-top:18px;border-top:1px solid rgba(201,168,76,0.2);padding-top:18px;">',

        // Divider label
        '<p style="font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;',
             'color:#C9A84C;text-align:center;margin:0 0 14px;">',
          '─── OR PAY BY CARD ───',
        '</p>',

        // Card button
        '<button id="shopify-card-btn" style="',
             'display:block;width:100%;padding:16px;',
             'background:#C9A84C;color:#0D1B12;border:none;',
             'font-size:0.85rem;font-weight:700;letter-spacing:0.12em;',
             'text-transform:uppercase;cursor:pointer;',
             'transition:background 0.2s;border-radius:2px;">',
          '💳 &nbsp;Pay by Card — Secure Checkout',
        '</button>',

        // Status line
        '<p id="shopify-card-status" style="',
             'font-size:0.75rem;color:#B8B0A0;text-align:center;',
             'margin:10px 0 0;min-height:16px;line-height:1.4;"></p>',

        // Trust line
        '<p style="font-size:0.7rem;color:#666;text-align:center;margin:6px 0 0;">',
          '🔒 SSL Encrypted &nbsp;·&nbsp; Powered by Shopify',
        '</p>',

      '</div>',
    ].join('');
    return wrap;
  }

  /* ── 4. Call Netlify function → redirect to Shopify checkout ───────────── */
  function startCardCheckout() {
    var btn    = document.getElementById('shopify-card-btn');
    var status = document.getElementById('shopify-card-status');
    if (!btn) return;

    var items = readCart();
    if (!items.length) {
      status.textContent = 'Your cart is empty. Add items before checking out.';
      return;
    }

    btn.textContent = '⏳  Preparing secure checkout…';
    btn.disabled    = true;
    status.textContent = '';

    var total = readTotal();
    var emailEl = document.querySelector('input[type="email"]');

    fetch('/.netlify/functions/shopify-checkout', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items:  items,
        email:  emailEl ? emailEl.value : '',
        note:   'Order from awakenaigain.com' + (total ? ' | Cart total: $' + total.toFixed(2) : ''),
      }),
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.checkoutUrl) {
        status.textContent = '✦ Redirecting to secure checkout…';
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || 'Checkout unavailable');
      }
    })
    .catch(function (err) {
      console.error('[Shopify Bridge]', err);
      status.innerHTML =
        '⚠ Card checkout unavailable right now.<br>' +
        'Please use Cash App or Venmo above, or <a href="/contact" style="color:#C9A84C;">contact Amber</a>.';
      btn.textContent = '💳 &nbsp;Pay by Card — Secure Checkout';
      btn.disabled    = false;
    });
  }

  /* ── 5. Inject the button into your payment section ───────────────────── */
  // Your site's payment section contains the Venmo link.
  // We insert the card button right after the Venmo block.
  function inject() {
    if (document.getElementById('shopify-card-wrap')) return; // already injected

    // Find the Venmo link — it's always present in your checkout
    var venmoLink = document.querySelector('a[href*="venmo.com"]');
    if (!venmoLink) return; // payment section not visible yet

    // Walk up to find a sensible container (the payment method wrapper)
    var container = venmoLink.closest(
      '.payment-method, .payment-block, .payment-option, .venmo-block, div'
    );
    if (!container) container = venmoLink.parentElement;

    // Go one level higher to sit alongside Cash App + Venmo blocks
    var parent = container.parentElement || container;

    var block = buildCardBlock();
    parent.appendChild(block);

    document.getElementById('shopify-card-btn')
      .addEventListener('click', startCardCheckout);
  }

  /* ── 6. Watch for the cart/checkout panel to open ──────────────────────── */
  function watch() {
    // Try immediately (in case page loads directly to checkout)
    inject();

    // Watch for DOM changes — cart drawer opening, section rendering, etc.
    var observer = new MutationObserver(function () {
      if (document.querySelector('a[href*="venmo.com"]')) inject();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Also trigger on known checkout button clicks
    document.addEventListener('click', function (e) {
      var el = e.target;
      // "Proceed to Secure Checkout" or any checkout-related button
      if (
        el.matches && (
          el.matches('[data-checkout], [id*="checkout"], [class*="checkout"]') ||
          (el.textContent && el.textContent.indexOf('Checkout') !== -1)
        )
      ) {
        setTimeout(inject, 400);
      }
    }, true);
  }

  /* ── 7. Boot ────────────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watch);
  } else {
    watch();
  }

}());
