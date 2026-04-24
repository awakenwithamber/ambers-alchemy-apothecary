// ============================================================
// CUSTOM SOAP BUILDER — Amber's Alchemy Apothecary
// Two paths: GUIDED (one question per screen, ends with a
// suggested blend) and MANUAL (choose every ingredient). Both
// end on the same final result screen with edit, add to cart,
// Lunna, and booking CTAs.
// ============================================================

(function() {
  'use strict';

  // Stage: 'path' | 'guided' | 'manual' | 'result'
  var sbStage = 'path';
  var sbStep = 0;                // 1..N inside guided/manual stages
  var sbPath = null;             // 'guided' | 'manual'

  var sbSelections = {
    bases: [],
    scents: [],
    benefits: [],
    addons: [],
    // Guided-only context (stored alongside manual selections)
    intention: null,
    scentFamily: null,
    skinGoal: null,
    energy: null,
  };

  var SB_BASE_PRICE = 13.99;

  var SB_DATA = {
    bases: [
      { id: 'clear-top', name: 'Botanical Clear Top Bar', desc: 'Vegetable glycerin + castor oil. Clear, radiant, and botanical.', price: 0, emoji: '✨' },
      { id: 'creamy-nourishing', name: 'Creamy Nourishing Bar', desc: 'Shea butter + goat milk. Rich, velvety, deeply moisturizing.', price: 0, emoji: '🧈' },
      { id: 'layered', name: 'Layered Bar (Clear Top + Creamy Base)', desc: 'Clear glycerin top over a creamy shea + goat milk base.', price: 0, emoji: '🌗' }
    ],
    scents: [
      { id: 'lavender-fairy-dream', name: 'Lavender Fairy Dream', desc: 'Soft floral • calming • dreamy', price: 0, emoji: '💜', family: 'floral' },
      { id: 'gaias-rose',          name: "Gaia's Rose",           desc: 'Romantic • floral • heart-opening',  price: 0, emoji: '🌹', family: 'floral' },
      { id: 'eucalyptus-mint-spa', name: 'Eucalyptus Mint Spa',   desc: 'Fresh • cooling • clean',            price: 0, emoji: '🌿', family: 'fresh' },
      { id: 'warm-cinnamon',       name: 'Warm Cinnamon Comfort', desc: 'Cozy • spicy • grounding',           price: 0, emoji: '🍂', family: 'sweet' },
      { id: 'orange-lily',         name: 'Orange Lily Goddess',   desc: 'Bright • citrus • radiant',          price: 0, emoji: '🌺', family: 'citrus' },
      { id: 'citrus-goddess',      name: 'Citrus Goddess Glow',   desc: 'Sweet citrus • uplifting • energizing', price: 0, emoji: '🍊', family: 'citrus' },
      { id: 'sacred-forest',       name: 'Sacred Forest Ritual',  desc: 'Earthy • resinous • grounding',      price: 0, emoji: '🌲', family: 'earthy' },
      { id: 'fresh-mountain',      name: 'Fresh Mountain Air',    desc: 'Clean • herbal • awakening',         price: 0, emoji: '🏔️', family: 'fresh' },
      { id: 'sunlit-garden',       name: 'Sunlit Garden Bloom',   desc: 'Floral • soft • feminine',           price: 0, emoji: '🌸', family: 'floral' }
    ],
    benefits: [
      { id: 'relaxation', name: 'Relaxation',    desc: 'Soothes stress & tension', price: 0, emoji: '🧘' },
      { id: 'skin-healing', name: 'Skin Healing', desc: 'Repairs & restores',      price: 0, emoji: '💚' },
      { id: 'exfoliation', name: 'Gentle Exfoliation', desc: 'Reveals fresh skin', price: 0, emoji: '✨' },
      { id: 'moisturizing', name: 'Deep Moisture', desc: 'Hydrates intensely',    price: 0, emoji: '💧' },
      { id: 'energizing',   name: 'Energizing',   desc: 'Uplifts & revitalizes',  price: 0, emoji: '⚡' },
      { id: 'anti-aging',   name: 'Anti-Aging',   desc: 'Firms & brightens',      price: 0.50, emoji: '🌟' },
      { id: 'detox',        name: 'Detox & Cleanse', desc: 'Purifies skin deeply', price: 0, emoji: '🫧' },
      { id: 'hormonal',     name: 'Hormonal Balance', desc: 'Supports body balance', price: 0, emoji: '🌸' }
    ],
    addons: [
      { id: 'rose-petals',    name: 'Rose Petals',       desc: 'Pink, romantic, skin-softening', price: 0.75, emoji: '🌹', tag: 'rose' },
      { id: 'lavender-buds',  name: 'Lavender Buds',     desc: 'Calming, classic aromatherapy',   price: 0.75, emoji: '💜', tag: 'lavender' },
      { id: 'chamomile',      name: 'Chamomile Flowers', desc: 'Soft yellow, soothing',           price: 0.75, emoji: '🌼', tag: 'chamomile' },
      { id: 'hibiscus',       name: 'Hibiscus Petals',   desc: 'Deep pink/red, vibrant color',    price: 0.75, emoji: '🌺', tag: 'floral' },
      { id: 'calendula',      name: 'Calendula Petals',  desc: 'Golden/orange, healing',          price: 0.75, emoji: '🌻', tag: 'calendula' },
      { id: 'mint-leaves',    name: 'Dried Mint Leaves', desc: 'Fresh green, invigorating',       price: 0.50, emoji: '🌿', tag: 'mint' },
      { id: 'rosemary',       name: 'Rosemary',          desc: 'Herbal texture, stimulating',     price: 0.50, emoji: '🌱', tag: 'rosemary' },
      { id: 'nettle-leaf',    name: 'Nettle Leaf Powder', desc: 'Earthy green, mineral-rich',     price: 0.50, emoji: '🍃', tag: 'earthy' },
      { id: 'spirulina',      name: 'Spirulina Powder',   desc: 'Vibrant green color',            price: 0.75, emoji: '💚', tag: 'earthy' },
      { id: 'cinnamon',       name: 'Cinnamon Powder',    desc: 'Warm tone, stimulating',         price: 0.50, emoji: '🍂', tag: 'warm' },
      { id: 'clove',          name: 'Clove Powder',       desc: 'Deep spice look, warming',       price: 0.50, emoji: '🔥', tag: 'warm' },
      { id: 'butterfly-pea',  name: 'Butterfly Pea Flower', desc: 'Blue/purple tones, luxurious', price: 1.00, emoji: '🦋', tag: 'floral' },
      { id: 'orange-peel',    name: 'Orange Peel (dried)', desc: 'Citrus texture, vitamin C',     price: 0.50, emoji: '🍊', tag: 'citrus' }
    ]
  };

  // ============ GUIDED FLOW — 5 single-question screens ============
  var GUIDED_QUESTIONS = [
    {
      key: 'intention',
      title: 'What are you creating this soap for?',
      hint: 'Pick whatever feels closest — this shapes the whole blend.',
      options: [
        { id: 'rest',       label: 'Rest & calm',       emoji: '🌙' },
        { id: 'softness',   label: 'Skin softness',     emoji: '💧' },
        { id: 'energy',     label: 'Energy',            emoji: '⚡' },
        { id: 'romance',    label: 'Romance / self-love', emoji: '💗' },
        { id: 'grounding',  label: 'Grounding',         emoji: '🌲' },
        { id: 'gift',       label: 'A gift',            emoji: '🎁' },
        { id: 'not-sure',   label: "I'm not sure",      emoji: '✨' }
      ]
    },
    {
      key: 'scentFamily',
      title: 'What scent family feels best?',
      hint: 'Trust your nose — this is the feeling you want when you pick up the bar.',
      options: [
        { id: 'floral',   label: 'Floral',        emoji: '🌸' },
        { id: 'herbal',   label: 'Herbal',        emoji: '🌿' },
        { id: 'citrus',   label: 'Citrus',        emoji: '🍊' },
        { id: 'earthy',   label: 'Earthy',        emoji: '🌲' },
        { id: 'sweet',    label: 'Sweet',         emoji: '🍯' },
        { id: 'fresh',    label: 'Fresh / clean', emoji: '💨' },
        { id: 'surprise', label: 'Surprise me',   emoji: '✨' }
      ]
    },
    {
      key: 'skinGoal',
      title: 'What skin goal matters most?',
      hint: 'Your bar can support one goal beautifully.',
      options: [
        { id: 'moisturizing', label: 'Moisturizing',        emoji: '💧' },
        { id: 'sensitive',    label: 'Sensitive skin',      emoji: '🌱' },
        { id: 'exfoliation',  label: 'Gentle exfoliation',  emoji: '✨' },
        { id: 'glow',         label: 'Glow',                emoji: '🌟' },
        { id: 'softness',     label: 'Softness',            emoji: '🧈' },
        { id: 'daily',        label: 'Daily cleansing',     emoji: '🫧' }
      ]
    },
    {
      key: 'botanical',
      title: 'What botanicals are you drawn to?',
      hint: 'Pick the one that speaks loudest — we can weave others in.',
      options: [
        { id: 'lavender',  label: 'Lavender',        emoji: '💜' },
        { id: 'rose',      label: 'Rose',            emoji: '🌹' },
        { id: 'calendula', label: 'Calendula',       emoji: '🌻' },
        { id: 'chamomile', label: 'Chamomile',       emoji: '🌼' },
        { id: 'rosemary',  label: 'Rosemary',        emoji: '🌱' },
        { id: 'mint',      label: 'Mint',            emoji: '🌿' },
        { id: 'citrus',    label: 'Citrus',          emoji: '🍊' },
        { id: 'amber',     label: 'Let Amber choose', emoji: '✨' }
      ]
    },
    {
      key: 'energy',
      title: 'What energy should the soap carry?',
      hint: 'Intention matters — this is the ritual thread woven through the bar.',
      options: [
        { id: 'peace',      label: 'Peace',       emoji: '☮️' },
        { id: 'protection', label: 'Protection',  emoji: '🛡️' },
        { id: 'confidence', label: 'Confidence',  emoji: '🔥' },
        { id: 'love',       label: 'Love',        emoji: '💗' },
        { id: 'clarity',    label: 'Clarity',     emoji: '💎' },
        { id: 'renewal',    label: 'Renewal',     emoji: '🌱' },
        { id: 'abundance',  label: 'Abundance',   emoji: '🌾' }
      ]
    }
  ];

  // Map guided answers onto the underlying SB_DATA so we can price,
  // summarise and add to cart just like the manual path.
  function applyGuidedToSelections() {
    // Intention → primary benefit
    var intentionBenefit = {
      rest: 'relaxation', softness: 'moisturizing', energy: 'energizing',
      romance: 'skin-healing', grounding: 'relaxation', gift: 'moisturizing',
      'not-sure': 'moisturizing'
    };
    // Skin goal → additional benefit
    var skinBenefit = {
      moisturizing: 'moisturizing', sensitive: 'skin-healing',
      exfoliation: 'exfoliation', glow: 'anti-aging',
      softness: 'moisturizing', daily: 'skin-healing'
    };
    // Scent family → chosen scent profile
    var familyScent = {
      floral: 'lavender-fairy-dream', herbal: 'eucalyptus-mint-spa',
      citrus: 'citrus-goddess', earthy: 'sacred-forest',
      sweet: 'warm-cinnamon', fresh: 'fresh-mountain',
      surprise: 'sunlit-garden'
    };
    // Botanical → add-on
    var botanicalAddon = {
      lavender: 'lavender-buds', rose: 'rose-petals',
      calendula: 'calendula', chamomile: 'chamomile',
      rosemary: 'rosemary', mint: 'mint-leaves',
      citrus: 'orange-peel', amber: 'rose-petals'
    };

    // Default base based on intention
    var baseByIntention = {
      rest: 'layered', softness: 'creamy-nourishing', energy: 'clear-top',
      romance: 'layered', grounding: 'creamy-nourishing', gift: 'layered',
      'not-sure': 'layered'
    };

    sbSelections.bases   = [ baseByIntention[sbSelections.intention] || 'layered' ];
    sbSelections.scents  = [ familyScent[sbSelections.scentFamily] || 'lavender-fairy-dream' ];
    var benefits = [];
    if (intentionBenefit[sbSelections.intention]) benefits.push(intentionBenefit[sbSelections.intention]);
    if (skinBenefit[sbSelections.skinGoal] && benefits.indexOf(skinBenefit[sbSelections.skinGoal]) === -1) {
      benefits.push(skinBenefit[sbSelections.skinGoal]);
    }
    sbSelections.benefits = benefits;
    sbSelections.addons   = [ botanicalAddon[sbSelections.botanical] || 'lavender-buds' ];
  }

  // Build a friendly soap name from the guided/manual selections.
  function deriveSoapName() {
    if (sbPath === 'guided' && sbSelections.energy) {
      var energyName = {
        peace: 'Peace', protection: 'Protection Ritual',
        confidence: 'Confidence', love: 'Heart Opener',
        clarity: 'Clarity', renewal: 'Renewal', abundance: 'Abundance'
      }[sbSelections.energy];
      var scentItem = sbSelections.scents[0] && getItemByKey('scents', sbSelections.scents[0]);
      if (energyName && scentItem) return scentItem.name + ' — ' + energyName + ' Bar';
    }
    if (sbSelections.scents.length > 0) {
      var names = sbSelections.scents.map(function(id) { var i = getItemByKey('scents', id); return i ? i.name : id; });
      return names.join(' & ') + ' Custom Soap';
    }
    return 'Custom Soap';
  }

  // ============ HELPERS ============

  function renderOptions(containerId, items, selectionKey) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = items.map(function(item) {
      var selected = sbSelections[selectionKey].indexOf(item.id) !== -1;
      return '<button type="button" class="sb-option-btn' + (selected ? ' selected' : '') + '" data-id="' + item.id + '" data-key="' + selectionKey + '">' +
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
        if (idx === -1) { sbSelections[key].push(id); this.classList.add('selected'); }
        else { sbSelections[key].splice(idx, 1); this.classList.remove('selected'); }
        updateLiveSummary();
        updateActionBar();
      });
    });
  }

  function getItemByKey(key, id) {
    return SB_DATA[key].find(function(d) { return d.id === id; });
  }

  function calcPrice() {
    var total = SB_BASE_PRICE;
    ['bases', 'scents', 'benefits', 'addons'].forEach(function(key) {
      sbSelections[key].forEach(function(id) {
        var item = getItemByKey(key, id);
        if (item) total += item.price;
      });
    });
    return total;
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

  // ============ PROGRESS BAR ============

  var MANUAL_STEPS = [
    { key: 1, label: 'Bar' },
    { key: 2, label: 'Scent' },
    { key: 3, label: 'Benefits' },
    { key: 4, label: 'Botanicals' },
    { key: 5, label: 'Review' }
  ];

  function renderProgress() {
    var wrap = document.getElementById('sbProgressBar');
    if (!wrap) return;
    if (sbStage === 'path') { wrap.style.display = 'none'; return; }
    wrap.style.display = '';
    var steps, activeIdx;
    if (sbStage === 'guided') {
      steps = GUIDED_QUESTIONS.map(function(q, i) { return { key: i + 1, label: q.title.split(' ')[1] || 'Step' }; });
      steps.push({ key: steps.length + 1, label: 'Result' });
      activeIdx = sbStep;
    } else if (sbStage === 'manual') {
      steps = MANUAL_STEPS;
      activeIdx = sbStep;
    } else { // result
      steps = (sbPath === 'guided')
        ? GUIDED_QUESTIONS.map(function(q, i) { return { key: i + 1, label: 'Q' + (i + 1) }; }).concat([{ key: 99, label: 'Result' }])
        : MANUAL_STEPS;
      activeIdx = steps.length;
    }
    wrap.innerHTML = steps.map(function(s, i) {
      var cls = 'sb-progress-step';
      if (i + 1 === activeIdx) cls += ' active';
      else if (i + 1 < activeIdx) cls += ' completed';
      return '<div class="' + cls + '"><span>' + (i + 1) + '</span> ' + s.label + '</div>';
    }).join('');
  }

  // ============ NAVIGATION ============

  function hideAllSteps() {
    document.querySelectorAll('.soap-builder-body .sb-step').forEach(function(s) { s.classList.remove('active'); });
  }

  function showStep(id) {
    hideAllSteps();
    var el = document.getElementById(id);
    if (el) el.classList.add('active');
  }

  function goToPath() {
    sbStage = 'path';
    sbPath = null;
    sbStep = 0;
    showStep('sbStepPath');
    renderProgress();
    document.getElementById('sbLiveSummaryWrap').style.display = 'none';
    updateActionBar();
  }

  function startGuided() {
    sbPath = 'guided';
    sbStage = 'guided';
    sbStep = 1;
    document.getElementById('sbLiveSummaryWrap').style.display = 'none';
    renderGuidedStep();
  }

  function startManual() {
    sbPath = 'manual';
    sbStage = 'manual';
    sbStep = 1;
    document.getElementById('sbLiveSummaryWrap').style.display = '';
    renderManualStep();
  }

  function renderGuidedStep() {
    showStep('sbStepGuided');
    var q = GUIDED_QUESTIONS[sbStep - 1];
    document.getElementById('sbGuidedQuestion').textContent = q.title;
    document.getElementById('sbGuidedHint').textContent = q.hint;
    var grid = document.getElementById('sbGuidedOptions');
    var current = sbSelections[q.key];
    grid.innerHTML = q.options.map(function(opt) {
      var selected = current === opt.id;
      return '<button type="button" class="sb-option-btn sb-guided-opt' + (selected ? ' selected' : '') + '" data-id="' + opt.id + '">' +
        '<span class="sb-opt-emoji">' + opt.emoji + '</span>' +
        '<span class="sb-opt-name">' + opt.label + '</span>' +
      '</button>';
    }).join('');
    grid.querySelectorAll('.sb-guided-opt').forEach(function(btn) {
      btn.addEventListener('click', function() {
        sbSelections[q.key] = this.dataset.id;
        grid.querySelectorAll('.sb-guided-opt').forEach(function(b) { b.classList.remove('selected'); });
        this.classList.add('selected');
        updateActionBar();
      });
    });
    renderProgress();
    updateActionBar();
  }

  function renderManualStep() {
    showStep('sbStep' + sbStep);
    if (sbStep === 1) renderOptions('sbBaseOptions', SB_DATA.bases, 'bases');
    if (sbStep === 2) renderOptions('sbScentOptions', SB_DATA.scents, 'scents');
    if (sbStep === 3) renderOptions('sbBenefitOptions', SB_DATA.benefits, 'benefits');
    if (sbStep === 4) renderOptions('sbAddonOptions', SB_DATA.addons, 'addons');
    renderProgress();
    updateLiveSummary();
    updateActionBar();
  }

  function goToResult() {
    sbStage = 'result';
    if (sbPath === 'guided') applyGuidedToSelections();
    showStep('sbStep5');
    document.getElementById('sbLiveSummaryWrap').style.display = '';
    updateLiveSummary();
    renderResult();
    renderProgress();
    updateActionBar();
  }

  // ============ RESULT / REVIEW SCREEN ============

  function renderResult() {
    var panel = document.getElementById('sbReviewPanel');
    var suggBox = document.getElementById('sbSuggestionBox');
    var titleEl = document.getElementById('sbResultTitle');
    if (!panel) return;

    var soapName = deriveSoapName();
    if (titleEl) titleEl.textContent = '✦ ' + soapName;

    var cats = [
      { key: 'bases',    label: 'Bar Type',      icon: '🧴' },
      { key: 'scents',   label: 'Scent Profile', icon: '🌸' },
      { key: 'benefits', label: 'Skin Benefits', icon: '✨' },
      { key: 'addons',   label: 'Botanicals & Color', icon: '🌿' }
    ];

    var html = '<div class="sb-review-grid">';
    if (sbPath === 'guided') {
      var intentionLabels = {
        rest: 'Rest & calm', softness: 'Skin softness', energy: 'Energy',
        romance: 'Romance / self-love', grounding: 'Grounding', gift: 'A gift',
        'not-sure': "Let Amber decide"
      };
      html += '<div class="sb-review-group"><h4>💫 Intention</h4><p>' +
        (intentionLabels[sbSelections.intention] || '—') +
        (sbSelections.energy ? ' • ' + sbSelections.energy : '') +
        '</p></div>';
    }
    cats.forEach(function(cat) {
      html += '<div class="sb-review-group"><h4>' + cat.icon + ' ' + cat.label + '</h4>';
      if (sbSelections[cat.key].length === 0) {
        html += '<p class="sb-review-none">— none —</p>';
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

    if (suggBox) {
      var tips = [];
      if (sbPath === 'guided') {
        tips.push('Amber blended this based on your intention, scent family, skin goal, favorite botanical, and the energy you chose.');
      } else if (sbSelections.bases.length === 0) {
        tips.push('Tip: most customers love the Layered Bar — it gives a beautiful botanical look and deep hydration.');
      }
      if (tips.length) { suggBox.innerHTML = '<h4>✦ A note from Amber</h4><p>' + tips.join(' ') + '</p>'; suggBox.style.display = ''; }
      else suggBox.style.display = 'none';
    }
  }

  // ============ ACTION BAR ============

  function show(el) { if (el) el.style.display = ''; }
  function hide(el) { if (el) el.style.display = 'none'; }

  function currentGuidedAnswered() {
    if (sbStage !== 'guided') return false;
    var q = GUIDED_QUESTIONS[sbStep - 1];
    return !!(q && sbSelections[q.key]);
  }
  function currentManualAnswered() {
    if (sbStage !== 'manual') return false;
    var keyByStep = { 1: 'bases', 2: 'scents', 3: 'benefits', 4: 'addons' };
    var k = keyByStep[sbStep];
    return !!(k && sbSelections[k] && sbSelections[k].length > 0);
  }

  function updateActionBar() {
    var prev = document.getElementById('sbPrevBtn');
    var next = document.getElementById('sbNextBtn');
    var addCart = document.getElementById('sbAddCartBtn');
    var restart = document.getElementById('sbRestartBtn');
    var edit = document.getElementById('sbEditBtn');

    hide(prev); hide(next); hide(addCart); hide(restart); hide(edit);

    if (sbStage === 'path') {
      return; // No actions needed — the path cards are themselves the CTA
    }

    if (sbStage === 'guided') {
      show(prev);
      show(restart);
      next.textContent = (sbStep >= GUIDED_QUESTIONS.length) ? 'See My Soap ✦' : 'Next ✦';
      next.disabled = !currentGuidedAnswered();
      show(next);
      return;
    }

    if (sbStage === 'manual') {
      if (sbStep > 1) show(prev);
      show(restart);
      next.textContent = (sbStep >= 4) ? 'Review ✦' : 'Next ✦';
      next.disabled = !currentManualAnswered();
      show(next);
      if (sbStep === 4 && currentManualAnswered()) {
        // allow skipping straight to review via Add to Cart is premature; keep Next
      }
      return;
    }

    if (sbStage === 'result') {
      show(edit);
      show(restart);
      show(addCart);
      return;
    }
  }

  // ============ PUBLIC API ============

  window.openSoapBuilder = function() {
    var modal = document.getElementById('soapBuilderModal');
    if (!modal) return;
    modal.style.display = 'flex';
    setTimeout(function() { modal.classList.add('visible'); }, 10);
    // Reset to path picker every time.
    sbSelections = { bases: [], scents: [], benefits: [], addons: [], intention: null, scentFamily: null, skinGoal: null, botanical: null, energy: null };
    goToPath();
  };

  window.closeSoapBuilder = function() {
    var modal = document.getElementById('soapBuilderModal');
    if (!modal) return;
    modal.classList.remove('visible');
    setTimeout(function() { modal.style.display = 'none'; }, 300);
  };

  window.sbNextStep = function() {
    if (sbStage === 'guided') {
      if (!currentGuidedAnswered()) return;
      if (sbStep >= GUIDED_QUESTIONS.length) { goToResult(); return; }
      sbStep += 1;
      renderGuidedStep();
      return;
    }
    if (sbStage === 'manual') {
      if (!currentManualAnswered()) return;
      if (sbStep >= 4) { goToResult(); return; }
      sbStep += 1;
      renderManualStep();
      return;
    }
  };

  window.sbPrevStep = function() {
    if (sbStage === 'guided') {
      if (sbStep <= 1) { goToPath(); return; }
      sbStep -= 1;
      renderGuidedStep();
      return;
    }
    if (sbStage === 'manual') {
      if (sbStep <= 1) { goToPath(); return; }
      sbStep -= 1;
      renderManualStep();
      return;
    }
    if (sbStage === 'result') {
      // Back from result returns to the last step in the same path
      if (sbPath === 'guided') {
        sbStage = 'guided';
        sbStep = GUIDED_QUESTIONS.length;
        renderGuidedStep();
      } else {
        sbStage = 'manual';
        sbStep = 4;
        renderManualStep();
      }
    }
  };

  window.sbStartNew = function() {
    sbSelections = { bases: [], scents: [], benefits: [], addons: [], intention: null, scentFamily: null, skinGoal: null, botanical: null, energy: null };
    goToPath();
  };

  window.sbEditSelections = function() {
    // Go back into the same path to tweak choices
    if (sbPath === 'guided') { sbStage = 'guided'; sbStep = 1; renderGuidedStep(); }
    else if (sbPath === 'manual') { sbStage = 'manual'; sbStep = 1; renderManualStep(); }
    else { goToPath(); }
  };

  window.sbAskLunna = function() {
    if (typeof window.openLunna === 'function') window.openLunna();
  };

  window.sbAddToCart = function() {
    var name = deriveSoapName();
    var parts = [];
    if (sbPath === 'guided') {
      if (sbSelections.intention) parts.push('Intention: ' + sbSelections.intention);
      if (sbSelections.energy) parts.push('Energy: ' + sbSelections.energy);
    }
    if (sbSelections.bases.length > 0) {
      parts.push('Base: ' + sbSelections.bases.map(function(id) { var i = getItemByKey('bases', id); return i ? i.name : id; }).join(', '));
    }
    if (sbSelections.scents.length > 0) {
      parts.push('Scent: ' + sbSelections.scents.map(function(id) { var i = getItemByKey('scents', id); return i ? i.name : id; }).join(', '));
    }
    if (sbSelections.benefits.length > 0) {
      parts.push('Benefits: ' + sbSelections.benefits.map(function(id) { var i = getItemByKey('benefits', id); return i ? i.name : id; }).join(', '));
    }
    if (sbSelections.addons.length > 0) {
      parts.push('Botanicals: ' + sbSelections.addons.map(function(id) { var i = getItemByKey('addons', id); return i ? i.name : id; }).join(', '));
    }

    var price = calcPrice();

    if (typeof addToCart === 'function') {
      var existing = (typeof cart !== 'undefined') ? cart.find(function(i) { return i.name === name; }) : null;
      if (existing) {
        existing.qty += 1;
        if (typeof renderCart === 'function') renderCart();
      } else {
        var item = { name: name, price: price, qty: 1, productId: '__custom_soap_builder', kind: 'custom-soap' };
        if (parts.length > 0) item.herbs = parts.join(' | ');
        if (typeof cart !== 'undefined') cart.push(item);
        if (typeof renderCart === 'function') renderCart();
      }
      if (typeof showToast === 'function') showToast('Added to cart: ' + name);
      if (typeof openCart === 'function') openCart();
    }
    closeSoapBuilder();
  };

  // Wire up the path-picker cards
  document.addEventListener('click', function(e) {
    var card = e.target.closest && e.target.closest('[data-sb-path]');
    if (card) {
      var path = card.getAttribute('data-sb-path');
      if (path === 'guided') startGuided();
      else if (path === 'manual') startManual();
      return;
    }
    // Close on backdrop click
    if (e.target && e.target.id === 'soapBuilderModal') closeSoapBuilder();
  });

})();
