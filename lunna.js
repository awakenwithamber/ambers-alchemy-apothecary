// ============================================================
// LUNNA — Apothecary Companion (client-only, no LLM)
// A gentle context-aware navigator that complements
// the wellness quiz, custom builders, grimoire, and shop.
// ============================================================

(function () {
  'use strict';

  var STORAGE_KEY = 'lunna.state.v1';

  // Load persisted state (intro seen, preferred open/closed)
  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }
  function saveState(patch) {
    try {
      var cur = loadState();
      var next = Object.assign({}, cur, patch || {});
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {}
  }

  // Gentle section-aware prompts. Each tip is a hint shown on the FAB badge,
  // while the panel offers 3–4 next steps — nothing replaces the core flows.
  var PROMPTS = {
    home: {
      hint: 'Shall I help you begin your journey?',
      greeting: "Welcome, friend. I'm <span class='lunna-accent'>Lunna</span> — your apothecary guide. Where would you like to begin today?",
      suggestions: [
        { icon: '✦', title: 'Take the Wellness Quiz', desc: 'Answer a few gentle questions to meet your herbal allies.', action: function () { if (typeof openHerbalAdvisor === 'function') openHerbalAdvisor(); } },
        { icon: '🌿', title: 'Create a Custom Remedy', desc: 'A bespoke formulation crafted for your body and goals.', action: function () { showSection('custom-formula'); } },
        { icon: '🫙', title: 'Browse the Apothecary', desc: 'Explore our handcrafted balms, tinctures, teas, and capsules.', action: function () { showSection('shop'); } },
        { icon: '📖', title: 'Wander the Grimoire', desc: 'Learn the lore, uses, and wisdom of each botanical.', action: function () { showSection('herb-index'); } }
      ]
    },
    shop: {
      hint: 'Not sure which remedy fits you?',
      greeting: "A curated shelf of remedies. If you're unsure, I can help you narrow it down.",
      suggestions: [
        { icon: '✦', title: 'Start the Wellness Quiz', desc: 'Let your symptoms and goals guide the match.', action: function () { if (typeof openHerbalAdvisor === 'function') openHerbalAdvisor(); } },
        { icon: '🌿', title: 'Create a Custom Formula', desc: 'Something unique, made just for you.', action: function () { showSection('custom-formula'); } },
        { icon: '📖', title: 'Research in the Grimoire', desc: 'Learn what each herb truly does.', action: function () { showSection('herb-index'); } },
        { icon: '💬', title: 'Speak with Amber', desc: 'A personal consultation, one-to-one.', action: function () { showSection('contact'); } }
      ]
    },
    'custom-formula': {
      hint: 'I can walk you through this flow.',
      greeting: "A custom formula is a small ritual of self-knowing. Share what you feel in your body — Amber will craft the rest.",
      suggestions: [
        { icon: '✦', title: 'Unsure where to start? Take the Quiz', desc: 'Refine your symptoms and goals first.', action: function () { if (typeof openHerbalAdvisor === 'function') openHerbalAdvisor(); } },
        { icon: '📖', title: 'Look up a Herb', desc: 'Understand the allies you might choose.', action: function () { showSection('herb-index'); } },
        { icon: '🫙', title: 'See Pre-made Remedies', desc: 'Sometimes the right formula already exists.', action: function () { showSection('shop'); } }
      ]
    },
    soaps: {
      hint: "Tell me how you'd like to feel, and I'll help craft your soap.",
      greeting: "Soap is the gentlest daily ritual. Tell me how you'd like to feel, and I'll help create something beautiful for you — or jump straight to the builder if you already know.",
      suggestions: [
        { icon: '🌙', title: 'Guide Me to the Right Soap', desc: "I'll ask a few warm questions and recommend a blend.", action: function () { showSection('soaps'); setTimeout(function () { if (typeof openSoapGuide === 'function') openSoapGuide(); }, 250); } },
        { icon: '🫧', title: 'Build Your Own Soap', desc: 'Direct builder — pick base, scent, and botanicals yourself.', action: function () { if (typeof openSoapBuilder === 'function') openSoapBuilder(); else showSection('soaps'); } },
        { icon: '📖', title: 'Learn about the Botanicals', desc: 'Meet the herbs behind the lather.', action: function () { showSection('herb-index'); } },
        { icon: '🌿', title: 'Pair with a Ritual Remedy', desc: 'A matching tonic or balm to complete the practice.', action: function () { showSection('shop'); } }
      ]
    },
    'herb-index': {
      hint: 'Search or browse by intention.',
      greeting: "Every herb in this grimoire carries a story. Browse by name, or search for what your body is asking for.",
      suggestions: [
        { icon: '✦', title: 'Begin with the Quiz', desc: 'Let your symptoms guide your first read.', action: function () { if (typeof openHerbalAdvisor === 'function') openHerbalAdvisor(); } },
        { icon: '🌿', title: 'Build a Custom Formula', desc: 'Turn what you learn here into a real remedy.', action: function () { showSection('custom-formula'); } },
        { icon: '🫙', title: 'Find it in the Shop', desc: 'See remedies already featuring these herbs.', action: function () { showSection('shop'); } }
      ]
    },
    'herbal-library': {
      hint: 'A deeper herb encyclopedia.',
      greeting: "The encyclopedia is a quiet place to read and linger. Take your time.",
      suggestions: [
        { icon: '📖', title: 'Open the Grimoire Index', desc: 'Explore each herb in detail.', action: function () { showSection('herb-index'); } },
        { icon: '🌿', title: 'Craft a Remedy', desc: 'Put what you learn into practice.', action: function () { showSection('custom-formula'); } }
      ]
    },
    'herbal-wisdom': {
      hint: 'Articles to deepen your practice.',
      greeting: "Articles, rituals, and teachings. Read slowly — the herbs invite it.",
      suggestions: [
        { icon: '📖', title: 'Explore the Grimoire', desc: 'Detailed herb pages with uses and wisdom.', action: function () { showSection('herb-index'); } },
        { icon: '✦', title: 'Find Your Allies (Quiz)', desc: 'Personalized matches based on your needs.', action: function () { if (typeof openHerbalAdvisor === 'function') openHerbalAdvisor(); } },
        { icon: '💬', title: 'Ask Amber Directly', desc: 'For teachings beyond the written word.', action: function () { showSection('contact'); } }
      ]
    },
    journal: {
      hint: "Stories from Amber's apothecary.",
      greeting: "A quiet journal of practice, season, and plant. Read what speaks to you today.",
      suggestions: [
        { icon: '📖', title: 'Browse the Grimoire', desc: 'Each herb, in depth.', action: function () { showSection('herb-index'); } },
        { icon: '🌿', title: 'Craft a Custom Remedy', desc: 'Inspired by what you just read.', action: function () { showSection('custom-formula'); } }
      ]
    },
    services: {
      hint: 'Healing sessions, readings, guidance.',
      greeting: "Sometimes the remedy isn't a bottle — it's a session. Amber offers deeper work when herbs are only part of the path.",
      suggestions: [
        { icon: '📅', title: 'Book a Consultation', desc: "Reserve a time on Amber's calendar.", action: function () { window.open('https://calendar.app.google/zSzB4LLvngFVmiqu7', '_blank', 'noopener'); } },
        { icon: '💬', title: 'Reach Amber', desc: 'Ask questions or share context before booking.', action: function () { showSection('contact'); } },
        { icon: '🌿', title: 'Add a Remedy to Your Practice', desc: 'Herbs can support healing work between sessions.', action: function () { showSection('shop'); } }
      ]
    },
    about: {
      hint: 'The story behind the apothecary.',
      greeting: "Amber pours each batch with intention. Here's a little of the path that led here.",
      suggestions: [
        { icon: '✦', title: 'Try the Wellness Quiz', desc: "Now that you know her, let her know you.", action: function () { if (typeof openHerbalAdvisor === 'function') openHerbalAdvisor(); } },
        { icon: '🫙', title: 'Explore Remedies', desc: "See what Amber's been crafting.", action: function () { showSection('shop'); } },
        { icon: '💬', title: 'Say Hello', desc: "She reads every message.", action: function () { showSection('contact'); } }
      ]
    },
    faqs: {
      hint: 'Common questions, honest answers.',
      greeting: "If your question isn't answered below, I'd be glad to point you toward Amber.",
      suggestions: [
        { icon: '💬', title: 'Contact Amber', desc: 'Ask anything directly.', action: function () { showSection('contact'); } },
        { icon: '🫙', title: 'Browse the Shop', desc: 'See the full apothecary.', action: function () { showSection('shop'); } }
      ]
    },
    contact: {
      hint: "Send Amber a message.",
      greeting: "She'll respond personally. You can also reach her at <span class='lunna-accent'>awaken@consultant.com</span>.",
      suggestions: [
        { icon: '📅', title: 'Book a Consultation', desc: 'Reserve a time that works for you.', action: function () { window.open('https://calendar.app.google/zSzB4LLvngFVmiqu7', '_blank', 'noopener'); } },
        { icon: '✦', title: 'Take the Wellness Quiz First', desc: 'So she has context for your needs.', action: function () { if (typeof openHerbalAdvisor === 'function') openHerbalAdvisor(); } },
        { icon: '🫙', title: 'Browse the Remedies', desc: 'In case the answer is already on the shelf.', action: function () { showSection('shop'); } }
      ]
    },
    checkout: {
      hint: 'Any last questions before checkout?',
      greeting: "Almost there. If anything feels unclear, pause — Amber is here.",
      suggestions: [
        { icon: '💬', title: 'Ask Amber a Question', desc: 'Any detail about your order.', action: function () { showSection('contact'); } },
        { icon: '🫙', title: 'Add Another Remedy', desc: 'Return to the shelves.', action: function () { showSection('shop'); } }
      ]
    }
  };

  var DEFAULT = PROMPTS.home;

  function currentSection() {
    var active = document.querySelector('.page-section.active');
    return (active && active.id) || 'home';
  }

  function promptFor(section) {
    return PROMPTS[section] || DEFAULT;
  }

  // ---- UI ----
  var root, fab, badge, hintEl, panel, bodyEl, greetingEl, suggestionsEl;
  var hintTimer = null;

  function buildUI() {
    root = document.createElement('div');
    root.id = 'lunna-root';
    root.innerHTML = ''
      + '<div class="lunna-hint" id="lunnaHint" role="status" aria-live="polite">'
      +   '<span class="lunna-hint-text" id="lunnaHintText"></span>'
      +   '<button class="lunna-hint-close" id="lunnaHintClose" aria-label="Dismiss hint">Thank you, Lunna</button>'
      + '</div>'
      + '<button class="lunna-fab" id="lunnaFab" aria-label="Open Lunna, your apothecary guide" aria-expanded="false">'
      +   '<span class="lunna-fab-badge" aria-hidden="true"></span>'
      +   '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true">'
      +     '<path d="M22 6c-1.2 0-2.3.2-3.3.6A11 11 0 1 0 25.4 21.3 9 9 0 0 1 22 6z" fill="#2E1C38" opacity="0.85"/>'
      +   '</svg>'
      + '</button>'
      + '<div class="lunna-panel" id="lunnaPanel" role="dialog" aria-label="Lunna — apothecary guide" aria-modal="false">'
      +   '<div class="lunna-panel-header">'
      +     '<div class="lunna-avatar" aria-hidden="true"></div>'
      +     '<div class="lunna-who">'
      +       '<span class="lunna-name">Lunna</span>'
      +       '<span class="lunna-role">Your gentle apothecary guide</span>'
      +     '</div>'
      +     '<button class="lunna-close" id="lunnaClose" aria-label="Close Lunna">✕</button>'
      +   '</div>'
      +   '<div class="lunna-body">'
      +     '<p class="lunna-greeting" id="lunnaGreeting"></p>'
      +     '<div class="lunna-section-title">Where Shall We Go?</div>'
      +     '<div class="lunna-suggestions" id="lunnaSuggestions"></div>'
      +   '</div>'
      +   '<div class="lunna-footer">'
      +     '<span class="lunna-footer-note">I walk beside you.</span>'
      +     '<div class="lunna-footer-actions">'
      +       '<a class="lunna-book-btn" id="lunnaBook" href="https://calendar.app.google/zSzB4LLvngFVmiqu7" target="_blank" rel="noopener" data-consult-cta>📅 Book</a>'
      +       '<button class="lunna-contact-btn" id="lunnaContact">Message Amber</button>'
      +     '</div>'
      +   '</div>'
      + '</div>';
    document.body.appendChild(root);

    fab = document.getElementById('lunnaFab');
    badge = fab.querySelector('.lunna-fab-badge');
    hintEl = document.getElementById('lunnaHint');
    panel = document.getElementById('lunnaPanel');
    bodyEl = panel.querySelector('.lunna-body');
    greetingEl = document.getElementById('lunnaGreeting');
    suggestionsEl = document.getElementById('lunnaSuggestions');

    fab.addEventListener('click', togglePanel);
    document.getElementById('lunnaClose').addEventListener('click', closePanel);
    document.getElementById('lunnaHintClose').addEventListener('click', function (e) {
      e.stopPropagation();
      hideHint();
      saveState({ hintDismissed: true });
    });
    document.getElementById('lunnaContact').addEventListener('click', function () {
      closePanel();
      if (typeof showSection === 'function') showSection('contact');
    });

    // Clicking the hint opens the panel
    hintEl.addEventListener('click', function (e) {
      if (e.target.id === 'lunnaHintClose') return;
      openPanel();
      hideHint();
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('open')) closePanel();
    });
  }

  function render() {
    var p = promptFor(currentSection());
    if (greetingEl) greetingEl.innerHTML = p.greeting;
    if (suggestionsEl) {
      suggestionsEl.innerHTML = '';
      (p.suggestions || []).forEach(function (s) {
        var btn = document.createElement('button');
        btn.className = 'lunna-suggestion';
        btn.type = 'button';
        btn.innerHTML = ''
          + '<span class="lunna-suggestion-icon" aria-hidden="true">' + s.icon + '</span>'
          + '<span class="lunna-suggestion-text">'
          +   '<span class="lunna-suggestion-title">' + s.title + '</span>'
          +   '<span class="lunna-suggestion-desc">' + s.desc + '</span>'
          + '</span>';
        btn.addEventListener('click', function () {
          closePanel();
          try { s.action(); } catch (err) { /* no-op */ }
          try {
            if (window.AAA && window.AAA.track) {
              window.AAA.track('lunna_suggestion', {
                section: currentSection(),
                title: s.title
              });
            }
          } catch (e) {}
        });
        suggestionsEl.appendChild(btn);
      });
    }
  }

  function openPanel() {
    render();
    panel.classList.add('open');
    fab.setAttribute('aria-expanded', 'true');
    hideHint();
    try {
      if (window.AAA && window.AAA.track) {
        window.AAA.track('lunna_open', { section: currentSection() });
      }
    } catch (e) {}
  }
  function closePanel() {
    panel.classList.remove('open');
    fab.setAttribute('aria-expanded', 'false');
  }
  function togglePanel() {
    if (panel.classList.contains('open')) closePanel(); else openPanel();
  }

  // ---- Hint (unobtrusive nudge tied to current section) ----
  function showHint(text) {
    if (!hintEl) return;
    var state = loadState();
    if (state.hintDismissed) return;
    document.getElementById('lunnaHintText').textContent = text;
    hintEl.classList.add('visible');
    fab.classList.add('lunna-has-hint');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(hideHint, 10000);
  }
  function hideHint() {
    if (!hintEl) return;
    hintEl.classList.remove('visible');
    fab.classList.remove('lunna-has-hint');
  }

  // Show a section-appropriate hint shortly after section changes
  var sectionHintTimer = null;
  function scheduleSectionHint() {
    clearTimeout(sectionHintTimer);
    sectionHintTimer = setTimeout(function () {
      if (panel.classList.contains('open')) return;
      var p = promptFor(currentSection());
      if (p && p.hint) showHint(p.hint);
    }, 1800);
  }

  // ---- Init ----
  function init() {
    if (document.getElementById('lunna-root')) return;
    buildUI();
    render();

    // First-time welcome hint
    var state = loadState();
    if (!state.introSeen) {
      setTimeout(function () { showHint("Hello — I'm Lunna. Tap me anytime for guidance."); }, 2400);
      saveState({ introSeen: true });
    } else {
      scheduleSectionHint();
    }

    // Watch for section changes (MutationObserver on .page-section.active)
    var sections = document.querySelectorAll('.page-section');
    var lastActive = currentSection();
    var mo = new MutationObserver(function () {
      var now = currentSection();
      if (now !== lastActive) {
        lastActive = now;
        render();
        scheduleSectionHint();
      }
    });
    sections.forEach(function (s) {
      mo.observe(s, { attributes: true, attributeFilter: ['class'] });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
