// ============================================================
// GUIDED WELLNESS QUIZ — "The Synthesis"
// A calm, mystical, emotionally-guided assessment that moves
// from Symptom -> Pattern -> Root Support -> Allies -> ONE Remedy.
//
// Single-remedy flow. No multi-CTA clutter on results.
// Emotional microcopy. Multi-select where it's appropriate.
// Never diagnose. Never cure.
// ============================================================

const ADVISOR_DATA = {
  goals: [
    { id: 'sleep',     label: 'Sleep',           icon: '\u{1F319}', desc: 'Rest that feels restorative, not borrowed.' },
    { id: 'energy',    label: 'Energy',          icon: '\u26A1',    desc: 'Steady vitality without the crash.' },
    { id: 'stress',    label: 'Stress & Calm',   icon: '\u{1F33F}', desc: 'A softer nervous system. Space to breathe.' },
    { id: 'immune',    label: 'Immune Support',  icon: '\u{1F6E1}\uFE0F', desc: 'Resilience through every season.' },
    { id: 'hormones',  label: 'Hormonal Balance',icon: '\u{1F338}', desc: 'Support for cycles, mood, and shifts.' },
    { id: 'digestion', label: 'Digestion',       icon: '\u{1FAC1}', desc: 'A gut that feels at ease again.' },
    { id: 'pain',      label: 'Tension & Pain',  icon: '\u{1F525}', desc: 'Relief for what the body is holding.' },
    { id: 'beauty',    label: 'Skin & Radiance', icon: '\u2728',    desc: 'Inner and outer glow, nourished deeply.' },
    { id: 'cognitive', label: 'Focus & Clarity', icon: '\u{1F9E0}', desc: 'A mind that can settle and engage.' },
    { id: 'wellness',  label: 'General Wellness',icon: '\u{1F331}', desc: 'Daily balance and quiet resilience.' }
  ],

  triggers: [
    { id: 'work-pressure',    label: 'Work or caregiving pressure', icon: '\u2696\uFE0F' },
    { id: 'screens-late',     label: 'Late-night screens',          icon: '\u{1F4F1}' },
    { id: 'poor-sleep',       label: 'Not sleeping enough',         icon: '\u{1F319}' },
    { id: 'big-transition',   label: 'A recent life transition',    icon: '\u{1F343}' },
    { id: 'overstim',         label: 'Overstimulation or noise',    icon: '\u{1F30A}' },
    { id: 'diet-shifts',      label: 'Irregular meals or caffeine', icon: '\u2615' },
    { id: 'low-movement',     label: 'Less movement than usual',    icon: '\u{1F9D8}' },
    { id: 'relationship',     label: 'Relationship strain',         icon: '\u{1F494}' },
    { id: 'seasonal',         label: 'Seasonal or weather shifts',  icon: '\u{1F342}' },
    { id: 'none',             label: 'Nothing specific I can name', icon: '\u2728' }
  ],

  herbRecommendations: {
    sleep: ['valerian', 'passionflower', 'lemon-balm', 'chamomile', 'ashwagandha', 'lavender', 'mugwort', 'hops', 'skullcap', 'magnolia'],
    energy: ['ashwagandha', 'rhodiola', 'eleuthero', 'maca', 'ginseng', 'moringa', 'cordyceps', 'lion-mane', 'schisandra', 'licorice'],
    stress: ['ashwagandha', 'holy-basil', 'lemon-balm', 'passionflower', 'lavender', 'rhodiola', 'kava', 'skullcap', 'mimosa', 'albizzia'],
    immune: ['elderberry', 'echinacea', 'astragalus', 'reishi', 'turkey-tail', 'andrographis', 'oregano', 'garlic', 'cat-claw', 'propolis'],
    hormones: ['vitex', 'black-cohosh', 'dong-quai', 'maca', 'red-clover', 'shatavari', 'ashwagandha', 'evening-primrose', 'licorice', 'wild-yam'],
    digestion: ['ginger', 'fennel', 'peppermint', 'chamomile', 'licorice', 'marshmallow', 'slippery-elm', 'dandelion', 'artichoke', 'gentian'],
    pain: ['arnica', 'turmeric', 'ginger', 'boswellia', 'white-willow', 'devil-claw', 'cayenne', 'wintergreen', 'comfrey', 'meadowsweet'],
    beauty: ['rose-hip', 'sea-buckthorn', 'frankincense', 'neroli', 'helichrysum', 'horsetail', 'amla', 'nettle', 'burdock', 'calendula'],
    cognitive: ['lion-mane', 'bacopa', 'ginkgo', 'rhodiola', 'ashwagandha', 'rosemary', 'gotu-kola', 'holy-basil', 'schisandra', 'eleuthero'],
    wellness: ['ashwagandha', 'reishi', 'astragalus', 'moringa', 'nettle', 'turmeric', 'ginger', 'elderberry', 'holy-basil', 'schisandra']
  },

  productRecommendations: {
    sleep:    [{ id: 'dreamease-capsules' }, { id: 'lucid-dream-tea' }],
    energy:   [{ id: 'vital-vitality' }],
    stress:   [{ id: 'dreamease-capsules' }, { id: 'vital-vitality' }],
    immune:   [{ id: 'immune-at-ease' }],
    hormones: [{ id: 'vital-vitality' }, { id: 'collagen-rebuilder' }],
    digestion:[{ id: 'vital-vitality' }],
    pain:     [{ id: 'pain-balm' }],
    beauty:   [{ id: 'beauty-balm' }, { id: 'hair-serum' }, { id: 'collagen-rebuilder' }],
    cognitive:[{ id: 'vital-vitality' }],
    wellness: [{ id: 'immune-at-ease' }, { id: 'vital-vitality' }]
  }
};

// ---- Quiz state ----
let advisorState = makeFreshState();

// Gentle, supportive microcopy per step
const ADVISOR_REASSURANCE = {
  1: "Take a breath. There's no wrong answer here \u2014 we're just beginning to listen.",
  2: "You're doing beautifully. Each answer helps us hear the pattern beneath the symptom.",
  3: "The whole human matters \u2014 how you sleep, stress, and feel all shape the right plants for you.",
  4: "Almost there. Your match is taking shape \u2014 these final details make it truly yours.",
  5: "Your personalized report is ready. One quiet step, and it\u2019s yours to keep.",
  6: "Here is what your answers gently revealed."
};

function makeFreshState() {
  return {
    step: 1,
    primarySymptoms: [],
    triggers: [],
    intensity: null,
    frequency: null,
    duration: null,
    sleep: null,
    stressLevel: null,
    digestion: null,
    emotional: null,
    timeOfDay: [],
    sensitivity: null,
    preferredFormat: null,
    leadEmail: '',
    leadSms: '',
    leadSmsOptIn: false,
    leadCaptured: false,
    leadFirstName: '',
    extendedLeadFirstName: '',
    extendedLeadEmail: '',
    extendedResultsRequested: false,
    extendedResultsSending: false,
    patterns: null,
    allies: null,
    format: null
  };
}

function openHerbalAdvisor() {
  var flowState = window.RemedyFlow ? window.RemedyFlow.getState() : {};
  advisorState = makeFreshState();
  if (flowState && Array.isArray(flowState.symptoms) && flowState.symptoms.length > 0) {
    advisorState.primarySymptoms = flowState.symptoms.slice(0, 5);
  }
  renderAdvisorModal();
}

window.openHerbalAdvisor = openHerbalAdvisor;
window.startGuidedExperience = openHerbalAdvisor;

