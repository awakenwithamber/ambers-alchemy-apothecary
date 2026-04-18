// ============================================================
// REMEDY FLOW — Shared state & logic for symptom → quiz → builder
// Persists selections across the entire remedy creation flow
// ============================================================

(function() {
  'use strict';

  const STORAGE_KEY = 'remedyFlowState';

  const DEFAULT_STATE = {
    symptoms: [],
    quizAnswers: {},
    selectedHerbs: [],
    recommendedHerbs: [],
    recommendedForm: null,
    recommendedFormExplanation: '',
    herbChoiceMode: null, // 'keep-all' | 'recommended' | 'customize'
    finalHerbs: [],
    remedyMode: 'combined', // 'combined' | 'separate'
    step: null
  };

  // ---- Form Recommendation Logic ----
  const FORM_RECOMMENDATIONS = {
    sleep:        { form: 'loose-tea',  label: 'Tea Blend',  explanation: 'Tea Blend — best for calming evening rituals and gentle support' },
    stress:       { form: 'loose-tea',  label: 'Tea Blend',  explanation: 'Tea Blend — best for calming evening rituals and gentle support' },
    energy:       { form: 'capsule',    label: 'Capsules',   explanation: 'Capsules — best for daily convenience and consistent internal support' },
    immune:       { form: 'capsule',    label: 'Capsules',   explanation: 'Capsules — best for daily convenience and consistent internal support' },
    hormones:     { form: 'capsule',    label: 'Capsules',   explanation: 'Capsules — best for daily convenience and consistent internal support' },
    digestion:    { form: 'loose-tea',  label: 'Tea Blend',  explanation: 'Tea Blend — best for soothing digestive support and gentle absorption' },
    pain:         { form: 'balm',       label: 'Balm',       explanation: 'Balm — best for targeted topical support and deep relief' },
    beauty:       { form: 'serum',      label: 'Serum',      explanation: 'Serum — best for skin-focused botanical support and radiance' },
    cognitive:    { form: 'capsule',    label: 'Capsules',   explanation: 'Capsules — best for daily convenience and consistent internal support' },
    wellness:     { form: 'capsule',    label: 'Capsules',   explanation: 'Capsules — best for daily convenience and consistent internal support' }
  };

  const FORM_EXPLANATIONS = {
    'loose-tea':  'Tea Blend — best for calming evening rituals and gentle support',
    'tea-bags':   'Tea Bags — convenient pre-portioned botanical tea for daily use',
    'capsule':    'Capsules — best for daily convenience and consistent internal support',
    'tincture':   'Tincture — fast-absorbing liquid extract for targeted support',
    'balm':       'Balm — best for targeted topical support and deep relief',
    'salve':      'Salve — protective beeswax-based topical for skin and muscles',
    'serum':      'Serum — best for skin-focused botanical support and radiance',
    'poultice':   'Poultice — traditional topical herb compress for localized support'
  };

  // Determine best remedy form from multiple symptoms
  function recommendForm(symptoms) {
    if (!symptoms || symptoms.length === 0) {
      return FORM_RECOMMENDATIONS.wellness;
    }

    // Score each form type based on symptom priorities
    var formScores = {};
    symptoms.forEach(function(symptom) {
      var rec = FORM_RECOMMENDATIONS[symptom];
      if (rec) {
        formScores[rec.form] = (formScores[rec.form] || 0) + 1;
      }
    });

    // Topical symptoms override internal defaults
    var hasTopical = symptoms.some(function(s) { return s === 'pain' || s === 'beauty'; });
    var hasInternal = symptoms.some(function(s) { return s === 'sleep' || s === 'stress' || s === 'energy' || s === 'immune' || s === 'hormones' || s === 'digestion' || s === 'cognitive' || s === 'wellness'; });

    // If mixed topical + internal, prefer capsules for broad coverage
    if (hasTopical && hasInternal) {
      return { form: 'capsule', label: 'Capsules', explanation: 'Capsules — best for daily convenience when addressing multiple concerns' };
    }

    // Pick highest-scored form
    var bestForm = null;
    var bestScore = 0;
    for (var form in formScores) {
      if (formScores[form] > bestScore) {
        bestScore = formScores[form];
        bestForm = form;
      }
    }

    if (bestForm) {
      return {
        form: bestForm,
        label: FORM_RECOMMENDATIONS[symptoms[0]].label,
        explanation: FORM_EXPLANATIONS[bestForm] || ''
      };
    }

    return FORM_RECOMMENDATIONS.wellness;
  }

  // Collect recommended herbs across all selected symptoms (deduplicated, max 8)
  function getRecommendedHerbs(symptoms) {
    if (typeof ADVISOR_DATA === 'undefined') return [];
    var seen = {};
    var result = [];
    symptoms.forEach(function(symptom) {
      var herbIds = ADVISOR_DATA.herbRecommendations[symptom] || [];
      herbIds.forEach(function(id) {
        if (!seen[id]) {
          seen[id] = true;
          result.push(id);
        }
      });
    });
    // Limit to top 8 for a focused recommendation
    return result.slice(0, 8);
  }

  // ---- State Management ----
  function loadState() {
    try {
      var stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        var parsed = JSON.parse(stored);
        // Merge with defaults to ensure all keys exist
        var state = {};
        for (var key in DEFAULT_STATE) {
          state[key] = parsed[key] !== undefined ? parsed[key] : DEFAULT_STATE[key];
        }
        return state;
      }
    } catch(e) {}
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  function saveState(state) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch(e) {}
  }

  function clearState() {
    sessionStorage.removeItem(STORAGE_KEY);
  }

  function getState() {
    return loadState();
  }

  function updateState(updates) {
    var state = loadState();
    for (var key in updates) {
      if (updates.hasOwnProperty(key)) {
        state[key] = updates[key];
      }
    }
    saveState(state);
    return state;
  }

  // ============================================================
  // PATTERN SYNTHESIS — Root-cause imbalance patterns
  // Moves recommendations from "symptom → product" to
  // "symptom → pattern → root support → personal allies"
  // ============================================================

  // Imbalance Patterns (herbalist framing, strictly wellness-safe)
  const PATTERNS = {
    'nervous-overwhelm': {
      id: 'nervous-overwhelm',
      name: 'Nervous System Overwhelm',
      summary: 'Your system is running hot. The signals we hear — difficulty settling, a busy mind, tension that lingers — point to a nervous system asking for deeper softening and sustained support.',
      rootSupport: 'Nervines to soften the edges, gentle adaptogens to restore tone, and evening rituals that invite the body back into parasympathetic rest.',
      flagshipId: 'dreamease-capsules',
      flagshipReason: 'A proven nightly ally for a softened nervous system — lavender, chamomile, and rose quiet a busy mind without leaving you groggy.',
      preferredForm: 'loose-tea',
      allies: [
        { id: 'passionflower', benefit: 'Softens a looping, worried mind', whySource: ['stress', 'sleep', 'racing-mind'] },
        { id: 'lemon-balm', benefit: 'Lifts mood while calming the nerves', whySource: ['stress', 'mood', 'emotional'] },
        { id: 'lavender', benefit: 'Invites the body into rest and ease', whySource: ['sleep', 'tension'] },
        { id: 'ashwagandha', benefit: 'Gently rebuilds stress reserves over time', whySource: ['stress', 'burnout', 'duration-long'] },
        { id: 'skullcap', benefit: 'Eases nervous tension held in the body', whySource: ['tension', 'anxiety'] }
      ],
      triggers: {
        symptoms: ['sleep', 'stress'],
        minMatches: 1,
        boosters: ['racing-mind', 'light-sleep', 'tension']
      }
    },
    'stress-depletion': {
      id: 'stress-depletion',
      name: 'Stress Depletion',
      summary: 'The pattern here is not simply tiredness — it is depletion from carrying too much for too long. Your reserves are asking to be refilled rather than pushed.',
      rootSupport: 'Restorative adaptogens to rebuild stamina, mineral-rich botanicals to replenish, and rhythms that honor recovery as much as output.',
      flagshipId: 'vital-vitality',
      flagshipReason: 'A crafted adaptogenic blend for sustained, clean energy that restores your reserves instead of borrowing against them.',
      preferredForm: 'capsule',
      allies: [
        { id: 'ashwagandha', benefit: 'Rebuilds stamina after prolonged stress', whySource: ['stress', 'burnout', 'energy', 'duration-long'] },
        { id: 'rhodiola', benefit: 'Supports mental endurance and mood', whySource: ['energy', 'cognitive', 'mental-fog'] },
        { id: 'eleuthero', benefit: 'Steadies the body through demanding seasons', whySource: ['energy', 'duration-long'] },
        { id: 'holy-basil', benefit: 'Nourishes resilience under pressure', whySource: ['stress', 'mood'] },
        { id: 'nettle', benefit: 'Replenishes depleted minerals gently', whySource: ['energy', 'burnout'] }
      ],
      triggers: {
        symptoms: ['energy', 'stress', 'cognitive'],
        minMatches: 2,
        boosters: ['burnout', 'afternoon-crash', 'duration-long']
      }
    },
    'digestive-sluggishness': {
      id: 'digestive-sluggishness',
      name: 'Digestive Sluggishness',
      summary: 'Your digestive rhythm sounds tired — heavy after meals, slow to move, sensitive to stress. The body is asking for warming, bittering support to reawaken its natural flow.',
      rootSupport: 'Digestive bitters and carminatives to restart motility, warming herbs to support the digestive fire, and mealtime rituals that honor the pace of digestion.',
      flagshipId: null,
      flagshipReason: '',
      preferredForm: 'loose-tea',
      allies: [
        { id: 'ginger', benefit: 'Wakes up a sluggish digestive fire', whySource: ['digestion', 'bloating', 'after-eating'] },
        { id: 'fennel', benefit: 'Eases bloating and bringing flow back', whySource: ['digestion', 'bloating'] },
        { id: 'peppermint', benefit: 'Soothes tension in the gut', whySource: ['digestion', 'stress'] },
        { id: 'chamomile', benefit: 'Calms the gut-mind connection', whySource: ['digestion', 'stress', 'emotional'] },
        { id: 'dandelion', benefit: 'Supports the liver\'s rhythm of renewal', whySource: ['digestion', 'stagnation'] }
      ],
      triggers: {
        symptoms: ['digestion'],
        minMatches: 1,
        boosters: ['bloating', 'after-eating', 'slow-digestion']
      }
    },
    'immune-strain': {
      id: 'immune-strain',
      name: 'Immune Strain',
      summary: 'The body is stretching its defenses — seasonal shifts, recovery, or cumulative stress is asking more of your immune system than it can comfortably give right now.',
      rootSupport: 'Deep immune tonics to rebuild reserves, daily resilience herbs to hold the line, and restorative practices that let recovery happen.',
      flagshipId: 'immune-at-ease',
      flagshipReason: 'A daily botanical shield — elderberry, astragalus, and reishi supporting resilience through every season.',
      preferredForm: 'capsule',
      allies: [
        { id: 'elderberry', benefit: 'Classic ally for seasonal resilience', whySource: ['immune', 'seasonal'] },
        { id: 'astragalus', benefit: 'Builds deep, long-term immune reserves', whySource: ['immune', 'duration-long'] },
        { id: 'reishi', benefit: 'Supports immune intelligence and restoration', whySource: ['immune', 'stress'] },
        { id: 'echinacea', benefit: 'Activates first-line defenses when needed', whySource: ['immune', 'acute'] },
        { id: 'holy-basil', benefit: 'Nourishes resilience across body and mind', whySource: ['immune', 'stress'] }
      ],
      triggers: {
        symptoms: ['immune'],
        minMatches: 1,
        boosters: ['seasonal', 'post-illness', 'low-reserves']
      }
    },
    'stagnation': {
      id: 'stagnation',
      name: 'Stagnation',
      summary: 'Signals of tightness, held tension, and slowed flow suggest stagnation — energy, circulation, or lymph asking to move. The body wants to return to motion.',
      rootSupport: 'Circulatory and moving herbs, warming topicals for tension, and practices that invite gentle movement back into the system.',
      flagshipId: 'pain-balm',
      flagshipReason: 'A deeply soothing botanical balm — turmeric, cayenne, arnica, and comfrey working together where the body holds tension.',
      preferredForm: 'balm',
      allies: [
        { id: 'turmeric', benefit: 'Supports the body through inflammation cycles', whySource: ['pain', 'chronic'] },
        { id: 'ginger', benefit: 'Moves warmth into stagnant places', whySource: ['pain', 'stagnation', 'digestion'] },
        { id: 'arnica', benefit: 'Traditional ally for held tension and soreness', whySource: ['pain', 'muscle'] },
        { id: 'rosemary', benefit: 'Awakens circulation and clears the head', whySource: ['pain', 'cognitive', 'beauty'] },
        { id: 'cayenne', benefit: 'Draws warmth to cold, stiff places', whySource: ['pain', 'cold'] }
      ],
      triggers: {
        symptoms: ['pain'],
        minMatches: 1,
        boosters: ['chronic', 'tension', 'cold']
      }
    }
  };

  // Score each pattern given symptoms + whole-human + nuance signals
  // Signals: strings collected from answers (e.g., 'racing-mind', 'duration-long', 'burnout')
  function synthesizePatterns(symptoms, signals) {
    symptoms = symptoms || [];
    signals = signals || [];
    var signalSet = {};
    signals.forEach(function(s) { if (s) signalSet[s] = true; });

    var scored = Object.keys(PATTERNS).map(function(key) {
      var p = PATTERNS[key];
      var score = 0;
      (p.triggers.symptoms || []).forEach(function(sym) {
        if (symptoms.indexOf(sym) !== -1) score += 3;
      });
      (p.triggers.boosters || []).forEach(function(b) {
        if (signalSet[b]) score += 2;
      });
      return { pattern: p, score: score };
    }).filter(function(s) { return s.score >= 3; });

    scored.sort(function(a, b) { return b.score - a.score; });

    if (scored.length === 0) {
      // Default to nervous-overwhelm if stress/sleep selected, else stress-depletion
      if (symptoms.indexOf('stress') !== -1 || symptoms.indexOf('sleep') !== -1) {
        return [{ pattern: PATTERNS['nervous-overwhelm'], score: 3 }];
      }
      return [{ pattern: PATTERNS['stress-depletion'], score: 3 }];
    }

    // Cap at top 2 patterns for focus
    return scored.slice(0, 2);
  }

  // Decide Custom vs Ready-Made based on layering, duration, and specificity
  // Returns: 'custom' | 'ready-made' | 'both'
  function recommendFormat(symptoms, signals, patterns) {
    symptoms = symptoms || [];
    signals = signals || [];
    patterns = patterns || [];

    var signalSet = {};
    signals.forEach(function(s) { if (s) signalSet[s] = true; });

    var layered = symptoms.length >= 3;
    var chronic = !!signalSet['duration-long'] || !!signalSet['chronic'];
    var specific = !!signalSet['sensitive'] || !!signalSet['specific-needs'];
    var multiplePatterns = patterns.length >= 2;
    var primaryPattern = patterns[0] && patterns[0].pattern;
    var hasFlagship = !!(primaryPattern && primaryPattern.flagshipId);

    if (layered || chronic || specific || multiplePatterns) {
      return hasFlagship ? 'both' : 'custom';
    }
    return hasFlagship ? 'ready-made' : 'custom';
  }

  // Gather allies across matched patterns, dedup, include per-herb reasons
  function gatherAllies(patterns, symptoms, signals) {
    symptoms = symptoms || [];
    signals = signals || [];
    var signalSet = {};
    signals.forEach(function(s) { if (s) signalSet[s] = true; });
    symptoms.forEach(function(s) { signalSet[s] = true; });

    var seen = {};
    var allies = [];
    patterns.forEach(function(entry) {
      (entry.pattern.allies || []).forEach(function(a) {
        if (seen[a.id]) return;
        seen[a.id] = true;
        var matched = (a.whySource || []).filter(function(src) { return signalSet[src]; });
        allies.push({
          id: a.id,
          benefit: a.benefit,
          patternName: entry.pattern.name,
          matchedSignals: matched
        });
      });
    });
    return allies.slice(0, 6);
  }

  // Translate raw signal tokens into human-readable phrases for the "why"
  const SIGNAL_PHRASES = {
    'sleep': 'sleep that feels unrefreshing',
    'stress': 'the stress you described',
    'energy': 'your need for more steady energy',
    'digestion': 'the digestive rhythm you shared',
    'immune': 'the immune support you\'re seeking',
    'pain': 'the tension your body is holding',
    'cognitive': 'the mental clarity you\'re after',
    'beauty': 'your focus on skin and radiance',
    'hormones': 'the hormonal balance you\'re looking for',
    'racing-mind': 'a mind that won\'t settle',
    'light-sleep': 'light, easily-disturbed sleep',
    'tension': 'held physical tension',
    'burnout': 'signs of depletion',
    'afternoon-crash': 'afternoon energy dips',
    'duration-long': 'that this has been ongoing',
    'chronic': 'the long-standing nature of this',
    'mental-fog': 'mental fog',
    'bloating': 'bloating after meals',
    'after-eating': 'symptoms after eating',
    'slow-digestion': 'slowed digestion',
    'seasonal': 'seasonal vulnerability',
    'post-illness': 'recovery from recent illness',
    'low-reserves': 'low immune reserves',
    'muscle': 'muscle tension',
    'cold': 'cold, stiff places in the body',
    'stagnation': 'a sense of stagnation',
    'mood': 'the mood shifts you mentioned',
    'emotional': 'what you shared about emotional weight',
    'sensitive': 'your gentle-support preference',
    'acute': 'acute support needs',
    'specific-needs': 'your specific profile'
  };

  function humanSignalPhrase(token) {
    return SIGNAL_PHRASES[token] || token.replace(/-/g, ' ');
  }

  // Lifestyle rituals (non-product) per pattern — 2-3 per pattern
  const LIFESTYLE_RITUALS = {
    'nervous-overwhelm': [
      { title: 'The 4-7-8 Breath', desc: 'Inhale for 4, hold for 7, exhale for 8. Three cycles before bed invites the nervous system to soften.' },
      { title: 'A Screen-Free Hour', desc: 'Dim the lights and close the laptop one hour before sleep — the simplest nervine there is.' },
      { title: 'Warm Water + Salt', desc: 'A cup of warm water with a pinch of good salt in the evening supports mineral balance and calm.' }
    ],
    'stress-depletion': [
      { title: 'Morning Sunlight', desc: 'Ten minutes of outdoor light within the first hour of waking steadies your internal rhythms.' },
      { title: 'Protein-Forward Breakfast', desc: 'A breakfast with real protein stabilizes energy better than any stimulant.' },
      { title: 'Name One Thing to Drop', desc: 'Recovery asks us to carry less, not just push through. Each morning, name one thing you can release today.' }
    ],
    'digestive-sluggishness': [
      { title: 'Warm Lemon Water', desc: 'A cup of warm water with lemon on waking gently invites digestion back online.' },
      { title: 'Eat Without Screens', desc: 'The vagus nerve works best when we slow down. One meal a day, no screens — feel the difference.' },
      { title: 'A Short Walk After Meals', desc: 'Ten minutes of gentle movement supports digestive motility more than any herb alone.' }
    ],
    'immune-strain': [
      { title: 'Sleep First', desc: 'Prioritize 7–9 hours before anything else — the immune system does its deepest work there.' },
      { title: 'Hydrate with Minerals', desc: 'Plain water isn\'t always enough. A pinch of salt or mineral drops supports lymphatic flow.' },
      { title: 'Gentle Movement', desc: 'Walking, stretching, or yoga supports the lymphatic pump — no heroic workouts needed.' }
    ],
    'stagnation': [
      { title: 'Five Minutes of Movement', desc: 'Any movement, every hour. Stagnation yields first to consistency, not intensity.' },
      { title: 'Contrast Shower', desc: 'End your shower with 30 seconds cool. Circulation responds beautifully to gentle contrast.' },
      { title: 'Deep Hip Stretch', desc: 'A few minutes in a supported squat or pigeon pose invites stagnant energy back into motion.' }
    ]
  };

  function getLifestyleRituals(patterns) {
    var rituals = [];
    var seen = {};
    (patterns || []).forEach(function(entry) {
      var list = LIFESTYLE_RITUALS[entry.pattern.id] || [];
      list.forEach(function(r) {
        if (seen[r.title]) return;
        seen[r.title] = true;
        rituals.push(r);
      });
    });
    return rituals.slice(0, 3);
  }

  // ---- Expose globally ----
  window.RemedyFlow = {
    getState: getState,
    updateState: updateState,
    clearState: clearState,
    saveState: function(state) { saveState(state); },
    recommendForm: recommendForm,
    getRecommendedHerbs: getRecommendedHerbs,
    FORM_EXPLANATIONS: FORM_EXPLANATIONS,
    DEFAULT_STATE: DEFAULT_STATE,
    PATTERNS: PATTERNS,
    synthesizePatterns: synthesizePatterns,
    recommendFormat: recommendFormat,
    gatherAllies: gatherAllies,
    humanSignalPhrase: humanSignalPhrase,
    getLifestyleRituals: getLifestyleRituals
  };

})();
