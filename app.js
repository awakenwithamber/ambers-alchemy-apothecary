// ============================================================
// AMBER'S ALCHEMY APOTHECARY — MAIN APP v6
// Navigation, Cart, Herb Index, Tea Builder, Forms, Email
// ============================================================

// ---- STATE ----
// Canonical cart (see CART section); restored from localStorage.
let cart = (function() {
  try {
    const saved = JSON.parse(localStorage.getItem('aa_cart_main') || '[]');
    return Array.isArray(saved) ? saved.filter(i => i && i.name && i.qty > 0) : [];
  } catch (e) { return []; }
})();
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
function escapeHtml(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

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

// ---- MUSIC (modal welcome + persistent toggle) ----

const bgMusic = document.getElementById('bgMusic');
const musicToggleBtn = document.getElementById('musicToggleBtn');
const musicModal = document.getElementById('musicModal');
const musicYesBtn = document.getElementById('musicYesBtn');
const musicNoBtn = document.getElementById('musicNoBtn');
let musicPlaying = false;

bgMusic.volume = 0; // Start silent — fade in after user opts in
bgMusic.loop = true;

// Fade-in helper: ramps volume from 0 to target over ~4 seconds
function fadeInMusic(targetVol) {
  bgMusic.volume = 0;
  var current = 0;
  var step = 0.005;
  var interval = 120; // ~33 steps over ~4s to reach 0.07
  var fade = setInterval(function() {
    current += step;
    if (current >= targetVol) {
      current = targetVol;
      clearInterval(fade);
    }
    bgMusic.volume = current;
  }, interval);
}

// Determine start volume: saved preference (capped at 12%) or default 7%
function getStartVolume() {
  var saved = Number(localStorage.getItem('siteVolume'));
  if (saved && saved > 0) {
    return Math.min(saved, 0.12);
  }
  return 0.07;
}

// Soft tone layer (333, 444, 777 and 134 Hz sine tones) mixed under the
// ambient track. Web Audio only starts after the visitor chooses
// "Enter With Sound"; combined gain is fixed at 0.008.
const TONE_FREQUENCIES = [333, 444, 777, 134];
const TONE_GAIN = 0.008;
let toneCtx = null, toneGain = null;

function startTones() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  try {
    if (!toneCtx) {
      toneCtx = new AC();
      toneGain = toneCtx.createGain();
      toneGain.gain.value = 0;
      toneGain.connect(toneCtx.destination);
      TONE_FREQUENCIES.forEach(function(f) {
        const osc = toneCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;
        osc.connect(toneGain);
        osc.start();
      });
    }
    if (toneCtx.state === 'suspended') toneCtx.resume();
    toneGain.gain.cancelScheduledValues(toneCtx.currentTime);
    toneGain.gain.setTargetAtTime(TONE_GAIN, toneCtx.currentTime, 1.2);
  } catch (e) {}
}

function stopTones() {
  if (!toneCtx || !toneGain) return;
  try {
    toneGain.gain.cancelScheduledValues(toneCtx.currentTime);
    toneGain.gain.setTargetAtTime(0, toneCtx.currentTime, 0.3);
  } catch (e) {}
}

function setMusicUI(playing) {
  musicPlaying = playing;
  if (playing) startTones(); else stopTones();
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

function dismissModal() {
  musicModal.classList.add('music-modal-hidden');
  setTimeout(function() { musicModal.style.display = 'none'; }, 400);
}

// "Enter With Sound" — fade in music gently and dismiss
musicYesBtn.addEventListener('click', function() {
  dismissModal();
  var target = getStartVolume();
  bgMusic.volume = 0;
  if (volumeSlider) volumeSlider.value = Math.round(target * 100);
  bgMusic.load();
  bgMusic.play().then(function() {
    fadeInMusic(target);
    setMusicUI(true);
  }).catch(function() {
    setMusicUI(false);
  });
});

// "Continue Without Sound" — just dismiss
musicNoBtn.addEventListener('click', function() {
  dismissModal();
  setMusicUI(false);
});

// Persistent nav toggle: ON <-> OFF
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

// Show modal on load (after short delay for page to render)
setTimeout(function() {
  musicModal.style.display = 'flex';
}, 600);

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
// The one canonical cart. Persisted to localStorage so it survives reloads.
// Prices stored here are for display only — /api/cart/quote and
// /api/checkout recompute every total from the server catalog.
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const CART_STORAGE_KEY = 'aa_cart_main';
let cartPromoCode = '';
let lastQuote = null;
let quoteTimer = null;

function saveCart() {
  try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); } catch (e) {}
}

