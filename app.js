// ============================================================
// AMBER'S ALCHEMY APOTHECARY — MAIN APP v6
// Navigation, Cart, Herb Index, Tea Builder, Forms, Email
// ============================================================

// ---- STATE ----
let cart = [];
let selectedHerbs = [];
let teaSelectedHerbs = [];

// ---- HELPERS ----
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function formatPrice(n) { return '$' + n.toFixed(2); }

// ---- NAVIGATION ----
function showSection(id) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) { target.classList.add('active'); window.scrollTo(0, 0); }
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.section === id);
  });
  document.getElementById('navLinks').classList.remove('open');
  try {
    if (window.AAA && window.AAA.track) {
      window.AAA.track('page_view', {
        page_location: window.location.origin + '/' + (id || ''),
        page_path: '/' + (id || ''),
        page_title: (id || 'home') + ' — Amber\'s Alchemy Apothecary',
        trigger: 'section_change'
      });
    }
  } catch (e) {}
}

// Bind all [data-section] elements (including footer links and category cards)
document.addEventListener('click', function(e) {
  const el = e.target.closest('[data-section]');
  if (el && !el.classList.contains('cat-filter-btn')) {
    e.preventDefault();
    showSection(el.dataset.section);
  }
});

document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

// ---- CONSULTATION BANNER ----
document.getElementById('consultClose').addEventListener('click', () => {
  document.getElementById('consultBanner').style.display = 'none';
});

// ---- MUSIC (audio pill — fades in 6s after page load, no upfront modal) ----

const bgMusic = document.getElementById('bgMusic');
const musicToggleBtn = document.getElementById('musicToggleBtn');
const audioPill = document.getElementById('audioPill');
const audioPillYes = document.getElementById('audioPillYes');
const audioPillNo = document.getElementById('audioPillNo');
let musicPlaying = false;

bgMusic.volume = 0;
bgMusic.loop = true;

function fadeInMusic(targetVol) {
  bgMusic.volume = 0;
  var current = 0;
  var step = 0.005;
  var interval = 120;
  var fade = setInterval(function() {
    current += step;
    if (current >= targetVol) { current = targetVol; clearInterval(fade); }
    bgMusic.volume = current;
  }, interval);
}

function getStartVolume() {
  var saved = Number(localStorage.getItem('siteVolume'));
  if (saved && saved > 0) return Math.min(saved, 0.12);
  return 0.07;
}

function setMusicUI(playing) {
  musicPlaying = playing;
  if (!musicToggleBtn) return;
  if (playing) {
    musicToggleBtn.innerHTML = '&#9834; ON';
    musicToggleBtn.classList.add('playing');
    musicToggleBtn.title = 'Turn music off';
  } else {
    musicToggleBtn.innerHTML = '&#9834; OFF';
    musicToggleBtn.classList.remove('playing');
    musicToggleBtn.title = 'Turn music on';
  }
}

// Audio pill: fade in 6s after load, dismiss after first interaction.
function showAudioPill() {
  if (!audioPill) return;
  if (sessionStorage.getItem('audioPillDismissed')) return;
  audioPill.style.display = 'flex';
  // next frame to trigger transition
  requestAnimationFrame(function() { audioPill.style.opacity = '1'; });
}
function hideAudioPill() {
  if (!audioPill) return;
  audioPill.style.opacity = '0';
  setTimeout(function() { audioPill.style.display = 'none'; }, 600);
  try { sessionStorage.setItem('audioPillDismissed', '1'); } catch (e) {}
}

// ---- ENTRANCE OVERLAY (sessionStorage key: awakenMusicChoice) ----
// Persists per-session — choice survives navigation between pages within the same tab.
(function() {
  var overlay = document.getElementById('entranceOverlay');
  if (!overlay) return;
  var withMusicBtn = document.getElementById('entranceWithMusic');
  var silentBtn = document.getElementById('entranceSilent');

  function startMusicFromOverlay() {
    var target = getStartVolume();
    bgMusic.volume = 0;
    if (volumeSlider) volumeSlider.value = Math.round(target * 100);
    bgMusic.load();
    bgMusic.play().then(function() {
      fadeInMusic(target);
      setMusicUI(true);
    }).catch(function() { setMusicUI(false); });
  }

  function closeOverlay() {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.45s ease';
    setTimeout(function() { overlay.style.display = 'none'; }, 450);
  }

  var existingChoice = null;
  try { existingChoice = sessionStorage.getItem('awakenMusicChoice'); } catch (e) {}

  if (!existingChoice) {
    // First visit this session — show overlay
    overlay.style.display = 'flex';
    overlay.style.opacity = '1';
    // Suppress audio pill since the overlay covers that decision
    try { sessionStorage.setItem('audioPillDismissed', '1'); } catch (e) {}
  } else if (existingChoice === 'music') {
    // Returning page within session — auto-resume music silently
    setTimeout(function() {
      bgMusic.play().then(function() {
        fadeInMusic(getStartVolume());
        setMusicUI(true);
      }).catch(function() { /* browser blocked — user can use nav toggle */ });
    }, 300);
  }

  if (withMusicBtn) {
    withMusicBtn.addEventListener('click', function() {
      try { sessionStorage.setItem('awakenMusicChoice', 'music'); } catch (e) {}
      startMusicFromOverlay();
      closeOverlay();
    });
  }
  if (silentBtn) {
    silentBtn.addEventListener('click', function() {
      try { sessionStorage.setItem('awakenMusicChoice', 'silent'); } catch (e) {}
      closeOverlay();
    });
  }
})();

// Audio pill only appears when overlay was already answered AND user picked silent (gives them
// a soft second-chance to enable music) — the overlay handler suppresses it on first visit.
setTimeout(showAudioPill, 6000);

if (audioPillYes) {
  audioPillYes.addEventListener('click', function() {
    var target = getStartVolume();
    bgMusic.volume = 0;
    if (volumeSlider) volumeSlider.value = Math.round(target * 100);
    bgMusic.load();
    bgMusic.play().then(function() {
      fadeInMusic(target);
      setMusicUI(true);
    }).catch(function() { setMusicUI(false); });
    hideAudioPill();
  });
}
if (audioPillNo) {
  audioPillNo.addEventListener('click', hideAudioPill);
}

// Persistent nav toggle: ON <-> OFF
if (musicToggleBtn) {
  musicToggleBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (musicPlaying) {
      bgMusic.pause();
      setMusicUI(false);
    } else {
      var target = getStartVolume();
      bgMusic.volume = 0;
      if (volumeSlider) volumeSlider.value = Math.round(target * 100);
      bgMusic.play().then(function() {
        fadeInMusic(target);
        setMusicUI(true);
      }).catch(function() {});
    }
  });
}

// Volume slider
const volumeSlider = document.getElementById('volumeSlider');
if (volumeSlider) {
  volumeSlider.addEventListener('input', function() {
    const vol = parseInt(this.value) / 100;
    bgMusic.volume = vol;
    localStorage.setItem('siteVolume', vol);
    if (vol === 0 && musicPlaying) {
      bgMusic.pause();
      setMusicUI(false);
    } else if (vol > 0 && !musicPlaying) {
      bgMusic.play().then(function() { setMusicUI(true); }).catch(function() {});
    }
  });
}

// ---- AUDIO LIFECYCLE: stop music on tab hide/close/background ----
document.addEventListener('visibilitychange', function() {
  if (document.hidden && musicPlaying) {
    bgMusic.pause();
    setMusicUI(false);
  }
});

window.addEventListener('pagehide', function() {
  bgMusic.pause();
  bgMusic.removeAttribute('src');
  bgMusic.load();
  setMusicUI(false);
});

window.addEventListener('beforeunload', function() {
  bgMusic.pause();
  setMusicUI(false);
});

