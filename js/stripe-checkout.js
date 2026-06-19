// js/stripe-checkout.js
// Wires the "Pay with Card" button to Stripe EMBEDDED Checkout so the customer
// completes payment without leaving the site. Reads the current cart, asks the
// create-checkout-session function for a client secret, and mounts the embedded
// Stripe checkout into the checkout section.
//
// The publishable key comes from the stripe-config function (Netlify env var);
// no keys are hardcoded here.

(function () {
  'use strict';

  var MOUNT_ID = 'stripe-checkout-mount';
  var BTN_ID = 'stripeCheckoutBtn';
  var stripePromise = null;
  var checkout = null; // active embedded checkout instance

  function toast(msg) {
    if (window.AACart && typeof window.showToast === 'function') return window.showToast(msg);
    var el = document.getElementById('aa-toast');
    if (el) { el.textContent = msg; el.style.opacity = '1'; setTimeout(function () { el.style.opacity = '0'; }, 3000); }
    else { console.warn(msg); }
  }

  function getCartItems() {
    if (window.AACart && typeof window.AACart.getItems === 'function') {
      return window.AACart.getItems();
    }
    try { return JSON.parse(localStorage.getItem('aa_cart') || '[]'); }
    catch (e) { return []; }
  }

  // Load Stripe.js with the publishable key fetched from the backend config.
  function loadStripe() {
    if (stripePromise) return stripePromise;
    stripePromise = fetch('/.netlify/functions/stripe-config')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.publishableKey) throw new Error(data.error || 'Stripe is not configured.');
        if (typeof Stripe === 'undefined') throw new Error('Stripe.js failed to load.');
        return Stripe(data.publishableKey);
      });
    return stripePromise;
  }

  function fetchClientSecret() {
    var items = getCartItems();
    return fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: items }),
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.clientSecret) throw new Error(data.error || 'Could not start checkout.');
        return data.clientSecret;
      });
  }

  async function startCheckout(btn) {
    var items = getCartItems();
    if (!items || items.length === 0) { toast('Your cart is empty!'); return; }

    var mount = document.getElementById(MOUNT_ID);
    if (!mount) return;

    btn.disabled = true;
    var originalText = btn.textContent;
    btn.textContent = 'Loading secure checkout…';

    try {
      var stripe = await loadStripe();

      // Tear down any previous instance before mounting a fresh one.
      if (checkout) { try { checkout.destroy(); } catch (e) {} checkout = null; }

      checkout = await stripe.initEmbeddedCheckout({ fetchClientSecret: fetchClientSecret });
      checkout.mount('#' + MOUNT_ID);

      // The payment form is now embedded on the page; hide the trigger button.
      btn.style.display = 'none';
      mount.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      console.error('Stripe embedded checkout error:', err);
      toast(err.message || 'Unable to start checkout. Please try again.');
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }

  // After payment, Stripe returns the shopper to /?checkout=complete&session_id=...
  // Confirm the session server-side, then show the existing order confirmation.
  function handleReturn() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('checkout') !== 'complete') return;
    var sessionId = params.get('session_id');
    if (!sessionId) return;

    fetch('/.netlify/functions/session-status?session_id=' + encodeURIComponent(sessionId))
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.status === 'complete') {
          if (window.AACart && typeof window.AACart.clear === 'function') window.AACart.clear();

          var details = document.getElementById('confirmationDetails');
          if (details) {
            var total = typeof data.amount_total === 'number' ? '$' + (data.amount_total / 100).toFixed(2) : '';
            details.innerHTML =
              (data.customer_email ? '<p><strong>Email:</strong> ' + data.customer_email + '</p>' : '') +
              (total ? '<p><strong>Total:</strong> ' + total + '</p>' : '') +
              '<p><strong>Status:</strong> Payment Confirmed</p>';
          }
          var container = document.querySelector('.checkout-container');
          if (container) container.style.display = 'none';
          var confirm = document.getElementById('checkoutConfirmation');
          if (confirm) confirm.style.display = 'block';
          toast('Payment received — thank you!');
        }
      })
      .catch(function (err) { console.error('Stripe session-status error:', err); })
      .finally(function () {
        // Clean the query string so a refresh doesn't re-trigger confirmation.
        if (window.history && window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
        }
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById(BTN_ID);
    if (btn) {
      btn.addEventListener('click', function () { startCheckout(btn); });
    }
    handleReturn();
  });
})();