function openCart() { cartDrawer.classList.add('open'); cartOverlay.classList.add('visible'); }
function closeCartFn() { cartDrawer.classList.remove('open'); cartOverlay.classList.remove('visible'); }

document.getElementById('cartBtn').addEventListener('click', openCart);
document.getElementById('closeCart').addEventListener('click', closeCartFn);
cartOverlay.addEventListener('click', closeCartFn);

function cartPayload() {
  return cart.map(i => ({ name: i.name, qty: i.qty, customForm: i.customForm || '', herbCount: i.herbCount || 0 }));
}

// Local estimate shown instantly; replaced by the server quote when it lands.
function estimateTotals() {
  const subtotal = cart.reduce((s, i) => s + (Number(i.price) || 0) * i.qty, 0);
  const shipping = subtotal === 0 || subtotal >= 100 ? 0 : 6.99;
  return { subtotal, discount: 0, shipping, tax: 0, total: subtotal + shipping };
}

function paintTotals(prefix, t) {
  const set = (id, text) => { const el = document.getElementById(prefix + id); if (el) el.textContent = text; };
  set('Subtotal', formatPrice(t.subtotal));
  set('Shipping', t.shipping === 0 && t.subtotal > 0 ? 'FREE' : formatPrice(t.shipping));
  set('Discount', '−' + formatPrice(t.discount || 0));
  set('Tax', formatPrice(t.tax || 0));
  set('Total', formatPrice(t.total));
  const discountRow = document.getElementById(prefix + 'DiscountRow');
  if (discountRow) discountRow.hidden = !(t.discount > 0);
  const taxRow = document.getElementById(prefix + 'TaxRow');
  if (taxRow) taxRow.hidden = !(t.tax > 0);
}

function calcCartTotals() {
  const t = lastQuote || estimateTotals();
  paintTotals('cart', t);
  document.getElementById('cartCount').textContent = cart.reduce((s, i) => s + i.qty, 0);
  return t;
}

async function refreshQuote() {
  const note = document.getElementById('cartQuoteNote');
  if (cart.length === 0) { lastQuote = null; calcCartTotals(); if (note) note.textContent = ''; return null; }
  try {
    const res = await fetch('/api/cart/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cartPayload(), promoCode: cartPromoCode }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Quote unavailable');
    lastQuote = data;
    if (note) note.textContent = '';
    const msg = document.getElementById('cartPromoMsg');
    if (msg && cartPromoCode) {
      msg.textContent = data.promoRejected ? 'That code isn’t valid.' : '✦ Code applied.';
      if (data.promoRejected) cartPromoCode = '';
    }
  } catch (err) {
    lastQuote = null;
    if (note) note.textContent = /Unrecognised item/.test(err.message)
      ? 'One item in your cart is no longer available. Please remove it to check out.'
      : 'Totals shown are an estimate; final totals are confirmed at checkout.';
  }
  calcCartTotals();
  return lastQuote;
}

function scheduleQuote() {
  lastQuote = null;
  clearTimeout(quoteTimer);
  quoteTimer = setTimeout(refreshQuote, 250);
}

