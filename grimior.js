// ============================================================
// THE GRIMIOR / REAL MAGIC
// Subscription-based Book of Light Magic — healing rituals,
// herbal wisdom, sacred recipes, seasonal work, subscriber perks.
// ============================================================
(function () {
  'use strict';

  // ---- CONFIGURATION ----
  var SUBSCRIPTION_PRICE = 3.33;                // $/month
  var SUBSCRIBER_SHIPPING_THRESHOLD = 50;       // $50 for subscribers
  var STANDARD_SHIPPING_THRESHOLD = 75;         // unchanged
  var SUBSCRIBER_DISCOUNT_PCT = 10;             // 10% off every full order
  var STORAGE_KEY = 'grimior.member';           // localStorage shim
  var PREVIEW_PAGE_COUNT = 6;                   // cover + TOC + 4 ritual sample pages

  // ---- PAGE DATA ----
  // Every page object: { id, kind, chapter, title, intention, supplies[],
  //   steps[], affirmation, herbs[], products[], safety, art }
  var PAGES = [
    {
      id: 'cover', kind: 'cover', title: 'The Grimior — Real Magic',
      subtitle: 'A Living Book of Light Magic',
      dedication: 'For every soul seeking healing, wholeness, and the soft power of the herbs.',
      art: '✦ ⚗ ✦'
    },
    {
      id: 'toc', kind: 'toc', title: 'Table of Contents'
    },

    // ---- Chapter 1 — Opening Sacred Space ----
    {
      id: 'opening-sacred-space', kind: 'ritual',
      chapter: 'Opening Sacred Space', title: 'Opening Sacred Space',
      intention: 'Create a calm, protected, intentional space before any ritual, prayer, or quiet practice.',
      supplies: [
        'One white or natural beeswax candle',
        'A small bowl of filtered water',
        'Rosemary, lavender, or cedar (dried or fresh)',
        'Herbal cleansing mist — or your breath',
        'A comfortable seat and a soft cloth'
      ],
      steps: [
        'Arrange your space so it feels clear and honored. Open a window if possible.',
        'Light your candle and take three slow breaths — inhale softness, exhale tension.',
        'Pass your cleansing mist or dried herbs gently around your body and the perimeter of the space.',
        'Place your hands over your heart and say the blessing words below.',
        'Sit for a full minute in silence, letting the space settle around you.'
      ],
      affirmation: 'I consecrate this space with love. Only what is healing and holy may enter here.',
      herbs: ['Rosemary — clarity & protection', 'Lavender — peace & calm', 'Cedar — sacred boundary'],
      products: ['Cleansing mist or ritual spray', 'Ritual candle', 'Grounding herbal blend'],
      safety: 'Never leave a candle unattended. If you use dried herbs, keep a fire-safe bowl nearby.',
      art: '🕯'
    },

    // ---- Chapter 2 — Calling the Elements ----
    {
      id: 'calling-elements', kind: 'ritual',
      chapter: 'Calling on the Elements', title: 'Calling the Elements',
      intention: 'Invite the five elemental energies as gentle companions — not commanders, not demands — for the practice ahead.',
      supplies: [
        'A small stone or pinch of salt (Earth)',
        'A feather or incense stick (Air)',
        'A candle flame (Fire)',
        'A cup of water (Water)',
        'A hand over the heart (Spirit)'
      ],
      steps: [
        'Earth — hold your stone. "I honor Earth: stability, body, roots, and nourishment. Steady me."',
        'Air — raise your feather or smoke. "I honor Air: clarity, breath, thought, and true words. Clear me."',
        'Fire — gaze at the flame. "I honor Fire: courage, transformation, and warm vitality. Kindle me."',
        'Water — touch the water. "I honor Water: emotion, intuition, softness, and healing. Flow through me."',
        'Spirit — hand on heart. "I honor Spirit: connection, guidance, and wholeness. Hold me."'
      ],
      affirmation: 'Earth, Air, Fire, Water, Spirit — thank you for walking with me in love.',
      herbs: ['Sage or mugwort mist for Air', 'Cinnamon for Fire', 'Rose for Water', 'Oak moss for Earth'],
      products: ['Herbal tea', 'Ritual oil', 'Bath soak', 'Botanical soap'],
      safety: 'Keep invocations gentle and non-dogmatic. You are inviting, not commanding.',
      art: '🜃 🜁 🜂 🜄 ✦'
    },

    // ---- Chapter 7 — Lavender Sleep Spell ----
    {
      id: 'lavender-sleep-spell', kind: 'ritual',
      chapter: 'Sleep & Dream Magic', title: 'Lavender Sleep Spell',
      intention: 'Support rest, calm the nervous system, and invite peaceful dreams.',
      supplies: [
        'Dried lavender buds (a small handful)',
        'A cup of warm herbal tea — chamomile, lemon balm, or lavender',
        'A pillow or pillowcase you can bless',
        'Moonlight or soft low lamp'
      ],
      steps: [
        'Sit by a window if the moon is visible. Cradle the warm tea in both hands.',
        'Crush a few lavender buds between your fingers and breathe the scent deeply three times.',
        'Tuck a small muslin of lavender into your pillow, saying: "May my dreams be kind, my rest be deep, my body whole."',
        'Sip the tea slowly. Imagine soft silver moonlight flowing into your crown and settling in your chest.',
        'Repeat the affirmation three times, then lie down and let sleep come.'
      ],
      affirmation: 'I am safe. I am soft. I surrender into rest.',
      herbs: ['Lavender — calm & sleep', 'Chamomile — nervous system ease', 'Lemon balm — quiet mind', 'Passionflower — gentle surrender'],
      products: ['Lavender soap', 'DreamEase Capsules', 'Calming custom tea blend', 'Bath soak'],
      safety: 'Lavender is generally gentle; discontinue if skin irritation occurs. Check interactions if pregnant.',
      art: '🌙 ✦'
    },

    // ---- Chapter 8 — Rose Self-Love Ritual ----
    {
      id: 'rose-self-love', kind: 'ritual',
      chapter: 'Self-Love Rituals', title: 'Rose Self-Love Ritual',
      intention: 'Open the heart, soften inner judgment, and invite gentle, embodied self-kindness.',
      supplies: [
        'A small handful of rose petals (dried or fresh)',
        'A bowl of warm water, or a warm bath',
        'A mirror',
        'A journal and pen'
      ],
      steps: [
        'Scatter rose petals over the warm water. Breathe the scent for a slow count of five.',
        'Dip your hands (or step into the bath). Wash gently from wrist to elbow, or heart to shoulders.',
        'Stand at a mirror. Place one hand on your heart and the other on your belly.',
        'Look into your own eyes and speak the affirmation aloud, slowly, three times.',
        'Journal one sentence: "The softest kindness I will offer myself today is ___."'
      ],
      affirmation: 'I am worthy of gentleness. My heart is a sacred place, and I tend it with love.',
      herbs: ['Rose — heart opening', 'Hawthorn — heart strength', 'Tulsi — sacred softness'],
      products: ['Rose soap', 'Heart-opening herbal blend', 'Rose bath ritual item'],
      safety: 'Use food-grade rose petals if steeping for drinking tea. Otherwise external use is safe.',
      art: '🌹'
    },

    // =========== LOCKED PAGES BELOW ===========

    // ---- Chapter 3 — Cleansing & Protection ----
    {
      id: 'home-cleansing', kind: 'ritual',
      chapter: 'Cleansing & Protection', title: 'Home Cleansing Ritual',
      intention: 'Refresh the energy of a room or a whole home, returning it to clarity and warmth.',
      supplies: [
        'A cleansing spray or herbal mist',
        'A bell, singing bowl, or a simple clap',
        'A broom (for visualization)',
        'An open window'
      ],
      steps: [
        'Open every window for one full minute while you stand at the threshold.',
        'Sound the bell (or clap firmly) in each corner of the room — old stuck energy loves corners.',
        'Mist the doorways lightly with herbal spray, saying: "Only love lives here."',
        'Sweep imaginary dust from center toward the door — let the broom never touch the floor.',
        'Close with a blessing: "This home is cleansed, blessed, and filled with light."'
      ],
      affirmation: 'My home is a sanctuary. Peace lives in every corner.',
      herbs: ['Rosemary — clarity & protection', 'Cedar — sacred boundary', 'Lemon peel — brightness'],
      products: ['Cleansing spray', 'Protection herbal blend', 'Ritual soap', 'Herbal sachet'],
      safety: 'Ventilate well if you use any smoke; avoid spraying mist near electronics or children.',
      art: '🏡 ✦'
    },

    // ---- Chapter 4 — Grounding ----
    {
      id: 'root-anchor', kind: 'ritual',
      chapter: 'Grounding Rituals', title: 'Root Anchor — Body in the Earth',
      intention: 'Re-seat yourself in your body after stress, overstimulation, or travel.',
      supplies: [
        'Bare feet on floor (or on earth if possible)',
        'A grounding herbal tea or tincture',
        'A small stone or crystal',
        'Ten undisturbed minutes'
      ],
      steps: [
        'Sit or stand with bare feet flat. Press gently into the floor ten times.',
        'Hold your stone in your palm; name three things you can physically feel right now.',
        'Breathe down — inhale to your chest, exhale into your hips and feet. Repeat for seven breaths.',
        'Sip your grounding tea slowly, imagining warm amber light filling your legs.',
        'Close with: "I am here. I am in my body. I belong to this moment."'
      ],
      affirmation: 'I am rooted. I am safe. I am home in my body.',
      herbs: ['Ashwagandha — adaptogenic grounding', 'Burdock root — deep earth', 'Dandelion root — steadying'],
      products: ['Grounding herbal blend', 'Adaptogen tea', 'Bath soak'],
      safety: 'If pregnant or on prescription medications, check interactions with adaptogenic herbs first.',
      art: '🜃'
    },

    // ---- Chapter 5 — Moon Rituals ----
    {
      id: 'new-moon-intention', kind: 'ritual',
      chapter: 'Moon Rituals', title: 'New Moon Intention Setting',
      intention: 'Plant one clear, loving intention in the dark soil of the new moon.',
      supplies: [
        'A small candle (silver or white)',
        'A sheet of paper and a pen',
        'A pinch of mugwort or chamomile',
        'A quiet ten minutes within 48 hours of the new moon'
      ],
      steps: [
        'Light your candle and take three breaths — release the old.',
        'On paper, write a single sentence beginning: "I am gently calling in ___."',
        'Read it aloud three times. Between each reading, sprinkle a few leaves of your herb.',
        'Fold the paper small and place it somewhere quiet — a book, a drawer, under a plant.',
        'Close with: "What is mine by right of love will find me in perfect timing."'
      ],
      affirmation: 'I trust the quiet, dark soil of beginnings. My intention is planted in love.',
      herbs: ['Mugwort — dream & intuition', 'Chamomile — gentle calling', 'Blue lotus — soft opening'],
      products: ['Ritual candle', 'Herbal ritual oil', 'Dream herbal blend'],
      safety: 'Mugwort should be avoided during pregnancy. Use chamomile or rose instead.',
      art: '🌑'
    },

    // ---- Chapter 6 — Abundance ----
    {
      id: 'abundance-candle', kind: 'ritual',
      chapter: 'Abundance Work', title: 'Abundance Candle Casting',
      intention: 'Invite aligned, ethical prosperity — money, opportunities, or nourishment that serves the highest good.',
      supplies: [
        'One green or gold candle',
        'A pinch of cinnamon, basil, or bay leaf',
        'A gratitude list of five things you already have',
        'One concrete action you will take within 72 hours'
      ],
      steps: [
        'Dress the candle lightly — a drop of oil, a sprinkle of cinnamon or basil.',
        'Read your gratitude list aloud — abundance magic begins in what is already here.',
        'Light the candle. Name your intention in one sentence, ending in: "for the good of all, harm to none."',
        'Write your concrete action on a small card and place it under the candleholder.',
        'Let the candle burn safely for at least ten minutes. Take your action within 72 hours.'
      ],
      affirmation: 'I receive with gratitude. I give with grace. Abundance flows through me and beyond me.',
      herbs: ['Cinnamon — prosperity & warmth', 'Basil — blessings', 'Bay leaf — manifestation'],
      products: ['Abundance ritual oil', 'Grounding herbal blend', 'Botanical candle', 'Prosperity ritual kit'],
      safety: 'Ethical magic always includes the "harm to none" clause. Never leave candles unattended.',
      art: '💰 ✦'
    },

    // ---- Chapter 9 — Herbal Remedies ----
    {
      id: 'three-daily-tinctures', kind: 'ritual',
      chapter: 'Herbal Remedies', title: 'Three Daily Tinctures',
      intention: 'A gentle daily rhythm of herbal support — morning, midday, and night.',
      supplies: [
        'Morning: adaptogen tincture (ashwagandha or rhodiola)',
        'Midday: digestive bitters or ginger tincture',
        'Evening: calming tincture (passionflower, skullcap, or lemon balm)',
        'A small glass of water for each'
      ],
      steps: [
        'Morning — add 15–20 drops of adaptogen tincture to water; drink with intention for clarity.',
        'Midday — take digestive bitters or ginger before your main meal to support digestion.',
        'Evening — add a calming tincture to warm water 30 minutes before bed.',
        'Keep a small journal note of how your body responds over seven days.',
        'Adjust dosages only with the guidance of a qualified herbalist.'
      ],
      affirmation: 'My body is wise. I support it with plants that have supported humans for centuries.',
      herbs: ['Ashwagandha — adaptogen', 'Ginger — digestion', 'Passionflower — sleep & calm'],
      products: ['Custom tincture bar', 'Adaptogen blend', 'DreamEase Capsules', 'Custom Remedy Builder'],
      safety: 'Always check herb–medication interactions. Not for pregnancy, breastfeeding, or children without professional guidance.',
      art: '💧 ✦'
    },

    // ---- Chapter 10 — Kitchen Magic ----
    {
      id: 'honey-rose-infusion', kind: 'ritual',
      chapter: 'Kitchen Magic & Recipes', title: 'Honey Rose Infusion',
      intention: 'A simple, heart-opening kitchen magic recipe that becomes a sweet ritual medicine.',
      supplies: [
        '1 cup raw local honey',
        '2 tablespoons dried organic rose petals',
        '1 small clean glass jar with lid',
        'A wooden spoon (never metal for this)'
      ],
      steps: [
        'Warm the honey very gently — never hot. Stir in the rose petals with a wooden spoon.',
        'Speak a blessing: "Sweetness of rose, softness of bee — may this honey be love inside of me."',
        'Seal the jar. Place it in a sunny window for 5–7 days; turn the jar daily.',
        'Strain (or leave petals in) and store in the cupboard.',
        'Use by the spoonful in tea, on toast, or straight — whenever the heart needs softening.'
      ],
      affirmation: 'I nourish myself with sweetness, slowness, and sacred care.',
      herbs: ['Rose — heart', 'Cardamom — warmth', 'Vanilla — comfort', 'Lavender — ease'],
      products: ['Rose-infused soap', 'Heart-opening tea blend', 'Ritual bath soak'],
      safety: 'Raw honey should not be given to children under 1 year. Use food-grade organic roses only.',
      art: '🍯 🌹'
    },

    // ---- Chapter 11 — Seasonal ----
    {
      id: 'wheel-of-year', kind: 'ritual',
      chapter: 'Seasonal Rituals', title: 'The Wheel of the Year — Four Simple Marks',
      intention: 'A gentle four-part rhythm that honors the turning seasons without dogma.',
      supplies: [
        'A candle in each seasonal color (yellow spring, red summer, orange autumn, white winter)',
        'A seasonal herb for each mark',
        'A journal',
        'One evening, four times a year'
      ],
      steps: [
        'Spring Equinox — yellow candle, fresh herbs, write: "What is returning to life in me?"',
        'Summer Solstice — red candle, rose or basil, write: "What is in full bloom?"',
        'Autumn Equinox — orange candle, sage, write: "What am I harvesting? What am I releasing?"',
        'Winter Solstice — white candle, rosemary or cedar, write: "What is quietly waiting to be reborn?"',
        'Read all four reflections on the next equinox — a map of your year of wholeness.'
      ],
      affirmation: 'I move with the seasons. I trust the rhythm of return.',
      herbs: ['Spring: chamomile, violet', 'Summer: rose, basil', 'Autumn: sage, elderberry', 'Winter: rosemary, cedar'],
      products: ['Seasonal ritual bundle', 'Botanical candle', 'Seasonal tea blend'],
      safety: 'Adapt for your climate and hemisphere — the wheel bends to where you live.',
      art: '🌱 ☀ 🍂 ❄'
    },

    // ---- Chapter 12 — Closing ----
    {
      id: 'closing-sacred-space', kind: 'ritual',
      chapter: 'Closing Sacred Space', title: 'Gratitude Release',
      intention: 'Close every ritual with gratitude — sealing the work and returning the space to daily life.',
      supplies: [
        'The candle from your opening',
        'A glass of fresh water',
        'Your breath',
        'One word of thanks'
      ],
      steps: [
        'Place your hands on your heart. Take three slow breaths and name three things you are grateful for.',
        'Thank the Elements in the order you called them — Earth, Air, Fire, Water, Spirit — with a simple "thank you."',
        'Sip the fresh water to seal the practice in your body.',
        'Snuff the candle (never blow it out) and say: "The circle is open but unbroken. May peace go with me."',
        'Stand, stretch, and return gently to your day.'
      ],
      affirmation: 'Thank you. Thank you. Thank you. The work is done in love.',
      herbs: ['Rosemary — sealing clarity', 'Lavender — soft release', 'Cedar — grounding close'],
      products: ['Cleansing mist', 'Ritual candle', 'Gratitude tea blend'],
      safety: 'Always verify your candle is fully extinguished before leaving the room.',
      art: '✦ ─ ✦'
    }
  ];

  var CHAPTERS = [
    { id: 'chapter-1',  label: 'Opening Sacred Space',    pageId: 'opening-sacred-space' },
    { id: 'chapter-2',  label: 'Calling on the Elements', pageId: 'calling-elements' },
    { id: 'chapter-3',  label: 'Cleansing & Protection',  pageId: 'home-cleansing' },
    { id: 'chapter-4',  label: 'Grounding Rituals',       pageId: 'root-anchor' },
    { id: 'chapter-5',  label: 'Moon Rituals',            pageId: 'new-moon-intention' },
    { id: 'chapter-6',  label: 'Abundance Work',          pageId: 'abundance-candle' },
    { id: 'chapter-7',  label: 'Sleep & Dream Magic',     pageId: 'lavender-sleep-spell' },
    { id: 'chapter-8',  label: 'Self-Love Rituals',       pageId: 'rose-self-love' },
    { id: 'chapter-9',  label: 'Herbal Remedies',         pageId: 'three-daily-tinctures' },
    { id: 'chapter-10', label: 'Kitchen Magic & Recipes', pageId: 'honey-rose-infusion' },
    { id: 'chapter-11', label: 'Seasonal Rituals',        pageId: 'wheel-of-year' },
    { id: 'chapter-12', label: 'Closing Sacred Space',    pageId: 'closing-sacred-space' }
  ];

  // ---- STATE ----
  var state = {
    pageIndex: 0,
    member: loadMember(),
    checking: false
  };

  function isActive(member) {
    if (!member || !member.email) return false;
    if (member.status !== 'active') return false;
    if (member.expiresAt && Date.now() > Date.parse(member.expiresAt)) return false;
    return true;
  }

  function loadMember() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return parsed && parsed.email ? parsed : null;
    } catch (_) { return null; }
  }

  function saveMember(m) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(m || {})); } catch (_) {}
    state.member = m || null;
    applyMemberBenefitsGlobally();
  }

  function clearMember() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    state.member = null;
    applyMemberBenefitsGlobally();
  }

  // ---- BENEFITS (applied to the site for active subscribers) ----
  function applyMemberBenefitsGlobally() {
    var active = isActive(state.member);
    try {
      window.GRIMIOR_ACTIVE = active;
      window.GRIMIOR_DISCOUNT_PCT = active ? SUBSCRIBER_DISCOUNT_PCT : 0;
      window.GRIMIOR_FREE_SHIP_THRESHOLD = active ? SUBSCRIBER_SHIPPING_THRESHOLD : STANDARD_SHIPPING_THRESHOLD;
    } catch (_) {}
    document.body.classList.toggle('grimior-member', active);
    renderMemberBadge();
  }

  function renderMemberBadge() {
    var el = document.getElementById('grimiorMemberBadge');
    if (!el) return;
    if (isActive(state.member)) {
      el.innerHTML = '<span class="gb-dot"></span> Grimior Member · ' + escapeHtml(state.member.email) +
        ' <button class="gb-signout" type="button" id="grimiorSignOut">Sign out</button>';
      el.style.display = 'inline-flex';
      var out = document.getElementById('grimiorSignOut');
      if (out) out.addEventListener('click', function () { clearMember(); render(); });
    } else {
      el.innerHTML = '';
      el.style.display = 'none';
    }
  }

  // ---- RENDERING ----
  function render() {
    var viewport = document.getElementById('grimiorPageViewport');
    var tabs = document.getElementById('grimiorChapterTabs');
    if (!viewport) return;

    var idx = Math.max(0, Math.min(state.pageIndex, PAGES.length - 1));
    state.pageIndex = idx;
    var page = PAGES[idx];
    var locked = !isActive(state.member) && idx >= PREVIEW_PAGE_COUNT;

    viewport.classList.remove('is-turning-forward', 'is-turning-back');
    // reflow to allow re-animation
    void viewport.offsetWidth;
    viewport.classList.add(state._lastDir === 'back' ? 'is-turning-back' : 'is-turning-forward');

    if (page.kind === 'cover')     viewport.innerHTML = renderCover(page);
    else if (page.kind === 'toc')  viewport.innerHTML = renderTOC();
    else if (locked)               viewport.innerHTML = renderLocked(page);
    else                           viewport.innerHTML = renderRitual(page, idx);

    // footer indicators
    var indicator = document.getElementById('grimiorPageIndicator');
    if (indicator) indicator.textContent = 'Page ' + (idx + 1) + ' of ' + PAGES.length;

    // disable arrows at bounds
    var prev = document.getElementById('grimiorPrev');
    var next = document.getElementById('grimiorNext');
    if (prev) prev.disabled = idx === 0;
    if (next) next.disabled = idx === PAGES.length - 1;

    // chapter tab highlight
    if (tabs) {
      var activeChapterId = null;
      for (var i = 0; i < CHAPTERS.length; i++) {
        if (CHAPTERS[i].pageId === page.id) { activeChapterId = CHAPTERS[i].id; break; }
      }
      tabs.querySelectorAll('.g-chapter-tab').forEach(function (t) {
        t.classList.toggle('active', t.dataset.chapterId === activeChapterId);
      });
    }

    // bind links inside rendered page
    viewport.querySelectorAll('[data-grimior-toc]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        goToPageId(el.dataset.grimiorToc);
      });
    });
    viewport.querySelectorAll('[data-grimior-action="subscribe"]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        openSubscribeFlow();
      });
    });
    viewport.querySelectorAll('[data-grimior-action="unlock"]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        openUnlockFlow();
      });
    });

    maybePlayTurnSound();
  }

  function renderCover(page) {
    return [
      '<article class="g-page g-page-cover">',
      '  <div class="g-cover-frame">',
      '    <div class="g-cover-ornament">' + page.art + '</div>',
      '    <h1 class="g-cover-title">The Grimior</h1>',
      '    <p class="g-cover-kicker">Real Magic</p>',
      '    <p class="g-cover-subtitle">' + escapeHtml(page.subtitle) + '</p>',
      '    <p class="g-cover-dedication">' + escapeHtml(page.dedication) + '</p>',
      '    <p class="g-cover-byline">Amber\'s Alchemy Apothecary · A Book of Light Magic</p>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function renderTOC() {
    var items = CHAPTERS.map(function (c, i) {
      return '<li><a href="#" data-grimior-toc="' + c.pageId + '">' +
        '<span class="g-toc-num">' + (i + 1) + '.</span>' +
        '<span class="g-toc-label">' + escapeHtml(c.label) + '</span>' +
        '<span class="g-toc-dots"></span>' +
        '<span class="g-toc-page">' + (findIndexById(c.pageId) + 1) + '</span>' +
        '</a></li>';
    }).join('');
    return [
      '<article class="g-page g-page-toc">',
      '  <header class="g-toc-header">',
      '    <div class="g-ornament">✦ ⚗ ✦</div>',
      '    <h2>Table of Contents</h2>',
      '    <p>Twelve chapters of light magic, herbal wisdom, and sacred practice.</p>',
      '  </header>',
      '  <ol class="g-toc-list">' + items + '</ol>',
      '  <footer class="g-toc-footer">',
      '    <p class="g-toc-note">The first four rituals are offered freely. The rest awaken with your key.</p>',
      '  </footer>',
      '</article>'
    ].join('');
  }

  function renderRitual(page, idx) {
    var bullets = function (arr) { return (arr || []).map(function (s) { return '<li>' + escapeHtml(s) + '</li>'; }).join(''); };
    var tags = function (arr) { return (arr || []).map(function (s) { return '<span class="g-tag">' + escapeHtml(s) + '</span>'; }).join(''); };
    var linksFor = function (name) {
      var lower = String(name).toLowerCase();
      if (/soap/.test(lower))     return 'data-section="soaps"';
      if (/tea|blend|tincture|remedy|formula|dream|capsule|calm/.test(lower)) return 'data-section="shop"';
      if (/bath|ritual|candle|mist|spray|kit/.test(lower)) return 'data-section="shop"';
      if (/builder/.test(lower)) return 'data-section="custom-formula"';
      return 'data-section="shop"';
    };
    var productBtns = (page.products || []).map(function (p) {
      return '<button class="g-product-chip" type="button" ' + linksFor(p) + '>✦ ' + escapeHtml(p) + '</button>';
    }).join('');
    var pageNum = idx + 1;
    var preview = !isActive(state.member) && idx < PREVIEW_PAGE_COUNT;
    return [
      '<article class="g-page g-page-ritual">',
      '  <header class="g-ritual-header">',
      '    <p class="g-chapter-kicker">' + escapeHtml(page.chapter || '') + '</p>',
      '    <h2 class="g-ritual-title">' + escapeHtml(page.title) + '</h2>',
      '    <div class="g-ornament">' + (page.art || '✦') + '</div>',
      preview ? '    <span class="g-preview-badge">Free sample page</span>' : '',
      '  </header>',
      '  <section class="g-section">',
      '    <h3>Intention</h3>',
      '    <p class="g-intention">' + escapeHtml(page.intention || '') + '</p>',
      '  </section>',
      '  <section class="g-section g-two-col">',
      '    <div>',
      '      <h3>Supplies</h3>',
      '      <ul class="g-list">' + bullets(page.supplies) + '</ul>',
      '    </div>',
      '    <div>',
      '      <h3>Suggested Herbs</h3>',
      '      <div class="g-tag-row">' + tags(page.herbs) + '</div>',
      '    </div>',
      '  </section>',
      '  <section class="g-section">',
      '    <h3>Ritual Steps</h3>',
      '    <ol class="g-list g-list-ordered">' + bullets(page.steps) + '</ol>',
      '  </section>',
      '  <section class="g-section g-affirmation">',
      '    <h3>Affirmation</h3>',
      '    <blockquote>' + escapeHtml(page.affirmation || '') + '</blockquote>',
      '  </section>',
      '  <section class="g-section">',
      '    <h3>From the Apothecary</h3>',
      '    <div class="g-product-row">' + productBtns + '</div>',
      '  </section>',
      page.safety ? '  <section class="g-section g-safety"><h3>Safe & Gentle Use</h3><p>' + escapeHtml(page.safety) + '</p></section>' : '',
      '  <footer class="g-page-foot"><span>✦</span><span>Page ' + pageNum + '</span><span>✦</span></footer>',
      '</article>'
    ].join('');
  }

  function renderLocked(page) {
    return [
      '<article class="g-page g-page-locked" aria-hidden="false">',
      '  <div class="g-locked-blur" aria-hidden="true">',
      '    <h2>' + escapeHtml(page.title) + '</h2>',
      '    <p class="g-chapter-kicker">' + escapeHtml(page.chapter || '') + '</p>',
      '    <p>' + escapeHtml((page.intention || '').slice(0, 140)) + '…</p>',
      '    <ul class="g-list">' +
          (page.supplies || []).slice(0, 3).map(function (s) { return '<li>' + escapeHtml(s.slice(0, 60)) + '…</li>'; }).join('') +
      '    </ul>',
      '  </div>',
      '  <div class="g-locked-card">',
      '    <div class="g-ornament">✦ ⚗ ✦</div>',
      '    <h2 class="g-locked-headline">Unlock The Grimior / Real Magic</h2>',
      '    <p class="g-locked-sub">Step inside a living book of light magic, herbal wisdom, healing rituals, sacred recipes, and subscriber-only apothecary blessings.</p>',
      '    <div class="g-locked-price">',
      '      <span class="g-price-big">$3.33</span><span class="g-price-per">/month</span>',
      '    </div>',
      '    <ul class="g-locked-perks">',
      '      <li>✦ Full access to every grimoire page, forever updated</li>',
      '      <li>✦ 10% off every full order</li>',
      '      <li>✦ Free shipping on orders over $50</li>',
      '      <li>✦ Weekly featured deals &amp; monthly promo code</li>',
      '      <li>✦ Subscriber-only seasonal rituals &amp; newsletters</li>',
      '    </ul>',
      '    <button class="btn-primary g-cta" type="button" data-grimior-action="subscribe">Join for $3.33/month</button>',
      '    <button class="g-linkish" type="button" data-grimior-action="unlock">Already a subscriber? Unlock with your email →</button>',
      '    <p class="g-locked-note">Cancel anytime. New rituals, recipes, articles, and magical teachings added regularly.</p>',
      '  </div>',
      '</article>'
    ].join('');
  }

  // ---- NAVIGATION ----
  function turn(dir) {
    state._lastDir = dir;
    if (dir === 'next' && state.pageIndex < PAGES.length - 1) state.pageIndex++;
    if (dir === 'back' && state.pageIndex > 0) state.pageIndex--;
    render();
  }

  function goToPageId(id) {
    var i = findIndexById(id);
    if (i < 0) return;
    state._lastDir = i >= state.pageIndex ? 'next' : 'back';
    state.pageIndex = i;
    render();
  }

  function findIndexById(id) {
    for (var i = 0; i < PAGES.length; i++) if (PAGES[i].id === id) return i;
    return -1;
  }

  // ---- SUBSCRIBE + UNLOCK FLOWS ----
  function openSubscribeFlow() {
    var modal = ensureModal();
    modal.body.innerHTML = [
      '<div class="g-modal-head">',
      '  <div class="g-ornament">✦ ⚗ ✦</div>',
      '  <h3>Unlock The Grimior</h3>',
      '  <p class="g-modal-sub">A living book of light magic for $3.33/month. Cancel anytime.</p>',
      '</div>',
      '<form class="g-form" id="grimiorSubscribeForm" novalidate>',
      '  <label class="g-field"><span>Name</span><input type="text" name="name" autocomplete="name" required placeholder="Your name" /></label>',
      '  <label class="g-field"><span>Email</span><input type="email" name="email" autocomplete="email" required placeholder="you@example.com" /></label>',
      '  <ul class="g-inline-perks">',
      '    <li>✦ Every grimoire page unlocked</li>',
      '    <li>✦ 10% off every order · free shipping over $50</li>',
      '    <li>✦ Weekly deals · monthly promo code · seasonal rituals</li>',
      '  </ul>',
      '  <button class="btn-primary g-cta" type="submit">Continue to Shopify Checkout</button>',
      '  <p class="g-fine-print">You will be redirected to Shopify’s secure checkout for a recurring $3.33/month subscription. Admin is notified on every join, renewal, or cancellation.</p>',
      '  <button class="g-linkish" type="button" id="grimiorHasEmail">I already subscribed — unlock with my email</button>',
      '</form>',
      '<div class="g-form-status" id="grimiorSubscribeStatus" role="status" aria-live="polite"></div>'
    ].join('');
    showModal();
    var form = document.getElementById('grimiorSubscribeForm');
    form.addEventListener('submit', function (e) { e.preventDefault(); submitSubscribe(form); });
    var switchBtn = document.getElementById('grimiorHasEmail');
    if (switchBtn) switchBtn.addEventListener('click', function () { openUnlockFlow(); });
  }

  function submitSubscribe(form) {
    var name = (form.name.value || '').trim();
    var email = (form.email.value || '').trim().toLowerCase();
    var status = document.getElementById('grimiorSubscribeStatus');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.textContent = 'Please enter a valid email.';
      status.className = 'g-form-status g-form-error';
      return;
    }
    status.textContent = 'Preparing your secure checkout…';
    status.className = 'g-form-status';
    var successUrl = window.location.origin + '/?grimior=success';
    var cancelUrl  = window.location.origin + '/?grimior=cancelled';
    // Remember who this subscriber is so we can activate them after the
    // Shopify redirect comes back with ?grimior=success.
    try {
      localStorage.setItem('grimior.pendingEmail', JSON.stringify({ email: email, name: name, at: Date.now() }));
    } catch (_) {}
    fetch('/.netlify/functions/grimior-subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, email: email, successUrl: successUrl, cancelUrl: cancelUrl })
    })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (data) {
        if (data && data.checkoutUrl) {
          status.textContent = 'Redirecting to secure checkout…';
          window.location.href = data.checkoutUrl;
          return;
        }
        if (data && data.pending) {
          // Checkout not configured yet — admin notified; show confirmation.
          status.innerHTML = 'Thank you — Amber has been notified and will reach out with your personal grimoire access within one business day.';
          status.className = 'g-form-status g-form-success';
          return;
        }
        status.textContent = (data && data.error) || 'We could not start checkout. Please try again or email awaken@consultant.com.';
        status.className = 'g-form-status g-form-error';
      })
      .catch(function () {
        status.textContent = 'Network error. Please try again.';
        status.className = 'g-form-status g-form-error';
      });
  }

  function openUnlockFlow() {
    var modal = ensureModal();
    modal.body.innerHTML = [
      '<div class="g-modal-head">',
      '  <div class="g-ornament">✦ ⚗ ✦</div>',
      '  <h3>Unlock With Your Email</h3>',
      '  <p class="g-modal-sub">Enter the email you used to subscribe. We will verify your active membership.</p>',
      '</div>',
      '<form class="g-form" id="grimiorUnlockForm" novalidate>',
      '  <label class="g-field"><span>Email</span><input type="email" name="email" autocomplete="email" required placeholder="you@example.com" /></label>',
      '  <button class="btn-primary g-cta" type="submit">Unlock The Grimior</button>',
      '  <button class="g-linkish" type="button" id="grimiorBackToJoin">Not a subscriber yet? Join for $3.33/month →</button>',
      '</form>',
      '<div class="g-form-status" id="grimiorUnlockStatus" role="status" aria-live="polite"></div>'
    ].join('');
    showModal();
    var form = document.getElementById('grimiorUnlockForm');
    form.addEventListener('submit', function (e) { e.preventDefault(); submitUnlock(form); });
    var back = document.getElementById('grimiorBackToJoin');
    if (back) back.addEventListener('click', function () { openSubscribeFlow(); });
  }

  function submitUnlock(form) {
    var email = (form.email.value || '').trim().toLowerCase();
    var status = document.getElementById('grimiorUnlockStatus');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.textContent = 'Please enter a valid email.';
      status.className = 'g-form-status g-form-error';
      return;
    }
    status.textContent = 'Checking your membership…';
    status.className = 'g-form-status';
    fetch('/.netlify/functions/grimior-status?email=' + encodeURIComponent(email))
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (data) {
        if (data && data.active) {
          saveMember({ email: email, status: 'active', expiresAt: data.expiresAt || null, promoCode: data.promoCode || null });
          status.innerHTML = 'Welcome back ✦ The grimoire is unlocked.';
          status.className = 'g-form-status g-form-success';
          setTimeout(function () { hideModal(); render(); }, 900);
        } else {
          status.innerHTML = 'We could not find an active subscription for that email. <a href="#" id="grimiorTryJoin">Join now →</a>';
          status.className = 'g-form-status g-form-error';
          var a = document.getElementById('grimiorTryJoin');
          if (a) a.addEventListener('click', function (e) { e.preventDefault(); openSubscribeFlow(); });
        }
      })
      .catch(function () {
        status.textContent = 'Network error. Please try again.';
        status.className = 'g-form-status g-form-error';
      });
  }

  // ---- MODAL PLUMBING ----
  function ensureModal() {
    var root = document.getElementById('grimiorModal');
    if (!root) {
      root = document.createElement('div');
      root.id = 'grimiorModal';
      root.className = 'g-modal';
      root.setAttribute('role', 'dialog');
      root.setAttribute('aria-modal', 'true');
      root.innerHTML = [
        '<div class="g-modal-backdrop" data-close="1"></div>',
        '<div class="g-modal-panel">',
        '  <button class="g-modal-close" aria-label="Close" data-close="1">✕</button>',
        '  <div class="g-modal-body" id="grimiorModalBody"></div>',
        '</div>'
      ].join('');
      document.body.appendChild(root);
      root.addEventListener('click', function (e) {
        if (e.target.dataset && e.target.dataset.close) hideModal();
      });
    }
    return { root: root, body: document.getElementById('grimiorModalBody') };
  }

  function showModal() {
    var m = ensureModal();
    m.root.classList.add('is-open');
    document.body.classList.add('g-modal-open');
  }
  function hideModal() {
    var m = ensureModal();
    m.root.classList.remove('is-open');
    document.body.classList.remove('g-modal-open');
  }

  // ---- OPTIONAL PAGE-TURN SOUND (silent WebAudio blip — respects prefers-reduced-motion) ----
  var audioCtx = null;
  function maybePlayTurnSound() {
    try {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (!window.AudioContext && !window.webkitAudioContext) return;
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') return; // do not force resume
      var o = audioCtx.createOscillator();
      var g = audioCtx.createGain();
      o.frequency.value = 340; o.type = 'sine';
      g.gain.value = 0.0001;
      g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18);
      o.connect(g); g.connect(audioCtx.destination);
      o.start(); o.stop(audioCtx.currentTime + 0.2);
    } catch (_) { /* silent — sound is optional */ }
  }

  // ---- UTIL ----
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ---- SUCCESS REDIRECT HANDLING ----
  function handleSuccessRedirect() {
    try {
      var params = new URLSearchParams(window.location.search);
      var status = params.get('grimior');
      if (!status) return;
      if (status === 'success') {
        // Look up the pending subscriber — we stored their email when they
        // started the Shopify checkout. The Shopify webhook flips status to
        // active once the payment clears; this call reads that server-side
        // state and sends the welcome email on first unlock.
        var pending = null;
        try { pending = JSON.parse(localStorage.getItem('grimior.pendingEmail') || 'null'); } catch (_) {}
        var pendingEmail = (pending && pending.email) || '';
        fetch('/.netlify/functions/grimior-activate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: pendingEmail })
        })
          .then(function (r) { return r.json().catch(function () { return {}; }); })
          .then(function (data) {
            if (data && data.active && pendingEmail) {
              saveMember({ email: pendingEmail, status: 'active', expiresAt: data.expiresAt || null, promoCode: data.promoCode || null });
              try { localStorage.removeItem('grimior.pendingEmail'); } catch (_) {}
            }
            if (typeof window.showSection === 'function') window.showSection('grimior');
            state.pageIndex = 2; // first unlocked content page
            render();
            if (typeof window.showToast === 'function') {
              window.showToast(data && data.active
                ? 'Welcome to The Grimior ✦'
                : 'Thank you — your membership is being confirmed. We will unlock your access the moment Shopify confirms the payment.');
            }
          })
          .catch(function () {
            if (typeof window.showSection === 'function') window.showSection('grimior');
          });
      } else if (status === 'cancelled') {
        if (typeof window.showSection === 'function') window.showSection('grimior');
      }
      // Clean the URL
      var url = window.location.origin + window.location.pathname;
      window.history.replaceState({}, '', url);
    } catch (_) {}
  }

  // ---- INIT ----
  function init() {
    var host = document.getElementById('grimiorBookHost');
    if (!host) return;

    // Chapter tabs
    var tabs = document.getElementById('grimiorChapterTabs');
    if (tabs) {
      tabs.innerHTML = CHAPTERS.map(function (c) {
        return '<button class="g-chapter-tab" type="button" data-chapter-id="' + c.id + '" data-page-id="' + c.pageId + '">' +
          escapeHtml(c.label) + '</button>';
      }).join('');
      tabs.addEventListener('click', function (e) {
        var btn = e.target.closest('.g-chapter-tab');
        if (!btn) return;
        goToPageId(btn.dataset.pageId);
      });
    }

    // Arrow buttons
    var prev = document.getElementById('grimiorPrev');
    var next = document.getElementById('grimiorNext');
    if (prev) prev.addEventListener('click', function () { turn('back'); });
    if (next) next.addEventListener('click', function () { turn('next'); });

    // Keyboard navigation when grimior is visible
    document.addEventListener('keydown', function (e) {
      var section = document.getElementById('grimior');
      if (!section || !section.classList.contains('active')) return;
      var tag = (e.target && e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.key === 'ArrowRight') turn('next');
      else if (e.key === 'ArrowLeft') turn('back');
    });

    // Swipe for mobile
    var viewport = document.getElementById('grimiorPageViewport');
    if (viewport) {
      var startX = null;
      viewport.addEventListener('touchstart', function (e) { if (e.touches[0]) startX = e.touches[0].clientX; }, { passive: true });
      viewport.addEventListener('touchend', function (e) {
        if (startX == null) return;
        var endX = (e.changedTouches[0] || {}).clientX;
        if (endX == null) return;
        var dx = endX - startX;
        if (Math.abs(dx) > 40) turn(dx < 0 ? 'next' : 'back');
        startX = null;
      }, { passive: true });
    }

    // Bookmark — jump to last-viewed unlocked page
    var bookmark = document.getElementById('grimiorBookmark');
    if (bookmark) {
      bookmark.addEventListener('click', function () {
        try {
          var saved = Number(localStorage.getItem('grimior.lastPage') || 0);
          if (!isNaN(saved) && saved >= 0 && saved < PAGES.length) { state.pageIndex = saved; render(); }
        } catch (_) {}
      });
    }

    applyMemberBenefitsGlobally();
    handleSuccessRedirect();
    render();

    // Persist last-visited page
    document.addEventListener('click', function () {
      try { localStorage.setItem('grimior.lastPage', String(state.pageIndex)); } catch (_) {}
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose a gentle API
  window.Grimior = {
    open: function () { if (typeof window.showSection === 'function') window.showSection('grimior'); render(); },
    subscribe: openSubscribeFlow,
    unlock: openUnlockFlow,
    isActive: function () { return isActive(state.member); },
    member: function () { return state.member; },
    signOut: function () { clearMember(); render(); }
  };
})();
