// js/form-handlers.js
// Wires all site forms to POST to /.netlify/functions/form-relay
// which forwards to the correct Zapier webhook

(function () {
  'use strict';

  const RELAY_URL = '/.netlify/functions/form-relay';

  // ── Generic form submitter ───────────────────────────────────
  async function submitForm(formType, data, btn, successMessage) {
    const originalText = btn.innerHTML;
    btn.innerHTML = '✦ Sending...';
    btn.disabled = true;

    try {
      const res = await fetch(RELAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formType, ...data }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      showSuccess(btn, successMessage);
      return true;
    } catch (err) {
      console.error('Form submission error:', err);
      btn.innerHTML = originalText;
      btn.disabled = false;
      showError(btn);
      return false;
    }
  }

  function showSuccess(btn, message) {
    const el = document.createElement('div');
    el.style.cssText = `
      color: #4a7c59; background: rgba(74,124,89,0.1);
      border: 1px solid rgba(74,124,89,0.3); border-radius: 8px;
      padding: 14px 20px; margin-top: 16px; font-size: 14px;
      text-align: center; letter-spacing: 0.03em;
    `;
    el.textContent = message;
    btn.parentElement.appendChild(el);
    btn.style.display = 'none';
    setTimeout(() => {
      el.remove();
      btn.style.display = '';
      btn.innerHTML = btn.dataset.originalText || '✦ Submit';
      btn.disabled = false;
    }, 6000);
  }

  function showError(btn) {
    let el = btn.parentElement.querySelector('.form-error');
    if (!el) {
      el = document.createElement('div');
      el.className = 'form-error';
      el.style.cssText = `
        color: #c0392b; font-size: 13px; margin-top: 12px; text-align: center;
      `;
      btn.parentElement.appendChild(el);
    }
    el.innerHTML = 'Something went wrong — please email <a href="mailto:awaken@consultant.com">awaken@consultant.com</a> directly.';
    setTimeout(() => { el.textContent = ''; }, 8000);
  }

  // ── Skip honeypot fields ─────────────────────────────────────
  function getFormData(form) {
    const data = {};
    form.querySelectorAll('input, select, textarea').forEach(el => {
      if (!el.name) return;
      // Skip honeypot fields
      const label = form.querySelector(`label[for="${el.id}"]`)?.textContent || '';
      const wrapper = el.closest('p, div, label');
      const wrapperText = wrapper?.textContent || '';
      if (wrapperText.toLowerCase().includes("don't fill") ||
          wrapperText.toLowerCase().includes("do not fill") ||
          el.dataset.honeypot) return;

      if (el.type === 'checkbox') {
        if (el.checked) {
          data[el.name] = data[el.name]
            ? data[el.name] + ', ' + el.value
            : el.value;
        }
      } else {
        data[el.name] = el.value;
      }
    });
    return data;
  }

  // ── Contact Form ─────────────────────────────────────────────
  function wireContactForm() {
    const form = document.querySelector('#contact-form, [data-form="contact"], form[id*="contact"]');
    const btn  = form?.querySelector('button[type="submit"], [data-submit], .form-submit');
    if (!form || !btn || btn.dataset.wired) return;

    btn.dataset.wired = 'true';
    btn.dataset.originalText = btn.innerHTML;

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const data = getFormData(form);
      const ok = await submitForm('contact', data, btn,
        '✦ Message received! Amber will reply within 1–2 business days.');
      if (ok) form.reset();
    });
  }

  // ── Herbal Consultation Form ─────────────────────────────────
  function wireConsultationForm() {
    const form = document.querySelector('#consultation-form, [data-form="consultation"], form[id*="consult"]');
    const btn  = form?.querySelector('button[type="submit"], [data-submit], .form-submit');
    if (!form || !btn || btn.dataset.wired) return;

    btn.dataset.wired = 'true';
    btn.dataset.originalText = btn.innerHTML;

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const data = getFormData(form);
      const ok = await submitForm('consultation', data, btn,
        '✦ Consultation request sent! Amber will respond within 24–48 hours with your personalized formula.');
      if (ok) form.reset();
    });
  }

  // ── Custom Soap Order Form ───────────────────────────────────
  function wireSoapOrderForm() {
    const form = document.querySelector('#soap-order-form, [data-form="soap-order"], form[id*="soap"]');
    const btn  = form?.querySelector('button[type="submit"], [data-submit], .form-submit');
    if (!form || !btn || btn.dataset.wired) return;

    btn.dataset.wired = 'true';
    btn.dataset.originalText = btn.innerHTML;

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const data = getFormData(form);
      const ok = await submitForm('soap-order', data, btn,
        '✦ Custom soap order received! Amber will confirm details before crafting your bar. Ships within 7–10 business days.');
      if (ok) form.reset();
    });
  }

  // ── Checkout Manual Order Form (Cash App / Venmo) ───────────
  function wireOrderForm() {
    const form = document.querySelector('#checkout-form, [data-form="order"], form[id*="checkout"]');
    const btn  = form?.querySelector('button[type="submit"], [data-submit], .form-submit');
    if (!form || !btn || btn.dataset.wired) return;

    btn.dataset.wired = 'true';
    btn.dataset.originalText = btn.innerHTML;

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const data = getFormData(form);

      // Attach cart contents
      if (window.AACart) {
        data.cartItems = AACart.getItems();
        data.orderTotal = AACart.getTotal().toFixed(2);
      }

      const ok = await submitForm('order', data, btn,
        '✦ Order received! Amber will begin preparing your items. Confirmation sent to your email.');
      if (ok) {
        form.reset();
        // Show the thank-you section if it exists
        const thankYou = document.querySelector('#order-thank-you, .order-thank-you');
        if (thankYou) thankYou.style.display = '';
        // Clear cart
        window.AACart && AACart.clear();
      }
    });
  }

  // ── Email Capture (Free Guide) ───────────────────────────────
  function wireEmailCapture() {
    document.querySelectorAll('form[id*="email"], form[id*="guide"], [data-form="email-capture"]').forEach(form => {
      const btn = form.querySelector('button[type="submit"], [data-submit]');
      if (!btn || btn.dataset.wired) return;
      btn.dataset.wired = 'true';

      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const emailEl = form.querySelector('input[type="email"], input[name="email"]');
        if (!emailEl?.value) {
          emailEl?.focus();
          return;
        }
        await submitForm('contact', {
          name: 'Guide Request',
          email: emailEl.value,
          subject: 'Free Herbal Guide Request',
          message: 'User requested the free Beginner\'s Guide to Herbal Healing.',
        }, btn, '✦ Your guide is on its way! Check your inbox.');
        form.reset();
      });
    });
  }

  // ── Init ────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    wireContactForm();
    wireConsultationForm();
    wireSoapOrderForm();
    wireOrderForm();
    wireEmailCapture();

    // Re-wire after dynamic loads
    setTimeout(() => {
      wireContactForm();
      wireConsultationForm();
      wireSoapOrderForm();
      wireOrderForm();
    }, 1500);
  });

})();
