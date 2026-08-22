// herbal-ai-chat.js
// Frontend chat widget for the Amber's Alchemy AI herbal advisor.
// Connects to /api/ai/chat (Vercel AI Gateway) with streaming responses.
// Drop <script src="herbal-ai-chat.js"></script> on any page to add the chat.

(function () {
  'use strict';

  const STYLE = `
    #amber-ai-chat {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 99999;
      font-family: 'Georgia', 'Times New Roman', serif;
    }
    #amber-ai-chat-toggle {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2c1454, #1e1148);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(30, 17, 72, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
      margin-left: auto;
    }
    #amber-ai-chat-toggle:hover { transform: scale(1.05); }
    #amber-ai-chat-toggle svg { width: 28px; height: 28px; color: #d4af37; }
    #amber-ai-chat-panel {
      display: none;
      width: 360px;
      max-width: calc(100vw - 40px);
      height: 480px;
      max-height: calc(100vh - 80px);
      background: #110a20;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(10, 6, 24, 0.5);
      flex-direction: column;
      overflow: hidden;
      margin-bottom: 8px;
    }
    #amber-ai-chat-panel.open { display: flex; }
    #amber-ai-chat-header {
      background: linear-gradient(135deg, #1e1148, #2c1454);
      color: #d4af37;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    #amber-ai-chat-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    #amber-ai-chat-header p {
      margin: 0;
      font-size: 11px;
      opacity: 0.85;
    }
    #amber-ai-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scroll-behavior: smooth;
    }
    .amber-chat-msg {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
    }
    .amber-chat-msg.user {
      background: #2c1454;
      color: #d4af37;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .amber-chat-msg.assistant {
      background: #1e1148;
      color: #f4e8d0;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }
    .amber-chat-typing {
      align-self: flex-start;
      color: #c8b79a;
      font-size: 13px;
      font-style: italic;
      padding: 6px 0;
    }
    #amber-ai-chat-input-area {
      padding: 12px;
      border-top: 1px solid rgba(212, 175, 55, 0.28);
      display: flex;
      gap: 8px;
    }
    #amber-ai-chat-input {
      flex: 1;
      border: 1px solid rgba(212, 175, 55, 0.28);
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 14px;
      font-family: inherit;
      outline: none;
      background: #110a20;
      color: #f4e8d0;
    }
    #amber-ai-chat-input:focus { border-color: #d4af37; }
    #amber-ai-chat-send {
      background: #2c1454;
      color: #d4af37;
      border: none;
      border-radius: 10px;
      padding: 0 18px;
      cursor: pointer;
      font-size: 14px;
      font-family: inherit;
      transition: background 0.2s;
    }
    #amber-ai-chat-send:hover { background: #d4af37; color: #1e1148; }
    #amber-ai-chat-send:disabled { background: #555; cursor: not-allowed; }
    #amber-ai-chat-messages::-webkit-scrollbar { width: 6px; }
    #amber-ai-chat-messages::-webkit-scrollbar-thumb { background: #6E4B7E; border-radius: 3px; }
  `;

  // Inject styles
  const styleEl = document.createElement('style');
  styleEl.textContent = STYLE;
  document.head.appendChild(styleEl);

  // Build the widget
  const container = document.createElement('div');
  container.id = 'amber-ai-chat';
  container.innerHTML = `
    <div id="amber-ai-chat-panel">
      <div id="amber-ai-chat-header">
        <h3>🌿 Ask the Apothecary</h3>
        <p>Powered by AI</p>
      </div>
      <div id="amber-ai-chat-messages">
        <div class="amber-chat-msg assistant">
          Hello, dear one. I'm your herbal advisor. Ask me about herbs, remedies, or wellness support — I'm here to help you find what nature offers. 🌱
        </div>
      </div>
      <div id="amber-ai-chat-input-area">
        <input type="text" id="amber-ai-chat-input" placeholder="Ask about herbs or wellness..." maxlength="2000" />
        <button id="amber-ai-chat-send">Send</button>
      </div>
    </div>
    <button id="amber-ai-chat-toggle" title="Ask the Apothecary">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2a4 4 0 0 1 4 4c0 1.5-1 2.5-1 4s1 2.5 1 4a4 4 0 0 1-4 4"/>
        <path d="M8 8a4 4 0 0 0-4 4c0 1.5 1 2.5 1 4s-1 2.5-1 4a4 4 0 0 0 4 4"/>
        <path d="M9 12h6"/>
        <path d="M9 16h6"/>
      </svg>
    </button>
  `;
  document.body.appendChild(container);

  // State
  const panel = container.querySelector('#amber-ai-chat-panel');
  const toggle = container.querySelector('#amber-ai-chat-toggle');
  const messagesEl = container.querySelector('#amber-ai-chat-messages');
  const input = container.querySelector('#amber-ai-chat-input');
  const sendBtn = container.querySelector('#amber-ai-chat-send');
  let history = [];
  let isStreaming = false;

  // Toggle
  toggle.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) input.focus();
  });

  function addMessage(role, text) {
    const el = document.createElement('div');
    el.className = `amber-chat-msg ${role}`;
    el.textContent = text;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text || isStreaming) return;

    addMessage('user', text);
    history.push({ role: 'user', content: text });
    input.value = '';
    sendBtn.disabled = true;
    isStreaming = true;

    const typingEl = document.createElement('div');
    typingEl.className = 'amber-chat-typing';
    typingEl.textContent = 'The apothecary is gathering wisdom...';
    messagesEl.appendChild(typingEl);
    scrollToBottom();

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) {
        throw new Error('Service unavailable');
      }

      typingEl.remove();
      const assistantEl = addMessage('assistant', '');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        assistantEl.textContent = fullText;
        scrollToBottom();
      }

      history.push({ role: 'assistant', content: fullText });
    } catch (err) {
      typingEl.remove();
      addMessage('assistant', "I'm having trouble connecting to the herbal wisdom right now. Please try again in a moment. 🌿");
    } finally {
      isStreaming = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
})();
