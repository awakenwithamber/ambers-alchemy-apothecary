// js/cart.js
// Global cart system for Awaken Again
// Handles all Add to Cart actions, cart drawer, and Shopify checkout

(function () {
  'use strict';

  // ── Cart State ──────────────────────────────────────────────
  let cart = JSON.parse(localStorage.getItem('aa_cart') || '[]');

  function saveCart() {
    localStorage.setItem('aa_cart', JSON.stringify(cart));
  }

  function getTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  // ── Add Item ────────────────────────────────────────────────
  window.AACart = {
    add(item) {
      // item: { id, name, price, qty, image, options }
      const existing = cart.find((c) => c.id === item.id &&
        JSON.stringify(c.options) === JSON.stringify(item.options));
      if (existing) {
        existing.qty += item.qty || 1;
      } else {
        cart.push({ ...item, qty: item.qty || 1 });
      }
      saveCart();
      updateBadge();
      renderDrawer();
      showToast(`${item.name} added to your jar ✦`);
    },

    remove(index) {
      cart.splice(index, 1);
      saveCart();
      updateBadge();
      renderDrawer();
    },

    clear() {
      cart = [];
      saveCart();
      updateBadge();
      renderDrawer();
    },

    getItems() { return cart; },
    getTotal,
  };

  // ── Badge ───────────────────────────────────────────────────
  function updateBadge() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('.cart-badge, [data-cart-count]').forEach((el) => {
      el.textContent = count;
    });
    // Update nav text like "🛒 Cart (0)"
    document.querySelectorAll('.cart-nav-label').forEach((el) => {
      el.textContent = `🛒 Cart (${count})`;
    });
  }

  // ── Toast ───────────────────────────────────────────────────
  function showToast(message) {
    let toast = document.getElementById('aa-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'aa-toast';
      toast.style.cssText = `
        position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
        background: #2a1a0a; color: #d4af6a; border: 1px solid #d4af6a;
        padding: 12px 28px; border-radius: 30px; font-family: inherit;
        font-size: 14px; letter-spacing: 0.05em; z-index: 9999;
        opacity: 0; transition: opacity 0.3s ease; pointer-events: none;
        white-space: nowrap;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
  }

  // ── Drawer Render ───────────────────────────────────────────
  function renderDrawer() {
    const drawer = document.getElementById('cart-drawer') ||
                   document.querySelector('.cart-drawer');
    if (!drawer) return;

    const itemsContainer = drawer.querySelector('.cart-items') ||
                           drawer.querySelector('#cart-items');
    const totalEl = drawer.querySelector('.cart-total') ||
                    drawer.querySelector('#cart-total');

    if (itemsContainer) {
      if (cart.length === 0) {
        itemsContainer.innerHTML = '<p style="text-align:center;opacity:0.6;padding:24px 0;">Your jar is empty.</p>';
      } else {
        itemsContainer.innerHTML = cart.map((item, i) => `
          <div class="cart-item" style="display:flex;justify-content:space-between;align-items:flex-start;padding:12px 0;border-bottom:1px solid rgba(212,175,106,0.15);">
            <div style="flex:1;">
              <div style="font-weight:600;font-size:14px;">${item.name}</div>
              ${item.options ? renderOptions(item.options) : ''}
              <div style="font-size:12px;opacity:0.6;margin-top:4px;">Qty: ${item.qty}</div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">
              <div style="font-size:14px;">$${(item.price * item.qty).toFixed(2)}</div>
              <button onclick="AACart.remove(${i})" style="background:none;border:none;color:#d4af6a;cursor:pointer;font-size:11px;opacity:0.7;">remove</button>
            </div>
          </div>
        `).join('');
      }
    }

    if (totalEl) {
      const subtotal = getTotal();
      const tax = subtotal * 0.08;
      const shipping = subtotal >= 75 ? 0 : (subtotal > 0 ? 6.99 : 0);
      totalEl.innerHTML = `
        <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;opacity:0.8;"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;opacity:0.8;"><span>Shipping</span><span>${shipping === 0 && subtotal > 0 ? 'Free' : '$' + shipping.toFixed(2)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;opacity:0.8;"><span>Tax (8%)</span><span>$${tax.toFixed(2)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:12px 0;font-size:16px;font-weight:700;border-top:1px solid rgba(212,175,106,0.3);margin-top:8px;"><span>Total</span><span>$${(subtotal + tax + shipping).toFixed(2)}</span></div>
      `;
    }
  }

  function renderOptions(options) {
    return Object.entries(options)
      .filter(([, v]) => v)
      .map(([k, v]) => `<div style="font-size:11px;opacity:0.6;text-transform:capitalize;">${k}: ${v}</div>`)
      .join('');
  }

  // ── Wire existing "Add to Cart" buttons ─────────────────────
  function wireProductButtons() {
    document.querySelectorAll('[data-add-to-cart]').forEach((btn) => {
      if (btn.dataset.wired) return;
      btn.dataset.wired = 'true';
      btn.addEventListener('click', () => {
        const card = btn.closest('[data-product]') || btn.closest('.product-card') || btn.parentElement;
        const name  = card.dataset.name  || card.querySelector('h3, h4')?.textContent?.trim() || 'Remedy';
        const price = parseFloat(card.dataset.price || btn.dataset.price || '12.99');
        const id    = card.dataset.id || name.toLowerCase().replace(/\s+/g, '-');
        const image = card.querySelector('img')?.src || '';
        AACart.add({ id, name, price, image, qty: 1 });
      });
    });

    // Also catch any button whose text includes "Add to Cart"
    document.querySelectorAll('button, a').forEach((btn) => {
      if (btn.dataset.wired) return;
      if (btn.textContent.includes('Add to Cart') || btn.textContent.includes('Add to cart')) {
        btn.dataset.wired = 'true';
        btn.addEventListener('click', (e) => {
          const card = btn.closest('[data-product]') || btn.closest('.product-card') ||
                       btn.closest('.soap-card') || btn.closest('article') || btn.parentElement;
          const name  = card.dataset.name  || card.querySelector('h3, h4')?.textContent?.trim() || 'Item';
          const price = parseFloat(card.dataset.price || '12.99');
          const id    = card.dataset.id || name.toLowerCase().replace(/\s+/g, '-');
          const image = card.querySelector('img')?.src || '';
          AACart.add({ id, name, price, image, qty: 1 });
        });
      }
    });
  }

  // ── Init ────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    updateBadge();
    renderDrawer();
    wireProductButtons();

    // Re-wire after any dynamic content loads
    const observer = new MutationObserver(() => {
      wireProductButtons();
      updateBadge();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });

})();