function renderCart() {
  const el = document.getElementById('cartItems');
  if (cart.length === 0) {
    el.innerHTML = '<p class="empty-cart">Your jar is empty.</p>';
  } else {
    el.innerHTML = cart.map((item, idx) => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${escapeHtml(item.name)}</div>
          ${item.form ? `<div class="cart-item-detail"><span class="cart-detail-label">Form:</span> ${escapeHtml(item.form)}</div>` : ''}
          ${item.symptoms ? `<div class="cart-item-detail"><span class="cart-detail-label">Focus:</span> ${escapeHtml(item.symptoms)}</div>` : ''}
          ${item.herbs ? `<div class="cart-item-detail"><span class="cart-detail-label">Herbs:</span> ${escapeHtml(item.herbs)}</div>` : ''}
          ${item.size ? `<div class="cart-item-detail"><span class="cart-detail-label">Size:</span> ${escapeHtml(item.size)}</div>` : ''}
          <div class="cart-item-price">${formatPrice(item.price)} × ${item.qty}</div>
        </div>
        <div class="cart-item-controls">
          <div class="cart-qty-controls">
            <button class="cart-qty-btn" data-idx="${idx}" data-dir="-1" aria-label="Decrease quantity">−</button>
            <span class="cart-qty-display">${item.qty}</span>
            <button class="cart-qty-btn" data-idx="${idx}" data-dir="1" aria-label="Increase quantity">+</button>
          </div>
          <button class="cart-item-remove" data-idx="${idx}" aria-label="Remove ${escapeHtml(item.name)}">✕</button>
        </div>
      </div>
    `).join('');
    el.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => removeCartItem(parseInt(btn.dataset.idx)));
    });
    el.querySelectorAll('.cart-qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        const dir = parseInt(btn.dataset.dir);
        if (cart[idx]) {
          cart[idx].qty = Math.min(99, Math.max(1, cart[idx].qty + dir));
          renderCart();
        }
      });
    });
  }
  saveCart();
  scheduleQuote();
  calcCartTotals();
}

function removeCartItem(idx) {
  if (idx >= 0 && idx < cart.length) cart.splice(idx, 1);
  renderCart();
}

function clearCart() {
  cart = [];
  cartPromoCode = '';
  renderCart();
}

window.getCartItems = function() { return cart.slice(); };
window.removeCartItem = removeCartItem;
window.clearCart = clearCart;

function addToCart(name, price, qty = 1) {
  const existing = cart.find(i => i.name === name);
  if (existing) { existing.qty += qty; }
  else { cart.push({ name, price, qty }); }
  renderCart();
  showToast(`✦ Added to cart: ${name}`);
  openCart();
  try { window.AAA && window.AAA.addToCart && window.AAA.addToCart({ name: name, price: price, quantity: qty }, qty); } catch (e) {}
}

// Promo codes are validated only on the server; none are published here.
document.getElementById('cartPromoForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const input = document.getElementById('cartPromoInput');
  cartPromoCode = (input.value || '').trim();
  const msg = document.getElementById('cartPromoMsg');
  if (!cartPromoCode) { if (msg) msg.textContent = ''; scheduleQuote(); return; }
  if (msg) msg.textContent = 'Checking…';
  refreshQuote();
});

document.getElementById('proceedToCheckoutBtn').addEventListener('click', () => {
  if (cart.length === 0) { showToast('Your cart is empty!'); return; }
  const t = lastQuote || estimateTotals();
  try { window.AAA && window.AAA.beginCheckout && window.AAA.beginCheckout(cart, t.total); } catch (e) {}
  closeCartFn();
  showSection('checkout');
  resetCheckoutView();
  renderCheckoutSummary();
  loadCheckoutConfig();
});

// ---- CHECKOUT (Card via Stripe · Cash App · Venmo) ----
let stripe, cardElement, stripeReady = false, checkoutConfig = null, checkoutIdempotencyKey = null;

function newIdempotencyKey() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'k' + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function resetCheckoutView() {
  const container = document.querySelector('.checkout-container');
  if (container) container.style.display = '';
  const conf = document.getElementById('checkoutConfirmation');
  if (conf) conf.style.display = 'none';
  checkoutIdempotencyKey = newIdempotencyKey();
}

async function renderCheckoutSummary() {
  const el = document.getElementById('checkoutItems');
  if (cart.length === 0) {
    el.innerHTML = '<p class="empty-cart">No items in cart.</p>';
    paintTotals('checkout', { subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0 });
    return;
  }
  const q = (await refreshQuote()) || null;
  const lines = q ? q.lineItems.map(li => ({ name: li.description, qty: li.qty, total: li.lineTotal }))
                  : cart.map(i => ({ name: i.name, qty: i.qty, total: i.price * i.qty }));
  el.innerHTML = lines.map(i => `
    <div class="checkout-item">
      <span>${escapeHtml(i.name)} x${i.qty}</span>
      <span class="checkout-item-price">${formatPrice(i.total)}</span>
    </div>
  `).join('');
  paintTotals('checkout', q || estimateTotals());
  const orderTotal = document.getElementById('orderTotalField');
  if (orderTotal) orderTotal.value = formatPrice((q || estimateTotals()).total);
  document.getElementById('checkoutProduct').value = cart.map(i => `${i.name} x${i.qty}`).join(', ');
  document.getElementById('checkoutQuantity').value = cart.reduce((s, i) => s + i.qty, 0);
}

function selectedPaymentMethod() {
  const r = document.querySelector('input[name="payment-method"]:checked');
  return r ? r.value : '';
}

function updatePaymentUI() {
  const method = selectedPaymentMethod();
  document.getElementById('stripe-card-wrap').hidden = method !== 'card';
  document.getElementById('manualPayNote').hidden = !(method === 'cashapp' || method === 'venmo');
  const label = { card: '💳 Pay by Card', cashapp: '✦ Place Order — Pay with Cash App', venmo: '✦ Place Order — Pay with Venmo' }[method] || '✦ Place Order';
  document.getElementById('payBtnText').textContent = label;
  if (method === 'card') initStripe();
}

document.querySelectorAll('input[name="payment-method"]').forEach(r => r.addEventListener('change', updatePaymentUI));

async function loadCheckoutConfig() {
  if (!checkoutConfig) {
    try {
      const res = await fetch('/api/checkout/config');
      checkoutConfig = res.ok ? await res.json() : { cardEnabled: false };
    } catch (e) {
      checkoutConfig = { cardEnabled: false };
    }
  }
  const cardInput = document.querySelector('input[name="payment-method"][value="card"]');
  const cardOption = document.getElementById('payOptionCard');
  if (cardInput) cardInput.disabled = !checkoutConfig.cardEnabled;
  if (cardOption) cardOption.classList.toggle('is-disabled', !checkoutConfig.cardEnabled);
  document.getElementById('cardUnavailableNote').hidden = !!checkoutConfig.cardEnabled;
  if (!checkoutConfig.cardEnabled && cardInput && cardInput.checked) cardInput.checked = false;
  updatePaymentUI();
}

function initStripe() {
  if (stripeReady || !checkoutConfig || !checkoutConfig.publishableKey || typeof Stripe === 'undefined') return;
  try {
    stripe = Stripe(checkoutConfig.publishableKey);
    const elements = stripe.elements();
    cardElement = elements.create('card', {
      style: {
        base: {
          color: '#f0e9d6',
          fontFamily: '"EB Garamond", Georgia, serif',
          fontSize: '17px',
          '::placeholder': { color: 'rgba(240,233,214,0.4)' },
        },
        invalid: { color: '#ff6b6b' },
      },
    });
    cardElement.mount('#card-element');
    cardElement.on('change', (e) => {
      const errEl = document.getElementById('card-errors');
      if (errEl) errEl.textContent = e.error ? e.error.message : '';
    });
    stripeReady = true;
  } catch (err) {
    console.warn('[Stripe] Init failed:', err.message);
  }
}

// Handle checkout form submission
const _checkoutFormEl = document.getElementById('checkoutForm');
if (_checkoutFormEl) _checkoutFormEl.addEventListener('submit', async function(e) {
  e.preventDefault();

  const payBtn = document.getElementById('checkoutPayBtn');
  const btnText = document.getElementById('payBtnText');
  const spinner = document.getElementById('payBtnSpinner');
  const errEl = document.getElementById('card-errors');

  const customer = {
    name: document.getElementById('checkoutCustomerName').value.trim(),
    email: document.getElementById('checkoutEmail').value.trim(),
    phone: document.getElementById('checkoutPhone').value.trim(),
    address: document.getElementById('checkoutAddress').value.trim(),
    cityStateZip: document.getElementById('checkoutCityStateZip').value.trim(),
  };
  const method = selectedPaymentMethod();
  if (!customer.name || !customer.email || !customer.address || !customer.cityStateZip) {
    errEl.textContent = 'Please fill in all required fields.';
    return;
  }
  if (!method) { errEl.textContent = 'Please choose Card, Cash App, or Venmo.'; return; }
  if (cart.length === 0) { errEl.textContent = 'Your cart is empty.'; return; }
  if (method === 'card' && (!stripe || !cardElement)) { errEl.textContent = 'Card checkout is still loading. Please try again in a moment.'; return; }

  const originalLabel = btnText.textContent;
  payBtn.disabled = true;
  btnText.textContent = 'Processing...';
  spinner.style.display = 'inline-block';
  errEl.textContent = '';
  let orderStatus = null;
  try { window.AAA && window.AAA.addPaymentInfo && window.AAA.addPaymentInfo(cart, (lastQuote && lastQuote.total) || 0, method); } catch (e) {}

  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cartPayload(),
        customer,
        notes: document.getElementById('checkoutNotes').value.trim(),
        paymentMethod: method,
        promoCode: cartPromoCode,
        idempotencyKey: checkoutIdempotencyKey,
        website: (_checkoutFormEl.querySelector('[name="bot-field"]') || {}).value || '',
      }),
    });
    const order = await res.json();
    if (!res.ok) throw new Error(order.error || 'We couldn’t place your order. Please try again.');

    if (method === 'card') {
      const { error, paymentIntent } = await stripe.confirmCardPayment(order.stripe.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customer.name,
            email: customer.email,
            address: { postal_code: customer.cityStateZip.split(/\s+/).pop() || '' },
          },
        },
      });
      if (error) throw new Error(error.message);
      // Stripe accepted the card, but the order is only marked paid once the
      // signed webhook reaches the server. Ask the server for the real status.
      orderStatus = paymentIntent && paymentIntent.status === 'succeeded'
        ? await pollOrderStatus(order.orderNumber, customer.email)
        : null;
      showConfirmation(order, customer, orderStatus);
    } else {
      showConfirmation(order, customer, null);
    }
    recordOrderForReviews(order, customer, method);
    try { window.AAA && window.AAA.track && window.AAA.track('order_submitted', { method: method, value: order.totals.total }); } catch (e2) {}
    // `purchase` fires only for server-verified payments (card via webhook).
    // Cash App / Venmo orders are verified later by Amber, outside the browser.
    if (orderStatus && orderStatus.status === 'payment_verified') {
      try {
        const items = (order.lineItems || []).map(li => ({ name: li.description, price: li.unitPrice, quantity: li.qty }));
        window.AAA && window.AAA.purchase && window.AAA.purchase(order.orderNumber, items, order.totals.total);
      } catch (e3) {}
    }
  } catch (err) {
    errEl.textContent = err.message || 'Payment failed. Please try again.';
    payBtn.disabled = false;
    btnText.textContent = originalLabel;
    spinner.style.display = 'none';
  }
});

async function pollOrderStatus(orderNumber, email) {
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const res = await fetch(`/api/order-status?order=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status !== 'awaiting_payment') return data;
      }
    } catch (e) {}
    await new Promise(r => setTimeout(r, 2000));
  }
  return null;
}

