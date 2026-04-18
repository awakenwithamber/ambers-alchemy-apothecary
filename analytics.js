/*
 * analytics.js — Amber's Alchemy Apothecary
 *
 * Conversion + GA4 / GTM loader with dataLayer-based event tracking.
 *
 * Exposes window.AAA.track(eventName, params) so the rest of the app
 * can fire consistent GA4-shaped events (view_item, add_to_cart, etc.)
 * whether GTM, GA4, or neither is configured yet.
 *
 * Configuration: set window.__AAA_GA4_ID__ and/or window.__AAA_GTM_ID__
 * in the head script before this file loads. If both are empty the
 * module still records events into window.dataLayer so a future
 * install does not require app code changes.
 */
(function () {
  'use strict';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  var GA4_ID = window.__AAA_GA4_ID__ || '';
  var GTM_ID = window.__AAA_GTM_ID__ || '';

  function injectScript(src) {
    var s = document.createElement('script');
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
    return s;
  }

  // -- GTM loader (preferred when GTM_ID is set) -----------------------------
  function loadGTM(id) {
    if (!id || /^GTM-$/.test(id)) return;
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    injectScript('https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(id));
  }

  // -- GA4 loader (direct, used when no GTM is configured) --------------------
  function loadGA4(id) {
    if (!id || /^G-$/.test(id)) return;
    injectScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id));
    gtag('js', new Date());
    gtag('config', id, {
      send_page_view: true,
      anonymize_ip: true,
      transport_type: 'beacon',
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
  }

  if (GTM_ID) {
    loadGTM(GTM_ID);
  } else if (GA4_ID) {
    loadGA4(GA4_ID);
  }

  // -- Public consent helpers (call from your consent UI) --------------------
  function grantAnalyticsConsent() {
    gtag('consent', 'update', {
      analytics_storage: 'granted',
      functionality_storage: 'granted',
      security_storage: 'granted'
    });
  }
  function denyAnalyticsConsent() {
    gtag('consent', 'update', {
      analytics_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      ad_storage: 'denied'
    });
  }

  // -- Unified track() helper -----------------------------------------------
  // Always pushes GA4-shaped events into dataLayer (so GTM Tag Assistant,
  // preview mode, and server-side GTM all work), and mirrors to gtag() when
  // GA4 is loaded directly.
  function track(eventName, params) {
    params = params || {};
    try { window.dataLayer.push(Object.assign({ event: eventName }, params)); } catch (e) {}
    if (GA4_ID && typeof gtag === 'function') {
      try { gtag('event', eventName, params); } catch (e) {}
    }
  }

  // -- SPA route / hash change tracking --------------------------------------
  var lastPath = location.pathname + location.hash;
  function firePageView(trigger) {
    var path = location.pathname + location.hash;
    track('page_view', {
      page_location: location.href,
      page_path: path,
      page_title: document.title,
      trigger: trigger || 'hashchange'
    });
    lastPath = path;
  }
  window.addEventListener('hashchange', function () {
    if (location.pathname + location.hash !== lastPath) firePageView('hashchange');
  });
  window.addEventListener('popstate', function () { firePageView('popstate'); });

  // -- Outbound / tel / mailto click tracking --------------------------------
  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (!href) return;
    if (/^tel:/i.test(href)) {
      track('click_to_call', { phone_number: href.replace(/^tel:/i, '') });
      return;
    }
    if (/^mailto:/i.test(href)) {
      track('click_to_email', { email: href.replace(/^mailto:/i, '') });
      return;
    }
    try {
      var url = new URL(href, location.href);
      if (url.host && url.host !== location.host) {
        track('outbound_click', { link_url: url.href, link_domain: url.host, link_text: (a.textContent || '').trim().slice(0, 120) });
      }
    } catch (e) { /* ignore bad URLs */ }
  }, { passive: true });

  // -- Scroll-depth milestones -----------------------------------------------
  (function () {
    var fired = {};
    var milestones = [25, 50, 75, 90];
    function onScroll() {
      var h = document.documentElement;
      var scrolled = (h.scrollTop + window.innerHeight) / (h.scrollHeight || 1);
      var pct = Math.round(scrolled * 100);
      for (var i = 0; i < milestones.length; i++) {
        var m = milestones[i];
        if (pct >= m && !fired[m]) {
          fired[m] = true;
          track('scroll_depth', { percent: m });
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  }());

  // -- Video play tracking (Vimeo iframe) ------------------------------------
  function setupVimeoTracking() {
    if (!window.Vimeo || !window.Vimeo.Player) return;
    var iframe = document.getElementById('intro-video');
    if (!iframe) return;
    try {
      var player = new window.Vimeo.Player(iframe);
      var played = false;
      player.on('play', function () {
        if (played) return;
        played = true;
        track('video_play', { video_provider: 'vimeo', video_title: 'Amber intro video' });
      });
      player.on('ended', function () {
        track('video_complete', { video_provider: 'vimeo', video_title: 'Amber intro video' });
      });
    } catch (e) { /* Vimeo player not ready yet */ }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupVimeoTracking);
  } else {
    setupVimeoTracking();
  }

  // -- Public API ------------------------------------------------------------
  window.AAA = window.AAA || {};
  window.AAA.track = track;
  window.AAA.grantAnalyticsConsent = grantAnalyticsConsent;
  window.AAA.denyAnalyticsConsent = denyAnalyticsConsent;

  // Convenience GA4 ecommerce helpers (callers pass product objects with
  // name/price/sku/category fields — see index.html Product schema for shape).
  window.AAA.viewItem = function (item) { track('view_item', { currency: 'USD', value: item && item.price, items: [toGAItem(item)] }); };
  window.AAA.selectItem = function (item, listName) { track('select_item', { item_list_name: listName || 'Homepage', items: [toGAItem(item)] }); };
  window.AAA.viewItemList = function (items, listName) { track('view_item_list', { item_list_name: listName || 'Shop', items: (items || []).map(toGAItem) }); };
  window.AAA.addToCart = function (item, qty) { track('add_to_cart', { currency: 'USD', value: (item && item.price) * (qty || 1), items: [toGAItem(item, qty)] }); };
  window.AAA.removeFromCart = function (item, qty) { track('remove_from_cart', { currency: 'USD', items: [toGAItem(item, qty)] }); };
  window.AAA.beginCheckout = function (cart, total) { track('begin_checkout', { currency: 'USD', value: total, items: (cart || []).map(function (i) { return toGAItem(i, i.quantity); }) }); };
  window.AAA.addPaymentInfo = function (cart, total, method) { track('add_payment_info', { currency: 'USD', value: total, payment_type: method || 'card', items: (cart || []).map(function (i) { return toGAItem(i, i.quantity); }) }); };
  window.AAA.purchase = function (orderId, cart, total) { track('purchase', { transaction_id: orderId, currency: 'USD', value: total, items: (cart || []).map(function (i) { return toGAItem(i, i.quantity); }) }); };
  window.AAA.quizStart = function (quizName) { track('quiz_start', { quiz_name: quizName || 'herbal_advisor' }); };
  window.AAA.quizComplete = function (quizName, recommendation) { track('quiz_complete', { quiz_name: quizName || 'herbal_advisor', recommended_product: recommendation }); };
  window.AAA.builderStart = function (builderName) { track('builder_start', { builder_name: builderName || 'custom_formula' }); };
  window.AAA.builderComplete = function (builderName, selection) { track('builder_complete', { builder_name: builderName || 'custom_formula', selection: selection }); };
  window.AAA.newsletterSignup = function (source) { track('newsletter_signup', { source: source || 'homepage' }); };
  window.AAA.contactFormSubmit = function (source) { track('contact_form_submit', { source: source || 'contact_section' }); };

  function toGAItem(item, qty) {
    if (!item) return {};
    return {
      item_id: item.sku || item.id || item.name,
      item_name: item.name || item.title,
      item_brand: "Amber's Alchemy Apothecary",
      item_category: item.category || 'Herbal Remedy',
      price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || undefined,
      quantity: qty || item.quantity || 1
    };
  }

  // Initial page_view (normal page load) — always fires into dataLayer so
  // both GTM and direct-GA4 installs see it consistently.
  firePageView('initial');
}());
