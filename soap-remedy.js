// ============================================================
// BUILD YOUR OWN SOAP REMEDY — Variant picker + customization modal
// ============================================================
// Separate product from the Custom Soap Builder so the builder's own flow
// stays untouched. Users pick a variant (shape + size + price) on the product
// card, then click "Customize & Add to Cart" to open a focused modal where
// they confirm base composition and optional scent/botanicals/color before
// the configured bar is added to the cart.

(function () {
  'use strict';

  var VARIANTS = {
    'Rectangular with Waves': { label: 'Rectangular with Waves', price: 12.99, size: '4 oz' },
    'Round with Flowers': { label: 'Round with Flowers', price: 12.99, size: '4 oz' },
    'Big Rose': { label: 'Big Rose', price: 8.99, size: '3 oz' },
    'Small Rose': { label: 'Small Rose', price: 5.99, size: '2 oz' }
  };

  var BASE_STYLES = [
    { id: 'layered', name: 'Layered Bar', desc: 'Top: castor oil + vegetable glycerin + botanical color. Bottom: shea butter + goat milk.', emoji: '🌗' },
    { id: 'full', name: 'Full Bar (No Layers)', desc: 'A single uniform bar in the recipe you choose below.', emoji: '🧼' }
  ];

  var FULL_CHOICES = [
    { id: 'castor-glycerin', name: 'Castor Oil + Vegetable Glycerin', desc: 'Clear, botanical-friendly bar.', emoji: '✨' },
    { id: 'shea-goatmilk', name: 'Shea Butter + Goat Milk', desc: 'Creamy, deeply moisturizing bar.', emoji: '🧈' }
  ];

  var SCENTS = [
    { id: 'lavender', name: 'Lavender', emoji: '💜' },
    { id: 'rose', name: 'Rose', emoji: '🌹' },
    { id: 'eucalyptus-mint', name: 'Eucalyptus Mint', emoji: '🌿' },
    { id: 'cinnamon', name: 'Warm Cinnamon', emoji: '🍂' },
    { id: 'orange', name: 'Sweet Orange', emoji: '🍊' },
    { id: 'cedarwood', name: 'Cedarwood', emoji: '🌲' },
    { id: 'unscented', name: 'Unscented', emoji: '🤍' }
  ];

  var BOTANICALS = [
    { id: 'rose-petals', name: 'Rose Petals', emoji: '🌹' },
    { id: 'lavender-buds', name: 'Lavender Buds', emoji: '💜' },
    { id: 'chamomile', name: 'Chamomile', emoji: '🌼' },
    { id: 'calendula', name: 'Calendula', emoji: '🌻' },
    { id: 'mint-leaves', name: 'Mint Leaves', emoji: '🌿' },
    { id: 'butterfly-pea', name: 'Butterfly Pea', emoji: '🦋' },
    { id: 'orange-peel', name: 'Orange Peel', emoji: '🍊' }
  ];

  var COLORS = [
    { id: 'natural', name: 'Natural / Cream', emoji: '🤍' },
    { id: 'rose-pink', name: 'Rose Pink', emoji: '🌸' },
    { id: 'violet', name: 'Violet', emoji: '💜' },
    { id: 'green', name: 'Botanical Green', emoji: '💚' },
    { id: 'gold', name: 'Golden Amber', emoji: '✨' },
    { id: 'blue', name: 'Butterfly Blue', emoji: '💙' }
  ];

  var state = {
    variant: 'Rectangular with Waves',
    baseStyle: 'layered',
    fullChoice: 'castor-glycerin',
    scents: [],
    botanicals: [],
    color: ''
  };

  function $(id) { return document.getElementById(id); }

  function getVariant() {
    return VARIANTS[state.variant] || VARIANTS['Rectangular with Waves'];
  }

  function calcPrice() {
    return getVariant().price;
  }

  function updateProductCardPrice() {
    var priceEl = $('soapRemedyPrice');
    var sizeEl = $('soapRemedySize');
    var v = getVariant();
    if (priceEl) priceEl.textContent = '$' + v.price.toFixed(2);
    if (sizeEl) sizeEl.textContent = v.size + ' bar';
  }

  function renderOptionGrid(containerId, items, selectedArr, multi, onToggle) {
    var c = $(containerId);
    if (!c) return;
    c.innerHTML = items.map(function (item) {
      var sel = selectedArr.indexOf(item.id) !== -1;
      return '<button type="button" class="sb-option-btn' + (sel ? ' selected' : '') +
        '" data-id="' + item.id + '">' +
        '<span class="sb-opt-emoji">' + (item.emoji || '') + '</span>' +
        '<span class="sb-opt-name">' + item.name + '</span>' +
        (item.desc ? '<span class="sb-opt-desc">' + item.desc + '</span>' : '') +
        '</button>';
    }).join('');
    c.querySelectorAll('.sb-option-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        onToggle(btn.getAttribute('data-id'), btn);
      });
    });
  }

  function renderBase() {
    renderOptionGrid('soapRemedyBaseOptions', BASE_STYLES, [state.baseStyle], false, function (id) {
      state.baseStyle = id;
      renderBase();
      refreshLayerDetail();
      updateSummary();
    });
  }

  function refreshLayerDetail() {
    var hint = $('soapRemedyLayerHint');
    var fullBox = $('soapRemedyFullChoice');
    if (state.baseStyle === 'layered') {
      if (hint) hint.textContent = 'For a Layered Bar: top uses castor oil + vegetable glycerin + your chosen botanical color; bottom uses shea butter + goat milk.';
      if (fullBox) fullBox.style.display = 'none';
    } else {
      if (hint) hint.textContent = 'Choose the base recipe for your Full Bar.';
      if (fullBox) fullBox.style.display = '';
      renderOptionGrid('soapRemedyFullChoice', FULL_CHOICES, [state.fullChoice], false, function (id) {
        state.fullChoice = id;
        refreshLayerDetail();
        updateSummary();
      });
    }
  }

  function renderScents() {
    renderOptionGrid('soapRemedyScentOptions', SCENTS, state.scents, true, function (id) {
      var idx = state.scents.indexOf(id);
      if (idx === -1) state.scents.push(id); else state.scents.splice(idx, 1);
      renderScents();
      updateSummary();
    });
  }

  function renderBotanicals() {
    renderOptionGrid('soapRemedyBotanicalOptions', BOTANICALS, state.botanicals, true, function (id) {
      var idx = state.botanicals.indexOf(id);
      if (idx === -1) state.botanicals.push(id); else state.botanicals.splice(idx, 1);
      renderBotanicals();
      updateSummary();
    });
  }

  function renderColors() {
    renderOptionGrid('soapRemedyColorOptions', COLORS, state.color ? [state.color] : [], false, function (id) {
      state.color = (state.color === id) ? '' : id;
      renderColors();
      updateSummary();
    });
  }

  function prettyList(ids, bank) {
    return ids.map(function (id) {
      var found = bank.find(function (b) { return b.id === id; });
      return found ? found.name : id;
    }).join(', ');
  }

  function updateSummary() {
    var v = getVariant();
    var lbl = $('soapRemedyVariantLabel');
    if (lbl) lbl.textContent = v.label + ' · ' + v.size + ' · $' + v.price.toFixed(2);

    var base = BASE_STYLES.find(function (b) { return b.id === state.baseStyle; });
    var full = FULL_CHOICES.find(function (f) { return f.id === state.fullChoice; });
    var sum = $('soapRemedySummary');
    if (sum) {
      var lines = [];
      lines.push('<div><strong>Variant:</strong> ' + v.label + ' (' + v.size + ')</div>');
      lines.push('<div><strong>Base:</strong> ' + (base ? base.name : state.baseStyle) +
        (state.baseStyle === 'full' && full ? ' — ' + full.name : '') + '</div>');
      if (state.scents.length) lines.push('<div><strong>Scent:</strong> ' + prettyList(state.scents, SCENTS) + '</div>');
      if (state.botanicals.length) lines.push('<div><strong>Botanicals:</strong> ' + prettyList(state.botanicals, BOTANICALS) + '</div>');
      if (state.color) lines.push('<div><strong>Color:</strong> ' + prettyList([state.color], COLORS) + '</div>');
      sum.innerHTML = lines.join('');
    }
    var tot = $('soapRemedyTotal');
    if (tot) tot.textContent = '$' + calcPrice().toFixed(2);
  }

  function openRemedy() {
    var modal = $('soapRemedyModal');
    if (!modal) return;
    modal.style.display = 'flex';
    setTimeout(function () { modal.classList.add('visible'); }, 10);
    renderBase();
    refreshLayerDetail();
    renderScents();
    renderBotanicals();
    renderColors();
    updateSummary();
  }

  function closeRemedy() {
    var modal = $('soapRemedyModal');
    if (!modal) return;
    modal.classList.remove('visible');
    setTimeout(function () { modal.style.display = 'none'; }, 300);
  }

  function addRemedyToCart() {
    var v = getVariant();
    var base = BASE_STYLES.find(function (b) { return b.id === state.baseStyle; });
    var full = FULL_CHOICES.find(function (f) { return f.id === state.fullChoice; });

    var parts = [];
    parts.push('Base: ' + (base ? base.name : state.baseStyle) +
      (state.baseStyle === 'full' && full ? ' (' + full.name + ')' : ''));
    if (state.scents.length) parts.push('Scent: ' + prettyList(state.scents, SCENTS));
    if (state.botanicals.length) parts.push('Botanicals: ' + prettyList(state.botanicals, BOTANICALS));
    if (state.color) parts.push('Color: ' + prettyList([state.color], COLORS));

    var name = 'Build Your Own Soap Remedy — ' + v.label + ' (' + v.size + ')';
    var price = calcPrice();

    if (typeof addToCart === 'function') {
      var existing = (typeof cart !== 'undefined') ? cart.find(function (i) { return i.name === name; }) : null;
      if (existing) {
        existing.qty += 1;
        if (typeof renderCart === 'function') renderCart();
      } else {
        var item = { name: name, price: price, qty: 1, herbs: parts.join(' | ') };
        if (typeof cart !== 'undefined') cart.push(item);
        if (typeof renderCart === 'function') renderCart();
      }
      if (typeof showToast === 'function') showToast('Added to cart: ' + name);
      if (typeof openCart === 'function') openCart();
    }
    closeRemedy();
  }

  function bindVariantInputs() {
    var radios = document.querySelectorAll('input[name="soapRemedyVariant"]');
    radios.forEach(function (r) {
      r.addEventListener('change', function () {
        var raw = r.value || '';
        var label = raw.split('|')[0];
        if (VARIANTS[label]) state.variant = label;
        updateProductCardPrice();
      });
    });
  }

  function init() {
    var btn = $('soapRemedyCustomizeBtn');
    if (btn) btn.addEventListener('click', openRemedy);
    var cancelBtn = $('soapRemedyCancelBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', closeRemedy);
    var closeBtn = $('soapRemedyCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeRemedy);
    var addBtn = $('soapRemedyAddBtn');
    if (addBtn) addBtn.addEventListener('click', addRemedyToCart);

    bindVariantInputs();
    updateProductCardPrice();

    document.addEventListener('click', function (e) {
      if (e.target && e.target.id === 'soapRemedyModal') closeRemedy();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose opener for bundle / other integrations.
  window.openSoapRemedy = openRemedy;
  window.closeSoapRemedy = closeRemedy;
})();
