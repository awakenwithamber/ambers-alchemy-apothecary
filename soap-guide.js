/*
 * Lunna Soap Guide — Option 1 (guided soap creation).
 * A gentle quiz that asks about mood, scent family, skin needs, color, botanicals,
 * exfoliation, ritual intention, and gift vs. self — then recommends a preset
 * soap blend. From the result page users can: add to cart, refine further in the
 * existing direct builder, save, start over, book a consultation, or browse the shop.
 *
 * Option 2 (direct builder) stays exactly as-is (soap-builder.js).
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'lunna.soap.answers.v1';
  var BASE_PRICE = 13.99;

  // ---------- QUESTIONS ----------
  var QUESTIONS = [
    {
      id: 'mood',
      title: 'How would you like to feel when you step out of the bath?',
      help: 'Choose the mood your soap should support.',
      options: [
        { id: 'calming',    label: 'Calming',    emoji: '\u{1F319}', desc: 'Softer, slower, held.' },
        { id: 'sensual',    label: 'Sensual',    emoji: '\u{1F337}', desc: 'Embodied, warm, rose-touched.' },
        { id: 'uplifting',  label: 'Uplifting',  emoji: '\u{1F31E}', desc: 'Brightened, open, at ease.' },
        { id: 'grounding',  label: 'Grounding',  emoji: '\u{1F333}', desc: 'Rooted, steady, present.' },
        { id: 'cleansing',  label: 'Cleansing',  emoji: '\u{1F9FC}', desc: 'Clear, reset, airy.' },
        { id: 'sleep',      label: 'Sleep',      emoji: '\u{1F634}', desc: 'Slow, drowsy, twilight-soft.' },
        { id: 'focus',      label: 'Focus',      emoji: '\u{2728}', desc: 'Alert, bright-minded.' }
      ]
    },
    {
      id: 'scent',
      title: 'Which scent family calls to you?',
      help: 'Pick the one that feels the most \u201cyou\u201d today.',
      options: [
        { id: 'floral',   label: 'Floral',    emoji: '\u{1F338}', desc: 'Rose, lavender, jasmine, lily.' },
        { id: 'fresh',    label: 'Fresh',     emoji: '\u{1F33F}', desc: 'Eucalyptus, mint, tea tree.' },
        { id: 'citrus',   label: 'Citrus',    emoji: '\u{1F34A}', desc: 'Orange, bergamot, lemon.' },
        { id: 'warm',     label: 'Warm spice',emoji: '\u{1F342}', desc: 'Cinnamon, clove, frankincense.' },
        { id: 'earthy',   label: 'Earthy',    emoji: '\u{1F332}', desc: 'Patchouli, cedarwood, vetiver.' },
        { id: 'surprise', label: "Surprise me",emoji: '\u{1F52E}', desc: "Let Amber choose." }
      ]
    },
    {
      id: 'skin',
      title: 'What does your skin need most?',
      help: 'There is no wrong answer \u2014 it can change with the season.',
      options: [
        { id: 'hydration', label: 'Deep moisture',  emoji: '\u{1F4A7}', desc: 'Dry, thirsty, tight skin.' },
        { id: 'calm',      label: 'Calm & heal',    emoji: '\u{1F49A}', desc: 'Reactive, flushed, sensitive.' },
        { id: 'balance',   label: 'Balance',         emoji: '\u{2696}', desc: 'Combination skin, changing.' },
        { id: 'brighten',  label: 'Brighten',        emoji: '\u{2728}', desc: 'Dull, tired, uneven.' },
        { id: 'detox',     label: 'Purify',          emoji: '\u{1F9FC}', desc: 'Congested, oily, hot.' }
      ]
    },
    {
      id: 'color',
      title: 'Which colors feel right?',
      help: 'All colors come from botanicals and clays \u2014 never synthetic dye.',
      options: [
        { id: 'violet-ivory',    label: 'Violet & ivory',  emoji: '\u{1F90D}', desc: 'Lavender-soft, moonlit.' },
        { id: 'blush-rose',      label: 'Blush & rose',    emoji: '\u{1F339}', desc: 'Romantic, tender.' },
        { id: 'forest-cream',    label: 'Forest & cream',  emoji: '\u{1F333}', desc: 'Herbal, woodland.' },
        { id: 'amber-honey',     label: 'Amber & honey',   emoji: '\u{1F36F}', desc: 'Warm, golden.' },
        { id: 'crimson-gold',    label: 'Crimson & gold',  emoji: '\u{1F338}', desc: 'Bold, radiant.' },
        { id: 'midnight-silver', label: 'Midnight & silver',emoji: '\u{1F311}', desc: 'Deep, mystical.' }
      ]
    },
    {
      id: 'botanicals',
      title: 'Pick a botanical you love',
      help: 'One will be the star of your bar.',
      options: [
        { id: 'rose-petals',    label: 'Rose petals',      emoji: '\u{1F339}', desc: 'Soft, heart-opening.' },
        { id: 'lavender-buds',  label: 'Lavender buds',    emoji: '\u{1F49C}', desc: 'Classic, calming.' },
        { id: 'chamomile',      label: 'Chamomile',        emoji: '\u{1F33C}', desc: 'Soothing, golden.' },
        { id: 'calendula',      label: 'Calendula',        emoji: '\u{1F33B}', desc: 'Healing, sunlit.' },
        { id: 'mint-leaves',    label: 'Mint leaves',      emoji: '\u{1F33F}', desc: 'Invigorating, green.' },
        { id: 'hibiscus',       label: 'Hibiscus',         emoji: '\u{1F33A}', desc: 'Vibrant, antioxidant.' },
        { id: 'butterfly-pea',  label: 'Butterfly pea',    emoji: '\u{1F98B}', desc: 'Luxurious blue.' },
        { id: 'orange-peel',    label: 'Orange peel',      emoji: '\u{1F34A}', desc: 'Bright, vitamin-rich.' }
      ]
    },
    {
      id: 'exfoliation',
      title: 'Would you like exfoliation?',
      help: 'Texture from crushed botanicals, oats, or salts.',
      options: [
        { id: 'none',   label: 'None',         emoji: '\u{1F4A7}', desc: 'Smooth bar, no scrub.' },
        { id: 'gentle', label: 'Gentle',       emoji: '\u{1F33E}', desc: 'Oats, fine botanical bits.' },
        { id: 'bold',   label: 'Bolder scrub', emoji: '\u{1FAA8}', desc: 'Salt, coarse herbs.' }
      ]
    },
    {
      id: 'intention',
      title: 'What is the intention of this bar?',
      help: 'Name what you are calling in.',
      options: [
        { id: 'self-love',   label: 'Self-love',   emoji: '\u{1F495}', desc: 'A daily tenderness.' },
        { id: 'protection',  label: 'Protection',  emoji: '\u{1F6E1}', desc: 'Boundaries, shelter.' },
        { id: 'abundance',   label: 'Abundance',   emoji: '\u{2728}', desc: 'Enough, and more.' },
        { id: 'rest',        label: 'Rest',        emoji: '\u{1F31B}', desc: 'Repair, sleep.' },
        { id: 'romance',     label: 'Romance',     emoji: '\u{1F337}', desc: 'Tender, embodied.' },
        { id: 'clarity',     label: 'Clarity',     emoji: '\u{1F52E}', desc: 'Mind steady, clear.' }
      ]
    },
    {
      id: 'gift',
      title: 'Is this for you or as a gift?',
      options: [
        { id: 'self', label: 'For me',   emoji: '\u{1F338}', desc: 'A little ritual of my own.' },
        { id: 'gift', label: 'A gift',   emoji: '\u{1F381}', desc: 'Tell me about them in the builder.' }
      ]
    }
  ];

  // Blend templates based on mood + scent combination.
  var BLENDS = {
    calming_floral:    { name: 'Moonflower Twilight', base: 'creamy-nourishing',   scent: 'lavender-fairy-dream', addons: ['lavender-buds','chamomile','butterfly-pea'], benefit: 'relaxation',   why: 'Lavender, chamomile, and butterfly pea steep into a soft violet bar \u2014 the kind of rinse that drops the shoulders on contact.' },
    calming_fresh:     { name: 'Mountain Hush',       base: 'creamy-nourishing',   scent: 'eucalyptus-mint-spa',  addons: ['lavender-buds','mint-leaves'],                   benefit: 'relaxation',   why: 'Cool greens calm a busy mind while shea butter keeps the skin soft.' },
    sensual_floral:    { name: "Gaia\u2019s Rose Ritual", base: 'layered',         scent: 'gaias-rose',           addons: ['rose-petals','hibiscus','calendula'],           benefit: 'moisturizing', why: 'Rose, hibiscus, and calendula over a creamy base \u2014 made for slow water.' },
    sensual_warm:      { name: 'Amber Hearth',        base: 'layered',             scent: 'warm-cinnamon',        addons: ['rose-petals','cinnamon','orange-peel'],         benefit: 'moisturizing', why: 'Warm spice and rose \u2014 grounding, a little decadent.' },
    uplifting_citrus:  { name: 'Sunlit Goddess',      base: 'clear-top',           scent: 'citrus-goddess',       addons: ['orange-peel','calendula','mint-leaves'],        benefit: 'energizing',   why: 'A clear glycerin bar so citrus peel catches the light.' },
    uplifting_fresh:   { name: 'Fresh Meadow',        base: 'clear-top',           scent: 'fresh-mountain',       addons: ['mint-leaves','calendula','rosemary'],           benefit: 'energizing',   why: 'Bright herbal greens for a morning shower that reads like a stretch.' },
    grounding_earthy:  { name: 'Sacred Forest',       base: 'creamy-nourishing',   scent: 'sacred-forest',        addons: ['rosemary','nettle-leaf','spirulina'],           benefit: 'skin-healing', why: 'Resins and deep greens \u2014 roots down, breath out.' },
    grounding_warm:    { name: 'Cinnamon Root',       base: 'layered',             scent: 'warm-cinnamon',        addons: ['cinnamon','clove','orange-peel'],               benefit: 'skin-healing', why: 'A cup-of-tea bar, warm and anchoring.' },
    cleansing_fresh:   { name: 'Clear Spring',        base: 'clear-top',           scent: 'eucalyptus-mint-spa',  addons: ['mint-leaves','spirulina','nettle-leaf'],        benefit: 'detox',        why: 'A mineral-green bar with a clean-mint finish.' },
    cleansing_citrus:  { name: 'Citrus Reset',        base: 'clear-top',           scent: 'citrus-goddess',       addons: ['orange-peel','mint-leaves','spirulina'],        benefit: 'detox',        why: 'Brighten, cool, and reset \u2014 especially good after a long week.' },
    sleep_floral:      { name: 'Lavender Twilight',   base: 'creamy-nourishing',   scent: 'lavender-fairy-dream', addons: ['lavender-buds','chamomile','rose-petals'],     benefit: 'relaxation',   why: 'Classic bedtime florals. Pair with the Sleep Tonic ritual.' },
    focus_fresh:       { name: 'Morning Clarity',     base: 'clear-top',           scent: 'fresh-mountain',       addons: ['mint-leaves','rosemary','orange-peel'],         benefit: 'energizing',   why: 'Rosemary and peppermint sharpen attention without waking the nerves.' }
  };

  // ---------- STATE ----------
  var overlay = null;
  var stepIdx = 0;
  var answers = {};
  var built = false;

  function loadAnswers() {
    try { var raw = localStorage.getItem(STORAGE_KEY); if (raw) answers = JSON.parse(raw) || {}; } catch (e) {}
  }
  function saveAnswers() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(answers)); } catch (e) {}
  }
  function resetAnswers() {
    answers = {};
    stepIdx = 0;
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  // ---------- PICK BLEND ----------
  function pickBlend() {
    var m = answers.mood || 'calming';
    var s = answers.scent || 'floral';
    var key = m + '_' + s;
    if (BLENDS[key]) return BLENDS[key];
    // Fallback — try mood alone
    var fallbacks = {
      calming: 'calming_floral', sensual: 'sensual_floral', uplifting: 'uplifting_citrus',
      grounding: 'grounding_earthy', cleansing: 'cleansing_fresh', sleep: 'sleep_floral', focus: 'focus_fresh'
    };
    return BLENDS[fallbacks[m] || 'calming_floral'];
  }

  // ---------- RENDER ----------
  function render() {
    var host = overlay.querySelector('.sg-body');
    if (stepIdx >= QUESTIONS.length) {
      renderResult(host);
      return;
    }
    var q = QUESTIONS[stepIdx];
    var selected = answers[q.id];
    var stepLabel = 'Step ' + (stepIdx + 1) + ' of ' + QUESTIONS.length;
    host.innerHTML =
        '<div class="sg-step-label">' + stepLabel + '</div>'
      + '<h3 class="sg-question">' + q.title + '</h3>'
      + (q.help ? '<p class="sg-help">' + q.help + '</p>' : '')
      + '<div class="sg-options">'
      + q.options.map(function (o) {
          var sel = selected === o.id ? ' sg-selected' : '';
          return (
              '<button class="sg-option' + sel + '" data-id="' + o.id + '" type="button">'
            + '  <span class="sg-opt-emoji">' + o.emoji + '</span>'
            + '  <span class="sg-opt-label">' + o.label + '</span>'
            + (o.desc ? '<span class="sg-opt-desc">' + o.desc + '</span>' : '')
            + '</button>'
          );
        }).join('')
      + '</div>';

    // Option click advances automatically.
    host.querySelectorAll('.sg-option').forEach(function (btn) {
      btn.addEventListener('click', function () {
        answers[q.id] = btn.getAttribute('data-id');
        saveAnswers();
        stepIdx++;
        render();
        updateFooter();
      });
    });
    updateFooter();
  }

  function updateFooter() {
    var back = overlay.querySelector('.sg-back');
    var next = overlay.querySelector('.sg-skip');
    if (!back) return;
    back.disabled = stepIdx === 0;
    next.textContent = stepIdx >= QUESTIONS.length ? ' ' : 'Skip this';
    next.style.visibility = stepIdx >= QUESTIONS.length ? 'hidden' : 'visible';
  }

  function renderResult(host) {
    var blend = pickBlend();
    var priceNote = 'Base price $' + BASE_PRICE.toFixed(2) + ' \u2014 small extras added by Amber if needed.';
    var intention = answers.intention ? '\u201c' + capitalize(answers.intention.replace('-', ' ')) + '\u201d' : 'your intention';
    host.innerHTML =
        '<div class="sg-step-label">A soap chosen with care</div>'
      + '<h3 class="sg-result-name">' + blend.name + '</h3>'
      + '<p class="sg-result-intention">Carrying the intention of ' + intention + '.</p>'
      + '<p class="sg-result-why">' + blend.why + '</p>'
      + '<div class="sg-result-card">'
      + '  <div class="sg-result-row"><strong>Base.</strong> ' + nameOfBase(blend.base) + '</div>'
      + '  <div class="sg-result-row"><strong>Scent.</strong> ' + nameOfScent(blend.scent) + '</div>'
      + '  <div class="sg-result-row"><strong>Botanicals.</strong> ' + blend.addons.map(nameOfAddon).join(', ') + '</div>'
      + '  <div class="sg-result-row"><strong>Benefit focus.</strong> ' + capitalize(blend.benefit.replace('-', ' ')) + '</div>'
      + '  <div class="sg-result-price">' + priceNote + '</div>'
      + '</div>'
      + '<div class="sg-result-actions">'
      + '  <button type="button" class="btn-primary sg-add-cart">Add this bar to cart</button>'
      + '  <button type="button" class="btn-secondary sg-refine">Customize further \u2192</button>'
      + '  <button type="button" class="btn-ghost sg-save">Save this blend</button>'
      + '  <button type="button" class="btn-ghost sg-restart">Create another</button>'
      + '  <a class="btn-ghost sg-book" href="https://calendar.app.google/zSzB4LLvngFVmiqu7" target="_blank" rel="noopener" data-consult-cta>\u{1F4C5} Book a consultation</a>'
      + '  <button type="button" class="btn-ghost sg-shop">Browse the shop</button>'
      + '</div>';

    host.querySelector('.sg-add-cart').addEventListener('click', function () {
      if (typeof addToCart === 'function') {
        addToCart(blend.name + ' (Lunna Guided Soap)', BASE_PRICE, 1);
        closeGuide();
        var toast = document.getElementById('toast');
        if (toast) { toast.textContent = blend.name + ' added to cart \u2728'; toast.classList.add('toast-show'); setTimeout(function(){toast.classList.remove('toast-show');}, 2200); }
      }
    });
    host.querySelector('.sg-refine').addEventListener('click', function () {
      closeGuide();
      if (typeof openSoapBuilder === 'function') {
        // Pre-seed direct builder selections via window hook if present.
        window.__lunnaSoapBlend = blend;
        openSoapBuilder();
      }
    });
    host.querySelector('.sg-save').addEventListener('click', function () {
      try {
        var saved = JSON.parse(localStorage.getItem('lunna.soap.saved.v1') || '[]');
        saved.unshift({ name: blend.name, blend: blend, answers: answers, at: new Date().toISOString() });
        localStorage.setItem('lunna.soap.saved.v1', JSON.stringify(saved.slice(0, 10)));
      } catch (e) {}
      var toast = document.getElementById('toast');
      if (toast) { toast.textContent = 'Blend saved \u2728'; toast.classList.add('toast-show'); setTimeout(function(){toast.classList.remove('toast-show');}, 2000); }
    });
    host.querySelector('.sg-restart').addEventListener('click', function () {
      resetAnswers();
      render();
    });
    host.querySelector('.sg-shop').addEventListener('click', function () {
      closeGuide();
      if (typeof showSection === 'function') showSection('shop');
    });
  }

  function capitalize(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }
  function nameOfBase(id) {
    return { 'clear-top': 'Botanical clear-top bar', 'creamy-nourishing': 'Creamy nourishing bar', 'layered': 'Layered bar (clear top over creamy base)' }[id] || id;
  }
  function nameOfScent(id) {
    return {
      'lavender-fairy-dream': 'Lavender Fairy Dream',
      'gaias-rose': "Gaia\u2019s Rose",
      'eucalyptus-mint-spa': 'Eucalyptus Mint Spa',
      'warm-cinnamon': 'Warm Cinnamon Comfort',
      'orange-lily': 'Orange Lily Goddess',
      'citrus-goddess': 'Citrus Goddess Glow',
      'sacred-forest': 'Sacred Forest Ritual',
      'fresh-mountain': 'Fresh Mountain Air',
      'sunlit-garden': 'Sunlit Garden Bloom'
    }[id] || id;
  }
  function nameOfAddon(id) {
    return {
      'rose-petals': 'rose petals', 'lavender-buds': 'lavender buds', 'chamomile': 'chamomile',
      'calendula': 'calendula', 'mint-leaves': 'mint leaves', 'hibiscus': 'hibiscus',
      'butterfly-pea': 'butterfly pea', 'orange-peel': 'orange peel', 'cinnamon': 'cinnamon',
      'clove': 'clove', 'nettle-leaf': 'nettle leaf', 'spirulina': 'spirulina', 'rosemary': 'rosemary'
    }[id] || id;
  }

  // ---------- BUILD ----------
  function build() {
    if (built) return;
    built = true;
    overlay = document.createElement('div');
    overlay.className = 'sg-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Guided soap creation with Lunna');
    overlay.innerHTML =
        '<div class="sg-backdrop"></div>'
      + '<div class="sg-panel" role="document">'
      + '  <button class="sg-close" type="button" aria-label="Close">&times;</button>'
      + '  <div class="sg-header">'
      + '    <div class="sg-moon" aria-hidden="true">\u{1F319}</div>'
      + '    <div class="sg-title">Create a Soap with Lunna</div>'
      + '    <div class="sg-sub">\u201cTell me how you\u2019d like to feel, and I\u2019ll help craft something beautiful for you.\u201d</div>'
      + '  </div>'
      + '  <div class="sg-body"></div>'
      + '  <div class="sg-footer">'
      + '    <button type="button" class="sg-back">\u2039 Back</button>'
      + '    <button type="button" class="sg-skip">Skip this</button>'
      + '  </div>'
      + '</div>';
    document.body.appendChild(overlay);

    overlay.querySelector('.sg-backdrop').addEventListener('click', closeGuide);
    overlay.querySelector('.sg-close').addEventListener('click', closeGuide);
    overlay.querySelector('.sg-back').addEventListener('click', function () {
      if (stepIdx > 0) { stepIdx--; render(); }
    });
    overlay.querySelector('.sg-skip').addEventListener('click', function () {
      if (stepIdx < QUESTIONS.length) { stepIdx++; render(); }
    });
    document.addEventListener('keydown', function (e) {
      if (overlay.getAttribute('aria-hidden') === 'true') return;
      if (e.key === 'Escape') closeGuide();
    });
  }

  function openGuide() {
    build();
    loadAnswers();
    if (Object.keys(answers).length === 0) stepIdx = 0;
    else stepIdx = Math.min(Object.keys(answers).length, QUESTIONS.length);
    render();
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('sg-open');
    document.body.style.overflow = 'hidden';
    try { if (window.gtag) window.gtag('event', 'soap_guide_open'); } catch (e) {}
  }
  function closeGuide() {
    if (!overlay) return;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('sg-open');
    document.body.style.overflow = '';
  }

  // Public API
  window.openSoapGuide = openGuide;
  window.closeSoapGuide = closeGuide;

  // Event delegation for launch triggers anywhere on the page.
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-soap-guide]');
    if (el) {
      e.preventDefault();
      openGuide();
    }
  });
})();