function renderAdvisorModal() {
  var existing = document.getElementById('herbal-advisor-modal');
  if (existing) existing.remove();

  var totalSteps = 6;
  var modal = document.createElement('div');
  modal.id = 'herbal-advisor-modal';
  modal.className = 'advisor-modal-overlay';
  modal.innerHTML =
    '<div class="advisor-modal">' +
      '<button class="advisor-close" aria-label="Close the quiz" onclick="closeHerbalAdvisor()">\u2715</button>' +
      '<div class="advisor-header">' +
        '<div class="advisor-oracle-icon">\u{1F33F}</div>' +
        '<h2 class="advisor-title">Your Guided Wellness Quiz</h2>' +
        '<p class="advisor-subtitle">A quiet conversation \u2014 not a prescription.</p>' +
      '</div>' +
      '<div class="advisor-progress" aria-hidden="true">' +
        '<div class="advisor-progress-bar" style="width:' + ((advisorState.step / totalSteps) * 100) + '%"></div>' +
      '</div>' +
      '<div class="advisor-progress-label">Step <span id="advisor-step-num">' + advisorState.step + '</span> of ' + totalSteps + '</div>' +
      (ADVISOR_REASSURANCE[advisorState.step] ? '<div class="advisor-reassurance" id="advisor-reassurance">\u2726 ' + ADVISOR_REASSURANCE[advisorState.step] + '</div>' : '') +
      '<div class="advisor-content" id="advisor-step-content">' +
        renderAdvisorStep() +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
  modal.addEventListener('click', function(e) { if (e.target === modal) closeHerbalAdvisor(); });
  document.addEventListener('keydown', advisorEscHandler);
}

function advisorEscHandler(e) {
  if (e.key === 'Escape') {
    var modal = document.getElementById('herbal-advisor-modal');
    if (modal) closeHerbalAdvisor();
  }
}

// Content swap without any window-level scroll side effects.
// On explicit step changes, gently return the modal scroll to top
// so the new step title is visible; within-step updates preserve position.
function updateAdvisorContent(onStepChange) {
  var modal = document.querySelector('.advisor-modal');
  var prevModalScroll = modal ? modal.scrollTop : 0;
  var content = document.getElementById('advisor-step-content');
  if (content) content.innerHTML = renderAdvisorStep();
  var bar = document.querySelector('.advisor-progress-bar');
  if (bar) bar.style.width = ((advisorState.step / 6) * 100) + '%';
  var num = document.getElementById('advisor-step-num');
  if (num) num.textContent = advisorState.step;
  var reassure = document.getElementById('advisor-reassurance');
  if (reassure && ADVISOR_REASSURANCE[advisorState.step]) {
    reassure.innerHTML = '\u2726 ' + ADVISOR_REASSURANCE[advisorState.step];
  }
  if (onStepChange) {
    if (modal) modal.scrollTop = 0;
  } else if (modal) {
    modal.scrollTop = prevModalScroll;
  }
  // Never touch window scroll — that caused disruptive page jumps.
}

function renderAdvisorStep() {
  switch (advisorState.step) {
    case 1: return renderFoundation();
    case 2: return renderShape();
    case 3: return renderWholeHuman();
    case 4: return renderNuance();
    case 5: return renderLeadCapture();
    case 6: return renderSynthesis();
    default: return '';
  }
}

// ============================================================
// STEP 1 — FOUNDATION
// ============================================================
function renderFoundation() {
  var count = advisorState.primarySymptoms.length;
  var countLine = count === 0
    ? '\u2726 Choose whatever resonates \u2014 pick as many as feel true, up to five.'
    : '\u2726 You\u2019ve chosen ' + count + '. Add more if they belong, or continue when you\u2019re ready.';
  return '<div class="advisor-step">' +
    '<h3 class="advisor-step-title">What is asking for support right now?</h3>' +
    '<p class="advisor-step-desc">This is the beginning of a conversation, not a checklist. You can pick more than one.</p>' +
    '<div class="advisor-goals-grid multi">' +
      ADVISOR_DATA.goals.map(function(g) {
        var sel = advisorState.primarySymptoms.indexOf(g.id) !== -1;
        return '<button type="button" class="advisor-goal-btn ' + (sel ? 'selected' : '') + '" data-goal="' + g.id + '" aria-pressed="' + (sel ? 'true' : 'false') + '">' +
          '<span class="advisor-goal-check" aria-hidden="true">\u2713</span>' +
          '<span class="advisor-goal-icon">' + g.icon + '</span>' +
          '<span class="advisor-goal-label">' + g.label + '</span>' +
          '<span class="advisor-goal-desc">' + g.desc + '</span>' +
        '</button>';
      }).join('') +
    '</div>' +
    '<p class="advisor-hint">' + countLine + '</p>' +
    '<div class="advisor-actions">' +
      '<span></span>' +
      '<button type="button" class="advisor-btn-primary" id="advisor-continue-1" ' + (count === 0 ? 'disabled' : '') + '>Continue \u2192</button>' +
    '</div>' +
  '</div>';
}

// ============================================================
// STEP 2 — SHAPE
// ============================================================
function renderShape() {
  var intensityOpts = [
    { id: 'gentle',      label: 'A whisper',             desc: 'Noticeable but mild \u2014 more of a nudge than a shout.' },
    { id: 'moderate',    label: 'Clearly present',       desc: 'Consistent enough that you\'re paying attention.' },
    { id: 'significant', label: 'Loud and persistent',   desc: 'It\u2019s shaping how your days feel.' }
  ];
  var freqOpts = [
    { id: 'occasional', label: 'Now and then', desc: 'Comes and goes with no clear rhythm.' },
    { id: 'frequent',   label: 'Most weeks',   desc: 'Showing up more often than not.' },
    { id: 'daily',      label: 'Every day',    desc: 'Part of the daily landscape right now.' }
  ];
  var durOpts = [
    { id: 'recent',    label: 'A few days',        desc: 'Fairly new.' },
    { id: 'weeks',     label: 'A few weeks',       desc: 'Lingering a while now.' },
    { id: 'months',    label: 'A few months',      desc: 'Settled in.' },
    { id: 'long-term', label: 'Longer than that',  desc: 'A long-standing companion.' }
  ];

  function renderCards(opts, field) {
    return opts.map(function(o) {
      var sel = advisorState[field] === o.id;
      return '<button type="button" class="advisor-option-card ' + (sel ? 'selected' : '') + '" data-field="' + field + '" data-value="' + o.id + '" aria-pressed="' + (sel ? 'true' : 'false') + '">' +
        '<span class="aoc-label">' + o.label + '</span>' +
        '<span class="aoc-desc">' + o.desc + '</span>' +
      '</button>';
    }).join('');
  }

  return '<div class="advisor-step">' +
    '<h3 class="advisor-step-title">Help us understand the shape of it.</h3>' +
    '<p class="advisor-step-desc">These three questions help us hear the difference between a passing season and a deeper pattern.</p>' +

    '<div class="advisor-question">' +
      '<p class="advisor-q-text">How intense does it feel?</p>' +
      '<div class="advisor-options-col">' + renderCards(intensityOpts, 'intensity') + '</div>' +
    '</div>' +

    '<div class="advisor-question">' +
      '<p class="advisor-q-text">How often does it show up?</p>' +
      '<div class="advisor-options-col">' + renderCards(freqOpts, 'frequency') + '</div>' +
    '</div>' +

    '<div class="advisor-question">' +
      '<p class="advisor-q-text">How long has this been with you?</p>' +
      '<div class="advisor-options-col">' + renderCards(durOpts, 'duration') + '</div>' +
    '</div>' +

    '<div class="advisor-actions">' +
      '<button type="button" class="advisor-btn-secondary" id="advisor-back-2">\u2190 Back</button>' +
      '<button type="button" class="advisor-btn-primary" id="advisor-continue-2" ' +
        (!advisorState.intensity || !advisorState.frequency || !advisorState.duration ? 'disabled' : '') + '>Continue \u2192</button>' +
    '</div>' +
  '</div>';
}

