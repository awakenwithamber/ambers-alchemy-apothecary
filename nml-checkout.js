/**
 * NML EMBEDDED CHECKOUT INTEGRATION
 * 
 * The Grimior / Real Magic — $7.77/month subscription
 * Using NML (Net Modularity Language) for secure, embedded checkout
 * 
 * No redirects. No external payment processors.
 * Everything happens on-page via NML iframe.
 */

(function () {
  'use strict';

  const GRIMIOR_CONFIG = {
    productName: 'The Grimior / Real Magic',
    productSku: 'grimior-777',
    price: 7.77, // $7.77/month
    currency: 'USD',
    billingCycle: 'monthly',
    benefits: [
      '12 healing ritual chapters',
      '10% off every order',
      'Free shipping on $50+',
      'Monthly promo code',
      'Exclusive subscriber content'
    ]
  };

  window.GrimiorCheckout = {
    config: GRIMIOR_CONFIG,
    
    /**
     * Initialize NML embedded checkout
     * @param {string} containerId - Element ID for checkout iframe
     * @param {object} options - Optional config overrides
     */
    init: function (containerId, options) {
      const container = document.getElementById(containerId);
      if (!container) {
        console.warn('[GrimiorCheckout] Container not found:', containerId);
        return;
      }

      const config = Object.assign({}, GRIMIOR_CONFIG, options);

      // Create NML checkout iframe
      const iframe = document.createElement('iframe');
      iframe.title = 'Grimior Subscription Checkout';
      iframe.className = 'nml-checkout-iframe';
      iframe.style.cssText = 'width: 100%; height: 600px; border: none; border-radius: 12px;';
      
      // NML embedded checkout URL format
      const checkoutUrl = this._buildCheckoutUrl(config);
      iframe.src = checkoutUrl;
      
      container.appendChild(iframe);
      
      // Listen for NML postMessage events
      window.addEventListener('message', (e) => {
        if (e.origin !== window.location.origin) return;
        
        if (e.data.type === 'nml:payment-complete') {
          this._onPaymentComplete(e.data);
        } else if (e.data.type === 'nml:payment-error') {
          this._onPaymentError(e.data);
        }
      });

      return iframe;
    },

    /**
     * Build NML checkout URL
     * @private
     */
    _buildCheckoutUrl: function (config) {
      const params = new URLSearchParams({
        product: config.productSku,
        name: config.productName,
        price: (config.price * 100).toString(), // Convert to cents
        currency: config.currency,
        billingCycle: config.billingCycle,
        successUrl: window.location.href + '?grimior=success',
        cancelUrl: window.location.href + '?grimior=canceled',
        embedded: 'true'
      });

      return `/.netlify/functions/nml-checkout?${params.toString()}`;
    },

    /**
     * Handle successful payment
     * @private
     */
    _onPaymentComplete: function (data) {
      console.log('[GrimiorCheckout] Payment complete:', data);
      
      // Store subscription info in localStorage
      localStorage.setItem('grimior_subscriber', JSON.stringify({
        email: data.email,
        subscriptionId: data.subscriptionId,
        status: 'active',
        activatedAt: new Date().toISOString()
      }));

      // Emit custom event
      window.dispatchEvent(new CustomEvent('grimior:subscribed', { detail: data }));

      // Show success message
      alert(`Welcome to the Grimior! Check your email at ${data.email} for access.`);
      
      // Reload or redirect
      window.location.reload();
    },

    /**
     * Handle payment error
     * @private
     */
    _onPaymentError: function (data) {
      console.error('[GrimiorCheckout] Payment error:', data);
      alert(`Payment failed: ${data.message}`);
      window.dispatchEvent(new CustomEvent('grimior:error', { detail: data }));
    },

    /**
     * Check if user is an active Grimior subscriber
     * @param {string} email - Subscriber email
     * @returns {Promise<boolean>}
     */
    isSubscriber: async function (email) {
      try {
        const response = await fetch('/.netlify/functions/grimior-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        
        if (!response.ok) return false;
        
        const data = await response.json();
        return data.isSubscriber === true && data.status === 'active';
      } catch (err) {
        console.error('[GrimiorCheckout] Check failed:', err);
        return false;
      }
    },

    /**
     * Get subscriber benefits list
     * @returns {array}
     */
    getBenefits: function () {
      return GRIMIOR_CONFIG.benefits;
    }
  };

  // Auto-handle ?grimior=success query param
  const params = new URLSearchParams(window.location.search);
  if (params.get('grimior') === 'success') {
    window.dispatchEvent(new CustomEvent('grimior:urlsuccess'));
  }
})();
