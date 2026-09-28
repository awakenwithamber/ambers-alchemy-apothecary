// js/cart.js
// Legacy compatibility shim. The site previously ran two carts: this file's
// localStorage "AACart" (with its own 8%-tax drawer and a 12.99 fallback
// price auto-wired onto every "Add to Cart" button) and the main cart in
// app.js. That double-added items and showed conflicting totals.
//
// app.js now owns the one canonical cart. This shim keeps the old
// window.AACart API working by forwarding into it. Prices passed here are
// display-only — the server (lib/catalog.js) prices every order.

(function () {
  'use strict';

  function items() {
    return typeof window.getCartItems === 'function' ? window.getCartItems() : [];
  }

  window.AACart = {
    add(item) {
      if (!item || typeof window.addItemToCart !== 'function') return;
      window.addItemToCart({ name: item.name, price: item.price, qty: item.qty || 1 });
    },
    remove(index) {
      if (typeof window.removeCartItem === 'function') window.removeCartItem(index);
    },
    clear() {
      if (typeof window.clearCart === 'function') window.clearCart();
    },
    getItems: items,
    getTotal() {
      return items().reduce((sum, i) => sum + (Number(i.price) || 0) * i.qty, 0);
    },
  };
})();
