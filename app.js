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

function setMusicUI(playing) {
  musicPlaying = playing;
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

// "Get the Full Experience" — fade in music gently and dismiss
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

// "Browse without Music" — just dismiss
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
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');

function openCart() { cartDrawer.classList.add('open'); cartOverlay.classList.add('visible'); }
function closeCartFn() { cartDrawer.classList.remove('open'); cartOverlay.classList.remove('visible'); }

document.getElementById('cartBtn').addEventListener('click', openCart);
document.getElementById('closeCart').addEventListener('click', closeCartFn);
cartOverlay.addEventListener('click', closeCartFn);

function calcCartTotals() {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal === 0 ? 0 : (subtotal >= 75 ? 0 : 6.99);
  const taxRate = 0.08;
  const tax = subtotal * taxRate;
  const total = subtotal + shipping + tax;
  document.getElementById('cartSubtotal').textContent = formatPrice(subtotal);
  document.getElementById('cartShipping').textContent = shipping === 0 && subtotal > 0 ? 'FREE' : formatPrice(shipping);
  document.getElementById('cartTax').textContent = formatPrice(tax);
  document.getElementById('cartTotal').textContent = formatPrice(total);
  document.getElementById('cartCount').textContent = cart.reduce((s, i) => s + i.qty, 0);
  return { subtotal, shipping, tax, total };
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

function addToCart(name, price, qty = 1) {
  const existing = cart.find(i => i.name === name);
  if (existing) { existing.qty += qty; }
  else { cart.push({ name, price, qty }); }
  renderCart();
  showToast(`✦ Added to cart: ${name}`);
  openCart();
  try { window.AAA && window.AAA.addToCart && window.AAA.addToCart({ name: name, price: price, quantity: qty }, qty); } catch (e) {}
}

// Email checkout — now redirects to secure checkout page
document.getElementById('proceedToCheckoutBtn').addEventListener('click', () => {
  const name = document.getElementById('cartName').value.trim();
  const email = document.getElementById('cartEmail').value.trim();
  const address = document.getElementById('cartAddress').value.trim();
  const cityState = document.getElementById('cartCityState').value.trim();
  const notes = document.getElementById('cartNotes').value.trim();
  if (!name || !email || !address) { showToast('Please fill in your name, email, and address.'); return; }
  if (cart.length === 0) { showToast('Your cart is empty!'); return; }

  // Pre-fill checkout form with cart info
  document.getElementById('checkoutCustomerName').value = name;
  document.getElementById('checkoutEmail').value = email;
  document.getElementById('checkoutAddress').value = address;
  document.getElementById('checkoutCityStateZip').value = cityState;
  document.getElementById('checkoutNotes').value = notes;
  document.getElementById('checkoutProduct').value = cart.map(i => `${i.name} x${i.qty}`).join(', ');
  document.getElementById('checkoutQuantity').value = cart.reduce((s, i) => s + i.qty, 0);

  const cartTotal = cart.reduce((s, i) => s + (parseFloat(i.price) || 0) * i.qty, 0);
  try { window.AAA && window.AAA.beginCheckout && window.AAA.beginCheckout(cart, cartTotal); } catch (e) {}

  closeCartFn();
  showSection('checkout');
  renderCheckoutSummary();
  initStripe();
});

// Venmo/CashApp dynamic total — accepts debit & credit cards
function getOrderNote() {
  const name = document.getElementById('cartName').value.trim();
  const items = cart.map(i => `${i.name} x${i.qty}`).join(', ');
  let note = "Amber's Alchemy Order";
  if (name) note += ` - ${name}`;
  if (items) note += ` | ${items}`;
  return note;
}

document.getElementById('venmoPayBtn').addEventListener('click', function(e) {
  const { total } = calcCartTotals();
  if (cart.length === 0) { e.preventDefault(); showToast('Your cart is empty!'); return; }
  const note = getOrderNote();
  this.href = `https://venmo.com/AmberLynnPatten?txn=pay&amount=${total.toFixed(2)}&note=${encodeURIComponent(note)}`;
});
document.getElementById('cashAppPayBtn').addEventListener('click', function(e) {
  const { total } = calcCartTotals();
  if (cart.length === 0) { e.preventDefault(); showToast('Your cart is empty!'); return; }
  this.href = `https://cash.app/$AmberAlchemy/${total.toFixed(2)}`;
});

// ---- SECURE CHECKOUT (Stripe) ----
let stripe, cardElement, stripeReady = false;

function renderCheckoutSummary() {
  const el = document.getElementById('checkoutItems');
  if (cart.length === 0) {
    el.innerHTML = '<p class="empty-cart">No items in cart.</p>';
    return;
  }
  el.innerHTML = cart.map(i => `
    <div class="checkout-item">
      <span>${i.name} x${i.qty}</span>
      <span class="checkout-item-price">${formatPrice(i.price * i.qty)}</span>
    </div>
  `).join('');

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 75 ? 0 : 6.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  document.getElementById('checkoutSubtotal').textContent = formatPrice(subtotal);
  document.getElementById('checkoutShipping').textContent = shipping === 0 ? 'FREE' : formatPrice(shipping);
  document.getElementById('checkoutTax').textContent = formatPrice(tax);
  document.getElementById('checkoutTotal').textContent = formatPrice(total);
  document.getElementById('orderTotalField').value = formatPrice(total);
}

async function initStripe() {
  if (stripeReady) return;

  // Try meta tag first, then fetch from API
  let pk = '';
  const stripeKey = document.querySelector('meta[name="stripe-key"]');
  if (stripeKey && stripeKey.content) {
    pk = stripeKey.content;
  } else {
    try {
      const res = await fetch('/api/stripe-config');
      const data = await res.json();
      pk = data.publishableKey || '';
    } catch (e) { /* ignore */ }
  }

  if (!pk) {
    document.getElementById('card-errors').textContent = 'Card payments are being set up. You may also use Venmo or Cash App from the cart.';
    document.getElementById('checkoutPayBtn').disabled = false;
    document.getElementById('payBtnText').textContent = 'Submit Order';
    return;
  }
  try {
    stripe = Stripe(pk);
    const elements = stripe.elements();
    cardElement = elements.create('card', {
      style: {
        base: {
          color: '#F3EBDD',
          fontFamily: 'Lora, Georgia, serif',
          fontSize: '15px',
          '::placeholder': { color: '#B8A898' },
        },
        invalid: { color: '#e74c3c' },
      },
    });
    cardElement.mount('#card-element');
    cardElement.on('change', function(event) {
      const errEl = document.getElementById('card-errors');
      errEl.textContent = event.error ? event.error.message : '';
      document.getElementById('checkoutPayBtn').disabled = !event.complete;
    });
    stripeReady = true;
  } catch (e) {
    document.getElementById('card-errors').textContent = 'Could not initialize payment form.';
  }
}

// Handle checkout form submission
document.getElementById('checkoutForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const payBtn = document.getElementById('checkoutPayBtn');
  const btnText = document.getElementById('payBtnText');
  const spinner = document.getElementById('payBtnSpinner');
  const errEl = document.getElementById('card-errors');

  // Validate required fields
  const name = document.getElementById('checkoutCustomerName').value.trim();
  const email = document.getElementById('checkoutEmail').value.trim();
  const address = document.getElementById('checkoutAddress').value.trim();
  const cityZip = document.getElementById('checkoutCityStateZip').value.trim();
  if (!name || !email || !address || !cityZip) {
    errEl.textContent = 'Please fill in all required fields.';
    return;
  }
  if (cart.length === 0) { errEl.textContent = 'Your cart is empty.'; return; }

  // Calculate total in cents for Stripe
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 75 ? 0 : 6.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  const amountCents = Math.round(total * 100);

  // Ensure order total is set on hidden field
  document.getElementById('orderTotalField').value = formatPrice(total);

  payBtn.disabled = true;
  btnText.textContent = 'Processing...';
  spinner.style.display = 'inline-block';
  errEl.textContent = '';

  try {
    // If Stripe is not initialized, submit form as order (payment via Venmo/CashApp)
    if (!stripe || !cardElement) {
      document.getElementById('transactionId').value = 'PENDING-' + Date.now();
      document.getElementById('paymentStatus').value = 'pending-external-payment';
      document.getElementById('checkoutProduct').value = cart.map(i => `${i.name} x${i.qty}`).join(', ');
      await submitNetlifyForm();
      showConfirmation('PENDING — Complete payment via Venmo or Cash App in the cart', 'pending');
      return;
    }

    // Create PaymentIntent on server
    const piResponse = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amountCents,
        currency: 'usd',
        description: `Order from ${name} — Amber's Alchemy Apothecary`,
        metadata: {
          customer_name: name,
          email: email,
          items: cart.map(i => `${i.name} x${i.qty}`).join(', ').substring(0, 500),
        },
      }),
    });

    const piData = await piResponse.json();
    if (piData.error) { throw new Error(piData.error); }

    // Confirm payment with Stripe
    const { error, paymentIntent } = await stripe.confirmCardPayment(piData.clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: name,
          email: email,
          address: { postal_code: cityZip.split(/\s+/).pop() || '' },
        },
      },
    });

    if (error) { throw new Error(error.message); }

    if (paymentIntent.status === 'succeeded') {
      // Set transaction info and submit Netlify Form
      document.getElementById('transactionId').value = paymentIntent.id;
      document.getElementById('paymentStatus').value = 'paid';
      await submitNetlifyForm();
      showConfirmation(paymentIntent.id, 'paid');
    }
  } catch (err) {
    errEl.textContent = err.message || 'Payment failed. Please try again.';
    payBtn.disabled = false;
    btnText.textContent = 'Pay Now';
    spinner.style.display = 'none';
  }
});