// ============================================================
// STEP 3 — WHOLE HUMAN  (single-select for state + multi-select for triggers)
// ============================================================
function renderWholeHuman() {
  var sleepOpts = [
    { id: 'restful',   label: 'Restful most nights' },
    { id: 'light',     label: 'Light \u2014 I wake easily' },
    { id: 'broken',    label: 'Broken \u2014 I\u2019m up in the night' },
    { id: 'exhausted', label: 'I wake already tired' }
  ];
  var stressOpts = [
    { id: 'calm',        label: 'Mostly calm' },
    { id: 'manageable',  label: 'Busy but managing' },
    { id: 'stretched',   label: 'Stretched thin' },
    { id: 'depleted',    label: 'Running on fumes' }
  ];
  var digestionOpts = [
    { id: 'smooth',    label: 'Smooth and regular' },
    { id: 'sensitive', label: 'Sensitive \u2014 certain foods don\u2019t sit well' },
    { id: 'bloated',   label: 'Bloated after meals' },
    { id: 'sluggish',  label: 'Slow or sluggish' }
  ];
  var emotionalOpts = [
    { id: 'steady',      label: 'Steady, mostly myself' },
    { id: 'tender',      label: 'Tender \u2014 feeling things deeply' },
    { id: 'overwhelmed', label: 'Overwhelmed or anxious' },
    { id: 'flat',        label: 'Flat \u2014 motivation is low' }
  ];

  function renderPills(opts, field) {
    return opts.map(function(o) {
      var sel = advisorState[field] === o.id;
      return '<button type="button" class="advisor-pill-option ' + (sel ? 'selected' : '') + '" data-field="' + field + '" data-value="' + o.id + '" aria-pressed="' + (sel ? 'true' : 'false') + '">' + o.label + '</button>';
    }).join('');
  }

  var triggerCount = advisorState.triggers.length;
  var triggerHint = triggerCount === 0
    ? '\u2726 Optional \u2014 pick any that feel true right now.'
    : '\u2726 ' + triggerCount + ' selected. Add more if they belong.';

  return '<div class="advisor-step">' +
    '<h3 class="advisor-step-title">The whole human, not just the symptom.</h3>' +
    '<p class="advisor-step-desc">How you sleep, stress, digest, and feel \u2014 these shape which plants will actually meet you where you are.</p>' +

    '<div class="advisor-question"><p class="advisor-q-text">How has your sleep been?</p>' +
      '<div class="advisor-pill-options">' + renderPills(sleepOpts, 'sleep') + '</div></div>' +

    '<div class="advisor-question"><p class="advisor-q-text">How would you describe your stress level?</p>' +
      '<div class="advisor-pill-options">' + renderPills(stressOpts, 'stressLevel') + '</div></div>' +

    '<div class="advisor-question"><p class="advisor-q-text">How is digestion feeling?</p>' +
      '<div class="advisor-pill-options">' + renderPills(digestionOpts, 'digestion') + '</div></div>' +

    '<div class="advisor-question"><p class="advisor-q-text">And emotionally?</p>' +
      '<div class="advisor-pill-options">' + renderPills(emotionalOpts, 'emotional') + '</div></div>' +

    '<div class="advisor-question advisor-question-soft">' +
      '<p class="advisor-q-text">What else might be adding to the load? <span class="aq-sub">(optional \u2014 pick any)</span></p>' +
      '<div class="advisor-trigger-grid">' +
        ADVISOR_DATA.triggers.map(function(t) {
          var sel = advisorState.triggers.indexOf(t.id) !== -1;
          return '<button type="button" class="advisor-trigger-btn ' + (sel ? 'selected' : '') + '" data-trigger="' + t.id + '" aria-pressed="' + (sel ? 'true' : 'false') + '">' +
            '<span class="advisor-trigger-check" aria-hidden="true">\u2713</span>' +
            '<span class="advisor-trigger-icon">' + t.icon + '</span>' +
            '<span class="advisor-trigger-label">' + t.label + '</span>' +
          '</button>';
        }).join('') +
      '</div>' +
      '<p class="advisor-hint">' + triggerHint + '</p>' +
    '</div>' +

    '<div class="advisor-actions">' +
      '<button type="button" class="advisor-btn-secondary" id="advisor-back-3">\u2190 Back</button>' +
      '<button type="button" class="advisor-btn-primary" id="advisor-continue-3" ' +
        (!advisorState.sleep || !advisorState.stressLevel || !advisorState.digestion || !advisorState.emotional ? 'disabled' : '') + '>Continue \u2192</button>' +
    '</div>' +
  '</div>';
}

// ============================================================
// STEP 4 — NUANCE
// time-of-day becomes MULTI-select (can be morning AND evening)
// sensitivity and preferred-format remain single
// ============================================================
function renderNuance() {
  var timeOpts = [
    { id: 'morning',     label: 'Morning',     icon: '\u2600\uFE0F', desc: 'Most present early in the day.' },
    { id: 'evening',     label: 'Evening',     icon: '\u{1F319}',    desc: 'Shows up as the day winds down.' },
    { id: 'all-day',     label: 'All day',     icon: '\u{1F504}',    desc: 'A steady background companion.' },
    { id: 'situational', label: 'Situational', icon: '\u{1F4A1}',    desc: 'Tied to certain moments or triggers.' }
  ];
  var sensOpts = [
    { id: 'gentle',   label: 'Gentle',   desc: 'I tend to be sensitive \u2014 softer is better.' },
    { id: 'balanced', label: 'Balanced', desc: 'Comfortable with a typical blend.' },
    { id: 'robust',   label: 'Robust',   desc: 'I do well with strong, direct support.' }
  ];
  var formatOpts = [
    { id: 'tea',           label: 'Tea',           icon: '\u{1F375}', desc: 'Ritual, warmth, gentle absorption.' },
    { id: 'capsule',       label: 'Capsules',      icon: '\u{1F48A}', desc: 'Simple, consistent, travel-friendly.' },
    { id: 'tincture',      label: 'Tincture',      icon: '\u{1F4A7}', desc: 'Fast-absorbing, easy to dose.' },
    { id: 'balm',          label: 'Balm',          icon: '\u{1FAD9}', desc: 'Topical, targeted, tangible.' },
    { id: 'serum',         label: 'Serum',         icon: '\u2728',    desc: 'Skin-focused, concentrated botanicals.' },
    { id: 'no-preference', label: 'Let us choose', icon: '\u{1F33F}', desc: 'Recommend what best fits the pattern.' }
  ];

  return '<div class="advisor-step">' +
    '<h3 class="advisor-step-title">A few final details.</h3>' +
    '<p class="advisor-step-desc">Timing, sensitivity, and form \u2014 the nuances that make a remedy truly yours.</p>' +

    '<div class="advisor-question"><p class="advisor-q-text">When is this most present? <span class="aq-sub">(pick one or more)</span></p>' +
      '<div class="advisor-options-col">' +
        timeOpts.map(function(o) {
          var sel = advisorState.timeOfDay.indexOf(o.id) !== -1;
          return '<button type="button" class="advisor-option-card multi ' + (sel ? 'selected' : '') + '" data-multi-field="timeOfDay" data-value="' + o.id + '" aria-pressed="' + (sel ? 'true' : 'false') + '">' +
            '<span class="aoc-check" aria-hidden="true">\u2713</span>' +
            '<span class="aoc-icon">' + o.icon + '</span>' +
            '<span class="aoc-label">' + o.label + '</span>' +
            '<span class="aoc-desc">' + o.desc + '</span>' +
          '</button>';
        }).join('') +
      '</div>' +
    '</div>' +

    '<div class="advisor-question"><p class="advisor-q-text">Which kind of support tends to suit you?</p>' +
      '<div class="advisor-pill-options">' +
        sensOpts.map(function(o) {
          var sel = advisorState.sensitivity === o.id;
          return '<button type="button" class="advisor-option-card compact ' + (sel ? 'selected' : '') + '" data-field="sensitivity" data-value="' + o.id + '" aria-pressed="' + (sel ? 'true' : 'false') + '">' +
            '<span class="aoc-label">' + o.label + '</span>' +
            '<span class="aoc-desc">' + o.desc + '</span>' +
          '</button>';
        }).join('') +
      '</div>' +
    '</div>' +

    '<div class="advisor-question"><p class="advisor-q-text">Is there a form you prefer?</p>' +
      '<div class="advisor-options-col">' +
        formatOpts.map(function(o) {
          var sel = advisorState.preferredFormat === o.id;
          return '<button type="button" class="advisor-option-card ' + (sel ? 'selected' : '') + '" data-field="preferredFormat" data-value="' + o.id + '" aria-pressed="' + (sel ? 'true' : 'false') + '">' +
            '<span class="aoc-icon">' + o.icon + '</span>' +
            '<span class="aoc-label">' + o.label + '</span>' +
            '<span class="aoc-desc">' + o.desc + '</span>' +
          '</button>';
        }).join('') +
      '</div>' +
    '</div>' +

    '<div class="advisor-actions">' +
      '<button type="button" class="advisor-btn-secondary" id="advisor-back-4">\u2190 Back</button>' +
      '<button type="button" class="advisor-btn-primary" id="advisor-continue-4" ' +
        (advisorState.timeOfDay.length === 0 || !advisorState.sensitivity || !advisorState.preferredFormat ? 'disabled' : '') + '>Unlock My Results \u2192</button>' +
    '</div>' +
  '</div>';
}

