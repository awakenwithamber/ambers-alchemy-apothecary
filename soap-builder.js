// ============================================================
// CUSTOM SOAP BUILDER — Amber's Alchemy Apothecary
// Three paths: Guided · Build Your Own · Lunna
// ============================================================

(function() {
  'use strict';

  var sbStep = 1;
  var sbPath = null; // 'intro' | 'guided' | 'manual' | 'lunna' | 'result'
  var sbSelections = { bases: [], scents: [], benefits: [], addons: [] };
  var sbGuided = {};  // guided quiz answers
  var sbLunna = {};   // Lunna answers
  var sbResult = null; // current recommended blend
  var SB_BASE_PRICE = 13.99;

  // ---------- Data ----------
  var SB_DATA = {
    bases: [
      { id: 'clear-top', name: 'Botanical Clear Top Bar', desc: 'A full bar made with vegetable glycerin + castor oil. Clear, radiant, and botanical — lets your flowers and herbs shine through.', price: 0, emoji: '✨' },
      { id: 'creamy-nourishing', name: 'Creamy Nourishing Bar', desc: 'A full bar made with shea butter + goat milk. Rich, velvety, and deeply moisturizing for thirsty skin.', price: 0, emoji: '🧈' },
      { id: 'layered', name: 'Layered Bar (Clear Top + Creamy Base)', desc: 'Best of both — a clear glycerin + castor oil top over a creamy shea butter + goat milk base. Show-stopping and nourishing.', price: 0, emoji: '🌗' }
    ],
    scents: [
      { id: 'lavender-fairy-dream', name: 'Lavender Fairy Dream', desc: 'Soft floral • calming • dreamy', price: 0, emoji: '💜' },
      { id: 'gaias-rose', name: "Gaia's Rose", desc: 'Romantic • floral • heart-opening', price: 0, emoji: '🌹' },
      { id: 'eucalyptus-mint-spa', name: 'Eucalyptus Mint Spa Renewal', desc: 'Fresh • cooling • clean', price: 0, emoji: '🌿' },
      { id: 'warm-cinnamon', name: 'Warm Cinnamon Comfort', desc: 'Cozy • spicy • grounding', price: 0, emoji: '🍂' },
      { id: 'orange-lily', name: 'Orange Lily Goddess', desc: 'Bright • citrus • radiant', price: 0, emoji: '🌺' },
      { id: 'citrus-goddess', name: 'Citrus Goddess Glow', desc: 'Sweet citrus • uplifting • energizing', price: 0, emoji: '🍊' },
      { id: 'sacred-forest', name: 'Sacred Forest Ritual', desc: 'Earthy • resinous • grounding', price: 0, emoji: '🌲' },
      { id: 'fresh-mountain', name: 'Fresh Mountain Air', desc: 'Clean • herbal • awakening', price: 0, emoji: '🏔️' },
      { id: 'sunlit-garden', name: 'Sunlit Garden Bloom', desc: 'Floral • soft • feminine', price: 0, emoji: '🌸' }
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

  // ---------- Signature blends (curated recommendations) ----------
  var SB_BLENDS = {
    moonGarden: {
      id: 'moon-garden',
      name: 'Moon Garden Blend',
      tagline: 'Lavender, oat milk, rose petals, chamomile',
      desc: 'A dreamy nighttime ritual — softly floral, calming, and deeply hydrating. Pour it under candlelight and let the day fall away.',
      image: 'images/soap-lavender-honey.png',
      bases: ['creamy-nourishing'],
      scents: ['lavender-fairy-dream'],
      benefits: ['relaxation', 'moisturizing'],
      addons: ['lavender-buds', 'chamomile', 'rose-petals']
    },
    solarGlow: {
      id: 'solar-glow',
      name: 'Solar Glow Blend',
      tagline: 'Citrus oils, calendula, turmeric, honey',
      desc: 'A sunlit awakening — bright, radiant, golden. For mornings that want to feel like blessings.',
      image: 'images/soap-turmeric-glow.png',
      bases: ['clear-top'],
      scents: ['citrus-goddess', 'orange-lily'],
      benefits: ['energizing', 'skin-healing'],
      addons: ['calendula', 'orange-peel']
    },
    forestRenewal: {
      id: 'forest-renewal',
      name: 'Forest Renewal Blend',
      tagline: 'Cedar, mint, clay, aloe',
      desc: 'A cool walk through mossy woods — grounding, cleansing, and quietly restorative. Breathe in the green.',
      image: 'images/soap-cedar-sage.png',
      bases: ['layered'],
      scents: ['sacred-forest', 'eucalyptus-mint-spa'],
      benefits: ['detox', 'exfoliation'],
      addons: ['mint-leaves', 'nettle-leaf', 'rosemary']
    },
    roseAlchemist: {
      id: 'rose-alchemist',
      name: 'Rose Alchemist Blend',
      tagline: 'Rose, pink clay, hibiscus, shea',
      desc: 'A heart-opening elixir — romantic, soft, and deeply nourishing. Wear your tenderness like armor.',
      image: 'images/soap-rose-clay.png',
      bases: ['creamy-nourishing'],
      scents: ['gaias-rose', 'sunlit-garden'],
      benefits: ['moisturizing', 'anti-aging'],
      addons: ['rose-petals', 'hibiscus', 'chamomile']
    },
    honeyOat: {
      id: 'honey-oat',
      name: 'Honeyed Harvest Blend',
      tagline: 'Oat milk, honey, calendula, vanilla warmth',
      desc: 'A golden, creamy embrace — soothing, sensitive-skin safe, and wholly comforting.',
      image: 'images/soap-calendula-oat.png',
      bases: ['creamy-nourishing'],
      scents: ['warm-cinnamon', 'sunlit-garden'],
      benefits: ['skin-healing', 'moisturizing'],
      addons: ['calendula', 'chamomile']
    },
    emberRitual: {
      id: 'ember-ritual',
      name: 'Ember Ritual Blend',
      tagline: 'Cinnamon, clove, orange peel, frankincense',
      desc: 'Warm, spicy, and sensual — a bar that feels like fire-lit evenings and ancient incense.',
      image: 'images/soap-frankincense-myrrh.png',
      bases: ['layered'],
      scents: ['warm-cinnamon', 'sacred-forest'],
      benefits: ['energizing', 'relaxation'],
      addons: ['cinnamon', 'clove', 'orange-peel']
    },
    charcoalMist: {
      id: 'charcoal-mist',
      name: 'Charcoal Mist Blend',
      tagline: 'Activated charcoal, mint, eucalyptus, clay',
      desc: 'A clarifying cleanse — pore-purifying, cooling, and crisply awakening.',
      image: 'images/soap-charcoal-mint.png',
      bases: ['layered'],
      scents: ['eucalyptus-mint-spa', 'fresh-mountain'],
      benefits: ['detox', 'exfoliation'],
      addons: ['mint-leaves', 'spirulina', 'nettle-leaf']
    },
    mysticBloom: {
      id: 'mystic-bloom',
      name: 'Mystic Bloom Blend',
      tagline: 'Butterfly pea, lavender, jasmine, silk',
      desc: 'A twilight indulgence — iridescent blue-violet, floral, and quietly magical.',
      image: 'images/soap-lavender-honey.png',
      bases: ['clear-top'],
      scents: ['lavender-fairy-dream', 'gaias-rose'],
      benefits: ['hormonal', 'relaxation'],
      addons: ['butterfly-pea', 'lavender-buds', 'rose-petals']
    }
  };

  // ---------- Guided quiz definition ----------
  var SB_QUIZ = [
    {
      id: 'experience',
      question: 'What experience do you want from your soap?',
      hint: 'Choose the feeling you want to step into.',
      options: [
        { id: 'calming', label: 'Calming', emoji: '🌙' },
        { id: 'energizing', label: 'Energizing', emoji: '☀️' },
        { id: 'grounding', label: 'Grounding', emoji: '🌲' },
        { id: 'sensual', label: 'Sensual', emoji: '🌹' },
        { id: 'cleansing', label: 'Cleansing', emoji: '🫧' },
        { id: 'sleep', label: 'Sleep Support', emoji: '😴' },
        { id: 'confidence', label: 'Confidence', emoji: '✨' }
      ]
    },
    {
      id: 'scent',
      question: 'Which scent family calls to you?',
      hint: 'Trust the first one that feels warm.',
      options: [
        { id: 'floral', label: 'Floral', emoji: '🌸' },
        { id: 'citrus', label: 'Citrus & Bright', emoji: '🍊' },
        { id: 'herbal', label: 'Fresh Herbal', emoji: '🌿' },
        { id: 'woody', label: 'Woody / Resinous', emoji: '🌲' },
        { id: 'spiced', label: 'Warm & Spiced', emoji: '🍂' }
      ]
    },
    {
      id: 'skin',
      question: 'What does your skin most need?',
      hint: 'One feels most true today.',
      options: [
        { id: 'moisture', label: 'Deep Moisture', emoji: '💧' },
        { id: 'sensitive', label: 'Sensitive / Soothing', emoji: '💚' },
        { id: 'brightening', label: 'Brightening', emoji: '🌟' },
        { id: 'clarify', label: 'Clarify & Detox', emoji: '🫧' },
        { id: 'repair', label: 'Repair / Anti-Aging', emoji: '✨' }
      ]
    },
    {
      id: 'botanical',
      question: 'Favorite botanical?',
      hint: 'The one you\'d wear as perfume.',
      options: [
        { id: 'rose', label: 'Rose', emoji: '🌹' },
        { id: 'lavender', label: 'Lavender', emoji: '💜' },
        { id: 'calendula', label: 'Calendula', emoji: '🌻' },
        { id: 'chamomile', label: 'Chamomile', emoji: '🌼' },
        { id: 'mint', label: 'Mint / Eucalyptus', emoji: '🌿' },
        { id: 'cedar', label: 'Cedar / Forest', emoji: '🌲' }
      ]
    },
    {
      id: 'color',
      question: 'Color palette you love?',
      hint: 'For the visual ritual.',
      options: [
        { id: 'lavender-cream', label: 'Lavender & Cream', emoji: '💜' },
        { id: 'rose-gold', label: 'Rose & Gold', emoji: '🌹' },
        { id: 'amber', label: 'Amber & Warm Brown', emoji: '🍯' },
        { id: 'forest', label: 'Forest Green', emoji: '🌲' },
        { id: 'midnight', label: 'Midnight Blue / Violet', emoji: '🌌' },
        { id: 'sunlit', label: 'Sunlit Gold', emoji: '☀️' }
      ]
    },
    {
      id: 'exfoliation',
      question: 'Exfoliation level?',
      hint: 'How much texture do you want?',
      options: [
        { id: 'none', label: 'None — silky smooth', emoji: '🕯️' },
        { id: 'gentle', label: 'Gentle — floral petals', emoji: '🌸' },
        { id: 'medium', label: 'Medium — herbal texture', emoji: '🌿' },
        { id: 'strong', label: 'Strong — polish & renew', emoji: '✨' }
      ]
    },
    {
      id: 'occasion',
      question: 'Gift or personal use?',
      hint: 'We wrap the magic accordingly.',
      options: [
        { id: 'personal', label: 'For me', emoji: '💖' },
        { id: 'gift', label: 'A gift', emoji: '🎁' },
        { id: 'ritual', label: 'Ritual / altar', emoji: '🕯️' }
      ]
    },
    {
      id: 'intention',
      question: 'Last thing — what is your intention?',
      hint: 'One word or feeling to bless it with.',
      options: [
        { id: 'peace', label: 'Peace', emoji: '🕊️' },
        { id: 'renewal', label: 'Renewal', emoji: '🌱' },
        { id: 'love', label: 'Love', emoji: '💗' },
        { id: 'clarity', label: 'Clarity', emoji: '🔮' },
        { id: 'protection', label: 'Protection', emoji: '🛡️' },
        { id: 'joy', label: 'Joy', emoji: '☀️' },
        { id: 'rest', label: 'Rest', emoji: '🌙' }
      ]
    }
  ];

  // ---------- Lunna script ----------
  var SB_LUNNA = [
    {
      lead: "Hello, soul. I'm Lunna. Tell me — how would you like to feel when you step out of the bath?",
      options: [
        { id: 'calm', label: 'Calm and held' },
        { id: 'radiant', label: 'Radiant and awake' },
        { id: 'grounded', label: 'Grounded and clear' },
        { id: 'loved', label: 'Soft and loved' },
        { id: 'clean', label: 'Clean and renewed' }
      ]
    },
    {
      lead: "Beautiful. And when you close your eyes — what garden are you walking through?",
      options: [
        { id: 'moon-garden', label: 'A moonlit lavender garden' },
        { id: 'sun-garden', label: 'A sun-warmed citrus grove' },
        { id: 'forest', label: 'A deep cedar forest' },
        { id: 'rose-garden', label: 'A rose and hibiscus garden' },
        { id: 'apothecary', label: 'A warm apothecary of spices' }
      ]
    },
    {
      lead: "One more whisper — what does your skin ask of you today?",
      options: [
        { id: 'hydrate', label: 'Hold me, soften me' },
        { id: 'soothe', label: 'Soothe me, I\'m tender' },
        { id: 'brighten', label: 'Wake me, brighten me' },
        { id: 'cleanse', label: 'Clear me, cleanse me' },
        { id: 'ritual', label: 'Ritualize me' }
      ]
    }
  ];

  // ================= utility helpers =================
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function getItemByKey(key, id) { return SB_DATA[key].find(function(d) { return d.id === id; }); }

  function calcPriceForSelections(sel) {
    var total = SB_BASE_PRICE;
    ['bases', 'scents', 'benefits', 'addons'].forEach(function(key) {
      (sel[key] || []).forEach(function(id) {
        var item = getItemByKey(key, id);
        if (item) total += item.price;
      });
    });
    return total;
  }
  function calcPrice() { return calcPriceForSelections(sbSelections); }

  // ================= Manual builder (existing 5-step wizard) =================
  function renderOptions(containerId, items, selectionKey) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = items.map(function(item) {
      var selected = sbSelections[selectionKey].indexOf(item.id) !== -1;
      return '<button class="sb-option-btn' + (selected ? ' selected' : '') + '" data-id="' + item.id + '" data-key="' + selectionKey + '">' +
        '<span class="sb-opt-emoji">' + item.emoji + '</span>' +
        '<span class="sb-opt-name">' + esc(item.name) + '</span>' +
        '<span class="sb-opt-desc">' + esc(item.desc) + '</span>' +
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
      });
    });
  }

  function updateLiveSummary() {
    var el = document.getElementById('sbLiveSummary');
    var priceEl = document.getElementById('sbLivePrice');
    if (!el) return;
    var cats = [
      { key: 'bases', label: 'Bar Type' },
      { key: 'scents', label: 'Scent' },
      { key: 'benefits', label: 'Benefits' },
      { key: 'addons', label: 'Add-Ons' }
    ];
    var html = '', hasAny = false;
    cats.forEach(function(cat) {
      if (sbSelections[cat.key].length > 0) {
        hasAny = true;
        html += '<div class="sb-summary-cat"><strong>' + cat.label + ':</strong> ';
        html += sbSelections[cat.key].map(function(id) {
          var item = getItemByKey(cat.key, id);
          return item ? item.emoji + ' ' + esc(item.name) : esc(id);
        }).join(', ');
        html += '</div>';
      }
    });
    el.innerHTML = hasAny ? html : '<p class="sb-empty">No selections yet</p>';
    if (priceEl) priceEl.textContent = '$' + calcPrice().toFixed(2);
  }

  function updateProgressBar() {
    document.querySelectorAll('#sbViewManual .sb-progress-step').forEach(function(s) {
      var n = parseInt(s.dataset.step, 10);
      s.classList.toggle('active', n === sbStep);
      s.classList.toggle('completed', n < sbStep);
    });
  }

  function showStep(n) {
    sbStep = n;
    document.querySelectorAll('#sbViewManual .sb-step').forEach(function(s) { s.classList.remove('active'); });
    var stepEl = document.getElementById('sbStep' + n);
    if (stepEl) stepEl.classList.add('active');
    updateProgressBar();
    var prevBtn = document.getElementById('sbPrevBtn');
    var nextBtn = document.getElementById('sbNextBtn');
    var cartBtn = document.getElementById('sbAddCartBtn');
    if (prevBtn) prevBtn.style.display = n > 1 ? '' : 'none';
    if (nextBtn) nextBtn.style.display = n < 5 ? '' : 'none';
    if (cartBtn) cartBtn.style.display = n === 5 ? '' : 'none';
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
          if (item) html += '<li>' + item.emoji + ' ' + esc(item.name) + (item.price > 0 ? ' (+$' + item.price.toFixed(2) + ')' : '') + '</li>';
        });
        html += '</ul>';
      }
      html += '</div>';
    });
    html += '</div>';
    html += '<div class="sb-review-total"><strong>Total: $' + calcPrice().toFixed(2) + '</strong></div>';
    panel.innerHTML = html;

    if (suggBox) {
      var suggestions = getSuggestions();
      if (suggestions.length > 0) {
        suggBox.innerHTML = '<h4>Recommended for Your Goals</h4><p>' + suggestions.join(' ') + '</p>';
        suggBox.style.display = '';
      } else { suggBox.style.display = 'none'; }
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

  // ================= View switching =================
  function showView(view) {
    ['Intro', 'Guided', 'Manual', 'Lunna', 'Result'].forEach(function(v) {
      var el = document.getElementById('sbView' + v);
      if (el) el.classList.toggle('active', v.toLowerCase() === view.toLowerCase());
    });
    sbPath = view.toLowerCase();
    var modal = document.querySelector('.soap-builder-modal');
    if (modal) modal.scrollTop = 0;
  }

  // ================= Guided quiz =================
  var sbQuizIdx = 0;

  function renderQuiz() {
    var stage = document.getElementById('sbQuizStage');
    var prog = document.getElementById('sbQuizProgress');
    if (!stage) return;

    if (sbQuizIdx >= SB_QUIZ.length) {
      sbResult = pickBlendFromGuided(sbGuided);
      renderResult(sbResult, 'guided');
      showView('Result');
      return;
    }

    var q = SB_QUIZ[sbQuizIdx];
    var pct = Math.round((sbQuizIdx / SB_QUIZ.length) * 100);
    if (prog) {
      prog.innerHTML = '<div class="sb-quiz-pct"><div class="sb-quiz-pct-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="sb-quiz-step-lbl">Step ' + (sbQuizIdx + 1) + ' of ' + SB_QUIZ.length + '</div>';
    }

    var optsHtml = q.options.map(function(o) {
      var sel = sbGuided[q.id] === o.id ? ' selected' : '';
      return '<button class="sb-quiz-opt' + sel + '" data-qid="' + q.id + '" data-optid="' + o.id + '">' +
        '<span class="sb-quiz-opt-emoji">' + o.emoji + '</span>' +
        '<span class="sb-quiz-opt-label">' + esc(o.label) + '</span></button>';
    }).join('');

    stage.innerHTML =
      '<div class="sb-quiz-q"><h3>' + esc(q.question) + '</h3><p class="sb-quiz-hint">' + esc(q.hint || '') + '</p></div>' +
      '<div class="sb-quiz-options">' + optsHtml + '</div>' +
      '<div class="sb-quiz-nav">' +
        (sbQuizIdx > 0 ? '<button class="btn-ghost" id="sbQuizBack">← Back</button>' : '<span></span>') +
        '<button class="btn-ghost" id="sbQuizSkip">Skip</button>' +
      '</div>';

    stage.querySelectorAll('.sb-quiz-opt').forEach(function(btn) {
      btn.addEventListener('click', function() {
        sbGuided[this.dataset.qid] = this.dataset.optid;
        stage.querySelectorAll('.sb-quiz-opt').forEach(function(b) { b.classList.remove('selected'); });
        this.classList.add('selected');
        setTimeout(function() { sbQuizIdx++; renderQuiz(); }, 280);
      });
    });
    var back = document.getElementById('sbQuizBack');
    if (back) back.addEventListener('click', function() { if (sbQuizIdx > 0) { sbQuizIdx--; renderQuiz(); } });
    var skip = document.getElementById('sbQuizSkip');
    if (skip) skip.addEventListener('click', function() { sbQuizIdx++; renderQuiz(); });
  }

  function pickBlendFromGuided(a) {
    // Scoring each signature blend against the answers
    var scores = {};
    Object.keys(SB_BLENDS).forEach(function(k) { scores[k] = 0; });

    function add(key, pts) { if (scores[key] !== undefined) scores[key] += pts; }

    switch (a.experience) {
      case 'calming': add('moonGarden', 4); add('mysticBloom', 2); add('honeyOat', 1); break;
      case 'energizing': add('solarGlow', 4); add('charcoalMist', 1); break;
      case 'grounding': add('forestRenewal', 4); add('emberRitual', 2); break;
      case 'sensual': add('roseAlchemist', 4); add('emberRitual', 2); break;
      case 'cleansing': add('charcoalMist', 4); add('forestRenewal', 2); break;
      case 'sleep': add('moonGarden', 5); add('mysticBloom', 2); break;
      case 'confidence': add('solarGlow', 3); add('emberRitual', 2); add('roseAlchemist', 2); break;
    }
    switch (a.scent) {
      case 'floral': add('roseAlchemist', 3); add('mysticBloom', 2); add('moonGarden', 1); break;
      case 'citrus': add('solarGlow', 3); break;
      case 'herbal': add('forestRenewal', 2); add('charcoalMist', 2); break;
      case 'woody': add('forestRenewal', 3); add('emberRitual', 1); break;
      case 'spiced': add('emberRitual', 3); add('honeyOat', 2); break;
    }
    switch (a.skin) {
      case 'moisture': add('moonGarden', 2); add('honeyOat', 3); add('roseAlchemist', 2); break;
      case 'sensitive': add('honeyOat', 3); add('moonGarden', 2); break;
      case 'brightening': add('solarGlow', 3); add('roseAlchemist', 1); break;
      case 'clarify': add('charcoalMist', 3); add('forestRenewal', 2); break;
      case 'repair': add('roseAlchemist', 3); add('honeyOat', 1); break;
    }
    switch (a.botanical) {
      case 'rose': add('roseAlchemist', 2); break;
      case 'lavender': add('moonGarden', 2); add('mysticBloom', 1); break;
      case 'calendula': add('honeyOat', 2); add('solarGlow', 2); break;
      case 'chamomile': add('moonGarden', 1); add('honeyOat', 2); break;
      case 'mint': add('charcoalMist', 2); add('forestRenewal', 1); break;
      case 'cedar': add('forestRenewal', 2); break;
    }

    var best = 'moonGarden', bestScore = -1;
    Object.keys(scores).forEach(function(k) { if (scores[k] > bestScore) { bestScore = scores[k]; best = k; } });
    return Object.assign({}, SB_BLENDS[best], { _source: 'guided', _answers: a });
  }

  // ================= Lunna flow =================
  var sbLunnaIdx = 0;

  function renderLunna(initial) {
    var chat = document.getElementById('sbLunnaChat');
    var input = document.getElementById('sbLunnaInput');
    if (!chat || !input) return;

    if (initial) { chat.innerHTML = ''; sbLunnaIdx = 0; sbLunna = {}; }

    if (sbLunnaIdx >= SB_LUNNA.length) {
      sbResult = pickBlendFromLunna(sbLunna);
      var closingLine = "Ahhh — I see it. For you, I'd pour the <strong>" + esc(sbResult.name) + "</strong>. " + esc(sbResult.desc);
      chat.insertAdjacentHTML('beforeend', '<div class="sb-lunna-msg sb-lunna-msg-her"><div class="sb-lunna-avatar">🌙</div><div class="sb-lunna-bubble">' + closingLine + '</div></div>');
      input.innerHTML = '<button class="btn-primary" id="sbLunnaSee">✦ See the blend</button>';
      var btn = document.getElementById('sbLunnaSee');
      if (btn) btn.addEventListener('click', function() { renderResult(sbResult, 'lunna'); showView('Result'); });
      chat.scrollTop = chat.scrollHeight;
      return;
    }

    var step = SB_LUNNA[sbLunnaIdx];
    chat.insertAdjacentHTML('beforeend',
      '<div class="sb-lunna-msg sb-lunna-msg-her">' +
        '<div class="sb-lunna-avatar">🌙</div>' +
        '<div class="sb-lunna-bubble">' + esc(step.lead) + '</div>' +
      '</div>');

    input.innerHTML = step.options.map(function(o) {
      return '<button class="sb-lunna-opt" data-id="' + o.id + '">' + esc(o.label) + '</button>';
    }).join('');

    input.querySelectorAll('.sb-lunna-opt').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = this.dataset.id;
        var label = this.textContent;
        sbLunna[step.id || ('q' + sbLunnaIdx)] = id;
        chat.insertAdjacentHTML('beforeend',
          '<div class="sb-lunna-msg sb-lunna-msg-you"><div class="sb-lunna-bubble">' + esc(label) + '</div></div>');
        input.innerHTML = '';
        sbLunnaIdx++;
        setTimeout(renderLunna, 520);
        chat.scrollTop = chat.scrollHeight;
      });
    });
    chat.scrollTop = chat.scrollHeight;
  }

  function pickBlendFromLunna(a) {
    var keys = Object.keys(a);
    var scores = {};
    Object.keys(SB_BLENDS).forEach(function(k) { scores[k] = 0; });
    keys.forEach(function(k) {
      var v = a[k];
      if (v === 'calm' || v === 'hydrate') { scores.moonGarden += 3; scores.honeyOat += 1; }
      if (v === 'radiant' || v === 'brighten') { scores.solarGlow += 3; scores.roseAlchemist += 1; }
      if (v === 'grounded') { scores.forestRenewal += 3; scores.emberRitual += 1; }
      if (v === 'loved' || v === 'soothe') { scores.roseAlchemist += 3; scores.honeyOat += 1; }
      if (v === 'clean' || v === 'cleanse') { scores.charcoalMist += 3; scores.forestRenewal += 1; }
      if (v === 'moon-garden') scores.moonGarden += 3;
      if (v === 'sun-garden') scores.solarGlow += 3;
      if (v === 'forest') scores.forestRenewal += 3;
      if (v === 'rose-garden') scores.roseAlchemist += 3;
      if (v === 'apothecary') scores.emberRitual += 3;
      if (v === 'ritual') scores.mysticBloom += 2;
    });
    var best = 'moonGarden', bestScore = -1;
    Object.keys(scores).forEach(function(k) { if (scores[k] > bestScore) { bestScore = scores[k]; best = k; } });
    return Object.assign({}, SB_BLENDS[best], { _source: 'lunna', _answers: a });
  }

  // ================= Result view =================
  function blendToSelections(blend) {
    return {
      bases: (blend.bases || []).slice(),
      scents: (blend.scents || []).slice(),
      benefits: (blend.benefits || []).slice(),
      addons: (blend.addons || []).slice()
    };
  }

  function renderResult(blend, source) {
    if (!blend) return;
    var hero = document.getElementById('sbResultHero');
    var body = document.getElementById('sbResultBody');
    if (!hero || !body) return;

    var sel = blendToSelections(blend);
    var price = calcPriceForSelections(sel);
    var fallbackImg = 'images/soap-lavender-honey.png';

    var intro = source === 'lunna'
      ? "Lunna's whisper — the blend she'd pour for you:"
      : source === 'guided'
        ? 'From your answers, the apothecary recommends:'
        : 'Your handcrafted blend:';

    hero.innerHTML =
      '<div class="sb-result-visual">' +
        '<img src="' + esc(blend.image || fallbackImg) + '" alt="' + esc(blend.name) + '" loading="lazy" onerror="this.onerror=null;this.src=\'' + fallbackImg + '\'" />' +
        '<div class="sb-result-shine" aria-hidden="true"></div>' +
      '</div>' +
      '<div class="sb-result-meta">' +
        '<span class="sb-result-kicker">' + esc(intro) + '</span>' +
        '<h2 class="sb-result-name">' + esc(blend.name) + '</h2>' +
        '<p class="sb-result-tag">' + esc(blend.tagline) + '</p>' +
        '<p class="sb-result-desc">' + esc(blend.desc) + '</p>' +
        '<div class="sb-result-price"><strong>$' + price.toFixed(2) + '</strong><span>per bar · handcrafted</span></div>' +
      '</div>';

    function listFor(key) {
      return (sel[key] || []).map(function(id) {
        var item = getItemByKey(key, id);
        return item ? '<li>' + item.emoji + ' ' + esc(item.name) + '</li>' : '';
      }).join('');
    }

    body.innerHTML =
      '<div class="sb-result-ingredients">' +
        '<div><h4>🧴 Base</h4><ul>' + listFor('bases') + '</ul></div>' +
        '<div><h4>🌸 Scent</h4><ul>' + listFor('scents') + '</ul></div>' +
        '<div><h4>✨ Benefits</h4><ul>' + listFor('benefits') + '</ul></div>' +
        '<div><h4>🌿 Botanicals</h4><ul>' + listFor('addons') + '</ul></div>' +
      '</div>';
  }

  // ================= Cart / actions =================
  function addSelectionsToCart(name, sel, noteParts) {
    var price = calcPriceForSelections(sel);
    var parts = [];
    if (sel.bases.length) parts.push('Base: ' + sel.bases.map(function(id) { var i = getItemByKey('bases', id); return i ? i.name : id; }).join(', '));
    if (sel.scents.length) parts.push('Scent: ' + sel.scents.map(function(id) { var i = getItemByKey('scents', id); return i ? i.name : id; }).join(', '));
    if (sel.benefits.length) parts.push('Benefits: ' + sel.benefits.map(function(id) { var i = getItemByKey('benefits', id); return i ? i.name : id; }).join(', '));
    if (sel.addons.length) parts.push('Add-Ons: ' + sel.addons.map(function(id) { var i = getItemByKey('addons', id); return i ? i.name : id; }).join(', '));
    if (noteParts && noteParts.length) parts = parts.concat(noteParts);

    if (typeof cart !== 'undefined') {
      var existing = cart.find(function(i) { return i.name === name; });
      if (existing) {
        existing.qty += 1;
      } else {
        var item = { name: name, price: price, qty: 1 };
        if (parts.length) item.herbs = parts.join(' | ');
        cart.push(item);
      }
      if (typeof renderCart === 'function') renderCart();
      if (typeof showToast === 'function') showToast('✦ Added to cart: ' + name);
      if (typeof openCart === 'function') openCart();
    }
  }

  // ================= Public API =================
  window.openSoapBuilder = function(path) {
    var modal = document.getElementById('soapBuilderModal');
    if (!modal) return;
    modal.style.display = 'flex';
    setTimeout(function() { modal.classList.add('visible'); }, 10);
    if (path === 'guided' || path === 'manual' || path === 'lunna') {
      sbStartPath(path);
    } else {
      showView('Intro');
      sbPath = 'intro';
    }
  };

  window.closeSoapBuilder = function() {
    var modal = document.getElementById('soapBuilderModal');
    if (!modal) return;
    modal.classList.remove('visible');
    setTimeout(function() { modal.style.display = 'none'; }, 300);
  };

  window.sbStartPath = function(path) {
    if (path === 'manual') {
      sbSelections = { bases: [], scents: [], benefits: [], addons: [] };
      sbStep = 1;
      showView('Manual');
      showStep(1);
      updateLiveSummary();
    } else if (path === 'guided') {
      sbGuided = {};
      sbQuizIdx = 0;
      showView('Guided');
      renderQuiz();
    } else if (path === 'lunna') {
      sbLunna = {};
      sbLunnaIdx = 0;
      showView('Lunna');
      renderLunna(true);
    }
  };

  window.sbBackToIntro = function() {
    showView('Intro');
  };

  window.sbNextStep = function() { if (sbStep < 5) showStep(sbStep + 1); };
  window.sbPrevStep = function() { if (sbStep > 1) showStep(sbStep - 1); };
  window.sbStartNew = function() {
    sbSelections = { bases: [], scents: [], benefits: [], addons: [] };
    showStep(1);
    updateLiveSummary();
  };

  // Manual-builder add-to-cart (existing)
  window.sbAddToCart = function() {
    var name = 'Custom Soap';
    if (sbSelections.scents.length > 0) {
      var scentNames = sbSelections.scents.map(function(id) { var i = getItemByKey('scents', id); return i ? i.name : id; });
      name = scentNames.join(' & ') + ' Custom Soap';
    }
    addSelectionsToCart(name, sbSelections);
    closeSoapBuilder();
  };

  // Result-view actions
  window.sbResultAddToCart = function() {
    if (!sbResult) return;
    addSelectionsToCart(sbResult.name, blendToSelections(sbResult), ['Blend: ' + sbResult.name]);
    closeSoapBuilder();
  };

  window.sbResultCustomize = function() {
    if (!sbResult) return;
    sbSelections = blendToSelections(sbResult);
    showView('Manual');
    sbStep = 1;
    showStep(1);
    updateLiveSummary();
  };

  window.sbResultSave = function() {
    if (!sbResult) return;
    try {
      var saved = JSON.parse(localStorage.getItem('aaa_saved_blends') || '[]');
      saved.push({ name: sbResult.name, tagline: sbResult.tagline, selections: blendToSelections(sbResult), savedAt: Date.now() });
      localStorage.setItem('aaa_saved_blends', JSON.stringify(saved));
      if (typeof showToast === 'function') showToast('✦ Blend saved to your library');
    } catch (e) {
      if (typeof showToast === 'function') showToast('✦ Blend remembered for this session');
    }
  };

  window.sbResultAnother = function() {
    sbResult = null;
    showView('Intro');
  };

  window.sbResultLunnaRefine = function() {
    sbLunna = {};
    sbLunnaIdx = 0;
    showView('Lunna');
    renderLunna(true);
  };

  window.sbResultBookConsult = function() {
    closeSoapBuilder();
    var target = document.querySelector('#consult, #consultations, #contact, #services, a[href="#consult"]');
    if (target && target.scrollIntoView) target.scrollIntoView({ behavior: 'smooth' });
    else if (typeof showToast === 'function') showToast('✦ Consultation — email amber@awakenagain');
  };

  // Close on backdrop click
  document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'soapBuilderModal') closeSoapBuilder();
  });

  // Esc to close
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      var modal = document.getElementById('soapBuilderModal');
      if (modal && modal.classList.contains('visible')) closeSoapBuilder();
    }
  });

})();