async function submitNetlifyForm() {
  const form = document.getElementById('checkoutForm');
  const formData = new FormData(form);
  await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(formData).toString(),
  });
}

function showConfirmation(transactionId, status) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 75 ? 0 : 6.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  const name = document.getElementById('checkoutCustomerName').value.trim();
  const email = document.getElementById('checkoutEmail').value.trim();

  document.getElementById('confirmationDetails').innerHTML = `
    <p><strong>Order for:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Items:</strong> ${cart.map(i => `${i.name} x${i.qty}`).join(', ')}</p>
    <p><strong>Total:</strong> ${formatPrice(total)}</p>
    <p><strong>Transaction ID:</strong> ${transactionId}</p>
    <p><strong>Status:</strong> ${status === 'paid' ? 'Payment Confirmed' : 'Awaiting Payment'}</p>
  `;

  // Show confirmation, hide form
  document.querySelector('.checkout-container').style.display = 'none';
  document.getElementById('checkoutConfirmation').style.display = 'block';

  // Clear cart
  cart = [];
  renderCart();
  showToast('Order submitted successfully!');
}

// ---- RENDER PRODUCTS (with category filter) ----
function renderProducts(filterCat = 'all') {
  const grid = document.getElementById('shopGrid');
  // "soaps" category → render the soap catalog inline as product cards so
  // customers see real inventory without leaving the shop pane.
  if (filterCat === 'soaps') {
    const soapList = (typeof SOAPS !== 'undefined' && Array.isArray(SOAPS)) ? SOAPS : [];
    if (soapList.length === 0) {
      grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px;grid-column:1/-1">Soaps are loading — scroll to the Artisan Botanical Soaps pane below.</p>';
      return;
    }
    const builderCard = '<div class="product-card soap-builder-shop-card" data-categories="soap,custom">' +
        '<div class="product-img">' +
          '<img src="images/soap-custom-builder.svg" alt="Build Your Own Soap Remedy — custom artisan soap" loading="lazy" onerror="this.parentElement.innerHTML=\'<div class=img-placeholder>🧼✦</div>\'" />' +
        '</div>' +
        '<div class="product-body">' +
          '<div class="product-badge">Custom</div>' +
          '<div class="product-name">✦ Build Your Own Soap Remedy</div>' +
          '<div class="product-benefit">Choose your shape, scent, botanicals, and nourishing base</div>' +
          '<div class="product-short-desc">Create a handcrafted botanical bar with your choice of clear-top, creamy, or layered base.</div>' +
          '<div class="product-benefit" style="color:var(--gold,#d4a843);font-weight:600;">From $13.99</div>' +
          '<button class="product-add-btn btn-primary" onclick="openSoapBuilder()">Build Your Own ✦</button>' +
        '</div>' +
      '</div>';
    grid.innerHTML = builderCard + soapList.map(s => {
      const price = typeof s.price === 'number' ? s.price : 12.99;
      const safeName = String(s.name || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
      const desc = s.description || s.desc || '';
      return '<div class="product-card" data-categories="' + ((s.categories||['soap']).join(',')) + '">' +
        '<div class="product-img">' +
          '<img src="' + (s.img || s.illustration || '') + '" alt="' + safeName + '" loading="lazy" onerror="this.parentElement.innerHTML=\'<div class=img-placeholder>' + (s.emoji || '🧼') + '</div>\'" />' +
        '</div>' +
        '<div class="product-body">' +
          '<div class="product-badge">Artisan Soap</div>' +
          '<div class="product-name">' + (s.emoji || '🧼') + ' ' + (s.name || '') + '</div>' +
          (s.botanicals ? '<div class="product-benefit">🌿 ' + s.botanicals + '</div>' : '') +
          (desc ? '<div class="product-short-desc">' + desc + '</div>' : '') +
          '<div class="product-benefit" style="color:var(--gold,#d4a843);font-weight:600;">$' + price.toFixed(2) + ' · 4 oz bar</div>' +
          '<button class="product-add-btn btn-primary" onclick="addSoapToCart(\'' + safeName + '\', ' + price + ', this)">Add to Cart ✦</button>' +
        '</div>' +
      '</div>';
    }).join('');
    return;
  }
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
          const safeName = String(h).replace(/"/g, '&quot;');
          const thumb = imgPath
            ? '<img src="' + imgPath + '" alt="' + safeName + '" width="44" height="44" loading="lazy" decoding="async" onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),{className:\'herb-chip-fallback\',textContent:\'🌿\'}))"/>'
            : '<span class="herb-chip-fallback" aria-hidden="true">🌿</span>';
          return '<div class="herb-chip botanical-chip" data-herb-name="' + safeName + '" title="Click to view ' + safeName + ' botanical profile">' + thumb + '<span>' + h + '</span><span class="bic-chip-hint">tap for profile</span></div>';
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
  const cat = btn.dataset.cat;
  // Soaps live in their own section — render them inline AND deep-link to the soaps pane
  if (cat === 'soaps') {
    renderProducts('soaps');
    const soapsSection = document.getElementById('soaps');
    if (soapsSection && typeof soapsSection.scrollIntoView === 'function') {
      soapsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return;
  }
  renderProducts(cat);
});

// Shop goal filter buttons
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.shop-goal-btn[data-goal]');
  if (!btn) return;
  const goal = btn.dataset.goal;
  // Map goal names to product categories
  const goalToCat = { sleep: 'sleep', stress: 'sleep', energy: 'energy', immune: 'immune', beauty: 'beauty', pain: 'pain', digestive: 'digestive', hormonal: 'hormonal' };
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
          ${illus
            ? `<img src="${illus}" alt="Botanical illustration of ${h.name}" loading="lazy" decoding="async" onerror="this.outerHTML='<div class=img-placeholder>${h.emoji || '🌿'}</div>'" />`
            : `<div class="img-placeholder">${h.emoji || '🌿'}</div>`}
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

// ---- CONTACT FORM ----
document.getElementById('contactSubmitBtn').addEventListener('click', () => {
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const subject = document.getElementById('contactSubject').value;
  const message = document.getElementById('contactMessage').value.trim();
  if (!name || !email || !message) { showToast('Please fill in all fields.'); return; }
  const body = encodeURIComponent(`From: ${name} (${email})\n\n${message}`);
  try { window.AAA && window.AAA.contactFormSubmit && window.AAA.contactFormSubmit(subject); } catch (e) {}
  window.location.href = `mailto:awaken@consultant.com?cc=${encodeURIComponent(email)}&subject=${encodeURIComponent(subject + ' — Amber\'s Alchemy')}&body=${body}`;
  showToast('Opening email client...');
});

// ---- NEWSLETTER FORM (Netlify Forms — AJAX submit) ----
(function initNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  const feedback = document.getElementById('nlFeedback');
  const submitBtn = document.getElementById('nlSubmitBtn');

  function setStatus(message, state) {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.dataset.state = state || '';
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = (document.getElementById('nlName') || {}).value?.trim() || '';
    const email = (document.getElementById('nlEmail') || {}).value?.trim() || '';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('Please enter a valid email address.', 'error');
      return;
    }

    const originalLabel = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
    setStatus('', '');

    const body = new URLSearchParams();
    body.set('form-name', 'newsletter-signup');
    body.set('source-tag', 'homepage-signup');
    body.set('name', name);
    body.set('email', email);
    body.set('bot-field', '');

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });
      if (!res.ok) throw new Error('submit-failed');
      try { window.AAA && window.AAA.newsletterSignup && window.AAA.newsletterSignup('homepage'); } catch (e) {}
      setStatus('✦ Thank you! Your Herbal Healing Guide is on its way.', 'success');
      form.reset();
      showToast('✦ Subscribed — check your inbox for the guide.');
    } catch (err) {
      console.error('Newsletter signup failed:', err);
      setStatus('Sorry, we could not submit your signup. Please try again in a moment.', 'error');
      showToast('Signup failed — please try again.');
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
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
      const safeName = String(h).replace(/"/g, '&quot;');
      const thumb = imgPath
        ? '<img src="' + imgPath + '" alt="' + safeName + '" width="44" height="44" loading="lazy" decoding="async" onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),{className:\'herb-chip-fallback\',textContent:\'🌿\'}))"/>'
        : '<span class="herb-chip-fallback" aria-hidden="true">🌿</span>';
      return '<div class="herb-chip botanical-chip" data-herb-name="' + safeName + '" title="Click to view ' + safeName + ' botanical profile">' + thumb + '<span>' + h + '</span><span class="bic-chip-hint">tap for profile</span></div>';
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
  // Use the main addToCart function which handles cart state, toast, and drawer
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

// ---- SOAP CUSTOM ORDER FORM (Netlify Forms — AJAX submit) ----
(function() {
  function bindSoapForm() {
    const form = document.getElementById('customSoapForm');
    if (!form) return;
    const btn = document.getElementById('soapSubmitBtn');
    const feedback = document.getElementById('soapFeedback');
    function setStatus(message, state) {
      if (!feedback) return;
      feedback.textContent = message || '';
      feedback.dataset.state = state || '';
    }
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = (document.getElementById('soapName') || {}).value?.trim() || '';
      const email = (document.getElementById('soapEmail') || {}).value?.trim() || '';
      if (!name || !email) {
        setStatus('Please enter your name and email to submit your request.', 'error');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setStatus('Please enter a valid email address.', 'error');
        return;
      }
      const originalLabel = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      setStatus('', '');
      const data = new URLSearchParams(new FormData(form));
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data.toString()
      }).then(function(res) {
        if (!res.ok) throw new Error('submit-failed');
        try { window.AAA && window.AAA.customSoapSubmit && window.AAA.customSoapSubmit(name); } catch (e) {}
        setStatus('✓ Your custom soap request has been received. Amber will reach out within 1–2 business days.', 'success');
        if (btn) { btn.textContent = '✓ Request Sent!'; }
        form.reset();
        setTimeout(function() {
          if (btn) { btn.disabled = false; btn.textContent = originalLabel || 'Send My Custom Soap Request ✦'; }
        }, 3000);
      }).catch(function() {
        setStatus('We could not submit your request right now. Please try again or email awaken@consultant.com.', 'error');
        if (btn) { btn.disabled = false; btn.textContent = originalLabel || 'Send My Custom Soap Request ✦'; }
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindSoapForm);
  } else {
    bindSoapForm();
  }
})();
