/*
 * Thank-You next-step flow — a polished post-purchase panel that offers
 * "continue shopping, explore grimoire, book consultation, take herbal quiz,
 * browse remedies, or view account" options.
 *
 * Triggers:
 *   - Query string ?thanks=1, ?thank_you=1, ?shopify_return=1, or ?order=...
 *   - Programmatic call: window.showThankYou({ orderRef, total })
 *   - Listens for "awaken:order:success" CustomEvent dispatched by app.js
 *     after a successful Stripe PaymentIntent.
 */
(function () {
  'use strict';

  var built = false;
  var overlay = null;

  function build() {
    if (built) return;
    built = true;
    overlay = document.createElement('div');
    overlay.className = 'ty-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Thank you for your order');
    overlay.innerHTML =
        '<div class="ty-backdrop"></div>'
      + '<div class="ty-panel" role="document">'
      + '  <button class="ty-close" aria-label="Close">&times;</button>'
      + '  <div class="ty-ornament">\u2729 \u2055 \u2729</div>'
      + '  <h2 class="ty-title">Thank you, truly.</h2>'
      + '  <p class="ty-lede">Your order is on its way to Amber\u2019s bench. She will confirm by email shortly \u2014 each jar is packed slowly, with care.</p>'
      + '  <p class="ty-ref" id="tyOrderRef"></p>'
      + '  <div class="ty-ornament">\u2055</div>'
      + '  <div class="ty-next">'
      + '    <p class="ty-next-title">While you wait \u2014 where would you like to go next?</p>'
      + '    <div class="ty-next-grid">'
      + '      <button type="button" class="ty-next-btn" data-ty-next="shop"><span class="ty-next-emoji">\u{1F33F}</span><strong>Continue Shopping</strong><em>Browse the remedies shelf</em></button>'
      + '      <button type="button" class="ty-next-btn" data-ty-next="grimoire"><span class="ty-next-emoji">\u{1F4D6}</span><strong>Explore the Grimoire</strong><em>Rituals, recipes, moon work</em></button>'
      + '      <a class="ty-next-btn" data-ty-next="book" href="https://calendar.app.google/zSzB4LLvngFVmiqu7" target="_blank" rel="noopener" data-consult-cta><span class="ty-next-emoji">\u{1F4C5}</span><strong>Book a Consultation</strong><em>One-to-one time with Amber</em></a>'
      + '      <button type="button" class="ty-next-btn" data-ty-next="quiz"><span class="ty-next-emoji">\u{2728}</span><strong>Take the Herbal Quiz</strong><em>Meet your allies</em></button>'
      + '      <button type="button" class="ty-next-btn" data-ty-next="custom-formula"><span class="ty-next-emoji">\u{2697}</span><strong>Custom Remedy Flow</strong><em>Something crafted for you</em></button>'
      + '      <button type="button" class="ty-next-btn" data-ty-next="account"><span class="ty-next-emoji">\u{1F4D1}</span><strong>Order Details</strong><em>Check the confirmation email</em></button>'
      + '    </div>'
      + '  </div>'
      + '  <p class="ty-outro">Amber will message you personally with tracking once your order ships \u2728</p>'
      + '</div>';
    document.body.appendChild(overlay);

    overlay.querySelector('.ty-close').addEventListener('click', close);
    overlay.querySelector('.ty-backdrop').addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-ty-next]');
      if (!t) return;
      var where = t.getAttribute('data-ty-next');
      if (where === 'book') return; // external link handled natively
      e.preventDefault();
      if (where === 'grimoire') {
        close();
        if (typeof showSection === 'function') showSection('herb-index');
        setTimeout(function () { if (typeof openGrimoireBook === 'function') openGrimoireBook(0); }, 300);
        return;
      }
      if (where === 'quiz') {
        close();
        if (typeof openHerbalAdvisor === 'function') openHerbalAdvisor();
        return;
      }
      if (where === 'account') {
        close();
        if (typeof showSection === 'function') showSection('contact');
        return;
      }
      close();
      if (typeof showSection === 'function') showSection(where);
    });

    document.addEventListener('keydown', function (e) {
      if (overlay.getAttribute('aria-hidden') === 'true') return;
      if (e.key === 'Escape') close();
    });
  }

  function open(options) {
    build();
    var ref = overlay.querySelector('#tyOrderRef');
    if (options && options.orderRef) {
      ref.textContent = 'Order reference: ' + options.orderRef + (options.total ? '  ·  Total: ' + options.total : '');
      ref.style.display = 'block';
    } else {
      ref.textContent = '';
      ref.style.display = 'none';
    }
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('ty-open');
    document.body.style.overflow = 'hidden';
    try { if (window.gtag) window.gtag('event', 'thank_you_open'); } catch (e) {}
  }
  function close() {
    if (!overlay) return;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('ty-open');
    document.body.style.overflow = '';
  }

  window.showThankYou = open;
  window.closeThankYou = close;

  // Auto-open on return query params.
  function checkQuery() {
    try {
      var qs = new URLSearchParams(window.location.search);
      if (qs.has('thanks') || qs.has('thank_you') || qs.has('shopify_return') || qs.has('order')) {
        open({ orderRef: qs.get('order') || null });
        // Clean the URL after showing — avoids re-opening on refresh.
        var clean = window.location.pathname + window.location.hash;
        try { history.replaceState({}, '', clean); } catch (e) {}
      }
    } catch (e) {}
  }

  // Listen for the in-app order success event (dispatched in app.js).
  document.addEventListener('awaken:order:success', function (e) {
    var d = (e && e.detail) || {};
    open({ orderRef: d.orderRef, total: d.total });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkQuery);
  } else {
    checkQuery();
  }
})();
