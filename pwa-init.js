// ============================================================
// PWA INITIALIZATION + LAZY LOADING + PERFORMANCE
// ============================================================

(function() {
  'use strict';

  // --- SERVICE WORKER REGISTRATION ---
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').catch(function() {});
    });
  }

  // --- LAZY LOADING FOR IMAGES ---
  if ('IntersectionObserver' in window) {
    var imgObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          imgObserver.unobserve(img);
        }
      });
    }, { rootMargin: '200px 0px' });

    // Observe images with data-src
    document.querySelectorAll('img[data-src]').forEach(function(img) {
      imgObserver.observe(img);
    });

    // Also observe dynamically added images
    var mutObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) {
            if (node.tagName === 'IMG' && node.dataset.src) {
              imgObserver.observe(node);
            }
            node.querySelectorAll && node.querySelectorAll('img[data-src]').forEach(function(img) {
              imgObserver.observe(img);
            });
          }
        });
      });
    });
    mutObserver.observe(document.body, { childList: true, subtree: true });
  }

  // --- STANDALONE MODE ADJUSTMENTS ---
  if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
    document.documentElement.classList.add('pwa-standalone');
  }

})();
