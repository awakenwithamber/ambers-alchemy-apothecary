// =============================================================
// THE GRIMIOR — A True Book of Light Magic (server-side source)
// 88 sacred pages of healing, protection, ceremony, and devotion.
// All content is light magic only.
//
// This module is the single source of truth for Grimior content.
// It is consumed only by Netlify Functions on the server. The file
// is blocked from public serving via _redirects and netlify.toml.
// =============================================================

export const PAGES = [
  // -----------------------------------------------------------
  // FRONT MATTER (free preview — pages 1–5 are visible to all)
  // -----------------------------------------------------------
  {
    id: 'cover', kind: 'cover', is_free: true,
    title: 'The Grimior',
    subtitle: 'A True Book of Light Magic',
    keeper: 'Kept by Amber’s Alchemy Apothecary'
  },
  {
    id: 'welcome', kind: 'welcome', is_free: true, chapter: 'Opening', number: 1,
    title: 'Welcome, Dear Soul',
    body: [
      'Beloved reader, you have opened a tome carried by hand and by heart through long evenings of candle and quiet prayer.',
      'This is a book of light magic only — healing, protection, blessing, gratitude, and remembrance. Nothing within these pages is meant to bend another’s will or to harm. The work here is the work of returning yourself, gently, to your own gold.',
      'Read slowly. Whisper the words aloud when you can. Touch the page with reverence. The Grimior unfolds in the way an old garden unfolds: not all at once, but season by season.',
      'May every ritual you find here meet you precisely where you are.'
    ],
    closing: '— Amber'
  },
  { id: 'toc', kind: 'toc', is_free: true, title: 'Table of Contents' },

  { kind: 'chapter-divider', is_free: true, chapter: 'I', title: 'Opening the Path', verse: 'Begin where you stand. The path arranges itself beneath the willing foot.' },
  { kind: 'page', is_free: true, chapter: 'I', number: 2, title: 'Sample Ritual — Moon Blessing',
    intent: 'A complete light-magic ritual to bless yourself beneath the moon.',
    needs: ['A clear night, or any window with sky', 'A glass of water', 'A pinch of dried lavender or rose'],
    steps: [
      'Step outside or stand at an open window. Lift the glass of water toward the moon.',
      'Speak: “Lady moon, witness me. I am here, I am willing, I am loved.”',
      'Sprinkle the herb across the glass. Stir three times sunwise with a finger.',
      'Drink half. Pour the rest at the root of any plant or earth, with thanks.'
    ],
    cross_sell: ['Lavender Loose Botanical', 'Rose Soap']
  },
  { kind: 'page', is_free: true, chapter: 'I', number: 3, title: 'Smoke Cleansing & Protective Sigil',
    intent: 'A simple cleansing rite paired with a protective sigil for the threshold.',
    needs: ['Dried rosemary or lavender bundle', 'A heat-safe dish', 'A pen and small piece of paper'],
    steps: [
      'Open a window. Light the herb bundle and let it smolder safely.',
      'Walk every doorway sunwise, drifting smoke into corners and along thresholds.',
      'On the paper, draw a simple sigil: a circle with three rays at the top (sun) and two roots at the bottom (earth).',
      'Tuck the sigil above the front door. Speak: “This home is held. Only the kind may enter.”'
    ],
    cross_sell: ['Cleansing Spray', 'Custom Smoke Bundle']
  },

  // -----------------------------------------------------------
  // LOCKED PAGES — full Grimior (pages 6–88)
  // -----------------------------------------------------------
  { kind: 'page', is_free: false, chapter: 'I', number: 4, title: 'How to Use This Book',
    body: [
      'The Grimior is a companion, not a textbook. Begin anywhere a page calls to you. Trust resonance over order.',
      'Each ritual lists what you will need, how to prepare your space, the words to say, and the way to close. If you are missing an ingredient, substitute with intention.',
      'Keep a journal nearby. After each rite, jot the date, the moon phase, what you felt, and what you noticed in the days that followed.'
    ],
    practice: 'Tonight, simply hold this book against your chest for one slow minute. Breathe with it. That is the first ritual.'
  },
  { kind: 'page', is_free: false, chapter: 'I', number: 5, title: 'Sacred Ethics of Light Magic',
    body: [
      'Light magic moves with three quiet vows: harm none, free will is sacred, gratitude returns the gift.',
      'Never cast upon another without their knowing consent. Never use magic to bind, control, manipulate, or punish. Never call upon fear as fuel.',
      'When in doubt, ask: would I be glad if this rite were done for me, exactly as I am about to do it for another?'
    ],
    practice: 'Before any working, place hand to heart and say: “For the highest good of all. Let no harm move from my hands.”'
  },
  { kind: 'page', is_free: false, chapter: 'I', number: 6, title: 'Opening Sacred Space',
    intent: 'To prepare a clean, blessed container before any rite.',
    needs: ['A candle of any color', 'A small bowl of water', 'A pinch of salt', 'A few minutes of quiet'],
    steps: [
      'Light the candle. Let your eyes rest on the flame until your breath softens.',
      'Sprinkle the salt into the water. Stir three times sunwise.',
      'Walk the perimeter of your space, dipping your fingers in the water, sprinkling drops as you go.',
      'In each cardinal direction, whisper: “I welcome the kind ones. I welcome the wise. I welcome only the light.”',
      'Return to your seat. Hands open in your lap. The room is now ready.'
    ]
  },
  { kind: 'page', is_free: false, chapter: 'I', number: 7, title: 'Closing Sacred Space',
    intent: 'To gracefully release the rite and return to ordinary time.',
    needs: ['The candle from your opening', 'A grateful breath'],
    steps: [
      'Stand or sit, hands at heart center.',
      'Speak softly: “Thank you to the kind ones who came. Thank you to the wise who watched. The work is done. The doorway is closed in love.”',
      'Snuff or pinch the candle (do not blow it out, if you can help it).',
      'Drink a glass of cool water. Eat something small. Place feet flat on the floor for one minute.'
    ],
    note: 'Always close what you open.'
  },
  { kind: 'page', is_free: false, chapter: 'I', number: 8, title: 'History of Light Magic',
    body: [
      'Light magic is older than the word for it. Before there were temples, there were grandmothers tying knots into the hair of their grandchildren and whispering for safe travel. Before there were grimoires there were songs.',
      'Every culture has a thread: the Hebrew midwives blessing a new mother’s threshold, Celtic healers tying ribbons to a holy well, Yoruba elders pouring libation to ancestors, Andean weavers blessing thread before the loom.',
      'You inherit this work whenever you tend a candle for someone you love.'
    ]
  },
  { kind: 'page', is_free: false, chapter: 'I', number: 9, title: 'The Seven Laws of Magical Conduct',
    body: [
      'I. Harm none, including yourself.',
      'II. Honor consent in all things, magical and mundane.',
      'III. Thank what you take. Return what you can.',
      'IV. Tell the truth, especially to your own pen.',
      'V. The only worthy fuel is love.',
      'VI. What goes out, returns. Choose well.',
      'VII. Close every working you open.'
    ]
  },
  { kind: 'page', is_free: false, chapter: 'I', number: 10, title: 'Grounding & Centering',
    practice: 'Stand with feet hip-width. Imagine roots from your soles into the earth. Imagine starlight flowing from above into your crown. The two meet at your heart. Stay one full minute. Repeat as needed all day.'
  },
  { kind: 'page', is_free: false, chapter: 'I', number: 11, title: 'Breath as Sacred Tool',
    body: ['Breath is the original magic wand. With breath you can soften, kindle, ground, expand, or release.'],
    steps: [
      'Soften: in for 4, out for 6, six rounds.',
      'Kindle: in for 4, out for 4, twelve rounds, slightly louder.',
      'Ground: in for 6, hold for 2, out for 8, six rounds.'
    ]
  },
  { kind: 'page', is_free: false, chapter: 'I', number: 12, title: 'Working with Intention',
    body: ['Intention is the seed of every spell. Vague seeds grow vague gardens. The magic loves specificity, but is gentle with the messy human asking.'],
    practice: 'Before a working, write one sentence in present tense, beginning with “I am calling in...” Read aloud three times.'
  },
  { kind: 'page', is_free: false, chapter: 'I', number: 13, title: 'Altars & Sacred Space',
    body: ['An altar is a kept place that says “here, I remember.” It need not be ornate. A windowsill works. A shelf works. A drawer that you open daily works.'],
    steps: [
      'Cover with a cloth that pleases you.',
      'Place one item for each element: stone, feather, candle, shell, image of spirit.',
      'Tend at least once a week.'
    ]
  },
  { kind: 'page', is_free: false, chapter: 'I', number: 14, title: 'The Power of Belief',
    body: ['Belief is not a switch; it is a muscle. Some days it is strong, some days it is sleeping. The work is not to fake belief but to act lovingly even when belief naps.', 'The kind ones meet you where you are. They are patient.']
  },

  { kind: 'chapter-divider', chapter: 'II', title: 'The Elements', verse: 'Earth holds. Air carries. Fire transforms. Water remembers. Spirit weaves them whole.' },
  { kind: 'page', is_free: false, chapter: 'II', number: 15, title: 'Earth Magic',
    body: ['Earth is the body of the magic. She is patient, slow, generous. Call upon her when scattered, anxious, or untethered.'],
    correspondences: { direction: 'North', hour: 'Midnight', season: 'Winter', allies: 'Stones, roots, seeds, salt', colors: 'Brown, deep green, ochre' },
    practice: 'Place a small stone in your pocket today. Each time your hand finds it, take three slow breaths down into your feet.'
  },
  { kind: 'page', is_free: false, chapter: 'II', number: 16, title: 'Air Magic',
    body: ['Air is the breath of the magic. Messenger, mind, song, possibility.'],
    correspondences: { direction: 'East', hour: 'Dawn', season: 'Spring', allies: 'Feathers, incense smoke, bells', colors: 'Pale yellow, sky blue, white' },
    practice: 'Open a window. Speak aloud one truth that has been hard to say. Let the wind take it.'
  },
  { kind: 'page', is_free: false, chapter: 'II', number: 17, title: 'Fire Magic',
    body: ['Fire is the courage of the magic. Passion, transformation, the burning away of what is finished.'],
    correspondences: { direction: 'South', hour: 'Noon', season: 'Summer', allies: 'Candles, sunlight, hearth', colors: 'Red, orange, gold' },
    practice: 'Light a candle today simply to greet the element. No spell. Just hello.'
  },
  { kind: 'page', is_free: false, chapter: 'II', number: 18, title: 'Water Magic',
    body: ['Water is the feeling of the magic. Tide, tear, womb, mirror. Call her for grief, dreams, softness.'],
    correspondences: { direction: 'West', hour: 'Dusk', season: 'Autumn', allies: 'Shells, moon water, baths', colors: 'Deep blue, silver, sea green' },
    practice: 'Hold your hands under cool running water. Whisper “I release what is not mine” until you mean it.'
  },
  { kind: 'page', is_free: false, chapter: 'II', number: 19, title: 'Spirit / Aether',
    body: ['Spirit is the breath behind the breath. The thread that runs through every other element.', 'You do not call Spirit — Spirit is already here. You only remember.'],
    practice: 'Place your palm over your heart. Feel the pulse. That is Spirit, saying yes to your life.'
  },
  { kind: 'page', is_free: false, chapter: 'II', number: 20, title: 'Elemental Invocations',
    steps: [
      'Face East: “Air, breath of life, witness this work.”',
      'Face South: “Fire, courage of life, kindle this work.”',
      'Face West: “Water, feeling of life, deepen this work.”',
      'Face North: “Earth, body of life, root this work.”',
      'Hand to heart: “Spirit, weave it whole.”'
    ]
  },
  { kind: 'page', is_free: false, chapter: 'II', number: 21, title: 'Seasonal Alignments',
    body: ['Each season is a teacher: spring teaches courage, summer teaches generosity, autumn teaches release, winter teaches patience.'],
    practice: 'Once a month, sit outside (or by a window) for ten minutes and ask the season what it has come to teach you.'
  },
  { kind: 'page', is_free: false, chapter: 'II', number: 22, title: 'Working with Weather',
    body: ['Weather is a language. Rain washes, wind clears, sun blesses, snow stills.'],
    practice: 'When weather is loud, step outside (safely) for one minute and let it teach you. Thank it before going back in.'
  },
  { kind: 'page', is_free: false, chapter: 'II', number: 23, title: 'Crystals & Earth Allies',
    body: ['Stones remember. They hold time longer than we do. Begin with one stone, not many. Learn its voice first.'],
    practice: 'Choose one stone. Carry it for one moon cycle. Notice when your hand reaches for it.'
  },
  { kind: 'page', is_free: false, chapter: 'II', number: 24, title: 'Smoke & Air Allies',
    body: ['Smoke carries prayer. Use ethically sourced herbs only — garden sage, rosemary, lavender, mugwort, cedar from your bioregion.'],
    practice: 'Tie a small bundle of garden herbs with cotton string. Dry one moon cycle. Burn small leaves at a time.'
  },
  { kind: 'page', is_free: false, chapter: 'II', number: 25, title: 'Flame Scrying',
    steps: [
      'Light a single candle in a darkened room.',
      'Soften your gaze. Do not stare. Let the flame become slightly blurred.',
      'Ask one question silently. Watch the flame for five full breaths.',
      'Note any image, color, or feeling. Write it in your journal at once.'
    ]
  },
  { kind: 'page', is_free: false, chapter: 'II', number: 26, title: 'Sacred Water Blessings',
    practice: 'Pour water into a clean glass. Hold both hands over it. Speak a blessing aloud. Drink slowly, or pour it at the root of a plant. Water remembers what you tell it.'
  },

  { kind: 'chapter-divider', chapter: 'III', title: 'Moon Magic', verse: 'She does not hurry, and yet she changes everything.' },
  { kind: 'page', is_free: false, chapter: 'III', number: 27, title: 'Moon Phases Overview',
    body: ['New: plant. Waxing: tend. Full: charge. Waning: release. Dark: rest. The moon teaches the rhythm of doing, holding, and letting go.']
  },
  { kind: 'page', is_free: false, chapter: 'III', number: 28, title: 'New Moon Ritual',
    needs: ['Paper', 'Pen', 'Candle'],
    steps: [
      'Light the candle. Sit at a clean surface.',
      'Write at the top: “I am ready to call in...”',
      'List three intentions in present tense.',
      'Read aloud once. Fold small. Tuck under a houseplant or beneath the candle.',
      'Revisit at the next full moon.'
    ]
  },
  { kind: 'page', is_free: false, chapter: 'III', number: 29, title: 'Waxing Intentions',
    body: ['The waxing moon grows. So does anything you tend in this window: courage, projects, friendships, plant cuttings.'],
    practice: 'Each evening from new to full, name one small action you took toward your intention. Out loud.'
  },
  { kind: 'page', is_free: false, chapter: 'III', number: 30, title: 'Full Moon Charging',
    needs: ['Crystals or jewelry', 'A glass of water', 'Open sky or window'],
    steps: [
      'Place items where moonlight touches through the night.',
      'Stand beneath the moon for three breaths.',
      'Speak gratitude for one specific thing that has grown since the new moon.',
      'In the morning, retrieve.'
    ]
  },
  { kind: 'page', is_free: false, chapter: 'III', number: 31, title: 'Waning Release Ritual',
    practice: 'Write what you are releasing on a small slip. Tear into pieces. Bury or burn safely. Speak: “Thank you. You may go.”'
  },
  { kind: 'page', is_free: false, chapter: 'III', number: 32, title: 'Dark Moon Rest',
    body: ['The dark moon is the rest before the next breath. Not a void; a pause.'],
    practice: 'Do as little as possible. Bath, soft food, early sleep. Notes if dreams come strange and bright.'
  },
  { kind: 'page', is_free: false, chapter: 'III', number: 33, title: 'Drawing Down the Moon',
    steps: [
      'On a full moon night, stand beneath open sky or at a window.',
      'Cup hands as if holding water. Bring moonlight into your palms.',
      'Draw the cupped hands to your heart. Speak: “I carry her in me tonight.”',
      'Sleep with both hands over the heart.'
    ]
  },
  { kind: 'page', is_free: false, chapter: 'III', number: 34, title: 'Lunar Journals',
    body: ['Track moon phase, mood, dream, and one gratitude each evening. Patterns will emerge in three months.']
  },
  { kind: 'page', is_free: false, chapter: 'III', number: 35, title: 'Moon Water',
    needs: ['A clean glass jar', 'Filtered water', 'Moonlight'],
    steps: [
      'Fill the jar with water. Cover with breathable cloth.',
      'Place on a windowsill where moonlight touches overnight.',
      'In the morning, transfer to a covered bottle. Use within three days.',
      'Sip before bed; whisper: “I sleep beneath her watching.”'
    ],
    note: 'Substitute moon-blessed tea if raw water is not safe for you.'
  },
  { kind: 'page', is_free: false, chapter: 'III', number: 36, title: 'Moon Oils',
    body: ['Olive or jojoba oil, charged in moonlight overnight, is a beautiful anointing oil for any rite.'],
    practice: 'Add a few drops of lavender or rose oil. Anoint pulse points before sleep on a full moon.'
  },
  { kind: 'page', is_free: false, chapter: 'III', number: 37, title: 'Planting by the Moon',
    body: ['Plant leafy greens during the waxing moon. Plant root crops during the waning moon. Rest the soil at the dark moon.'],
    cross_sell: ['Custom Herbal Garden Blessing']
  },
  { kind: 'page', is_free: false, chapter: 'III', number: 38, title: 'Lunar Dream Work',
    steps: [
      'On a full moon, place a sprig of mugwort or bay leaf under your pillow.',
      'Whisper: “I remember what is mine to know.”',
      'Keep a notebook by the bed. Write before opening eyes.'
    ],
    note: 'Avoid mugwort during pregnancy.'
  },

  { kind: 'chapter-divider', chapter: 'IV', title: 'Protection & Boundaries', verse: 'A clean home is a kind home. A clean field is a clear voice.' },
  { kind: 'page', is_free: false, chapter: 'IV', number: 39, title: 'Protective Sigils',
    body: ['A sigil is a small drawn prayer. Simple is strong. A circle (wholeness), a triangle (direction), a spiral (return), and three rays (sun) cover most workings.'],
    practice: 'Draw one sigil daily for nine days. Notice which feels alive in your hand. That is yours.'
  },
  { kind: 'page', is_free: false, chapter: 'IV', number: 40, title: 'Salt & Threshold Work',
    intent: 'To set a firm, loving boundary around your home.',
    needs: ['Sea salt', 'A small dish'],
    steps: [
      'Stand at the threshold. Speak: “By this salt I am held. Only the kind may enter here.”',
      'Sprinkle a thin line across the threshold.',
      'Refresh on each new moon, or any time the energy softens.'
    ]
  },
  { kind: 'page', is_free: false, chapter: 'IV', number: 41, title: 'Mirror Shields',
    body: ['A small mirror by the front door, facing outward, returns to sender what is not yours. Be sure your motive is loving — mirror work amplifies tone.'],
    practice: 'Tape a small mirror inside a window or above the door. Wipe clean weekly with rosemary water.'
  },
  { kind: 'page', is_free: false, chapter: 'IV', number: 42, title: 'Cord Cutting',
    intent: 'To release lingering ties from a relationship or season that has ended.',
    needs: ['Twine', 'Scissors', 'Candle'],
    steps: [
      'Hold the twine. Speak the name aloud: “I release the cord between me and ____, with love.”',
      'Cut cleanly. Hold both halves.',
      'Speak: “What was mine, returns to me, blessed. What was theirs, returns to them, blessed.”',
      'Burn or bury the cut twine.'
    ]
  },
  { kind: 'page', is_free: false, chapter: 'IV', number: 43, title: 'Aura Clearing',
    practice: 'Imagine a soft golden waterfall pouring through your crown, washing every cell, exiting your soles into the earth. Continue one minute. Pat shoulders, arms, hips, thighs to seal.'
  },
  { kind: 'page', is_free: false, chapter: 'IV', number: 44, title: 'Protective Oils',
    body: ['Anointing oil for protection: olive oil base, a sprig of rosemary, a pinch of salt, a drop of frankincense oil if you have it.'],
    practice: 'Anoint a tiny dot at the soles of feet, behind ears, and at the base of throat before going into a hard situation.',
    cross_sell: ['Custom Anointing Oil']
  },
  { kind: 'page', is_free: false, chapter: 'IV', number: 45, title: 'Guardian Invocations',
    body: ['You may call upon any kind one you trust — ancestor, beloved dead, angel, deity of your tradition, archetype.'],
    practice: 'Light a candle. Speak: “[Name], stand at my side today. Walk a little ahead of me. Walk a little behind me. Thank you.”'
  },
  { kind: 'page', is_free: false, chapter: 'IV', number: 46, title: 'Warding the Home',
    steps: [
      'Stand at the center of your home. Imagine a sphere of light expanding to enclose every wall and roof.',
      'Walk every doorway, touching the frame: “This door is held.”',
      'Sprinkle salt at the front and back thresholds.',
      'Repeat seasonally.'
    ]
  },
  { kind: 'page', is_free: false, chapter: 'IV', number: 47, title: 'Psychic Hygiene',
    body: ['Most psychic exhaustion is borrowed energy you have not yet returned.'],
    practice: 'After every social or work-heavy day: hand-wash up to elbows in cool water. Speak: “What is not mine, return to its keeper. What is mine, return to me, blessed.”'
  },
  { kind: 'page', is_free: false, chapter: 'IV', number: 48, title: 'Boundaries as Sacred Practice',
    body: ['A boundary is not a wall. It is a clear line that lets the right things in and the wrong things out. A loving “no” is also magic.'],
    practice: 'Today, say one true thing you have been swallowing. Even gently. Even briefly.'
  },

  { kind: 'chapter-divider', chapter: 'V', title: 'Healing Rituals', verse: 'You are not broken. You are remembering.' },
  { kind: 'page', is_free: false, chapter: 'V', number: 49, title: 'Light Healing Overview',
    body: ['Light healing is the practice of inviting kind, intelligent light to flow where the body or heart asks for it. We do not push. We invite.']
  },
  { kind: 'page', is_free: false, chapter: 'V', number: 50, title: 'Color Healing',
    body: [
      'Red — vitality. Orange — creativity. Yellow — confidence.',
      'Green — heart, healing. Blue — peace, throat. Indigo — vision.',
      'Violet — crown, devotion. Gold — abundance. White — purification.'
    ],
    practice: 'Place a hand where the body aches. Imagine the matching color softly filling that place. Breathe with it for five minutes.'
  },
  { kind: 'page', is_free: false, chapter: 'V', number: 51, title: 'Crystal Healing Layouts',
    practice: 'Lie down. Place rose quartz at heart. Amethyst above the head. Black tourmaline at the soles of feet. Stay 10–20 minutes. Cleanse stones afterward.'
  },
  { kind: 'page', is_free: false, chapter: 'V', number: 52, title: 'Sound Healing',
    body: ['Sound is the first medicine — humming, singing bowls, drumming, even ocean recordings.'],
    practice: 'Hum on a long out-breath while one hand rests over the heart. Two minutes. The chest is its own instrument.'
  },
  { kind: 'page', is_free: false, chapter: 'V', number: 53, title: 'Herbal Remedies (Spiritual)',
    body: ['Always check medical safety first. Herbal companions for gentle support: lemon balm for mood, chamomile for nerves, rose for grief, oat straw for nourishment.'],
    cross_sell: ['Custom Healing Tea Blend']
  },
  { kind: 'page', is_free: false, chapter: 'V', number: 54, title: 'Self-Love Ritual',
    needs: ['A pink or white candle', 'Rose petals', 'A mirror'],
    steps: [
      'Light the candle. Sprinkle petals around its base.',
      'Look in the mirror. Place hand at heart.',
      'Say slowly: “I see you. I am proud of you. We are going to be alright.”',
      'Repeat for three breaths.'
    ],
    cross_sell: ['Rose Soap', 'Heart Healing Bath Salts']
  },
  { kind: 'page', is_free: false, chapter: 'V', number: 55, title: 'Grief Ritual',
    body: ['Grief is sacred. It is the love that has nowhere to go. Make it a place.'],
    steps: [
      'Light a candle for the one (or thing) you grieve.',
      'Speak their name aloud. Speak one specific memory.',
      'Drink a glass of cool water. Eat something small.',
      'Light the candle again tomorrow if you wish. Grief asks for repetition.'
    ]
  },
  { kind: 'page', is_free: false, chapter: 'V', number: 56, title: 'Anxiety Clearing',
    practice: 'Breathe in for 4, hold for 7, out for 8. Six rounds. Then place one hand over heart, one on belly. Whisper: “I am safe in this minute. This minute is enough.”'
  },
  { kind: 'page', is_free: false, chapter: 'V', number: 57, title: 'Healing Others (with Permission)',
    body: ['Always ask first, with words. Never send healing to anyone who has not consented — free will is sacred. Send light to a situation, not a person, when in doubt.']
  },
  { kind: 'page', is_free: false, chapter: 'V', number: 58, title: 'Ancestral Healing',
    practice: 'Light a candle on a Sunday. Speak: “Beloved ancestors of the line of the kind ones, I tend to you tonight. May you be at rest, may we walk well together.” Sit five minutes. Note dreams.'
  },

  { kind: 'chapter-divider', chapter: 'VI', title: 'Abundance & Manifestation', verse: 'Abundance is not what you receive. It is what you can hold without tightening your hands.' },
  { kind: 'page', is_free: false, chapter: 'VI', number: 59, title: 'Laws of Attraction in Magic',
    body: ['What you tend grows. What you fear grows. The work is to tend, not fear.', 'Speak in present tense, not future. “I am calling in” not “I hope to receive.”']
  },
  { kind: 'page', is_free: false, chapter: 'VI', number: 60, title: 'Green Candle Abundance Ritual',
    needs: ['A green candle', 'A coin', 'Basil or cinnamon'],
    steps: [
      'Anoint candle with olive oil. Roll in herb.',
      'Place coin at base. Hold and breathe gratitude for what you already have.',
      'Light. Speak: “I receive what is mine to receive, in right time, in right way, harming none.”',
      'Carry the coin in your wallet for one moon cycle.'
    ]
  },
  { kind: 'page', is_free: false, chapter: 'VI', number: 61, title: 'Prosperity Sigil',
    practice: 'Draw a circle. Inside it draw a coin shape and a wheat sheaf. Tuck under wallet or near front door. Refresh seasonally.'
  },
  { kind: 'page', is_free: false, chapter: 'VI', number: 62, title: 'Money Flow Clearing',
    practice: 'Empty your wallet. Wipe clean inside and out. Fold each bill neatly. Speak: “I honor what flows through.” Replace, with intention.'
  },
  { kind: 'page', is_free: false, chapter: 'VI', number: 63, title: 'Gratitude as Spell',
    practice: 'Each morning for nine days, write nine specific gratitudes. Read aloud as a love letter. Burn the page (safely) on day nine as offering.'
  },
  { kind: 'page', is_free: false, chapter: 'VI', number: 64, title: 'Business Blessing',
    needs: ['A token from your work', 'Salt water', 'Candle'],
    steps: [
      'Wipe the token with salt water. Dry.',
      'Hold before the candle: “May this work serve. May my hands be steady. May the right doors open and the wrong doors close gently.”',
      'Return to its place. Repeat each new season.'
    ]
  },
  { kind: 'page', is_free: false, chapter: 'VI', number: 65, title: 'Home Blessing',
    steps: [
      'Light a candle in the most-used room.',
      'Walk every doorway, touching the frame: “May this home be safe. May this home be warm. May this home be a place where the kind ones rest.”',
      'Repeat seasonally.'
    ]
  },
  { kind: 'page', is_free: false, chapter: 'VI', number: 66, title: 'Harvest Magic',
    body: ['Whenever you receive (a paycheck, a gift, a windfall), pause for one minute of gratitude before spending. The pause is the spell.']
  },
  { kind: 'page', is_free: false, chapter: 'VI', number: 67, title: 'Prosperity Oil Recipe',
    body: ['Olive oil base. Add: a pinch of basil, a thin sliver of cinnamon stick, three peppercorns. Steep one moon cycle. Strain.'],
    practice: 'Anoint coins, candles, the doorframe of your workplace.'
  },
  { kind: 'page', is_free: false, chapter: 'VI', number: 68, title: 'Wealth Altar Setup',
    body: ['On a small surface: a green cloth, a coin, a small dish of grain, a green or gold candle, an image of what wealth means to you (not money — the life it allows). Tend weekly.']
  },

  { kind: 'chapter-divider', chapter: 'VII', title: 'Divination', verse: 'The pen is a slow oracle.' },
  { kind: 'page', is_free: false, chapter: 'VII', number: 69, title: 'Introduction to Divination',
    body: ['Divination is not fortune-telling. It is asking the kind ones for a hand on the small of your back, a whisper of which way to lean. The future is not fixed.']
  },
  { kind: 'page', is_free: false, chapter: 'VII', number: 70, title: 'Tarot Basics for Light Workers',
    body: ['Treat each card as a teacher, not a verdict. The Tower is invitation, not punishment. The Devil is a mirror to your shadow, not a curse.', 'Read for guidance, not prophecy.']
  },
  { kind: 'page', is_free: false, chapter: 'VII', number: 71, title: 'Reading for Others',
    body: ['Always ask consent. Never read about a third party who has not consented. Never read to frighten. Hold the cards with reverence.']
  },
  { kind: 'page', is_free: false, chapter: 'VII', number: 72, title: 'Pendulum Work',
    steps: [
      'Hold pendulum still. Ask: “Show me yes.” Note the swing. “Show me no.” Note the swing. “Show me unclear.” Note.',
      'Ask only yes/no questions you genuinely do not have an answer to.',
      'Thank the pendulum after.'
    ]
  },
  { kind: 'page', is_free: false, chapter: 'VII', number: 73, title: 'Mirror Scrying',
    steps: [
      'Sit before a black mirror or any mirror in dim light. One candle.',
      'Soften gaze for five minutes. Ask one question.',
      'Note any image, color, or feeling. Write at once.'
    ]
  },
  { kind: 'page', is_free: false, chapter: 'VII', number: 74, title: 'Dream Journaling as Oracle',
    body: ['The dreaming self knows what the waking self has not yet been told. Keep a notebook by the bed. Write before moving.']
  },
  { kind: 'page', is_free: false, chapter: 'VII', number: 75, title: 'Nature Signs',
    body: ['The kind ones often answer through what is at hand: a feather on the path, a bird crossing your route, the first flower of the season. Trust the noticing.']
  },
  { kind: 'page', is_free: false, chapter: 'VII', number: 76, title: 'Intuition Development',
    practice: 'For one day, ask before each small decision: “Body, what do you know?” Note the first sensation. Trust it. Track results in your journal.'
  },

  { kind: 'chapter-divider', chapter: 'VIII', title: 'Advanced Light Workings', verse: 'The deeper the work, the gentler the touch.' },
  { kind: 'page', is_free: false, chapter: 'VIII', number: 77, title: 'Group Ritual Structure',
    steps: [
      'Open: each person speaks one sentence of intention.',
      'Center: a moment of shared silence or hum.',
      'Working: the agreed rite.',
      'Close: each person speaks one gratitude.',
      'Ground: share food and water before parting.'
    ]
  },
  { kind: 'page', is_free: false, chapter: 'VIII', number: 78, title: 'Distance Healing',
    body: ['Always with consent. Light a candle. Picture the person well, whole, smiling. Hold the image for five minutes. Speak: “For your highest good. May only what you welcome arrive.” Snuff the candle.']
  },
  { kind: 'page', is_free: false, chapter: 'VIII', number: 79, title: 'Sigil Activation',
    steps: [
      'Draw the sigil cleanly on paper.',
      'Hold and breathe slowly until it feels alive.',
      'Speak its purpose once, present tense.',
      'Burn (safely), bury, or carry. Choose one.'
    ]
  },
  { kind: 'page', is_free: false, chapter: 'VIII', number: 80, title: 'Candle Magic Advanced',
    body: ['Layered candle work uses color, anointing direction (toward wick draws in, toward base releases), and herbs together. Always set timer for safety.'],
    cross_sell: ['Ritual Candle']
  },
  { kind: 'page', is_free: false, chapter: 'VIII', number: 81, title: 'Seasonal Sabbat Rituals',
    body: [
      'Imbolc — first stirring, candles. Ostara — spring equinox, eggs.',
      'Beltane — may flowers, fire. Litha — summer solstice, sun.',
      'Lughnasadh — first harvest, bread. Mabon — autumn equinox, gratitude.',
      'Samhain — ancestors. Yule — winter solstice, evergreens.'
    ]
  },
  { kind: 'page', is_free: false, chapter: 'VIII', number: 82, title: 'Devotional Practice',
    body: ['Choose one practice. Do it daily for forty days. A candle, a glass of water, a hand to the heart. Forty days will change something you cannot yet see.']
  },

  { kind: 'chapter-divider', chapter: 'IX', title: 'The Living Grimior', verse: 'A book closed is not a book ended. It is a book waiting.' },
  { kind: 'page', is_free: false, chapter: 'IX', number: 83, title: 'Writing Your Own Rituals',
    body: ['You are now the keeper. When you write a rite, follow this shape: intent — gather — prepare — invoke — work — thank — close — ground.']
  },
  { kind: 'page', is_free: false, chapter: 'IX', number: 84, title: 'Documenting Results',
    body: ['Date, moon phase, intent, what you did, what you felt, what you noticed in the days after. A grimoire grows in the noticing.']
  },
  { kind: 'page', is_free: false, chapter: 'IX', number: 85, title: 'Ethical Guidelines Revisited',
    body: ['Re-read the Seven Laws every season. They are simple, but they bend under pressure. Keep them straight.']
  },
  { kind: 'page', is_free: false, chapter: 'IX', number: 86, title: 'Building a Coven or Circle',
    body: ['A circle is built on consent, kindness, and shared ethics. Three is enough. Begin small. Honor disagreement. Let people leave when called to.']
  },
  { kind: 'page', is_free: false, chapter: 'IX', number: 87, title: 'Resources & Further Study',
    body: ['Read widely, but discern. Living elders > books > internet. Always check sourcing for endangered plants. Always test what teachers say against your own knowing.']
  },
  { kind: 'page', is_free: false, chapter: 'IX', number: 88, title: 'Closing Blessing & Dedication',
    body: [
      'May your hands be warm. May your sleep be sweet. May your kettle always sing.',
      'May the kind ones walk a little ahead of you on the road, and the wise ones a little behind.',
      'May this Grimior find you again whenever you need it, and may you find yourself in the finding.'
    ],
    closing: '— In love, always. — Amber'
  }
];

PAGES.forEach(function(p, i) {
  p.index = i;
  if (typeof p.is_free !== 'boolean') p.is_free = false;
});

export const FREE_INDEXES = PAGES
  .map(function(p, i) { return p.is_free ? i : -1; })
  .filter(function(i) { return i !== -1; });

export function getFreePages() {
  return PAGES.filter(function(p) { return p.is_free; });
}

export function getAllPages() {
  return PAGES;
}

export default { PAGES, FREE_INDEXES, getFreePages, getAllPages };
