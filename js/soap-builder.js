// js/soap-builder.js
// Fixes the 5-step Custom Soap Builder — wires Step 5 "Add to Cart"
// Depends on cart.js being loaded first

(function () {
  'use strict';

  // Builder state
  const state = {
    barType:    null,
    scent:      null,
    benefits:   [],
    botanicals: null,
    color:      null,
  };

  // ── Step navigation helpers ──────────────────────────────────
  function getBuilderEl() {
    return (
      document.getElementById('soap-builder') ||
      document.querySelector('.soap-builder') ||
      document.querySelector('[data-soap-builder]')
    );
  }

  function getCurrentStep() {
    const active = document.querySelector('.soap-step.active, [data-soap-step].active');
    return active ? parseInt(active.dataset.step || active.getAttribute('data-soap-step') || '1') : 1;
  }

  // ── Read selections from the DOM ─────────────────────────────
  function readSelections() {
    const builder = getBuilderEl();
    if (!builder) return;

    // Bar type
    const barTypeEl = builder.querySelector('.selected[data-bar-type], [data-bar-type].selected, input[name="bar-type"]:checked');
    if (barTypeEl) state.barType = barTypeEl.dataset.barType || barTypeEl.value || barTypeEl.textContent.trim();

    // Scent
    const scentEl = builder.querySelector('.selected[data-scent], [data-scent].selected, input[name="scent"]:checked');
    if (scentEl) state.scent = scentEl.dataset.scent || scentEl.value || scentEl.textContent.trim();

    // Benefits
    const benefitEls = builder.querySelectorAll('.selected[data-benefit], [data-benefit].selected, input[name="benefit"]:checked');
    if (benefitEls.length) state.benefits = Array.from(benefitEls).map(el => el.dataset.benefit || el.value || el.textContent.trim());

    // Botanicals + Color (step 4)
    const botanicalEl = builder.querySelector('.selected[data-botanical], [data-botanical].selected, input[name="botanical"]:checked');
    if (botanicalEl) state.botanicals = botanicalEl.dataset.botanical || botanicalEl.value || botanicalEl.textContent.trim();

    const colorEl = builder.querySelector('.selected[data-color], [data-color].selected, input[name="color"]:checked');
    if (colorEl) state.color = colorEl.dataset.color || colorEl.value || colorEl.textContent.trim();
  }

  // ── Render the Step 5 review card ────────────────────────────
  function renderReview() {
    readSelections();
    const reviewEl = document.querySelector('#soap-review, .soap-review, [data-soap-review]');
    if (!reviewEl) return;

    const lines = [
      state.barType    && `<div><strong>Bar Type:</strong> ${state.barType}</div>`,
      state.scent      && `<div><strong>Scent:</strong> ${state.scent}</div>`,
      state.benefits?.length && `<div><strong>Benefits:</strong> ${state.benefits.join(', ')}</div>`,
      state.botanicals && `<div><strong>Botanicals:</strong> ${state.botanicals}</div>`,
      state.color      && `<div><strong>Color:</strong> ${state.color}</div>`,
    ].filter(Boolean);

    reviewEl.innerHTML = lines.length
      ? lines.join('')
      : '<div style="opacity:0.6;">No selections yet — go back and choose your options.</div>';
  }

  // ── Add to Cart ──────────────────────────────────────────────
  function addSoapToCart() {
    readSelections();

    if (!state.barType && !state.scent) {
      alert('Please go back and complete your soap selections first.');
      return;
    }

    const options = {
      'Bar Type':   state.barType   || '—',
      'Scent':      state.scent     || '—',
      'Benefits':   state.benefits?.join(', ') || '—',
      'Botanicals': state.botanicals || '—',
      'Color':      state.color      || '—',
    };

    window.AACart && window.AACart.add({
      id:    'custom-soap-' + Date.now(),
      name:  'Custom Botanical Soap',
      price: 13.99,
      image: '/images/soap-shea-vanilla.png',
      qty:   1,
      options,
    });

    resetBuilder();
  }

  // ── Reset builder to Step 1 ──────────────────────────────────
  function resetBuilder() {
    state.barType = null;
    state.scent = null;
    state.benefits = [];
    state.botanicals = null;
    state.color = null;

    // Remove all .selected classes
    const builder = getBuilderEl();
    if (builder) {
      builder.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
      builder.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(el => el.checked = false);
    }

    // Go to step 1
    goToStep(1);
  }

  // ── Step navigation ──────────────────────────────────────────
  function goToStep(n) {
    document.querySelectorAll('[data-step], [data-soap-step]').forEach(el => {
      const stepNum = parseInt(el.dataset.step || el.dataset.soapStep);
      el.classList.toggle('active', stepNum === n);
      el.style.display = stepNum === n ? '' : 'none';
    });

    // Update progress indicators
    document.querySelectorAll('.step-indicator, [data-step-indicator]').forEach(el => {
      const num = parseInt(el.dataset.stepIndicator || el.dataset.step);
      el.classList.toggle('active', num === n);
      el.classList.toggle('completed', num < n);
    });

    if (n === 5) renderReview();
  }

  // ── Wire up Next/Back/Add-to-Cart buttons ────────────────────
  function wireBuilderButtons() {
    const builder = getBuilderEl();
    if (!builder) return;

    // Next step buttons
    builder.querySelectorAll('[data-next-step], .next-step-btn, .builder-next').forEach(btn => {
      if (btn.dataset.wired) return;
      btn.dataset.wired = 'true';
      btn.addEventListener('click', () => {
        const current = getCurrentStep();
        if (current < 5) goToStep(current + 1);
      });
    });

    // Back buttons
    builder.querySelectorAll('[data-prev-step], .prev-step-btn, .builder-back').forEach(btn => {
      if (btn.dataset.wired) return;
      btn.dataset.wired = 'true';
      btn.addEventListener('click', () => {
        const current = getCurrentStep();
        if (current > 1) goToStep(current - 1);
      });
    });

    // "Add to Cart" button on step 5
    const addToCartBtns = builder.querySelectorAll(
      '[data-soap-add-to-cart], .soap-add-to-cart, #soap-add-to-cart'
    );
    addToCartBtns.forEach(btn => {
      if (btn.dataset.wired) return;
      btn.dataset.wired = 'true';
      btn.addEventListener('click', addSoapToCart);
    });

    // Also catch any button in the builder that says "Add to Cart"
    builder.querySelectorAll('button').forEach(btn => {
      if (btn.dataset.wired) return;
      const text = btn.textContent.trim();
      if (text.includes('Add to Cart') || text.includes('Add to cart')) {
        btn.dataset.wired = 'true';
        btn.addEventListener('click', addSoapToCart);
      }
      if (text.includes('Start New') || text.includes('Reset')) {
        btn.dataset.wired = 'true';
        btn.addEventListener('click', resetBuilder);
      }
    });

    // Selection cards — add .selected on click
    builder.querySelectorAll('[data-bar-type], [data-scent], [data-benefit], [data-botanical], [data-color]').forEach(card => {
      if (card.dataset.wired) return;
      card.dataset.wired = 'true';
      card.addEventListener('click', () => {
        const type = Object.keys(card.dataset).find(k =>
          ['barType','scent','benefit','botanical','color'].includes(k)
        );
        if (!type) return;

        // For single-select types, deselect siblings
        if (type !== 'benefit') {
          builder.querySelectorAll(`[data-${type.replace(/([A-Z])/g, '-$1').toLowerCase()}]`)
            .forEach(el => el.classList.remove('selected'));
        }
        card.classList.toggle('selected');
      });
    });
  }

  // ── Init ────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    wireBuilderButtons();

    // Watch for dynamic DOM changes (builder might render after load)
    const observer = new MutationObserver(() => wireBuilderButtons());
    observer.observe(document.body, { childList: true, subtree: true });
  });

})();
