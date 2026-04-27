// ============================================================
// THE GRIMIOR — A True Book of Light Magic
// Flipbook viewer + subscription gate.
// All UI scoped under #the-grimior. Does not modify any other
// part of the site. Subscription state is checked server-side
// against Netlify Blobs (subscribers store) by email.
// ============================================================

(function () {
  'use strict';

  var STORAGE_KEYS = {
    page: 'grimior_last_page',
    email: 'grimior_subscriber_email',
    active: 'grimior_active' // cached server response
  };

  var state = {
    pageIdx: 0,
    pages: [],
    isSubscriber: false,
    email: ''
  };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function isPagePreview(p) {
    if (!p) return false;
    if (p.preview) return true;
    return false;
  }

  function isAccessible(p) {
    if (!p) return false;
    if (state.isSubscriber) return true;
    return isPagePreview(p);
  }

  // ----- Page renderers -----
  function renderCoverPage(p) {
    return (
      '<div class="grimior-page grimior-page--cover">' +
        '<div class="grimior-cover-frame"></div>' +
        '<div class="grimior-cover-glyph">✦ ⚜ ✦</div>' +
        '<h1 class="grimior-cover-title">' + escapeHtml(p.title || 'The Grimior') + '</h1>' +
        '<div class="grimior-cover-sub">' + escapeHtml(p.subtitle || 'A True Book of Light Magic') + '</div>' +
        '<div class="grimior-cover-pressed" aria-hidden="true">🌙 ✦ 🌿 ✦ ☀</div>' +
        '<div class="grimior-cover-keeper">' + escapeHtml(p.keeper || 'Kept by Amber’s Alchemy Apothecary') + '</div>' +
      '</div>'
    );
  }

  function renderTextPage(p, side) {
    var num = (typeof p.number === 'number') ? p.number : '';
    var html = '<div class="grimior-page grimior-page--' + side + '">';
    if (p.chapter) html += '<p class="grimior-page-chapter">Chapter ' + escapeHtml(p.chapter) + '</p>';
    if (p.title)   html += '<h3 class="grimior-page-title">' + escapeHtml(p.title) + '</h3>';

    if (p.intent) {
      html += '<div class="grimior-section-label">Intent</div>';
      html += '<div class="grimior-body"><p style="text-indent:0;font-style:italic;color:#5b3c14">' + escapeHtml(p.intent) + '</p></div>';
    }

    if (Array.isArray(p.body) && p.body.length) {
      html += '<div class="grimior-body">';
      p.body.forEach(function (line) { html += '<p>' + escapeHtml(line) + '</p>'; });
      html += '</div>';
    }

    if (p.correspondences && typeof p.correspondences === 'object') {
      html += '<div class="grimior-correspondences">';
      Object.keys(p.correspondences).forEach(function (k) {
        var label = k.charAt(0).toUpperCase() + k.slice(1);
        html += '<div><strong>' + escapeHtml(label) + ':</strong> ' + escapeHtml(p.correspondences[k]) + '</div>';
      });
      html += '</div>';
    }

    if (Array.isArray(p.needs) && p.needs.length) {
      html += '<div class="grimior-section-label">You Will Need</div>';
      html += '<ul class="grimior-list">' + p.needs.map(function (n) { return '<li>' + escapeHtml(n) + '</li>'; }).join('') + '</ul>';
    }

    if (Array.isArray(p.steps) && p.steps.length) {
      html += '<div class="grimior-section-label">The Working</div>';
      html += '<ul class="grimior-list">' + p.steps.map(function (s) { return '<li>' + escapeHtml(s) + '</li>'; }).join('') + '</ul>';
    }

    if (Array.isArray(p.prompts) && p.prompts.length) {
      html += '<div class="grimior-section-label">Prompts</div>';
      html += '<ul class="grimior-list">' + p.prompts.map(function (s) { return '<li>' + escapeHtml(s) + '</li>'; }).join('') + '</ul>';
    }

    if (p.practice) {
      html += '<div class="grimior-section-label">Practice</div>';
      html += '<div class="grimior-body"><p style="text-indent:0">' + escapeHtml(p.practice) + '</p></div>';
    }

    if (p.note) {
      html += '<div class="grimior-note">' + escapeHtml(p.note) + '</div>';
    }

    if (Array.isArray(p.cross_sell) && p.cross_sell.length) {
      html += '<div class="grimior-cross-sell">';
      html +=   '<div class="grimior-cross-sell-label">From the Apothecary</div>';
      html +=   '<div class="grimior-cross-sell-items">' +
                  p.cross_sell.map(function (c) { return '<span class="grimior-cross-sell-tag">' + escapeHtml(c) + '</span>'; }).join('') +
                '</div>';
      html += '</div>';
    }

    if (p.closing) {
      html += '<p class="grimior-handwriting">' + escapeHtml(p.closing) + '</p>';
    }

    if (num) html += '<div class="grimior-page-number">— ' + escapeHtml(String(num)) + ' —</div>';
    html += '</div>';
    return html;
  }

  function renderWelcomePage(p, side) {
    var num = (typeof p.number === 'number') ? p.number : '';
    var body = '';
    if (Array.isArray(p.body)) {
      body = '<div class="grimior-body">' + p.body.map(function (l) { return '<p>' + escapeHtml(l) + '</p>'; }).join('') + '</div>';
    }
    return (
      '<div class="grimior-page grimior-page--' + side + '">' +
        '<div class="grimior-welcome-pressed" aria-hidden="true">✦ ⚜ ✦</div>' +
        '<h3 class="grimior-page-title">' + escapeHtml(p.title || 'Welcome') + '</h3>' +
        body +
        (p.closing ? '<p class="grimior-handwriting">' + escapeHtml(p.closing) + '</p>' : '') +
        (num ? '<div class="grimior-page-number">— ' + escapeHtml(String(num)) + ' —</div>' : '') +
      '</div>'
    );
  }

  function renderChapterDivider(p, side) {
    return (
      '<div class="grimior-page grimior-page--' + side + ' grimior-page--chapter">' +
        '<div class="grimior-chapter-flourish">✦ ─── ✦ ─── ✦</div>' +
        '<div class="grimior-chapter-roman">' + escapeHtml(p.chapter || '') + '</div>' +
        '<div class="grimior-chapter-name">' + escapeHtml(p.title || '') + '</div>' +
        (p.verse ? '<p class="grimior-chapter-verse">“' + escapeHtml(p.verse) + '”</p>' : '') +
      '</div>'
    );
  }

  function renderTOC() {
    var pages = state.pages;
    var byChapter = {};
    var chapterOrder = [];

    pages.forEach(function (p, idx) {
      if (p.kind === 'cover' || p.kind === 'toc' || p.kind === 'welcome') return;
      var ch = p.chapter || 'Misc';
      if (!byChapter[ch]) { byChapter[ch] = []; chapterOrder.push(ch); }
      byChapter[ch].push({ p: p, idx: idx });
    });

    var html = '<div class="grimior-toc-wrap">';
    html += '<h3 class="grimior-toc-title">Table of Contents</h3>';
    html += '<div class="grimior-toc-grid">';
    chapterOrder.forEach(function (ch) {
      html += '<div class="grimior-toc-entry-chapter">Chapter ' + escapeHtml(ch) + '</div>';
      byChapter[ch].forEach(function (item) {
        var p = item.p;
        if (p.kind === 'chapter-divider') return;
        var title = p.title || '';
        var num = p.number != null ? p.number : '';
        var locked = !isAccessible(p) ? ' is-locked' : '';
        html += '<button type="button" class="grimior-toc-entry' + locked + '" data-goto="' + item.idx + '">' +
                  '<span class="grimior-toc-entry-title">' + (locked ? '🔒 ' : '') + escapeHtml(title) + '</span>' +
                  '<span class="grimior-toc-entry-num">' + escapeHtml(String(num)) + '</span>' +
                '</button>';
      });
    });
    html += '</div></div>';
    return html;
  }

  function renderPaywall() {
    var emailVal = escapeHtml(state.email || '');
    return (
      '<div class="grimior-paywall">' +
        '<div class="grimior-paywall-glyph">✦ ⚜ ✦</div>' +
        '<h2 class="grimior-paywall-title">Unlock The Grimior</h2>' +
        '<p class="grimior-paywall-sub">A true book of light magic with 88 sacred pages, rituals, protections, cleansing rites, exclusive monthly gifts, promo codes, and magical wisdom.</p>' +
        '<ul class="grimior-paywall-perks">' +
          '<li>Full access to all 88 pages</li>' +
          '<li>Subscriber-only promo codes &amp; discounts</li>' +
          '<li>Monthly featured product for $5</li>' +
          '<li>New magical content added each month</li>' +
          '<li>Seasonal rituals &amp; ritual of the month</li>' +
          '<li>Newsletter, product offers, and new-page alerts</li>' +
        '</ul>' +
        '<div class="grimior-paywall-price">$3.33 <small>per month • cancel anytime</small></div>' +
        '<form class="grimior-paywall-form" id="grimiorSubscribeForm">' +
          '<input type="email" id="grimiorSubscribeEmail" required placeholder="Your email — your key to the book" value="' + emailVal + '" />' +
          '<button type="submit" class="grimior-paywall-cta" id="grimiorSubscribeBtn">✦ Join for $3.33 / month</button>' +
        '</form>' +
        '<div class="grimior-paywall-fineprint">Secure checkout. Cancel anytime. Access tied to your email.</div>' +
        '<div class="grimior-paywall-msg" id="grimiorSubscribeMsg"></div>' +
        '<div class="grimior-paywall-existing">Already a subscriber? <button type="button" id="grimiorOpenSignIn">Enter your email</button></div>' +
      '</div>'
    );
  }

  function renderPageContent(p, side) {
    if (!p) return '<div class="grimior-page grimior-page--' + side + '"></div>';
    if (p.kind === 'cover') return renderCoverPage(p);
    if (p.kind === 'welcome') return renderWelcomePage(p, side);
    if (p.kind === 'chapter-divider') return renderChapterDivider(p, side);
    if (p.kind === 'toc') return '__TOC__';
    return renderTextPage(p, side);
  }

  function renderSpread() {
    var idx = state.pageIdx;
    var pages = state.pages;
    if (idx < 0) idx = 0;
    if (idx >= pages.length) idx = pages.length - 1;
    state.pageIdx = idx;

    var left = pages[idx];
    var right = pages[idx + 1];

    var spread = $('#grimiorSpread');
    if (!spread) return;

    var leftLocked  = left  && !isAccessible(left);
    var rightLocked = right && !isAccessible(right);

    // Cover, TOC and paywall span the full spread.
    if (left && left.kind === 'cover') {
      spread.innerHTML = renderCoverPage(left);
    } else if (left && left.kind === 'toc') {
      spread.innerHTML = renderTOC();
    } else if (leftLocked) {
      spread.innerHTML = renderPaywall();
    } else {
      var leftHtml  = renderPageContent(left,  'left');
      var rightHtml = right ? (rightLocked ? renderPaywall() : renderPageContent(right, 'right'))
                            : '<div class="grimior-page grimior-page--right"></div>';

      // If right is paywall, span both sides
      if (rightLocked) {
        spread.innerHTML = renderPaywall();
      } else if (left && left.kind === 'chapter-divider') {
        // chapter divider on left + next page on right (if accessible)
        spread.innerHTML = leftHtml + rightHtml;
      } else {
        spread.innerHTML = leftHtml + rightHtml;
      }
    }

    var indicator = $('#grimiorPageIndicator');
    if (indicator) {
      var total = pages.length;
      indicator.textContent = 'Page ' + (idx + 1) + (right ? '–' + (idx + 2) : '') + ' of ' + total;
    }

    var prev = $('#grimiorPrevBtn');
    var next = $('#grimiorNextBtn');
    if (prev) prev.disabled = idx <= 0;
    if (next) next.disabled = idx >= pages.length - 1;

    bindSpreadEvents();
    saveLastPage();
  }

  function bindSpreadEvents() {
    // TOC entries
    $$('#grimiorSpread .grimior-toc-entry').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = parseInt(btn.getAttribute('data-goto'), 10);
        if (!isNaN(i)) goToPage(i);
      });
    });

    // Paywall form
    var form = $('#grimiorSubscribeForm');
    if (form) form.addEventListener('submit', handleSubscribe);
    var openSignIn = $('#grimiorOpenSignIn');
    if (openSignIn) openSignIn.addEventListener('click', openSignInModal);
  }

  function flipForward() {
    var pages = state.pages;
    if (state.pageIdx >= pages.length - 1) return;
    var stage = $('#grimiorBook');
    if (stage) {
      stage.classList.remove('grimior-flip-anim-back');
      stage.classList.remove('grimior-flip-anim');
      void stage.offsetWidth;
      stage.classList.add('grimior-flip-anim');
    }
    var step = 2;
    // chapter dividers and full-bleed pages take a single step
    var cur = pages[state.pageIdx];
    if (cur && (cur.kind === 'cover' || cur.kind === 'toc' || cur.kind === 'chapter-divider')) step = 1;
    state.pageIdx = Math.min(pages.length - 1, state.pageIdx + step);
    renderSpread();
  }

  function flipBackward() {
    if (state.pageIdx <= 0) return;
    var stage = $('#grimiorBook');
    if (stage) {
      stage.classList.remove('grimior-flip-anim');
      stage.classList.remove('grimior-flip-anim-back');
      void stage.offsetWidth;
      stage.classList.add('grimior-flip-anim-back');
    }
    var step = 2;
    var prev = state.pages[state.pageIdx - 1];
    if (prev && (prev.kind === 'cover' || prev.kind === 'toc' || prev.kind === 'chapter-divider')) step = 1;
    state.pageIdx = Math.max(0, state.pageIdx - step);
    renderSpread();
  }

  function goToPage(idx) {
    var pages = state.pages;
    if (idx < 0) idx = 0;
    if (idx >= pages.length) idx = pages.length - 1;
    state.pageIdx = idx;
    renderSpread();
    // scroll book back into view
    var section = document.getElementById('the-grimior');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ----- Persistence -----
  function saveLastPage() {
    try { localStorage.setItem(STORAGE_KEYS.page, String(state.pageIdx)); } catch (e) {}
  }
  function loadLastPage() {
    try {
      var v = localStorage.getItem(STORAGE_KEYS.page);
      var n = parseInt(v, 10);
      if (!isNaN(n) && n >= 0) state.pageIdx = n;
    } catch (e) {}
  }
  function saveEmail(email) {
    try { localStorage.setItem(STORAGE_KEYS.email, email || ''); } catch (e) {}
    state.email = email || '';
  }
  function loadEmail() {
    try { state.email = localStorage.getItem(STORAGE_KEYS.email) || ''; } catch (e) {}
  }

  // ----- Subscription flow -----
  function setMsg(text, kind) {
    var el = $('#grimiorSubscribeMsg');
    if (!el) return;
    el.textContent = text || '';
    el.className = 'grimior-paywall-msg' + (kind ? ' is-' + kind : '');
  }

  function handleSubscribe(e) {
    e.preventDefault();
    var input = $('#grimiorSubscribeEmail');
    var btn = $('#grimiorSubscribeBtn');
    var email = (input && input.value || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMsg('Please enter a valid email so we can carry the key to your inbox.', 'error');
      return;
    }
    saveEmail(email);
    setMsg('Opening the secure gate…');
    if (btn) btn.disabled = true;

    fetch('/api/grimior-subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email })
    }).then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (data) {
        if (data && data.url) {
          window.location.href = data.url;
        } else {
          setMsg(data && data.error
            ? data.error
            : 'The gate could not open just now. Please try again in a moment.', 'error');
          if (btn) btn.disabled = false;
        }
      })
      .catch(function () {
        setMsg('Connection lost between worlds. Please try again.', 'error');
        if (btn) btn.disabled = false;
      });
  }

  function openSignInModal() {
    var modal = $('#grimiorSignInModal');
    if (!modal) return;
    modal.classList.add('is-open');
    var input = $('#grimiorSignInEmail');
    if (input) {
      input.value = state.email || '';
      input.focus();
    }
  }
  function closeSignInModal() {
    var modal = $('#grimiorSignInModal');
    if (modal) modal.classList.remove('is-open');
  }

  function handleSignInCheck() {
    var input = $('#grimiorSignInEmail');
    var msg = $('#grimiorSignInMsg');
    var email = (input && input.value || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (msg) msg.textContent = 'Please enter a valid email.';
      return;
    }
    if (msg) msg.textContent = 'Checking the keeper’s ledger…';
    saveEmail(email);
    fetchSubscriberStatus(email).then(function (active) {
      if (active) {
        if (msg) msg.textContent = 'Welcome back. The book opens.';
        setTimeout(closeSignInModal, 600);
      } else {
        if (msg) msg.textContent = 'No active subscription on this email yet. You can join below.';
        setTimeout(closeSignInModal, 1200);
      }
    });
  }

  function fetchSubscriberStatus(email) {
    if (!email) return Promise.resolve(false);
    return fetch('/api/grimior-status?email=' + encodeURIComponent(email))
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (data) {
        var active = !!(data && data.active);
        state.isSubscriber = active;
        try { localStorage.setItem(STORAGE_KEYS.active, active ? '1' : '0'); } catch (e) {}
        updateSubscriberChip();
        renderSpread();
        return active;
      })
      .catch(function () {
        // fall back to last cached value (cosmetic only)
        try {
          state.isSubscriber = localStorage.getItem(STORAGE_KEYS.active) === '1';
        } catch (e) {}
        updateSubscriberChip();
        renderSpread();
        return state.isSubscriber;
      });
  }

  function updateSubscriberChip() {
    var chip = $('#grimiorSubscriberChip');
    if (!chip) return;
    if (state.isSubscriber) {
      chip.style.display = 'inline-flex';
      chip.textContent = '✦ Keeper of the Grimior';
    } else {
      chip.style.display = 'none';
    }
  }

  // ----- Post-checkout confirmation -----
  function maybeConfirmCheckout() {
    var params = new URLSearchParams(window.location.search);
    var sid = params.get('grimior_session_id');
    var status = params.get('grimior');
    if (!sid && status !== 'success') return Promise.resolve();
    if (!sid) return Promise.resolve();

    return fetch('/api/grimior-confirm?session_id=' + encodeURIComponent(sid))
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (data) {
        if (data && data.email) {
          saveEmail(data.email);
        }
        if (data && data.active) {
          state.isSubscriber = true;
          try { localStorage.setItem(STORAGE_KEYS.active, '1'); } catch (e) {}
        }
        // Strip the params from the URL so refreshing doesn't loop
        try {
          var clean = window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, clean);
        } catch (e) {}
      })
      .catch(function () { /* ignore */ });
  }

  // ----- Init -----
  function bindControls() {
    var prev = $('#grimiorPrevBtn');
    var next = $('#grimiorNextBtn');
    var toc  = $('#grimiorTocBtn');
    if (prev) prev.addEventListener('click', flipBackward);
    if (next) next.addEventListener('click', flipForward);
    if (toc)  toc.addEventListener('click', function () {
      var idx = state.pages.findIndex(function (p) { return p.kind === 'toc'; });
      if (idx >= 0) goToPage(idx);
    });

    // Keyboard arrows when the section is active
    document.addEventListener('keydown', function (e) {
      var section = document.getElementById('the-grimior');
      if (!section || !section.classList.contains('active')) return;
      if (e.key === 'ArrowRight') flipForward();
      if (e.key === 'ArrowLeft') flipBackward();
    });

    // Touch swipe for mobile
    var book = $('#grimiorBook');
    if (book) {
      var startX = null;
      book.addEventListener('touchstart', function (ev) {
        if (ev.touches && ev.touches.length === 1) startX = ev.touches[0].clientX;
      }, { passive: true });
      book.addEventListener('touchend', function (ev) {
        if (startX == null) return;
        var endX = (ev.changedTouches && ev.changedTouches[0] && ev.changedTouches[0].clientX) || startX;
        var dx = endX - startX;
        if (Math.abs(dx) > 50) {
          if (dx < 0) flipForward(); else flipBackward();
        }
        startX = null;
      });
    }

    // Sign-in modal
    var signInClose = $('#grimiorSignInClose');
    var signInCheck = $('#grimiorSignInCheck');
    var signInModal = $('#grimiorSignInModal');
    if (signInClose) signInClose.addEventListener('click', closeSignInModal);
    if (signInCheck) signInCheck.addEventListener('click', handleSignInCheck);
    if (signInModal) signInModal.addEventListener('click', function (e) {
      if (e.target === signInModal) closeSignInModal();
    });
  }

  function init() {
    var pages = window.GRIMIOR_PAGES || [];
    if (!pages.length) return;
    state.pages = pages;

    loadLastPage();
    loadEmail();

    // optimistic local cache for instant render before server check
    try {
      state.isSubscriber = localStorage.getItem(STORAGE_KEYS.active) === '1';
    } catch (e) {}
    updateSubscriberChip();

    bindControls();
    renderSpread();

    // Confirm checkout result if returning from Stripe, then re-check status.
    maybeConfirmCheckout().then(function () {
      if (state.email) {
        fetchSubscriberStatus(state.email);
      } else {
        renderSpread();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose a couple of helpers for other parts of the site if they want to nudge users to the book.
  window.openGrimior = function (idx) {
    if (typeof window.showSection === 'function') {
      window.showSection('the-grimior');
    }
    if (typeof idx === 'number') goToPage(idx);
  };
})();
