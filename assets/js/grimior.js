// grimior.js — book renderer, page-flip, auth-gated content fetch.

(function () {
  const $book = document.getElementById('grimior-book');
  const $toolbar = document.getElementById('grimior-toolbar');
  const $pageNumber = document.getElementById('grimior-pagenum');
  if (!$book) return;

  let pages = [];
  let currentIndex = 0;
  let isAuthorized = false;
  let role = 'guest';

  async function fetchPages() {
    try {
      const res = await window.GrimiorAuth.authedFetch('/api/auth-check');
      const data = await res.json();
      isAuthorized = !!data.authorized;
      role = data.role || 'guest';
      pages = (data.pages && data.pages.length) ? data.pages : [];
    } catch (e) {
      isAuthorized = false;
      pages = [];
    }
    if (!pages.length) {
      // Fallback: at minimum render front matter from a hardcoded preview list (cover, welcome, toc).
      pages = [
        { kind: 'cover', is_free: true, title: 'The Grimior', subtitle: 'A True Book of Light Magic', keeper: 'Kept by Amber’s Alchemy Apothecary' }
      ];
    }
    renderTOC();
    renderCurrent();
  }

  function chapterLabel(p) {
    if (!p.chapter) return '';
    return `Chapter ${p.chapter}`;
  }

  function renderTOC() {
    const tocPage = pages.find(p => p.kind === 'toc');
    if (!tocPage) return;
    // Group all numbered pages by chapter
    const grouped = {};
    pages.forEach((p, idx) => {
      if (p.kind !== 'page' && p.kind !== 'chapter-divider') return;
      const ch = p.chapter || 'Other';
      if (!grouped[ch]) grouped[ch] = [];
      grouped[ch].push({ ...p, idx });
    });
    tocPage.__rendered = grouped;
  }

  function renderPage(p, idx) {
    const node = document.createElement('article');
    node.className = 'grimior-page';
    if (p.kind === 'cover') node.classList.add('cover');

    let inner = '';
    if (p.kind === 'cover') {
      inner = `
        <div class="cover-sigil">✦</div>
        <h1>${escape(p.title || 'The Grimior')}</h1>
        <div class="subtitle">${escape(p.subtitle || '')}</div>
        <div class="keeper">${escape(p.keeper || '')}</div>
      `;
    } else if (p.kind === 'welcome') {
      inner = `
        <h1>${escape(p.title)}</h1>
        ${(p.body || []).map(b => `<p>${escape(b)}</p>`).join('')}
        ${p.closing ? `<div class="welcome-closing">${escape(p.closing)}</div>` : ''}
      `;
    } else if (p.kind === 'toc') {
      inner = renderTOCBody();
    } else if (p.kind === 'chapter-divider') {
      inner = `
        <div class="chapter-divider">
          <div class="roman">${escape(p.chapter || '')}</div>
          <h2>${escape(p.title || '')}</h2>
          <div class="verse">${escape(p.verse || '')}</div>
        </div>
      `;
    } else {
      inner = renderPageBody(p);
    }

    const isLocked = !isAuthorized && p.is_free !== true && p.kind !== 'cover' && p.kind !== 'welcome' && p.kind !== 'toc';
    if (isLocked) {
      node.classList.add('locked');
      node.innerHTML = `
        <div class="page-content">${inner}</div>
        <div class="lock-overlay">
          <div class="lock-icon">🔒</div>
          <h3>Sealed by candlelight</h3>
          <p>This page awaits your subscription. Unlock the full Grimior — 88 pages of light magic — for $3.33/month.</p>
          <a class="btn-unlock" href="/subscribe">✦ Unlock the Grimior</a>
        </div>
      `;
    } else {
      node.innerHTML = `<div class="page-content">${inner}</div>`;
    }

    if (p.number || idx > 0) {
      const num = document.createElement('div');
      num.className = 'page-number';
      num.textContent = `— ${idx + 1} / ${pages.length} —`;
      node.appendChild(num);
    }

    return node;
  }

  function renderTOCBody() {
    const grouped = {};
    pages.forEach((p, idx) => {
      if (p.kind !== 'page' && p.kind !== 'chapter-divider') return;
      const ch = p.chapter || 'Other';
      if (!grouped[ch]) grouped[ch] = { title: '', items: [] };
      if (p.kind === 'chapter-divider') grouped[ch].title = p.title || `Chapter ${ch}`;
      else grouped[ch].items.push({ idx, title: p.title || '', number: p.number, is_free: p.is_free });
    });

    let html = '<h1>Table of Contents</h1>';
    Object.keys(grouped).forEach(ch => {
      const g = grouped[ch];
      html += `<div class="toc-chapter">
        <div class="toc-chapter-title">Chapter ${escape(ch)} — ${escape(g.title)}</div>`;
      g.items.forEach(it => {
        const lock = (!isAuthorized && !it.is_free) ? '<span class="lock">🔒</span>' : '';
        html += `<div class="toc-entry" data-go="${it.idx}">
          <span>${escape(it.title)}</span>
          <span><span class="num">p. ${it.number || ''}</span>${lock}</span>
        </div>`;
      });
      html += '</div>';
    });
    return html;
  }

  function renderPageBody(p) {
    let html = '';
    if (p.title) html += `<h2>${escape(p.title)}</h2>`;
    if (p.intent) html += `<div class="page-section"><div class="label">Intent</div><p><em>${escape(p.intent)}</em></p></div>`;
    if (p.needs && p.needs.length) {
      html += `<div class="page-section"><div class="label">You will need</div><ul>${p.needs.map(n => `<li>${escape(n)}</li>`).join('')}</ul></div>`;
    }
    if (p.body && p.body.length) {
      html += `<div class="page-section">${p.body.map(b => `<p>${escape(b)}</p>`).join('')}</div>`;
    }
    if (p.steps && p.steps.length) {
      html += `<div class="page-section"><div class="label">Working</div><ol>${p.steps.map(s => `<li>${escape(s)}</li>`).join('')}</ol></div>`;
    }
    if (p.practice) {
      html += `<div class="page-section"><div class="label">Practice</div><p>${escape(p.practice)}</p></div>`;
    }
    if (p.prompts && p.prompts.length) {
      html += `<div class="page-section"><div class="label">Journal</div><ul>${p.prompts.map(s => `<li>${escape(s)}</li>`).join('')}</ul></div>`;
    }
    if (p.correspondences) {
      html += `<div class="page-section"><div class="label">Correspondences</div><ul>${
        Object.entries(p.correspondences).map(([k, v]) => `<li><strong>${escape(k)}:</strong> ${escape(v)}</li>`).join('')
      }</ul></div>`;
    }
    if (p.cross_sell && p.cross_sell.length) {
      html += `<div class="cross-sell">From the Apothecary: ${p.cross_sell.map(escape).join(' · ')}</div>`;
    }
    if (p.note) {
      html += `<div class="note">${escape(p.note)}</div>`;
    }
    if (p.closing) {
      html += `<div class="welcome-closing">${escape(p.closing)}</div>`;
    }
    return html;
  }

  function escape(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function renderCurrent() {
    if (!pages.length) return;
    if (currentIndex >= pages.length) currentIndex = pages.length - 1;
    if (currentIndex < 0) currentIndex = 0;
    const p = pages[currentIndex];
    const next = renderPage(p, currentIndex);

    const old = $book.querySelector('.grimior-page');
    if (old) {
      old.classList.add('flipping-out');
      setTimeout(() => {
        $book.innerHTML = '';
        next.classList.add('flipping-in');
        $book.appendChild(next);
        bindTOCClicks(next);
      }, 300);
    } else {
      $book.appendChild(next);
      bindTOCClicks(next);
    }

    if ($pageNumber) $pageNumber.textContent = `Page ${currentIndex + 1} of ${pages.length}`;

    try { localStorage.setItem('grimior:lastPage', String(currentIndex)); } catch (e) {}
  }

  function bindTOCClicks(node) {
    node.querySelectorAll('.toc-entry').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.getAttribute('data-go'), 10);
        if (!isNaN(idx)) goTo(idx);
      });
    });
  }

  function goTo(idx) {
    currentIndex = Math.max(0, Math.min(pages.length - 1, idx));
    renderCurrent();
  }

  function next() { goTo(currentIndex + 1); }
  function prev() { goTo(currentIndex - 1); }

  // Toolbar wiring
  document.addEventListener('keydown', (e) => {
    if (e.target && e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  if ($toolbar) {
    $toolbar.querySelector('[data-action="prev"]')?.addEventListener('click', prev);
    $toolbar.querySelector('[data-action="next"]')?.addEventListener('click', next);
    $toolbar.querySelector('[data-action="toc"]')?.addEventListener('click', () => {
      const tocIdx = pages.findIndex(p => p.kind === 'toc');
      if (tocIdx >= 0) goTo(tocIdx);
    });
    $toolbar.querySelector('[data-action="cover"]')?.addEventListener('click', () => goTo(0));
  }

  // Touch swipe on mobile
  let touchStartX = null;
  $book.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  });
  $book.addEventListener('touchend', (e) => {
    if (touchStartX == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (dx > 60) prev();
    else if (dx < -60) next();
    touchStartX = null;
  });

  // Restore last page
  try {
    const saved = parseInt(localStorage.getItem('grimior:lastPage') || '0', 10);
    if (!isNaN(saved)) currentIndex = saved;
  } catch (e) {}

  fetchPages();
})();
