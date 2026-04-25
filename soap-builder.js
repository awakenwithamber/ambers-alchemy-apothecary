// ============================================================
// CUSTOM SOAP BUILDER — Amber's Alchemy Apothecary
// Single global state object: window.soapConfig
// ============================================================

(function() {
  'use strict';

  // GLOBAL STATE — persists across all 5 steps until "Start New" is clicked
  window.soapConfig = {
    barType: null,        // 'Botanical Clear Top Bar' | 'Creamy Nourishing Bar' | 'Layered Bar'
    scents: [],           // single value array
    benefits: [],         // up to 3
    botanicals: [],       // multi-select
    color: null           // single
  };
  var soapConfig = window.soapConfig;

  var sbStep = 1;
  var SB_BASE_PRICE = 13.99;
  var BENEFITS_MAX = 3;

  var BAR_TYPES = [
    { value: 'Botanical Clear Top Bar', emoji: '✨', desc: 'Vegetable glycerin + castor oil — clear and radiant.' },
    { value: 'Creamy Nourishing Bar', emoji: '🧈', desc: 'Shea butter + goat milk — rich, velvety, hydrating.' },
    { value: 'Layered Bar', emoji: '🌗', desc: 'Clear top + creamy base — the best of both worlds.' }
  ];

  var SCENTS = [
    { value: 'Floral', emoji: '🌹', desc: 'Rose · Lavender · Jasmine' },
    { value: 'Fresh & Green', emoji: '🌿', desc: 'Eucalyptus · Mint · Tea Tree' },
    { value: 'Warm & Spicy', emoji: '🍂', desc: 'Cinnamon · Clove · Frankincense' },
    { value: 'Citrus', emoji: '🍊', desc: 'Orange · Bergamot · Lemon' },
    { value: 'Earthy', emoji: '🌲', desc: 'Patchouli · Cedarwood · Vetiver' },
    { value: 'Surprise Me', emoji: '✦', desc: "Amber's choice based on your benefits" }
  ];

  var BENEFITS = [
    { value: 'Moisturizing', emoji: '💧' },
    { value: 'Clarifying', emoji: '✨' },
    { value: 'Energizing', emoji: '⚡' },
    { value: 'Calming', emoji: '🧘' },
    { value: 'Balancing', emoji: '🌗' },
    { value: 'Brightening', emoji: '🌟' },
    { value: 'Soothing', emoji: '💚' },
    { value: 'Detoxifying', emoji: '🫧' }
  ];

  var BOTANICALS = [
    { value: 'Rose Petals', emoji: '🌹' },
    { value: 'Lavender Buds', emoji: '💜' },
    { value: 'Calendula', emoji: '🌻' },
    { value: 'Chamomile', emoji: '🌼' },
    { value: 'Oat & Honey', emoji: '🍯' },
    { value: 'Activated Charcoal', emoji: '🖤' },
    { value: 'Dried Citrus Peel', emoji: '🍊' },
    { value: 'Mint Leaves', emoji: '🌿' },
    { value: 'Cinnamon & Clove', emoji: '🍂' }
  ];

  var COLORS = [
    { value: 'Pink/Beet Root', emoji: '💗' },
    { value: 'Yellow/Turmeric', emoji: '💛' },
    { value: 'Green/Spirulina', emoji: '💚' },
    { value: 'Purple/Berry', emoji: '💜' },
    { value: 'Brown/Cocoa', emoji: '🤎' },
    { value: 'Black/Charcoal', emoji: '🖤' },
    { value: 'Cream/Natural', emoji: '🤍' }
  ];

  // ---------- RENDERING ----------

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  // STEP 1 — Bar Type (single select, 3 cards)
  function renderStep1() {
    var grid = document.getElementById('sbBaseOptions');
    if (!grid) return;
    grid.innerHTML = BAR_TYPES.map(function(b) {
      var sel = soapConfig.barType === b.value ? ' selected' : '';
      return '<button type="button" class="sb-option-btn' + sel + '" data-value="' + b.value + '">' +
        '<span class="sb-opt-emoji">' + b.emoji + '</span>' +
        '<span class="sb-opt-name">' + b.value + '</span>' +
        '<span class="sb-opt-desc">' + b.desc + '</span>' +
      '</button>';
    }).join('');
    grid.querySelectorAll('.sb-option-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        soapConfig.barType = this.dataset.value;
        grid.querySelectorAll('.sb-option-btn').forEach(function(b) { b.classList.remove('selected'); });
        this.classList.add('selected');
        updateLiveSummary();
        updateNavButtons();
      });
    });
  }

  // STEP 2 — Scent Profile (single select)
  function renderStep2() {
    var grid = document.getElementById('sbScentOptions');
    if (!grid) return;
    grid.innerHTML = SCENTS.map(function(s) {
      var sel = soapConfig.scents.indexOf(s.value) !== -1 ? ' selected' : '';
      return '<button type="button" class="sb-option-btn' + sel + '" data-value="' + s.value + '">' +
        '<span class="sb-opt-emoji">' + s.emoji + '</span>' +
        '<span class="sb-opt-name">' + s.value + '</span>' +
        '<span class="sb-opt-desc">' + s.desc + '</span>' +
      '</button>';
    }).join('');
    grid.querySelectorAll('.sb-option-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        soapConfig.scents = [this.dataset.value];
        grid.querySelectorAll('.sb-option-btn').forEach(function(b) { b.classList.remove('selected'); });
        this.classList.add('selected');
        updateLiveSummary();
      });
    });
  }

  // STEP 3 — Benefits (checkbox grid, max 3)
  function renderStep3() {
    var grid = document.getElementById('sbBenefitOptions');
    if (!grid) return;
    grid.innerHTML = BENEFITS.map(function(b) {
      var sel = soapConfig.benefits.indexOf(b.value) !== -1 ? ' selected' : '';
      return '<button type="button" class="sb-option-btn sb-checkbox' + sel + '" data-value="' + b.value + '">' +
        '<span class="sb-opt-emoji">' + b.emoji + '</span>' +
        '<span class="sb-opt-name">' + b.value + '</span>' +
      '</button>';
    }).join('');
    var helper = document.createElement('p');
    helper.className = 'sb-helper';
    helper.style.cssText = 'opacity:0.8;font-size:0.9rem;text-align:center;margin-top:0.5rem;';
    helper.textContent = 'Pick up to ' + BENEFITS_MAX + ' benefits.';
    grid.appendChild(helper);
    grid.querySelectorAll('.sb-option-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var v = this.dataset.value;
        var idx = soapConfig.benefits.indexOf(v);
        if (idx === -1) {
          if (soapConfig.benefits.length >= BENEFITS_MAX) {
            if (typeof showToast === 'function') showToast('You can pick up to ' + BENEFITS_MAX + ' benefits.');
            return;
          }
          soapConfig.benefits.push(v);
          this.classList.add('selected');
        } else {
          soapConfig.benefits.splice(idx, 1);
          this.classList.remove('selected');
        }
        updateLiveSummary();
      });
    });
  }

  // STEP 4 — Add-Ons: botanical add-ins (multi) + natural color (single)
  function renderStep4() {
    var grid = document.getElementById('sbAddonOptions');
    if (!grid) return;
    var html = '';
    html += '<div class="sb-subsection">';
    html += '<h4 style="font-family:Cinzel,serif;color:var(--gold,#d4a843);margin:0 0 0.6rem;">Botanical Add-Ins (multi-select)</h4>';
    html += '<div class="sb-chips-grid" id="sbBotanicalChips" style="display:flex;flex-wrap:wrap;gap:0.5rem;">';
    html += BOTANICALS.map(function(b) {
      var sel = soapConfig.botanicals.indexOf(b.value) !== -1 ? ' selected' : '';
      return '<button type="button" class="sb-chip' + sel + '" data-value="' + b.value + '" data-group="botanical" style="padding:0.5rem 1rem;border-radius:999px;border:1px solid rgba(184,148,90,0.5);background:transparent;color:#F3EBDD;cursor:pointer;font-family:Lora,serif;">' + b.emoji + ' ' + b.value + '</button>';
    }).join('');
    html += '</div></div>';
    html += '<div class="sb-subsection" style="margin-top:1.25rem;">';
    html += '<h4 style="font-family:Cinzel,serif;color:var(--gold,#d4a843);margin:0 0 0.6rem;">Natural Color (single-select)</h4>';
    html += '<div class="sb-chips-grid" id="sbColorChips" style="display:flex;flex-wrap:wrap;gap:0.5rem;">';
    html += COLORS.map(function(c) {
      var sel = soapConfig.color === c.value ? ' selected' : '';
      return '<button type="button" class="sb-chip' + sel + '" data-value="' + c.value + '" data-group="color" style="padding:0.5rem 1rem;border-radius:999px;border:1px solid rgba(184,148,90,0.5);background:transparent;color:#F3EBDD;cursor:pointer;font-family:Lora,serif;">' + c.emoji + ' ' + c.value + '</button>';
    }).join('');
    html += '</div></div>';
    grid.innerHTML = html;

    grid.querySelectorAll('.sb-chip').forEach(function(chip) {
      chip.addEventListener('click', function() {
        var v = this.dataset.value;
        var g = this.dataset.group;
        if (g === 'botanical') {
          var idx = soapConfig.botanicals.indexOf(v);
          if (idx === -1) {
            soapConfig.botanicals.push(v);
            this.classList.add('selected');
            this.style.background = 'linear-gradient(135deg,#B8945A,#8C6B3A)';
            this.style.color = '#1f1326';
          } else {
            soapConfig.botanicals.splice(idx, 1);
            this.classList.remove('selected');
            this.style.background = 'transparent';
            this.style.color = '#F3EBDD';
          }
        } else if (g === 'color') {
          soapConfig.color = v;
          grid.querySelectorAll('[data-group="color"]').forEach(function(c) {
            c.classList.remove('selected');
            c.style.background = 'transparent';
            c.style.color = '#F3EBDD';
          });
          this.classList.add('selected');
          this.style.background = 'linear-gradient(135deg,#B8945A,#8C6B3A)';
          this.style.color = '#1f1326';
        }
        updateLiveSummary();
      });
    });
    // restore highlight styles for already-selected chips
    grid.querySelectorAll('.sb-chip.selected').forEach(function(c) {
      c.style.background = 'linear-gradient(135deg,#B8945A,#8C6B3A)';
      c.style.color = '#1f1326';
    });
  }

  // STEP 5 — Review: dynamic summary from soapConfig
  function renderStep5() {
    var panel = document.getElementById('sbReviewPanel');
    if (!panel) return;

    var rows = [
      { label: 'Bar Type', value: soapConfig.barType || '—' },
      { label: 'Scent', value: soapConfig.scents.length ? soapConfig.scents.join(', ') : '—' },
      { label: 'Benefits', value: soapConfig.benefits.length ? soapConfig.benefits.join(', ') : '—' },
      { label: 'Botanicals', value: soapConfig.botanicals.length ? soapConfig.botanicals.join(', ') : 'None' },
      { label: 'Color', value: soapConfig.color || 'Cream/Natural' }
    ];
    panel.innerHTML = '<div class="sb-review-grid" style="display:grid;gap:0.5rem;font-family:Lora,serif;">' +
      rows.map(function(r) {
        return '<div class="sb-review-row" style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px dashed rgba(184,148,90,0.3);">' +
          '<strong style="color:var(--brass-lt,#B8945A);">' + r.label + '</strong>' +
          '<span>' + r.value + '</span>' +
          '</div>';
      }).join('') +
      '</div>' +
      '<div class="sb-review-total" style="margin-top:1rem;text-align:right;font-family:Cinzel,serif;font-size:1.1rem;color:var(--gold,#d4a843);">' +
        '<strong>Total: $' + calcPrice().toFixed(2) + '</strong>' +
      '</div>';

    var sugg = document.getElementById('sbSuggestionBox');
    if (sugg) sugg.style.display = 'none';
  }

  function calcPrice() { return SB_BASE_PRICE; }

  // ---------- LIVE SUMMARY (sidebar) ----------
  function updateLiveSummary() {
    var el = document.getElementById('sbLiveSummary');
    var priceEl = document.getElementById('sbLivePrice');
    if (!el) return;
    var hasAny = soapConfig.barType || soapConfig.scents.length || soapConfig.benefits.length || soapConfig.botanicals.length || soapConfig.color;
    if (!hasAny) {
      el.innerHTML = '<p class="sb-empty">No selections yet</p>';
    } else {
      var html = '';
      if (soapConfig.barType) html += '<div class="sb-summary-cat"><strong>Bar Type:</strong> ' + soapConfig.barType + '</div>';
      if (soapConfig.scents.length) html += '<div class="sb-summary-cat"><strong>Scent:</strong> ' + soapConfig.scents.join(', ') + '</div>';
      if (soapConfig.benefits.length) html += '<div class="sb-summary-cat"><strong>Benefits:</strong> ' + soapConfig.benefits.join(', ') + '</div>';
      if (soapConfig.botanicals.length) html += '<div class="sb-summary-cat"><strong>Botanicals:</strong> ' + soapConfig.botanicals.join(', ') + '</div>';
      if (soapConfig.color) html += '<div class="sb-summary-cat"><strong>Color:</strong> ' + soapConfig.color + '</div>';
      el.innerHTML = html;
    }
    if (priceEl) priceEl.textContent = '$' + calcPrice().toFixed(2);
  }

  // ---------- STEP NAV ----------
  function updateProgressBar() {
    document.querySelectorAll('.sb-progress-step').forEach(function(s) {
      var n = parseInt(s.dataset.step);
      s.classList.toggle('active', n === sbStep);
      s.classList.toggle('completed', n < sbStep);
    });
  }

  function updateNavButtons() {
    var prevBtn = document.getElementById('sbPrevBtn');
    var nextBtn = document.getElementById('sbNextBtn');
    var addBtn = document.getElementById('sbAddCartBtn');
    if (prevBtn) prevBtn.style.display = sbStep > 1 ? '' : 'none';
    if (nextBtn) {
      if (sbStep < 5) {
        nextBtn.style.display = '';
        // Disable Next on Step 1 until barType is chosen
        if (sbStep === 1 && !soapConfig.barType) {
          nextBtn.disabled = true; nextBtn.style.opacity = '0.5'; nextBtn.style.cursor = 'not-allowed';
        } else {
          nextBtn.disabled = false; nextBtn.style.opacity = ''; nextBtn.style.cursor = '';
        }
      } else {
        nextBtn.style.display = 'none';
      }
    }
    if (addBtn) addBtn.style.display = sbStep === 5 ? '' : 'none';
  }

  function showStep(n) {
    sbStep = n;
    document.querySelectorAll('.sb-step').forEach(function(s) { s.classList.remove('active'); });
    var stepEl = document.getElementById('sbStep' + n);
    if (stepEl) stepEl.classList.add('active');
    updateProgressBar();
    if (n === 1) renderStep1();
    if (n === 2) renderStep2();
    if (n === 3) renderStep3();
    if (n === 4) renderStep4();
    if (n === 5) renderStep5();
    updateNavButtons();
    updateLiveSummary();
  }

  // ---------- PUBLIC API ----------
  window.openSoapBuilder = function() {
    var modal = document.getElementById('soapBuilderModal');
    if (!modal) return;
    modal.style.display = 'flex';
    setTimeout(function() { modal.classList.add('visible'); }, 10);
    showStep(1);
  };

  window.closeSoapBuilder = function() {
    var modal = document.getElementById('soapBuilderModal');
    if (!modal) return;
    modal.classList.remove('visible');
    setTimeout(function() { modal.style.display = 'none'; }, 300);
  };

  window.sbNextStep = function() {
    if (sbStep === 1 && !soapConfig.barType) {
      if (typeof showToast === 'function') showToast('Please pick a bar type first.');
      return;
    }
    if (sbStep < 5) showStep(sbStep + 1);
  };

  window.sbPrevStep = function() {
    if (sbStep > 1) showStep(sbStep - 1);
  };

  window.sbStartNew = function() {
    soapConfig.barType = null;
    soapConfig.scents = [];
    soapConfig.benefits = [];
    soapConfig.botanicals = [];
    soapConfig.color = null;
    document.querySelectorAll('.sb-option-btn.selected, .sb-chip.selected').forEach(function(b) {
      b.classList.remove('selected');
      if (b.classList.contains('sb-chip')) {
        b.style.background = 'transparent';
        b.style.color = '#F3EBDD';
      }
    });
    showStep(1);
  };

  window.sbAddToCart = function() {
    if (!soapConfig.barType) {
      if (typeof showToast === 'function') showToast('Please complete Step 1: choose a bar type.');
      showStep(1);
      return;
    }
    var nameParts = [];
    if (soapConfig.scents.length) nameParts.push(soapConfig.scents[0]);
    nameParts.push(soapConfig.barType);
    var name = 'Custom Soap — ' + nameParts.join(' · ');

    var details = [];
    if (soapConfig.benefits.length) details.push('Benefits: ' + soapConfig.benefits.join(', '));
    if (soapConfig.botanicals.length) details.push('Botanicals: ' + soapConfig.botanicals.join(', '));
    if (soapConfig.color) details.push('Color: ' + soapConfig.color);

    var item = {
      name: name,
      price: SB_BASE_PRICE,
      qty: 1,
      type: 'custom-soap',
      herbs: details.join(' | '),
      config: {
        barType: soapConfig.barType,
        scents: soapConfig.scents.slice(),
        benefits: soapConfig.benefits.slice(),
        botanicals: soapConfig.botanicals.slice(),
        color: soapConfig.color
      }
    };

    if (typeof window.addItemToCart === 'function') {
      window.addItemToCart(item);
    } else if (typeof addToCart === 'function') {
      addToCart(name, SB_BASE_PRICE, 1);
    }
    if (typeof showToast === 'function') showToast('Added to cart! ✦');
    closeSoapBuilder();
  };

  // Close on backdrop click
  document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'soapBuilderModal') {
      closeSoapBuilder();
    }
  });
})();
