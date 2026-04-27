// Tarot deck — 78 cards (Major + Minor Arcana), light-magic interpretations only.
// Used by tarot-of-day.js. Server-side only.

export const TAROT_DECK = [
  // ===== MAJOR ARCANA =====
  { id: 0, number: '0', name: 'The Fool',
    meaning: 'A new beginning is at the threshold. Step lightly. Trust is the only luggage you need.',
    journal_prompt: 'What would I begin if I trusted myself completely?',
    affirmation: 'I walk forward in faith. The path arranges itself beneath my willing foot.',
    ritual: 'Take a single new step today — a small one. Notice what arrives.',
    product_suggestion: { name: 'Rose Soap', url: '/index.html#products' } },
  { id: 1, number: 'I', name: 'The Magician',
    meaning: 'You have everything you need. Your hands, your voice, your will.',
    journal_prompt: 'What tool am I forgetting I already hold?',
    affirmation: 'I am the wand. I am the cup. I am the spark.',
    ritual: 'Light a candle. Speak one intention aloud. Begin.',
    product_suggestion: { name: 'Custom Healing Balm', url: '/index.html#products' } },
  { id: 2, number: 'II', name: 'The High Priestess',
    meaning: 'Intuition is speaking. Trust what you feel, not what you can prove.',
    journal_prompt: 'What do I already know, deep down, that I have been avoiding?',
    affirmation: 'I trust my inner knowing. I am guided by light.',
    ritual: 'Light a white candle. Sit in silence for five minutes. Listen.',
    product_suggestion: { name: 'Lavender Loose Botanical', url: '/index.html#products' } },
  { id: 3, number: 'III', name: 'The Empress',
    meaning: 'Soft abundance. Receive what is being offered with open hands.',
    journal_prompt: 'Where is my life already abundant, and have I been thanking it?',
    affirmation: 'I am held by the generosity of life.',
    ritual: 'Place fresh flowers (even one bud) where you will see them all day.',
    product_suggestion: { name: 'Rose Loose Botanical', url: '/index.html#products' } },
  { id: 4, number: 'IV', name: 'The Emperor',
    meaning: 'Steady structure. Build the small bones of your day with care.',
    journal_prompt: 'Which ordinary routine is secretly holding everything together?',
    affirmation: 'My order is loving. My rules are kind.',
    ritual: 'Make your bed today, slowly, as a small altar of order.',
    product_suggestion: { name: 'Custom Hearth Blend', url: '/index.html#products' } },
  { id: 5, number: 'V', name: 'The Hierophant',
    meaning: 'Tradition has gifts. Borrow what serves; release the rest gently.',
    journal_prompt: 'What inherited practice is still mine to keep?',
    affirmation: 'I learn from those who came before. I add my own light.',
    ritual: 'Read one page of an old wisdom book. Take one line into your day.',
    product_suggestion: { name: 'Custom Smoke Bundle', url: '/index.html#products' } },
  { id: 6, number: 'VI', name: 'The Lovers',
    meaning: 'A choice rooted in love is at hand. Choose what feels true.',
    journal_prompt: 'Which choice is love asking me to make?',
    affirmation: 'I choose what loves me back.',
    ritual: 'Hold rose petals to your heart. Whisper the name of what you love.',
    product_suggestion: { name: 'Heart Healing Bath Salts', url: '/index.html#products' } },
  { id: 7, number: 'VII', name: 'The Chariot',
    meaning: 'Forward motion through clear will. Hold the reins, but ride softly.',
    journal_prompt: 'Where am I being asked to keep going?',
    affirmation: 'I move with steady, kind power.',
    ritual: 'Walk with intention for ten minutes today, naming where you are going.',
    product_suggestion: { name: 'Rosemary Loose Botanical', url: '/index.html#products' } },
  { id: 8, number: 'VIII', name: 'Strength',
    meaning: 'The lion is gentled with kindness, not with force.',
    journal_prompt: 'What inner strength is asking me to lead, gently?',
    affirmation: 'My strength is soft and unshakable.',
    ritual: 'Place your hand over your heart for one minute. That is the strength.',
    product_suggestion: { name: 'Custom Healing Balm', url: '/index.html#products' } },
  { id: 9, number: 'IX', name: 'The Hermit',
    meaning: 'A quiet inward turn. The lantern is yours.',
    journal_prompt: 'What does my own counsel sound like when I sit still?',
    affirmation: 'I am my own kind teacher tonight.',
    ritual: 'Light one candle and sit alone for fifteen minutes. No book, no music.',
    product_suggestion: { name: 'DreamEase Capsules', url: '/index.html#products' } },
  { id: 10, number: 'X', name: 'Wheel of Fortune',
    meaning: 'A turning. Bend with it; do not brace.',
    journal_prompt: 'What is rotating in my life, and how can I move with it?',
    affirmation: 'I trust the turning. I am held in the wheel.',
    ritual: 'Stand and turn slowly sunwise three times. Speak: “I move with the wheel.”',
    product_suggestion: { name: 'Custom Tea Blend', url: '/index.html#products' } },
  { id: 11, number: 'XI', name: 'Justice',
    meaning: 'Honest scales. The truth balances itself if you let it.',
    journal_prompt: 'Where am I being asked to tell the truth more clearly?',
    affirmation: 'I speak true. I act fair. I let truth do its work.',
    ritual: 'Write the truest sentence you can about today. Read it aloud once.',
    product_suggestion: { name: 'Sage Loose Botanical', url: '/index.html#products' } },
  { id: 12, number: 'XII', name: 'The Hanged One',
    meaning: 'Surrender brings the new view. Pause, hang, see.',
    journal_prompt: 'What perspective is shifting on its own if I stop forcing?',
    affirmation: 'I rest in not-yet-knowing. The view is arriving.',
    ritual: 'Lie on your back for ten minutes. Eyes open. Watch the ceiling like a sky.',
    product_suggestion: { name: 'Lavender Soap', url: '/index.html#products' } },
  { id: 13, number: 'XIII', name: 'Death',
    meaning: 'A gentle ending makes room. Composting is sacred work.',
    journal_prompt: 'What is finished, and what is being born from the same soil?',
    affirmation: 'I release what is complete. I welcome what is becoming.',
    ritual: 'Bury (or compost) one small thing you no longer need. Bless the soil.',
    product_suggestion: { name: 'Custom Smoke Bundle', url: '/index.html#products' } },
  { id: 14, number: 'XIV', name: 'Temperance',
    meaning: 'Gentle blending. Take the slow road; it leads farther.',
    journal_prompt: 'Where can I add a little water to my fire today?',
    affirmation: 'I move at the pace of my own healing.',
    ritual: 'Pour water from one vessel to another, slowly, three times. Sip the third.',
    product_suggestion: { name: 'Heart Healing Bath Salts', url: '/index.html#products' } },
  { id: 15, number: 'XV', name: 'The Devil (Reframed)',
    meaning: 'A pattern is asking to be looked at, not feared. Nothing has power without your name.',
    journal_prompt: 'What old loop am I ready to gently outgrow?',
    affirmation: 'I look softly at my shadow. I am bigger than the pattern.',
    ritual: 'Write the loop down. Tear the page. Drink water. Begin again.',
    product_suggestion: { name: 'Cleansing Spray', url: '/index.html#products' } },
  { id: 16, number: 'XVI', name: 'The Tower (Liberation)',
    meaning: 'A shaking that frees. What falls was never load-bearing.',
    journal_prompt: 'What collapse is actually a release?',
    affirmation: 'I am still here. I am still good. I am being made room for.',
    ritual: 'Open every window. Let the wind move what is loose.',
    product_suggestion: { name: 'Custom Anointing Oil', url: '/index.html#products' } },
  { id: 17, number: 'XVII', name: 'The Star',
    meaning: 'Hope is permitted. The wound is being washed in starlight.',
    journal_prompt: 'What faith is returning to me, quietly?',
    affirmation: 'I am held by the kind ones. The star is mine.',
    ritual: 'Stand outside (or by a window) and look at the night sky for three minutes.',
    product_suggestion: { name: 'Moon Water Bottle', url: '/index.html#products' } },
  { id: 18, number: 'XVIII', name: 'The Moon',
    meaning: 'Mystery, dream, the not-yet-named. Follow the soft light home.',
    journal_prompt: 'What is my dreaming self trying to show me?',
    affirmation: 'I trust the path even when it is moonlit.',
    ritual: 'Place a glass of water on a windowsill tonight. Drink in the morning.',
    product_suggestion: { name: 'DreamEase Capsules', url: '/index.html#products' } },
  { id: 19, number: 'XIX', name: 'The Sun',
    meaning: 'A wide, plain joy. Step into the warmth without apologizing.',
    journal_prompt: 'Where am I allowed to feel uncomplicated happiness?',
    affirmation: 'I am warmed. I am chosen. I am here.',
    ritual: 'Step outside and let sunlight (or a sunny window) touch your face for one full minute.',
    product_suggestion: { name: 'Calendula Loose Botanical', url: '/index.html#products' } },
  { id: 20, number: 'XX', name: 'Judgement (The Calling)',
    meaning: 'A new layer of yourself is being called forward. Answer.',
    journal_prompt: 'What part of me is rising, and is asking me to listen?',
    affirmation: 'I rise to my own becoming.',
    ritual: 'Speak your own name aloud three times, with reverence.',
    product_suggestion: { name: 'Custom Healing Balm', url: '/index.html#products' } },
  { id: 21, number: 'XXI', name: 'The World',
    meaning: 'A complete cycle. Pause. Bless the whole circle before the next one begins.',
    journal_prompt: 'What can I mark as finished, with gratitude, today?',
    affirmation: 'I close this chapter in love. I am ready for the next.',
    ritual: 'Write a list of one full cycle that just ended. Read aloud. Light a candle in thanks.',
    product_suggestion: { name: 'Custom Smoke Bundle', url: '/index.html#products' } }
];

