// ============================================================
// NAVIGATION HISTORY + STATE MANAGEMENT
// Adds browser history support for SPA navigation, product deep-links,
// modal/drawer state, quiz/builder step preservation, and scroll restore
// ============================================================

(function() {
  'use strict';

  // --- STATE KEYS ---
  var KEYS = {
    LAST_SECTION: 'aa_lastSection',
    LAST_PRODUCT: 'aa_lastProduct',
    SCROLL_POS: 'aa_scrollPositions',
    QUIZ_STEP: 'aa_quizStep',
    BUILDER_STEP: 'aa_builderStep',
    CART: 'aa_cart',
    SELECTED_HERBS: 'aa_selectedHerbs',
    SELECTED_SYMPTOMS: 'aa_selectedSymptoms'
  };

  // --- HISTORY PUSH HELPER ---
  var isPopping = false;

  function pushState(stateObj, title) {
    if (isPopping) return;
    var url = stateObj.section ? ('/' + (stateObj.section === 'home' ? '' : stateObj.section)) : '/';
    if (stateObj.product) url += '?product=' + stateObj.product;
    try {
      history.pushState(stateObj, title || '', url);
    } catch(e) {}
  }

  // --- NAVIGATE TO PRODUCT (deep-link from symptom buttons) ---
  window.navigateToProduct = function(productId) {
    showSection('shop');
    pushState({ section: 'shop', product: productId }, 'Shop');
    setTimeout(function() {
      var card = document.querySelector('.product-card[data-product-id="' + productId + '"]');
      if (!card) {
        // Try to find by data-id on add button
        var btn = document.querySelector('.product-add-btn[data-id="' + productId + '"]');
        if (btn) card = btn.closest('.product-card');
      }
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.add('product-highlight');
        setTimeout(function() { card.classList.remove('product-highlight'); }, 2000);
      }
    }, 350);
    // Save last product viewed
    try { sessionStorage.setItem(KEYS.LAST_PRODUCT, productId); } catch(e) {}
  };

  // --- WRAP showSection for history ---
  var _baseShowSection = window.showSection;
  window.showSection = function(id) {
    _baseShowSection(id);
    if (!isPopping) {
      pushState({ section: id }, id);
    }
    // Persist last section
    try { sessionStorage.setItem(KEYS.LAST_SECTION, id); } catch(e) {}
    // Save scroll position of previous section
    saveScrollPosition();
  };

  // --- POPSTATE HANDLER (back/forward buttons) ---
  window.addEventListener('popstate', function(e) {
    isPopping = true;
    var state = e.state;

    // Close any open modals/drawers first
    var cartDrawer = document.getElementById('cartDrawer');
    var cartOverlay = document.getElementById('cartOverlay');
    if (cartDrawer && cartDrawer.classList.contains('open')) {
      cartDrawer.classList.remove('open');
      if (cartOverlay) cartOverlay.classList.remove('visible');
      isPopping = false;
      return;
    }

    var herbModal = document.getElementById('herbModal');
    if (herbModal && herbModal.style.display !== 'none') {
      herbModal.style.display = 'none';
      document.body.style.overflow = '';
      isPopping = false;
      return;
    }

    // Check guided flow overlay
    var guidedOverlay = document.getElementById('guidedFlowOverlay');
    if (guidedOverlay && guidedOverlay.style.display !== 'none' && guidedOverlay.style.display !== '') {
      guidedOverlay.style.display = 'none';
      document.body.style.overflow = '';
      isPopping = false;
      return;
    }

    if (state && state.section) {
      _baseShowSection(state.section);
      if (state.product) {
        setTimeout(function() {
          var card = document.querySelector('.product-card[data-product-id="' + state.product + '"]');
          if (!card) {
            var btn = document.querySelector('.product-add-btn[data-id="' + state.product + '"]');
            if (btn) card = btn.closest('.product-card');
          }
          if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 200);
      } else {
        restoreScrollPosition(state.section);
      }
    } else {
      _baseShowSection('home');
    }

    isPopping = false;
  });

  // --- SCROLL POSITION SAVE/RESTORE ---
  function saveScrollPosition() {
    try {
      var positions = JSON.parse(sessionStorage.getItem(KEYS.SCROLL_POS) || '{}');
      var active = document.querySelector('.page-section.active');
      if (active) {
        positions[active.id] = window.scrollY;
        sessionStorage.setItem(KEYS.SCROLL_POS, JSON.stringify(positions));
      }
    } catch(e) {}
  }

  function restoreScrollPosition(sectionId) {
    try {
      var positions = JSON.parse(sessionStorage.getItem(KEYS.SCROLL_POS) || '{}');
      if (positions[sectionId]) {
        setTimeout(function() { window.scrollTo(0, positions[sectionId]); }, 100);
      }
    } catch(e) {}
  }

  // --- CART DRAWER HISTORY ---
  var origOpenCart = window.openCart;
  if (typeof origOpenCart === 'function') {
    window.openCart = function() {
      origOpenCart();
      pushState({ section: 'cart-open', overlay: true }, 'Cart');
    };
  }

  // --- CART PERSISTENCE ---
  function persistCart() {
    try {
      if (typeof cart !== 'undefined') {
        sessionStorage.setItem(KEYS.CART, JSON.stringify(cart));
      }
    } catch(e) {}
  }

  function restoreCart() {
    try {
      var saved = sessionStorage.getItem(KEYS.CART);
      if (saved && typeof cart !== 'undefined') {
        var items = JSON.parse(saved);
        if (Array.isArray(items) && items.length > 0 && cart.length === 0) {
          items.forEach(function(item) { cart.push(item); });
          if (typeof renderCart === 'function') renderCart();
        }
      }
    } catch(e) {}
  }

  // Persist cart on changes
  var origAddToCart = window.addToCart;
  if (typeof origAddToCart === 'function') {
    window.addToCart = function(name, price) {
      origAddToCart(name, price);
      persistCart();
    };
  }

  var origAddItemToCart = window.addItemToCart;
  if (typeof origAddItemToCart === 'function') {
    window.addItemToCart = function(item) {
      origAddItemToCart(item);
      persistCart();
    };
  }

  // --- QUIZ/BUILDER STATE PERSISTENCE ---
  window.persistQuizStep = function(step, data) {
    try {
      sessionStorage.setItem(KEYS.QUIZ_STEP, JSON.stringify({ step: step, data: data }));
    } catch(e) {}
  };

  window.persistBuilderStep = function(step, data) {
    try {
      sessionStorage.setItem(KEYS.BUILDER_STEP, JSON.stringify({ step: step, data: data }));
    } catch(e) {}
  };

  window.getPersistedQuizStep = function() {
    try { return JSON.parse(sessionStorage.getItem(KEYS.QUIZ_STEP)); } catch(e) { return null; }
  };

  window.getPersistedBuilderStep = function() {
    try { return JSON.parse(sessionStorage.getItem(KEYS.BUILDER_STEP)); } catch(e) { return null; }
  };

  // --- HERB/SYMPTOM SELECTION PERSISTENCE ---
  window.persistSelectedHerbs = function(herbs) {
    try { sessionStorage.setItem(KEYS.SELECTED_HERBS, JSON.stringify(herbs)); } catch(e) {}
  };

  window.persistSelectedSymptoms = function(symptoms) {
    try { sessionStorage.setItem(KEYS.SELECTED_SYMPTOMS, JSON.stringify(symptoms)); } catch(e) {}
  };

  window.getPersistedHerbs = function() {
    try { return JSON.parse(sessionStorage.getItem(KEYS.SELECTED_HERBS)) || []; } catch(e) { return []; }
  };

  window.getPersistedSymptoms = function() {
    try { return JSON.parse(sessionStorage.getItem(KEYS.SELECTED_SYMPTOMS)) || []; } catch(e) { return []; }
  };

  // --- ADD PRODUCT IDs TO CARDS (for deep-linking) ---
  function tagProductCards() {
    if (typeof PRODUCTS === 'undefined') return;
    document.querySelectorAll('.product-add-btn[data-id]').forEach(function(btn) {
      var card = btn.closest('.product-card');
      if (card) card.setAttribute('data-product-id', btn.dataset.id);
    });
  }

  // --- INITIAL STATE ---
  // Handle URL-based routing (for Netlify redirects)
  var validSections = ['home','shop','herbal-wisdom','herbal-library','custom-formula','herb-index','journal','soaps','services','about','faqs','contact','checkout'];
  var initialPath = location.pathname.replace(/^\//, '').replace(/\/$/, '') || 'home';
  var initialSection = validSections.indexOf(initialPath) !== -1 ? initialPath : 'home';
  var urlProduct = (new URLSearchParams(location.search)).get('product');

  history.replaceState({ section: initialSection, product: urlProduct }, '', location.pathname + location.search);

  // Tag product cards once rendered
  document.addEventListener('sectionChanged', function(e) {
    if (e.detail && e.detail.section === 'shop') {
      setTimeout(tagProductCards, 200);
    }
  });

  // Restore cart on load
  restoreCart();

  // Handle URL-based initial routing
  if (initialSection !== 'home') {
    setTimeout(function() {
      _baseShowSection(initialSection);
      if (urlProduct) {
        setTimeout(function() {
          tagProductCards();
          navigateToProduct(urlProduct);
        }, 400);
      }
    }, 100);
  } else {
    // Restore last section on reload (only if meaningful)
    var lastSection = null;
    try { lastSection = sessionStorage.getItem(KEYS.LAST_SECTION); } catch(e) {}
    if (lastSection && lastSection !== 'home' && lastSection !== 'checkout') {
      if (!document.referrer || document.referrer.indexOf(location.hostname) !== -1) {
        setTimeout(function() {
          _baseShowSection(lastSection);
          history.replaceState({ section: lastSection }, '', '/' + lastSection);
          var lastProduct = null;
          try { lastProduct = sessionStorage.getItem(KEYS.LAST_PRODUCT); } catch(e) {}
          if (lastProduct && lastSection === 'shop') {
            setTimeout(function() {
              tagProductCards();
              var card = document.querySelector('.product-card[data-product-id="' + lastProduct + '"]');
              if (!card) {
                var btn = document.querySelector('.product-add-btn[data-id="' + lastProduct + '"]');
                if (btn) card = btn.closest('.product-card');
              }
              if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 400);
          }
        }, 100);
      }
    }
  }

})();