// ---- INTRO VIDEO ↔ BACKGROUND MUSIC COORDINATION ----
(function() {
  var introIframe = document.getElementById('intro-video');
  var muteBtn = document.getElementById('videoMuteBtn');
  if (!introIframe || typeof Vimeo === 'undefined') return;

  var vimeoPlayer = new Vimeo.Player(introIframe);
  var bgWasPlayingBeforeVideo = false;
  var videoIsPlaying = false;
  var videoIsMuted = true; // starts muted by default for autoplay policy

  // Set initial muted state
  vimeoPlayer.setMuted(true);

  function updateMuteBtn() {
    if (muteBtn) {
      if (videoIsMuted) {
        muteBtn.textContent = '🔇 Muted';
        muteBtn.setAttribute('aria-label', 'Unmute video');
        muteBtn.title = 'Unmute video audio';
        muteBtn.classList.remove('video-unmuted');
      } else {
        muteBtn.textContent = '🔊 Sound On';
        muteBtn.setAttribute('aria-label', 'Mute video');
        muteBtn.title = 'Mute video audio';
        muteBtn.classList.add('video-unmuted');
      }
    }
  }
  updateMuteBtn();

  // Mute/unmute toggle
  if (muteBtn) {
    muteBtn.addEventListener('click', function() {
      videoIsMuted = !videoIsMuted;
      vimeoPlayer.setMuted(videoIsMuted);
      updateMuteBtn();
      // If unmuting while playing, ensure bg music is paused
      if (!videoIsMuted && videoIsPlaying && !bgMusic.paused) {
        bgMusic.pause();
        setMusicUI(false);
      }
    });
  }

  // On video play -> pause background music
  vimeoPlayer.on('play', function() {
    videoIsPlaying = true;
    bgWasPlayingBeforeVideo = musicPlaying || !bgMusic.paused;
    if (!bgMusic.paused) {
      bgMusic.pause();
      setMusicUI(false);
    }
  });

  // On video pause -> keep bg music paused (user must manually resume)
  vimeoPlayer.on('pause', function() {
    videoIsPlaying = false;
  });

  // On video ended -> resume background music if it was playing before
  vimeoPlayer.on('ended', function() {
    videoIsPlaying = false;
    if (bgWasPlayingBeforeVideo) {
      var target = getStartVolume();
      bgMusic.volume = 0;
      bgMusic.play().then(function() {
        fadeInMusic(target);
        setMusicUI(true);
      }).catch(function() {});
      bgWasPlayingBeforeVideo = false;
    }
  });

  // Clean up on page unload
  window.addEventListener('pagehide', function() {
    vimeoPlayer.pause().catch(function() {});
    vimeoPlayer.setMuted(true).catch(function() {});
  });

  window.addEventListener('beforeunload', function() {
    vimeoPlayer.pause().catch(function() {});
  });
})();

// ---- CART ----
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');

function openCart() { cartDrawer.classList.add('open'); cartOverlay.classList.add('visible'); }
function closeCartFn() { cartDrawer.classList.remove('open'); cartOverlay.classList.remove('visible'); }

document.getElementById('cartBtn').addEventListener('click', openCart);
document.getElementById('closeCart').addEventListener('click', closeCartFn);
cartOverlay.addEventListener('click', closeCartFn);

function calcCartTotals() {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalEl = document.getElementById('cartTotal');
  if (totalEl) totalEl.textContent = formatPrice(subtotal);
  const countEl = document.getElementById('cartCount');
  if (countEl) countEl.textContent = cart.reduce((s, i) => s + i.qty, 0);
  return { subtotal, total: subtotal };
}

