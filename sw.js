// ============================================================
// SERVICE WORKER — Amber's Alchemy Apothecary
// Stale-while-revalidate for static assets, network-first for pages
// ============================================================

var CACHE_NAME = 'alchemy-v2-pricing';
var STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/data.js',
  '/botanical-cards.css',
  '/grimoire-seo.css',
  '/herbal-advisor.css',
  '/navigation-history.js',
  '/images/icon-192.png',
  '/images/icon-512.png'
];

// Never cache these patterns
var NEVER_CACHE = [
  '/api/',
  'stripe.com',
  'venmo.com',
  'cash.app',
  'checkout',
  'payment',
  'create-payment-intent'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS).catch(function() {
        // If some assets fail, still install
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) { return name !== CACHE_NAME; })
          .map(function(name) { return caches.delete(name); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  // Never cache payment/sensitive requests
  for (var i = 0; i < NEVER_CACHE.length; i++) {
    if (url.indexOf(NEVER_CACHE[i]) !== -1) {
      e.respondWith(fetch(e.request));
      return;
    }
  }

  // Skip non-GET
  if (e.request.method !== 'GET') return;

  // HTML pages: network-first
  if (e.request.headers.get('accept') && e.request.headers.get('accept').indexOf('text/html') !== -1) {
    e.respondWith(
      fetch(e.request).then(function(response) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put(e.request, clone); });
        return response;
      }).catch(function() {
        return caches.match(e.request).then(function(cached) {
          return cached || caches.match('/offline.html');
        });
      })
    );
    return;
  }

  // Static assets: stale-while-revalidate
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      var fetchPromise = fetch(e.request).then(function(response) {
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) { cache.put(e.request, clone); });
        }
        return response;
      }).catch(function() { return cached; });

      return cached || fetchPromise;
    })
  );
});
