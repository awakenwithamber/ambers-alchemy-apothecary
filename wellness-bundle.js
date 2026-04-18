/* ============================================================
   PERSONAL WELLNESS BUNDLE — Optional upgrade path
   ------------------------------------------------------------
   Offers an OPTIONAL upgrade that expands a visitor's already
   selected custom remedy into a layered daily ritual built from
   the SAME matched herbal allies. Never replaces their chosen
   product — it's an enhancement/add-on.

   Exposed as window.WellnessBundle with a small, stable API so
   both the quiz results flow (herbal-advisor.js) and the custom
   remedy builder (custom-creations.js) can render and commit the
   same bundle consistently. Reuses the existing cart primitives
   (window.addItemToCart / addToCart / renderCart / showToast /
   openCart) — no cart structure changes required.
   ============================================================ */

(function() {
  'use strict';

  var COMPANION_PRICES = {
    teaBags: 12.99,
    balm: 14.99,
    capsules: 16.99,
    soap: 12.99
  };

  var COMPANION_LABELS = {
    teaBags: '10 Herbal Tea Bags',
    balm: '1 oz Rejuvenating Balm',
    capsules: '2 Weeks of Capsules',
    soap: 'Matching Botanical Soap'
  };

  var COMPANION_DESCRIPTIONS = {
    teaBags: 'Pre-portioned tea bags featuring your matched herbal allies.',
    balm: 'A rejuvenating balm infused with aligned botanicals.',
    capsules: 'Two-week capsule course made with your matched herbal allies.',
    soap: 'Botanical soap crafted to match your remedy profile.'
  };

  // 20% off the companion add-ons (custom remedy stays at normal price)
  var BUNDLE_DISCOUNT = 0.20;

  function computePricing(context) {
    var primaryPrice = Math.max(0, Number(context && context.primaryPrice) || 0);
    var companionSubtotal = COMPANION_PRICES.teaBags + COMPANION_PRICES.balm +
                            COMPANION_PRICES.capsules + COMPANION_PRICES.soap;
    var discountedCompanions = companionSubtotal * (1 - BUNDLE_DISCOUNT);
    var individualTotal = primaryPrice + companionSubtotal;
    var bundleTotal = primaryPrice + discountedCompanions;
    var savings = individualTotal - bundleTotal;
    return {
      primaryPrice: round2(primaryPrice),
      companionSubtotal: round2(companionSubtotal),
      discountedCompanions: round2(discountedCompanions),
      individualTotal: round2(individualTotal),
      bundleTotal: round2(bundleTotal),
      savings: round2(savings)
    };
  }

  function round2(n) { return Math.round((Number(n) || 0) * 100) / 100; }
  function fmt(n) { return '$' + (round2(n)).toFixed(2); }

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeContext(ctx) {
    ctx = ctx || {};
    var allies = Array.isArray(ctx.allies) ? ctx.allies.filter(Boolean) : [];
    var alliesText = allies.map(function(a) {
      if (!a) return '';
      if (typeof a === 'string') return a;
      return a.name || a.id || '';
    }).filter(Boolean).join(', ');
    return {
      patternName: String(ctx.patternName || 'Your Personal Blend'),
      primaryName: String(ctx.primaryName || 'Your Custom Remedy'),
      primaryForm: String(ctx.primaryForm || 'Custom Remedy'),
      primarySize: String(ctx.primarySize || ''),
      primaryPrice: Number(ctx.primaryPrice) || 0,
      allies: allies,
      alliesText: alliesText,
      source: String(ctx.source || 'quiz'),
      addOnMode: ctx.addOnMode === true,
      onKeepRemedy: typeof ctx.onKeepRemedy === 'function' ? ctx.onKeepRemedy : null
    };
  }

  function renderOffer(ctx, opts) {
    var c = normalizeContext(ctx);
    var o = opts || {};
    var pricing = computePricing(c);
    var compact = o.compact === true;
    var id = String(o.id || ('wbundle-' + Math.random().toString(36).slice(2, 8)));
    var primaryCtaLabel = o.keepLabel || 'Keep My Custom Remedy';
    var showPrimaryCta = o.showPrimaryCta !== false;

    var alliesLine = c.alliesText
      ? '<p class="wbundle-allies"><span class="wbundle-allies-label">Your herbal allies:</span> ' + esc(c.alliesText) + '</p>'
      : '';

    var primaryItemLine = c.addOnMode
      ? '<li><span class="wbundle-item-mark">\u2726</span><span><strong>' + esc(c.primaryForm) + '</strong> \u2014 already in your cart' + (c.primarySize ? ' (' + esc(c.primarySize) + ')' : '') + '</span></li>'
      : '<li><span class="wbundle-item-mark">\u2726</span><span><strong>' + esc(c.primaryForm) + '</strong> \u2014 your chosen custom remedy' + (c.primarySize ? ' (' + esc(c.primarySize) + ')' : '') + '</span></li>';

    var itemsHtml =
      primaryItemLine +
      '<li><span class="wbundle-item-mark">\u2726</span><span><strong>' + COMPANION_LABELS.teaBags + '</strong> \u2014 featuring your matched herbal allies</span></li>' +
      '<li><span class="wbundle-item-mark">\u2726</span><span><strong>Rejuvenating ' + COMPANION_LABELS.balm + '</strong> \u2014 infused with aligned botanicals</span></li>' +
      '<li><span class="wbundle-item-mark">\u2726</span><span><strong>' + COMPANION_LABELS.capsules + '</strong> \u2014 made with your matched herbal allies</span></li>' +
      '<li><span class="wbundle-item-mark">\u2726</span><span><strong>' + COMPANION_LABELS.soap + '</strong> \u2014 crafted to match your remedy profile</span></li>';

    var displayBundleTotal = c.addOnMode ? pricing.discountedCompanions : pricing.bundleTotal;
    var displayIndividualTotal = c.addOnMode ? pricing.companionSubtotal : pricing.individualTotal;
    var displaySavings = c.addOnMode
      ? round2(pricing.companionSubtotal - pricing.discountedCompanions)
      : pricing.savings;

    var savingsHtml = displaySavings > 0
      ? '<div class="wbundle-price-row">' +
          '<span class="wbundle-price-old">' + fmt(displayIndividualTotal) + '</span>' +
          '<span class="wbundle-price-new">' + fmt(displayBundleTotal) + '</span>' +
        '</div>' +
        '<div class="wbundle-savings-badge">You save ' + fmt(displaySavings) + '</div>'
      : '<div class="wbundle-price-row">' +
          '<span class="wbundle-price-new">' + fmt(displayBundleTotal) + '</span>' +
        '</div>';

    var primaryBreakdownLine = c.addOnMode
      ? '<li><span>' + esc(c.primaryForm) + ' (already in your cart)</span><span>' + fmt(pricing.primaryPrice) + '</span></li>'
      : '<li><span>' + esc(c.primaryForm) + ' (your custom remedy)</span><span>' + fmt(pricing.primaryPrice) + '</span></li>';

    var savingsDetail =
      '<div class="wbundle-savings-detail" id="' + esc(id) + '-detail" hidden>' +
        '<h5>Bundle savings breakdown</h5>' +
        '<ul class="wbundle-savings-list">' +
          (c.addOnMode ? '' : primaryBreakdownLine) +
          '<li><span>' + COMPANION_LABELS.teaBags + '</span><span>' + fmt(COMPANION_PRICES.teaBags) + '</span></li>' +
          '<li><span>' + COMPANION_LABELS.balm + '</span><span>' + fmt(COMPANION_PRICES.balm) + '</span></li>' +
          '<li><span>' + COMPANION_LABELS.capsules + '</span><span>' + fmt(COMPANION_PRICES.capsules) + '</span></li>' +
          '<li><span>' + COMPANION_LABELS.soap + '</span><span>' + fmt(COMPANION_PRICES.soap) + '</span></li>' +
          '<li class="wbundle-savings-subtotal"><span>If purchased separately</span><span>' + fmt(displayIndividualTotal) + '</span></li>' +
          '<li class="wbundle-savings-total"><span>' + (c.addOnMode ? 'Wellness Bundle Companions' : 'Personal Wellness Bundle') + '</span><span>' + fmt(displayBundleTotal) + '</span></li>' +
          (displaySavings > 0 ? '<li class="wbundle-savings-you-save"><span>You save</span><span>' + fmt(displaySavings) + '</span></li>' : '') +
        '</ul>' +
      '</div>';

    var keepBtn = showPrimaryCta
      ? '<button type="button" class="wbundle-btn wbundle-btn-ghost" data-wbundle-action="keep" data-wbundle-id="' + esc(id) + '">' + esc(primaryCtaLabel) + '</button>'
      : '';

    var upgradeLabel = c.addOnMode ? 'Add the Companion Forms' : 'Upgrade to Wellness Bundle';

    return '<section class="wbundle-offer' + (compact ? ' wbundle-compact' : '') + '" data-wbundle-root="' + esc(id) + '" data-wbundle-source="' + esc(c.source) + '">' +
      '<div class="wbundle-inner">' +
        '<div class="wbundle-eyebrow">\u2726 Optional Upgrade</div>' +
        '<h4 class="wbundle-title">Turn your remedy into a full wellness ritual.</h4>' +
        '<p class="wbundle-lede">Your custom blend can be created in additional forms using the same herbal allies selected for your body\u2019s needs. Upgrade to a Personal Wellness Bundle for layered support throughout the day.</p>' +
        '<p class="wbundle-sublede">Includes options such as tea bags, balm, capsules, and a matching botanical soap.</p>' +
        alliesLine +
        '<div class="wbundle-bundle-card">' +
          '<div class="wbundle-bundle-head">' +
            '<span class="wbundle-bundle-name">' + (c.addOnMode ? 'Wellness Bundle Companions' : 'Personal Wellness Bundle') + '</span>' +
            savingsHtml +
          '</div>' +
          '<p class="wbundle-bundle-sub">Same herbal allies. Layered daily ritual.</p>' +
          '<ul class="wbundle-items">' + itemsHtml + '</ul>' +
        '</div>' +
        savingsDetail +
        '<div class="wbundle-actions">' +
          '<button type="button" class="wbundle-btn wbundle-btn-primary" data-wbundle-action="upgrade" data-wbundle-id="' + esc(id) + '">' + esc(upgradeLabel) + '</button>' +
          keepBtn +
          '<button type="button" class="wbundle-btn wbundle-btn-link" data-wbundle-action="toggle-savings" data-wbundle-id="' + esc(id) + '" aria-expanded="false" aria-controls="' + esc(id) + '-detail">See Bundle Savings</button>' +
        '</div>' +
        '<p class="wbundle-fineprint">Optional. Your custom remedy remains yours either way.</p>' +
      '</div>' +
    '</section>';
  }

  function buildCartItem(ctx) {
    var c = normalizeContext(ctx);
    var pricing = computePricing(c);
    var alliesText = c.alliesText || 'your herbal allies';
    var patternName = c.patternName || 'Custom Wellness Blend';

    if (c.addOnMode) {
      // Companion forms only — the primary custom remedy is already in the cart.
      var addonIncludes = [
        '10 Tea Bags',
        '1 oz Balm',
        '2 Weeks Capsules',
        'Botanical Soap'
      ].join(' \u2022 ');
      return {
        id: 'wbundle-addon-' + Date.now(),
        name: 'Wellness Bundle Companions \u2014 ' + patternName,
        desc: 'Adds to your custom remedy: ' + addonIncludes + ' | Allies: ' + alliesText,
        herbs: alliesText,
        size: 'Bundle add-on (4 forms)',
        price: pricing.discountedCompanions,
        qty: 1,
        symptoms: patternName,
        recommendedHerbs: alliesText,
        form: 'Wellness Bundle Add-On'
      };
    }

    var includes = [
      c.primaryForm + (c.primarySize ? ' (' + c.primarySize + ')' : ''),
      '10 Tea Bags',
      '1 oz Balm',
      '2 Weeks Capsules',
      'Botanical Soap'
    ].join(' \u2022 ');

    return {
      id: 'wbundle-' + Date.now(),
      name: 'Personal Wellness Bundle \u2014 ' + patternName,
      desc: 'Includes: ' + includes + ' | Allies: ' + alliesText,
      herbs: alliesText,
      size: 'Bundle (5 forms)',
      price: pricing.bundleTotal,
      qty: 1,
      symptoms: patternName,
      recommendedHerbs: alliesText,
      form: 'Personal Wellness Bundle'
    };
  }

  function addBundleToCart(ctx) {
    var item = buildCartItem(ctx);
    if (typeof window.addItemToCart === 'function') {
      window.addItemToCart(item);
      return true;
    }
    if (typeof window.addToCart === 'function') {
      try { window.addToCart(item.name, item.price); return true; } catch (e) {}
    }
    if (typeof window.showToast === 'function') {
      window.showToast('Unable to add the bundle right now.');
    }
    return false;
  }

  function toggleSavings(root) {
    if (!root) return;
    var id = root.getAttribute('data-wbundle-root');
    if (!id) return;
    var detail = document.getElementById(id + '-detail');
    var btn = root.querySelector('[data-wbundle-action="toggle-savings"]');
    if (!detail) return;
    var open = !detail.hasAttribute('hidden');
    if (open) {
      detail.setAttribute('hidden', '');
      if (btn) { btn.setAttribute('aria-expanded', 'false'); btn.textContent = 'See Bundle Savings'; }
    } else {
      detail.removeAttribute('hidden');
      if (btn) { btn.setAttribute('aria-expanded', 'true'); btn.textContent = 'Hide Bundle Savings'; }
    }
  }

  // One-time delegated click handler for every offer rendered anywhere on page.
  if (!window.__wellnessBundleDelegation) {
    window.__wellnessBundleDelegation = true;
    document.addEventListener('click', function(e) {
      var target = e.target && e.target.closest ? e.target.closest('[data-wbundle-action]') : null;
      if (!target) return;
      var root = target.closest('[data-wbundle-root]');
      if (!root) return;

      var action = target.getAttribute('data-wbundle-action');
      var ctx = root.__wbundleCtx || null;

      if (action === 'toggle-savings') {
        toggleSavings(root);
        return;
      }

      if (action === 'upgrade') {
        if (!ctx) return;
        // The bundle replaces the need to add the primary alone. Mark the
        // parent offer as resolved so both CTAs disappear after a choice.
        if (addBundleToCart(ctx)) {
          markResolved(root, 'upgraded');
          try {
            if (window.AAA && typeof window.AAA.track === 'function') {
              window.AAA.track('wellness_bundle_upgraded', { source: ctx.source || 'unknown', pattern: ctx.patternName || '' });
            }
          } catch (err) {}
        }
        return;
      }

      if (action === 'keep') {
        if (ctx && typeof ctx.onKeepRemedy === 'function') {
          try { ctx.onKeepRemedy(); } catch (err) {}
        }
        markResolved(root, 'kept');
        try {
          if (window.AAA && typeof window.AAA.track === 'function') {
            window.AAA.track('wellness_bundle_declined', { source: ctx && ctx.source || 'unknown' });
          }
        } catch (err) {}
        return;
      }
    });
  }

  function markResolved(root, state) {
    if (!root) return;
    root.classList.add('wbundle-resolved');
    root.setAttribute('data-wbundle-state', state || 'resolved');
    var actions = root.querySelector('.wbundle-actions');
    if (actions) {
      if (state === 'upgraded') {
        actions.innerHTML = '<p class="wbundle-resolved-msg">\u2728 Your Personal Wellness Bundle has been added to your cart.</p>';
      } else {
        actions.innerHTML = '<p class="wbundle-resolved-msg">\u2728 You kept your custom remedy. You can add the bundle later from your cart.</p>';
      }
    }
  }

  // Mount an offer into a container and wire its context.
  function mount(container, ctx, opts) {
    if (!container) return null;
    var id = 'wbundle-' + Math.random().toString(36).slice(2, 8);
    var options = Object.assign({}, opts || {}, { id: id });
    container.insertAdjacentHTML('beforeend', renderOffer(ctx, options));
    var root = container.querySelector('[data-wbundle-root="' + id + '"]');
    if (root) root.__wbundleCtx = normalizeContext(ctx);
    return root;
  }

  window.WellnessBundle = {
    render: renderOffer,
    mount: mount,
    buildCartItem: buildCartItem,
    addToCart: addBundleToCart,
    computePricing: computePricing,
    COMPANION_PRICES: COMPANION_PRICES,
    COMPANION_LABELS: COMPANION_LABELS
  };
})();
