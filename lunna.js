// LUNNA ASSISTANT — warm, intuitive, non-pushy guide widget
// Presents goal buttons, asks 1-2 follow-ups, then recommends next steps.
// Opens via #lunnaFab and the global window.openLunna() used by Final CTA Bar.
(function () {
  const fab = document.getElementById('lunnaFab');
  const prompt = document.getElementById('lunnaPrompt');
  const closeBtn = document.getElementById('lunnaClose');
  const body = document.getElementById('lunnaBody');
  if (!fab || !prompt || !body) return;

  const GOALS = {
    sleep: {
      icon: '😴',
      title: 'Better Sleep',
      intro: "Rest is sacred. Let's find what your nights are asking for.",
      followups: [
        { label: 'I fall asleep but wake at 2–4 a.m.', key: 'wake' },
        { label: 'I can’t fall asleep — racing thoughts', key: 'onset' },
        { label: 'I sleep but wake groggy', key: 'groggy' },
      ],
      recommend: {
        copy: "DreamEase is designed for exactly this — gentle, non-groggy, and deeply restful. Pair it with the lavender-honey soap for a full wind-down ritual.",
        actions: [
          { label: 'Shop DreamEase', action: 'product', target: 'dreamease-capsules' },
          { label: 'Sleep Ritual Guide', action: 'section', target: 'herb-index' },
        ],
      },
    },
    stress: {
      icon: '🧘',
      title: 'Less Stress',
      intro: "Your nervous system has been working overtime. Let's give it support.",
      followups: [
        { label: 'Daily tension I can’t shake', key: 'chronic' },
        { label: 'Anxious, wound-up feeling', key: 'acute' },
        { label: 'Burnout / exhausted-but-wired', key: 'burnout' },
      ],
      recommend: {
        copy: "Chill Pill (adaptogens + nervines) is our most-loved stress ally. Many also add the Bath Ritual blend to shift the body out of fight-or-flight.",
        actions: [
          { label: 'Shop Chill Pill', action: 'product', target: 'chill-pill' },
          { label: 'Build Custom Blend', action: 'section', target: 'custom-formula' },
        ],
      },
    },
    skin: {
      icon: '✨',
      title: 'Skin Support',
      intro: "Skin shows what's happening underneath. Let's start from the outside in.",
      followups: [
        { label: 'Aging / dryness / firmness', key: 'aging' },
        { label: 'Sensitive / reactive skin', key: 'sensitive' },
        { label: 'Just want a beautiful ritual', key: 'ritual' },
      ],
      recommend: {
        copy: "Try the Age Reversal Balm or a custom soap blend with rose clay and oat. Many customers pair them for a full am/pm ritual.",
        actions: [
          { label: 'Age Reversal Balm', action: 'product', target: 'beauty-balm' },
          { label: 'Build Custom Soap', action: 'soap-builder' },
        ],
      },
    },
    soap: {
      icon: '🧼',
      title: 'Custom Soap',
      intro: "A soap as unique as you are — start the guided builder whenever you're ready.",
      followups: [
        { label: 'Sensitive skin — keep it gentle', key: 'gentle' },
        { label: 'Show me bold scents', key: 'bold' },
        { label: 'Surprise me — Amber’s choice', key: 'surprise' },
      ],
      recommend: {
        copy: "The guided builder walks you through each choice — base, scent, benefits, add-ons — in under three minutes.",
        actions: [
          { label: 'Start Guided Builder', action: 'soap-builder' },
          { label: 'View Soap Collection', action: 'section', target: 'soaps' },
        ],
      },
    },
    energy: {
      icon: '⚡',
      title: 'Energy Support',
      intro: "Sustained, clean energy — not jitters. Adaptogens do this beautifully.",
      followups: [
        { label: 'Afternoon crashes', key: 'crash' },
        { label: 'Low-level fatigue all day', key: 'chronic' },
        { label: 'Caffeine is stopping working', key: 'caffeine' },
      ],
      recommend: {
        copy: "Vital Connect is the most-loved pick — adaptogenic, smooth, no crash. The Alchemy Tea is a gentler everyday companion.",
        actions: [
          { label: 'Shop Vital Connect', action: 'product', target: 'vital-connect' },
          { label: 'Shop Alchemy Tea', action: 'section', target: 'shop' },
        ],
      },
    },
    balance: {
      icon: '🌸',
      title: 'Emotional Balance',
      intro: "Hormones, mood, cycles — herbs can help the body return to itself.",
      followups: [
        { label: 'Cycle / PMS support', key: 'cycle' },
        { label: 'Mood shifts / low days', key: 'mood' },
        { label: 'Perimenopause support', key: 'peri' },
      ],
      recommend: {
        copy: "Sacred Balance is our gentle daily blend for hormonal equilibrium. Many pair it with a consultation for the most personalized plan.",
        actions: [
          { label: 'Shop Sacred Balance', action: 'product', target: 'sacred-balance' },
          { label: 'Book Consultation', action: 'book' },
        ],
      },
    },
    shop: {
      icon: '🫙',
      title: 'Shop Products',
      intro: "Enter the apothecary — every remedy is handcrafted in small batches.",
      followups: [
        { label: 'Best sellers', key: 'best' },
        { label: 'By goal / concern', key: 'goal' },
        { label: 'Soaps & rituals', key: 'soap' },
      ],
      recommend: {
        copy: "Jump straight into the shop — or take the quiz for a personalized match in under two minutes.",
        actions: [
          { label: 'Enter the Shop', action: 'section', target: 'shop' },
          { label: 'Take the Quiz', action: 'quiz' },
        ],
      },
    },
    learn: {
      icon: '📖',
      title: 'Learn Herbs',
      intro: "The Living Grimoire holds the wisdom — rituals, herbs, and sacred practice.",
      followups: [
        { label: 'I’m brand new to herbs', key: 'new' },
        { label: 'I want deep-dive articles', key: 'deep' },
        { label: 'Show me sacred rituals', key: 'ritual' },
      ],
      recommend: {
        copy: "The Grimoire is alive and growing. Articles & Guides are a gentle on-ramp; the Herb Encyclopedia is a deeper reference.",
        actions: [
          { label: 'Enter the Grimoire', action: 'section', target: 'herb-index' },
          { label: 'Articles & Guides', action: 'section', target: 'herbal-wisdom' },
        ],
      },
    },
    book: {
      icon: '📅',
      title: 'Book with Amber',
      intro: "A private consultation — one conversation, and a plan shaped around you.",
      followups: [],
      recommend: {
        copy: "Pick a time that feels right. Amber’s calendar shows real availability.",
        actions: [
          { label: 'Book Consultation', action: 'book' },
          { label: 'About Amber', action: 'section', target: 'about' },
        ],
      },
    },
    unsure: {
      icon: '🌿',
      title: "I’m Not Sure",
      intro: "That’s completely okay. Let's find the right starting point together.",
      followups: [
        { label: 'Show me where to start', key: 'start' },
        { label: 'I want a quick quiz', key: 'quiz' },
        { label: 'I want to talk to Amber', key: 'amber' },
      ],
      recommend: {
        copy: "The herbal quiz is the fastest path — two minutes, and you’ll have a personalized starting point.",
        actions: [
          { label: 'Take the Quiz', action: 'quiz' },
          { label: 'Book Consultation', action: 'book' },
        ],
      },
    },
  };

  const BOOKING_URL = 'https://calendar.app.google/zSzB4LLvngFVmiqu7';
  let currentGoal = null;

  function openPrompt() {
    prompt.classList.add('lunna-open');
    prompt.setAttribute('aria-hidden', 'false');
    resetToGoals();
  }
  function closePrompt() {
    prompt.classList.remove('lunna-open');
    prompt.setAttribute('aria-hidden', 'true');
  }

  fab.addEventListener('click', () => {
    if (prompt.classList.contains('lunna-open')) closePrompt();
    else openPrompt();
  });
  closeBtn.addEventListener('click', closePrompt);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && prompt.classList.contains('lunna-open')) closePrompt();
  });

  function resetToGoals() {
    currentGoal = null;
    body.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'lunna-goal-grid';
    Object.keys(GOALS).forEach((key) => {
      const g = GOALS[key];
      const btn = document.createElement('button');
      btn.className = 'lunna-goal';
      btn.dataset.lunnaGoal = key;
      btn.textContent = `${g.icon}  ${g.title}`;
      btn.addEventListener('click', () => pickGoal(key));
      grid.appendChild(btn);
    });
    body.appendChild(grid);
    const titleEl = document.getElementById('lunnaPromptTitle');
    if (titleEl) titleEl.textContent = 'What are your goals today?';
  }

  function pickGoal(key) {
    currentGoal = key;
    const goal = GOALS[key];
    body.innerHTML = '';

    const titleEl = document.getElementById('lunnaPromptTitle');
    if (titleEl) titleEl.textContent = goal.title;

    const msg = document.createElement('div');
    msg.className = 'lunna-msg';
    msg.textContent = goal.intro;
    body.appendChild(msg);

    if (goal.followups && goal.followups.length) {
      const q = document.createElement('div');
      q.className = 'lunna-msg';
      q.textContent = "A quick question — which feels closest?";
      body.appendChild(q);

      const group = document.createElement('div');
      group.className = 'lunna-followup-group';
      goal.followups.forEach((f) => {
        const b = document.createElement('button');
        b.className = 'lunna-followup';
        b.textContent = f.label;
        b.addEventListener('click', () => showRecommendation(key, f.key));
        group.appendChild(b);
      });
      body.appendChild(group);
    } else {
      showRecommendation(key, null);
      return;
    }

    appendBack();
  }

  function showRecommendation(goalKey, followupKey) {
    const goal = GOALS[goalKey];
    body.innerHTML = '';

    const msg = document.createElement('div');
    msg.className = 'lunna-msg';
    msg.textContent = goal.recommend.copy;
    body.appendChild(msg);

    const actions = document.createElement('div');
    actions.className = 'lunna-actions';
    goal.recommend.actions.forEach((act, idx) => {
      const node = buildActionNode(act);
      if (idx > 0) node.classList.add('lunna-action-ghost');
      actions.appendChild(node);
    });
    body.appendChild(actions);

    // Log an anonymous lunna session (fire-and-forget)
    try {
      fetch('/.netlify/functions/lunna-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goalKey, followup: followupKey, at: new Date().toISOString() }),
      }).catch(() => {});
    } catch (_) {}

    appendBack();
  }

  function buildActionNode(act) {
    if (act.action === 'book') {
      const a = document.createElement('a');
      a.className = 'lunna-action';
      a.href = BOOKING_URL;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = act.label;
      return a;
    }
    const btn = document.createElement('button');
    btn.className = 'lunna-action';
    btn.textContent = act.label;
    btn.addEventListener('click', () => {
      closePrompt();
      if (act.action === 'section' && typeof window.showSection === 'function') {
        window.showSection(act.target);
      } else if (act.action === 'product' && typeof window.navigateToProduct === 'function') {
        window.navigateToProduct(act.target);
      } else if (act.action === 'soap-builder' && typeof window.openSoapBuilder === 'function') {
        window.openSoapBuilder();
      } else if (act.action === 'quiz' && typeof window.openHerbalAdvisor === 'function') {
        window.openHerbalAdvisor();
      } else if (act.action === 'section') {
        // Fallback to hash navigation
        location.hash = '#' + act.target;
      }
    });
    return btn;
  }

  function appendBack() {
    const back = document.createElement('button');
    back.className = 'lunna-back';
    back.textContent = '← Back to goals';
    back.addEventListener('click', resetToGoals);
    body.appendChild(back);
  }

  window.openLunna = openPrompt;
  window.closeLunna = closePrompt;
})();
