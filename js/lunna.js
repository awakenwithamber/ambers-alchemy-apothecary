// js/lunna.js
// Lunna — the floating site guide. Talks to /api/lunna (server-side AI via
// Netlify AI Gateway). Exposes window.Lunna.open(question?) so search and
// other pages can hand a question over.
// Events: lunna_open, lunna_message, lunna_escalate (window.AAA.track).

(function () {
  'use strict';

  const STYLE = `
    #lunnaRoot { position: fixed; bottom: 20px; right: 20px; z-index: 9500; font-family: 'EB Garamond', Georgia, serif; }
    #lunnaRoot .lunna-fab { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(145deg, #1f1336, #150b26);
      color: #f4e8d0; border: 1px solid rgba(212,175,55,.55); border-radius: 999px; padding: 11px 18px; cursor: pointer;
      font-family: 'Cinzel Decorative', Georgia, serif; font-size: .9rem; letter-spacing: .04em; box-shadow: 0 10px 28px rgba(0,0,0,.4); }
    #lunnaRoot .lunna-fab:hover, #lunnaRoot .lunna-fab:focus-visible { border-color: #d4af37; outline: none; }
    #lunnaRoot .lunna-panel { position: absolute; right: 0; bottom: 62px; width: 360px; max-width: calc(100vw - 40px);
      height: 480px; max-height: calc(100vh - 110px); display: flex; flex-direction: column; background: #150b26;
      border: 1px solid rgba(212,175,55,.35); border-radius: 16px; box-shadow: 0 16px 40px rgba(0,0,0,.5); overflow: hidden; }
    #lunnaRoot .lunna-panel[hidden] { display: none; }
    #lunnaRoot .lunna-head { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px;
      background: #1f1336; color: #d4af37; font-family: 'Cinzel Decorative', Georgia, serif; }
    #lunnaRoot .lunna-head small { display: block; color: #cbbfa6; font-family: 'EB Garamond', Georgia, serif; font-size: .8rem; }
    #lunnaRoot .lunna-close { background: none; border: 0; color: #f4e8d0; font-size: 1.1rem; cursor: pointer; }
    #lunnaRoot .lunna-log { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
    #lunnaRoot .lunna-msg { max-width: 88%; padding: 9px 12px; border-radius: 12px; line-height: 1.45; font-size: 1rem; white-space: pre-wrap; }
    #lunnaRoot .lunna-msg.user { align-self: flex-end; background: #d4af37; color: #150b26; }
    #lunnaRoot .lunna-msg.assistant { align-self: flex-start; background: #1f1336; color: #f4e8d0; border: 1px solid rgba(212,175,55,.2); }
    #lunnaRoot .lunna-msg.note { align-self: center; color: #cbbfa6; font-size: .85rem; text-align: center; background: none; }
    #lunnaRoot form { display: flex; gap: 8px; padding: 10px; border-top: 1px solid rgba(212,175,55,.2); }
    #lunnaRoot input { flex: 1; background: #1f1336; color: #f4e8d0; border: 1px solid rgba(212,175,55,.3); border-radius: 10px; padding: 9px 11px; font: inherit; }
    #lunnaRoot button[type=submit] { background: #d4af37; color: #150b26; border: 0; border-radius: 10px; padding: 0 14px; cursor: pointer; font-weight: 600; }
    #lunnaRoot button[disabled] { opacity: .6; cursor: default; }
  `;

  const history = [];
  let root, panel, log, input, sendBtn, busy = false;

  function track(name, params) {
    try { window.AAA && window.AAA.track && window.AAA.track(name, params || {}); } catch (e) {}
  }

  function addMsg(role, text) {
    const el = document.createElement('div');
    el.className = 'lunna-msg ' + role;
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  function build() {
    const style = document.createElement('style');
    style.textContent = STYLE;
    document.head.appendChild(style);

    root = document.createElement('div');
    root.id = 'lunnaRoot';
    root.innerHTML = `
      <div class="lunna-panel" id="lunnaPanel" role="dialog" aria-label="Chat with Lunna" hidden>
        <div class="lunna-head">
          <div>✦ Lunna<small>AI guide · not medical advice</small></div>
          <button type="button" class="lunna-close" aria-label="Close Lunna">✕</button>
        </div>
        <div class="lunna-log" aria-live="polite"></div>
        <form>
          <label for="lunnaInput" class="sr-only">Ask Lunna a question</label>
          <input id="lunnaInput" type="text" maxlength="1000" autocomplete="off" placeholder="Ask about remedies, shipping, the Grimoire…" />
          <button type="submit">Ask</button>
        </form>
      </div>
      <button type="button" class="lunna-fab" aria-controls="lunnaPanel" aria-expanded="false">✦ Ask Lunna</button>`;
    document.body.appendChild(root);

    panel = root.querySelector('.lunna-panel');
    log = root.querySelector('.lunna-log');
    input = root.querySelector('#lunnaInput');
    sendBtn = root.querySelector('button[type=submit]');
    addMsg('note', "Hi, I'm Lunna, an AI guide for Amber's Alchemy Apothecary. I can help you find remedies and answer shop questions. I can't give medical advice.");

    root.querySelector('.lunna-fab').addEventListener('click', () => (panel.hidden ? open() : close()));
    root.querySelector('.lunna-close').addEventListener('click', close);
    root.querySelector('form').addEventListener('submit', e => { e.preventDefault(); send(input.value); });
    panel.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  function open(question) {
    if (!root) build();
    panel.hidden = false;
    root.querySelector('.lunna-fab').setAttribute('aria-expanded', 'true');
    track('lunna_open');
    if (typeof question === 'string' && question.trim()) send(question);
    else setTimeout(() => input.focus(), 30);
  }

  function close() {
    if (!panel) return;
    panel.hidden = true;
    const fab = root.querySelector('.lunna-fab');
    fab.setAttribute('aria-expanded', 'false');
    fab.focus();
  }

  async function send(text) {
    const message = String(text || '').trim().slice(0, 1000);
    if (!message || busy) return;
    busy = true;
    sendBtn.disabled = true;
    input.value = '';
    addMsg('user', message);
    const pending = addMsg('assistant', '…');
    track('lunna_message');
    try {
      const res = await fetch('/api/lunna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: history.slice(-8) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Lunna is resting right now.');
      pending.textContent = data.reply;
      history.push({ role: 'user', content: message }, { role: 'assistant', content: data.reply });
      if (data.escalate) track('lunna_escalate', { reason: data.escalate });
    } catch (err) {
      pending.textContent = err.message || 'Lunna is resting right now. Please try again, or use the Contact page.';
    } finally {
      busy = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  window.Lunna = { open, close };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