// ===== MINOR ARCANA — generated with light-magic interpretations =====
const SUITS = [
  { suit: 'Wands',     element: 'Fire',  domain: 'inspiration, courage, creative spark' },
  { suit: 'Cups',      element: 'Water', domain: 'feelings, dreams, devotion, love' },
  { suit: 'Swords',    element: 'Air',   domain: 'mind, truth, clarity, communication' },
  { suit: 'Pentacles', element: 'Earth', domain: 'body, home, work, abundance' }
];

const NUMERIC_THEMES = {
  Ace:    { gist: 'a fresh beginning', prompt: 'What seed is being offered to me?' },
  Two:    { gist: 'a kind balance', prompt: 'Where am I being asked to choose softly?' },
  Three:  { gist: 'first gathering', prompt: 'Who is the third presence in this season — friend, ally, kind one?' },
  Four:   { gist: 'small rest', prompt: 'Where am I allowed to lay down briefly?' },
  Five:   { gist: 'gentle reckoning', prompt: 'What honest grief is asking to be witnessed?' },
  Six:    { gist: 'restoration', prompt: 'What is returning to right size in my life?' },
  Seven:  { gist: 'reflection', prompt: 'What do I see when I look without judging?' },
  Eight:  { gist: 'patient craft', prompt: 'Where is the slow, beautiful work happening?' },
  Nine:   { gist: 'ripening', prompt: 'What is almost ready to be picked?' },
  Ten:    { gist: 'fullness', prompt: 'What completion can I bless before moving on?' },
  Page:   { gist: 'curious learning', prompt: 'What is the beginner in me asking?' },
  Knight: { gist: 'eager motion', prompt: 'Where am I called to act with kind speed?' },
  Queen:  { gist: 'tending mastery', prompt: 'How am I learning to hold my own field?' },
  King:   { gist: 'mature leadership', prompt: 'What part of my life is ready to be ruled with love?' }
};

