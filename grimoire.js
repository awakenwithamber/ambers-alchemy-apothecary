// ============================================================
// THE LIVING GRIMOIRE — Herb Explorer, Detail Modal, Quiz
// Enhanced: individual botanical sales, pricing tiers, better actions
// ============================================================

// ---- SYMPTOM → CATEGORY MAPPING for Herb Explorer ----
const SYMPTOM_MAP = {
  sleep:       ['sleep'],
  insomnia:    ['sleep'],
  rest:        ['sleep'],
  dream:       ['sleep', 'spiritual'],
  relax:       ['sleep', 'adaptogen'],
  calm:        ['sleep', 'adaptogen'],
  stress:      ['sleep', 'adaptogen'],
  anxiety:     ['sleep', 'adaptogen'],
  nervous:     ['sleep', 'adaptogen'],
  tension:     ['sleep', 'pain'],
  energy:      ['energy', 'adaptogen'],
  fatigue:     ['energy', 'adaptogen'],
  tired:       ['energy', 'adaptogen'],
  focus:       ['energy', 'adaptogen'],
  clarity:     ['energy', 'adaptogen', 'spiritual'],
  brain:       ['energy', 'adaptogen'],
  memory:      ['energy', 'adaptogen'],
  concentration: ['energy', 'adaptogen'],
  immunity:    ['immune'],
  immune:      ['immune'],
  infection:   ['immune'],
  cold:        ['immune'],
  flu:         ['immune'],
  virus:       ['immune'],
  bacteria:    ['immune'],
  inflammation:['immune', 'pain'],
  pain:        ['pain'],
  ache:        ['pain'],
  joint:       ['pain'],
  muscle:      ['pain'],
  arthritis:   ['pain'],
  chronic:     ['pain', 'adaptogen'],
  skin:        ['beauty'],
  beauty:      ['beauty'],
  aging:       ['beauty'],
  wrinkle:     ['beauty'],
  hair:        ['beauty'],
  acne:        ['beauty'],
  glow:        ['beauty'],
  collagen:    ['beauty'],
  digestion:   ['digestive'],
  digestive:   ['digestive'],
  gut:         ['digestive'],
  bloat:       ['digestive'],
  nausea:      ['digestive'],
  stomach:     ['digestive'],
  ibs:         ['digestive'],
  hormones:    ['hormonal'],
  hormonal:    ['hormonal'],
  pms:         ['hormonal'],
  menstrual:   ['hormonal'],
  menopause:   ['hormonal'],
  fertility:   ['hormonal'],
  thyroid:     ['hormonal'],
  spiritual:   ['spiritual'],
  meditation:  ['spiritual'],
  ritual:      ['spiritual'],
  intuition:   ['spiritual'],
  psychic:     ['spiritual'],
  grounding:   ['spiritual'],
  protection:  ['spiritual'],
  mushroom:    ['mushroom'],
  adaptogen:   ['adaptogen'],
  adaptogenic: ['adaptogen'],
  resilience:  ['adaptogen'],
  adrenal:     ['adaptogen'],
  cortisol:    ['adaptogen'],
};

// ---- ENERGETIC PROPERTIES by category ----
const ENERGETIC_PROPS = {
  sleep:      'Energetically associated with peace, emotional restoration, and the gentle surrender into rest. These herbs carry a yin, receptive quality — they invite the nervous system to soften and the mind to release.',
  energy:     'Energetically warming and expansive. These herbs carry solar, yang qualities — they kindle inner fire, sharpen the mind, and support the body\'s capacity to meet the demands of life with grace.',
  immune:     'Energetically protective and fortifying. These herbs build a strong inner boundary, supporting the body\'s capacity to discern and defend without becoming rigid or reactive.',
  beauty:     'Energetically nourishing and restorative. These herbs carry the frequency of self-love and renewal — they support the body\'s natural radiance from the inside out.',
  digestive:  'Energetically grounding and integrating. These herbs support the body\'s ability to receive, process, and release — both physically and emotionally.',
  pain:       'Energetically cooling and releasing. These herbs help the body move stuck energy, reduce heat and inflammation, and restore flow where there has been blockage.',
  hormonal:   'Energetically balancing and cyclical. These herbs honor the rhythms of the body — they support the dance between expansion and contraction, activity and rest.',
  spiritual:  'Energetically expansive and liminal. These herbs thin the veil between the seen and unseen, supporting meditation, dreamwork, and the cultivation of inner wisdom.',
  mushroom:   'Energetically deep and ancient. Medicinal mushrooms carry the intelligence of the mycelial network — they support adaptability, communication between body systems, and profound immune intelligence.',
  adaptogen:  'Energetically balancing and resilient. Adaptogens are the great normalizers — they neither stimulate nor sedate, but bring the body into its own natural equilibrium.',
};

