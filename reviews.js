/*
 * Reviews — Amber's Alchemy Apothecary
 *
 * Renders and submits on-site reviews for products, soaps, bundles, and the
 * overall website experience. Loads real data from the /api/reviews endpoint,
 * honors "verified buyer" / "repeat customer" flags set server-side from real
 * order data, and provides an admin dashboard (behind a token prompt) for
 * moderation, featuring, responses, and CSV export.
 *
 * All visible review content originates from the server. We never fabricate,
 * seed, or hardcode reviews — when no reviews exist, we show an honest empty
 * state inviting real customers to be the first to share.
 */
(function () {
  'use strict';

  const API = '/api/reviews';
  // Fallback points users to Google Maps search for the business, which surfaces
  // a "Write a review" button once the Google Business Profile is claimed.
  // As soon as a Place ID is set on <meta name="google-place-id">, we upgrade
  // to the direct write-review link.
  const GOOGLE_SEARCH_FALLBACK = 'https://www.google.com/maps/search/?api=1&query=Awaken%20With%20Amber%20LLC%20Apothecary';
  const state = {
    cache: new Map(), // key -> { reviews, stats, total, fetchedAt }
    lastGoogleLink: null,
  };

  /* ---------- helpers ---------- */

  function googleReviewLink() {
    if (state.lastGoogleLink) return state.lastGoogleLink;
    const meta = document.querySelector('meta[name="google-place-id"]');
    const placeId = meta?.content?.trim();
    state.lastGoogleLink = placeId
      ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`
      : GOOGLE_SEARCH_FALLBACK;
    return state.lastGoogleLink;
  }

  function starSpan(rating, size) {
    const full = Math.round(rating);
    const stars = '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
    return `<span class="rv-stars ${size ? 'rv-stars-' + size : ''}" aria-label="${rating} out of 5 stars" role="img">${stars}</span>`;
  }

  function formatDate(iso) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  }

  function escape(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function cacheKey({ type, targetId, sort, verified }) {
    return [type || '*', targetId || '*', sort || 'recent', verified ? 'v' : 'a'].join('|');
  }

  async function loadReviews(params = {}) {
    const key = cacheKey(params);
    const cached = state.cache.get(key);
    if (cached && Date.now() - cached.fetchedAt < 30000) return cached.data;
    const qs = new URLSearchParams();
    if (params.type) qs.set('type', params.type);
    if (params.targetId) qs.set('targetId', params.targetId);
    if (params.sort) qs.set('sort', params.sort);
    if (params.verified) qs.set('verified', 'true');
    if (params.limit) qs.set('limit', params.limit);
    const res = await fetch(`${API}?${qs.toString()}`);
    const data = await res.json();
    if (data.ok) state.cache.set(key, { data, fetchedAt: Date.now() });
    return data;
  }

  function invalidateCache() { state.cache.clear(); }

  /* ---------- rendering ---------- */

  function renderReviewCard(r) {
    const badges = [];
    if (r.verifiedBuyer) badges.push('<span class="rv-badge rv-badge-verified" title="Verified from a real order">✦ Verified Buyer</span>');
    if (r.repeatCustomer) badges.push('<span class="rv-badge rv-badge-repeat">Returning Customer</span>');
    if (r.featured) badges.push('<span class="rv-badge rv-badge-featured">Featured</span>');
    const usage = r.usageDuration ? `<span class="rv-meta-dot">·</span><span class="rv-usage">Used for ${escape(r.usageDuration)}</span>` : '';
    const photo = r.photoUrl ? `<img class="rv-photo" src="${escape(r.photoUrl)}" alt="Customer photo" loading="lazy" />` : '';
    const response = r.response
      ? `<div class="rv-response"><div class="rv-response-label">✦ Response from Amber</div><p>${escape(r.response)}</p></div>`
      : '';
    return `
      <article class="rv-card" data-id="${escape(r.id)}">
        <header class="rv-card-head">
          <div class="rv-card-head-left">
            ${starSpan(r.rating)}
            <h4 class="rv-title">${escape(r.title || '')}</h4>
          </div>
          <span class="rv-date">${formatDate(r.createdAt)}</span>
        </header>
        <div class="rv-author-row">
          <span class="rv-author">${escape(r.displayName)}</span>
          ${usage}
          ${badges.length ? `<span class="rv-badges">${badges.join('')}</span>` : ''}
        </div>
        ${r.targetName ? `<div class="rv-target">on <em>${escape(r.targetName)}</em></div>` : ''}
        <p class="rv-body">${escape(r.body)}</p>
        ${photo}
        ${response}
        <footer class="rv-card-foot">
          <button type="button" class="rv-helpful-btn" data-review-helpful="${escape(r.id)}">
            <span class="rv-helpful-icon">✦</span>
            <span class="rv-helpful-label">Helpful</span>
            <span class="rv-helpful-count">${r.helpful || 0}</span>
          </button>
        </footer>
      </article>
    `;
  }

  function renderStatsHeader(stats) {
    if (!stats || !stats.total) {
      return `
        <div class="rv-stats rv-stats-empty">
          <p class="rv-empty-note">No reviews yet. Be among the first to share an honest experience — your words may guide another seeker.</p>
        </div>
      `;
    }
    const bars = [5, 4, 3, 2, 1].map((n) => {
      const count = stats.breakdown?.[n] || 0;
      const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
      return `
        <div class="rv-bar-row">
          <span class="rv-bar-label">${n}★</span>
          <span class="rv-bar-track"><span class="rv-bar-fill" style="width:${pct}%"></span></span>
          <span class="rv-bar-count">${count}</span>
        </div>
      `;
    }).join('');
    return `
      <div class="rv-stats">
        <div class="rv-stats-main">
          <div class="rv-avg">${stats.average.toFixed(1)}</div>
          <div class="rv-stats-meta">
            ${starSpan(stats.average, 'lg')}
            <div class="rv-stats-count">${stats.total} ${stats.total === 1 ? 'review' : 'reviews'}${stats.verifiedCount ? ` · ${stats.verifiedCount} verified` : ''}</div>
          </div>
        </div>
        <div class="rv-bars">${bars}</div>
      </div>
    `;
  }

  function renderSortBar({ sort, verifiedOnly }) {
    const options = [
      ['recent', 'Most Recent'],
      ['highest', 'Highest Rated'],
      ['helpful', 'Most Helpful'],
      ['verified', 'Verified Buyers'],
    ];
    return `
      <div class="rv-sort-bar">
        <label class="rv-sort-label">Sort
          <select class="rv-sort">
            ${options.map(([v, l]) => `<option value="${v}" ${sort === v ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </label>
        <label class="rv-verified-toggle">
          <input type="checkbox" class="rv-verified" ${verifiedOnly ? 'checked' : ''} />
          <span>Verified buyers only</span>
        </label>
      </div>
    `;
  }

  /* ---------- public mounting ---------- */

  async function mountReviews(el, opts = {}) {
    if (!el || el.dataset.rvMounted === '1') return;
    el.dataset.rvMounted = '1';
    const { type = 'product', targetId = null, targetName = null, compact = false, showForm = true, ctaHint = null } = opts;

    let sort = el.dataset.rvSort || 'recent';
    let verifiedOnly = false;

    const render = async () => {
      const data = await loadReviews({ type, targetId, sort, verified: verifiedOnly });
      const stats = data.stats || {};
      const reviews = data.reviews || [];
      const ctaRow = showForm
        ? `<div class="rv-cta-row">
             <button type="button" class="rv-open-form btn-primary">✦ Write a Review</button>
             <a class="rv-google-link" href="${escape(googleReviewLink())}" target="_blank" rel="noopener">Leave a Review on Google ↗</a>
           </div>`
        : '';
      const sortBar = reviews.length > 1 ? renderSortBar({ sort, verifiedOnly }) : '';
      const list = reviews.length
        ? `<div class="rv-list${compact ? ' rv-list-compact' : ''}">${reviews.map(renderReviewCard).join('')}</div>`
        : `<div class="rv-empty-invite">
             <p>${escape(ctaHint || 'No reviews yet. Your honest experience would mean the world — and help a fellow seeker find their way.')}</p>
           </div>`;
      el.innerHTML = `
        <div class="rv-panel">
          ${renderStatsHeader(stats)}
          ${ctaRow}
          ${sortBar}
          ${list}
        </div>
      `;

      const selectEl = el.querySelector('.rv-sort');
      if (selectEl) selectEl.addEventListener('change', () => { sort = selectEl.value; render(); });
      const verifiedEl = el.querySelector('.rv-verified');
      if (verifiedEl) verifiedEl.addEventListener('change', () => { verifiedOnly = verifiedEl.checked; render(); });
      const openBtn = el.querySelector('.rv-open-form');
      if (openBtn) openBtn.addEventListener('click', () => openReviewModal({ type, targetId, targetName }));
      el.querySelectorAll('[data-review-helpful]').forEach((b) => {
        b.addEventListener('click', async () => {
          const id = b.getAttribute('data-review-helpful');
          b.disabled = true;
          try {
            const res = await fetch(`${API}/helpful`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
            const d = await res.json();
            if (d.ok) b.querySelector('.rv-helpful-count').textContent = d.helpful;
          } catch (_) {}
        });
      });
    };

    render();
  }

  async function mountAggregate(el, opts = {}) {
    if (!el || el.dataset.rvMounted === '1') return;
    el.dataset.rvMounted = '1';
    const { type = 'product', targetId = null, label = '' } = opts;
    try {
      const qs = new URLSearchParams();
      if (type) qs.set('type', type);
      if (targetId) qs.set('targetId', targetId);
      const res = await fetch(`${API}/stats?${qs.toString()}`);
      const data = await res.json();
      if (!data.ok || !data.stats?.total) { el.innerHTML = `<span class="rv-inline-new">No reviews yet ✦</span>`; return; }
      const s = data.stats;
      el.innerHTML = `
        <a class="rv-inline" href="#reviews-${escape(targetId || type)}" data-rv-scroll>
          ${starSpan(s.average)}
          <span class="rv-inline-avg">${s.average.toFixed(1)}</span>
          <span class="rv-inline-count">(${s.total} ${s.total === 1 ? 'Review' : 'Reviews'})</span>
          ${label ? `<span class="rv-inline-label">${escape(label)}</span>` : ''}
        </a>
      `;
    } catch (_) { el.innerHTML = ''; }
  }

  async function mountFeatured(el, opts = {}) {
    if (!el || el.dataset.rvMounted === '1') return;
    el.dataset.rvMounted = '1';
    const { limit = 6 } = opts;
    try {
      const [featRes, statsRes] = await Promise.all([
        fetch(`${API}/featured?limit=${limit}`).then((r) => r.json()),
        fetch(`${API}/stats`).then((r) => r.json()),
      ]);
      const reviews = featRes.reviews || [];
      const stats = statsRes.stats || { total: 0, average: 0, verifiedCount: 0 };
      const googleHref = googleReviewLink();
      const headline = stats.total
        ? `${starSpan(stats.average, 'lg')}<span class="rv-home-avg">${stats.average.toFixed(1)}</span><span class="rv-home-count">Loved by ${stats.total} ${stats.total === 1 ? 'seeker' : 'seekers'}</span>`
        : `<span class="rv-home-count">A young apothecary — your voice could help shape our community.</span>`;
      const body = reviews.length
        ? `<div class="rv-home-carousel">${reviews.map(renderReviewCard).join('')}</div>`
        : `<div class="rv-empty-invite rv-home-empty">
             <p>Be among the first to share an honest experience with Amber's Alchemy Apothecary. Your words help others discover the support they are seeking.</p>
           </div>`;
      el.innerHTML = `
        <div class="rv-home-wrap">
          <div class="rv-home-top">
            <p class="section-ornament">✦ ─────────────── ✦</p>
            <h2 class="rv-home-title">Loved by Our Community</h2>
            <div class="rv-home-stats">${headline}</div>
          </div>
          ${body}
          <div class="rv-home-cta">
            <button type="button" class="rv-open-form btn-primary" data-rv-type="site">✦ Share Your Experience</button>
            <a class="rv-google-link" href="${escape(googleHref)}" target="_blank" rel="noopener">Leave a Review on Google ↗</a>
            <a class="rv-all-link" href="#reviews-all">Read All Reviews</a>
          </div>
        </div>
      `;
      el.querySelector('.rv-open-form')?.addEventListener('click', () => openReviewModal({ type: 'site', targetName: 'My overall experience with Amber\'s Alchemy Apothecary' }));
      el.querySelector('.rv-all-link')?.addEventListener('click', (e) => { e.preventDefault(); openAllReviewsPanel(); });
    } catch (err) {
      console.warn('[reviews] featured mount failed', err);
    }
  }

  /* ---------- review submission modal ---------- */

  function promptsForType(type) {
    switch (type) {
      case 'soap':
        return [
          { label: 'How was the scent?', name: 'scent' },
          { label: 'How did your skin feel?', name: 'skin' },
          { label: 'Would you buy this soap again?', name: 'rebuy' },
        ];
      case 'bundle':
        return [
          { label: 'Was the bundle worth the value?', name: 'value' },
          { label: 'Which item did you love most?', name: 'favorite' },
          { label: 'Would you gift this bundle?', name: 'gift' },
        ];
      case 'site':
        return [
          { label: 'What part of the experience stood out?', name: 'experience' },
          { label: 'How was ordering and shipping?', name: 'shipping' },
        ];
      case 'service':
        return [
          { label: 'How did the service feel?', name: 'service_feel' },
          { label: 'What changed after?', name: 'service_change' },
        ];
      default:
        return [
          { label: 'How easy was it to use?', name: 'ease' },
          { label: 'How consistent was your experience?', name: 'consistency' },
          { label: 'Would you reorder?', name: 'reorder' },
        ];
    }
  }

  function labelForType(type) {
    return ({ product: 'this remedy', soap: 'this soap', bundle: 'this bundle', site: 'the website experience', service: 'this service', shipping: 'your ordering experience' })[type] || 'this product';
  }

  function openReviewModal({ type = 'product', targetId = null, targetName = null } = {}) {
    closeReviewModal();
    const extraPrompts = promptsForType(type);
    const wrap = document.createElement('div');
    wrap.className = 'rv-modal-wrap';
    wrap.innerHTML = `
      <div class="rv-modal-backdrop"></div>
      <div class="rv-modal" role="dialog" aria-modal="true" aria-labelledby="rv-modal-title">
        <button class="rv-modal-close" type="button" aria-label="Close">×</button>
        <div class="rv-modal-head">
          <p class="section-ornament">✦ ─────────────── ✦</p>
          <h2 id="rv-modal-title">Share Your Honest Experience</h2>
          <p class="rv-modal-sub">Reviewing ${escape(targetName || labelForType(type))}. Your words help other seekers find what they need.</p>
        </div>
        <form class="rv-form" novalidate>
          <input type="hidden" name="type" value="${escape(type)}" />
          <input type="hidden" name="targetId" value="${escape(targetId || '')}" />
          <input type="hidden" name="targetName" value="${escape(targetName || '')}" />
          <input type="text" name="website" class="rv-hp" tabindex="-1" autocomplete="off" aria-hidden="true" />

          <div class="rv-field">
            <label>Your Rating <span class="rv-req">*</span></label>
            <div class="rv-rating-picker" role="radiogroup" aria-label="Rating">
              ${[1,2,3,4,5].map((n) => `<button type="button" class="rv-star-btn" data-rating="${n}" aria-label="${n} star">★</button>`).join('')}
            </div>
            <input type="hidden" name="rating" value="" />
          </div>

          <div class="rv-field">
            <label for="rv-title">Review Title</label>
            <input id="rv-title" name="title" type="text" maxlength="120" placeholder="A sentence that sums it up…" />
          </div>

          <div class="rv-field">
            <label for="rv-body">Your Review <span class="rv-req">*</span></label>
            <textarea id="rv-body" name="body" rows="5" maxlength="4000" required placeholder="What did you notice? What changed for you? Honest detail helps others most."></textarea>
          </div>

          ${extraPrompts.length ? `<div class="rv-prompt-row">
            ${extraPrompts.map((p) => `
              <div class="rv-field rv-field-small">
                <label>${escape(p.label)}</label>
                <input type="text" name="prompt_${escape(p.name)}" maxlength="200" />
              </div>
            `).join('')}
          </div>` : ''}

          <div class="rv-field-row">
            <div class="rv-field">
              <label for="rv-name">First Name or Display Name <span class="rv-req">*</span></label>
              <input id="rv-name" name="displayName" type="text" required maxlength="60" placeholder="How you'd like to appear" />
            </div>
            <div class="rv-field">
              <label for="rv-usage">Used for (optional)</label>
              <input id="rv-usage" name="usageDuration" type="text" maxlength="60" placeholder="e.g. 3 weeks" />
            </div>
          </div>

          <div class="rv-field">
            <label for="rv-email">Email (kept private — used to verify your purchase)</label>
            <input id="rv-email" name="email" type="email" maxlength="120" placeholder="you@email.com" />
            <p class="rv-field-hint">A <strong>Verified Buyer</strong> badge appears only if we find a real order for this email. Never published.</p>
          </div>

          <div class="rv-field">
            <label class="rv-check">
              <input type="checkbox" name="repeatCustomer" />
              <span>I've ordered from Amber more than once</span>
            </label>
            <p class="rv-field-hint">This will only show if your email matches multiple real orders.</p>
          </div>

          <div class="rv-field">
            <label for="rv-photo">Photo URL (optional)</label>
            <input id="rv-photo" name="photoUrl" type="url" maxlength="600" placeholder="Paste a link to a photo you've uploaded" />
          </div>

          <div class="rv-form-foot">
            <button type="submit" class="btn-primary rv-submit">✦ Submit My Review</button>
            <p class="rv-policy">All reviews are read before publishing. We never edit your words or suppress honest feedback.</p>
          </div>
          <div class="rv-form-msg" role="status" aria-live="polite"></div>
        </form>
      </div>
    `;
    document.body.appendChild(wrap);
    document.body.style.overflow = 'hidden';

    const form = wrap.querySelector('.rv-form');
    const ratingInput = form.querySelector('input[name="rating"]');
    wrap.querySelectorAll('.rv-star-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = Number(btn.dataset.rating);
        ratingInput.value = val;
        wrap.querySelectorAll('.rv-star-btn').forEach((b) => {
          b.classList.toggle('rv-star-active', Number(b.dataset.rating) <= val);
        });
      });
    });
    wrap.querySelector('.rv-modal-close').addEventListener('click', closeReviewModal);
    wrap.querySelector('.rv-modal-backdrop').addEventListener('click', closeReviewModal);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = form.querySelector('.rv-form-msg');
      msg.textContent = '';
      const fd = new FormData(form);
      const rating = Number(fd.get('rating'));
      if (!rating) { msg.textContent = 'Please choose a star rating.'; msg.className = 'rv-form-msg rv-form-err'; return; }
      const text = (fd.get('body') || '').toString().trim();
      if (text.length < 10) { msg.textContent = 'Please share a little more detail.'; msg.className = 'rv-form-msg rv-form-err'; return; }
      const name = (fd.get('displayName') || '').toString().trim();
      if (!name) { msg.textContent = 'Please add a first name or display name.'; msg.className = 'rv-form-msg rv-form-err'; return; }

      const extras = {};
      form.querySelectorAll('input[name^="prompt_"]').forEach((i) => {
        if (i.value?.trim()) extras[i.name.replace('prompt_', '')] = i.value.trim();
      });
      const body = Object.keys(extras).length
        ? `${text}\n\n${Object.entries(extras).map(([k, v]) => `• ${k.replace(/_/g, ' ')}: ${v}`).join('\n')}`
        : text;

      const payload = {
        type: fd.get('type'),
        targetId: fd.get('targetId') || null,
        targetName: fd.get('targetName') || null,
        rating,
        title: fd.get('title') || '',
        body,
        displayName: name,
        email: (fd.get('email') || '').toString().trim(),
        usageDuration: fd.get('usageDuration') || '',
        photoUrl: fd.get('photoUrl') || '',
        repeatCustomer: fd.get('repeatCustomer') === 'on',
        website: fd.get('website') || '',
      };

      const submitBtn = form.querySelector('.rv-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      try {
        const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error || 'Submission failed');
        msg.className = 'rv-form-msg rv-form-ok';
        msg.innerHTML = `
          <div class="rv-thankyou">
            <div class="rv-thankyou-ornament">✦ ─────────── ✦</div>
            <h3>Thank you — your review has been received</h3>
            <p>${escape(data.message || 'It will be published after a brief review.')}</p>
            ${data.verifiedBuyer ? '<p class="rv-thankyou-verified">✦ Verified Buyer — a real order was found for your email.</p>' : ''}
            <p class="rv-thankyou-google">If you have a moment, a Google review would mean the world to a small apothecary.</p>
            <div class="rv-thankyou-cta">
              <a class="btn-primary" href="${escape(googleReviewLink())}" target="_blank" rel="noopener">Leave a Review on Google ↗</a>
              <button type="button" class="btn-secondary rv-close-btn">Close</button>
            </div>
          </div>
        `;
        form.querySelectorAll('input, textarea, select, button.rv-submit').forEach((i) => { i.disabled = true; });
        msg.querySelector('.rv-close-btn')?.addEventListener('click', closeReviewModal);
        invalidateCache();
        document.querySelectorAll('[data-rv-target], [data-rv-featured], [data-rv-aggregate]').forEach((el) => {
          el.dataset.rvMounted = '';
          el.innerHTML = '';
        });
        window.ReviewsAA?.refresh?.();
      } catch (err) {
        msg.className = 'rv-form-msg rv-form-err';
        msg.textContent = err.message || 'Could not submit. Please try again.';
        submitBtn.disabled = false;
        submitBtn.textContent = '✦ Submit My Review';
      }
    });
  }

  function closeReviewModal() {
    document.querySelectorAll('.rv-modal-wrap').forEach((el) => el.remove());
    document.body.style.overflow = '';
  }

  /* ---------- all-reviews panel (drawer) ---------- */

  function openAllReviewsPanel() {
    closeReviewModal();
    const wrap = document.createElement('div');
    wrap.className = 'rv-modal-wrap rv-all-wrap';
    wrap.innerHTML = `
      <div class="rv-modal-backdrop"></div>
      <div class="rv-modal rv-modal-wide" role="dialog" aria-modal="true">
        <button class="rv-modal-close" type="button" aria-label="Close">×</button>
        <div class="rv-modal-head">
          <p class="section-ornament">✦ ─────────────── ✦</p>
          <h2>All Reviews</h2>
          <p class="rv-modal-sub">Honest words from our community.</p>
        </div>
        <div class="rv-all-body" data-rv-target data-rv-type=""></div>
      </div>
    `;
    document.body.appendChild(wrap);
    document.body.style.overflow = 'hidden';
    wrap.querySelector('.rv-modal-close').addEventListener('click', closeReviewModal);
    wrap.querySelector('.rv-modal-backdrop').addEventListener('click', closeReviewModal);
    mountReviews(wrap.querySelector('.rv-all-body'), { type: null, showForm: true });
  }

  /* ---------- auto-mount based on DOM markers ---------- */

  function enhanceSoapCards(scope) {
    scope.querySelectorAll('.soap-card').forEach((card) => {
      if (card.dataset.rvEnhanced === '1') return;
      const nameEl = card.querySelector('.soap-name');
      const name = nameEl?.textContent?.trim();
      if (!name) return;
      card.dataset.rvEnhanced = '1';
      const id = 'soap_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const info = card.querySelector('.soap-info');
      const priceRow = card.querySelector('.soap-price-row');
      if (!info || !priceRow) return;
      const agg = document.createElement('div');
      agg.className = 'product-reviews-inline';
      agg.setAttribute('data-rv-aggregate', '');
      agg.setAttribute('data-rv-type', 'soap');
      agg.setAttribute('data-rv-id', id);
      priceRow.parentElement.insertBefore(agg, priceRow);
      const addBtn = card.querySelector('.soap-order-btn');
      if (addBtn) {
        const reviewLink = document.createElement('a');
        reviewLink.href = '#';
        reviewLink.textContent = '✦ Write a Review';
        reviewLink.className = 'product-review-link';
        reviewLink.setAttribute('data-rv-open', '');
        reviewLink.setAttribute('data-rv-open-type', 'soap');
        reviewLink.setAttribute('data-rv-id', id);
        reviewLink.setAttribute('data-rv-name', name);
        reviewLink.style.cssText = 'display:inline-block;margin-top:8px;color:var(--brass-lt,#B8945A);font-family:\'Lora\',serif;font-size:0.82rem;text-decoration:none;border:1px solid rgba(184,148,90,0.35);padding:4px 10px;border-radius:999px;';
        addBtn.parentElement.insertBefore(reviewLink, addBtn.nextSibling);
      }
    });
  }

  function autoMount(root) {
    const scope = root || document;
    enhanceSoapCards(scope);
    scope.querySelectorAll('[data-rv-featured]').forEach((el) => mountFeatured(el, { limit: Number(el.dataset.limit) || 6 }));
    scope.querySelectorAll('[data-rv-target]').forEach((el) => {
      mountReviews(el, {
        type: el.dataset.rvType || 'product',
        targetId: el.dataset.rvId || null,
        targetName: el.dataset.rvName || null,
        compact: el.dataset.rvCompact === '1',
      });
    });
    scope.querySelectorAll('[data-rv-aggregate]').forEach((el) => {
      mountAggregate(el, {
        type: el.dataset.rvType || 'product',
        targetId: el.dataset.rvId || null,
        label: el.dataset.rvLabel || '',
      });
    });

    // Delegation for any “Review on Google” buttons with data attribute
    scope.querySelectorAll('[data-rv-google]').forEach((el) => {
      if (el.tagName === 'A') el.href = googleReviewLink();
      else el.addEventListener('click', () => window.open(googleReviewLink(), '_blank', 'noopener'));
    });

    scope.querySelectorAll('[data-rv-open]').forEach((el) => {
      if (el.dataset.rvBound === '1') return;
      el.dataset.rvBound = '1';
      el.addEventListener('click', (e) => {
        e.preventDefault();
        openReviewModal({
          type: el.dataset.rvOpenType || 'site',
          targetId: el.dataset.rvId || null,
          targetName: el.dataset.rvName || null,
        });
      });
    });

    scope.querySelectorAll('[data-rv-open-all]').forEach((el) => {
      if (el.dataset.rvBound === '1') return;
      el.dataset.rvBound = '1';
      el.addEventListener('click', (e) => { e.preventDefault(); openAllReviewsPanel(); });
    });
  }

  /* ---------- admin dashboard ---------- */

  function ensureAdminToken() {
    let t = sessionStorage.getItem('rv_admin_token') || '';
    if (!t) {
      t = window.prompt('Enter reviews admin token');
      if (t) sessionStorage.setItem('rv_admin_token', t.trim());
    }
    return t?.trim() || '';
  }

  async function adminFetch(url, opts = {}) {
    const t = ensureAdminToken();
    if (!t) throw new Error('Token required');
    const headers = { ...(opts.headers || {}), 'x-admin-token': t };
    if (opts.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
    const res = await fetch(url, { ...opts, headers });
    if (res.status === 401) {
      sessionStorage.removeItem('rv_admin_token');
      throw new Error('Unauthorized. Token cleared — try again.');
    }
    return res;
  }

  async function openAdminPanel() {
    let container = document.getElementById('reviewsAdminPanel');
    if (!container) {
      container = document.createElement('div');
      container.id = 'reviewsAdminPanel';
      container.className = 'rv-admin';
      document.body.appendChild(container);
    }
    container.innerHTML = `
      <div class="rv-admin-top">
        <h2>Reviews — Admin Dashboard</h2>
        <div class="rv-admin-actions">
          <button type="button" class="btn-secondary rv-admin-refresh">Refresh</button>
          <button type="button" class="btn-secondary rv-admin-export">Export CSV</button>
          <button type="button" class="btn-secondary rv-admin-close">Close</button>
        </div>
      </div>
      <div class="rv-admin-filters">
        <select class="rv-admin-status">
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected/Spam</option>
          <option value="">All</option>
        </select>
        <input type="text" class="rv-admin-search" placeholder="Filter by target id, name, or text…" />
      </div>
      <div class="rv-admin-list">Loading…</div>
    `;
    document.body.style.overflow = 'hidden';
    const list = container.querySelector('.rv-admin-list');
    const statusSel = container.querySelector('.rv-admin-status');
    const search = container.querySelector('.rv-admin-search');
    let reviews = [];
    let counts = {};

    async function load() {
      list.textContent = 'Loading…';
      try {
        const res = await adminFetch(`${API}/admin?status=${encodeURIComponent(statusSel.value)}`);
        const data = await res.json();
        if (!data.ok) throw new Error(data.error || 'Failed');
        reviews = data.reviews || [];
        counts = data.counts || {};
        render();
      } catch (e) { list.innerHTML = `<p class="rv-admin-err">${escape(e.message)}</p>`; }
    }

    function render() {
      const q = search.value.trim().toLowerCase();
      const filtered = q
        ? reviews.filter((r) => [r.targetId, r.targetName, r.title, r.body, r.displayName, r.email].some((v) => v && String(v).toLowerCase().includes(q)))
        : reviews;
      list.innerHTML = `
        <p class="rv-admin-counts">
          Total: ${counts.total || 0} · Pending: ${counts.pending || 0} · Approved: ${counts.approved || 0} · Rejected: ${counts.rejected || 0}
        </p>
        ${filtered.length ? filtered.map(renderAdminRow).join('') : '<p>No reviews for this filter.</p>'}
      `;
      list.querySelectorAll('[data-action]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          const action = btn.dataset.action;
          const payload = {};
          if (action === 'approve') payload.status = 'approved';
          if (action === 'reject') payload.status = 'rejected';
          if (action === 'pending') payload.status = 'pending';
          if (action === 'feature') payload.featured = true;
          if (action === 'unfeature') payload.featured = false;
          if (action === 'verify') payload.verifiedBuyer = true;
          if (action === 'unverify') payload.verifiedBuyer = false;
          if (action === 'respond') {
            const resp = window.prompt('Your public response (leave blank to clear):');
            if (resp === null) return;
            payload.response = resp;
          }
          if (action === 'delete') {
            if (!confirm('Delete this review permanently? This cannot be undone.')) return;
            try {
              const res = await adminFetch(`${API}/${encodeURIComponent(id)}`, { method: 'DELETE' });
              const d = await res.json();
              if (d.ok) load();
            } catch (e) { alert(e.message); }
            return;
          }
          try {
            const res = await adminFetch(`${API}/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) });
            const d = await res.json();
            if (d.ok) load(); else alert(d.error || 'Failed');
          } catch (e) { alert(e.message); }
        });
      });
    }

    function renderAdminRow(r) {
      return `
        <div class="rv-admin-row rv-status-${escape(r.status)}">
          <div class="rv-admin-row-head">
            ${starSpan(r.rating)}
            <strong>${escape(r.title || '(no title)')}</strong>
            <span class="rv-admin-meta">${escape(r.type)} · ${escape(r.targetName || r.targetId || '—')} · ${formatDate(r.createdAt)}</span>
            <span class="rv-admin-status-pill">${escape(r.status)}${r.featured ? ' · featured' : ''}${r.verifiedBuyer ? ' · verified' : ''}</span>
          </div>
          <p class="rv-admin-body">${escape(r.body)}</p>
          <p class="rv-admin-who">— ${escape(r.displayName)} · ${escape(r.email || 'no email')}</p>
          ${r.response ? `<p class="rv-admin-response">Response: ${escape(r.response)}</p>` : ''}
          <div class="rv-admin-btns">
            ${r.status !== 'approved' ? `<button data-action="approve" data-id="${escape(r.id)}">Approve</button>` : ''}
            ${r.status !== 'rejected' ? `<button data-action="reject" data-id="${escape(r.id)}">Reject</button>` : ''}
            ${r.status !== 'pending' ? `<button data-action="pending" data-id="${escape(r.id)}">Unpublish</button>` : ''}
            ${r.featured ? `<button data-action="unfeature" data-id="${escape(r.id)}">Unfeature</button>` : `<button data-action="feature" data-id="${escape(r.id)}">Feature</button>`}
            ${r.verifiedBuyer ? `<button data-action="unverify" data-id="${escape(r.id)}">Unverify</button>` : `<button data-action="verify" data-id="${escape(r.id)}">Verify</button>`}
            <button data-action="respond" data-id="${escape(r.id)}">Respond</button>
            <button data-action="delete" data-id="${escape(r.id)}" class="rv-admin-danger">Delete</button>
          </div>
        </div>
      `;
    }

    container.querySelector('.rv-admin-refresh').addEventListener('click', load);
    container.querySelector('.rv-admin-close').addEventListener('click', () => { container.remove(); document.body.style.overflow = ''; });
    container.querySelector('.rv-admin-export').addEventListener('click', async () => {
      const t = ensureAdminToken();
      if (!t) return;
      window.open(`${API}/export?admin_token=${encodeURIComponent(t)}`, '_blank');
    });
    statusSel.addEventListener('change', load);
    search.addEventListener('input', () => render());
    load();
  }

  /* ---------- post-order prompt ---------- */

  function maybeLaunchPostOrderPrompt() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('review') === 'me') {
      setTimeout(() => openReviewModal({ type: 'site', targetName: 'My experience with Amber\'s Alchemy Apothecary' }), 500);
    }
    if (params.get('google_review') === '1') {
      window.open(googleReviewLink(), '_blank', 'noopener');
    }
  }

  /* ---------- JSON-LD: only real, approved reviews ---------- */

  async function emitAggregateSchema() {
    try {
      const res = await fetch(`${API}/stats`).then((r) => r.json());
      const s = res?.stats;
      if (!s || !s.total) return;
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'rv-aggregate-schema';
      script.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': 'https://awakenagain.com/#business-rating',
        name: "Amber's Alchemy Apothecary",
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: s.average,
          reviewCount: s.total,
          bestRating: 5,
          worstRating: 1,
        },
      });
      document.head.appendChild(script);
    } catch (_) {}
  }

  /* ---------- boot ---------- */

  function boot() {
    autoMount(document);
    maybeLaunchPostOrderPrompt();
    emitAggregateSchema();

    // Hash route: #admin-reviews opens the admin panel
    const checkHash = () => {
      if (location.hash === '#admin-reviews') openAdminPanel();
    };
    window.addEventListener('hashchange', checkHash);
    checkHash();

    // Re-scan when new sections are rendered dynamically (shop/soaps grids)
    let pending = false;
    const obs = new MutationObserver(() => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => { pending = false; autoMount(document); });
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  window.ReviewsAA = {
    mountReviews,
    mountFeatured,
    mountAggregate,
    openReviewModal,
    openAllReviewsPanel,
    openAdminPanel,
    googleReviewLink,
    refresh: () => { invalidateCache(); autoMount(document); },
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
