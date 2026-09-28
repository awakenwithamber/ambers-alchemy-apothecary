// js/site-search.js
// Site-wide search across products, soaps, herbs, articles, services and FAQs.
// Everything searched is already public on the page — no network calls.
// Fuzzy matching tolerates small typos ("ashwaganda", "lavendar").
// Events: search, search_no_result, search_result_click (window.AAA.track).

(function () {
  'use strict';

  let index = null;
  let lastTrackedQuery = '';
  let trackTimer = null;

  function track(name, params) {
    try { window.AAA && window.AAA.track && window.AAA.track(name, params); } catch (e) {}
  }

  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s&-]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function buildIndex() {
    const out = [];
    const add = (type, title, text, go) => out.push({ type, title, text: text || '', go, nTitle: norm(title), nText: norm(text) });

    if (typeof PRODUCTS !== 'undefined') {
      PRODUCTS.forEach(p => add('Remedy', p.name, [p.benefit, (p.keyHerbs || []).join(' '), (p.categories || []).join(' ')].join(' '),
        () => window.navigateToProduct ? window.navigateToProduct(p.id) : window.showSection('shop')));
    }
    document.querySelectorAll('#soaps .soap-card').forEach(card => {
      const name = (card.querySelector('.soap-name') || {}).textContent || '';
      const notes = [(card.querySelector('.soap-botanical-note') || {}).textContent, (card.querySelector('.soap-scent-note') || {}).textContent].join(' ');
      if (name.trim()) add('Soap', name.trim(), notes, () => { window.showSection('soaps'); setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300); });
    });
    if (typeof BOTANICALS !== 'undefined') {
      BOTANICALS.forEach(h => add('Herb', h.name, [h.latin, (h.categories || []).join(' ')].join(' '),
        () => typeof window.openHerbModal === 'function' ? window.openHerbModal(h.id) : window.showSection('herbal-library')));
    }
    document.querySelectorAll('#herbal-wisdom .hw-article').forEach(article => {
      const title = (article.querySelector('.hw-article-title') || {}).textContent || '';
      const tag = (article.querySelector('.hw-article-tag') || {}).textContent || '';
      if (title.trim()) add('Article', title.trim(), tag, () => { window.showSection('herbal-wisdom'); setTimeout(() => article.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300); });
    });
    if (typeof SERVICES !== 'undefined') {
      SERVICES.forEach(s => add('Service', s.name, s.desc, () => window.showSection('services')));
    }
    if (typeof FAQS !== 'undefined') {
      FAQS.forEach(f => add('FAQ', f.q, f.a, () => window.showSection('faqs')));
    }
    [
      ['Page', 'Shop', 'remedies products buy', 'shop'],
      ['Page', 'Build a Remedy', 'custom formula create remedy builder', 'custom-formula'],
      ['Page', 'Facts & Articles', 'learn guides articles', 'herbal-wisdom'],
      ['Page', 'Herb & Ingredient Library', 'herbs encyclopedia botanicals', 'herbal-library'],
      ['Page', 'Help & FAQ', 'shipping returns questions help', 'faqs'],
      ['Page', 'Contact Amber', 'email message reach', 'contact'],
    ].forEach(([type, title, text, section]) => add(type, title, text, () => window.showSection(section)));
    out.push({ type: 'Page', title: 'Living Grimoire', text: 'grimoire membership pages', nTitle: norm('Living Grimoire'), nText: 'grimoire membership pages', go: () => { location.href = '/grimior'; } });
    return out;
  }

  // Damerau-free Levenshtein with an early exit; words are short.
  function editDistance(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      let rowMin = i;
      for (let j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        rowMin = Math.min(rowMin, cur[j]);
      }
      if (rowMin > max) return max + 1;
      prev = cur;
    }
    return prev[b.length];
  }

  function termScore(term, entry) {
    if (entry.nTitle === term) return 100;
    if (entry.nTitle.startsWith(term)) return 60;
    if (entry.nTitle.includes(term)) return 45;
    if (entry.nText.includes(term)) return 20;
    if (term.length < 4) return 0;
    const max = term.length > 7 ? 2 : 1;
    const words = (entry.nTitle + ' ' + entry.nText).split(' ');
    for (const w of words) {
      if (w.length >= 3 && editDistance(term, w.slice(0, term.length + max), max) <= max) {
        return entry.nTitle.includes(w) ? 30 : 12;
      }
    }
    return 0;
  }

  function search(q) {
    const terms = norm(q).split(' ').filter(Boolean);
    if (!terms.length) return [];
    if (!index) index = buildIndex();
    const results = [];
    for (const entry of index) {
      let total = 0;
      for (const t of terms) {
        const s = termScore(t, entry);
        if (!s) { total = 0; break; }
        total += s;
      }
      if (total) results.push({ entry, score: total });
    }
    return results.sort((a, b) => b.score - a.score).slice(0, 12).map(r => r.entry);
  }

  function ensureDialog() {
    let dlg = document.getElementById('siteSearchDialog');
    if (dlg) return dlg;
    dlg = document.createElement('div');
    dlg.id = 'siteSearchDialog';
    dlg.className = 'site-search-dialog';
    dlg.setAttribute('role', 'dialog');
    dlg.setAttribute('aria-modal', 'true');
    dlg.setAttribute('aria-label', 'Search the site');
    dlg.hidden = true;
    dlg.innerHTML = `
      <div class="site-search-panel">
        <div class="site-search-row">
          <label for="siteSearchInput" class="sr-only">Search remedies, herbs, articles and more</label>
          <input id="siteSearchInput" type="search" autocomplete="off" placeholder="Search remedies, herbs, articles, FAQs…" />
          <button type="button" class="site-search-close" aria-label="Close search">✕</button>
        </div>
        <ul id="siteSearchResults" class="site-search-results" role="listbox" aria-live="polite"></ul>
      </div>`;
    document.body.appendChild(dlg);
    dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
    dlg.querySelector('.site-search-close').addEventListener('click', close);
    const input = dlg.querySelector('#siteSearchInput');
    input.addEventListener('input', () => render(input.value));
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const first = dlg.querySelector('.site-search-result');
        if (first) first.click();
      }
    });
    return dlg;
  }

  let current = [];
  function render(q) {
    const list = document.getElementById('siteSearchResults');
    current = search(q);
    const query = norm(q);
    if (!query) { list.innerHTML = ''; return; }
    if (!current.length) {
      list.innerHTML = `<li class="site-search-empty">No matches for “${esc(q)}”. Try an herb name, a remedy, or <button type="button" class="linklike" data-ask-lunna>ask Lunna</button>.</li>`;
      const ask = list.querySelector('[data-ask-lunna]');
      if (ask) ask.addEventListener('click', () => { close(); if (window.Lunna && window.Lunna.open) window.Lunna.open(q); });
    } else {
      list.innerHTML = current.map((r, i) => `
        <li><button type="button" class="site-search-result" role="option" data-i="${i}">
          <span class="site-search-type">${esc(r.type)}</span>
          <span class="site-search-title">${esc(r.title)}</span>
        </button></li>`).join('');
      list.querySelectorAll('.site-search-result').forEach(btn => btn.addEventListener('click', () => {
        const r = current[Number(btn.dataset.i)];
        track('search_result_click', { search_term: query, result_type: r.type, result_title: r.title });
        close();
        r.go();
      }));
    }
    clearTimeout(trackTimer);
    trackTimer = setTimeout(() => {
      if (query.length < 2 || query === lastTrackedQuery) return;
      lastTrackedQuery = query;
      track(current.length ? 'search' : 'search_no_result', { search_term: query, results: current.length });
    }, 800);
  }

  let lastFocus = null;
  function open(prefill) {
    const dlg = ensureDialog();
    lastFocus = document.activeElement;
    dlg.hidden = false;
    document.body.classList.add('site-search-open');
    const input = dlg.querySelector('#siteSearchInput');
    if (typeof prefill === 'string') input.value = prefill;
    render(input.value);
    setTimeout(() => input.focus(), 30);
  }

  function close() {
    const dlg = document.getElementById('siteSearchDialog');
    if (!dlg) return;
    dlg.hidden = true;
    document.body.classList.remove('site-search-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('keydown', e => {
    const tag = (e.target && e.target.tagName) || '';
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(tag) && !e.target.isContentEditable) { e.preventDefault(); open(); }
    if (e.key === 'Escape') close();
  });

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('siteSearchBtn');
    if (btn) btn.addEventListener('click', () => open());
    if (location.pathname.replace(/\/$/, '') === '/search') {
      const q = new URLSearchParams(location.search).get('q') || '';
      setTimeout(() => open(q), 300);
    }
  });

  window.SiteSearch = { open, close, search };
})();