// ============================================================
// STEP 5 — LEAD CAPTURE
// ============================================================
function renderLeadCapture() {
  var primarySymptomLabels = advisorState.primarySymptoms.map(function(id) {
    var g = ADVISOR_DATA.goals.find(function(x) { return x.id === id; });
    return g ? g.label : id;
  });
  var focusLine = primarySymptomLabels.length > 0
    ? primarySymptomLabels.slice(0, 3).join(' \u00b7 ')
    : 'Your personalized wellness report';

  return '<div class="advisor-step lead-capture">' +
    '<div class="lead-unlock-hero">' +
      '<div class="lead-unlock-icon">\u2728</div>' +
      '<h3 class="lead-unlock-title">Your report is ready.</h3>' +
      '<p class="lead-unlock-sub">We\u2019ve matched your answers to a pattern and chosen your herbal allies. Enter your email to unlock it \u2014 and we\u2019ll send a copy you can return to.</p>' +
      '<div class="lead-focus-badge">Focus: ' + focusLine + '</div>' +
    '</div>' +

    '<ul class="lead-benefits">' +
      '<li><span>\u2726</span> Your personalized herbal match</li>' +
      '<li><span>\u2726</span> Gentle wellness tips for your pattern</li>' +
      '<li><span>\u2726</span> First look at seasonal remedies</li>' +
      '<li><span>\u2726</span> A refill reminder when you\u2019re near the end</li>' +
    '</ul>' +

    '<div class="lead-form">' +
      '<label class="lead-field">' +
        '<span class="lead-field-label">Email address</span>' +
        '<input type="email" id="lead-email" autocomplete="email" inputmode="email" placeholder="you@example.com" value="' + (advisorState.leadEmail || '') + '">' +
      '</label>' +
      '<label class="lead-field">' +
        '<span class="lead-field-label">Mobile <span class="lead-optional">(optional \u2014 for order and restock texts)</span></span>' +
        '<input type="tel" id="lead-sms" autocomplete="tel" inputmode="tel" placeholder="(555) 123-4567" value="' + (advisorState.leadSms || '') + '">' +
      '</label>' +
      '<label class="lead-consent">' +
        '<input type="checkbox" id="lead-sms-optin" ' + (advisorState.leadSmsOptIn ? 'checked' : '') + '>' +
        '<span>Send me occasional texts with ritual reminders and early access. Msg &amp; data rates may apply. Reply STOP to opt out anytime.</span>' +
      '</label>' +
      '<p class="lead-trust">\u{1F512} We never sell or share your information. Unsubscribe anytime.</p>' +
      '<p class="lead-error" id="lead-error" style="display:none;"></p>' +
    '</div>' +

    '<div class="advisor-actions lead-actions">' +
      '<button type="button" class="advisor-btn-secondary" id="advisor-back-5">\u2190 Back</button>' +
      '<button type="button" class="advisor-btn-primary lead-primary-cta" id="lead-submit">Unlock My Results \u2192</button>' +
    '</div>' +
    '<button type="button" class="advisor-btn-ghost lead-skip" id="lead-skip">Skip \u2014 just show me</button>' +
  '</div>';
}

function submitLeadCapture() {
  var emailEl = document.getElementById('lead-email');
  var smsEl = document.getElementById('lead-sms');
  var optEl = document.getElementById('lead-sms-optin');
  var errEl = document.getElementById('lead-error');
  var email = emailEl ? emailEl.value.trim() : '';
  var sms = smsEl ? smsEl.value.trim() : '';
  var optIn = optEl ? !!optEl.checked : false;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    if (errEl) { errEl.textContent = 'Please enter a valid email to unlock your report.'; errEl.style.display = 'block'; }
    if (emailEl) emailEl.focus();
    return;
  }
  if (errEl) errEl.style.display = 'none';

  advisorState.leadEmail = email;
  advisorState.leadSms = sms;
  advisorState.leadSmsOptIn = optIn;
  advisorState.leadCaptured = true;

  try {
    fetch('/.netlify/functions/quiz-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        sms: sms,
        smsOptIn: optIn,
        symptoms: advisorState.primarySymptoms,
        quizAnswers: quizAnswersForPersistence()
      })
    }).catch(function() {});
  } catch (e) {}

  try { if (window.AAA && typeof window.AAA.track === 'function') window.AAA.track('quiz_lead_captured', { smsOptIn: optIn }); } catch (e) {}

  advisorState.step = 6;
  updateAdvisorContent(true);
}

function skipLeadCapture() {
  advisorState.leadCaptured = false;
  advisorState.step = 6;
  updateAdvisorContent(true);
}

function quizAnswersForPersistence() {
  return {
    intensity: advisorState.intensity,
    frequency: advisorState.frequency,
    duration: advisorState.duration,
    sleep: advisorState.sleep,
    stressLevel: advisorState.stressLevel,
    digestion: advisorState.digestion,
    emotional: advisorState.emotional,
    timeOfDay: advisorState.timeOfDay,
    triggers: advisorState.triggers,
    sensitivity: advisorState.sensitivity,
    preferredFormat: advisorState.preferredFormat
  };
}