// ---- PRODUCTS that contain each herb ----
const HERB_PRODUCTS = {
  lavender:      ['DreamEase Capsules', 'Custom Tea Blends'],
  chamomile:     ['DreamEase Capsules', 'Custom Tea Blends'],
  valerian:      ['DreamEase Capsules'],
  passionflower: ['DreamEase Capsules', 'Custom Tea Blends'],
  ashwagandha:   ['Vital Vitality', 'Custom Blends'],
  rhodiola:      ['Vital Vitality'],
  elderberry:    ['Immune-At-Ease'],
  echinacea:     ['Immune-At-Ease'],
  reishi:        ['Immune-At-Ease'],
  rosehip:       ["Amber's Age Reversal Beauty Balm"],
  frankincense:  ["Amber's Age Reversal Beauty Balm"],
  arnica:        ['Ultimate Pain Relieving Balm'],
  cayenne:       ['Ultimate Pain Relieving Balm'],
  comfrey:       ['Ultimate Pain Relieving Balm'],
  rosemary:      ['Miracle Hair Regrowth Serum'],
  peppermint:    ['Miracle Hair Regrowth Serum', 'Custom Tea Blends'],
  turmeric:      ['Custom Tea Blends', 'Custom Blends'],
  ginger:        ['Custom Tea Blends', 'Custom Blends'],
};

function getProductsForHerb(herbName) {
  const name = herbName.toLowerCase();
  for (const [key, products] of Object.entries(HERB_PRODUCTS)) {
    if (name.includes(key)) return products;
  }
  return ['Custom Tea Blends', 'Custom Formulas'];
}

function getEnergeticForHerb(herb) {
  const cats = herb.categories || [];
  for (const cat of cats) {
    if (ENERGETIC_PROPS[cat]) return ENERGETIC_PROPS[cat];
  }
  return 'Energetically wise and ancient, this botanical carries the accumulated intelligence of generations of healers who recognized its unique gifts.';
}

function getCategoryLabel(cat) {
  const labels = {
    sleep: 'Sleep & Calm', energy: 'Energy & Vitality', immune: 'Immune Support',
    beauty: 'Beauty & Skin', digestive: 'Digestive Support', pain: 'Pain & Inflammation',
    hormonal: 'Hormonal Balance', spiritual: 'Spiritual & Ritual',
    mushroom: 'Medicinal Mushroom', adaptogen: 'Adaptogen',
  };
  return labels[cat] || cat;
}

const GRIMOIRE_QUOTES = [
  'The wisdom of the plants has guided healing for centuries.',
  'Every herb carries a story written by nature.',
  'The earth offers medicine to those who know how to listen.',
  'In every leaf, a library. In every root, a remedy.',
  'Nature does not hurry, yet everything is accomplished.',
  'The plants remember what the mind has forgotten.',
  'To know an herb is to enter into relationship with the living world.',
];

function getRandomQuote() {
  return GRIMOIRE_QUOTES[Math.floor(Math.random() * GRIMOIRE_QUOTES.length)];
}

// ============================================================
// BOTANICAL PRICING TIERS
// ============================================================

const BOTANICAL_PRICING = {
  // Premium botanicals ($9.99/oz)
  premium: ['ashwagandha', 'rhodiola', 'lion-mane', 'cordyceps', 'reishi', 'turkey-tail',
            'maca', 'shatavari', 'boswellia', 'kava', 'bacopa', 'gotu-kola',
            'schisandra', 'dong-quai', 'black-cohosh', 'vitex', 'andrographis'],
  // Rare botanicals ($14.99/oz)
  rare: ['frankincense', 'helichrysum', 'neroli', 'blue-lotus', 'saffron', 'vanilla',
         'sandalwood', 'dragon-blood', 'agarwood', 'ghost-pipe', 'goldenseal'],
};

