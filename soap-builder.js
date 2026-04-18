// ============================================================
// CUSTOM SOAP BUILDER — Amber's Alchemy Apothecary
// 6-step guided flow: Shape+Size → Base → Scent → Botanicals → Color → Review
// ============================================================

(function() {
  'use strict';

  var TOTAL_STEPS = 6;
  var sbStep = 1;
  var sbSelections = { shapes: [], bases: [], scents: [], botanicals: [], colors: [] };

  // Step 1 (shape) chooses the base price of the bar. No shape selected falls back to
  // the cheapest option so the live summary always shows a real number.
  var SB_DEFAULT_SHAPE_PRICE = 5.99;

  var SB_DATA = {
    shapes: [
      { id: 'rect-waves', name: 'Rectangular with Waves', desc: '4 oz · classic sculpted bar', price: 12.99, emoji: '〰️', singleSelect: true },
      { id: 'round-flowers', name: 'Round with Flowers', desc: '4 oz · floral relief', price: 12.99, emoji: '🌼', singleSelect: true },
      { id: 'big-rose', name: 'Big Rose', desc: '3 oz · statement bloom', price: 8.99, emoji: '🌹', singleSelect: true },
      { id: 'small-rose', name: 'Small Rose', desc: '2 oz · delicate bud', price: 5.99, emoji: '🌷', singleSelect: true },
      { id: 'white-rose', name: 'White Rose Soap', desc: 'Premium artisan rose · 3 oz', price: 8.99, emoji: '🤍', singleSelect: true }
    ],
    bases: [
      { id: 'clear-top', name: 'Full Bar — Castor + Glycerin', desc: 'Clear botanical bar — lets flowers and herbs shine through.', price: 0, emoji: '✨', singleSelect: true },
      { id: 'creamy-nourishing', name: 'Full Bar — Shea Butter + Goat Milk', desc: 'Rich, velvety, deeply moisturizing for thirsty skin.', price: 0, emoji: '🧈', singleSelect: true },
      { id: 'layered', name: 'Layered Bar — Clear Top + Creamy Base', desc: 'Clear glycerin + castor oil top over a shea butter + goat milk base.', price: 0, emoji: '🌗', singleSelect: true }
    ],
    scents: [
      { id: 'lavender-fairy-dream', name: 'Lavender Fairy Dream', desc: 'Soft floral \u2022 calming \u2022 dreamy', price: 0, emoji: '💜' },
      { id: 'gaias-rose', name: "Gaia's Rose", desc: 'Romantic \u2022 floral \u2022 heart-opening', price: 0, emoji: '🌹' },
      { id: 'eucalyptus-mint-spa', name: 'Eucalyptus Mint Spa Renewal', desc: 'Fresh \u2022 cooling \u2022 clean', price: 0, emoji: '🌿' },
      { id: 'warm-cinnamon', name: 'Warm Cinnamon Comfort', desc: 'Cozy \u2022 spicy \u2022 grounding', price: 0, emoji: '🍂' },
      { id: 'orange-lily', name: 'Orange Lily Goddess', desc: 'Bright \u2022 citrus \u2022 radiant', price: 0, emoji: '🌺' },
      { id: 'citrus-goddess', name: 'Citrus Goddess Glow', desc: 'Sweet citrus \u2022 uplifting \u2022 energizing', price: 0, emoji: '🍊' },
      { id: 'sacred-forest', name: 'Sacred Forest Ritual', desc: 'Earthy \u2022 resinous \u2022 grounding', price: 0, emoji: '🌲' },
      { id: 'fresh-mountain', name: 'Fresh Mountain Air', desc: 'Clean \u2022 herbal \u2022 awakening', price: 0, emoji: '🏔️' },
      { id: 'sunlit-garden', name: 'Sunlit Garden Bloom', desc: 'Floral \u2022 soft \u2022 feminine', price: 0, emoji: '🌸' }
    ],
    botanicals: [
      { id: 'rose-petals', name: 'Rose Petals', desc: 'Pink, romantic, skin-softening', price: 0.75, emoji: '🌹' },
      { id: 'lavender-buds', name: 'Lavender Buds', desc: 'Calming, classic aromatherapy', price: 0.75, emoji: '💜' },
      { id: 'chamomile', name: 'Chamomile Flowers', desc: 'Soft yellow, soothing', price: 0.75, emoji: '🌼' },
      { id: 'hibiscus', name: 'Hibiscus Petals', desc: 'Deep pink/red, vibrant', price: 0.75, emoji: '🌺' },
      { id: 'calendula', name: 'Calendula Petals', desc: 'Golden/orange, healing', price: 0.75, emoji: '🌻' },
      { id: 'mint-leaves', name: 'Dried Mint Leaves', desc: 'Fresh green, invigorating', price: 0.50, emoji: '🌿' },
      { id: 'rosemary', name: 'Rosemary', desc: 'Herbal texture, stimulating', price: 0.50, emoji: '🌱' },
      { id: 'nettle-leaf', name: 'Nettle Leaf Powder', desc: 'Earthy green, mineral-rich', price: 0.50, emoji: '🍃' },
      { id: 'butterfly-pea', name: 'Butterfly Pea Flower', desc: 'Blue/violet tones, luxurious', price: 1.00, emoji: '🦋' },
      { id: 'orange-peel', name: 'Orange Peel (dried)', desc: 'Citrus texture, vitamin C', price: 0.50, emoji: '🍊' }
    ],
    colors: [
      { id: 'natural', name: 'Natural (No Color)', desc: 'Pure and unadorned', price: 0, emoji: '🤍', singleSelect: true },
      { id: 'blush-rose', name: 'Blush Rose', desc: 'Madder root · soft romantic pink', price: 0.50, emoji: '🌸', singleSelect: true },
      { id: 'golden-calendula', name: 'Golden Calendula', desc: 'Warm sunlit yellow', price: 0.50, emoji: '🌻', singleSelect: true },
      { id: 'sage-green', name: 'Sage Green', desc: 'Spirulina · botanical green', price: 0.50, emoji: '🌿', singleSelect: true },
      { id: 'butterfly-blue', name: 'Butterfly Blue', desc: 'Butterfly pea · dreamy blue-violet', price: 0.75, emoji: '🦋', singleSelect: true },
      { id: 'amethyst-purple', name: 'Amethyst Purple', desc: 'Alkanet root · mystical violet', price: 0.75, emoji: '💜', singleSelect: true },
      { id: 'ember-copper', name: 'Ember Copper', desc: 'Annatto · warm glowing amber', price: 0.50, emoji: '🍂', singleSelect: true },
      { id: 'midnight-charcoal', name: 'Midnight Charcoal', desc: 'Purifying deep black', price: 0.50, emoji: '🖤', singleSelect: true }
    ]
  };

  var STEP_META = [
    { key: 'shapes', label: 'Shape + Size' },
    { key: 'bases', label: 'Base' },
    { key: 'scents', label: 'Scent' },
    { key: 'botanicals', label: 'Botanicals' },
    { key: 'colors', label: 'Color' },
    { key: null, label: 'Review' }
  ];

  function renderOptions(containerId, items, selectionKey) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = items.map(function(item) {
      var selected = sbSelections[selectionKey].indexOf(item.id) !== -1;
      var priceLabel = item.price > 0
        ? '+$' + item.price.toFixed(2)
        : (selectionKey === 'shapes' ? '$' + (item.price || 0).toFixed(2) : 'Included');
      if (selectionKey === 'shapes') priceLabel = '$' + item.price.toFixed(2);
      return '<button type="button" class="sb-option-btn' + (selected ? ' selected' : '') + '" data-id="' + item.id + '" data-key="' + selectionKey + '">' +
        '<span class="sb-opt-emoji">' + item.emoji + '</span>' +
        '<span class="sb-opt-name">' + item.name + '</span>' +
        '<span class="sb-opt-desc">' + item.desc + '</span>' +
        '<span class="sb-opt-price">' + priceLabel + '</span>' +
      '</button>';
    }).join('');

    container.querySelectorAll('.sb-option-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = this.dataset.id;
        var key = this.dataset.key;
        var item = items.find(function(d) { return d.id === id; });
        var isSingle = item && item.singleSelect === true;
        var idx = sbSelections[key].indexOf(id);
        if (isSingle) {
          sbSelections[key] = idx === -1 ? [id] : [];
        } else {
          if (idx === -1) sbSelections[key].push(id);
          else sbSelections[key].splice(idx, 1);
        }
        // Refresh the whole grid so radio-like buttons toggle neighbors cleanly.
        renderOptions(containerId, items, selectionKey);
        updateLiveSummary();
      });
    });
  }

  function calcPrice() {
    var shapeId = sbSelections.shapes[0];
    var shape = shapeId ? getItemByKey('shapes', shapeId) : null;
    var total = shape ? shape.price : SB_DEFAULT_SHAPE_PRICE;
    ['bases', 'scents', 'botanicals', 'colors'].forEach(function(key) {
      sbSelections[key].forEach(function(id) {
        var item = SB_DATA[key].find(function(d) { return d.id === id; });
        if (item) total += item.price;
      });
    });
    return total;
  }

  function getItemByKey(key, id) {
    return SB_DATA[key].find(function(d) { return d.id === id; });
  }

  function updateLiveSummary() {
    var el = document.getElementById('sbLiveSummary');
    var priceEl = document.getElementById('sbLivePrice');
    if (!el) return;
    var html = '';
    var cats = [
      { key: 'shapes', label: 'Shape' },
      { key: 'bases', label: 'Base' },
      { key: 'scents', label: 'Scent' },
      { key: 'botanicals', label: 'Botanicals' },
      { key: 'colors', label: 'Color' }
    ];
    var hasAny = false;
    cats.forEach(function(cat) {
      if (sbSelections[cat.key].length > 0) {
        hasAny = true;
        html += '<div class="sb-summary-cat"><strong>' + cat.label + ':</strong> ';
        html += sbSelections[cat.key].map(function(id) {
          var item = getItemByKey(cat.key, id);
          return item ? item.emoji + ' ' + item.name : id;
        }).join(', ');
        html += '</div>';
      }
    });
    el.innerHTML = hasAny ? html : '<p class="sb-empty">No selections yet</p>';
    if (priceEl) priceEl.textContent = '$' + calcPrice().toFixed(2);
  }

  function updateProgressBar() {
    document.querySelectorAll('.sb-progress-step').forEach(function(s) {
      var n = parseInt(s.dataset.step, 10);
      s.classList.toggle('active', n === sbStep);
      s.classList.toggle('completed', n < sbStep);
    });
  }

  function showStep(n) {
    var previousStep = sbStep;
    sbStep = n;
    document.querySelectorAll('.sb-step').forEach(function(s) { s.classList.remove('active'); });
    var stepEl = document.getElementById('sbStep' + n);
    if (stepEl) stepEl.classList.add('active');
    updateProgressBar();

    var prevBtn = document.getElementById('sbPrevBtn');
    var nextBtn = document.getElementById('sbNextBtn');
    var addBtn = document.getElementById('sbAddCartBtn');
    if (prevBtn) prevBtn.style.display = n > 1 ? '' : 'none';
    if (nextBtn) nextBtn.style.display = n < TOTAL_STEPS ? '' : 'none';
    if (addBtn) addBtn.style.display = n === TOTAL_STEPS ? '' : 'none';

    if (n === 1) renderOptions('sbShapeOptions', SB_DATA.shapes, 'shapes');
    if (n === 2) renderOptions('sbBaseOptions', SB_DATA.bases, 'bases');
    if (n === 3) renderOptions('sbScentOptions', SB_DATA.scents, 'scents');
    if (n === 4) renderOptions('sbBotanicalOptions', SB_DATA.botanicals, 'botanicals');
    if (n === 5) renderOptions('sbColorOptions', SB_DATA.colors, 'colors');
    if (n === TOTAL_STEPS) renderReview();

    if (previousStep !== n) scrollBuilderToTop();
  }

  function scrollBuilderToTop() {
    var modal = document.querySelector('.soap-builder-modal');
    var target = document.querySelector('.soap-builder-header') || modal;
    if (!modal || !target) return;
    var doScroll = function() {
      try {
        if (typeof modal.scrollTo === 'function') {
          modal.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          modal.scrollTop = 0;
        }
      } catch (e) {
        modal.scrollTop = 0;
      }
    };
    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(doScroll);
    } else {
      setTimeout(doScroll, 0);
    }
  }

  function renderReview() {
    var panel = document.getElementById('sbReviewPanel');
    if (!panel) return;

    var html = '<div class="sb-review-grid">';
    var cats = [
      { key: 'shapes', label: 'Shape + Size', icon: '🧼' },
      { key: 'bases', label: 'Base', icon: '🧴' },
      { key: 'scents', label: 'Scent Profile', icon: '🌸' },
      { key: 'botanicals', label: 'Botanicals', icon: '🌿' },
      { key: 'colors', label: 'Color', icon: '🎨' }
    ];
    cats.forEach(function(cat) {
      html += '<div class="sb-review-group"><h4>' + cat.icon + ' ' + cat.label + '</h4>';
      if (sbSelections[cat.key].length === 0) {
        html += '<p class="sb-review-none">None selected</p>';
      } else {
        html += '<ul>';
        sbSelections[cat.key].forEach(function(id) {
          var item = getItemByKey(cat.key, id);
          if (!item) return;
          var priceBit = '';
          if (cat.key === 'shapes') priceBit = ' ($' + item.price.toFixed(2) + ')';
          else if (item.price > 0) priceBit = ' (+$' + item.price.toFixed(2) + ')';
          html += '<li>' + item.emoji + ' ' + item.name + priceBit + '</li>';
        });
        html += '</ul>';
      }
      html += '</div>';
    });
    html += '</div>';
    html += '<div class="sb-review-total"><strong>Total: $' + calcPrice().toFixed(2) + '</strong></div>';
    panel.innerHTML = html;
  }

  window.openSoapBuilder = function() {
    var modal = document.getElementById('soapBuilderModal');
    if (modal) {
      modal.style.display = 'flex';
      setTimeout(function() { modal.classList.add('visible'); }, 10);
      showStep(1);
      updateLiveSummary();
    }
  };

  window.closeSoapBuilder = function() {
    var modal = document.getElementById('soapBuilderModal');
    if (modal) {
      modal.classList.remove('visible');
      setTimeout(function() { modal.style.display = 'none'; }, 300);
    }
  };

  window.sbNextStep = function() {
    if (sbStep < TOTAL_STEPS) showStep(sbStep + 1);
  };

  window.sbPrevStep = function() {
    if (sbStep > 1) showStep(sbStep - 1);
  };

  window.sbStartNew = function() {
    sbSelections = { shapes: [], bases: [], scents: [], botanicals: [], colors: [] };
    showStep(1);
    updateLiveSummary();
  };

  window.sbAddToCart = function() {
    var shapeId = sbSelections.shapes[0];
    var shape = shapeId ? getItemByKey('shapes', shapeId) : null;
    var namePrefix = shape ? shape.name : 'Build Your Own Soap Remedy';
    var name = namePrefix;
    if (sbSelections.scents.length > 0) {
      var scentNames = sbSelections.scents.map(function(id) { var i = getItemByKey('scents', id); return i ? i.name : id; });
      name = namePrefix + ' — ' + scentNames.join(' & ');
    }

    var parts = [];
    if (sbSelections.bases.length > 0) {
      parts.push('Base: ' + sbSelections.bases.map(function(id) { var i = getItemByKey('bases', id); return i ? i.name : id; }).join(', '));
    }
    if (sbSelections.botanicals.length > 0) {
      parts.push('Botanicals: ' + sbSelections.botanicals.map(function(id) { var i = getItemByKey('botanicals', id); return i ? i.name : id; }).join(', '));
    }
    if (sbSelections.colors.length > 0) {
      parts.push('Color: ' + sbSelections.colors.map(function(id) { var i = getItemByKey('colors', id); return i ? i.name : id; }).join(', '));
    }

    var price = calcPrice();

    if (typeof addToCart === 'function' || typeof cart !== 'undefined') {
      var existing = (typeof cart !== 'undefined' && cart) ? cart.find(function(i) { return i.name === name; }) : null;
      if (existing) {
        existing.qty += 1;
      } else {
        var item = { name: name, price: price, qty: 1 };
        if (parts.length > 0) item.herbs = parts.join(' | ');
        if (typeof cart !== 'undefined') cart.push(item);
      }
      if (typeof renderCart === 'function') renderCart();
      if (typeof showToast === 'function') showToast('Added to cart: ' + name);
      if (typeof openCart === 'function') openCart();
    }
    closeSoapBuilder();
  };

  // Close on backdrop click
  document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'soapBuilderModal') {
      closeSoapBuilder();
    }
  });

})();
