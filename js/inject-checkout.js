/**
 * inject-checkout.js
 * Drop this ONE script tag at the bottom of your HTML and it does everything.
 *
 * Add this line just before </body> in your index.html:
 *   <script src="/js/inject-checkout.js"></script>
 */
(function() {
  var s = document.createElement('script');
  s.src = '/js/shopify-checkout-bridge.js';
  s.defer = true;
  document.head.appendChild(s);
})();
