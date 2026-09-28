// js/form-handlers.js
// Generic fallback wiring for forms marked up as real <form> elements.
// Posts to /api/form-submit (netlify/functions/form-submit.mjs), which saves
// the submission in the database and notifies Amber. The homepage contact,
// consultation, soap and newsletter forms are bound in app.js; buttons that
// app.js already handles are skipped here so nothing is sent twice.

(function () {
  'use strict';

  const RELAY_URL = '/api/form-submit';
  const APP_BOUND = ['contactSubmitBtn', 'formulaSubmitBtn', 'soapSubmitBtn', 'nlSubmitBtn'];

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

      // Require the function's JSON reply, so an HTML page is never mistaken for success.
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.ok) throw new Error(result.error || `HTTP ${res.status}`);

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
    if (!form || !btn || btn.dataset.wired || APP_BOUND.includes(btn.id)) return;

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
    if (!form || !btn || btn.dataset.wired || APP_BOUND.includes(btn.id)) return;

    btn.dataset.wired = 'true';
    btn.dataset.originalText = btn.innerHTML;

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const data = getFormData(form);
      const ok = await submitForm('consultation', data, btn,
        '✦ Consultation request received! Amber will reply by email.');
      if (ok) form.reset();
    });
  }

  // ── Custom Soap Order Form ───────────────────────────────────
  function wireSoapOrderForm() {
    const form = document.querySelector('#soap-order-form, [data-form="soap-order"], form[id*="soap"]');
    const btn  = form?.querySelector('button[type="submit"], [data-submit], .form-submit');
    if (!form || !btn || btn.dataset.wired || APP_BOUND.includes(btn.id)) return;

    btn.dataset.wired = 'true';
    btn.dataset.originalText = btn.innerHTML;

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const data = getFormData(form);
      const ok = await submitForm('soap', data, btn,
        '✦ Custom soap request received! Amber will confirm details by email before crafting your bar.');
      if (ok) form.reset();
    });
  }

  // Orders (card, Cash App, Venmo) go only through #checkoutForm in app.js
  // and /api/checkout, which stores them in the database. No form here
  // creates orders or claims a confirmation email was sent.

  // ── Email Capture (Free Guide) ───────────────────────────────
  function wireEmailCapture() {
    document.querySelectorAll('form[id*="email"], form[id*="guide"], [data-form="email-capture"]').forEach(form => {
      const btn = form.querySelector('button[type="submit"], [data-submit]');
      if (!btn || btn.dataset.wired || APP_BOUND.includes(btn.id)) return;
      btn.dataset.wired = 'true';

      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const emailEl = form.querySelector('input[type="email"], input[name="email"]');
        if (!emailEl?.value) {
          emailEl?.focus();
          return;
        }
        await submitForm('guide', {
          name: 'Guide Request',
          email: emailEl.value,
          subject: 'Free Herbal Guide Request',
          message: 'User requested the free Beginner\'s Guide to Herbal Healing.',
        }, btn, '✦ Thank you! Amber will email you the free guide.');
        form.reset();
      });
    });
  }

  // ── Init ────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    wireContactForm();
    wireConsultationForm();
    wireSoapOrderForm();
    wireEmailCapture();

    // Re-wire after dynamic loads
    setTimeout(() => {
      wireContactForm();
      wireConsultationForm();
      wireSoapOrderForm();
      }, 1500);
  });

})();