function getBotanicalPriceTier(herbId) {
  if (BOTANICAL_PRICING.rare.indexOf(herbId) !== -1) return 'rare';
  if (BOTANICAL_PRICING.premium.indexOf(herbId) !== -1) return 'premium';
  return 'standard';
}

function getBotanicalPricePerOz(herbId) {
  var tier = getBotanicalPriceTier(herbId);
  if (tier === 'rare') return 14.99;
  if (tier === 'premium') return 9.99;
  return 6.99;
}

function getBotanicalTierLabel(tier) {
  if (tier === 'rare') return 'Rare Botanical';
  if (tier === 'premium') return 'Premium Botanical';
  return 'Standard Botanical';
}

// ============================================================
// ADD INDIVIDUAL BOTANICAL TO CART
// ============================================================

window.addBotanicalToCart = function(herbId, qty) {
  qty = qty || 1;
  var herb = (typeof BOTANICALS !== 'undefined') ? BOTANICALS.find(function(b) { return b.id === herbId; }) : null;
  if (!herb) return;

  var pricePerOz = getBotanicalPricePerOz(herbId);
  var tier = getBotanicalPriceTier(herbId);
  var tierLabel = getBotanicalTierLabel(tier);

  var cartItem = {
    id: 'botanical-' + herbId + '-' + Date.now(),
    name: herb.name,
    desc: 'Loose Botanical | ' + tierLabel + ' | ' + qty + ' oz',
    herbs: herb.name,
    size: qty + ' oz',
    price: pricePerOz * qty,
    qty: 1,
    form: 'Loose Botanical'
  };

  if (typeof window.addItemToCart === 'function') {
    window.addItemToCart(cartItem);
  }
};

// ============================================================
// HERB DETAIL MODAL — Enhanced with Select, Add to Cart, pricing
// ============================================================

