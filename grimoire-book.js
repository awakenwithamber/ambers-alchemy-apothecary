/*
 * Living Grimoire Book — an interactive page-flip tome of rituals and
 * botanical wisdom. Complements the existing herb index / explorer without
 * replacing any of it. Opens as a full-screen overlay; mobile-friendly.
 *
 * Content is curated, ethical, non-harmful, and empowering — sleep, cleansing,
 * grounding, abundance, moon work, bath + tea rituals, blessings, gentle
 * manifestation journaling, and positive-use symbolic practice.
 */

(function () {
  'use strict';

  // ---------- PAGES ----------
  // Each page is a self-contained ritual or practice. Rendered as facing
  // left/right spreads on desktop, single pages on mobile. First entry is the
  // cover, last entry is the closing blessing.
  var PAGES = [
    {
      type: 'cover',
      title: 'The Living Grimoire',
      subtitle: 'Rituals, Remedies &amp; Small Magics',
      by: 'A companion volume from Amber\u2019s Alchemy Apothecary',
      ornament: '\u2729',
    },
    {
      type: 'toc',
      title: 'Table of Contents',
      items: [
        'I. Cleansing Rituals',
        'II. Sleep &amp; Rest',
        'III. Grounding Practices',
        'IV. Moon Rituals',
        'V. Bath Rituals',
        'VI. Tea Rituals',
        'VII. Abundance Rituals',
        'VIII. Altar &amp; Self-Care',
        'IX. Blessing Rituals',
        'X. Manifestation Journaling',
        'XI. Gentle Spellwork',
        'XII. Herbal Remedies at Home',
      ],
    },
    {
      type: 'ritual',
      chapter: 'I',
      title: 'A Simple Cleansing Ritual',
      emoji: '\u{1F33F}',
      intent: 'Clear stagnant energy from a room, a doorway, or yourself.',
      time: '5\u201310 minutes',
      supplies: ['Dried rosemary or white sage (ethically harvested)', 'A shell or heat-safe dish', 'A window you can open', 'A match'],
      steps: [
        'Open a window. Let the room breathe.',
        'Light the bundle and let it smoulder, never flame.',
        'Move the smoke along doorways, corners, over your palms.',
        'Speak aloud what you release: an old argument, a worry, a name.',
        'Place the bundle in the shell until it rests. Close the window when ready.',
      ],
      pairing: 'Pair with Rose Renewal Balm on your hands afterwards to close the ritual with softness.',
      note: 'If smoke is not right for your space, use a bowl of cool salt water and a sprig of rosemary instead. Dip, flick lightly, speak the same words.',
    },
    {
      type: 'ritual',
      chapter: 'II',
      title: 'The Sleep Ritual',
      emoji: '\u{1F319}',
      intent: 'Cross the threshold from doing into rest.',
      time: '15 minutes',
      supplies: ['Warm herbal tea (chamomile, tulsi, or lavender)', 'A dim lamp or candle', 'One paper and one pen'],
      steps: [
        'Dim the lights an hour before bed. No screens for the last fifteen minutes.',
        'Brew a cup of slow tea. Watch it steep.',
        'Write down three thoughts you are carrying \u2014 they can come back in the morning if they still matter.',
        'Rest a palm on your chest. Breathe in four counts, out six.',
        'Whisper: \u201cThe day is complete. I am allowed to rest.\u201d',
      ],
      pairing: 'A drop of Sleep Tonic behind the ears, or on the pulse of the wrist.',
      note: 'Repeat nightly for a week. Ritual strengthens through return.',
    },
    {
      type: 'ritual',
      chapter: 'III',
      title: 'Grounding Before the Day',
      emoji: '\u{1F331}',
      intent: 'Return to your body before the first email, the first demand, the first scroll.',
      time: '7 minutes',
      supplies: ['Bare feet on the floor', 'A glass of water', 'One hand on your belly'],
      steps: [
        'Stand with your feet hip-width apart. Press each sole into the floor.',
        'Drink half the glass of water, slowly, noticing swallow.',
        'Rest one hand on your belly. Breathe so the hand rises and falls.',
        'Name three things around you you can see, two you can hear, one you can feel.',
        'Say quietly: \u201cI begin here. Whole.\u201d',
      ],
      pairing: 'Grounding Tincture \u2014 three drops under the tongue, held for a breath.',
      note: 'No props required. This practice travels.',
    },
    {
      type: 'ritual',
      chapter: 'IV',
      title: 'A Gentle Moon Ritual',
      emoji: '\u{1F319}',
      intent: 'Mark the new moon (plant) or the full moon (release).',
      time: '20 minutes',
      supplies: ['A small candle', 'A notebook', 'A bowl of water by a window'],
      steps: [
        'At the new moon: write one seed of an intention. Small, specific, yours.',
        'Place the paper under the water bowl on a windowsill that sees the sky.',
        'At the full moon: take the paper out. Read it aloud.',
        'Decide what is ripe and what is released. Keep one, thank and tear the other.',
        'Pour the water into a plant. Nothing is wasted.',
      ],
      pairing: 'A bath with Moonflower Soap the night of the full moon.',
      note: 'The moon does the work of holding steady. You simply notice.',
    },
    {
      type: 'ritual',
      chapter: 'V',
      title: 'The Bath Ritual',
      emoji: '\u{1FAE7}',
      intent: 'Change states \u2014 from scattered into whole, from tight into soft.',
      time: '30 minutes',
      supplies: ['Warm bathwater', 'One of: rose petals, lavender buds, Epsom salt, oat milk', 'A soap bar you love'],
      steps: [
        'Fill the bath while you clean one small thing in the room. Let the room soften with you.',
        'Add your botanicals or salts. Stir the water three times, clockwise.',
        'Step in slowly. Do not rush the entry.',
        'Speak a single word that you need today: ease, soften, trust.',
        'When you rise, wrap warmly. Do not check your phone for an hour.',
      ],
      pairing: 'A custom-crafted bar (try the Custom Soap Builder) with botanicals tuned to your mood.',
      note: 'The water is already holy. You do not have to earn it.',
    },
    {
      type: 'ritual',
      chapter: 'VI',
      title: 'The Tea Ritual',
      emoji: '\u{1F375}',
      intent: 'A five-minute ceremony for any day.',
      time: '5\u201310 minutes',
      supplies: ['Loose-leaf herbal tea', 'A teapot or infuser', 'One quiet window'],
      steps: [
        'Boil the water. While it heats, name the tea aloud and what you asked it for.',
        'Pour over the herbs. Count slowly to ten as the steam rises.',
        'Steep four minutes \u2014 do not cheat the time.',
        'Hold the cup in both hands before the first sip. Warm your palms first.',
        'Drink in silence or in soft company.',
      ],
      pairing: 'A custom blend from the Apothecary shop or one Amber builds for your body.',
      note: 'The ritual is not the tea. The ritual is the pause.',
    },
    {
      type: 'ritual',
      chapter: 'VII',
      title: 'An Abundance Ritual',
      emoji: '\u2728',
      intent: 'Shift from scarcity (\u201cnever enough\u201d) into sufficiency (\u201cenough, now\u201d).',
      time: '15 minutes',
      supplies: ['A small bowl', 'A handful of dried bay leaves or uncooked rice', 'A green or gold candle (optional)'],
      steps: [
        'Sit with the bowl. Breathe three rounds of four-in / six-out.',
        'Drop one leaf (or a pinch of rice) into the bowl for every thing you already have. Say each aloud.',
        'Keep going past the easy list \u2014 teeth, water, a friend who checks in, a book you loved.',
        'When the bowl feels full, hold it to your chest.',
        'Whisper: \u201cI notice. I am held. More is on its way.\u201d',
      ],
      pairing: 'Carry one bay leaf in your wallet until it crumbles.',
      note: 'Abundance is a perception practice. Start with what is already true.',
    },
    {
      type: 'ritual',
      chapter: 'VIII',
      title: 'Building a Small Altar',
      emoji: '\u{1F56F}',
      intent: 'A corner of a room that belongs only to your inner life.',
      time: 'A weekend, slowly',
      supplies: ['A surface \u2014 shelf, stool, windowsill', 'One candle', 'One natural object (shell, stone, pressed flower)', 'One image or word that grounds you'],
      steps: [
        'Clean the surface with a soft cloth. Open a window.',
        'Place the candle in the centre. Light it when you visit.',
        'Add one natural object \u2014 a reminder of time and seasons.',
        'Add one image, quote, or pressed flower that represents who you are becoming.',
        'Return to the altar each morning for one minute. That is all.',
      ],
      pairing: 'A soap, tea, or tincture you keep only for this corner \u2014 used rarely, ritually.',
      note: 'An altar is not about belief. It is about attention.',
    },
    {
      type: 'ritual',
      chapter: 'IX',
      title: 'A Blessing for Someone You Love',
      emoji: '\u{1F54A}',
      intent: 'Send care at a distance, without asking anything back.',
      time: '5 minutes',
      supplies: ['A candle', 'A slip of paper with their name'],
      steps: [
        'Light the candle. Place the name in front of it.',
        'Picture them the last time they laughed.',
        'Whisper three kind, true things about them.',
        'Ask only for their ease \u2014 not for your outcome.',
        'Blow the candle out. Keep the paper in a book.',
      ],
      pairing: 'A drop of your favourite oil on the paper, to carry scent alongside intention.',
      note: 'Blessings are not persuasion. They are witnessing.',
    },
    {
      type: 'ritual',
      chapter: 'X',
      title: 'Manifestation Journaling Prompts',
      emoji: '\u{1F4DC}',
      intent: 'Move longings from vague to specific \u2014 so they can be met halfway.',
      time: '10\u201320 minutes',
      prompts: [
        'What is one small, very specific thing I want in the next 30 days?',
        'What would I need to believe about myself to receive it?',
        'Whose permission am I still waiting for? Can I give it to myself today?',
        'What am I pretending not to want?',
        'What have I already received this season that I have not thanked yet?',
        'If I trusted this was already on its way, how would I spend today?',
      ],
      note: 'Write longhand when you can. The body knows before the words arrive.',
    },
    {
      type: 'ritual',
      chapter: 'XI',
      title: 'A Gentle, Ethical Spell for Clarity',
      emoji: '\u{1F52E}',
      intent: 'Only ever for the good of you and those around you. Never coercive.',
      time: '15 minutes',
      supplies: ['A small candle', 'A bay leaf', 'A pen'],
      steps: [
        'Write a single question on the bay leaf \u2014 no more than seven words.',
        'Light the candle. Hold the leaf to the flame until it catches, then drop it into a heatproof dish.',
        'Watch it turn to ash. Do not look away.',
        'Breathe in the faint scent. Let the answer arrive over the next three days \u2014 not immediately.',
        'Keep a note by your bed for what comes in dream or morning.',
      ],
      pairing: 'A few sips of clarity tea (rosemary, peppermint, a small amount of tulsi).',
      note: 'This is symbolic practice. It works on the practitioner, not on other people.',
    },
    {
      type: 'ritual',
      chapter: 'XII',
      title: 'Three Herbal Remedies to Keep at Home',
      emoji: '\u{1F9EA}',
      intent: 'A simple apothecary shelf for everyday care.',
      recipes: [
        {
          name: 'Soothing Throat Honey',
          how: 'In a clean jar: raw honey, a thumb of sliced ginger, zest of one lemon, two sprigs of thyme. Steep two weeks on the counter. A teaspoon at the first tickle.',
        },
        {
          name: 'Calm-the-Mind Tea',
          how: 'Equal parts dried chamomile, lemon balm, and oat straw. One heaping teaspoon per cup, steep 8 minutes covered. Before bed or after a hard meeting.',
        },
        {
          name: 'Oil for Tired Shoulders',
          how: 'Infuse dried arnica or comfrey leaf in olive oil for four weeks in a dark cupboard. Strain. Massage into sore shoulders after a bath.',
        },
      ],
      pairing: 'See the full shelf of ready-made versions in the Shop \u2014 made in small batches by Amber.',
      note: 'Always patch-test a new oil or tea. Consult a practitioner if pregnant, nursing, or on medication.',
    },
    {
      type: 'closing',
      title: 'A Closing Blessing',
      body: 'May your mornings find you rested. May your evenings find you held. May you meet every herb on this shelf the way you would meet a friend \u2014 with curiosity, with respect, and with time. Return to this grimoire whenever you need a steady hand.',
      sign: '\u2014 Amber',
      ornament: '\u2729',
    },
  ];

  // ---------- STATE ----------
  var currentPage = 0;
  var built = false;
  var overlay = null;

  function isTwoPage() {
    return window.matchMedia && window.matchMedia('(min-width: 900px)').matches;
  }

  // ---------- RENDERERS ----------
  function renderList(items) {
    if (!items || !items.length) return '';
    return '<ul class="gb-list">' + items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>';
  }
  function renderOrdered(items) {
    if (!items || !items.length) return '';
    return '<ol class="gb-steps">' + items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ol>';
  }
  function renderRecipes(items) {
    if (!items || !items.length) return '';
    return items.map(function (r) {
      return '<div class="gb-recipe"><h4>' + r.name + '</h4><p>' + r.how + '</p></div>';
    }).join('');
  }

  function pageHtml(p, index) {
    if (!p) {
      return '<div class="gb-page gb-page-blank"><div class="gb-blank-mark">\u2729</div></div>';
    }
    if (p.type === 'cover') {
      return (
        '<div class="gb-page gb-page-cover">'
        + '  <div class="gb-cover-ornament">' + (p.ornament || '\u2729') + '</div>'
        + '  <h1 class="gb-cover-title">' + p.title + '</h1>'
        + '  <p class="gb-cover-sub">' + p.subtitle + '</p>'
        + '  <p class="gb-cover-by">' + p.by + '</p>'
        + '  <div class="gb-cover-ornament">' + (p.ornament || '\u2729') + '</div>'
        + '  <p class="gb-cover-hint">Turn the page \u2192</p>'
        + '</div>'
      );
    }
    if (p.type === 'toc') {
      return (
        '<div class="gb-page">'
        + '  <div class="gb-folio">i</div>'
        + '  <h2 class="gb-page-title">' + p.title + '</h2>'
        + '  <div class="gb-rule"></div>'
        + '  <ul class="gb-toc">' + p.items.map(function (t, i) {
            return '<li><button type="button" data-gb-goto="' + (i + 2) + '">' + t + '</button></li>';
          }).join('') + '</ul>'
        + '</div>'
      );
    }
    if (p.type === 'closing') {
      return (
        '<div class="gb-page gb-page-closing">'
        + '  <div class="gb-folio">xii</div>'
        + '  <div class="gb-cover-ornament">' + (p.ornament || '\u2729') + '</div>'
        + '  <h2 class="gb-page-title">' + p.title + '</h2>'
        + '  <div class="gb-rule"></div>'
        + '  <p class="gb-closing-body">' + p.body + '</p>'
        + '  <p class="gb-closing-sign">' + p.sign + '</p>'
        + '  <div class="gb-cover-ornament">' + (p.ornament || '\u2729') + '</div>'
        + '</div>'
      );
    }
    // ritual
    var html = '<div class="gb-page">';
    html += '  <div class="gb-folio">' + (p.chapter || '') + '</div>';
    html += '  <div class="gb-emoji" aria-hidden="true">' + (p.emoji || '\u2729') + '</div>';
    html += '  <h2 class="gb-page-title">' + p.title + '</h2>';
    html += '  <div class="gb-rule"></div>';
    if (p.intent) html += '<p class="gb-intent"><strong>Intent.</strong> ' + p.intent + '</p>';
    if (p.time) html += '<p class="gb-meta"><strong>Time.</strong> ' + p.time + '</p>';
    if (p.supplies) html += '<p class="gb-meta"><strong>You will need.</strong></p>' + renderList(p.supplies);
    if (p.steps) html += '<p class="gb-meta"><strong>Practice.</strong></p>' + renderOrdered(p.steps);
    if (p.prompts) html += '<p class="gb-meta"><strong>Prompts.</strong></p>' + renderList(p.prompts);
    if (p.recipes) html += renderRecipes(p.recipes);
    if (p.pairing) html += '<p class="gb-pair"><strong>Apothecary pairing.</strong> ' + p.pairing + '</p>';
    if (p.note) html += '<p class="gb-note"><em>' + p.note + '</em></p>';
    html += '</div>';
    return html;
  }

  function renderSpread() {
    var leftIdx, rightIdx;
    var two = isTwoPage();
    if (two) {
      // Cover always alone on the right.
      if (currentPage === 0) {
        leftIdx = null;
        rightIdx = 0;
      } else {
        leftIdx = currentPage;
        rightIdx = currentPage + 1;
      }
    } else {
      leftIdx = null;
      rightIdx = currentPage;
    }
    var leftHtml = leftIdx === null ? pageHtml(null) : pageHtml(PAGES[leftIdx], leftIdx);
    var rightHtml = rightIdx == null || rightIdx >= PAGES.length ? pageHtml(null) : pageHtml(PAGES[rightIdx], rightIdx);

    var spread = overlay.querySelector('.gb-spread');
    spread.classList.remove('gb-flip-forward', 'gb-flip-back');
    spread.innerHTML = (two ? '<div class="gb-half gb-left">' + leftHtml + '</div>' : '')
      + '<div class="gb-half gb-right">' + rightHtml + '</div>';

    var progress = overlay.querySelector('.gb-progress');
    var shown = two ? (currentPage === 0 ? 1 : Math.min(currentPage + 2, PAGES.length)) : (currentPage + 1);
    progress.textContent = 'Page ' + shown + ' of ' + PAGES.length;

    // TOC navigation
    spread.querySelectorAll('[data-gb-goto]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = parseInt(btn.getAttribute('data-gb-goto'), 10);
        if (!isNaN(target)) goTo(target);
      });
    });
  }

  function goTo(idx) {
    if (idx < 0) idx = 0;
    if (idx >= PAGES.length) idx = PAGES.length - 1;
    currentPage = idx;
    renderSpread();
  }

  function nextPage() {
    var step = isTwoPage() ? (currentPage === 0 ? 1 : 2) : 1;
    var next = currentPage + step;
    if (next >= PAGES.length) next = PAGES.length - 1;
    if (next === currentPage) return;
    currentPage = next;
    renderSpread();
    flash('forward');
  }

  function prevPage() {
    var step = isTwoPage() ? (currentPage <= 1 ? 1 : 2) : 1;
    var prev = currentPage - step;
    if (prev < 0) prev = 0;
    if (prev === currentPage) return;
    currentPage = prev;
    renderSpread();
    flash('back');
  }

  function flash(dir) {
    var spread = overlay && overlay.querySelector('.gb-spread');
    if (!spread) return;
    var cls = dir === 'back' ? 'gb-flip-back' : 'gb-flip-forward';
    spread.classList.add(cls);
    setTimeout(function () { spread.classList.remove(cls); }, 420);
  }

  // ---------- BUILD OVERLAY ----------
  function build() {
    if (built) return;
    built = true;

    overlay = document.createElement('div');
    overlay.className = 'gb-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'The Living Grimoire');
    overlay.innerHTML =
        '<div class="gb-backdrop"></div>'
      + '<div class="gb-book" role="document">'
      + '  <div class="gb-bar">'
      + '    <div class="gb-bar-title">The Living Grimoire</div>'
      + '    <div class="gb-progress"></div>'
      + '    <button class="gb-close" type="button" aria-label="Close the grimoire">&times;</button>'
      + '  </div>'
      + '  <div class="gb-spread"></div>'
      + '  <div class="gb-controls">'
      + '    <button class="gb-nav gb-prev" type="button" aria-label="Previous page">\u2039 Back</button>'
      + '    <button class="gb-nav gb-toc" type="button" aria-label="Contents">Contents</button>'
      + '    <button class="gb-nav gb-next" type="button" aria-label="Next page">Next \u203a</button>'
      + '  </div>'
      + '</div>';
    document.body.appendChild(overlay);

    overlay.querySelector('.gb-close').addEventListener('click', close);
    overlay.querySelector('.gb-backdrop').addEventListener('click', close);
    overlay.querySelector('.gb-prev').addEventListener('click', prevPage);
    overlay.querySelector('.gb-next').addEventListener('click', nextPage);
    overlay.querySelector('.gb-toc').addEventListener('click', function () { goTo(1); });

    document.addEventListener('keydown', function (e) {
      if (overlay.getAttribute('aria-hidden') === 'true') return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') nextPage();
      if (e.key === 'ArrowLeft') prevPage();
    });

    // Touch swipe for mobile
    var startX = null;
    overlay.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) startX = e.touches[0].clientX;
    }, { passive: true });
    overlay.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var endX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : startX;
      var dx = endX - startX;
      startX = null;
      if (Math.abs(dx) < 40) return;
      if (dx < 0) nextPage(); else prevPage();
    }, { passive: true });

    // Re-render on resize (two-page vs one-page)
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(renderSpread, 150);
    });
  }

  function open(atIndex) {
    build();
    currentPage = typeof atIndex === 'number' ? atIndex : 0;
    renderSpread();
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('gb-open');
    document.body.style.overflow = 'hidden';
    try {
      if (window.gtag) window.gtag('event', 'grimoire_book_open', { page: currentPage });
    } catch (e) {}
  }

  function close() {
    if (!overlay) return;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('gb-open');
    document.body.style.overflow = '';
  }

  // Expose globally.
  window.openGrimoireBook = open;
  window.closeGrimoireBook = close;

  // Wire up trigger buttons anywhere in the DOM.
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-grimoire-book]');
    if (el) {
      e.preventDefault();
      open(0);
    }
  });
})();