function renderCart() {
  const el = document.getElementById('cartItems');
  if (cart.length === 0) {
    el.innerHTML = '<p class="empty-cart">Your jar is empty.</p>';
  } else {
    el.innerHTML = cart.map((item, idx) => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          ${item.form ? `<div class="cart-item-detail"><span class="cart-detail-label">Form:</span> ${item.form}</div>` : ''}
          ${item.symptoms ? `<div class="cart-item-detail"><span class="cart-detail-label">Symptoms:</span> ${item.symptoms}</div>` : ''}
          ${item.herbs ? `<div class="cart-item-detail"><span class="cart-detail-label">Herbs:</span> ${item.herbs}</div>` : ''}
          ${item.size ? `<div class="cart-item-detail"><span class="cart-detail-label">Size:</span> ${item.size}</div>` : ''}
          <div class="cart-item-price">${formatPrice(item.price)} \u00D7 ${item.qty}</div>
        </div>
        <div class="cart-item-controls">
          <div class="cart-qty-controls">
            <button class="cart-qty-btn" data-idx="${idx}" data-dir="-1">\u2212</button>
            <span class="cart-qty-display">${item.qty}</span>
            <button class="cart-qty-btn" data-idx="${idx}" data-dir="1">+</button>
          </div>
          <button class="cart-item-remove" data-idx="${idx}">\u2715</button>
        </div>
      </div>
    `).join('');
    el.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        cart.splice(parseInt(btn.dataset.idx), 1);
        renderCart(); calcCartTotals();
      });
    });
    el.querySelectorAll('.cart-qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        const dir = parseInt(btn.dataset.dir);
        if (cart[idx]) {
          cart[idx].qty = Math.max(1, cart[idx].qty + dir);
          renderCart(); calcCartTotals();
        }
      });
    });
  }
  calcCartTotals();
}

function addToCart(name, price, qty = 1, opts) {
  opts = opts || {};
  const variantKey = opts.variantKey || ShopifyCart.guessKey(name);
  const customAttributes = opts.customAttributes || null;

  // Local cart powers the sidebar UI. Shopify holds the source of truth for checkout.
  const existing = cart.find(i => i.name === name && !customAttributes);
  if (existing) { existing.qty += qty; }
  else {
    const item = { name, price, qty };
    if (opts.herbs) item.herbs = opts.herbs;
    if (variantKey) item.variantKey = variantKey;
    if (customAttributes) item.customAttributes = customAttributes;
    cart.push(item);
  }
  renderCart();
  ShopifyCart.add(variantKey, qty, customAttributes);
  showToast(`✦ Added to cart: ${name}`);
  openCart();
  try { window.AAA && window.AAA.addToCart && window.AAA.addToCart({ name: name, price: price, quantity: qty }, qty); } catch (e) {}
}

// ---- SHOPIFY CHECKOUT INTEGRATION ----
// Source of truth for checkout & payment. Local cart still powers the sidebar UI.
const ShopifyCart = (function() {
  let client = null;
  let checkout = null;
  let ready = null;

  function variantId(key) {
    if (!key) return null;
    const map = window.SHOPIFY_VARIANTS || {};
    return map[key] || null;
  }

  function guessKey(name) {
    if (!name) return null;
    const map = window.SHOPIFY_VARIANTS || {};
    const direct = Object.keys(map).find(k => k.toLowerCase() === String(name).toLowerCase());
    if (direct) return direct;
    const slug = String(name).toLowerCase().replace(/&amp;/g, '&').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (map[slug]) return slug;
    const aliases = {
      'dreamease-capsules': 'dreamease',
      'chill-pill-serenity-capsules': 'chill-pill',
      'the-gentle-detox-ritual': 'bundle-detox',
      'the-stress-relief-ritual': 'bundle-stress',
      'the-focus-clarity-ritual': 'bundle-focus',
      'the-happy-calm-ritual': 'bundle-mood',
      'the-energized-focused-ritual': 'bundle-energy'
    };
    return aliases[slug] || null;
  }

  function init() {
    if (ready) return ready;
    ready = new Promise(function(resolve) {
      function done() { resolve({ client: client, checkout: checkout }); }
      try {
        if (!window.ShopifyBuy || !window.SHOPIFY_DOMAIN || !window.SHOPIFY_STOREFRONT_TOKEN
            || window.SHOPIFY_STOREFRONT_TOKEN === 'YOUR_STOREFRONT_API_TOKEN') {
          console.warn('[Shopify] SDK or credentials not configured — checkout disabled until Amber pastes them in.');
          return done();
        }
        client = window.ShopifyBuy.buildClient({
          domain: window.SHOPIFY_DOMAIN,
          storefrontAccessToken: window.SHOPIFY_STOREFRONT_TOKEN
        });
        client.checkout.create().then(function(c) {
          checkout = c;
          window.shopifyCheckout = c;
          console.log('[Shopify] Checkout ready', c.id, c.webUrl);
          done();
        }).catch(function(err) {
          console.error('[Shopify] Failed to create checkout', err);
          done();
        });
      } catch (e) {
        console.error('[Shopify] init error', e);
        done();
      }
    });
    return ready;
  }

  function add(key, qty, customAttributes) {
    init().then(function(ctx) {
      if (!ctx.client || !ctx.checkout) return;
      const id = variantId(key);
      if (!id) {
        console.warn('[Shopify] No variant ID configured for "' + key + '" — paste it into SHOPIFY_VARIANTS in index.html.');
        return;
      }
      const lineItem = { variantId: id, quantity: qty || 1 };
      if (customAttributes && customAttributes.length) lineItem.customAttributes = customAttributes;
      ctx.client.checkout.addLineItems(ctx.checkout.id, [lineItem]).then(function(updated) {
        checkout = updated;
        window.shopifyCheckout = updated;
      }).catch(function(err) {
        console.error('[Shopify] addLineItems error', err);
      });
    });
  }

  function redirectToCheckout() {
    init().then(function(ctx) {
      if (!ctx.checkout || !ctx.checkout.webUrl) {
        showToast('Checkout is not configured yet. Please email awaken@consultant.com.');
        return;
      }
      try { window.AAA && window.AAA.beginCheckout && window.AAA.beginCheckout(cart, cart.reduce((s,i) => s + i.price * i.qty, 0)); } catch (e) {}
      window.location.href = ctx.checkout.webUrl;
    });
  }

  // Boot on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }

  return { add: add, redirectToCheckout: redirectToCheckout, guessKey: guessKey, variantId: variantId, init: init };
})();
window.ShopifyCart = ShopifyCart;

// ---- "Proceed to Checkout ✦" button — redirects to Shopify ----
document.addEventListener('click', function(e) {
  const btn = e.target.closest && e.target.closest('#checkout-btn');
  if (!btn) return;
  e.preventDefault();
  if (cart.length === 0) { showToast('Your cart is empty!'); return; }
  ShopifyCart.redirectToCheckout();
});

// Email validation helper
function isValidEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); }


// ---- RENDER PRODUCTS (with category filter) ----
function renderProducts(filterCat = 'all') {
  const grid = document.getElementById('shopGrid');
  const filtered = filterCat === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.categories && p.categories.includes(filterCat));
  if (filtered.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px;grid-column:1/-1">No products found in this category.</p>';
    return;
  }
  grid.innerHTML = filtered.map(p => {
    // Build "Why This Works" section from key herbs
    const whyItWorks = p.keyHerbs ? p.keyHerbs.map(h => {
      const info = getHerbWhyInfo(h);
      return `<div class="why-herb-item"><strong>${h}</strong> — <span>${info}</span></div>`;
    }).join('') : '';

    // Determine who it's for
    const whoFor = getWhoFor(p.categories);

    return `
    <div class="product-card" data-categories="${(p.categories||[]).join(',')}">
      <div class="product-img">
        <img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=img-placeholder>${p.emoji}</div>'" />
      </div>
      <div class="product-body">
        <div class="product-badge">${(p.categories||['wellness'])[0].charAt(0).toUpperCase()+(p.categories||['wellness'])[0].slice(1)}</div>
        <div class="product-name">${p.emoji} ${p.name}</div>
        <div class="product-reviews-inline" data-rv-aggregate data-rv-type="product" data-rv-id="${p.id}"></div>
        <div class="product-benefit">${p.benefit || ''}</div>
        <div class="product-who-for">${whoFor}</div>
        ${p.shortDesc ? `<div class="product-short-desc">${p.shortDesc}</div>` : ''}
        ${p.keyHerbs ? `<div class="product-herb-chips"><span class="herb-chips-label">✦ Key Botanicals</span><div class="herb-chips-row">${p.keyHerbs.map(h => {
          const slug = h.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
          const imgPath = (typeof getBotanicalIllustration === 'function' && getBotanicalIllustration(slug)) || '';
          return '<div class="herb-chip botanical-chip" data-herb-name="' + h + '" title="Click to view ' + h + ' botanical profile"><img src="' + imgPath + '" alt="' + h + '" onerror="this.style.display=\'none\'" loading="lazy"/><span>' + h + '</span><span class=\"bic-chip-hint\">tap for profile</span></div>';
        }).join('')}</div></div>` : ''}
        ${whyItWorks ? `<details class="product-why-works"><summary>Why This Works</summary><div class="why-works-content">${whyItWorks}</div></details>` : ''}
        ${p.sampleNote ? `<div class="product-sample-note">🎁 ${p.sampleNote}</div>` : ''}
        <select class="product-size-select" id="size-${p.id}">
          ${p.sizes.map(s => `<option value="${s.price}">${s.label}</option>`).join('')}
        </select>
        <button class="product-add-btn btn-primary" data-id="${p.id}">Order Now ❆</button>
        <div class="product-review-cta" style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
          <a href="#" class="product-review-link" data-rv-open data-rv-open-type="product" data-rv-id="${p.id}" data-rv-name="${(p.name || '').replace(/"/g, '&quot;')}" style="color:var(--brass-lt,#B8945A);font-family:'Lora',serif;font-size:0.82rem;text-decoration:none;border:1px solid rgba(184,148,90,0.35);padding:4px 10px;border-radius:999px;">✦ Write a Review</a>
        </div>
      </div>
    </div>
  `}).join('');
  grid.querySelectorAll('.product-add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = PRODUCTS.find(x => x.id === btn.dataset.id);
      const sel = document.getElementById(`size-${p.id}`);
      const price = parseFloat(sel.value);
      const label = sel.options[sel.selectedIndex].text;
      addToCart(`${p.name} (${label.split('—')[0].trim()})`, price, 1, { variantKey: p.id });
    });
  });
}

// Helper: short explanation per herb for "Why This Works"
function getHerbWhyInfo(herbName) {
  const herbInfo = {
    'Rose Hip': 'Rich in vitamin C, traditionally used for skin repair and antioxidant protection',
    'Frankincense': 'Traditionally used for reducing inflammation and supporting skin renewal',
    'Sea Buckthorn': 'Rich in omega fatty acids, supports skin hydration and elasticity',
    'Neroli': 'Traditionally used in aromatherapy for skin regeneration',
    'Arnica': 'Traditionally used topically for bruising and muscle soreness',
    'Cayenne': 'Contains capsaicin, traditionally used to improve circulation and relieve pain',
    'Wintergreen': 'Contains methyl salicylate, traditionally used for joint and muscle discomfort',
    'Comfrey': 'Traditionally used externally to support tissue repair',
    'Ashwagandha': 'An adaptogen traditionally used to support energy and reduce stress response',
    'Rhodiola': 'An adaptogen traditionally used for mental clarity and fatigue resistance',
    'Eleuthero': 'Traditionally used to support stamina and immune function',
    'Maca': 'Traditionally used to support energy, hormone balance, and vitality',
    'Elderberry': 'Rich in antioxidants, traditionally used for seasonal immune support',
    'Astragalus': 'Traditionally used in Chinese medicine to strengthen immune defenses',
    'Echinacea': 'Traditionally used to support immune response during seasonal challenges',
    'Reishi': 'An adaptogenic mushroom traditionally used for immune modulation',
    'Rosemary': 'Traditionally used to stimulate scalp circulation and support hair growth',
    'Peppermint': 'Contains menthol, traditionally used to soothe digestion and invigorate the scalp',
    'Castor Oil': 'Rich in ricinoleic acid, traditionally used to nourish hair follicles',
    'Saw Palmetto': 'Traditionally used to support hormonal balance related to hair health',
    'Mugwort': 'Traditionally used in dream work and to calm the nervous system before sleep',
    'Blue Lotus': 'Traditionally used for relaxation and lucid dream support',
    'Valerian': 'Traditionally used as a natural sedative to support deep sleep',
    'Valerian Root': 'Traditionally used as a natural sedative to support deep sleep',
    'Passionflower': 'Traditionally used to calm the nervous system and support restful sleep',
    'Lemon Balm': 'Traditionally used to reduce anxiety and promote calm',
    'Chamomile': 'Traditionally used to relax the mind and ease into sleep',
    'Omega-3 Fatty Acids': 'Supports brain, joint, and heart health',
    'Collagen Peptides': 'Supports skin elasticity, joint comfort, and tissue repair',
    'Essential Minerals': 'Support bone density, energy production, and cellular function',
    'Sardine Oil': 'A bioavailable source of omega-3s and vitamin D',
    'Shatavari': 'Traditionally used in Ayurveda to support female hormone balance',
    'Dong Quai': 'Traditionally used in Chinese medicine for menstrual and hormonal support',
    'Vitex': 'Traditionally used to support progesterone balance and ease PMS symptoms',
    'Black Cohosh': 'Traditionally used to support menopausal comfort and hormonal equilibrium',
    'Red Raspberry Leaf': 'Traditionally used to tone the uterus and support reproductive health',
    'Evening Primrose': 'Rich in GLA, traditionally used for hormonal and skin support',
    'Holy Basil': 'An adaptogen traditionally used to reduce cortisol and support calm',
    'Skullcap': 'Traditionally used to ease nervous tension and support relaxation',
    'Wild Lettuce': 'Traditionally used as a mild sedative for anxiety and restlessness',
    'Ginger': 'Traditionally used to support digestion and reduce nausea',
    'Fennel': 'Traditionally used to relieve bloating and support digestive comfort',
    'Slippery Elm': 'Traditionally used to soothe the digestive tract lining',
    "St. John's Wort": 'Traditionally used to support mood and emotional well-being',
    'Mucuna Pruriens': 'Contains L-DOPA, traditionally used to support dopamine levels',
    'Saffron': 'Traditionally used in Persian medicine for mood and emotional balance'
  };
  return herbInfo[herbName] || 'Carefully selected for this formula';
}

// Helper: who is this product for
function getWhoFor(categories) {
  if (!categories) return '';
  const catMap = {
    'sleep': 'For anyone struggling with sleep or restlessness',
    'energy': 'For those needing sustained, natural energy',
    'immune': 'For supporting your body\'s natural defenses',
    'beauty': 'For skin, hair, and visible radiance',
    'pain': 'For muscle, joint, or chronic discomfort',
    'hormonal': 'For hormone balance and endocrine support'
  };
  return catMap[categories[0]] || '';
}

// Shop category filter buttons
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.cat-filter-btn');
  if (!btn) return;
  document.querySelectorAll('.cat-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(btn.dataset.cat);
});

// Shop goal filter buttons
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.shop-goal-btn[data-goal]');
  if (!btn) return;
  const goal = btn.dataset.goal;
  // Map goal names to product categories
  const goalToCat = { sleep: 'sleep', stress: 'sleep', energy: 'energy', immune: 'immune', beauty: 'beauty', pain: 'pain', digestive: 'immune', hormonal: 'hormonal' };
  const cat = goalToCat[goal] || 'all';
  document.querySelectorAll('.shop-goal-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  // Also sync the category filter
  document.querySelectorAll('.cat-filter-btn').forEach(b => b.classList.remove('active'));
  const matchingCatBtn = document.querySelector('.cat-filter-btn[data-cat="' + cat + '"]');
  if (matchingCatBtn) matchingCatBtn.classList.add('active');
  renderProducts(cat);
});

// ---- RENDER SOAPS ----
// Soap cards are static HTML in index.html; descriptions, scent notes, and
// botanical notes are hydrated from the central SOAPS data source so the
// data.js entries remain the single source of truth. HTML falls back to any
// existing copy if a matching soap isn't found in the data.
function renderSoaps() {
  if (typeof SOAPS === 'undefined' || !Array.isArray(SOAPS)) return;
  var cards = document.querySelectorAll('#soaps .soap-card');
  cards.forEach(function(card) {
    var nameEl = card.querySelector('.soap-name');
    var descEl = card.querySelector('.soap-desc');
    if (!nameEl || !descEl) return;
    var name = (nameEl.textContent || '').trim();
    var soap = SOAPS.find(function(s) { return s.name === name; });
    if (!soap) return;
    var sourceDesc = soap.description || soap.desc || '';
    if (sourceDesc) {
      descEl.textContent = sourceDesc;
    }
  });
}

// ---- RENDER SERVICES ----
function renderServices() {
  const grid = document.getElementById('servicesGrid');
  grid.innerHTML = SERVICES.map(s => `
    <div class="product-card service-card">
      <div class="product-img">
        <img src="${s.img}" alt="${s.name}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=img-placeholder>${s.emoji}</div>'" />
      </div>
      <div class="product-body">
        <div class="product-name">${s.emoji} ${s.name}</div>
        <div class="product-desc">${s.desc}</div>
        <div class="product-price">${formatPrice(s.price)} · ${s.duration}</div>
        <button class="product-add-btn btn-primary" data-id="${s.id}" data-price="${s.price}" data-name="${s.name}">Book This Service ✦</button>
      </div>
    </div>
  `).join('');
  grid.querySelectorAll('.product-add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      addToCart(btn.dataset.name, parseFloat(btn.dataset.price));
    });
  });
}

// ---- HERB INDEX ----
function renderHerbGrid(herbs) {
  const grid = document.getElementById('herbGrid');
  if (!herbs || herbs.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px;grid-column:1/-1">No botanicals found. Try a different search.</p>';
    return;
  }
  grid.innerHTML = herbs.map(h => {
    const isSelected = selectedHerbs.find(s => s.id === h.id);
    // Use illustration from data.js enrichment, then BOTANICAL_IMAGES map, then category fallback
    const illus = h.illustration || (typeof getBotanicalIllustration === 'function' && getBotanicalIllustration(h.id)) || BOTANICAL_IMAGES[h.name] || '';
    const benefitsHtml = (h.benefits && h.benefits.length > 0)
      ? `<ul class="herb-benefits-list">${h.benefits.map(b => `<li>${b}</li>`).join('')}</ul>`
      : '';
    return `
      <div class="herb-card ${isSelected ? 'selected' : ''}" data-id="${h.id}">
        <div class="herb-card-img herb-botanical-img">
          <img src="${illus}" alt="Botanical illustration of ${h.name}" loading="lazy" onerror="this.outerHTML='<div class=img-placeholder>${h.emoji}</div>'" />
        </div>
        <div class="herb-card-body">
          <div class="herb-name">${h.emoji} ${h.name}</div>
          <div class="herb-latin">${h.latin}</div>
          <div class="herb-desc">${h.desc}</div>
          ${benefitsHtml}
          <button class="add-to-custom-btn" data-herb-id="${h.id}" title="Add ${h.name} to your custom creation">+ Add to My Custom Creation</button>
          <div class="herb-uses">
            ${h.uses.map(u => `<span class="herb-use-tag">${u}</span>`).join('')}
          </div>
          <button class="herb-select-btn ${isSelected ? 'selected' : ''}" data-id="${h.id}">
            ${isSelected ? '✓ Selected' : '+ Select'}
          </button>
        </div>
      </div>
    `;
  }).join('');
  grid.querySelectorAll('.herb-select-btn').forEach(btn => {
    btn.addEventListener('click', () => toggleHerbSelection(btn.dataset.id));
  });
  grid.querySelectorAll('.add-to-custom-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof window.addToCustomCreation === 'function') {
        window.addToCustomCreation(btn.dataset.herbId);
      }
    });
  });
}

function toggleHerbSelection(id) {
  const herb = BOTANICALS.find(h => h.id === id);
  if (!herb) return;
  const idx = selectedHerbs.findIndex(h => h.id === id);
  if (idx >= 0) {
    selectedHerbs.splice(idx, 1);
  } else {
    if (selectedHerbs.length >= 8) { showToast('Maximum 8 botanicals per blend.'); return; }
    selectedHerbs.push(herb);
  }
  updateHerbSelectionBar();
  filterHerbs();
}

function updateHerbSelectionBar() {
  document.getElementById('selectedCount').textContent = selectedHerbs.length;
  const tags = document.getElementById('selectedHerbTags');
  tags.innerHTML = selectedHerbs.map(h => `
    <span class="herb-tag">${h.emoji} ${h.name} <button data-id="${h.id}">✕</button></span>
  `).join('');
  tags.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => toggleHerbSelection(btn.dataset.id));
  });
  const addBtn = document.getElementById('herbAddToCart');
  addBtn.style.display = selectedHerbs.length > 0 ? 'inline-block' : 'none';
}

function filterHerbs() {
  if (typeof BOTANICALS === 'undefined' || !BOTANICALS || BOTANICALS.length === 0) {
    document.getElementById('herbGrid').innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px;grid-column:1/-1">Loading botanical library...</p>';
    return;
  }
  const search = document.getElementById('herbSearch').value.toLowerCase();
  const cat = document.getElementById('herbCategory').value;
  const use = document.getElementById('herbUse').value;
  const filtered = BOTANICALS.filter(h => {
    const matchSearch = !search || h.name.toLowerCase().includes(search) || h.latin.toLowerCase().includes(search) || h.desc.toLowerCase().includes(search);
    const matchCat = cat === 'all' || (h.categories && h.categories.includes(cat));
    const matchUse = use === 'all' || (h.uses && h.uses.includes(use));
    return matchSearch && matchCat && matchUse;
  });
  renderHerbGrid(filtered);
}

document.getElementById('herbSearch').addEventListener('input', filterHerbs);
document.getElementById('herbCategory').addEventListener('change', filterHerbs);
document.getElementById('herbUse').addEventListener('change', filterHerbs);

document.getElementById('herbAddToCart').addEventListener('click', () => {
  if (selectedHerbs.length === 0) return;
  const names = selectedHerbs.map(h => h.name).join(', ');
  const useEl = document.getElementById('herbUse');
  const useType = useEl.value === 'all' ? 'Custom Blend' : useEl.options[useEl.selectedIndex].text;
  const prices = { tea: 22, capsule: 32, balm: 26, serum: 28, all: 25 };
  const price = prices[useEl.value] || 25;
  addToCart(`Custom ${useType}: ${names.substring(0, 60)}${names.length > 60 ? '...' : ''}`, price);
  selectedHerbs = [];
  updateHerbSelectionBar();
  filterHerbs();
});

// ---- TEA SHOP ----
// The Tea Shop was merged into the Custom Creations section (custom-formula).
// These functions are kept as safe stubs to prevent any legacy reference errors.
function renderTeaHerbs() {}
function filterTeaHerbs() {}
function toggleTeaHerb() {}
function updateTeaSelected() {}

// ---- CUSTOM FORMULA FORM ----
// Handled by custom-creations.js bindFormulaForm() — no duplicate listener needed here.

// ---- SOAP FORM ----
// Handled by the DOMContentLoaded listener below — no duplicate needed here.

// ---- CONTACT FORM (EmailJS → awaken@consultant.com) ----
function showInlineFormStatus(form, msg, kind) {
  if (!form) return;
  let el = form.querySelector('.inline-form-status');
  if (!el) {
    el = document.createElement('p');
    el.className = 'inline-form-status';
    el.style.cssText = 'margin-top:0.75rem;padding:0.65rem 0.85rem;border-radius:8px;font-family:Lora,serif;font-size:0.9rem;line-height:1.5;';
    form.appendChild(el);
  }
  el.textContent = msg;
  el.style.background = kind === 'error' ? 'rgba(180,60,60,0.15)' : 'rgba(184,148,90,0.15)';
  el.style.color = kind === 'error' ? '#ffb3b3' : '#F3EBDD';
  el.style.border = kind === 'error' ? '1px solid rgba(180,60,60,0.5)' : '1px solid rgba(184,148,90,0.45)';
}

// ---- CONTACT FORM (Netlify Forms + SendGrid confirmation) ----
(function bindContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const btn = document.getElementById('contactSubmitBtn');
  const card = form;

  function setState(state) {
    if (state === 'loading') {
      btn.disabled = true;
      btn.dataset.originalLabel = btn.dataset.originalLabel || btn.textContent;
      btn.textContent = 'Sending your message...';
      showInlineFormStatus(card, 'Sending your message...', 'ok');
    } else if (state === 'success') {
      btn.disabled = false;
      btn.textContent = btn.dataset.originalLabel || 'Send Message ✦';
      showInlineFormStatus(card, '✦ Your message has been received. Amber will be in touch within 1–2 business days.', 'ok');
    } else if (state === 'error') {
      btn.disabled = false;
      btn.textContent = btn.dataset.originalLabel || 'Send Message ✦';
      showInlineFormStatus(card, 'Something went wrong. Please try again or email awaken@consultant.com directly.', 'error');
    }
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = (document.getElementById('contactName').value || '').trim();
    const email = (document.getElementById('contactEmail').value || '').trim();
    const subject = document.getElementById('contactSubject').value;
    const message = (document.getElementById('contactMessage').value || '').trim();

    showInlineFormStatus(card, '', 'ok');
    if (!name || !email || !message) { showInlineFormStatus(card, 'Please fill in your name, email, and message.', 'error'); return; }
    if (!isValidEmail(email)) { showInlineFormStatus(card, 'Please enter a valid email address.', 'error'); return; }

    setState('loading');
    try {
      const formData = new FormData(form);
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString(),
      });
      if (response.ok) {
        setState('success');
        try { window.AAA && window.AAA.contactFormSubmit && window.AAA.contactFormSubmit(subject); } catch (e) {}
        // Trigger confirmation email via SendGrid
        try {
          await fetch('/.netlify/functions/send-contact-confirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, email: email, message: message })
          });
        } catch (e) { console.warn('[Contact] confirmation email failed', e); }
        document.getElementById('contactName').value = '';
        document.getElementById('contactEmail').value = '';
        document.getElementById('contactMessage').value = '';
      } else {
        setState('error');
      }
    } catch (err) {
      console.error('[Contact] submission failed', err);
      setState('error');
    }
  });
})();

// ---- NEWSLETTER FORM (Netlify Forms + SendGrid welcome) ----
(function bindNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;
  const btn = document.getElementById('nlSubmitBtn');

  function setState(state) {
    if (state === 'loading') {
      btn.disabled = true;
      btn.dataset.originalLabel = btn.dataset.originalLabel || btn.textContent;
      btn.textContent = 'Signing you up...';
      showToast('Signing you up...');
    } else if (state === 'success') {
      btn.disabled = false;
      btn.textContent = btn.dataset.originalLabel || 'Send Me the Guide ✦';
      showToast('✦ Welcome to the apothecary. Check your inbox for a note from us.');
    } else if (state === 'error') {
      btn.disabled = false;
      btn.textContent = btn.dataset.originalLabel || 'Send Me the Guide ✦';
      showToast('Something went wrong. Please try again.');
    }
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const firstName = (document.getElementById('nlName').value || '').trim();
    const email = (document.getElementById('nlEmail').value || '').trim();
    if (!email) { showToast('Please enter your email address.'); return; }
    if (!isValidEmail(email)) { showToast('Please enter a valid email address.'); return; }

    setState('loading');
    try {
      const formData = new FormData(form);
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString(),
      });
      if (response.ok) {
        setState('success');
        try { window.AAA && window.AAA.newsletterSignup && window.AAA.newsletterSignup('homepage'); } catch (e) {}
        try {
          await fetch('/.netlify/functions/send-newsletter-welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName: firstName, email: email })
          });
        } catch (e) { console.warn('[Newsletter] welcome email failed', e); }
        document.getElementById('nlName').value = '';
        document.getElementById('nlEmail').value = '';
      } else {
        setState('error');
      }
    } catch (err) {
      console.error('[Newsletter] submission failed', err);
      setState('error');
    }
  });
})();

// ---- FAQS ----
function renderFAQs() {
  const list = document.getElementById('faqList');
  list.innerHTML = FAQS.map((f) => `
    <details class="faq-item">
      <summary class="faq-question">
        ${f.q}
        <span class="faq-icon" aria-hidden="true"></span>
      </summary>
      <div class="faq-answer">${f.a}</div>
    </details>
  `).join('');

  // Add FAQ structured data for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  };
  let schemaEl = document.getElementById('faq-schema');
  if (!schemaEl) {
    schemaEl = document.createElement('script');
    schemaEl.id = 'faq-schema';
    schemaEl.type = 'application/ld+json';
    document.head.appendChild(schemaEl);
  }
  schemaEl.textContent = JSON.stringify(faqSchema);
}

// ---- VICTORIAN BOTANICAL IMAGE MAP ----
const BOTANICAL_IMAGES = {
  'Lavender': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663508836609/VDHw29YgzjByjwgsGHGQ8W/herb-lavender_c61be9fc.jpg',
  'Rosemary': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663508836609/VDHw29YgzjByjwgsGHGQ8W/herb-rosemary_6db41b95.jpg',
  'Comfrey': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663508836609/VDHw29YgzjByjwgsGHGQ8W/herb-chamomile_24f1bf7f.jpg',
  'Mugwort': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663508836609/VDHw29YgzjByjwgsGHGQ8W/herb-mugwort_92a64ac0.jpg',
  'Ginger Root': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663508836609/VDHw29YgzjByjwgsGHGQ8W/herb-ginger_0caa06cd.jpg',
  'Hibiscus': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663508836609/VDHw29YgzjByjwgsGHGQ8W/herb-hibiscus_6042e55f.jpg',
  'Turmeric': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663508836609/VDHw29YgzjByjwgsGHGQ8W/herb-turmeric_a524e6e8.jpg',
  'Chamomile': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663508836609/VDHw29YgzjByjwgsGHGQ8W/herb-chamomile_24f1bf7f.jpg',
  'Valerian Root': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663508836609/VDHw29YgzjByjwgsGHGQ8W/herb-valerian_1bfa4a56.jpg',
  'Lemon Balm': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663508836609/VDHw29YgzjByjwgsGHGQ8W/herb-lemon-balm_e2d00434.jpg',
  'Dandelion Root': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663508836609/VDHw29YgzjByjwgsGHGQ8W/herb-dandelion_96452957.jpg',
  'Nettle': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663508836609/VDHw29YgzjByjwgsGHGQ8W/herb-nettle_2cc86ea1.jpg',
  'Milk Thistle': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663508836609/VDHw29YgzjByjwgsGHGQ8W/herb-milk-thistle_d5a8fd91.jpg',
  'Fennel Seed': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663508836609/VDHw29YgzjByjwgsGHGQ8W/herb-fennel_9a27764f.jpg',
  'Oregano': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663508836609/VDHw29YgzjByjwgsGHGQ8W/herb-oregano_240ac641.jpg',
  'Red Clover': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663508836609/VDHw29YgzjByjwgsGHGQ8W/herb-chamomile_24f1bf7f.jpg',
  'Vervain': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663508836609/VDHw29YgzjByjwgsGHGQ8W/herb-chamomile_24f1bf7f.jpg',
  'Hyssop': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663508836609/VDHw29YgzjByjwgsGHGQ8W/herb-chamomile_24f1bf7f.jpg',
  'Agrimony': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663508836609/VDHw29YgzjByjwgsGHGQ8W/herb-chamomile_24f1bf7f.jpg',
};

// ---- EXPOSE addItemToCart for custom-creations.js ----
window.addItemToCart = function(item) {
  const existing = cart.find(i => i.name === item.name);
  if (existing) { existing.qty += (item.qty || 1); }
  else { cart.push({ name: item.name, price: item.price, qty: item.qty || 1, herbs: item.herbs || '', size: item.size || '', symptoms: item.symptoms || '', recommendedHerbs: item.recommendedHerbs || '', form: item.form || '' }); }
  renderCart();
  showToast('\u2726 Added to cart: ' + item.name);
  openCart();
};

// Dispatch sectionChanged event when navigating
const _origShowSection = showSection;
window.showSection = function(id) {
  _origShowSection(id);
  document.dispatchEvent(new CustomEvent('sectionChanged', { detail: { section: id } }));
};

// ---- HERBAL LIBRARY ----
(function() {
  const HL_PAGE_SIZE = 24;
  let hlCurrentCat = 'all';
  let hlSearchTerm = '';
  let hlDisplayed = 0;

  function getHerbSource() {
    if (typeof BOTANICALS_FULL !== 'undefined') return BOTANICALS_FULL;
    if (typeof BOTANICALS !== 'undefined') return BOTANICALS;
    return [];
  }

  function dedupHerbs(herbs) {
    const seen = new Set();
    return herbs.filter(h => {
      if (seen.has(h.id)) return false;
      seen.add(h.id);
      return true;
    });
  }

  function filterHerbalLibrary() {
    let herbs = dedupHerbs(getHerbSource());
    if (hlCurrentCat !== 'all') {
      herbs = herbs.filter(h => h.categories && h.categories.includes(hlCurrentCat));
    }
    if (hlSearchTerm) {
      const q = hlSearchTerm.toLowerCase();
      herbs = herbs.filter(h =>
        h.name.toLowerCase().includes(q) ||
        (h.latin && h.latin.toLowerCase().includes(q)) ||
        (h.desc && h.desc.toLowerCase().includes(q)) ||
        (h.benefits && h.benefits.some(b => b.toLowerCase().includes(q))) ||
        (h.categories && h.categories.some(c => c.toLowerCase().includes(q)))
      );
    }
    return herbs;
  }

  function renderHerbalLibrary(append) {
    const grid = document.getElementById('herbalLibraryGrid');
    const loadMore = document.getElementById('herbalLibraryLoadMore');
    if (!grid) return;

    const herbs = filterHerbalLibrary();
    if (!append) {
      hlDisplayed = 0;
      grid.innerHTML = '';
    }

    const catMap = {
      sleep: 'Sleep', energy: 'Energy', immune: 'Immune',
      beauty: 'Beauty', digestive: 'Digestive', pain: 'Pain',
      hormonal: 'Hormonal', spiritual: 'Spiritual', mushroom: 'Mushroom',
      adaptogen: 'Adaptogen'
    };

    const slice = herbs.slice(hlDisplayed, hlDisplayed + HL_PAGE_SIZE);
    slice.forEach(h => {
      const card = document.createElement('div');
      card.className = 'hl-herb-card';
      card.dataset.herbId = h.id;
      const illus = h.illustration || (typeof getBotanicalIllustration === 'function' && getBotanicalIllustration(h.id)) || BOTANICAL_IMAGES[h.name] || '';
      card.innerHTML = `
        <div class="hl-herb-img-wrap">
          ${illus ? `<img src="${illus}" alt="${h.name}" class="hl-herb-img" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="hl-herb-emoji hl-herb-fallback" style="display:none">${h.emoji || '🌿'}</span>` : `<span class="hl-herb-emoji">${h.emoji || '🌿'}</span>`}
        </div>
        <div class="hl-herb-name">${h.name}</div>
        <div class="hl-herb-latin">${h.latin || ''}</div>
        <div class="hl-herb-cats">${(h.categories || []).slice(0, 3).map(c =>
          '<span class="hl-herb-cat-tag">' + (catMap[c] || c) + '</span>'
        ).join('')}</div>
      `;
      card.addEventListener('click', () => {
        if (typeof openHerbModal === 'function') {
          openHerbModal(h.id);
        }
      });
      grid.appendChild(card);
    });

    hlDisplayed += slice.length;

    if (herbs.length === 0) {
      grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px;grid-column:1/-1">No herbs found matching your search.</p>';
    }

    if (loadMore) {
      loadMore.style.display = hlDisplayed < herbs.length ? 'block' : 'none';
    }
  }

  // Bind events after DOM load
  function initHerbalLibrary() {
    const searchInput = document.getElementById('herbalLibrarySearch');
    const catsWrap = document.getElementById('herbalLibraryCats');
    const loadMoreBtn = document.getElementById('hlLoadMoreBtn');

    if (searchInput) {
      let debounce;
      searchInput.addEventListener('input', function() {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
          hlSearchTerm = this.value.trim();
          renderHerbalLibrary(false);
        }, 250);
      });
    }

    if (catsWrap) {
      catsWrap.addEventListener('click', function(e) {
        const btn = e.target.closest('.hl-cat-btn');
        if (!btn) return;
        catsWrap.querySelectorAll('.hl-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        hlCurrentCat = btn.dataset.hlcat;
        renderHerbalLibrary(false);
      });
    }

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => renderHerbalLibrary(true));
    }

    // Render on section change
    document.addEventListener('sectionChanged', function(e) {
      if (e.detail && e.detail.section === 'herbal-library') {
        renderHerbalLibrary(false);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHerbalLibrary);
  } else {
    initHerbalLibrary();
  }
})();

// ---- RENDER BEST SELLERS ----
function renderBestSellers() {
  const grid = document.getElementById('bestSellersGrid');
  if (!grid) return;
  // Feature specific best-selling products: new signature products + favorites
  const featuredIds = ['vital-connect', 'sacred-balance', 'chill-pill', 'vital-flow', 'happy-pill', 'alchemy-tea'];
  const featured = featuredIds.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
  grid.innerHTML = featured.map(p => {
    const herbChips = (p.keyHerbs || []).map(h => {
      const slug = h.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      const imgPath = (typeof getBotanicalIllustration === 'function' && getBotanicalIllustration(slug)) || '';
      return '<div class="herb-chip botanical-chip" data-herb-name="' + h + '" title="Click to view ' + h + ' botanical profile"><img src="' + imgPath + '" alt="' + h + '" onerror="this.style.display=\'none\'" loading="lazy"/><span>' + h + '</span><span class=\"bic-chip-hint\">tap for profile</span></div>';
    }).join('');
    return `
      <div class="product-card best-seller-card" data-categories="${(p.categories||[]).join(',')}">
        <div class="best-seller-badge-wrap"><span class="best-seller-badge">✦ Best Seller</span></div>
        <div class="product-img">
          <img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=img-placeholder>${p.emoji}</div>'" />
        </div>
        <div class="product-body">
          <div class="product-badge">${(p.categories||['wellness'])[0].charAt(0).toUpperCase()+(p.categories||['wellness'])[0].slice(1)}</div>
          <div class="product-name">${p.emoji} ${p.name}</div>
          <div class="product-benefit">${p.benefit || ''}</div>
          <div class="product-desc">${p.desc}</div>
          <div class="product-herb-chips"><span class="herb-chips-label">✦ Key Botanicals</span><div class="herb-chips-row">${herbChips}</div></div>
          <select class="product-size-select" id="bs-size-${p.id}">
            ${p.sizes.map(s => `<option value="${s.price}">${s.label}</option>`).join('')}
          </select>
          <button class="product-add-btn btn-primary" data-id="${p.id}" data-source="bs">Order Now ❆</button>
        </div>
      </div>
    `;
  }).join('');
  grid.querySelectorAll('.product-add-btn[data-source="bs"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = PRODUCTS.find(x => x.id === btn.dataset.id);
      const sel = document.getElementById('bs-size-' + p.id);
      const price = parseFloat(sel.value);
      const label = sel.options[sel.selectedIndex].text;
      addToCart(p.name + ' (' + label.split('—')[0].trim() + ')', price);
    });
  });

  // Featured Soaps in Best Sellers — pull descriptions from central SOAPS data,
  // with graceful fallbacks if a soap isn't yet in the data source.
  const soapsGrid = document.getElementById('bestSellersSoapsGrid');
  if (!soapsGrid) return;
  const featuredSoapSpecs = [
    { name: "Gaia's Rose", displayName: "Gaia's Rose Garden", img: 'images/soap-rose-clay.png', emoji: '🌹', price: 12.99, fallbackDesc: 'A romantic bar inspired by nature\'s sacred bloom. Rose petals soften skin while creamy shea butter and goat milk restore moisture and leave skin glowing.' },
    { name: "Lavender Fairy Dream", img: 'images/soap-lavender-honey.png', emoji: '💜', price: 12.99, fallbackDesc: 'A gentle floral escape inspired by twilight gardens. Calming lavender soothes the mind while goat milk and shea butter soften and hydrate the skin.' },
    { name: "Eucalyptus Mint Spa Renewal", displayName: "Eucalyptus Mint Renewal", img: 'images/soap-charcoal-mint.png', emoji: '🌿', price: 12.99, fallbackDesc: 'A bright, invigorating blend that awakens the senses. Cooling eucalyptus and mint refresh tired skin while goat milk and shea butter deeply moisturize.' },
    { name: "Orange Lily Goddess", img: 'images/soap-calendula-oat.png', emoji: '🌺', price: 12.99, fallbackDesc: 'A radiant citrus floral blend inspired by sunlight. Sweet orange uplifts the mood while botanical oils brighten and soften the skin for a fresh glow.' },
    { name: "Warm Cinnamon Comfort", img: 'images/soap-frankincense-myrrh.png', emoji: '🔥', price: 12.99, fallbackDesc: 'A cozy, grounding soap infused with the warmth of cinnamon and spice. Cinnamon encourages circulation while shea butter and goat milk nourish deeply.' }
  ];
  const soapNames = featuredSoapSpecs.map(spec => {
    const soap = (typeof SOAPS !== 'undefined' && Array.isArray(SOAPS))
      ? SOAPS.find(s => s.name === spec.name) : null;
    return {
      name: spec.displayName || spec.name,
      cartName: spec.displayName || spec.name,
      img: spec.img,
      emoji: spec.emoji,
      price: spec.price,
      desc: (soap && (soap.desc || soap.description)) || spec.fallbackDesc
    };
  });
  soapsGrid.innerHTML = '<h3 style="grid-column:1/-1;text-align:center;color:var(--gold,#d4a843);margin-bottom:0.5rem;">✦ Featured Artisan Soaps ✦</h3>' +
    '<p style="grid-column:1/-1;text-align:center;margin-bottom:1rem;opacity:0.85;">All 5 Bars for <strong>$49.99</strong> &nbsp;|&nbsp; 5 Custom Soaps for <strong>$54.99</strong></p>' +
    soapNames.map(s => `
    <div class="product-card best-seller-card" style="text-align:center;">
      <div class="best-seller-badge-wrap"><span class="best-seller-badge">✦ Best Seller</span></div>
      <div class="product-img">
        <img src="${s.img}" alt="${s.name}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=img-placeholder>${s.emoji}</div>'" />
      </div>
      <div class="product-body">
        <div class="product-badge">Artisan Soap</div>
        <div class="product-name">${s.emoji} ${s.name}</div>
        <p class="soap-desc bs-soap-desc" style="font-family:'Lora',serif;font-size:0.88rem;opacity:0.9;margin:0.4rem 0 0.6rem;line-height:1.5;text-align:left;">${s.desc}</p>
        <div class="product-benefit">$${s.price.toFixed(2)} &nbsp;|&nbsp; 4 oz bar</div>
        <button class="product-add-btn btn-primary" onclick="addSoapToCart('${s.cartName.replace(/'/g, "\\'")}', ${s.price}, this)">Add to Cart ✦</button>
      </div>
    </div>
  `).join('') +
  `<div style="grid-column:1/-1;text-align:center;margin-top:1rem;">
    <button class="btn-primary" onclick="addSoapToCart('Full Soap Collection (All 5 Bars)', 49.99, this)" style="margin:0.3rem;">Get All 5 Bars — $49.99 ✦</button>
    <button class="btn-secondary" onclick="addSoapToCart('5 Custom Soaps Collection', 54.99, this)" style="margin:0.3rem;">5 Custom Soaps — $54.99 ✦</button>
  </div>`;
}

// ---- INIT ----
function init() {
  renderProducts();
  renderBestSellers();
  renderSoaps();
  renderServices();
  filterHerbs();
  filterTeaHerbs();
  renderFAQs();
  calcCartTotals();
}

// Ensure data.js is fully loaded before init
if (typeof BOTANICALS !== 'undefined') {
  init();
} else {
  window.addEventListener('load', init);
}

// ============================================================
// SOAP CART INTEGRATION
// ============================================================
function addSoapToCart(name, price, btnEl) {
  // Map the friendly soap name to the SHOPIFY_VARIANTS key used in index.html
  const SOAP_KEYS = {
    'Lavender Fairy Dream': 'soap-lavender-fairy-dream',
    "Gaia's Rose": 'soap-gaias-rose',
    'Eucalyptus Mint Spa Renewal': 'soap-eucalyptus-mint',
    'Warm Cinnamon Comfort': 'soap-warm-cinnamon',
    'Orange Lily Goddess': 'soap-orange-lily',
    'Citrus Goddess Glow': 'soap-citrus-goddess',
    'Sacred Forest Ritual': 'soap-sacred-forest',
    'Fresh Mountain Air': 'soap-fresh-mountain-air',
    'Sunlit Garden Bloom': 'soap-sunlit-garden-bloom'
  };
  const variantKey = SOAP_KEYS[name] || ShopifyCart.guessKey(name);
  addToCart(name, price, 1, { variantKey: variantKey });
  if (btnEl) {
    const orig = btnEl.textContent;
    btnEl.textContent = '✓ Added!';
    btnEl.style.background = 'linear-gradient(135deg, #4a7c59, #2d5a3d)';
    setTimeout(() => {
      btnEl.textContent = orig;
      btnEl.style.background = '';
    }, 2000);
  }
}
window.addSoapToCart = addSoapToCart;

// ---- SOAP CUSTOM ORDER FORM ----
// Legacy dropdown soap-form was removed in FIX 7. Stub kept so any older
// inline references don't throw during boot.
(function() {
  function bindSoapForm() { /* no-op — feature removed */ }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindSoapForm);
  } else {
    bindSoapForm();
  }
})();

// ---- ANCHOR ALIASES + SCROLL HELPER (FIX 4) ----
// Maps the spec-required IDs onto the actual section IDs used in the markup.
const SECTION_ALIASES = {
  'grimoire': 'herb-index',
  'articles': 'herbal-wisdom',
  'herb-encyclopedia': 'herbal-library',
  'create-remedy': 'custom-formula',
  'consultation-form': 'contact'
};

function scrollToAnchor(id) {
  if (!id) return;
  // First try actual id on the page
  let el = document.getElementById(id);
  let resolvedId = id;
  if (!el && SECTION_ALIASES[id]) {
    resolvedId = SECTION_ALIASES[id];
    el = document.getElementById(resolvedId);
  }
  if (!el) return;
  // If the target is a separate page-section, activate it first
  if (el.classList && el.classList.contains('page-section')) {
    showSection(resolvedId);
    return;
  }
  // Otherwise, find the page-section ancestor and activate it, then scroll
  const parentSection = el.closest && el.closest('.page-section');
  if (parentSection && !parentSection.classList.contains('active')) {
    showSection(parentSection.id);
  }
  setTimeout(() => {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.classList && el.classList.add('product-highlight');
    setTimeout(() => { el.classList && el.classList.remove('product-highlight'); }, 1800);
  }, 100);
}
window.scrollToAnchor = scrollToAnchor;

// ---- BUNDLE ADD-TO-CART (FIX 4) ----
function addBundleToCart(name, price, variantKey) {
  const cleanName = (name || '').replace(/&amp;/g, '&');
  addToCart(cleanName, price, 1, { variantKey: variantKey || ShopifyCart.guessKey(cleanName) });
}
window.addBundleToCart = addBundleToCart;

// ---- "MEET AMBER" toggle for trimmed about section ----
document.addEventListener('click', function(e) {
  if (e.target && e.target.id === 'meetAmberBtn') {
    const bio = document.getElementById('aboutFullBio');
    if (bio) {
      const isHidden = bio.style.display === 'none';
      bio.style.display = isHidden ? 'block' : 'none';
      e.target.textContent = isHidden ? 'Hide Full Bio' : 'Meet Amber →';
    }
  }
});

// ---- ID ALIAS ANCHORS — invisible duplicates so spec'd IDs always resolve ----
(function ensureAliasAnchors() {
  function add(aliasId, targetId) {
    if (document.getElementById(aliasId)) return;
    const target = document.getElementById(targetId);
    if (!target) return;
    const anchor = document.createElement('span');
    anchor.id = aliasId;
    anchor.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;';
    target.parentNode.insertBefore(anchor, target);
  }
  function run() {
    Object.keys(SECTION_ALIASES).forEach(function(aliasId) {
      add(aliasId, SECTION_ALIASES[aliasId]);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else { run(); }
})();

// ---- GOOGLE REVIEW LINK FALLBACK (FIX 4) ----
// Until Amber pastes her Google Place ID into the meta tag, fall back to a
// search-for-business URL. Once set, every "Leave a Review on Google" link
// across the site picks up the canonical write-review URL automatically.
(function setReviewLinks() {
  function apply() {
    const meta = document.querySelector('meta[name="google-place-id"]');
    const placeId = meta && meta.content ? meta.content.trim() : '';
    const url = placeId
      ? 'https://search.google.com/local/writereview?placeid=' + encodeURIComponent(placeId)
      : 'https://www.google.com/search?q=Amber%27s+Alchemy+Apothecary+Awaken+Again#lrd=,1';
    document.querySelectorAll('[data-rv-google], a[data-rv-google]').forEach(function(a) {
      if (a.tagName === 'A') {
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener';
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else { apply(); }
})();

// Tag the contact form card with id="consultation-form" so the spec'd
// "Book a Free Consultation" CTA scrolls to a meaningful target.
(function tagConsultationForm() {
  function run() {
    const card = document.querySelector('#contact .contact-form');
    if (card && !card.id) card.id = 'consultation-form';
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else { run(); }
})();

// Make "Book a Free Consultation" / "Contact Amber" / "Get a Custom Formula"
// hash links resolve via scrollToAnchor.
document.addEventListener('click', function(e) {
  const a = e.target.closest && e.target.closest('a[href^="#"]');
  if (!a) return;
  const href = a.getAttribute('href') || '';
  if (href.length < 2) return;
  const id = href.slice(1);
  // skip if it's already wired to data-section / data-rv-* etc.
  if (a.hasAttribute('data-section') || a.hasAttribute('data-rv-open') || a.hasAttribute('data-rv-google') || a.hasAttribute('data-rv-open-all')) return;
  // only intercept if a matching id or alias exists
  if (document.getElementById(id) || SECTION_ALIASES[id]) {
    e.preventDefault();
    scrollToAnchor(id);
  }
});

// ---- GRIMOIRE SUBSCRIBER GATE (Netlify Forms + SendGrid request notification) ----
(function bindGrimoireGate() {
  const form = document.getElementById('grimoireGateForm');
  if (!form) return;
  const input = document.getElementById('grimoireGateEmail');
  const statusEl = document.getElementById('grimoireGateStatus');
  const btn = document.getElementById('grimoireGateBtn');

  function setStatus(msg, color) { if (statusEl) { statusEl.textContent = msg; statusEl.style.color = color || ''; } }

  function setState(state) {
    if (state === 'loading') {
      if (btn) { btn.disabled = true; btn.dataset.originalLabel = btn.dataset.originalLabel || btn.textContent; btn.textContent = 'Checking your access...'; }
      setStatus('Checking your access...', '');
    } else if (state === 'success') {
      if (btn) { btn.disabled = false; btn.textContent = btn.dataset.originalLabel || 'Unlock Access'; }
      setStatus('✦ Your access request has been sent. Expect a response within 24 hours.', '#aef0c4');
    } else if (state === 'error') {
      if (btn) { btn.disabled = false; btn.textContent = btn.dataset.originalLabel || 'Unlock Access'; }
      setStatus('Something went wrong. Please try again or email awaken@consultant.com.', '#ffb29b');
    }
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = (input && input.value || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('Please enter a valid email address.', '#ffb29b');
      return;
    }
    setState('loading');
    try {
      const formData = new FormData(form);
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString(),
      });
      if (response.ok) {
        setState('success');
        try {
          await fetch('/.netlify/functions/send-grimoire-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
          });
        } catch (e) { console.warn('[Grimoire] request notification failed', e); }
        if (input) input.value = '';
      } else {
        setState('error');
      }
    } catch (err) {
      console.error('[Grimoire] submission failed', err);
      setState('error');
    }
  });
})();
window.grimoireGateSubmit = function() {
  // Legacy entry point — submit the form so all logic flows through one path.
  var form = document.getElementById('grimoireGateForm');
  if (form && typeof form.requestSubmit === 'function') form.requestSubmit();
  else if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
};