function openHerbModal(herbId) {
  const herb = BOTANICALS.find(h => h.id === herbId);
  if (!herb) return;

  const modal = document.getElementById('herbModal');
  const body = document.getElementById('herbModalBody');
  const products = getProductsForHerb(herb.name);
  const energetic = getEnergeticForHerb(herb);
  const quote = getRandomQuote();
  const catLabels = (herb.categories || []).map(getCategoryLabel).join(' \u00B7 ');
  const useLabels = (herb.uses || []).map(u => {
    const map = { tea: '\u{1F375} Tea', capsule: '\u{1F48A} Capsule', balm: '\u{1FAD9} Balm', serum: '\u2728 Serum', tincture: '\u{1F4A7} Tincture' };
    return map[u] || u;
  }).join('  ');

  var pricePerOz = getBotanicalPricePerOz(herbId);
  var tier = getBotanicalPriceTier(herbId);
  var tierLabel = getBotanicalTierLabel(tier);
  var tierClass = 'tier-' + tier;

  // Build purchase section HTML
  var purchaseHtml = `
    <div class="herb-modal-section herb-modal-purchase">
      <h4>\u2726 Purchase This Botanical</h4>
      <div class="herb-purchase-info">
        <span class="herb-price-badge ${tierClass}">${tierLabel}</span>
        <span class="herb-price-per-oz">$${pricePerOz.toFixed(2)} per oz</span>
      </div>
      <div class="herb-quantity-row">
        <label>Quantity:</label>
        <select id="herbModalQty-${herb.id}" class="herb-qty-select">
          <option value="1">1 oz — $${pricePerOz.toFixed(2)}</option>
          <option value="2">2 oz — $${(pricePerOz * 2).toFixed(2)}</option>
          <option value="4">4 oz — $${(pricePerOz * 4).toFixed(2)}</option>
          <option value="8">8 oz — $${(pricePerOz * 8).toFixed(2)}</option>
        </select>
      </div>
      <div class="herb-modal-action-row">
        <button class="btn-primary herb-modal-cart-btn" onclick="var qty=parseInt(document.getElementById('herbModalQty-${herb.id}').value); addBotanicalToCart('${herb.id}', qty)">
          \u{1F6D2} Add to Cart
        </button>
        <button class="btn-secondary herb-modal-select-btn" onclick="document.getElementById('herbModal').style.display='none'; document.body.style.overflow=''; if(typeof addToCustomCreation==='function') addToCustomCreation('${herb.id}')">
          + Add to Custom Remedy
        </button>
      </div>
    </div>
  `;

  // Use SEO full page renderer if available
  if (typeof renderFullHerbPage === 'function') {
    body.innerHTML = renderFullHerbPage(herb);
    if (typeof injectHerbSchema === 'function') injectHerbSchema(herb);
    const quoteEl = document.createElement('div');
    quoteEl.className = 'herb-modal-quote-banner';
    quoteEl.innerHTML = '<div class="herb-modal-quote-text">' + quote + '</div>';
    body.insertBefore(quoteEl, body.firstChild);

    // Inject purchase section and back button
    var purchaseEl = document.createElement('div');
    purchaseEl.innerHTML = purchaseHtml;
    body.appendChild(purchaseEl);

    if (typeof initBotanicalChips === 'function') setTimeout(initBotanicalChips, 100);
  } else {
    body.innerHTML = `
    <div class="herb-modal-img-wrap">
      <img src="${herb.illustration || herb.img}" alt="${herb.name}" class="herb-modal-img" loading="lazy" onerror="this.outerHTML='<div class=img-placeholder style=height:200px>${herb.emoji || '\u{1F33F}'}</div>'" />
      <div class="herb-modal-quote">"${quote}"</div>
    </div>
    <div class="herb-modal-info">
      <div class="herb-modal-emoji">${herb.emoji || '\u{1F33F}'}</div>
      <h2 class="herb-modal-name">${herb.name}</h2>
      <p class="herb-modal-latin"><em>${herb.latin || ''}</em></p>
      <div class="herb-modal-cats">${catLabels}</div>
      <div class="herb-modal-section"><h4>\u2726 Description</h4><p>${herb.desc}</p></div>
      ${herb.benefits && herb.benefits.length ? '<div class="herb-modal-section"><h4>\u2726 Key Benefits</h4><ul class="herb-modal-benefits">' + herb.benefits.map(b => '<li>' + b + '</li>').join('') + '</ul></div>' : ''}
      <div class="herb-modal-section"><h4>\u2726 Energetic Properties</h4><p>${energetic}</p></div>
      <div class="herb-modal-section"><h4>\u2726 Preparation Methods</h4><p class="herb-modal-uses">${useLabels}</p></div>
      <div class="herb-modal-section"><h4>\u2726 Found In These Remedies</h4><div class="herb-modal-products">${products.map(p => '<span class="herb-product-tag">' + p + '</span>').join('')}</div></div>
      ${purchaseHtml}
      <div class="herb-modal-nav-actions">
        <button class="btn-secondary herb-modal-back-btn" onclick="document.getElementById('herbModal').style.display='none'; document.body.style.overflow=''">
          \u2190 Back to Herbal Allies
        </button>
      </div>
    </div>
  `;
  }

  // Always inject the return button at the top
  var backBar = document.createElement('div');
  backBar.className = 'herb-modal-back-bar';
  backBar.innerHTML = '<button class="herb-modal-back-link" onclick="document.getElementById(\'herbModal\').style.display=\'none\'; document.body.style.overflow=\'\';">\u2190 Back to Herbal Allies</button>';
  body.insertBefore(backBar, body.firstChild);

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function addHerbFromModal(herbId) {
  if (typeof toggleHerbSelection === 'function') {
    toggleHerbSelection(herbId);
  }
  document.getElementById('herbModal').style.display = 'none';
  document.body.style.overflow = '';
  showSection('herb-index');
}

document.getElementById('herbModalClose').addEventListener('click', function() {
  document.getElementById('herbModal').style.display = 'none';
  document.body.style.overflow = '';
});

document.getElementById('herbModal').addEventListener('click', function(e) {
  if (e.target === this) {
    this.style.display = 'none';
    document.body.style.overflow = '';
  }
});

// ---- PATCH HERB CARDS to open modal on click ----
const _origRenderHerbs = window.renderHerbs;
function patchHerbCards() {
  const grid = document.getElementById('herbGrid');
  if (!grid) return;
  grid.addEventListener('click', function(e) {
    const card = e.target.closest('.herb-card');
    if (!card) return;
    if (e.target.closest('.herb-card-select-btn')) return;
    if (e.target.closest('.herb-card-action-btn')) return;
    const herbId = card.dataset.id;
    if (herbId) openHerbModal(herbId);
  });
}

// ---- HERB EXPLORER SEARCH ----
function runExplorerSearch(query) {
  const q = query.trim().toLowerCase();
  if (!q) return;

  const resultsEl = document.getElementById('explorerResults');
  resultsEl.innerHTML = '<p class="explorer-searching">Consulting the archive...</p>';

  let matchedCats = new Set();
  for (const [keyword, cats] of Object.entries(SYMPTOM_MAP)) {
    if (q.includes(keyword) || keyword.includes(q)) {
      cats.forEach(c => matchedCats.add(c));
    }
  }

  const directMatches = BOTANICALS.filter(h =>
    h.name.toLowerCase().includes(q) ||
    (h.desc && h.desc.toLowerCase().includes(q)) ||
    (h.latin && h.latin.toLowerCase().includes(q))
  );

  let results = [];
  if (matchedCats.size > 0) {
    results = BOTANICALS.filter(h =>
      h.categories && h.categories.some(c => matchedCats.has(c))
    );
  }

  directMatches.forEach(h => {
    if (!results.find(r => r.id === h.id)) results.push(h);
  });

  results = results.slice(0, 12);

  if (results.length === 0) {
    resultsEl.innerHTML = `<p class="explorer-no-results">No herbs found for "${query}". Try: sleep, stress, pain, immunity, focus, energy, anxiety, digestion, skin, hormones.</p>`;
    return;
  }

  const catNames = Array.from(matchedCats).map(getCategoryLabel).join(', ') || 'your search';
  resultsEl.innerHTML = `
    <div class="explorer-result-header">
      <p>\u2726 ${results.length} botanical allies found for <strong>"${query}"</strong></p>
    </div>
    <div class="explorer-herb-grid">
      ${results.map(h => {
        var pricePerOz = getBotanicalPricePerOz(h.id);
        var tier = getBotanicalPriceTier(h.id);
        return `
        <div class="explorer-herb-card">
          <div class="explorer-herb-card-inner" onclick="openHerbModal('${h.id}')">
            <img src="${h.illustration || h.img}" alt="${h.name}" loading="lazy" onerror="this.style.display='none'" />
            <div class="explorer-herb-info">
              <span class="explorer-herb-emoji">${h.emoji || '\u{1F33F}'}</span>
              <strong>${h.name}</strong>
              <em>${h.latin || ''}</em>
              <p>${h.desc ? h.desc.substring(0, 90) + '...' : ''}</p>
              <span class="explorer-price-tag tier-${tier}">$${pricePerOz.toFixed(2)}/oz</span>
            </div>
          </div>
          <div class="explorer-herb-actions">
            <button class="explorer-action-btn select" onclick="event.stopPropagation(); if(typeof addToCustomCreation==='function') addToCustomCreation('${h.id}')">+ Select</button>
            <button class="explorer-action-btn learn" onclick="event.stopPropagation(); openHerbModal('${h.id}')">Learn More</button>
            <button class="explorer-action-btn cart" onclick="event.stopPropagation(); addBotanicalToCart('${h.id}', 1)">\u{1F6D2} Add to Cart</button>
          </div>
        </div>
      `}).join('')}
    </div>
  `;
}

document.getElementById('explorerSearchBtn').addEventListener('click', function() {
  runExplorerSearch(document.getElementById('explorerSearch').value);
});

document.getElementById('explorerSearch').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') runExplorerSearch(this.value);
});

