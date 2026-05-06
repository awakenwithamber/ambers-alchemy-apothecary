// js/shopify-checkout.js
// Calls /.netlify/functions/shopify-checkout (server-side proxy)
// so no API tokens are ever exposed on the frontend.

(function () {
  'use strict';

  const CHECKOUT_FUNCTION = '/.netlify/functions/shopify-checkout';

  // ── Wire the Shopify checkout button ────────────────────────
  function wireShopifyButton() {
    // Find by data attribute, class, or text content
    const candidates = [
      ...document.querySelectorAll('[data-shopify-checkout]'),
      ...document.querySelectorAll('.shopify-checkout-btn'),
      ...document.querySelectorAll('#shopify-checkout-btn'),
      ...Array.from(document.querySelectorAll('button, a')).filter(el =>
        el.textContent.includes('Shopify') &&
        (el.textContent.includes('Pay') || el.textContent.includes('Checkout') || el.textContent.includes('Secure'))
      ),
    ];

    candidates.forEach(btn => {
      if (btn.dataset.shopifyWired) return;
      btn.dataset.shopifyWired = 'true';

      btn.addEventListener('click', async (e) => {
        e.preventDefault();

        const cartItems = window.AACart ? window.AACart.getItems() : [];
        if (!cartItems.length) {
          alert('Your cart is empty — add some remedies first!');
          return;
        }

        // Loading state
        const original = btn.innerHTML;
        btn.innerHTML = '✦ Opening secure checkout...';
        btn.disabled  = true;

        try {
          const res = await fetch(CHECKOUT_FUNCTION, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: cartItems.map(item => ({
                id:      item.id,
                handle:  item.handle || null,
                name:    item.name,
                qty:     item.qty,
                options: item.options || null,
              })),
              note: cartItems
                .filter(i => i.options)
                .map(i => `${i.name}: ${Object.entries(i.options).map(([k,v])=>`${k}=${v}`).join(', ')}`)
                .join(' | '),
            }),
          });

          const data = await res.json();

          if (data.url) {
            window.location.href = data.url;
          } else {
            throw new Error(data.error || 'No checkout URL returned');
          }

        } catch (err) {
          console.error('Shopify checkout error:', err);
          btn.innerHTML = original;
          btn.disabled  = false;
          showCheckoutError(btn, err.message);
        }
      });
    });
  }

  function showCheckoutError(nearEl, msg) {
    let el = document.getElementById('shopify-error-msg');
    if (!el) {
      el = document.createElement('div');
      el.id = 'shopify-error-msg';
      el.style.cssText = `
        color: #c0392b; font-size: 13px; margin-top: 12px;
        text-align: center; padding: 8px 16px;
        border: 1px solid rgba(192,57,43,0.3); border-radius: 6px;
      `;
      nearEl.parentElement?.appendChild(el);
    }
    el.textContent = 'Secure checkout is temporarily unavailable — please use Cash App or Venmo below.';
    console.error('Checkout error detail:', msg);
    setTimeout(() => { if (el) el.textContent = ''; }, 8000);
  }

  // ── Init ────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    wireShopifyButton();
    // Re-wire if cart drawer renders buttons dynamically
    const observer = new MutationObserver(wireShopifyButton);
    observer.observe(document.body, { childList: true, subtree: true });
  });

})();