// ============================================================
// STEP 6 — THE SYNTHESIS
// One-session = one-remedy. Single primary CTA.
// ============================================================
function renderSynthesis() {
  var signals = gatherSignalsFromState(advisorState);

  var patterns = window.RemedyFlow
    ? window.RemedyFlow.synthesizePatterns(advisorState.primarySymptoms, signals)
    : [];
  advisorState.patterns = patterns;

  var allies = window.RemedyFlow
    ? window.RemedyFlow.gatherAllies(patterns, advisorState.primarySymptoms, signals)
    : [];
  advisorState.allies = allies;

  var formKey = advisorState.preferredFormat && advisorState.preferredFormat !== 'no-preference'
    ? mapPreferredFormatToKey(advisorState.preferredFormat)
    : (patterns[0] && patterns[0].pattern.preferredForm) || 'capsule';

  var rituals = window.RemedyFlow ? window.RemedyFlow.getLifestyleRituals(patterns) : [];

  // Persist synthesis so the builder can pick up the blend
  if (window.RemedyFlow) {
    window.RemedyFlow.updateState({
      symptoms: advisorState.primarySymptoms,
      selectedHerbs: allies.map(function(a) { return a.id; }),
      recommendedHerbs: allies.map(function(a) { return a.id; }),
      finalHerbs: allies.map(function(a) { return a.id; }),
      recommendedForm: formKey,
      quizAnswers: quizAnswersForPersistence()
    });
  }

  return '<div class="advisor-step synthesis">' +

    '<div class="synth-hero">' +
      '<span class="synth-eyebrow">\u2726 Your Personalized Report</span>' +
      '<h3 class="synth-title">' + (advisorState.leadEmail ? 'It\u2019s yours. We hear you.' : 'We hear you.') + '</h3>' +
      renderWellnessSummary(patterns, signals) +
      '<div class="synth-trust-row">' +
        '<span class="synth-trust-badge">\u{1F33F} Herbalist Formulated</span>' +
        '<span class="synth-trust-badge">\u{1FAD9} Small-Batch Crafted</span>' +
        '<span class="synth-trust-badge">\u2728 Rooted in Tradition</span>' +
      '</div>' +
    '</div>' +

    '<div class="synth-patterns">' +
      patterns.map(function(entry, idx) {
        return renderPatternPanel(entry.pattern, idx === 0);
      }).join('') +
    '</div>' +

    '<section class="synth-section">' +
      '<div class="synth-heading-row">' +
        '<h4 class="synth-heading">Your Personal Herbal Allies</h4>' +
        '<span class="synth-count-badge">' + allies.length + ' plants chosen for you</span>' +
      '</div>' +
      '<p class="synth-sub">Each plant below was chosen for a specific reason \u2014 tied to what you shared. Traditionally used, gently prepared, and blended into one formula for you.</p>' +
      '<div class="synth-allies">' +
        allies.map(renderAllyCard).join('') +
      '</div>' +
    '</section>' +

    renderWhyThisWorks(patterns) +

    (rituals.length > 0 ? '<section class="synth-section">' +
      '<h4 class="synth-heading">Gentle Rituals for Your Pattern</h4>' +
      '<p class="synth-sub">Small, non-product practices that pair beautifully with your remedy.</p>' +
      '<div class="synth-rituals">' +
        rituals.map(function(r) {
          return '<div class="synth-ritual">' +
            '<h5>' + r.title + '</h5>' +
            '<p>' + r.desc + '</p>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</section>' : '') +

    renderFinalRemedyCTA(formKey, allies) +

    renderExtendedResultsCapture() +

    '<p class="synth-disclaimer">These botanical recommendations are crafted to support general wellness and self-care. They are not intended to diagnose, treat, cure, or prevent any disease. If you are pregnant, nursing, taking medications, or navigating a medical condition, please consult a qualified healthcare professional before use.</p>' +

    '<div class="advisor-actions synth-nav">' +
      '<button type="button" class="advisor-btn-secondary" id="advisor-back-6">\u2190 Back</button>' +
      '<span></span>' +
    '</div>' +

  '</div>';
}

function renderFinalRemedyCTA(formKey, allies) {
  var formLabel = (window.RemedyFlow && window.RemedyFlow.FORM_EXPLANATIONS && window.RemedyFlow.FORM_EXPLANATIONS[formKey])
    ? window.RemedyFlow.FORM_EXPLANATIONS[formKey].split('\u2014')[0].trim()
    : 'Custom Blend';
  var sensitivity = advisorState.sensitivity || 'balanced';
  var patternName = advisorState.patterns && advisorState.patterns[0]
    ? advisorState.patterns[0].pattern.name
    : 'your personal pattern';

  return '<section class="synth-final-cta">' +
    '<div class="synth-final-inner">' +
      '<div class="synth-final-label">\u2726 Your One Remedy</div>' +
      '<h4 class="synth-final-title">Your Custom ' + formLabel + '</h4>' +
      '<p class="synth-final-desc">A one-of-one blend, hand-prepared for <em>' + patternName + '</em>, tuned to a <em>' + sensitivity + '</em> level of support.</p>' +
      '<ul class="synth-final-features">' +
        '<li>\u2726 ' + allies.length + ' plant allies, chosen from your answers</li>' +
        '<li>\u2726 Prepared as ' + formLabel + '</li>' +
        '<li>\u2726 Hand-blended in small batches, shipped promptly</li>' +
      '</ul>' +
      '<button type="button" class="synth-cta-primary synth-cta-xl" id="synth-cta-custom">\u2728 Add My Custom Remedy to Cart</button>' +
      '<p class="synth-final-fineprint">One quiz session \u00b7 one custom remedy \u00b7 crafted to your answers</p>' +
    '</div>' +
  '</section>';
}

// ============================================================
// EXTENDED RESULTS — Name + Email capture on the results page
// A calm, premium invitation (not a gate) for a deeper, personalized
// interpretation delivered to the guest's inbox. Idempotent: once a
// valid submission is accepted for this session, the section converts
// to a gentle confirmation state to prevent duplicate sends.
// ============================================================
function renderExtendedResultsCapture() {
  if (advisorState.extendedResultsRequested) {
    var sentName = (advisorState.extendedLeadFirstName || '').trim();
    var sentEmail = advisorState.extendedLeadEmail || '';
    var greet = sentName ? sentName + ', your' : 'Your';
    return '<section class="synth-extended-capture confirmed" aria-live="polite">' +
      '<div class="synth-extended-inner">' +
        '<div class="synth-extended-icon">\u2728</div>' +
        '<h4 class="synth-extended-title">' + greet + ' deeper reading is on its way.</h4>' +
        '<p class="synth-extended-desc">We\u2019ve sent your expanded personalized results to <strong>' + escapeHtmlSafe(sentEmail) + '</strong>. Please check your inbox \u2014 and your spam folder, just in case.</p>' +
      '</div>' +
    '</section>';
  }

  return '<section class="synth-extended-capture" id="synth-extended-capture">' +
    '<div class="synth-extended-inner">' +
      '<div class="synth-extended-eyebrow">\u2726 A Gift From Your Herbalist</div>' +
      '<h4 class="synth-extended-title">Receive Your Full Personalized Results \u2728</h4>' +
      '<p class="synth-extended-desc">Enter your name and email to receive a deeper, more personal reading of your results \u2014 including why these herbal allies were chosen for you, what your body may be gently asking for, and soft guidance for your next steps.</p>' +

      '<ul class="synth-extended-benefits">' +
        '<li><span>\u2726</span> Your expanded pattern interpretation</li>' +
        '<li><span>\u2726</span> The story behind each herbal ally</li>' +
        '<li><span>\u2726</span> A gentle ritual for the week ahead</li>' +
      '</ul>' +

      '<div class="synth-extended-form">' +
        '<label class="synth-extended-field">' +
          '<span class="synth-extended-field-label">First name</span>' +
          '<input type="text" id="synth-extended-name" autocomplete="given-name" placeholder="Your first name" maxlength="60" value="' + escapeHtmlSafe(advisorState.extendedLeadFirstName || advisorState.leadFirstName || '') + '">' +
        '</label>' +
        '<label class="synth-extended-field">' +
          '<span class="synth-extended-field-label">Email address</span>' +
          '<input type="email" id="synth-extended-email" autocomplete="email" inputmode="email" placeholder="you@example.com" value="' + escapeHtmlSafe(advisorState.extendedLeadEmail || advisorState.leadEmail || '') + '">' +
        '</label>' +
        '<p class="synth-extended-error" id="synth-extended-error" role="alert" style="display:none;"></p>' +
        '<button type="button" class="synth-cta-primary synth-extended-cta" id="synth-extended-submit">Send My Full Results \u2728</button>' +
        '<p class="synth-extended-trust">\u{1F512} We honor your privacy. Your details are never sold or shared. Unsubscribe anytime.</p>' +
      '</div>' +
    '</div>' +
  '</section>';
}

function escapeHtmlSafe(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function submitExtendedResultsCapture() {
  if (advisorState.extendedResultsRequested || advisorState.extendedResultsSending) return;

  var nameEl = document.getElementById('synth-extended-name');
  var emailEl = document.getElementById('synth-extended-email');
  var errEl = document.getElementById('synth-extended-error');
  var btn = document.getElementById('synth-extended-submit');

  var firstName = nameEl ? nameEl.value.trim().slice(0, 60) : '';
  var email = emailEl ? emailEl.value.trim() : '';

  if (!firstName) {
    if (errEl) { errEl.textContent = 'Please share your first name so we can personalize your results.'; errEl.style.display = 'block'; }
    if (nameEl) nameEl.focus();
    return;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    if (errEl) { errEl.textContent = 'Please enter a valid email address.'; errEl.style.display = 'block'; }
    if (emailEl) emailEl.focus();
    return;
  }
  if (errEl) errEl.style.display = 'none';

  advisorState.extendedLeadFirstName = firstName;
  advisorState.extendedLeadEmail = email;
  advisorState.extendedResultsSending = true;
  if (!advisorState.leadFirstName) advisorState.leadFirstName = firstName;

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Sending your results\u2026';
  }

  var allies = Array.isArray(advisorState.allies) ? advisorState.allies : [];
  var patterns = Array.isArray(advisorState.patterns) ? advisorState.patterns : [];
  var primaryPattern = patterns[0] && patterns[0].pattern ? patterns[0].pattern.name : '';

  var payload = {
    firstName: firstName,
    email: email,
    intent: 'extended-results',
    symptoms: advisorState.primarySymptoms,
    quizAnswers: quizAnswersForPersistence(),
    resultSummary: {
      primaryPattern: primaryPattern,
      patternNames: patterns.map(function(p) { return p && p.pattern ? p.pattern.name : ''; }).filter(Boolean),
      allies: allies.map(function(a) { return a && a.id ? a.id : ''; }).filter(Boolean)
    }
  };

  fetch('/.netlify/functions/quiz-lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(function(res) {
    if (!res || !res.ok) throw new Error('bad response');
    advisorState.extendedResultsRequested = true;
    advisorState.extendedResultsSending = false;
    try { if (window.AAA && typeof window.AAA.track === 'function') window.AAA.track('quiz_extended_results_requested', { pattern: primaryPattern }); } catch (e) {}
    updateAdvisorContent(false);
  }).catch(function() {
    advisorState.extendedResultsSending = false;
    if (btn) { btn.disabled = false; btn.textContent = 'Send My Full Results \u2728'; }
    if (errEl) { errEl.textContent = 'Something gentle went astray. Please try again in a moment.'; errEl.style.display = 'block'; }
  });
}

function renderWellnessSummary(patterns, signals) {
  if (!patterns || patterns.length === 0) {
    return '<p class="synth-summary">Based on what you shared, we\u2019ve gathered a gentle, foundational path for you below.</p>' +
      '<p class="synth-summary-second">Your body may simply be asking for more quiet, more nourishment, and a softer rhythm. The allies below are a starting place.</p>';
  }
  var primary = patterns[0].pattern;
  var signalPhrases = (signals || [])
    .slice(0, 3)
    .map(function(s) { return window.RemedyFlow ? window.RemedyFlow.humanSignalPhrase(s) : s; })
    .filter(function(p, i, arr) { return arr.indexOf(p) === i; });

  var opener = signalPhrases.length > 0
    ? 'Your answers suggest \u2014 <em>' + signalPhrases.join(', ') + '</em> \u2014 and together they point to a gentle, recognizable pattern: <strong>' + primary.name + '</strong>.'
    : 'Your answers point to a recognizable pattern: <strong>' + primary.name + '</strong>.';

  var empath = 'This combination often appears when the body is asking for recovery, softer pacing, and plants that have steadied others in the same place.';

  return '<p class="synth-summary">' + opener + '</p>' +
    '<p class="synth-summary-second">' + primary.summary + '</p>' +
    '<p class="synth-summary-second synth-summary-empath">' + empath + '</p>';
}

function renderPatternPanel(pattern, isPrimary) {
  return '<div class="synth-pattern-panel ' + (isPrimary ? 'primary' : 'secondary') + '">' +
    '<div class="synth-pattern-label">' + (isPrimary ? 'Primary Pattern' : 'Also Present') + '</div>' +
    '<h5 class="synth-pattern-name">' + pattern.name + '</h5>' +
    '<p class="synth-pattern-root"><strong>Root support:</strong> ' + pattern.rootSupport + '</p>' +
  '</div>';
}

function renderAllyCard(ally) {
  var herb = typeof BOTANICALS !== 'undefined'
    ? BOTANICALS.find(function(b) { return b.id === ally.id; })
    : null;
  var name = herb ? herb.name : ally.id;
  var emoji = herb && herb.emoji ? herb.emoji : '\u{1F33F}';
  var latin = herb && herb.latin ? herb.latin : '';
  var img = herb ? (herb.illustration || herb.img || '') : '';
  if (!img && typeof window.getBotanicalIllustration === 'function') {
    img = window.getBotanicalIllustration(ally.id || (herb && herb.id)) || '';
  }
  var traditional = herb && herb.desc ? herb.desc : '';
  var primaryBenefit = herb && Array.isArray(herb.benefits) && herb.benefits.length ? herb.benefits[0] : '';

  var signalPhrases = (ally.matchedSignals || [])
    .slice(0, 2)
    .map(function(s) { return window.RemedyFlow ? window.RemedyFlow.humanSignalPhrase(s) : s; });
  var whyLine = signalPhrases.length > 0
    ? 'Chosen because of ' + signalPhrases.join(' and ') + '.'
    : 'Chosen to nourish the ' + (ally.patternName || 'pattern').toLowerCase() + ' pattern you\u2019re navigating.';

  var whyNowLine = primaryBenefit
    ? primaryBenefit
    : (ally.benefit || 'Traditionally used to support what you described.');

  return '<article class="synth-ally-card">' +
    '<div class="synth-ally-media">' +
      (img
        ? '<img class="synth-ally-img" src="' + img + '" alt="' + name + '" onerror="this.style.display=\'none\'">'
        : '<div class="synth-ally-img placeholder" aria-hidden="true">' + emoji + '</div>'
      ) +
    '</div>' +
    '<div class="synth-ally-body">' +
      '<h5 class="synth-ally-name">' + emoji + ' ' + name + '</h5>' +
      (latin ? '<p class="synth-ally-latin">' + latin + '</p>' : '') +
      (ally.benefit ? '<p class="synth-ally-line"><strong>Primary benefit:</strong> ' + ally.benefit + '</p>' : '') +
      '<p class="synth-ally-line synth-ally-why"><strong>Chosen for you because:</strong> ' + whyLine + '</p>' +
      (traditional ? '<p class="synth-ally-line synth-ally-tradition"><strong>Traditional use:</strong> ' + traditional + '</p>' : '') +
      '<p class="synth-ally-line synth-ally-now"><strong>Why it may help now:</strong> ' + whyNowLine + '</p>' +
    '</div>' +
  '</article>';
}

function renderWhyThisWorks(patterns) {
  if (!patterns || !patterns.length) return '';
  var bullets = [];
  var seen = {};
  patterns.slice(0, 2).forEach(function(entry) {
    var p = entry.pattern;
    if (p && p.supports) {
      (p.supports || []).forEach(function(s) {
        if (!seen[s]) { seen[s] = true; bullets.push(s); }
      });
    }
  });
  if (bullets.length === 0) {
    var fallback = {
      sleep: 'supports deeper, more restorative sleep',
      stress: 'calms the stress response and softens the nervous system',
      energy: 'nourishes depleted systems for steadier, lasting energy',
      immune: 'supports resilience through every season',
      hormones: 'supports balance across cycles and shifts',
      digestion: 'eases digestion and supports gut comfort',
      pain: 'supports relief for what the body is holding',
      beauty: 'nourishes inner radiance and skin vitality',
      cognitive: 'supports a settled, clear mind',
      wellness: 'supports daily balance and quiet resilience'
    };
    (advisorState.primarySymptoms || []).forEach(function(s) {
      if (fallback[s] && !seen[s]) { seen[s] = true; bullets.push(fallback[s]); }
    });
  }
  if (bullets.length === 0) return '';

  return '<section class="synth-section synth-why">' +
    '<h4 class="synth-heading">Why These Plants, Now</h4>' +
    '<ul class="synth-why-list">' +
      bullets.slice(0, 5).map(function(b) { return '<li>\u2726 ' + b + '</li>'; }).join('') +
    '</ul>' +
  '</section>';
}

// ============================================================
// Helpers
// ============================================================
function gatherSignalsFromState(s) {
  var signals = [];
  (s.primarySymptoms || []).forEach(function(sym) { signals.push(sym); });
  if (s.duration === 'months' || s.duration === 'long-term') signals.push('duration-long');
  if (s.duration === 'long-term') signals.push('chronic');
  if (s.frequency === 'daily' && s.intensity === 'significant') signals.push('acute');
  if (s.sleep === 'light' || s.sleep === 'broken') signals.push('light-sleep');
  if (s.sleep === 'exhausted') signals.push('burnout');
  if (s.stressLevel === 'stretched' || s.stressLevel === 'depleted') signals.push('tension');
  if (s.stressLevel === 'depleted') signals.push('burnout');
  if (s.digestion === 'bloated') signals.push('bloating');
  if (s.digestion === 'sluggish') signals.push('slow-digestion');
  if (s.emotional === 'overwhelmed') signals.push('racing-mind');
  if (s.emotional === 'flat') signals.push('mental-fog');
  if (s.emotional === 'tender' || s.emotional === 'overwhelmed') signals.push('emotional');
  var tod = Array.isArray(s.timeOfDay) ? s.timeOfDay : (s.timeOfDay ? [s.timeOfDay] : []);
  if (tod.indexOf('evening') !== -1) signals.push('tension');
  if (tod.indexOf('all-day') !== -1) signals.push('chronic');
  if (s.sensitivity === 'gentle') signals.push('sensitive');
  var trig = Array.isArray(s.triggers) ? s.triggers : [];
  if (trig.indexOf('work-pressure') !== -1) signals.push('tension');
  if (trig.indexOf('screens-late') !== -1) signals.push('racing-mind');
  if (trig.indexOf('poor-sleep') !== -1) signals.push('light-sleep');
  if (trig.indexOf('overstim') !== -1) signals.push('racing-mind');
  if (trig.indexOf('big-transition') !== -1) signals.push('emotional');
  var seen = {};
  return signals.filter(function(t) { if (seen[t]) return false; seen[t] = true; return true; });
}

function mapPreferredFormatToKey(pref) {
  var map = {
    'tea': 'loose-tea',
    'capsule': 'capsule',
    'tincture': 'tincture',
    'balm': 'balm',
    'serum': 'serum'
  };
  return map[pref] || 'capsule';
}

// ============================================================
// NAVIGATION & ACTIONS
// ============================================================
function advisorNextStep() {
  if (advisorState.step < 6) {
    advisorState.step++;
    updateAdvisorContent(true);
    try { history.pushState({ section: 'guided-flow', step: advisorState.step }, '', ''); } catch(e) {}
  }
}

function advisorPrevStep() {
  if (advisorState.step > 1) {
    advisorState.step--;
    updateAdvisorContent(true);
  }
}

function closeHerbalAdvisor() {
  var modal = document.getElementById('herbal-advisor-modal');
  if (modal) {
    modal.classList.add('closing');
    setTimeout(function() { if (modal.parentNode) modal.parentNode.removeChild(modal); }, 250);
  }
  document.removeEventListener('keydown', advisorEscHandler);
}

// ============================================================
// CART HANDOFF — single primary CTA on results page
// ============================================================
function synthAddCustomToCart() {
  var allies = advisorState.allies || [];
  var herbs = allies.map(function(a) {
    return (typeof BOTANICALS !== 'undefined') ? BOTANICALS.find(function(b) { return b.id === a.id; }) : null;
  }).filter(Boolean);

  if (herbs.length === 0) {
    if (typeof showToast === 'function') showToast('We need at least one plant ally to build your remedy.');
    return;
  }

  var formKey = advisorState.preferredFormat && advisorState.preferredFormat !== 'no-preference'
    ? mapPreferredFormatToKey(advisorState.preferredFormat)
    : (advisorState.patterns && advisorState.patterns[0] && advisorState.patterns[0].pattern.preferredForm) || 'capsule';

  var formPrices = {
    'tea-bags': 12.99, 'loose-tea': 9.99, 'tincture': 24.99, 'balm': 18.99,
    'salve': 16.99, 'serum': 22.99, 'poultice': 14.99, 'capsule': 28.99
  };
  var formLabels = {
    'tea-bags': 'Handmade Tea Bags', 'loose-tea': 'Loose Leaf Custom Blend', 'tincture': 'Herbal Tincture',
    'balm': 'Herbal Balm', 'salve': 'Herbal Salve', 'serum': 'Botanical Serum',
    'poultice': 'Herbal Poultice', 'capsule': 'Herbal Capsules'
  };
  var formUnits = {
    'tea-bags': '20 Count', 'loose-tea': '1 oz', 'tincture': '1oz Tincture',
    'balm': '1oz Balm', 'salve': '1oz Salve', 'serum': '1oz Serum',
    'poultice': '2oz Poultice', 'capsule': '30 Capsules'
  };

  var basePrice = formPrices[formKey] || 14.99;
  var herbCost = herbs.reduce(function(sum, h) { return sum + (h.price || 0.23); }, 0);
  var herbNames = herbs.map(function(h) { return h.name; }).join(', ');
  var patternName = advisorState.patterns && advisorState.patterns[0]
    ? advisorState.patterns[0].pattern.name
    : 'Custom Wellness Blend';

  var cartItem = {
    id: 'synth-' + Date.now(),
    name: 'Custom ' + (formLabels[formKey] || formKey),
    desc: (formUnits[formKey] || '') + ' | ' + patternName + ' | ' + herbNames,
    herbs: herbNames,
    size: formUnits[formKey] || '',
    price: basePrice + herbCost,
    qty: 1,
    symptoms: patternName,
    form: formLabels[formKey] || formKey
  };

  var added = false;
  if (typeof window.addItemToCart === 'function') {
    window.addItemToCart(cartItem);
    added = true;
  } else if (typeof addToCart === 'function') {
    addToCart(cartItem.name, cartItem.price);
    added = true;
  }

  if (!added) {
    if (typeof showToast === 'function') showToast('Unable to add to cart right now.');
    return;
  }

  try { if (window.AAA && typeof window.AAA.track === 'function') window.AAA.track('synth_custom_added', { pattern: patternName, herbs: herbs.length, form: formKey }); } catch (e) {}

  closeHerbalAdvisor();
  setTimeout(showPostAddModal, 320);
}

// ============================================================
// POST-ADD MODAL — only appears AFTER a successful cart add.
// Three clear next-step options. No competing CTAs before this point.
// ============================================================
function showPostAddModal() {
  var existing = document.getElementById('synth-another-modal');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'synth-another-modal';
  overlay.className = 'synth-another-overlay';
  overlay.innerHTML =
    '<div class="synth-another-modal">' +
      '<button class="synth-another-close" aria-label="Close" id="synth-another-x">\u2715</button>' +
      '<div class="synth-another-icon">\u2728</div>' +
      '<h3>Your remedy is in the cart.</h3>' +
      '<p>Hand-blended for your pattern. What would you like to do next?</p>' +
      '<div class="synth-another-actions">' +
        '<button type="button" class="synth-cta-primary" id="synth-another-checkout">Go to Cart &amp; Checkout</button>' +
        '<button type="button" class="synth-cta-secondary" id="synth-another-shop">Browse the Shop</button>' +
        '<button type="button" class="synth-cta-ghost" id="synth-another-create">Create Another Custom Blend</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) overlay.remove();
  });

  var closeBtn = overlay.querySelector('#synth-another-x');
  if (closeBtn) closeBtn.addEventListener('click', function() { overlay.remove(); });

  overlay.querySelector('#synth-another-create').addEventListener('click', function() {
    overlay.remove();
    if (window.RemedyFlow) window.RemedyFlow.clearState();
    openHerbalAdvisor();
  });
  overlay.querySelector('#synth-another-shop').addEventListener('click', function() {
    overlay.remove();
    if (typeof showSection === 'function') {
      showSection('shop');
    } else {
      var shopLink = document.querySelector('a[href="#shop"], [data-section="shop"]');
      if (shopLink) shopLink.click();
    }
  });
  overlay.querySelector('#synth-another-checkout').addEventListener('click', function() {
    overlay.remove();
    var cartBtn = document.getElementById('cartBtn');
    if (cartBtn) cartBtn.click();
  });
}