document.querySelectorAll('.explorer-tag').forEach(function(tag) {
  tag.addEventListener('click', function() {
    const query = this.dataset.query;
    document.getElementById('explorerSearch').value = query;
    runExplorerSearch(query);
    document.querySelectorAll('.explorer-tag').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
  });
});

// ---- FIND YOUR REMEDY QUIZ ----
let quizTrack = null;
let quizUse = null;

document.querySelectorAll('.quiz-opt').forEach(function(btn) {
  btn.addEventListener('click', function() {
    const next = this.dataset.next;
    const track = this.dataset.track;
    const use = this.dataset.use;

    if (track) quizTrack = track;
    if (use) quizUse = use;

    this.closest('.quiz-options').querySelectorAll('.quiz-opt').forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');

    if (next === 'result') {
      showQuizResult();
    } else if (next === '2') {
      document.getElementById('quizStep1').classList.remove('active');
      document.getElementById('quizStep2').classList.add('active');
    }
  });
});

document.getElementById('quizRestart').addEventListener('click', function() {
  quizTrack = null;
  quizUse = null;
  document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
  document.getElementById('quizStep1').classList.add('active');
  document.getElementById('quizResultHerbs').innerHTML = '';
  document.querySelectorAll('.quiz-opt').forEach(b => b.classList.remove('selected'));
});

