// ============================================================
// CUSTOM SOAP BUILDER — Amber's Alchemy Apothecary
// ============================================================

(function() {
  'use strict';

  var sbStep = 1;
  var sbSelections = { bases: [], scents: [], benefits: [], addons: [] };
  var SB_BASE_PRICE = 13.99;

  var SB_DATA = {
    bases: [
      { id: 'clear-top', name: 'Botanical Clear Top Bar', desc: 'A full bar made with vegetable glycerin + castor oil. Clear, radiant, and botanical — lets your flowers and herbs shine through.', price: 0, emoji: '✨' },
      { id: 'creamy-nourishing', name: 'Creamy Nourishing Bar', desc: 'A full bar made with shea butter + goat milk. Rich, velvety, and deeply moisturizing for thirsty skin.', price: 0, emoji: '🧈' },
      { id: 'layered', name: 'Layered Bar (Clear Top + Creamy Base)', desc: 'Best of both — a clear glycerin + castor oil top over a creamy shea butter + goat milk base. Show-stopping and nourishing.', price: 0, emoji: '🌗' }
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
    benefits: [
      { id: 'relaxation', name: 'Relaxation', desc: 'Soothes stress & tension', price: 0, emoji: '🧘' },
      { id: 'skin-healing', name: 'Skin Healing', desc: 'Repairs & restores', price: 0, emoji: '💚' },
      { id: 'exfoliation', name: 'Exfoliation', desc: 'Reveals fresh skin', price: 0, emoji: '✨' },
      { id: 'moisturizing', name: 'Deep Moisture', desc: 'Hydrates intensely', price: 0, emoji: '💧' },
      { id: 'energizing', name: 'Energizing', desc: 'Uplifts & revitalizes', price: 0, emoji: '⚡' },
      { id: 'anti-aging', name: 'Anti-Aging', desc: 'Firms & brightens', price: 0.50, emoji: '🌟' },
      { id: 'detox', name: 'Detox & Cleanse', desc: 'Purifies skin deeply', price: 0, emoji: '🫧' },
      { id: 'hormonal', name: 'Hormonal Balance', desc: 'Supports body balance', price: 0, emoji: '🌸' }
    ],
    addons: [
      { id: 'rose-petals', name: 'Rose Petals', desc: 'Pink, romantic, skin-softening', price: 0.75, emoji: '🌹' },
      { id: 'lavender-buds', name: 'Lavender Buds', desc: 'Calming, classic aromatherapy', price: 0.75, emoji: '💜' },
      { id: 'chamomile', name: 'Chamomile Flowers', desc: 'Soft yellow, soothing', price: 0.75, emoji: '🌼' },
      { id: 'hibiscus', name: 'Hibiscus Petals', desc: 'Deep pink/red, vibrant color', price: 0.75, emoji: '🌺' },
      { id: 'calendula', name: 'Calendula Petals', desc: 'Golden/orange, healing', price: 0.75, emoji: '🌻' },
      { id: 'mint-leaves', name: 'Dried Mint Leaves', desc: 'Fresh green, invigorating', price: 0.50, emoji: '🌿' },
      { id: 'rosemary', name: 'Rosemary', desc: 'Herbal texture, stimulating', price: 0.50, emoji: '🌱' },
      { id: 'nettle-leaf', name: 'Nettle Leaf Powder', desc: 'Earthy green, mineral-rich', price: 0.50, emoji: '🍃' },
      { id: 'spirulina', name: 'Spirulina Powder', desc: 'Vibrant green color', price: 0.75, emoji: '💚' },
      { id: 'cinnamon', name: 'Cinnamon Powder', desc: 'Warm tone, stimulating', price: 0.50, emoji: '🍂' },
      { id: 'clove', name: 'Clove Powder', desc: 'Deep spice look, warming', price: 0.50, emoji: '🔥' },
      { id: 'butterfly-pea', name: 'Butterfly Pea Flower', desc: 'Blue/purple tones, luxurious', price: 1.00, emoji: '🦋' },
      { id: 'orange-peel', name: 'Orange Peel (dried)', desc: 'Citrus texture, vitamin C', price: 0.50, emoji: '🍊' }
    ]
  };

  var SB_SUGGESTIONS = {
    'relaxation': { scents: ['lavender-fairy-dream', 'sunlit-garden'], addons: ['lavender-buds', 'chamomile', 'butterfly-pea'] },
    'skin-healing': { scents: ['gaias-rose', 'sunlit-garden'], addons: ['rose-petals', 'calendula', 'chamomile'] },
    'exfoliation': { scents: ['citrus-goddess', 'eucalyptus-mint-spa'], addons: ['orange-peel', 'mint-leaves', 'spirulina'] },
    'moisturizing': { scents: ['gaias-rose', 'sunlit-garden'], addons: ['rose-petals', 'hibiscus', 'chamomile'] },
    'energizing': { scents: ['citrus-goddess', 'orange-lily', 'fresh-mountain'], addons: ['orange-peel', 'mint-leaves', 'calendula'] },
    'anti-aging': { scents: ['gaias-rose', 'citrus-goddess'], addons: ['rose-petals', 'hibiscus', 'calendula'] },
    'detox': { scents: ['eucalyptus-mint-spa', 'sacred-forest'], addons: ['nettle-leaf', 'spirulina', 'mint-leaves'] },
    'hormonal': { scents: ['lavender-fairy-dream', 'gaias-rose', 'sunlit-garden'], addons: ['rose-petals', 'lavender-buds', 'chamomile'] }
  };

  function renderOptions(containerId, items, selectionKey) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = items.map(function(item) {
      var selected = sbSelections[selectionKey].indexOf(item.id) !== -1;
      return '<button class="sb-option-btn' + (selected ? ' selected' : '') + '" data-id="' + item.id + '" data-key="' + selectionKey + '">' +
        '<span class="sb-opt-emoji">' + item.emoji + '</span>' +
        '<span class="sb-opt-name">' + item.name + '</span>' +
        '<span class="sb-opt-desc">' + item.desc + '</span>' +
        (item.price > 0 ? '<span class="sb-opt-price">+$' + item.price.toFixed(2) + '</span>' : '<span class="sb-opt-price">Included</span>') +
      '</button>';
    }).join('');

    container.querySelectorAll('.sb-option-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = this.dataset.id;
        var key = this.dataset.key;
        var idx = sbSelections[key].indexOf(id);
        if (idx === -1) {
          sbSelections[key].push(id);
          this.classList.add('selected');
        } else {
          sbSelections[key].splice(idx, 1);
          this.classList.remove('selected');
        }
        updateLiveSummary();
      });
    });
  }

  function calcPrice() {
    var total = SB_BASE_PRICE;
    ['bases', 'scents', 'benefits', 'addons'].forEach(function(key) {
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
      { key: 'bases', label: 'Bar Type' },
      { key: 'scents', label: 'Scent' },
      { key: 'benefits', label: 'Benefits' },
      { key: 'addons', label: 'Add-Ons' }
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
      var n = parseInt(s.dataset.step);
      s.classList.toggle('active', n === sbStep);
      s.classList.toggle('completed', n < sbStep);
    });
  }

  function showStep(n) {
    sbStep = n;
    document.querySelectorAll('.sb-step').forEach(function(s) { s.classList.remove('active'); });
    var stepEl = document.getElementById('sbStep' + n);
    if (stepEl) stepEl.classList.add('active');
    updateProgressBar();

    var prevBtn = document.getElementById('sbPrevBtn');
    var nextBtn = document.getElementById('sbNextBtn');
    if (prevBtn) prevBtn.style.display = n > 1 ? '' : 'none';
    if (nextBtn) nextBtn.style.display = n < 5 ? '' : 'none';

    if (n === 1) renderOptions('sbBaseOptions', SB_DATA.bases, 'bases');
    if (n === 2) renderOptions('sbScentOptions', SB_DATA.scents, 'scents');
    if (n === 3) renderOptions('sbBenefitOptions', SB_DATA.benefits, 'benefits');
    if (n === 4) renderOptions('sbAddonOptions', SB_DATA.addons, 'addons');
    if (n === 5) renderReview();
  }

  function renderReview() {
    var panel = document.getElementById('sbReviewPanel');
    var suggBox = document.getElementById('sbSuggestionBox');
    if (!panel) return;

    var html = '<div class="sb-review-grid">';
    var cats = [
      { key: 'bases', label: 'Bar Type', icon: '🧴' },
      { key: 'scents', label: 'Scent Profile', icon: '🌸' },
      { key: 'benefits', label: 'Benefits', icon: '✨' },
      { key: 'addons', label: 'Add-Ons', icon: '🌿' }
    ];
    cats.forEach(function(cat) {
      html += '<div class="sb-review-group"><h4>' + cat.icon + ' ' + cat.label + '</h4>';
      if (sbSelections[cat.key].length === 0) {
        html += '<p class="sb-review-none">None selected</p>';
      } else {
        html += '<ul>';
        sbSelections[cat.key].forEach(function(id) {
          var item = getItemByKey(cat.key, id);
          if (item) html += '<li>' + item.emoji + ' ' + item.name + (item.price > 0 ? ' (+$' + item.price.toFixed(2) + ')' : '') + '</li>';
        });
        html += '</ul>';
      }
      html += '</div>';
    });
    html += '</div>';
    html += '<div class="sb-review-total"><strong>Total: $' + calcPrice().toFixed(2) + '</strong></div>';
    panel.innerHTML = html;

    // Smart suggestions
    if (suggBox) {
      var suggestions = getSuggestions();
      if (suggestions.length > 0) {
        suggBox.innerHTML = '<h4>Recommended for Your Goals</h4><p>' + suggestions.join(' ') + '</p>';
        suggBox.style.display = '';
      } else {
        suggBox.style.display = 'none';
      }
    }
  }

  function getSuggestions() {
    var tips = [];
    sbSelections.benefits.forEach(function(benefitId) {
      var sugg = SB_SUGGESTIONS[benefitId];
      if (!sugg) return;
      sugg.scents.forEach(function(scentId) {
        if (sbSelections.scents.indexOf(scentId) === -1) {
          var item = getItemByKey('scents', scentId);
          if (item && tips.length < 3) {
            tips.push('Try adding ' + item.emoji + ' ' + item.name + ' for better ' + benefitId + ' results.');
          }
        }
      });
    });
    return tips;
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
    if (sbStep < 5) showStep(sbStep + 1);
  };

  window.sbPrevStep = function() {
    if (sbStep > 1) showStep(sbStep - 1);
  };

  window.sbStartNew = function() {
    sbSelections = { bases: [], scents: [], benefits: [], addons: [] };
    showStep(1);
    updateLiveSummary();
  };

  window.sbAddToCart = function() {
    var name = 'Custom Soap';
    var parts = [];
    if (sbSelections.scents.length > 0) {
      var scentNames = sbSelections.scents.map(function(id) { var i = getItemByKey('scents', id); return i ? i.name : id; });
      name = scentNames.join(' & ') + ' Custom Soap';
    }
    if (sbSelections.bases.length > 0) {
      parts.push('Base: ' + sbSelections.bases.map(function(id) { var i = getItemByKey('bases', id); return i ? i.name : id; }).join(', '));
    }
    if (sbSelections.benefits.length > 0) {
      parts.push('Benefits: ' + sbSelections.benefits.map(function(id) { var i = getItemByKey('benefits', id); return i ? i.name : id; }).join(', '));
    }
    if (sbSelections.addons.length > 0) {
      parts.push('Add-Ons: ' + sbSelections.addons.map(function(id) { var i = getItemByKey('addons', id); return i ? i.name : id; }).join(', '));
    }

    var price = calcPrice();

    if (typeof addToCart === 'function') {
      var existing = cart ? cart.find(function(i) { return i.name === name; }) : null;
      if (existing) {
        existing.qty += 1;
        if (typeof renderCart === 'function') renderCart();
      } else {
        var item = { name: name, price: price, qty: 1 };
        if (parts.length > 0) item.herbs = parts.join(' | ');
        if (typeof cart !== 'undefined') cart.push(item);
        if (typeof renderCart === 'function') renderCart();
      }
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