// Kept for backwards compatibility with anything still calling the old name.
window.showAnotherGoalModal = showPostAddModal;

// ============================================================
// EVENT DELEGATION — installed once, never duplicated.
// ============================================================
if (!window.__advisorDelegationInstalled) {
  window.__advisorDelegationInstalled = true;
  document.addEventListener('click', function(e) {
    var modal = document.getElementById('herbal-advisor-modal');
    if (!modal) return;

    // Step 1: goal toggle (multi-select, cap 5)
    var goalBtn = e.target.closest ? e.target.closest('.advisor-goal-btn') : null;
    if (goalBtn && modal.contains(goalBtn)) {
      var gid = goalBtn.getAttribute('data-goal');
      if (gid) {
        var idx = advisorState.primarySymptoms.indexOf(gid);
        if (idx > -1) {
          advisorState.primarySymptoms.splice(idx, 1);
        } else if (advisorState.primarySymptoms.length < 5) {
          advisorState.primarySymptoms.push(gid);
        } else {
          // Visual feedback: flash the hint
          var hint = modal.querySelector('.advisor-hint');
          if (hint) {
            hint.classList.remove('flash');
            void hint.offsetWidth;
            hint.classList.add('flash');
          }
          return;
        }
        updateAdvisorContent(false);
      }
      return;
    }

    // Step 3: trigger multi-select
    var trigBtn = e.target.closest ? e.target.closest('.advisor-trigger-btn') : null;
    if (trigBtn && modal.contains(trigBtn)) {
      var tid = trigBtn.getAttribute('data-trigger');
      if (tid) {
        if (tid === 'none') {
          advisorState.triggers = advisorState.triggers.indexOf('none') !== -1 ? [] : ['none'];
        } else {
          var noneIdx = advisorState.triggers.indexOf('none');
          if (noneIdx !== -1) advisorState.triggers.splice(noneIdx, 1);
          var i2 = advisorState.triggers.indexOf(tid);
          if (i2 > -1) advisorState.triggers.splice(i2, 1);
          else advisorState.triggers.push(tid);
        }
        updateAdvisorContent(false);
      }
      return;
    }

    // Step 4: multi-select time-of-day card
    var multiCard = e.target.closest ? e.target.closest('[data-multi-field]') : null;
    if (multiCard && modal.contains(multiCard)) {
      var mField = multiCard.getAttribute('data-multi-field');
      var mValue = multiCard.getAttribute('data-value');
      if (mField && mValue) {
        if (!Array.isArray(advisorState[mField])) advisorState[mField] = [];
        var mi = advisorState[mField].indexOf(mValue);
        if (mi > -1) advisorState[mField].splice(mi, 1);
        else advisorState[mField].push(mValue);
        updateAdvisorContent(false);
      }
      return;
    }

    // Single-select option cards and pills
    var opt = e.target.closest ? e.target.closest('.advisor-option-card, .advisor-pill-option') : null;
    if (opt && modal.contains(opt) && !opt.hasAttribute('data-multi-field')) {
      var field = opt.getAttribute('data-field');
      var value = opt.getAttribute('data-value');
      if (field && value) {
        advisorState[field] = value;
        updateAdvisorContent(false);
      }
      return;
    }

    // Buttons by ID
    if (e.target && modal.contains(e.target)) {
      var id = e.target.id || '';
      if (id === 'advisor-continue-1' || id === 'advisor-continue-2' || id === 'advisor-continue-3' || id === 'advisor-continue-4') {
        if (!e.target.disabled) advisorNextStep();
        return;
      }
      if (id === 'advisor-back-2' || id === 'advisor-back-3' || id === 'advisor-back-4' || id === 'advisor-back-5' || id === 'advisor-back-6') {
        advisorPrevStep();
        return;
      }
      if (id === 'lead-submit') { submitLeadCapture(); return; }
      if (id === 'lead-skip')   { skipLeadCapture();   return; }
      if (id === 'synth-cta-custom') { synthAddCustomToCart(); return; }
      if (id === 'synth-extended-submit') { submitExtendedResultsCapture(); return; }
    }
  });
}

// ============================================================
// BACKWARDS-COMPAT EXPORTS
// ============================================================
window.closeHerbalAdvisor = closeHerbalAdvisor;
window.openHerbalAdvisor = openHerbalAdvisor;
window.advisorState = advisorState;

window.buildCustomFromAdvisor = function() {
  var allies = advisorState.allies || [];
  var herbs = allies.map(function(a) {
    return (typeof BOTANICALS !== 'undefined') ? BOTANICALS.find(function(b) { return b.id === a.id; }) : null;
  }).filter(Boolean);
  window._pendingAdvisorHerbs = herbs;
  var formKey = advisorState.preferredFormat && advisorState.preferredFormat !== 'no-preference'
    ? mapPreferredFormatToKey(advisorState.preferredFormat)
    : (advisorState.patterns && advisorState.patterns[0] && advisorState.patterns[0].pattern.preferredForm) || 'capsule';
  window._pendingAdvisorForm = formKey;
  closeHerbalAdvisor();
  if (typeof showSection === 'function') showSection('custom-formula');
  if (formKey) {
    setTimeout(function() {
      var typeBtn = document.querySelector('.cc-type-btn[data-type="' + formKey + '"]');
      if (typeBtn) typeBtn.click();
    }, 150);
  }
};
