/* ============================================================
   GUIDED FLOW — Beginner-friendly guided experience,
   floating cart FAB, action buttons on every page,
   quiz-prompt hiding, and flow-loop prevention
   ============================================================ */

(function() {
  'use strict';

  // ============================================================
  // 1. GUIDED EXPERIENCE (Beginner Path)
  // ============================================================

  var guidedState = {
    step: 0,
    symptoms: [],
    timing: null,
    preferredStyle: null,
    sensitivities: '',
    quizAnswers: {},
    recommendedForm: null,
    recommendedFormLabel: '',
    recommendedHerbs: [],
    recommendedHerbObjs: []
  };

  var TIMING_OPTIONS = [
    { id: 'morning', label: 'Morning', icon: '\u2600\uFE0F', desc: 'Start your day with herbal support' },
    { id: 'evening', label: 'Evening', icon: '\u{1F319}', desc: 'Wind down and restore before sleep' },
    { id: 'daily', label: 'Daily', icon: '\u{1F504}', desc: 'Consistent daily support' },
    { id: 'as-needed', label: 'As Needed', icon: '\u{1F4A1}', desc: 'Use when symptoms arise' }
  ];

  var STYLE_OPTIONS = [
    { id: 'tea', label: 'Tea', icon: '\u{1F375}', desc: 'Warm, ritualistic, gentle absorption' },
    { id: 'capsules', label: 'Capsules', icon: '\u{1F48A}', desc: 'Convenient, no taste, precise dose' },
    { id: 'balm', label: 'Balm', icon: '\u{1FAD9}', desc: 'Topical, targeted relief' },
    { id: 'serum', label: 'Serum', icon: '\u2728', desc: 'Skin-focused, concentrated' },
    { id: 'tincture', label: 'Tincture', icon: '\u{1F4A7}', desc: 'Fast-absorbing liquid extract' },
    { id: 'no-preference', label: 'No Preference', icon: '\u{1F33F}', desc: 'Let us choose the best form' }
  ];

  var SYMPTOM_OPTIONS = [
    { id: 'sleep', label: 'Sleep', icon: '\u{1F319}' },
    { id: 'stress', label: 'Stress', icon: '\u{1F33F}' },
    { id: 'pain', label: 'Pain', icon: '\u{1F525}' },
    { id: 'energy', label: 'Energy', icon: '\u26A1' },
    { id: 'digestion', label: 'Digestion', icon: '\u{1FAC1}' },
    { id: 'immune', label: 'Immune Support', icon: '\u{1F6E1}\uFE0F' },
    { id: 'beauty', label: 'Skin', icon: '\u2728' },
    { id: 'hormones', label: 'Hormones', icon: '\u{1F338}' },
    { id: 'cognitive', label: 'Brain & Focus', icon: '\u{1F9E0}' }
  ];

  // Unified quiz entry: all quiz starts route to the upgraded Herbal Advisor
  // so there is one canonical quiz experience (and one remedy per session).
  window.startGuidedExperience = function() {
    if (typeof window.openHerbalAdvisor === 'function') {
      window.openHerbalAdvisor();
      return;
    }
    // Fallback to the legacy guided flow only if the advisor failed to load.
    guidedState = {
      step: 1,
      symptoms: [],
      timing: null,
      preferredStyle: null,
      sensitivities: '',
      quizAnswers: {},
      recommendedForm: null,
      recommendedFormLabel: '',
      recommendedHerbs: [],
      recommendedHerbObjs: []
    };
    renderGuidedFlow();
  };

  window.startAdvancedBuilder = function() {
    if (window.RemedyFlow) window.RemedyFlow.clearState();
    if (typeof showSection === 'function') showSection('custom-formula');
  };

  function renderGuidedFlow() {
    var existing = document.getElementById('guided-flow-overlay');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.id = 'guided-flow-overlay';
    overlay.className = 'guided-flow-overlay';

    var totalSteps = 6;
    var progress = (guidedState.step / totalSteps) * 100;

    overlay.innerHTML =
      '<div class="guided-flow-modal">' +
        '<button class="guided-flow-close" onclick="closeGuidedFlow()">\u2715</button>' +
        '<div class="guided-flow-progress"><div class="guided-flow-progress-bar" style="width:' + progress + '%"></div></div>' +
        '<div class="guided-flow-steps">' + renderStepIndicators() + '</div>' +
        '<div id="guided-flow-content">' + renderGuidedStep() + '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeGuidedFlow();
    });
  }

  function renderStepIndicators() {
    var labels = ['Symptoms', 'Timing', 'Style', 'Sensitivities', 'Your Prescription', 'Add to Cart'];
    return '<div class="guided-step-indicators">' +
      labels.map(function(label, i) {
        var stepNum = i + 1;
        var cls = stepNum < guidedState.step ? 'completed' : (stepNum === guidedState.step ? 'active' : '');
        return '<span class="guided-step-dot ' + cls + '">' + stepNum + '</span>';
      }).join('') +
    '</div>';
  }

  function updateGuidedContent() {
    var content = document.getElementById('guided-flow-content');
    if (!content) return;
    content.innerHTML = renderGuidedStep();
    var bar = document.querySelector('.guided-flow-progress-bar');
    if (bar) bar.style.width = ((guidedState.step / 6) * 100) + '%';
    var indicators = document.querySelector('.guided-flow-steps');
    if (indicators) indicators.innerHTML = renderStepIndicators();
  }

  function renderGuidedStep() {
    switch (guidedState.step) {
      case 1: return renderGuidedSymptoms();
      case 2: return renderGuidedTiming();
      case 3: return renderGuidedStyle();
      case 4: return renderGuidedSensitivities();
      case 5: return renderGuidedPrescription();
      case 6: return renderGuidedAddToCart();
      default: return '';
    }
  }

  // Step 1: Choose Symptoms (multi-select)
  function renderGuidedSymptoms() {
    return '<div class="guided-step-number">Step 1 of 6</div>' +
      '<h3>What do you need help with?</h3>' +
      '<p>Select everything that applies. We\'ll build a personalized remedy recommendation.</p>' +
      '<div class="guided-symptom-grid">' +
        SYMPTOM_OPTIONS.map(function(g) {
          var sel = guidedState.symptoms.indexOf(g.id) !== -1;
          return '<button class="guided-option-btn ' + (sel ? 'selected' : '') + '" onclick="guidedToggleSymptom(\'' + g.id + '\')">' +
            '<span class="guided-option-icon">' + g.icon + '</span>' +
            '<span class="guided-option-label">' + g.label + '</span>' +
          '</button>';
        }).join('') +
      '</div>' +
      '<div class="guided-actions">' +
        '<button class="guided-btn primary" onclick="guidedNextStep()" ' + (guidedState.symptoms.length === 0 ? 'disabled' : '') + '>Continue \u2192</button>' +
      '</div>';
  }

  window.guidedToggleSymptom = function(id) {
    var idx = guidedState.symptoms.indexOf(id);
    if (idx > -1) guidedState.symptoms.splice(idx, 1);
    else guidedState.symptoms.push(id);
    updateGuidedContent();
  };

  // Step 2: When will you use this?
  function renderGuidedTiming() {
    return '<div class="guided-step-number">Step 2 of 6</div>' +
      '<h3>When will you use this remedy?</h3>' +
      '<p>This helps us recommend the best form and dosage for your routine.</p>' +
      '<div class="guided-option-list">' +
        TIMING_OPTIONS.map(function(t) {
          var sel = guidedState.timing === t.id;
          return '<button class="guided-option-btn wide ' + (sel ? 'selected' : '') + '" onclick="guidedSelectTiming(\'' + t.id + '\')">' +
            '<span class="guided-option-icon">' + t.icon + '</span>' +
            '<div class="guided-option-text"><span class="guided-option-label">' + t.label + '</span>' +
            '<span class="guided-option-desc">' + t.desc + '</span></div>' +
          '</button>';
        }).join('') +
      '</div>' +
      '<div class="guided-actions">' +
        '<button class="guided-btn" onclick="guidedPrevStep()">\u2190 Back</button>' +
        '<button class="guided-btn primary" onclick="guidedNextStep()" ' + (!guidedState.timing ? 'disabled' : '') + '>Continue \u2192</button>' +
      '</div>';
  }

  window.guidedSelectTiming = function(id) {
    guidedState.timing = id;
    updateGuidedContent();
  };

  // Step 3: Preferred remedy style
  function renderGuidedStyle() {
    return '<div class="guided-step-number">Step 3 of 6</div>' +
      '<h3>Preferred remedy style</h3>' +
      '<p>Choose how you\'d like to take your remedy, or let us recommend.</p>' +
      '<div class="guided-style-grid">' +
        STYLE_OPTIONS.map(function(s) {
          var sel = guidedState.preferredStyle === s.id;
          return '<button class="guided-option-btn ' + (sel ? 'selected' : '') + '" onclick="guidedSelectStyle(\'' + s.id + '\')">' +
            '<span class="guided-option-icon">' + s.icon + '</span>' +
            '<span class="guided-option-label">' + s.label + '</span>' +
            '<span class="guided-option-desc">' + s.desc + '</span>' +
          '</button>';
        }).join('') +
      '</div>' +
      '<div class="guided-actions">' +
        '<button class="guided-btn" onclick="guidedPrevStep()">\u2190 Back</button>' +
        '<button class="guided-btn primary" onclick="guidedNextStep()" ' + (!guidedState.preferredStyle ? 'disabled' : '') + '>Continue \u2192</button>' +
      '</div>';
  }

  window.guidedSelectStyle = function(id) {
    guidedState.preferredStyle = id;
    updateGuidedContent();
  };

  // Step 4: Optional Sensitivities
  function renderGuidedSensitivities() {
    return '<div class="guided-step-number">Step 4 of 6</div>' +
      '<h3>Any sensitivities or allergies?</h3>' +
      '<p>Optional. Let us know about any allergies, medications, or things to avoid so we can tailor your remedy.</p>' +
      '<textarea class="guided-textarea" id="guidedSensitivities" placeholder="e.g. pregnant, allergic to ragweed, taking blood thinners, caffeine-sensitive..." rows="4">' + (guidedState.sensitivities || '') + '</textarea>' +
      '<p class="guided-hint">Leave blank if none. This information helps Amber customize your blend safely.</p>' +
      '<div class="guided-actions">' +
        '<button class="guided-btn" onclick="guidedPrevStep()">\u2190 Back</button>' +
        '<button class="guided-btn primary" onclick="guidedSaveSensitivities()">See My Prescription \u2192</button>' +
      '</div>';
  }

  window.guidedSaveSensitivities = function() {
    var textarea = document.getElementById('guidedSensitivities');
    if (textarea) guidedState.sensitivities = textarea.value;
    buildGuidedRecommendation();
    guidedState.step = 5;
    updateGuidedContent();
  };

  // Build recommendation from symptoms + preferences
  function buildGuidedRecommendation() {
    // If user chose a specific style, map it to a form key
    var styleToForm = {
      'tea': 'loose-tea',
      'capsules': 'capsule',
      'balm': 'balm',
      'serum': 'serum',
      'tincture': 'tincture'
    };

    if (guidedState.preferredStyle && guidedState.preferredStyle !== 'no-preference') {
      var mappedForm = styleToForm[guidedState.preferredStyle] || null;
      if (mappedForm) {
        var formExplanations = window.RemedyFlow ? window.RemedyFlow.FORM_EXPLANATIONS : {};
        guidedState.recommendedForm = mappedForm;
        guidedState.recommendedFormLabel = formExplanations[mappedForm] || guidedState.preferredStyle;
      }
    } else {
      // Auto-recommend based on symptoms and timing
      var rec = window.RemedyFlow ? window.RemedyFlow.recommendForm(guidedState.symptoms) : { form: 'capsule', label: 'Capsules', explanation: '' };
      // Timing can influence form: evening + sleep/stress → tea; morning → capsule
      if (guidedState.timing === 'evening' && (guidedState.symptoms.indexOf('sleep') !== -1 || guidedState.symptoms.indexOf('stress') !== -1)) {
        rec = { form: 'loose-tea', label: 'Tea Blend', explanation: 'Tea Blend \u2014 perfect for a calming evening ritual' };
      } else if (guidedState.timing === 'morning' && guidedState.symptoms.indexOf('energy') !== -1) {
        rec = { form: 'capsule', label: 'Capsules', explanation: 'Capsules \u2014 convenient morning energy support' };
      }
      guidedState.recommendedForm = rec.form;
      guidedState.recommendedFormLabel = rec.explanation || rec.label;
    }

    var herbIds = window.RemedyFlow ? window.RemedyFlow.getRecommendedHerbs(guidedState.symptoms) : [];
    guidedState.recommendedHerbs = herbIds;

    var herbObjs = herbIds.map(function(id) {
      return (typeof BOTANICALS !== 'undefined') ? BOTANICALS.find(function(b) { return b.id === id; }) : null;
    }).filter(Boolean);
    guidedState.recommendedHerbObjs = herbObjs;
  }

  // Step 5: Your Herbal Prescription
  function renderGuidedPrescription() {
    var formExplanations = window.RemedyFlow ? window.RemedyFlow.FORM_EXPLANATIONS : {};
    var formExplanation = formExplanations[guidedState.recommendedForm] || guidedState.recommendedFormLabel;
    var herbs = guidedState.recommendedHerbObjs;

    // Get symptom labels
    var symptomLabels = guidedState.symptoms.map(function(s) {
      var opt = SYMPTOM_OPTIONS.find(function(o) { return o.id === s; });
      return opt ? (opt.icon + ' ' + opt.label) : s;
    });

    // Multiple symptom handling
    var multiSymptomHtml = '';
    if (guidedState.symptoms.length > 1) {
      multiSymptomHtml = '<div class="guided-multi-symptom">' +
        '<h4>Multiple Concerns Detected</h4>' +
        '<p>You selected ' + guidedState.symptoms.length + ' concerns. You can:</p>' +
        '<div class="guided-multi-options">' +
          '<button class="guided-option-btn wide ' + (guidedState.remedyMode !== 'separate' ? 'selected' : '') + '" onclick="guidedSetRemedyMode(\'combined\')">' +
            '<span class="guided-option-icon">\u{1F48A}</span>' +
            '<div class="guided-option-text"><span class="guided-option-label">One Combined Remedy</span>' +
            '<span class="guided-option-desc">All herbs in a single blend</span></div>' +
          '</button>' +
          '<button class="guided-option-btn wide ' + (guidedState.remedyMode === 'separate' ? 'selected' : '') + '" onclick="guidedSetRemedyMode(\'separate\')">' +
            '<span class="guided-option-icon">\u{1F4CB}</span>' +
            '<div class="guided-option-text"><span class="guided-option-label">Separate Remedies</span>' +
            '<span class="guided-option-desc">Individual remedy for each concern</span></div>' +
          '</button>' +
        '</div>' +
      '</div>';
    }

    return '<div class="guided-step-number">Step 5 of 6</div>' +
      '<h3>Your Herbal Prescription</h3>' +
      '<div class="guided-prescription-card">' +
        '<div class="guided-rx-badge">Recommended Remedy</div>' +
        '<div class="guided-rx-section"><strong>For:</strong> ' + symptomLabels.join(', ') + '</div>' +
        (guidedState.timing ? '<div class="guided-rx-section"><strong>Usage:</strong> ' + guidedState.timing.charAt(0).toUpperCase() + guidedState.timing.slice(1).replace('-', ' ') + '</div>' : '') +
        '<div class="guided-rx-section">' +
          '<strong>Recommended Form:</strong>' +
          '<div class="guided-rx-form">' + formExplanation + '</div>' +
        '</div>' +
        '<div class="guided-rx-section">' +
          '<strong>Recommended Herbs:</strong>' +
          '<div class="guided-herb-list">' +
            herbs.map(function(h) {
              return '<span class="guided-herb-pill">' + (h.emoji || '\u{1F33F}') + ' ' + h.name + '</span>';
            }).join('') +
          '</div>' +
        '</div>' +
        (guidedState.sensitivities ? '<div class="guided-rx-section"><strong>Sensitivities noted:</strong> ' + guidedState.sensitivities + '</div>' : '') +
      '</div>' +
      multiSymptomHtml +
      '<div class="guided-prescription-actions">' +
        '<button class="guided-btn primary" onclick="guidedAcceptRecommendation()">\u2714 Use Recommended Remedy</button>' +
        '<button class="guided-btn" onclick="guidedCustomizeHerbs()">\u270F Customize Herbs</button>' +
        '<button class="guided-btn" onclick="guidedExploreMore()">\u{1F50D} Explore More Herbs</button>' +
      '</div>' +
      '<div class="guided-actions">' +
        '<button class="guided-btn" onclick="guidedPrevStep()">\u2190 Back</button>' +
      '</div>';
  }

  window.guidedSetRemedyMode = function(mode) {
    guidedState.remedyMode = mode;
    updateGuidedContent();
  };

  window.guidedAcceptRecommendation = function() {
    guidedState.step = 6;
    updateGuidedContent();
  };

  window.guidedCustomizeHerbs = function() {
    // Store state and open the full advisor at herb selection step
    storeGuidedToFlow();
    closeGuidedFlow();
    openHerbalAdvisor();
    setTimeout(function() {
      if (typeof advisorState !== 'undefined') {
        advisorState.selectedGoals = guidedState.symptoms.slice();
        advisorState.step = 4;
        advisorState.selectedHerbs = guidedState.recommendedHerbs.slice();
        advisorState.recommendedHerbIds = guidedState.recommendedHerbs.slice();
        advisorState.selectedForm = guidedState.recommendedForm;
        if (typeof updateAdvisorContent === 'function') updateAdvisorContent();
      }
    }, 200);
  };

  window.guidedExploreMore = function() {
    storeGuidedToFlow();
    closeGuidedFlow();
    if (typeof showSection === 'function') showSection('herb-index');
  };

  // Step 6: Add to Cart
  function renderGuidedAddToCart() {
    var herbs = guidedState.recommendedHerbObjs;
    var formExplanations = window.RemedyFlow ? window.RemedyFlow.FORM_EXPLANATIONS : {};
    var formLabel = formExplanations[guidedState.recommendedForm] || guidedState.recommendedFormLabel;

    // Calculate price
    var formPrices = {
      'tea-bags': 12.99, 'loose-tea': 9.99, 'tincture': 24.99, 'balm': 18.99,
      'salve': 16.99, 'serum': 22.99, 'poultice': 14.99, 'capsule': 28.99
    };
    var basePrice = formPrices[guidedState.recommendedForm] || 14.99;
    var herbCost = herbs.reduce(function(sum, h) { return sum + (h.price || 0.23); }, 0);
    var total = basePrice + herbCost;

    var symptomLabels = guidedState.symptoms.map(function(s) {
      var opt = SYMPTOM_OPTIONS.find(function(o) { return o.id === s; });
      return opt ? opt.label : s;
    });

    return '<div class="guided-step-number">Step 6 of 6</div>' +
      '<h3>Your Remedy is Ready!</h3>' +
      '<p>Review your personalized remedy and add it to your cart.</p>' +
      '<div class="guided-prescription-card">' +
        '<div class="guided-rx-section"><strong>Form:</strong> ' + formLabel + '</div>' +
        '<div class="guided-rx-section"><strong>For:</strong> ' + symptomLabels.join(', ') + '</div>' +
        '<div class="guided-rx-section"><strong>Herbs:</strong> ' + herbs.map(function(h) { return h.name; }).join(', ') + '</div>' +
        (guidedState.sensitivities ? '<div class="guided-rx-section"><strong>Notes:</strong> ' + guidedState.sensitivities + '</div>' : '') +
        '<div class="guided-rx-pricing">' +
          '<div class="guided-price-row"><span>Base Price:</span><span>$' + basePrice.toFixed(2) + '</span></div>' +
          '<div class="guided-price-row"><span>Botanicals (' + herbs.length + '):</span><span>$' + herbCost.toFixed(2) + '</span></div>' +
          '<div class="guided-price-row total"><span>Total:</span><span>$' + total.toFixed(2) + '</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="guided-cart-actions">' +
        '<button class="guided-btn primary large" onclick="guidedAddToCart()">\u{1F6D2} Add Remedy to Cart</button>' +
        '<button class="guided-btn" onclick="guidedOpenBuilder()">\u{1F527} Open in Remedy Builder</button>' +
        '<button class="guided-btn" onclick="guidedCustomizeHerbs()">\u270F Modify Herbs</button>' +
        '<button class="guided-btn" onclick="guidedStartOver()">\u{1F504} Start Over</button>' +
        '<button class="guided-btn" onclick="guidedBuildAnother()">Build Another Remedy</button>' +
      '</div>';
  }

  window.guidedOpenBuilder = function() {
    // Open builder with everything pre-selected
    storeGuidedToFlow();
    window._pendingAdvisorHerbs = guidedState.recommendedHerbObjs;
    window._pendingAdvisorForm = guidedState.recommendedForm;
    closeGuidedFlow();
    if (typeof showSection === 'function') showSection('custom-formula');
    var formKey = guidedState.recommendedForm;
    if (formKey) {
      setTimeout(function() {
        var typeBtn = document.querySelector('.cc-type-btn[data-type="' + formKey + '"]');
        if (typeBtn) typeBtn.click();
      }, 150);
    }
  };

  window.guidedAddToCart = function() {
    var herbs = guidedState.recommendedHerbObjs;
    var formPrices = {
      'tea-bags': 12.99, 'loose-tea': 9.99, 'tincture': 24.99, 'balm': 18.99,
      'salve': 16.99, 'serum': 22.99, 'poultice': 14.99, 'capsule': 28.99
    };
    var formLabels = {
      'tea-bags': 'Handmade Tea Bags', 'loose-tea': 'Loose Leaf Custom Blend', 'tincture': 'Herbal Tincture',
      'balm': 'Herbal Balm', 'salve': 'Herbal Salve', 'serum': 'Botanical Serum',
      'poultice': 'Herbal Poultice', 'capsule': 'Herbal Capsules'
    };
    var formUnits = {
      'tea-bags': '20 Count', 'loose-tea': '1 oz', 'tincture': '1oz Tincture',
      'balm': '1oz Balm', 'salve': '1oz Salve', 'serum': '1oz Serum',
      'poultice': '2oz Poultice', 'capsule': '30 Capsules'
    };

    var form = guidedState.recommendedForm;
    var basePrice = formPrices[form] || 14.99;
    var herbCost = herbs.reduce(function(sum, h) { return sum + (h.price || 0.23); }, 0);
    var herbNames = herbs.map(function(h) { return h.name; }).join(', ');

    var symptomList = guidedState.symptoms.map(function(s) {
      var opt = SYMPTOM_OPTIONS.find(function(o) { return o.id === s; });
      return opt ? opt.label : s;
    }).join(', ');

    // Separate remedies mode
    if (guidedState.remedyMode === 'separate' && guidedState.symptoms.length > 1) {
      guidedAddSeparateRemedies(herbs, form, basePrice, formLabels, formUnits, symptomList);
      return;
    }

    var cartItem = {
      id: 'guided-' + Date.now(),
      name: 'Custom ' + (formLabels[form] || form),
      desc: (formUnits[form] || '') + ' | Guided Blend | ' + herbNames,
      herbs: herbNames,
      size: formUnits[form] || '',
      price: basePrice + herbCost,
      qty: 1,
      symptoms: symptomList,
      form: formLabels[form] || form
    };

    if (typeof window.addItemToCart === 'function') {
      window.addItemToCart(cartItem);
    } else {
      document.dispatchEvent(new CustomEvent('addToCart', { detail: cartItem }));
    }

    closeGuidedFlow();
    if (typeof showToast === 'function') {
      showToast('\u2726 Your guided remedy has been added to your cart!');
    }
  };

  function guidedAddSeparateRemedies(herbs, form, basePrice, formLabels, formUnits) {
    var herbRecommendations = typeof ADVISOR_DATA !== 'undefined' ? ADVISOR_DATA.herbRecommendations : {};
    var addedCount = 0;

    guidedState.symptoms.forEach(function(symptom, idx) {
      var symptomHerbIds = herbRecommendations[symptom] || [];
      var symptomHerbs = herbs.filter(function(h) {
        return symptomHerbIds.indexOf(h.id) !== -1;
      });
      if (symptomHerbs.length === 0) symptomHerbs = herbs;

      var opt = SYMPTOM_OPTIONS.find(function(o) { return o.id === symptom; });
      var symptomLabel = opt ? opt.label : symptom;
      var herbNames = symptomHerbs.map(function(h) { return h.name; }).join(', ');
      var herbCost = symptomHerbs.reduce(function(s, h) { return s + (h.price || 0.23); }, 0);

      var cartItem = {
        id: 'guided-' + Date.now() + '-' + idx,
        name: symptomLabel + ' ' + (formLabels[form] || form),
        desc: (formUnits[form] || '') + ' | ' + symptomLabel + ' | ' + herbNames,
        herbs: herbNames,
        size: formUnits[form] || '',
        price: basePrice + herbCost,
        qty: 1,
        symptoms: symptomLabel,
        form: formLabels[form] || form
      };

      if (typeof window.addItemToCart === 'function') {
        window.addItemToCart(cartItem);
      }
      addedCount++;
    });

    closeGuidedFlow();
    if (typeof showToast === 'function') {
      showToast('\u2726 ' + addedCount + ' separate remedies added to your cart!');
    }
  }

  window.guidedStartOver = function() {
    guidedState.step = 1;
    guidedState.symptoms = [];
    guidedState.timing = null;
    guidedState.preferredStyle = null;
    guidedState.sensitivities = '';
    guidedState.quizAnswers = {};
    updateGuidedContent();
  };

  window.guidedBuildAnother = function() {
    guidedState = {
      step: 1,
      symptoms: [],
      timing: null,
      preferredStyle: null,
      sensitivities: '',
      quizAnswers: {},
      recommendedForm: null,
      recommendedFormLabel: '',
      recommendedHerbs: [],
      recommendedHerbObjs: []
    };
    updateGuidedContent();
  };

  function storeGuidedToFlow() {
    if (window.RemedyFlow) {
      window.RemedyFlow.updateState({
        symptoms: guidedState.symptoms,
        selectedHerbs: guidedState.recommendedHerbs,
        recommendedHerbs: guidedState.recommendedHerbs,
        recommendedForm: guidedState.recommendedForm,
        finalHerbs: guidedState.recommendedHerbs
      });
    }
  }

  window.guidedNextStep = function() {
    if (guidedState.step < 6) {
      guidedState.step++;
      updateGuidedContent();
      // Persist quiz state and push history for back button
      if (typeof persistQuizStep === 'function') persistQuizStep(guidedState.step, guidedState);
      if (typeof persistSelectedSymptoms === 'function') persistSelectedSymptoms(guidedState.symptoms);
      try { history.pushState({ section: 'guided-flow', step: guidedState.step }, '', ''); } catch(e) {}
    }
  };

  window.guidedPrevStep = function() {
    if (guidedState.step > 1) {
      guidedState.step--;
      updateGuidedContent();
      if (typeof persistQuizStep === 'function') persistQuizStep(guidedState.step, guidedState);
    }
  };

  window.closeGuidedFlow = function() {
    var overlay = document.getElementById('guided-flow-overlay');
    if (overlay) overlay.remove();
    // Clear persisted quiz state on explicit close
    try { sessionStorage.removeItem('aa_quizStep'); } catch(e) {}
  };


  // ============================================================
  // 2. FLOATING CART FAB
  // ============================================================

  function createFloatingCartFab() {
    if (document.getElementById('floatingCartFab')) return;
    var fab = document.createElement('button');
    fab.id = 'floatingCartFab';
    fab.className = 'floating-cart-fab';
    fab.innerHTML = '\u{1F6D2} Add Remedy to Cart';
    fab.addEventListener('click', function() {
      var addBtn = document.getElementById('ccAddToCartBtn');
      var step3 = document.getElementById('ccStep3');
      if (addBtn && step3 && step3.style.display !== 'none') {
        addBtn.click();
        return;
      }
      var step2 = document.getElementById('ccStep2');
      var doneBtn = document.getElementById('ccDoneHerbsBtn');
      if (step2 && step2.style.display !== 'none' && doneBtn) {
        doneBtn.click();
        return;
      }
      var cartBtn = document.getElementById('cartBtn');
      if (cartBtn) cartBtn.click();
    });
    document.body.appendChild(fab);
  }

  function updateFloatingCartVisibility() {
    var fab = document.getElementById('floatingCartFab');
    if (!fab) return;
    var customFormula = document.getElementById('custom-formula');
    var herbIndex = document.getElementById('herb-index');
    var isOnBuilderPage = customFormula && customFormula.classList.contains('active');
    var isOnGrimoire = herbIndex && herbIndex.classList.contains('active');
    if (isOnBuilderPage || isOnGrimoire) {
      fab.classList.add('visible');
    } else {
      fab.classList.remove('visible');
    }
  }

  // ============================================================
  // 3. ACTION BUTTONS AFTER COMBINED REMEDY SELECTION
  // ============================================================

  var origSetRemedyMode = window._setRemedyMode;
  window._setRemedyMode = function(mode) {
    if (origSetRemedyMode) origSetRemedyMode(mode);
    setTimeout(function() {
      injectRemedyModeActions(mode);
    }, 50);
  };

  function injectRemedyModeActions(mode) {
    var panel = document.getElementById('ccFlowContext');
    if (!panel) return;

    var existing = panel.querySelector('.rf-action-buttons');
    if (existing) existing.remove();

    var actionsDiv = document.createElement('div');
    actionsDiv.className = 'rf-action-buttons';

    if (mode === 'combined') {
      actionsDiv.innerHTML =
        '<button class="rf-action-btn primary" onclick="proceedToBuildRemedy()">Build This Remedy</button>' +
        '<button class="rf-action-btn" onclick="continueExploringHerbs()">Continue Exploring Herbs</button>' +
        '<button class="rf-action-btn" onclick="quickAddRemedyToCart()">Add Remedy to Cart</button>' +
        '<button class="rf-action-btn" onclick="startNewRemedy()">Start a New Remedy</button>' +
        '<button class="rf-action-btn" onclick="retakeQuiz()">Retake Quiz</button>';
    } else {
      actionsDiv.innerHTML =
        '<button class="rf-action-btn primary" onclick="proceedToBuildRemedy()">Build These Remedies</button>' +
        '<button class="rf-action-btn" onclick="continueExploringHerbs()">Continue Exploring Herbs</button>' +
        '<button class="rf-action-btn" onclick="startNewRemedy()">Start a New Remedy</button>' +
        '<button class="rf-action-btn" onclick="retakeQuiz()">Retake Quiz</button>';
    }

    panel.appendChild(actionsDiv);
  }

  window.proceedToBuildRemedy = function() {
    var flowState = window.RemedyFlow ? window.RemedyFlow.getState() : {};
    var formKey = flowState.recommendedForm;
    if (formKey) {
      var typeBtn = document.querySelector('.cc-type-btn[data-type="' + formKey + '"]');
      if (typeBtn) {
        typeBtn.click();
        return;
      }
    }
    var step1 = document.getElementById('ccStep1');
    if (step1) step1.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window.continueExploringHerbs = function() {
    if (typeof showSection === 'function') showSection('herb-index');
  };

  window.quickAddRemedyToCart = function() {
    var flowState = window.RemedyFlow ? window.RemedyFlow.getState() : {};
    var herbIds = flowState.selectedHerbs || flowState.recommendedHerbs || [];
    if (herbIds.length === 0) {
      if (typeof showToast === 'function') showToast('Please select herbs before adding to cart.');
      return;
    }

    var herbs = herbIds.map(function(id) {
      return (typeof BOTANICALS !== 'undefined') ? BOTANICALS.find(function(b) { return b.id === id; }) : null;
    }).filter(Boolean);

    var form = flowState.recommendedForm || 'capsule';
    var formPrices = {
      'tea-bags': 12.99, 'loose-tea': 9.99, 'tincture': 24.99, 'balm': 18.99,
      'salve': 16.99, 'serum': 22.99, 'poultice': 14.99, 'capsule': 28.99
    };
    var formLabels = {
      'tea-bags': 'Handmade Tea Bags', 'loose-tea': 'Loose Leaf Custom Blend', 'tincture': 'Herbal Tincture',
      'balm': 'Herbal Balm', 'salve': 'Herbal Salve', 'serum': 'Botanical Serum',
      'poultice': 'Herbal Poultice', 'capsule': 'Herbal Capsules'
    };
    var formUnits = {
      'tea-bags': '20 Count', 'loose-tea': '1 oz', 'tincture': '1oz Tincture',
      'balm': '1oz Balm', 'salve': '1oz Salve', 'serum': '1oz Serum',
      'poultice': '2oz Poultice', 'capsule': '30 Capsules'
    };

    var basePrice = formPrices[form] || 14.99;
    var herbCost = herbs.reduce(function(sum, h) { return sum + (h.price || 0.23); }, 0);
    var herbNames = herbs.map(function(h) { return h.name; }).join(', ');

    var goalLabels = {};
    if (typeof ADVISOR_DATA !== 'undefined') {
      ADVISOR_DATA.goals.forEach(function(g) { goalLabels[g.id] = g.label; });
    }
    var symptoms = (flowState.symptoms || []).map(function(s) { return goalLabels[s] || s; }).join(', ');

    var cartItem = {
      id: 'quick-' + Date.now(),
      name: 'Custom ' + (formLabels[form] || form),
      desc: (formUnits[form] || '') + ' | Quick Blend | ' + herbNames,
      herbs: herbNames,
      size: formUnits[form] || '',
      price: basePrice + herbCost,
      qty: 1,
      symptoms: symptoms,
      form: formLabels[form] || form
    };

    if (typeof window.addItemToCart === 'function') {
      window.addItemToCart(cartItem);
    }
    if (typeof showToast === 'function') {
      showToast('\u2726 Remedy added to cart!');
    }
  };

  window.startNewRemedy = function() {
    if (window.RemedyFlow) window.RemedyFlow.clearState();
    if (typeof showSection === 'function') showSection('custom-formula');
    var step1 = document.getElementById('ccStep1');
    var step2 = document.getElementById('ccStep2');
    var step3 = document.getElementById('ccStep3');
    if (step1) step1.style.display = 'block';
    if (step2) step2.style.display = 'none';
    if (step3) step3.style.display = 'none';
    var flowPanel = document.getElementById('ccFlowContext');
    if (flowPanel) flowPanel.style.display = 'none';
  };

  window.retakeQuiz = function() {
    if (window.RemedyFlow) window.RemedyFlow.clearState();
    if (typeof openHerbalAdvisor === 'function') openHerbalAdvisor();
  };


  // ============================================================
  // 4. HIDE QUIZ PROMPTS WHEN IN QUIZ/BUILDER FLOW
  // ============================================================

  function updateQuizPromptVisibility() {
    var flowState = window.RemedyFlow ? window.RemedyFlow.getState() : {};
    var inFlow = flowState.symptoms && flowState.symptoms.length > 0;
    var advisorOpen = !!document.getElementById('herbal-advisor-modal');
    var guidedOpen = !!document.getElementById('guided-flow-overlay');
    var shouldHide = inFlow || advisorOpen || guidedOpen;

    // Hide quiz callout inside the builder
    var quizCallout = document.querySelector('.cc-quiz-callout');
    if (quizCallout) {
      quizCallout.style.display = shouldHide ? 'none' : '';
    }

    // Also hide the home-page quiz CTA sections when builder/advisor is active
    var customFormula = document.getElementById('custom-formula');
    var isOnBuilder = customFormula && customFormula.classList.contains('active');
    if (isOnBuilder && inFlow) {
      var homeQuizCta = document.querySelector('.herbal-quiz-cta-section');
      if (homeQuizCta) homeQuizCta.style.display = 'none';
      var matchSection = document.querySelector('.herbal-match-section');
      if (matchSection) matchSection.style.display = 'none';
    }
  }


  // ============================================================
  // 5. ADD ACTION BUTTONS TO BUILDER STEPS
  // ============================================================

  function injectStepActions() {
    // Step 2 secondary actions
    var step2Actions = document.querySelector('#ccStep2 .cc-herb-actions');
    if (step2Actions && !step2Actions.querySelector('.rf-step-secondary-actions')) {
      var secondaryDiv = document.createElement('div');
      secondaryDiv.className = 'rf-step-secondary-actions rf-action-buttons';
      secondaryDiv.style.marginTop = '12px';
      secondaryDiv.innerHTML =
        '<button class="rf-action-btn" onclick="startNewRemedy()">Start a New Remedy</button>' +
        '<button class="rf-action-btn" onclick="retakeQuiz()">Retake Quiz</button>' +
        '<button class="rf-action-btn" onclick="continueExploringHerbs()">Explore More Herbs</button>';
      step2Actions.parentNode.insertBefore(secondaryDiv, step2Actions.nextSibling);
    }

    // Step 3 secondary actions
    var step3Actions = document.querySelector('#ccStep3 .cc-final-actions');
    if (step3Actions && !step3Actions.querySelector('.rf-step-secondary-actions')) {
      var secondaryDiv3 = document.createElement('div');
      secondaryDiv3.className = 'rf-step-secondary-actions rf-action-buttons';
      secondaryDiv3.style.marginTop = '12px';
      secondaryDiv3.innerHTML =
        '<button class="rf-action-btn" onclick="continueExploringHerbs()">Explore More Herbs</button>' +
        '<button class="rf-action-btn" onclick="startNewRemedy()">Start a New Remedy</button>' +
        '<button class="rf-action-btn" onclick="retakeQuiz()">Retake Quiz</button>' +
        '<button class="rf-action-btn" onclick="startGuidedExperience()">Build Another Remedy</button>';
      step3Actions.parentNode.insertBefore(secondaryDiv3, step3Actions.nextSibling);
    }
  }


  // ============================================================
  // 6. INITIALIZATION & EVENT LISTENERS
  // ============================================================

  function init() {
    createFloatingCartFab();

    document.addEventListener('sectionChanged', function() {
      setTimeout(function() {
        updateFloatingCartVisibility();
        updateQuizPromptVisibility();
        injectStepActions();
      }, 100);
    });

    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        m.addedNodes.forEach(function(node) {
          if (node.id === 'herbal-advisor-modal' || node.id === 'guided-flow-overlay') {
            updateQuizPromptVisibility();
          }
        });
        m.removedNodes.forEach(function(node) {
          if (node.id === 'herbal-advisor-modal' || node.id === 'guided-flow-overlay') {
            updateQuizPromptVisibility();
          }
        });
      });
    });
    observer.observe(document.body, { childList: true });

    updateFloatingCartVisibility();
    updateQuizPromptVisibility();
    injectStepActions();

    var flowPanel = document.getElementById('ccFlowContext');
    if (flowPanel) {
      var flowObserver = new MutationObserver(function() {
        var modeSection = flowPanel.querySelector('.rf-remedy-mode');
        var actionBtns = flowPanel.querySelector('.rf-action-buttons');
        if (modeSection && !actionBtns) {
          var activeBtn = flowPanel.querySelector('.rf-mode-btn.active');
          if (activeBtn) {
            var mode = activeBtn.textContent.indexOf('Combined') !== -1 ? 'combined' : 'separate';
            injectRemedyModeActions(mode);
          }
        }
      });
      flowObserver.observe(flowPanel, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
