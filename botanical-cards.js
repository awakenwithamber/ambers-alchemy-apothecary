// ============================================================
// BOTANICAL INDEX CARDS — Illustration popups on every herb name
// Adds hover/click botanical cards to: herb chips, grimoire grid,
// explorer results, product ingredient lists, and herb modal
// ============================================================

// ---- BOTANICAL INDEX CARD TOOLTIP ----
// Creates a floating botanical index card when hovering over any herb chip or name

(function() {
  'use strict';

  // ---- Create the floating botanical card overlay ----
  const CARD_ID = 'botanicalIndexCard';

  function createCardOverlay() {
    if (document.getElementById(CARD_ID)) return;
    const overlay = document.createElement('div');
    overlay.id = CARD_ID;
    overlay.className = 'botanical-index-card-overlay';
    overlay.innerHTML = `
      <div class="botanical-index-card" id="${CARD_ID}Inner">
        <button class="bic-close" id="${CARD_ID}Close">✕</button>
        <div class="bic-img-wrap">
          <img class="bic-img" id="${CARD_ID}Img" src="" alt="" loading="lazy" />
          <div class="bic-img-placeholder" id="${CARD_ID}ImgPlaceholder">🌿</div>
        </div>
        <div class="bic-body">
          <div class="bic-emoji" id="${CARD_ID}Emoji"></div>
          <h3 class="bic-name" id="${CARD_ID}Name"></h3>
          <p class="bic-latin" id="${CARD_ID}Latin"></p>
          <div class="bic-cats" id="${CARD_ID}Cats"></div>
          <p class="bic-desc" id="${CARD_ID}Desc"></p>
          <ul class="bic-benefits" id="${CARD_ID}Benefits"></ul>
          <button class="add-to-custom-btn bic-add-custom-btn" id="${CARD_ID}AddCustomBtn">+ Add to My Custom Creation</button>
          <div class="bic-uses" id="${CARD_ID}Uses"></div>
          <div class="bic-why-recommended" id="${CARD_ID}WhyRec" style="display:none">
            <h4>Why It Was Recommended</h4>
            <p id="${CARD_ID}WhyRecText"></p>
          </div>
          <div class="bic-how-it-works" id="${CARD_ID}HowItWorks">
            <h4>How It Works</h4>
            <p id="${CARD_ID}HowItWorksText"></p>
          </div>
          <div class="bic-common-uses" id="${CARD_ID}CommonUses">
            <h4>Common Uses</h4>
            <div id="${CARD_ID}CommonUsesGrid"></div>
          </div>
          <div class="bic-enhancements" id="${CARD_ID}Enhancements">
            <div class="bic-found-in" id="${CARD_ID}FoundIn"></div>
            <div class="bic-pairs-with" id="${CARD_ID}PairsWith"></div>
          </div>
          <div class="bic-confidence">
            <p>Safe, gentle botanical support. You can adjust anytime.</p>
          </div>
          <button class="bic-view-btn" id="${CARD_ID}ViewBtn">View in Grimoire →</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Close on overlay click or close button
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay || e.target.id === CARD_ID + 'Close') {
        hideCard();
      }
    });

    document.getElementById(CARD_ID + 'ViewBtn').addEventListener('click', function() {
      const herbId = overlay.dataset.herbId;
      if (herbId && typeof openHerbModal === 'function') {
        hideCard();
        // Switch to grimoire section first
        if (typeof showSection === 'function') showSection('herb-index');
        setTimeout(() => openHerbModal(herbId), 300);
      }
    });

    document.getElementById(CARD_ID + 'AddCustomBtn').addEventListener('click', function() {
      const herbId = overlay.dataset.herbId;
      if (herbId && typeof window.addToCustomCreation === 'function') {
        hideCard();
        window.addToCustomCreation(herbId);
      }
    });
  }

  function showCard(herb, anchorEl) {
    createCardOverlay();
    const overlay = document.getElementById(CARD_ID);
    if (!overlay) return;

    overlay.dataset.herbId = herb.id;

    // Populate card content
    const illus = herb.illustration || herb.img || (typeof getBotanicalIllustration === 'function' && getBotanicalIllustration(herb.id)) || '';
    const img = document.getElementById(CARD_ID + 'Img');
    const placeholder = document.getElementById(CARD_ID + 'ImgPlaceholder');
    img.src = illus;
    img.alt = 'Botanical illustration of ' + herb.name;
    img.style.display = 'block';
    placeholder.style.display = 'none';
    img.onerror = function() {
      this.style.display = 'none';
      placeholder.style.display = 'flex';
    };

    document.getElementById(CARD_ID + 'Emoji').textContent = herb.emoji || '🌿';
    document.getElementById(CARD_ID + 'Name').textContent = herb.name;
    document.getElementById(CARD_ID + 'Latin').textContent = herb.latin || '';

    // Categories
    const catMap = {
      sleep: '😴 Sleep', energy: '⚡ Energy', immune: '🛡️ Immune',
      beauty: '✨ Beauty', digestive: '🌿 Digestive', pain: '💚 Pain Relief',
      hormonal: '🌙 Hormonal', spiritual: '🔮 Spiritual', mushroom: '🍄 Mushroom',
      adaptogen: '🌱 Adaptogen'
    };
    const catsEl = document.getElementById(CARD_ID + 'Cats');
    catsEl.innerHTML = (herb.categories || []).map(c =>
      `<span class="bic-cat-tag">${catMap[c] || c}</span>`
    ).join('');

    // Description (truncated)
    const desc = herb.desc || '';
    document.getElementById(CARD_ID + 'Desc').textContent =
      desc.length > 140 ? desc.substring(0, 140) + '…' : desc;

    // Benefits
    const benefitsEl = document.getElementById(CARD_ID + 'Benefits');
    if (herb.benefits && herb.benefits.length > 0) {
      benefitsEl.innerHTML = herb.benefits.slice(0, 3).map(b => `<li>${b}</li>`).join('');
      benefitsEl.style.display = 'block';
    } else {
      benefitsEl.style.display = 'none';
    }

    // Uses
    const useMap = { tea: '🍵 Tea', capsule: '💊 Capsule', balm: '🫙 Balm', serum: '✨ Serum', tincture: '🧪 Tincture' };
    const usesEl = document.getElementById(CARD_ID + 'Uses');
    usesEl.innerHTML = (herb.uses || []).map(u =>
      `<span class="bic-use-tag">${useMap[u] || u}</span>`
    ).join('');

    // Why It Was Recommended
    var whyRecEl = document.getElementById(CARD_ID + 'WhyRec');
    var whyRecText = document.getElementById(CARD_ID + 'WhyRecText');
    if (whyRecEl && whyRecText) {
      var flowState = window.RemedyFlow ? window.RemedyFlow.getState() : {};
      var symptoms = flowState.symptoms || [];
      var recHerbs = flowState.recommendedHerbs || [];
      if (recHerbs.indexOf(herb.id) !== -1 && symptoms.length > 0) {
        var goalLabels = {};
        if (typeof ADVISOR_DATA !== 'undefined') {
          ADVISOR_DATA.goals.forEach(function(g) { goalLabels[g.id] = g.label; });
        }
        var symptomNames = symptoms.map(function(s) { return goalLabels[s] || s; });
        whyRecText.textContent = 'Recommended because you selected ' + symptomNames.join(' and ') + '.';
        whyRecEl.style.display = 'block';
      } else {
        whyRecEl.style.display = 'none';
      }
    }

    // How It Works
    var howEl = document.getElementById(CARD_ID + 'HowItWorksText');
    if (howEl) {
      var catExplanations = {
        sleep: 'supports the nervous system and promotes natural relaxation for restful sleep',
        energy: 'nourishes the adrenal glands and supports sustained energy production',
        stress: 'helps regulate the stress response through the HPA axis',
        immune: 'strengthens the body\'s natural immune defenses',
        beauty: 'delivers antioxidants and nutrients that support skin and hair health',
        digestive: 'supports healthy digestion, enzyme production, and gut comfort',
        pain: 'provides natural anti-inflammatory and analgesic support',
        hormonal: 'supports endocrine function and hormonal equilibrium',
        adaptogen: 'helps the body adapt to stress and maintain balance',
        spiritual: 'traditionally used in ceremonial and meditative practices'
      };
      var herbCats = herb.categories || [];
      var explanations = herbCats.map(function(c) { return catExplanations[c]; }).filter(Boolean);
      howEl.textContent = herb.name + ' ' + (explanations.length > 0 ? explanations.join(', and ') : 'provides gentle botanical support for overall wellness') + '.';
    }

    // Common Uses
    var commonUsesGrid = document.getElementById(CARD_ID + 'CommonUsesGrid');
    if (commonUsesGrid) {
      var useCaseMap = {
        sleep: 'Sleep', energy: 'Energy', stress: 'Stress Relief', immune: 'Immune Support',
        beauty: 'Skin & Beauty', digestive: 'Digestion', pain: 'Pain Relief',
        hormonal: 'Hormone Balance', adaptogen: 'Adaptogenic Support', spiritual: 'Spiritual Practice'
      };
      var uses = (herb.categories || []).map(function(c) { return useCaseMap[c]; }).filter(Boolean);
      commonUsesGrid.innerHTML = uses.map(function(u) { return '<span class="bic-common-use-tag">' + u + '</span>'; }).join('');
    }

    // Found In / Pairs With
    var foundInEl = document.getElementById(CARD_ID + 'FoundIn');
    var pairsEl = document.getElementById(CARD_ID + 'PairsWith');
    if (foundInEl && typeof HERB_PRODUCT_LINKS !== 'undefined') {
      var products = HERB_PRODUCT_LINKS[herb.id] || [];
      if (products.length > 0) {
        var prodNames = products.map(function(pid) {
          var p = typeof PRODUCTS !== 'undefined' ? PRODUCTS.find(function(pr) { return pr.id === pid; }) : null;
          return p ? p.name : pid.replace(/-/g, ' ');
        });
        foundInEl.innerHTML = '<strong>Found in:</strong> ' + prodNames.join(', ');
      } else {
        foundInEl.innerHTML = '';
      }
    }
    if (pairsEl && typeof HERB_PAIRINGS !== 'undefined') {
      var pairs = HERB_PAIRINGS[herb.id] || [];
      if (pairs.length > 0) {
        var pairNames = pairs.slice(0, 4).map(function(pid) {
          var h = (typeof BOTANICALS !== 'undefined' ? BOTANICALS.find(function(b) { return b.id === pid; }) : null) ||
                  (typeof BOTANICALS_FULL !== 'undefined' ? BOTANICALS_FULL.find(function(b) { return b.id === pid; }) : null);
          return h ? h.name : pid.replace(/-/g, ' ');
        });
        pairsEl.innerHTML = '<strong>Pairs well with:</strong> ' + pairNames.join(', ');
      } else {
        pairsEl.innerHTML = '';
      }
    }

    // Position the card
    overlay.style.display = 'flex';
    overlay.classList.add('visible');
  }

  function hideCard() {
    const overlay = document.getElementById(CARD_ID);
    if (overlay) {
      overlay.classList.remove('visible');
      setTimeout(() => { overlay.style.display = 'none'; }, 200);
    }
  }

  // ---- Find herb by name (case-insensitive, with partial match fallback) ----
  function findHerbByName(name) {
    const n = name.toLowerCase().trim();
    const slug = n.replace(/[^a-z0-9]+/g, '-');
    function searchExact(arr) {
      if (!arr || !arr.length) return null;
      return arr.find(h =>
        h.name.toLowerCase() === n ||
        h.id === slug ||
        (h.latin && h.latin.toLowerCase().includes(n))
      );
    }
    function searchPartial(arr) {
      if (!arr || !arr.length) return null;
      return arr.find(h =>
        h.name.toLowerCase().includes(n) ||
        n.includes(h.name.toLowerCase())
      );
    }
    // Search both BOTANICALS and BOTANICALS_FULL — exact first, then partial
    let result = null;
    if (typeof BOTANICALS !== 'undefined') result = searchExact(BOTANICALS);
    if (!result && typeof BOTANICALS_FULL !== 'undefined') result = searchExact(BOTANICALS_FULL);
    if (!result && typeof BOTANICALS !== 'undefined') result = searchPartial(BOTANICALS);
    if (!result && typeof BOTANICALS_FULL !== 'undefined') result = searchPartial(BOTANICALS_FULL);
    return result;
  }

  function findHerbById(id) {
    let result = null;
    if (typeof BOTANICALS !== 'undefined') result = BOTANICALS.find(h => h.id === id);
    if (!result && typeof BOTANICALS_FULL !== 'undefined') result = BOTANICALS_FULL.find(h => h.id === id);
    return result;
  }

  // ---- ENHANCED HERB CHIP rendering ----
  // Replaces the plain herb chip with a clickable botanical card chip
  function makeBotanicalChip(herbName) {
    const slug = herbName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const imgPath = (typeof getBotanicalIllustration === 'function' && getBotanicalIllustration(slug)) || '';
    return `<div class="herb-chip botanical-chip" data-herb-name="${herbName}" title="Click to view ${herbName} profile">
      <img src="${imgPath}" alt="${herbName}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" loading="lazy"/>
      <span class="bic-chip-emoji" style="display:none;align-items:center;justify-content:center;width:44px;height:44px;font-size:22px">🌿</span>
      <span>${herbName}</span>
      <span class="bic-chip-hint">tap for profile</span>
    </div>`;
  }

  // ---- PATCH herb chips to open botanical cards ----
  function patchHerbChips(container) {
    const chips = (container || document).querySelectorAll('.herb-chip.botanical-chip');
    chips.forEach(chip => {
      if (chip.dataset.bicPatched) return;
      chip.dataset.bicPatched = '1';
      chip.style.cursor = 'pointer';
      chip.addEventListener('click', function(e) {
        e.stopPropagation();
        const name = this.dataset.herbName;
        const herb = findHerbByName(name);
        if (herb) {
          showCard(herb, this);
        } else {
          // Fallback: build a minimal herb object from the chip data
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          showCard({
            id: slug,
            name: name,
            emoji: '🌿',
            illustration: (typeof getBotanicalIllustration === 'function' && getBotanicalIllustration(slug)) || '',
            desc: 'A key botanical ingredient in this Amber\'s Alchemy formulation.',
            categories: [],
            uses: [],
            benefits: []
          }, this);
        }
      });
    });
  }

  // ---- ENHANCED GRIMOIRE HERB CARD ----
  // Overrides renderHerbGrid to use enhanced botanical index cards
  function enhanceHerbGrid() {
    if (typeof BOTANICALS === 'undefined') return;
    const grid = document.getElementById('herbGrid');
    if (!grid) return;

    // Re-render with enhanced cards if already populated
    const existingCards = grid.querySelectorAll('.herb-card');
    existingCards.forEach(card => {
      const herbId = card.dataset.id;
      if (!herbId || card.dataset.bicEnhanced) return;
      card.dataset.bicEnhanced = '1';

      // Add "View Full Profile" button if not present
      const body = card.querySelector('.herb-card-body');
      if (body && !body.querySelector('.bic-view-in-grimoire')) {
        const viewBtn = document.createElement('button');
        viewBtn.className = 'bic-view-in-grimoire';
        viewBtn.textContent = '✦ Full Botanical Profile';
        viewBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          if (typeof openHerbModal === 'function') openHerbModal(herbId);
        });
        body.appendChild(viewBtn);
      }
    });
  }

  // ---- PATCH PRODUCT CARDS to use botanical chips ----
  function patchProductCards() {
    // Find all product-herb-chips sections and replace plain chips with botanical chips
    document.querySelectorAll('.herb-chips-row').forEach(row => {
      if (row.dataset.bicPatched) return;
      row.dataset.bicPatched = '1';

      // Get existing chips and re-render as botanical chips
      const chips = row.querySelectorAll('.herb-chip');
      chips.forEach(chip => {
        if (chip.dataset.bicPatched) return;
        const nameEl = chip.querySelector('span');
        const imgEl = chip.querySelector('img');
        if (!nameEl) return;
        const herbName = nameEl.textContent.trim();
        chip.dataset.herbName = herbName;
        chip.classList.add('botanical-chip');
        chip.dataset.bicPatched = '1';
        chip.style.cursor = 'pointer';
        chip.title = 'Click to view ' + herbName + ' botanical profile';

        // Add hint text if not present
        if (!chip.querySelector('.bic-chip-hint')) {
          const hint = document.createElement('span');
          hint.className = 'bic-chip-hint';
          hint.textContent = 'tap for profile';
          chip.appendChild(hint);
        }

        chip.addEventListener('click', function(e) {
          e.stopPropagation();
          const herb = findHerbByName(herbName);
          if (herb) {
            showCard(herb, chip);
          } else {
            const slug = herbName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            showCard({
              id: slug,
              name: herbName,
              emoji: '🌿',
              illustration: imgEl ? imgEl.src : ((typeof getBotanicalIllustration === 'function' && getBotanicalIllustration(slug)) || ''),
              desc: 'A key botanical ingredient in this Amber\'s Alchemy formulation.',
              categories: [],
              uses: [],
              benefits: []
            }, chip);
          }
        });
      });
    });
  }

  // ---- PATCH HERB MODAL to add "Related Botanicals" section ----
  function enhanceHerbModal(herb) {
    const body = document.getElementById('herbModalBody');
    if (!body) return;

    // Check if we already added related botanicals
    if (body.querySelector('.bic-related-botanicals')) return;

    // Find related botanicals (same category)
    if (!herb || !herb.categories || typeof BOTANICALS === 'undefined') return;
    const related = BOTANICALS.filter(h =>
      h.id !== herb.id &&
      h.categories &&
      h.categories.some(c => herb.categories.includes(c))
    ).slice(0, 6);

    if (related.length === 0) return;

    const relatedSection = document.createElement('div');
    relatedSection.className = 'herb-modal-section bic-related-botanicals';
    relatedSection.innerHTML = `
      <h4>✦ Related Botanical Allies</h4>
      <div class="bic-related-grid">
        ${related.map(r => {
          const illus = r.illustration || r.img || (typeof getBotanicalIllustration === 'function' && getBotanicalIllustration(r.id)) || '';
          return `<div class="bic-related-card" data-id="${r.id}" title="${r.name}">
            <img src="${illus}" alt="${r.name}" loading="lazy" onerror="this.style.display='none'" />
            <span class="bic-related-name">${r.emoji || '🌿'} ${r.name}</span>
            <span class="bic-related-latin">${r.latin || ''}</span>
          </div>`;
        }).join('')}
      </div>
    `;
    body.appendChild(relatedSection);

    // Add click handlers for related cards
    relatedSection.querySelectorAll('.bic-related-card').forEach(card => {
      card.addEventListener('click', function() {
        if (typeof openHerbModal === 'function') openHerbModal(this.dataset.id);
      });
    });
  }

  // ---- INTERCEPT openHerbModal to add related botanicals ----
  function patchOpenHerbModal() {
    if (typeof openHerbModal !== 'function') return;
    const orig = window.openHerbModal;
    window.openHerbModal = function(herbId) {
      orig(herbId);
      // After modal opens, enhance it
      setTimeout(() => {
        const herb = typeof BOTANICALS !== 'undefined' ? BOTANICALS.find(h => h.id === herbId) : null;
        if (herb) enhanceHerbModal(herb);
      }, 100);
    };
  }

  // ---- MAIN INIT ----
  function init() {
    createCardOverlay();
    patchOpenHerbModal();

    // Patch product cards immediately
    patchProductCards();
    patchHerbChips();

    // Observe DOM for dynamically rendered herb grids and product cards
    const observer = new MutationObserver(function(mutations) {
      let shouldPatch = false;
      mutations.forEach(m => {
        if (m.addedNodes.length > 0) shouldPatch = true;
      });
      if (shouldPatch) {
        patchProductCards();
        patchHerbChips();
        enhanceHerbGrid();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Also patch after section changes
    const origShowSection = window.showSection;
    if (typeof origShowSection === 'function') {
      window.showSection = function(id) {
        origShowSection(id);
        setTimeout(() => {
          patchProductCards();
          patchHerbChips();
          enhanceHerbGrid();
        }, 400);
      };
    }
  }

  // Run on DOMContentLoaded or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Delay slightly to let other scripts initialize BOTANICALS
    setTimeout(init, 500);
  }

  // Expose for external use
  window.BotanicalCards = { showCard, hideCard, findHerbByName, makeBotanicalChip };

})();