// Keeps the existing Netlify Forms "checkout-order" submission, which drives
// the review-reminder email (netlify/functions/submission-created.mjs).
function recordOrderForReviews(order, customer, method) {
  const form = document.getElementById('checkoutForm');
  if (!form) return;
  document.getElementById('transactionId').value = order.orderNumber;
  document.getElementById('paymentStatus').value = 'awaiting_payment (' + method + ')';
  document.getElementById('orderTotalField').value = formatPrice(order.totals.total);
  const params = new URLSearchParams();
  new FormData(form).forEach((value, key) => { if (key !== 'payment-method') params.append(key, value); });
  fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString() }).catch(() => {});
}

function showConfirmation(order, customer, statusInfo) {
  const manual = order.manual;
  let statusText = 'Awaiting payment';
  // Only mention an email when the server says the provider accepted it.
  let lede = order.emailSent === true
    ? 'A confirmation has been sent to your email.'
    : 'Please save your order number below. Amber will follow up by email.';
  if (order.paymentMethod === 'card') {
    if (statusInfo && statusInfo.status === 'payment_verified') {
      statusText = 'Payment verified';
      lede = 'Your card payment is verified. Amber will begin preparing your order.';
    } else if (statusInfo && statusInfo.status === 'payment_exception') {
      statusText = 'Payment needs review';
      lede = 'Your payment went through but needs a quick review. Amber will email you.';
    } else {
      statusText = 'Payment received — confirming';
      lede = 'Stripe accepted your card. We’ll email you as soon as the payment is confirmed.';
    }
  }

  let manualHtml = '';
  if (manual) {
    lede = `Your order is saved and awaiting payment. Please send ${formatPrice(Number(manual.amount))} by ${manual.label} with your order number in the payment note.`;
    manualHtml = `
      <div class="manual-pay-box">
        <p><strong>Pay:</strong> ${formatPrice(Number(manual.amount))} ${manual.handle ? 'to <strong>' + escapeHtml(manual.handle) + '</strong>' : ''}</p>
        <p><strong>Payment note:</strong> <code class="order-number-code">${escapeHtml(manual.note)}</code>
          <button type="button" class="btn-secondary copy-order-btn" data-copy="${escapeHtml(manual.note)}">Copy</button></p>
        <a class="pay-btn ${manual.method === 'cashapp' ? 'cashapp-btn' : 'venmo-btn'}" href="${escapeHtml(manual.url)}" target="_blank" rel="noopener">Open ${manual.label}</a>
        <p class="payment-note">Your order stays <em>awaiting payment</em> until Amber matches your payment to this order number.</p>
      </div>`;
  }

  document.getElementById('confirmationLede').textContent = lede;
  document.getElementById('confirmationDetails').innerHTML = `
    <p><strong>Order number:</strong> ${escapeHtml(order.orderNumber)}</p>
    <p><strong>Order for:</strong> ${escapeHtml(customer.name)} (${escapeHtml(customer.email)})</p>
    <p><strong>Items:</strong> ${order.lineItems.map(li => escapeHtml(li.description) + ' x' + li.qty).join(', ')}</p>
    <p><strong>Total:</strong> ${formatPrice(order.totals.total)}</p>
    <p><strong>Status:</strong> ${escapeHtml(statusText)}</p>
    ${manualHtml}
  `;
  const copyBtn = document.querySelector('.copy-order-btn');
  if (copyBtn) copyBtn.addEventListener('click', () => {
    try { navigator.clipboard.writeText(copyBtn.dataset.copy); copyBtn.textContent = 'Copied'; } catch (e) {}
  });

  document.querySelector('.checkout-container').style.display = 'none';
  document.getElementById('checkoutConfirmation').style.display = 'block';
  const payBtn = document.getElementById('checkoutPayBtn');
  payBtn.disabled = false;
  document.getElementById('payBtnSpinner').style.display = 'none';

  clearCart();
  showToast('Order submitted — ' + order.orderNumber);
}

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
          <a href="#" class="product-review-link" data-rv-open data-rv-open-type="product" data-rv-id="${p.id}" data-rv-name="${(p.name || '').replace(/"/g, '&quot;')}" style="color:var(--brass-lt,#d4af37);font-family:'Lora',serif;font-size:0.82rem;text-decoration:none;border:1px solid rgba(184,148,90,0.35);padding:4px 10px;border-radius:999px;">✦ Write a Review</a>
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
      addToCart(`${p.name} (${label.split('—')[0].trim()})`, price);
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
    const price = parseFloat(btn.dataset.price);
    // Complimentary services can't go through checkout; send them to Contact.
    if (!(price > 0)) btn.textContent = 'Request This Service \u2726';
    btn.addEventListener('click', () => {
      if (price > 0) addToCart(btn.dataset.name, price);
      else showSection('contact');
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

// ---- CUSTOM FORMULA (CONSULTATION) FORM ----
// custom-creations.js is not part of this site, so the consultation request
// is bound here and saved through /api/form-submit (see postSiteForm below).
(function bindFormulaForm() {
  const btn = document.getElementById('formulaSubmitBtn');
  if (!btn) return;
  const val = (id) => ((document.getElementById(id) || {}).value || '').trim();
  btn.addEventListener('click', async () => {
    const name = val('formulaName');
    const email = val('formulaEmail');
    const symptoms = val('formulaSymptoms');
    if (!name || !email || !symptoms) { showToast('Please add your name, email, and what you are experiencing.'); return; }
    if (!(document.getElementById('formulaInteractionCheck') || {}).checked ||
        !(document.getElementById('formulaAgeConfirm') || {}).checked) {
      showToast('Please confirm both safety checkboxes before sending.');
      return;
    }
    const fields = {
      'Remedy type': val('formulaType'),
      'Medications': val('formulaMeds'),
      'Supplements': val('formulaSupplements'),
      'Allergies': val('formulaAllergies'),
      'Pregnancy/breastfeeding': val('formulaPregnancy'),
      'Notes': val('formulaNotes'),
    };
    btn.disabled = true;
    const result = await postSiteForm({ formType: 'consultation', name, email, message: symptoms, fields });
    btn.disabled = false;
    if (result.ok) {
      showToast('✦ Consultation request received! Amber will reply by email.');
      ['formulaSymptoms', 'formulaMeds', 'formulaSupplements', 'formulaAllergies', 'formulaNotes']
        .forEach((id) => { const el = document.getElementById(id); if (el) el.value = ''; });
    } else if (result.retryable) {
      const lines = Object.entries(fields).map(([k, v]) => k + ': ' + (v || 'Not provided')).join('\n');
      const body = encodeURIComponent('Consultation request\n\nName: ' + name + '\nEmail: ' + email + '\n\nSymptoms: ' + symptoms + '\n' + lines);
      window.location.href = 'mailto:awaken@consultant.com?subject=' + encodeURIComponent('Consultation request from ' + name) + '&body=' + body;
      showToast('Opening your email app to send the request...');
    } else {
      showToast(result.error || 'Please check the form and try again.');
    }
  });
})();

// ---- SOAP FORM ----
// Handled by the DOMContentLoaded listener below — no duplicate needed here.

// ---- CONTACT + NEWSLETTER FORMS ----
// Both post to /api/form-submit, which saves the message in the database
// and notifies Amber. If the request fails, fall back to the visitor's
// email app so the message is never silently lost.
async function postSiteForm(payload) {
  try {
    const res = await fetch('/api/form-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) return { ok: true };
    return { ok: false, error: data.error, retryable: res.status >= 500 || res.status === 404 };
  } catch (e) {
    return { ok: false, retryable: true };
  }
}

document.getElementById('contactSubmitBtn').addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const subject = document.getElementById('contactSubject').value;
  const message = document.getElementById('contactMessage').value.trim();
  if (!name || !email || !message) { showToast('Please fill in all fields.'); return; }
  try { window.AAA && window.AAA.contactFormSubmit && window.AAA.contactFormSubmit(subject); } catch (e2) {}
  btn.disabled = true;
  const result = await postSiteForm({ formType: 'contact', name, email, subject, message });
  btn.disabled = false;
  if (result.ok) {
    showToast('✦ Message received! Amber will reply within 1–2 business days.');
    document.getElementById('contactName').value = '';
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactMessage').value = '';
  } else if (result.retryable) {
    const body = encodeURIComponent(`From: ${name} (${email})\n\n${message}`);
    window.location.href = `mailto:awaken@consultant.com?cc=${encodeURIComponent(email)}&subject=${encodeURIComponent(subject + ' — Amber\'s Alchemy')}&body=${body}`;
    showToast('Opening your email app to send the message...');
  } else {
    showToast(result.error || 'Please check the form and try again.');
  }
});

document.getElementById('nlSubmitBtn').addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  const name = document.getElementById('nlName').value.trim();
  const email = document.getElementById('nlEmail').value.trim();
  if (!email) { showToast('Please enter your email address.'); return; }
  try { window.AAA && window.AAA.newsletterSignup && window.AAA.newsletterSignup('homepage'); } catch (e2) {}
  btn.disabled = true;
  const result = await postSiteForm({
    formType: 'guide', name, email,
    subject: 'Newsletter signup + Free Herbal Healing Guide',
    message: 'Please add this subscriber to the mailing list and send the Free Herbal Healing Guide.',
  });
  btn.disabled = false;
  if (result.ok) {
    showToast('✦ Thank you! Amber will email you the Herbal Healing Guide.');
    document.getElementById('nlName').value = '';
    document.getElementById('nlEmail').value = '';
  } else if (result.retryable) {
    const body = encodeURIComponent(
      `New Newsletter Subscriber — Amber's Alchemy Apothecary\n\n` +
      `Name: ${name || 'Not provided'}\nEmail: ${email}\n\n` +
      `Please add this subscriber to the mailing list and send the Free Herbal Healing Guide.`
    );
    window.location.href = `mailto:awaken@consultant.com?subject=${encodeURIComponent('New Subscriber — ' + (name || email))}&body=${body}`;
    showToast('Opening your email app to finish signing up...');
  } else {
    showToast(result.error || 'Please check your email address and try again.');
  }
});

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
  else { cart.push({ name: item.name, price: item.price, qty: item.qty || 1, herbs: item.herbs || '', size: item.size || '', symptoms: item.symptoms || '', recommendedHerbs: item.recommendedHerbs || '', form: item.form || '', customForm: item.customForm || '', herbCount: item.herbCount || 0 }); }
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
        <div class="best-seller-badge-wrap"><span class="best-seller-badge">✦ Featured</span></div>
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
    { name: "Gaia's Rose", img: 'images/soap-rose-clay.png', emoji: '🌹', price: 12.99, fallbackDesc: 'A romantic bar inspired by nature\'s sacred bloom. Rose petals soften skin while creamy shea butter and goat milk restore moisture and leave skin glowing.' },
    { name: "Lavender Fairy Dream", img: 'images/soap-lavender-honey.png', emoji: '💜', price: 12.99, fallbackDesc: 'A gentle floral escape inspired by twilight gardens. Calming lavender soothes the mind while goat milk and shea butter soften and hydrate the skin.' },
    { name: "Eucalyptus Mint Spa Renewal", img: 'images/soap-charcoal-mint.png', emoji: '🌿', price: 12.99, fallbackDesc: 'A bright, invigorating blend that awakens the senses. Cooling eucalyptus and mint refresh tired skin while goat milk and shea butter deeply moisturize.' },
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
  soapsGrid.innerHTML = '<h3 style="grid-column:1/-1;text-align:center;color:var(--gold,#d4af37);margin-bottom:0.5rem;">✦ Featured Artisan Soaps ✦</h3>' +
    '<p style="grid-column:1/-1;text-align:center;margin-bottom:1rem;opacity:0.85;">All 5 Bars for <strong>$49.99</strong> &nbsp;|&nbsp; 5 Custom Soaps for <strong>$54.99</strong></p>' +
    soapNames.map(s => `
    <div class="product-card best-seller-card" style="text-align:center;">
      <div class="best-seller-badge-wrap"><span class="best-seller-badge">✦ Featured</span></div>
      <div class="product-img">
        <img src="${s.img}" alt="${s.name}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=img-placeholder>${s.emoji}</div>'" />
      </div>
      <div class="product-body">
        <div class="product-badge">Artisan Soap</div>
        <div class="product-name">${s.emoji} ${s.name}</div>
        <p class="soap-desc bs-soap-desc" style="font-family:'Lora',serif;font-size:0.88rem;opacity:0.9;margin:0.4rem 0 0.6rem;line-height:1.5;text-align:left;">${s.desc}</p>
        <div class="product-benefit">${soapVariantSelectHTML()}</div>
        <button class="product-add-btn btn-primary" onclick="addSoapToCart('${s.cartName.replace(/'/g, "\\'")}', null, this)">Add to Cart ✦</button>
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
  renderCart();
  paintHerbCount();
}

// Herb counts are computed from the library data, never hardcoded.
function paintHerbCount() {
  const src = typeof BOTANICALS_FULL !== 'undefined' ? BOTANICALS_FULL : (typeof BOTANICALS !== 'undefined' ? BOTANICALS : []);
  const count = new Set(src.map(h => (h.name || '').toLowerCase())).size;
  if (!count) return;
  document.querySelectorAll('[data-herb-count]').forEach(el => { el.textContent = String(count); });
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
// Soap sizes/shapes (Amber, 23 Sept 2026). The server catalog
// (lib/catalog.js) holds the authoritative prices; these mirror it for display.
// Declared as a function (hoisted) because init() renders soap cards before
// this point in the file executes.
function soapVariants() { return [
  { label: 'Small Rose \u00B7 2 oz', price: 4.77 },
  { label: 'Medium Rose \u00B7 3 oz', price: 8.44 },
  { label: 'Plain Rectangular \u00B7 3 oz', price: 7.44 },
  { label: 'Large Rectangular with Waves \u00B7 4 oz', price: 11.77 },
  { label: 'Large Circular with Flowers \u00B7 4 oz', price: 11.77 },
]; }
function soapVariantSelectHTML() {
  return '<label class="soap-size-label">Size &amp; shape <select class="soap-variant-select" aria-label="Soap size and shape">' +
    soapVariants().map(v => `<option value="${v.price}" data-label="${v.label}">${v.label} \u2014 $${v.price.toFixed(2)}</option>`).join('') +
    '</select></label>';
}

// price === null means "individual bar": read the size/shape select in the
// same card and add "<Soap> (<variant>)" so the server can price it.
function addSoapToCart(name, price, btnEl) {
  if (price === null || price === undefined) {
    const card = btnEl && (btnEl.closest('.soap-card') || btnEl.closest('.product-card'));
    const sel = card && card.querySelector('.soap-variant-select');
    const opt = sel && sel.options[sel.selectedIndex];
    if (!opt) return;
    name = `${name} (${opt.dataset.label})`;
    price = parseFloat(opt.value);
  }
  addToCart(name, price);
  // Visual feedback on the button
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
(function() {
  function bindSoapForm() {
    const soapSubmitBtn = document.getElementById('soapSubmitBtn');
    if (!soapSubmitBtn) return;
    soapSubmitBtn.addEventListener('click', async function() {
      const name = (document.getElementById('soapName') || {}).value?.trim() || '';
      const email = (document.getElementById('soapEmail') || {}).value?.trim() || '';
      if (!name || !email) {
        showToast('Please enter your name and email to submit a custom soap request.');
        return;
      }
      const fields = {
        Scent: (document.getElementById('soapScent') || {}).value || 'Not specified',
        Color: (document.getElementById('soapColor') || {}).value || 'Not specified',
        Shape: (document.getElementById('soapShape') || {}).value || 'Not specified',
        Botanical: (document.getElementById('soapBotanical') || {}).value || 'Not specified',
        Quantity: (document.getElementById('soapQuantity') || {}).value || 'Not specified',
        Notes: (document.getElementById('soapNotes') || {}).value?.trim() || '',
      };
      soapSubmitBtn.disabled = true;
      const result = await postSiteForm({ formType: 'soap', name, email, subject: 'Custom soap request', fields });
      soapSubmitBtn.disabled = false;
      if (result.ok) {
        showToast('✦ Custom soap request received! Amber will confirm details by email.');
        soapSubmitBtn.textContent = '✓ Request Sent!';
        setTimeout(() => { soapSubmitBtn.textContent = 'Send My Custom Soap Request ✦'; }, 3000);
      } else if (result.retryable) {
        const body = encodeURIComponent(
          'Custom Soap Order Request\n\nName: ' + name + '\nEmail: ' + email + '\n' +
          Object.entries(fields).map(([k, v]) => k + ': ' + v).join('\n')
        );
        window.location.href = 'mailto:awaken@consultant.com?subject=' + encodeURIComponent('Custom Soap Order from ' + name) + '&body=' + body;
        showToast('✦ Opening email to send your custom soap request...');
      } else {
        showToast(result.error || 'Please check the form and try again.');
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindSoapForm);
  } else {
    bindSoapForm();
  }
})();