function showQuizResult() {
  document.getElementById('quizStep2').classList.remove('active');
  document.getElementById('quizResult').classList.add('active');

  let herbs = BOTANICALS.filter(h => {
    const catMatch = !quizTrack || (h.categories && h.categories.includes(quizTrack));
    const useMatch = !quizUse || quizUse === 'all' || (h.uses && h.uses.includes(quizUse));
    return catMatch && useMatch;
  }).slice(0, 6);

  if (herbs.length === 0) {
    herbs = BOTANICALS.filter(h => h.categories && h.categories.includes(quizTrack || 'sleep')).slice(0, 6);
  }

  const container = document.getElementById('quizResultHerbs');
  container.innerHTML = herbs.map(h => {
    const illus = h.illustration || h.img || ((typeof getBotanicalIllustration === 'function' && getBotanicalIllustration(h.id)) || '');
    var pricePerOz = getBotanicalPricePerOz(h.id);
    var tier = getBotanicalPriceTier(h.id);
    return `
    <div class="quiz-result-herb">
      <div class="quiz-result-img-wrap" onclick="openHerbModal('${h.id}')">
        <img src="${illus}" alt="${h.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
        <span class="quiz-result-emoji-fallback" style="display:none">${h.emoji || '\u{1F33F}'}</span>
      </div>
      <div class="quiz-result-herb-info">
        <strong>${h.name}</strong>
        <em>${h.latin || ''}</em>
        <p>${h.desc ? h.desc.substring(0, 90) + '...' : ''}</p>
        <span class="explorer-price-tag tier-${tier}">$${pricePerOz.toFixed(2)}/oz</span>
      </div>
      <div class="quiz-result-actions">
        <button class="explorer-action-btn select" onclick="if(typeof addToCustomCreation==='function') addToCustomCreation('${h.id}')">+ Select</button>
        <button class="explorer-action-btn learn" onclick="openHerbModal('${h.id}')">Learn More</button>
        <button class="explorer-action-btn cart" onclick="addBotanicalToCart('${h.id}', 1)">\u{1F6D2} Add to Cart</button>
      </div>
    </div>
  `;
  }).join('');
}

// ---- JOURNAL SECTION nav buttons ----
document.querySelectorAll('[data-section="herb-index"]').forEach(function(btn) {
  // Already handled by app.js showSection
});

// ---- INIT: patch herb cards after they render ----
function waitForHerbGrid() {
  const grid = document.getElementById('herbGrid');
  if (grid && grid.children.length > 0) {
    patchHerbCards();
  } else {
    setTimeout(waitForHerbGrid, 300);
  }
}
waitForHerbGrid();

// Also patch when section becomes visible
const origShowSection = window.showSection;
if (typeof origShowSection === 'function') {
  window.showSection = function(id) {
    origShowSection(id);
    if (id === 'herb-index') {
      setTimeout(patchHerbCards, 100);
    }
  };
}

// Expose pricing functions globally
window.getBotanicalPricePerOz = getBotanicalPricePerOz;
window.getBotanicalPriceTier = getBotanicalPriceTier;
window.getBotanicalTierLabel = getBotanicalTierLabel;