const RANKS = ['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Page','Knight','Queen','King'];

const SUIT_PRODUCTS = {
  Wands:     { name: 'Custom Anointing Oil',    url: '/index.html#products' },
  Cups:      { name: 'Heart Healing Bath Salts', url: '/index.html#products' },
  Swords:    { name: 'Rosemary Loose Botanical', url: '/index.html#products' },
  Pentacles: { name: 'Custom Hearth Blend',      url: '/index.html#products' }
};

let nextId = 22;
for (const s of SUITS) {
  for (const r of RANKS) {
    const theme = NUMERIC_THEMES[r];
    TAROT_DECK.push({
      id: nextId++,
      number: r,
      name: `${r} of ${s.suit}`,
      meaning: `${capital(theme.gist)} in the realm of ${s.domain}. The element of ${s.element} is the teacher today.`,
      journal_prompt: theme.prompt,
      affirmation: `I receive the ${s.element.toLowerCase()} medicine of ${theme.gist}.`,
      ritual: ritualForSuit(s.suit, r),
      product_suggestion: SUIT_PRODUCTS[s.suit]
    });
  }
}

function capital(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function ritualForSuit(suit, rank) {
  switch (suit) {
    case 'Wands':
      return 'Light a candle and speak one true sentence about what you are kindling.';
    case 'Cups':
      return 'Pour water into a cup. Hold it at heart level. Sip slowly while speaking gratitude.';
    case 'Swords':
      return 'Open a window. Speak aloud what is true. Let the wind take the part that is no longer yours.';
    case 'Pentacles':
      return 'Place a coin or stone in your palm. Breathe gratitude into it for one full minute.';
    default:
      return 'Sit quietly for one minute, hand at heart.';
  }
}

export default TAROT_DECK;
