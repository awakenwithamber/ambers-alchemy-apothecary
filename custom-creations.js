/* ============================================================
   CUSTOM CREATIONS — Create Your Custom Remedy
   Enhanced: accepts flow state from Herbal Advisor
   Shows symptoms, recommended herbs, form pre-selection
   Offers combined vs separate remedy option
   ============================================================ */

(function() {
  'use strict';

  // ---- State ----
  var ccType = null;
  var ccBasePrice = 0;
  var ccPrice = 0;
  var ccUnit = '';
  var ccSelected = [];
  var MAX_HERBS = 12;
  var ccCurrentPage = 1;
  var ccFlowActive = false; // true when coming from advisor flow

  function getPageSize() {
    return window.innerWidth <= 768 ? 5 : 15;
  }
  function getHerbPrice(herb) {
    return herb.price || 0.23;
  }

  // ---- Category image mapping ----
  var CATEGORY_IMAGES = {
    'Sleep':       'https://d2xsxph8kpxj0f.cloudfront.net/310519663508836609/VDHw29YgzjByjwgsGHGQ8W/herb-valerian_1bfa4a56.jpg',
    'Energy':      'https://d2xsxph8kpxj0f.cloudfront.net/310519663508836609/VDHw29YgzjByjwgsGHGQ8W/herb-ashwagandha_4c6d0285.jpg',
    'Immune':      'https://d2xsxph8kpxj0f.cloudfront.net/310519663508836609/VDHw29YgzjByjwgsGHGQ8W/herb-elderberry_1da3f271.jpg',
    'Beauty':      'https://d2xsxph8kpxj0f.cloudfront.net/310519663508836609/VDHw29YgzjByjwgsGHGQ8W/herb-rose-hip_c140d24a.jpg',
    'Pain':        'https://files.manuscdn.com/user_upload_by_module/session_file/310519663508836609/xvzxDLezRWzccmBZ.jpg',
    'Hormonal':    'https://d2xsxph8kpxj0f.cloudfront.net/310519663508836609/VDHw29YgzjByjwgsGHGQ8W/herb-maca_96a36f87.jpg',
    'Digestion':   'https://d2xsxph8kpxj0f.cloudfront.net/310519663508836609/VDHw29YgzjByjwgsGHGQ8W/herb-ginger_0caa06cd.jpg',
    'Spiritual':   'https://d2xsxph8kpxj0f.cloudfront.net/310519663508836609/VDHw29YgzjByjwgsGHGQ8W/herb-mugwort_92a64ac0.jpg',
    'Adaptogen':   'https://d2xsxph8kpxj0f.cloudfront.net/310519663508836609/VDHw29YgzjByjwgsGHGQ8W/herb-ashwagandha_4c6d0285.jpg',
  };

  function getHerbImage(herb) {
    if (herb.illustration && herb.illustration !== '') return herb.illustration;
    if (herb.image && herb.image !== '') return herb.image;
    // Fallback: try getBotanicalIllustration from botanical-illustrations.js
    if (herb.id && typeof getBotanicalIllustration === 'function') {
      var biImg = getBotanicalIllustration(herb.id);
      if (biImg && biImg !== '') return biImg;
    }
    var cat = (herb.category || herb.categories || [''])[0] || '';
    for (var key in CATEGORY_IMAGES) {
      if (cat.toLowerCase().indexOf(key.toLowerCase()) !== -1) return CATEGORY_IMAGES[key];
    }
    return 'https://d2xsxph8kpxj0f.cloudfront.net/310519663508836609/VDHw29YgzjByjwgsGHGQ8W/herb-chamomile_24f1bf7f.jpg';
  }

  // ---- Wait for BOTANICALS ----
  function waitForBotanicals(cb, attempts) {
    attempts = attempts || 0;
    if (typeof BOTANICALS !== 'undefined' && BOTANICALS.length > 0) {
      cb();
    } else if (attempts < 60) {
      setTimeout(function() { waitForBotanicals(cb, attempts + 1); }, 100);
    }
  }

  // ---- Show / hide steps ----
  function showStep(n) {
    [1, 2, 3].forEach(function(i) {
      var el = document.getElementById('ccStep' + i);
      if (el) el.style.display = (i === n) ? 'block' : 'none';
    });
    // Show/hide the flow context panel
    var flowPanel = document.getElementById('ccFlowContext');
    if (flowPanel) flowPanel.style.display = ccFlowActive ? 'block' : 'none';

    var section = document.getElementById('custom-formula');
    if (section) {
      setTimeout(function() {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  }

  // ---- Render Flow Context Panel ----
  function renderFlowContext() {
    var panel = document.getElementById('ccFlowContext');
    if (!panel) return;

    var flowState = window.RemedyFlow ? window.RemedyFlow.getState() : {};
    var symptoms = flowState.symptoms || [];
    var recForm = flowState.recommendedForm;
    var selectedHerbs = flowState.selectedHerbs || [];
    var recommendedHerbs = flowState.recommendedHerbs || [];

    if (symptoms.length === 0 && selectedHerbs.length === 0) {
      panel.style.display = 'none';
      ccFlowActive = false;
      return;
    }

    ccFlowActive = true;
    var goalLabels = {};
    if (typeof ADVISOR_DATA !== 'undefined') {
      ADVISOR_DATA.goals.forEach(function(g) { goalLabels[g.id] = { label: g.label, icon: g.icon }; });
    }

    var formExplanations = window.RemedyFlow ? window.RemedyFlow.FORM_EXPLANATIONS : {};
    var formLabel = recForm ? (formExplanations[recForm] || recForm) : '';

    var herbObjs = selectedHerbs.map(function(id) { return typeof BOTANICALS !== 'undefined' ? BOTANICALS.find(function(b) { return b.id === id; }) : null; }).filter(Boolean);
    var recHerbObjs = recommendedHerbs.map(function(id) { return typeof BOTANICALS !== 'undefined' ? BOTANICALS.find(function(b) { return b.id === id; }) : null; }).filter(Boolean);

    var html = '<div class="rf-flow-context-inner">' +
      '<h4 class="rf-flow-title">\u{1F33F} Your Remedy Blueprint</h4>';

    if (symptoms.length > 0) {
      html += '<div class="rf-flow-section"><strong>Selected Symptoms</strong><div class="rf-flow-pills">' +
        symptoms.map(function(s) {
          var g = goalLabels[s];
          return '<span class="rf-symptom-pill">' + (g ? g.icon + ' ' + g.label : s) + '</span>';
        }).join('') + '</div></div>';
    }

    if (herbObjs.length > 0) {
      html += '<div class="rf-flow-section"><strong>Your Herbal Allies</strong><div class="rf-flow-pills">' +
        herbObjs.map(function(h) {
          return '<span class="rf-herb-pill selected">' + (h.emoji || '\u{1F33F}') + ' ' + h.name + '</span>';
        }).join('') + '</div></div>';
    }

    if (formLabel) {
      html += '<div class="rf-flow-section"><strong>Recommended Form</strong><div class="rf-flow-form">' + formLabel + '</div></div>';
    }

    // Combined vs separate remedy choice (only if multiple symptoms)
    if (symptoms.length > 1) {
      var flowS = window.RemedyFlow ? window.RemedyFlow.getState() : {};
      var mode = flowS.remedyMode || 'combined';
      html += '<div class="rf-flow-section rf-remedy-mode">' +
        '<strong>Would you like to create:</strong>' +
        '<div class="rf-mode-btns">' +
          '<button class="rf-mode-btn ' + (mode === 'combined' ? 'active' : '') + '" onclick="window._setRemedyMode(\'combined\')">One Combined Remedy</button>' +
          '<button class="rf-mode-btn ' + (mode === 'separate' ? 'active' : '') + '" onclick="window._setRemedyMode(\'separate\')">Separate Remedies for Each Symptom</button>' +
        '</div>' +
      '</div>';
    }

    html += '</div>';

    // Always add action buttons so the user is never stuck
    html += '<div class="rf-action-buttons">' +
      '<button class="rf-action-btn primary" onclick="proceedToBuildRemedy()">Build This Remedy</button>' +
      '<button class="rf-action-btn" onclick="continueExploringHerbs()">Continue Exploring Herbs</button>' +
      '<button class="rf-action-btn" onclick="quickAddRemedyToCart()">Add Remedy to Cart</button>' +
      '<button class="rf-action-btn" onclick="startNewRemedy()">Start a New Remedy</button>' +
      '<button class="rf-action-btn" onclick="retakeQuiz()">Retake Quiz</button>' +
    '</div>';

    panel.innerHTML = html;
    panel.style.display = 'block';
  }

  window._setRemedyMode = function(mode) {
    if (window.RemedyFlow) {
      window.RemedyFlow.updateState({ remedyMode: mode });
    }
    renderFlowContext();
  };

  // ---- Step 1: Type buttons ----
  function bindTypeButtons() {
    document.querySelectorAll('.cc-type-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        ccType = btn.dataset.type;
        ccBasePrice = parseFloat(btn.dataset.price);
        ccPrice = ccBasePrice;
        ccUnit = btn.dataset.unit;
        ccSelected = [];
        ccCurrentPage = 1;
        document.querySelectorAll('.cc-type-btn').forEach(function(b) { b.classList.remove('selected'); });
        btn.classList.add('selected');

        // Update flow state with chosen form
        if (window.RemedyFlow && ccFlowActive) {
          window.RemedyFlow.updateState({ recommendedForm: ccType });
        }

        showStep(2);
        waitForBotanicals(function() {
          renderHerbGrid();
          renderFlowContext();
        });
      });
    });
  }

  // ---- Step 2: Herb grid ----
  function renderHerbGrid() {
    var grid = document.getElementById('ccHerbGrid');
    if (!grid) return;
    if (typeof BOTANICALS === 'undefined' || BOTANICALS.length === 0) {
      grid.innerHTML = '<p class="cc-empty">Loading botanicals...</p>';
      return;
    }

    var searchVal = (document.getElementById('ccHerbSearch') || {}).value || '';
    var catVal = (document.getElementById('ccCategoryFilter') || {}).value || '';

    // Map filter label values to raw category strings used in herb data
    var CATEGORY_LABEL_MAP = {
      'sleep & calm': 'sleep',
      'energy & vitality': 'energy',
      'immune support': 'immune',
      'beauty & skin': 'beauty',
      'pain & inflammation': 'pain',
      'hormonal balance': 'hormonal',
      'digestion': 'digestive',
      'spiritual & ritual': 'spiritual',
      'adaptogens': 'adaptogen'
    };
    var catRaw = catVal ? (CATEGORY_LABEL_MAP[catVal.toLowerCase()] || catVal.toLowerCase()) : '';

    var filtered = BOTANICALS.filter(function(herb) {
      if (!herb) return false;

      // Warn about herbs with missing required fields
      if (!herb.name || !herb.id) {
        console.warn('[Custom Creations] Herb missing required fields (name or id):', herb);
      }

      var catMatch = !catVal;
      if (!catMatch) {
        // Check herb.category (string) against both raw value and label
        var herbCatStr = (herb.category || '').toLowerCase();
        // Check herb.categories (array) against the raw category value
        var herbCats = herb.categories || [];
        catMatch = herbCatStr.indexOf(catRaw) !== -1 ||
                   herbCatStr.indexOf(catVal.toLowerCase()) !== -1 ||
                   herbCats.some(function(c) {
                     return c.toLowerCase() === catRaw || c.toLowerCase().indexOf(catVal.toLowerCase()) !== -1;
                   });
      }
      if (!catMatch) return false;

      if (!searchVal) return true;
      var q = searchVal.toLowerCase();
      var searchable = [
        herb.name || '',
        herb.latin || '',
        herb.desc || herb.description || '',
        herb.category || '',
        (herb.categories || []).join(' '),
        (herb.benefits || []).join(' ')
      ].join(' ').toLowerCase();
      return searchable.indexOf(q) !== -1;
    });

    if (filtered.length === 0) {
      grid.innerHTML = '<p class="cc-empty">No botanicals found. Try a different search or category.</p>';
      updateCounter();
      renderPagination(0, 0);
      return;
    }

    var pageSize = getPageSize();
    var totalPages = Math.ceil(filtered.length / pageSize);
    if (ccCurrentPage > totalPages) ccCurrentPage = totalPages;
    if (ccCurrentPage < 1) ccCurrentPage = 1;
    var startIdx = (ccCurrentPage - 1) * pageSize;
    var pageItems = filtered.slice(startIdx, startIdx + pageSize);

    grid.innerHTML = pageItems.map(function(herb) {
      // Null-safety: skip completely null/undefined herbs
      if (!herb) {
        console.warn('[Custom Creations] Encountered null herb in page items, skipping.');
        return '';
      }

      // Fallback placeholder card for herbs with missing data
      if (!herb.name && !(herb.desc || herb.description) && !(herb.categories && herb.categories.length)) {
        console.warn('[Custom Creations] Herb has missing data (no name, desc, or category), showing placeholder:', herb);
        return '<div class="cc-herb-card placeholder" data-id="' + (herb.id || 'unknown') + '">' +
          '<div class="cc-herb-img-wrap">' +
            '<div class="cc-herb-placeholder-icon">\uD83C\uDF43</div>' +
          '</div>' +
          '<div class="cc-herb-info">' +
            '<h4 class="cc-herb-name">Unknown Botanical</h4>' +
            '<p class="cc-herb-desc">\uD83C\uDF3F Details coming soon</p>' +
          '</div>' +
        '</div>';
      }

      var isSelected = ccSelected.some(function(h) { return h.id === herb.id; });
      var isDisabled = !isSelected && ccSelected.length >= MAX_HERBS;
      var img = getHerbImage(herb);
      var desc = herb.desc || herb.description || 'A botanical ingredient for your custom remedy.';
      var benefits = (herb.benefits || []).slice(0, 3);
      var benefitsHtml = benefits.length > 0
        ? '<ul class="cc-herb-benefits">' + benefits.map(function(b) { return '<li>' + b + '</li>'; }).join('') + '</ul>'
        : '';

      // Smart badges
      var badgesHtml = '';
      var flowState = window.RemedyFlow ? window.RemedyFlow.getState() : {};
      var recHerbs = flowState.recommendedHerbs || [];
      var flowSymptoms = flowState.symptoms || [];
      var herbRecommendations = typeof ADVISOR_DATA !== 'undefined' ? ADVISOR_DATA.herbRecommendations : {};
      var popularHerbs = ['ashwagandha', 'chamomile', 'lavender', 'ginger', 'turmeric'];

      if (recHerbs.indexOf(herb.id) !== -1) {
        badgesHtml += '<span class="cc-herb-badge recommended">Recommended for You</span>';
      }
      var matchesGoal = flowSymptoms.some(function(symptom) {
        var goalHerbs = herbRecommendations[symptom] || [];
        return goalHerbs.indexOf(herb.id) !== -1;
      });
      if (matchesGoal) {
        badgesHtml += '<span class="cc-herb-badge best-match">Best for Your Goal</span>';
      }
      if (popularHerbs.indexOf(herb.id) !== -1) {
        badgesHtml += '<span class="cc-herb-badge popular">Popular Choice</span>';
      }
      if ((herb.benefits || []).length < 3) {
        badgesHtml += '<span class="cc-herb-badge beginner">Beginner Friendly</span>';
      }

      // Micro-explanation
      var microHtml = '<p class="cc-herb-micro">' + (herb.benefits && herb.benefits[0] ? herb.benefits[0] : 'Gentle botanical support') + '</p>';

      var herbPrice = getHerbPrice(herb);
      var priceTier = herbPrice >= 0.35 ? 'premium' : (herbPrice >= 0.25 ? 'mid-high' : (herbPrice >= 0.20 ? 'mid' : 'base'));
      return '<div class="cc-herb-card' + (isSelected ? ' selected' : '') + (isDisabled ? ' disabled' : '') + '" data-id="' + herb.id + '">' +
        '<div class="cc-herb-img-wrap">' +
          '<img src="' + img + '" alt="' + herb.name + '" loading="lazy" onerror="this.style.display=\'none\'" />' +
          (isSelected ? '<div class="cc-herb-check">\u2713</div>' : '') +
          '<div class="cc-herb-price-badge tier-' + priceTier + '">+$' + herbPrice.toFixed(2) + '</div>' +
        '</div>' +
        '<div class="cc-herb-info">' +
          '<h4 class="cc-herb-name">' + herb.name + '</h4>' +
          microHtml +
          (badgesHtml ? '<div class="cc-herb-badges">' + badgesHtml + '</div>' : '') +
          '<p class="cc-herb-latin">' + (herb.latin || '') + '</p>' +
          '<p class="cc-herb-desc">' + desc + '</p>' +
          benefitsHtml +
          (!isDisabled ? '<button class="cc-herb-select-btn' + (isSelected ? ' selected' : '') + '" data-id="' + herb.id + '">' + (isSelected ? '\u2713 Selected' : '+ Add') + '</button>' : '<span class="cc-herb-max">Max 12 selected</span>') +
        '</div>' +
      '</div>';
    }).join('');

    // Bind click events
    grid.querySelectorAll('.cc-herb-card:not(.disabled)').forEach(function(card) {
      card.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON') return;
        toggleHerb(card.dataset.id);
      });
    });
    grid.querySelectorAll('.cc-herb-select-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleHerb(btn.dataset.id);
      });
    });

    updateCounter();
    renderPagination(filtered.length, totalPages);
  }

  // ---- Dynamic Formula Explanation Panel ----
  function renderFormulaExplanation() {
    var container = document.getElementById('ccFormulaExplanation');
    if (!container) {
      // Insert dynamically after the herb grid
      var grid = document.getElementById('ccHerbGrid');
      if (!grid) return;
      container = document.createElement('div');
      container.id = 'ccFormulaExplanation';
      container.className = 'cc-formula-explanation';
      grid.parentNode.insertBefore(container, grid.nextSibling);
    }

    if (ccSelected.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';

    // Gather categories covered by selected herbs
    var categoriesSet = {};
    ccSelected.forEach(function(herb) {
      var cats = herb.categories || (herb.category ? [herb.category] : []);
      cats.forEach(function(c) {
        if (c) categoriesSet[c.toLowerCase()] = c;
      });
    });
    var categoryList = Object.keys(categoriesSet).map(function(k) { return categoriesSet[k]; });

    // Get user goals from flow state
    var flowState = window.RemedyFlow ? window.RemedyFlow.getState() : {};
    var symptoms = flowState.symptoms || [];
    var goalLabels = {};
    if (typeof ADVISOR_DATA !== 'undefined') {
      ADVISOR_DATA.goals.forEach(function(g) { goalLabels[g.id] = g.label; });
    }
    var goalNames = symptoms.map(function(s) { return goalLabels[s] || s; });

    var html = '<h4 class="cc-formula-heading">Your Formula Works Because:</h4>';
    if (categoryList.length > 0) {
      html += '<p class="cc-formula-categories">These herbs support <strong>' + categoryList.join(', ').toLowerCase() + '</strong></p>';
    }
    html += '<p class="cc-formula-synergy">They work together to balance your system</p>';
    if (goalNames.length > 0) {
      html += '<p class="cc-formula-goals">Designed for: <strong>' + goalNames.join(', ') + '</strong></p>';
    }

    container.innerHTML = html;
  }

  function renderPagination(totalItems, totalPages) {
    var container = document.getElementById('ccPaginationControls');
    if (!container) return;

    if (totalItems === 0 || totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    var pageSize = getPageSize();
    var startItem = (ccCurrentPage - 1) * pageSize + 1;
    var endItem = Math.min(ccCurrentPage * pageSize, totalItems);

    var html = '<div class="cc-pagination">';
    html += '<button class="cc-page-btn' + (ccCurrentPage <= 1 ? ' disabled' : '') + '" id="ccPrevPage">&larr; Previous</button>';
    html += '<span class="cc-page-info">Page ' + ccCurrentPage + ' of ' + totalPages + ' <span class="cc-page-items">(' + startItem + '\u2013' + endItem + ' of ' + totalItems + ')</span></span>';
    html += '<button class="cc-page-btn' + (ccCurrentPage >= totalPages ? ' disabled' : '') + '" id="ccNextPage">Next Page &rarr;</button>';
    html += '</div>';
    container.innerHTML = html;

    var prevBtn = document.getElementById('ccPrevPage');
    var nextBtn = document.getElementById('ccNextPage');
    if (prevBtn && ccCurrentPage > 1) {
      prevBtn.addEventListener('click', function() {
        ccCurrentPage--;
        renderHerbGrid();
        scrollToGrid();
      });
    }
    if (nextBtn && ccCurrentPage < totalPages) {
      nextBtn.addEventListener('click', function() {
        ccCurrentPage++;
        renderHerbGrid();
        scrollToGrid();
      });
    }
  }

  function scrollToGrid() {
    var grid = document.getElementById('ccHerbGrid');
    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function calcPrice() {
    var botanicalTotal = ccSelected.reduce(function(sum, herb) { return sum + getHerbPrice(herb); }, 0);
    ccPrice = ccBasePrice + botanicalTotal;
    updateCounter();
  }

  function toggleHerb(herbId) {
    var herb = BOTANICALS.find(function(h) { return h.id === herbId; });
    if (!herb) return;
    var idx = ccSelected.findIndex(function(h) { return h.id === herbId; });
    if (idx > -1) {
      ccSelected.splice(idx, 1);
    } else {
      if (ccSelected.length >= MAX_HERBS) {
        alert('You can select up to 12 botanicals for a balanced, safe formula. Remove one to add another.');
        return;
      }
      ccSelected.push(herb);
    }
    calcPrice();
    renderHerbGrid();
    renderFormulaExplanation();

    // Update flow state
    if (window.RemedyFlow && ccFlowActive) {
      window.RemedyFlow.updateState({ finalHerbs: ccSelected.map(function(h) { return h.id; }) });
    }
  }

  function updateCounter() {
    var counter = document.getElementById('ccSelectedCount');
    if (counter) counter.textContent = ccSelected.length;
    var priceDisplay = document.getElementById('ccLivePrice');
    if (priceDisplay) {
      var botanicalCost = ccSelected.reduce(function(sum, herb) { return sum + getHerbPrice(herb); }, 0);
      var herbBreakdown = ccSelected.length > 0
        ? ccSelected.map(function(h) { return h.name + ' ($' + getHerbPrice(h).toFixed(2) + ')'; }).join(', ')
        : '';
      priceDisplay.innerHTML = '<span class="cc-price-base">Base: $' + ccBasePrice.toFixed(2) + '</span>' +
        (ccSelected.length > 0
          ? ' + <span class="cc-price-botanicals">Botanicals: $' + botanicalCost.toFixed(2) + '</span>'
          + '<br><small class="cc-herb-breakdown">' + herbBreakdown + '</small>'
          : '') +
        ' = <strong class="cc-price-total">$' + ccPrice.toFixed(2) + '</strong>';
    }
  }

  // ---- Search & filter ----
  function bindSearchAndFilter() {
    var searchInput = document.getElementById('ccHerbSearch');
    var catFilter = document.getElementById('ccCategoryFilter');
    if (searchInput) {
      searchInput.addEventListener('input', function() { ccCurrentPage = 1; waitForBotanicals(renderHerbGrid); });
    }
    if (catFilter) {
      catFilter.addEventListener('change', function() { ccCurrentPage = 1; waitForBotanicals(renderHerbGrid); });
    }
  }

  // ---- Navigation buttons ----
  function bindNavButtons() {
    var backToTypeBtn = document.getElementById('ccBackToTypeBtn');
    if (backToTypeBtn) {
      backToTypeBtn.addEventListener('click', function() { showStep(1); });
    }

    var pickMoreBtn = document.getElementById('ccPickMoreBtn');
    if (pickMoreBtn) {
      pickMoreBtn.addEventListener('click', function() {
        var grid = document.getElementById('ccHerbGrid');
        if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    var doneHerbsBtn = document.getElementById('ccDoneHerbsBtn');
    if (doneHerbsBtn) {
      doneHerbsBtn.addEventListener('click', function() {
        if (ccSelected.length === 0) {
          alert('Please select at least one botanical before continuing.');
          return;
        }
        showStep(3);
        renderReview();
      });
    }

    var backToHerbsBtn = document.getElementById('ccBackToHerbsBtn');
    if (backToHerbsBtn) {
      backToHerbsBtn.addEventListener('click', function() {
        showStep(2);
        waitForBotanicals(renderHerbGrid);
      });
    }
  }

  // ---- Step 3: Review ----
  function renderReview() {
    var preview = document.getElementById('ccSelectedPreview');
    if (preview) {
      preview.innerHTML = '<h4 class="cc-preview-title">Your Selected Botanicals</h4>' +
        '<div class="cc-preview-grid">' +
        ccSelected.map(function(herb) {
          var img = getHerbImage(herb);
          return '<div class="cc-preview-card">' +
            '<img src="' + img + '" alt="' + herb.name + '" onerror="this.style.display=\'none\'" />' +
            '<span>' + herb.name + '</span>' +
          '</div>';
        }).join('') +
        '</div>';
    }

    var summary = document.getElementById('ccSummary');
    if (summary) {
      var typeName = document.querySelector('.cc-type-btn[data-type="' + ccType + '"] .cc-type-name');
      var typeLabel = typeName ? typeName.textContent : (ccType || 'Custom Creation');

      // Include flow context in summary
      var flowState = window.RemedyFlow ? window.RemedyFlow.getState() : {};
      var symptoms = flowState.symptoms || [];
      var recommendedHerbs = (flowState.recommendedHerbs || []).map(function(id) {
        var h = typeof BOTANICALS !== 'undefined' ? BOTANICALS.find(function(b) { return b.id === id; }) : null;
        return h ? h.name : '';
      }).filter(Boolean);

      var goalLabels = {};
      if (typeof ADVISOR_DATA !== 'undefined') {
        ADVISOR_DATA.goals.forEach(function(g) { goalLabels[g.id] = g.label; });
      }

      var summaryHtml = '<div class="cc-summary-box">';
      summaryHtml += '<div class="cc-summary-row"><span>Type:</span><strong>' + typeLabel + ' (' + ccUnit + ')</strong></div>';

      if (symptoms.length > 0 && ccFlowActive) {
        summaryHtml += '<div class="cc-summary-row"><span>Symptoms:</span><strong>' + symptoms.map(function(s) { return goalLabels[s] || s; }).join(', ') + '</strong></div>';
      }
      if (recommendedHerbs.length > 0 && ccFlowActive) {
        summaryHtml += '<div class="cc-summary-row"><span>Recommended Herbs:</span><strong>' + recommendedHerbs.join(', ') + '</strong></div>';
      }

      summaryHtml += '<div class="cc-summary-row"><span>Final Herbs (' + ccSelected.length + '):</span><strong>' + ccSelected.map(function(h) { return h.name; }).join(', ') + '</strong></div>';
      summaryHtml += '<div class="cc-summary-row"><span>Base Price:</span><strong>$' + ccBasePrice.toFixed(2) + '</strong></div>';
      summaryHtml += '<div class="cc-summary-row"><span>Botanicals (' + ccSelected.length + '):</span><strong>$' + ccSelected.reduce(function(s,h){return s+getHerbPrice(h);},0).toFixed(2) + '</strong></div>';
      summaryHtml += '<div class="cc-summary-row cc-summary-price"><span>Total:</span><strong>$' + ccPrice.toFixed(2) + '</strong></div>';
      summaryHtml += '<div class="cc-summary-note"><small>Includes 1oz total weight of your custom mixed blend</small></div>';
      summaryHtml += '</div>';
      summary.innerHTML = summaryHtml;
    }
  }

  // ---- Add to Cart ----
  function bindCartButton() {
    var addToCartBtn = document.getElementById('ccAddToCartBtn');
    if (!addToCartBtn) return;
    addToCartBtn.addEventListener('click', function() {
      if (ccSelected.length === 0) {
        alert('Please select at least one botanical.');
        return;
      }

      var safetyCheck = document.getElementById('ccSafetyCheck');
      if (safetyCheck && !safetyCheck.checked) {
        alert('Please confirm that you have read and understood the herbal safety notice before adding to cart.');
        return;
      }

      var flowState = window.RemedyFlow ? window.RemedyFlow.getState() : {};
      var symptoms = flowState.symptoms || [];
      var recommendedHerbs = (flowState.recommendedHerbs || []).map(function(id) {
        var h = typeof BOTANICALS !== 'undefined' ? BOTANICALS.find(function(b) { return b.id === id; }) : null;
        return h ? h.name : '';
      }).filter(Boolean);
      var remedyMode = flowState.remedyMode || 'combined';

      var goalLabels = {};
      if (typeof ADVISOR_DATA !== 'undefined') {
        ADVISOR_DATA.goals.forEach(function(g) { goalLabels[g.id] = g.label; });
      }

      var creationName = (document.getElementById('ccCreationName') || {}).value || '';
      var intention = (document.getElementById('ccIntention') || {}).value || '';
      var notes = (document.getElementById('ccNotes') || {}).value || '';

      var typeName = document.querySelector('.cc-type-btn[data-type="' + ccType + '"] .cc-type-name');
      var typeLabel = typeName ? typeName.textContent : (ccType || 'Custom Creation');

      // Separate remedies mode
      if (ccFlowActive && remedyMode === 'separate' && symptoms.length > 1) {
        addSeparateRemedies(symptoms, goalLabels, typeLabel, creationName, intention, notes, recommendedHerbs);
        return;
      }

      // Combined remedy (default)
      var itemName = (creationName ? creationName + ' \u2014 ' : 'Custom ') + typeLabel;
      var herbList = ccSelected.map(function(h) { return h.name; }).join(', ');
      var symptomList = ccFlowActive && symptoms.length > 0 ? symptoms.map(function(s) { return goalLabels[s] || s; }).join(', ') : '';
      var recHerbList = ccFlowActive && recommendedHerbs.length > 0 ? recommendedHerbs.join(', ') : '';
      var desc = ccUnit + ' | ' + (intention || 'Custom Blend') + ' | ' + herbList + (notes ? ' | Notes: ' + notes : '');

      var finalPrice = ccBasePrice + ccSelected.reduce(function(s,h){return s+getHerbPrice(h);},0);
      var cartItem = {
        id: 'custom-' + Date.now(),
        name: itemName,
        desc: desc,
        herbs: herbList,
        size: ccUnit,
        price: finalPrice,
        qty: 1,
        symptoms: symptomList,
        recommendedHerbs: recHerbList,
        form: typeLabel
      };

      if (typeof window.addItemToCart === 'function') {
        window.addItemToCart(cartItem);
      } else {
        document.dispatchEvent(new CustomEvent('addToCart', { detail: cartItem }));
      }

      alert('\u2726 "' + itemName + '" has been added to your cart!');

      // Don't auto-reset — let user keep building or start new
      showPostCartActions();
    });
  }

  function showPostCartActions() {
    var step3 = document.getElementById('ccStep3');
    if (!step3) return;
    var existing = step3.querySelector('.cc-post-cart-actions');
    if (existing) return;
    var actionsDiv = document.createElement('div');
    actionsDiv.className = 'cc-post-cart-actions rf-action-buttons';
    actionsDiv.style.marginTop = '16px';
    actionsDiv.innerHTML =
      '<div style="text-align:center; color:#8fb87a; font-size:0.95rem; margin-bottom:10px">\u2726 Remedy added to cart!</div>' +
      '<button class="rf-action-btn primary" onclick="if(typeof startGuidedExperience===\'function\') startGuidedExperience()">Build Another Remedy</button>' +
      '<button class="rf-action-btn" onclick="if(typeof showSection===\'function\') showSection(\'herb-index\')">Explore More Herbs</button>' +
      '<button class="rf-action-btn" onclick="if(typeof startNewRemedy===\'function\') startNewRemedy()">Start Fresh</button>' +
      '<button class="rf-action-btn" onclick="if(typeof retakeQuiz===\'function\') retakeQuiz()">Retake Quiz</button>';
    var finalActions = step3.querySelector('.cc-final-actions');
    if (finalActions) {
      finalActions.parentNode.insertBefore(actionsDiv, finalActions.nextSibling);
    } else {
      step3.appendChild(actionsDiv);
    }
  }

  function addSeparateRemedies(symptoms, goalLabels, typeLabel, creationName, intention, notes, recommendedHerbs) {
    // Group selected herbs by their categories matching symptoms
    var herbRecommendations = typeof ADVISOR_DATA !== 'undefined' ? ADVISOR_DATA.herbRecommendations : {};
    var addedCount = 0;

    symptoms.forEach(function(symptom, idx) {
      var symptomHerbIds = herbRecommendations[symptom] || [];
      var symptomHerbs = ccSelected.filter(function(h) {
        return symptomHerbIds.indexOf(h.id) !== -1;
      });

      // If no specific herbs match this symptom, include all selected herbs
      if (symptomHerbs.length === 0) symptomHerbs = ccSelected;

      var symptomLabel = goalLabels[symptom] || symptom;
      var itemName = (creationName ? creationName + ' \u2014 ' : '') + symptomLabel + ' ' + typeLabel;
      var herbList = symptomHerbs.map(function(h) { return h.name; }).join(', ');
      var finalPrice = ccBasePrice + symptomHerbs.reduce(function(s,h){return s+getHerbPrice(h);},0);

      var cartItem = {
        id: 'custom-' + Date.now() + '-' + idx,
        name: itemName,
        desc: ccUnit + ' | ' + symptomLabel + ' | ' + herbList + (notes ? ' | Notes: ' + notes : ''),
        herbs: herbList,
        size: ccUnit,
        price: finalPrice,
        qty: 1,
        symptoms: symptomLabel,
        recommendedHerbs: recommendedHerbs.join(', '),
        form: typeLabel
      };

      if (typeof window.addItemToCart === 'function') {
        window.addItemToCart(cartItem);
      }
      addedCount++;
    });

    alert('\u2726 ' + addedCount + ' separate remedies have been added to your cart!');
    showPostCartActions();
  }

  function resetBuilder() {
    ccType = null; ccSelected = []; ccPrice = 0; ccUnit = ''; ccFlowActive = false;
    document.querySelectorAll('.cc-type-btn').forEach(function(b) { b.classList.remove('selected'); });
    if (window.RemedyFlow) window.RemedyFlow.clearState();
    showStep(1);
  }

  // ---- Consultation form ----
  function bindFormulaForm() {
    var submitBtn = document.getElementById('formulaSubmitBtn');
    if (!submitBtn) return;
    submitBtn.addEventListener('click', function() {
      var name = (document.getElementById('formulaName') || {}).value || '';
      var email = (document.getElementById('formulaEmail') || {}).value || '';
      var symptoms = (document.getElementById('formulaSymptoms') || {}).value || '';
      var ageConfirm = document.getElementById('formulaAgeConfirm');
      var interactionCheck = document.getElementById('formulaInteractionCheck');

      if (!name || !email || !symptoms) {
        alert('Please fill in your name, email, and symptoms to send your consultation request.');
        return;
      }
      if (ageConfirm && !ageConfirm.checked) {
        alert('Please confirm that you are 18 years of age or older.');
        return;
      }
      if (interactionCheck && !interactionCheck.checked) {
        alert('Please acknowledge that herbal remedies may interact with medications or medical conditions before submitting.');
        return;
      }

      var type = (document.getElementById('formulaType') || {}).value || 'Not specified';
      var meds = (document.getElementById('formulaMeds') || {}).value || 'None';
      var supplements = (document.getElementById('formulaSupplements') || {}).value || 'None';
      var pregnancy = (document.getElementById('formulaPregnancy') || {}).value || 'Not specified';
      var allergies = (document.getElementById('formulaAllergies') || {}).value || 'None';
      var fnotes = (document.getElementById('formulaNotes') || {}).value || '';

      var subject = encodeURIComponent('Custom Herbal Consultation Request from ' + name);
      var body = encodeURIComponent(
        'Name: ' + name + '\nEmail: ' + email + '\n\nSymptoms / Goals:\n' + symptoms +
        '\n\nRemedy Type: ' + type +
        '\nCurrent Medications: ' + meds +
        '\nCurrent Supplements: ' + supplements +
        '\nPregnancy / Breastfeeding: ' + pregnancy +
        '\nAllergies: ' + allergies +
        '\n\nAdditional Notes:\n' + fnotes
      );
      window.location.href = 'mailto:awaken@consultant.com?subject=' + subject + '&body=' + body;
    });
  }

  // ---- Init ----
  function init() {
    bindTypeButtons();
    bindSearchAndFilter();
    bindNavButtons();
    bindCartButton();
    bindFormulaForm();

    var resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        if (document.getElementById('ccStep2') && document.getElementById('ccStep2').style.display !== 'none') {
          renderHerbGrid();
        }
      }, 250);
    });
  }

  // ---- Listen for section navigation ----
  document.addEventListener('sectionChanged', function(e) {
    if (e.detail && (e.detail.section === 'custom-formula' || e.detail.section === 'tea-shop')) {
      // Check if there's flow state to render
      var flowState = window.RemedyFlow ? window.RemedyFlow.getState() : {};
      if (flowState.symptoms && flowState.symptoms.length > 0) {
        ccFlowActive = true;
      }
      renderFlowContext();
      showStep(1);
    }
  });

  // ---- Expose global function to add a herb from outside ----
  window.addToCustomCreation = function(herbId) {
    var herb = (typeof BOTANICALS !== 'undefined') && BOTANICALS.find(function(h) { return h.id === herbId; });
    if (!herb) return;

    if (typeof showSection === 'function') showSection('custom-formula');

    if (!ccType) {
      window._pendingCustomHerb = herb;
      showStep(1);
      if (typeof showToast === 'function') showToast('Choose a creation type to get started, then ' + herb.name + ' will be added automatically.');
      return;
    }

    var already = ccSelected.some(function(h) { return h.id === herbId; });
    if (already) {
      if (typeof showToast === 'function') showToast(herb.name + ' is already in your custom creation.');
      showStep(2);
      return;
    }
    if (ccSelected.length >= MAX_HERBS) {
      if (typeof showToast === 'function') showToast('Maximum ' + MAX_HERBS + ' botanicals. Remove one to add ' + herb.name + '.');
      showStep(2);
      return;
    }

    ccSelected.push(herb);
    calcPrice();
    renderHerbGrid();
    showStep(2);
    if (typeof showToast === 'function') showToast(herb.emoji + ' ' + herb.name + ' added to your custom creation!');
  };

  // ---- Patch type buttons to auto-add pending herbs ----
  var _origBindTypeButtons = bindTypeButtons;
  bindTypeButtons = function() {
    _origBindTypeButtons();
    document.querySelectorAll('.cc-type-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        // Single pending herb from grimoire/botanical cards
        if (window._pendingCustomHerb) {
          var herb = window._pendingCustomHerb;
          window._pendingCustomHerb = null;
          var already = ccSelected.some(function(h) { return h.id === herb.id; });
          if (!already && ccSelected.length < MAX_HERBS) {
            ccSelected.push(herb);
            calcPrice();
            renderHerbGrid();
            if (typeof showToast === 'function') showToast(herb.emoji + ' ' + herb.name + ' added to your custom creation!');
          }
        }
        // Multiple pending herbs from herbal advisor quiz
        if (window._pendingAdvisorHerbs && window._pendingAdvisorHerbs.length > 0) {
          var advisorHerbs = window._pendingAdvisorHerbs;
          window._pendingAdvisorHerbs = null;
          var addedNames = [];
          advisorHerbs.forEach(function(aherb) {
            var exists = ccSelected.some(function(h) { return h.id === aherb.id; });
            if (!exists && ccSelected.length < MAX_HERBS) {
              ccSelected.push(aherb);
              addedNames.push(aherb.name);
            }
          });
          if (addedNames.length > 0) {
            calcPrice();
            renderHerbGrid();
            if (typeof showToast === 'function') showToast('\u{1F33F} Pre-selected from quiz: ' + addedNames.join(', '));
          }
        }
      });
    });
  };

  // ---- Start ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
