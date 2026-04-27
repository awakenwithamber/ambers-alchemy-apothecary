// ============================================================
// THE GRIMIOR — A True Book of Light Magic
// 88 sacred pages of healing, protection, ceremony, and devotion.
// All content is light magic only: nothing manipulative, nothing dark.
// ============================================================

window.GRIMIOR_PAGES = [
  // -----------------------------------------------------------
  // FRONT MATTER (always visible to free visitors)
  // -----------------------------------------------------------
  {
    id: 'cover',
    kind: 'cover',
    preview: true,
    title: 'The Grimior',
    subtitle: 'A True Book of Light Magic',
    keeper: 'Kept by Amber’s Alchemy Apothecary'
  },
  {
    id: 'welcome',
    kind: 'welcome',
    preview: true,
    chapter: 'Opening',
    number: 1,
    title: 'Welcome, Dear Soul',
    body: [
      'Beloved reader, you have opened a tome carried by hand and by heart through long evenings of candle and quiet prayer.',
      'This is a book of light magic only — healing, protection, blessing, gratitude, and remembrance. Nothing within these pages is meant to bend another’s will or to harm. The work here is the work of returning yourself, gently, to your own gold.',
      'Read slowly. Whisper the words aloud when you can. Touch the page with reverence. The Grimior unfolds in the way an old garden unfolds: not all at once, but season by season.',
      'May every ritual you find here meet you precisely where you are.'
    ],
    closing: '— Amber'
  },
  {
    id: 'toc',
    kind: 'toc',
    preview: true,
    title: 'Table of Contents'
  },

  // -----------------------------------------------------------
  // CHAPTER I — OPENING THE PATH
  // -----------------------------------------------------------
  { kind: 'chapter-divider', preview: true, chapter: 'I', title: 'Opening the Path', verse: 'Begin where you stand. The path arranges itself beneath the willing foot.' },
  {
    kind: 'page', chapter: 'I', number: 2, title: 'How to Use This Book',
    body: [
      'The Grimior is a companion, not a textbook. Begin anywhere a page calls to you. Trust resonance over order.',
      'Each ritual lists what you will need, how to prepare your space, the words to say, and the way to close. If you are missing an ingredient, substitute with intention — the heart of magic is sincerity, not perfection.',
      'Keep a journal nearby. After each rite, jot the date, the moon phase if you know it, what you felt, and what you noticed in the days that followed.'
    ],
    practice: 'Tonight, simply hold this book against your chest for one slow minute. Breathe with it. That is the first ritual.'
  },
  {
    kind: 'page', chapter: 'I', number: 3, title: 'Sacred Ethics of Light Magic',
    body: [
      'Light magic moves with three quiet vows: harm none, free will is sacred, gratitude returns the gift.',
      'Never cast upon another without their knowing consent. Never use magic to bind, control, manipulate, or punish. Never call upon fear as fuel. The flame you tend will only ever match the flame you carry.',
      'When in doubt, ask yourself: would I be glad if this rite were done for me, exactly as I am about to do it for another?'
    ],
    practice: 'Before any working, place hand to heart and say: “For the highest good of all. Let no harm move from my hands.”'
  },
  {
    kind: 'page', chapter: 'I', number: 4, title: 'Opening Sacred Space',
    intent: 'To prepare a clean, blessed container before any rite.',
    needs: ['A candle of any color', 'A small bowl of water', 'A pinch of salt', 'A few minutes of quiet'],
    steps: [
      'Light the candle. Let your eyes rest on the flame until your breath softens.',
      'Sprinkle the salt into the water. Stir three times sunwise (clockwise).',
      'Walk the perimeter of your space, dipping your fingers in the water, sprinkling a few drops as you go.',
      'In each cardinal direction, whisper: “I welcome the kind ones. I welcome the wise. I welcome only the light.”',
      'Return to your seat. Hands open in your lap. The room is now ready.'
    ]
  },
  {
    kind: 'page', chapter: 'I', number: 5, title: 'Closing Sacred Space',
    intent: 'To gracefully release the rite and return to ordinary time.',
    needs: ['The candle from your opening', 'A grateful breath'],
    steps: [
      'Stand or sit, hands at heart center.',
      'Speak softly: “Thank you to the kind ones who came. Thank you to the wise who watched. The work is done. The doorway is closed in love.”',
      'Snuff or pinch the candle (do not blow it out, if you can help it).',
      'Drink a glass of cool water. Eat something small. Place feet flat on the floor for one minute.'
    ],
    note: 'Always close what you open. A tidy magician is a long-lived magician.'
  },

  // -----------------------------------------------------------
  // CHAPTER II — THE ELEMENTS
  // -----------------------------------------------------------
  { kind: 'chapter-divider', chapter: 'II', title: 'The Elements', verse: 'Earth holds. Air carries. Fire transforms. Water remembers. Spirit weaves them whole.' },
  {
    kind: 'page', chapter: 'II', number: 6, title: 'Earth',
    body: [
      'Earth is the body of the magic. She is patient, slow, generous. She accepts everything composted into her and returns it as bloom.',
      'Call upon Earth when you feel scattered, unrooted, anxious, or untethered to your own life. Sit on the ground. Let your weight settle. Let her drink the static from your nerves.'
    ],
    correspondences: { direction: 'North', hour: 'Midnight', season: 'Winter', allies: 'Stones, roots, seeds, salt', colors: 'Brown, deep green, ochre' },
    practice: 'Place a small stone in your pocket today. Each time your hand finds it, take three slow breaths down into your feet.'
  },
  {
    kind: 'page', chapter: 'II', number: 7, title: 'Air',
    body: [
      'Air is the breath of the magic. She is messenger, mind, song, possibility. She carries prayers and disperses what no longer serves.',
      'Call upon Air when your thoughts are tangled, when you need clarity, when you want a message to travel.'
    ],
    correspondences: { direction: 'East', hour: 'Dawn', season: 'Spring', allies: 'Feathers, incense smoke, bells, wings', colors: 'Pale yellow, sky blue, white' },
    practice: 'Open a window. Speak aloud one truth that has been hard to say. Let the wind take it.'
  },
  {
    kind: 'page', chapter: 'II', number: 8, title: 'Fire',
    body: [
      'Fire is the courage of the magic. He is passion, transformation, the burning away of what is finished.',
      'Call upon Fire when you need to begin, to shed, to defend a sacred flame within yourself, or to bring warmth to a cold place.'
    ],
    correspondences: { direction: 'South', hour: 'Noon', season: 'Summer', allies: 'Candles, sunlight, hearth, peppers, ginger', colors: 'Red, orange, gold' },
    practice: 'Light a candle today simply to greet the element. No spell. Just hello.'
  },
  {
    kind: 'page', chapter: 'II', number: 9, title: 'Water',
    body: [
      'Water is the feeling of the magic. She is tide, tear, womb, mirror. She remembers everything and forgives most of it.',
      'Call upon Water when you need to grieve, to dream, to soften, to be honest with yourself, or to wash the day from your skin.'
    ],
    correspondences: { direction: 'West', hour: 'Dusk', season: 'Autumn', allies: 'Shells, moon water, dew, rivers, baths', colors: 'Deep blue, silver, sea green' },
    practice: 'Hold your hands under cool running water. Whisper “I release what is not mine” until you mean it.'
  },
  {
    kind: 'page', chapter: 'II', number: 10, title: 'Spirit',
    body: [
      'Spirit is the breath behind the breath. The thread that runs through every other element. The witness, the weaver, the love that animates the form.',
      'You do not call Spirit — Spirit is already here. You only remember.'
    ],
    correspondences: { direction: 'Center', hour: 'Always', season: 'All', allies: 'Silence, song, tears of joy', colors: 'White, violet, iridescent' },
    practice: 'Place your palm over your heart. Feel the pulse. That is Spirit, saying yes to your life.'
  },
  {
    kind: 'page', chapter: 'II', number: 11, title: 'Balancing the Elements',
    body: [
      'When life feels off, ask: which element is too loud, which is too quiet?',
      'Too much fire — anger, burnout, restlessness. Soothe with water and earth.',
      'Too much water — weeping, drifting, longing. Anchor with earth, kindle with fire.',
      'Too much air — racing thoughts, anxiety. Ground with earth, warm with fire.',
      'Too much earth — heaviness, stuck. Stir with air, move with fire.'
    ],
    practice: 'For seven days, name the loudest element of your morning. Bring in a small offering of its opposite.'
  },

  // -----------------------------------------------------------
  // CHAPTER III — PROTECTION + CLEANSING (preview-eligible)
  // -----------------------------------------------------------
  { kind: 'chapter-divider', chapter: 'III', title: 'Protection & Cleansing', verse: 'A clean home is a kind home. A clean field is a clear voice.' },
  {
    kind: 'page', chapter: 'III', number: 12, title: 'Home Cleansing Rite',
    preview: true,
    intent: 'To clear stagnant, heavy, or borrowed energy from your living space.',
    needs: ['A bundle of dried rosemary or lavender (or a sprig of fresh)', 'A heat-safe dish', 'A window opened in every room', 'Sea salt'],
    steps: [
      'Open every window in your home, even just a crack. The old air must have somewhere to go.',
      'Light the herb bundle and let it smolder. Walk every room sunwise (clockwise), guiding the smoke into corners, behind doors, along thresholds.',
      'In each room, say aloud: “What is mine, stay. What is not mine, go now in peace.”',
      'When you reach the front door, sweep the smoke outward across the threshold.',
      'Sprinkle a small line of sea salt at the front and back doors. Close the windows.',
      'Light a fresh candle in your kitchen as a small thank-you to the home.'
    ],
    cross_sell: ['Cleansing Spray', 'Protection Candle', 'Custom Herbal Smoke Bundle']
  },
  {
    kind: 'page', chapter: 'III', number: 13, title: 'Aura Protection',
    preview: true,
    intent: 'To strengthen your energetic field before going into a crowd, an appointment, or a hard conversation.',
    needs: ['Two minutes', 'A glass of water'],
    steps: [
      'Stand with feet planted shoulder-width. Drink a sip of water. Feel it go down.',
      'Imagine a soft golden light gathering at your heart. With each in-breath, it grows.',
      'On the out-breath, the light expands outward in a sphere around your whole body — above your head, below your feet, behind your back, in front of you, and on either side.',
      'Say silently: “My field is mine. Only love, only kindness, only what is for my good crosses this line today.”',
      'Pat your arms and chest gently to seal the working.'
    ]
  },
  {
    kind: 'page', chapter: 'III', number: 14, title: 'The Salt Boundary Rite',
    intent: 'To set a firm, loving boundary around your home or a single room.',
    needs: ['Sea salt', 'A small dish', 'A cup of moon water (optional)'],
    steps: [
      'Stand at the threshold. Pour salt into your dish.',
      'Speak: “By this salt I am held. By this salt I am clear. By this salt only the kind may enter here.”',
      'Sprinkle a thin line across the threshold or around the perimeter.',
      'Refresh the line on each new moon, or any time you feel the energy soften.'
    ],
    note: 'Salt may be swept up and replaced as often as is helpful. Some keepers tuck a small dish of salt under the bed for sleep protection.'
  },
  {
    kind: 'page', chapter: 'III', number: 15, title: 'Protection Candle Spell',
    preview: true,
    intent: 'To call a steady, loving guard around yourself or a loved one.',
    needs: ['A black or deep blue candle', 'A pinch of dried rosemary', 'A safe candle holder', 'A few quiet minutes'],
    steps: [
      'Anoint the candle lightly with olive oil from base to wick.',
      'Roll the candle in dried rosemary, pressing the herb gently into the wax.',
      'Hold it in both hands. Picture the person you are protecting (yourself counts).',
      'Whisper three times: “You are loved. You are held. You are guarded by the kind ones. Only good may approach.”',
      'Light the candle in a safe place. Let it burn fully if it is safe to do so, or pinch and re-light each evening for seven days.'
    ],
    cross_sell: ['Ritual Candle', 'Rosemary Loose Botanical', 'Custom Herbal Blend']
  },
  {
    kind: 'page', chapter: 'III', number: 16, title: 'Cord-Release Working',
    intent: 'To release lingering energetic ties from a relationship, situation, or season that has ended.',
    needs: ['A length of natural twine', 'A pair of scissors or shears', 'A candle'],
    steps: [
      'Hold the twine. Speak the name (or situation) you are unhooking from — “I release the cord between me and ____, with love.”',
      'Run the twine slowly through your fingers. Picture the cord between you growing thinner, lighter.',
      'When you are ready, cut the twine in one clean motion.',
      'Hold both halves and say: “What was mine, returns to me, blessed. What was theirs, returns to them, blessed.”',
      'Bury the cut twine in earth, or burn it in your fire-safe dish, or release it to a moving stream.'
    ],
    note: 'Cord-release is not punishment. It is bookkeeping for the soul.'
  },
  {
    kind: 'page', chapter: 'III', number: 17, title: 'Return to Self',
    intent: 'To call your own scattered energy home after a draining day or week.',
    needs: ['A cup of warm tea or warm water', 'A blanket', 'Five quiet minutes'],
    steps: [
      'Sit wrapped in your blanket. Hold the warm cup with both hands.',
      'Close your eyes. Breathe in for four, out for six. Repeat seven times.',
      'Say softly: “All parts of me, come home now. From every place I left a piece, from every conversation I gave too much, from every screen and every street — come home, come home, come home.”',
      'Drink the tea slowly. With every sip, feel a piece of you returning.'
    ]
  },

  // -----------------------------------------------------------
  // CHAPTER IV — SLEEP + DREAMS
  // -----------------------------------------------------------
  { kind: 'chapter-divider', chapter: 'IV', title: 'Sleep & Dreams', verse: 'Sleep is sacred. The dreaming self knows things the waking self has not yet been told.' },
  {
    kind: 'page', chapter: 'IV', number: 18, title: 'Deep Sleep Ritual',
    intent: 'To soften the body and mind into a long, restorative rest.',
    needs: ['A cup of chamomile or lavender tea', 'A few drops of lavender on the pillow', 'A dim lamp'],
    steps: [
      'Dim the lights one full hour before bed. Let your eyes know night has come.',
      'Brew the tea. Drink it slowly, on the bed or beside it.',
      'Place a small dish of dried lavender on your nightstand, or a few drops of lavender oil on a corner of the pillowcase.',
      'Lie down. Place one hand on your belly and one on your heart. Say: “I am safe. The day is closed. The dreaming may begin.”',
      'Breathe gently and let yourself drift.'
    ],
    cross_sell: ['DreamEase Capsules', 'Lavender Soap', 'Custom Sleep Tea']
  },
  {
    kind: 'page', chapter: 'IV', number: 19, title: 'Dream Recall',
    intent: 'To strengthen your memory of the dreaming life.',
    needs: ['A small notebook by the bed', 'A pen', 'A piece of mugwort or bay leaf under the pillow (optional)'],
    steps: [
      'Before sleeping, whisper: “I remember my dreams. I bring back what is mine to know.”',
      'Upon waking — even before opening your eyes — stay still and let the dream settle back in.',
      'Reach for the notebook without fully sitting up. Write the first images, the first feelings, the first words.',
      'Even one fragment counts. Practice grows the bridge.'
    ]
  },
  {
    kind: 'page', chapter: 'IV', number: 20, title: 'Peaceful Bedroom Blessing',
    intent: 'To turn your bedroom into a true sanctuary.',
    needs: ['A clean, made bed', 'A small bouquet or single flower', 'A candle (lit only while you are awake)'],
    steps: [
      'Strip the bed and remake it with care. Fold corners. Smooth the pillow.',
      'Place the flower on your nightstand or windowsill.',
      'Stand at the foot of the bed. Speak: “This is a place of rest. This is a place of softness. Only kindness sleeps here. Only the kind ones keep watch.”',
      'Light the candle for a few minutes (snuff before bed). Take a slow look around the room and let it know you love it.'
    ]
  },
  {
    kind: 'page', chapter: 'IV', number: 21, title: 'Moon Water for Sleep',
    intent: 'To carry the moon’s soft permission into your nightly cup.',
    needs: ['A clean glass jar', 'Filtered water', 'A clear or full moon night'],
    steps: [
      'Fill the jar with water. Cover with a breathable cloth or loose lid.',
      'Place the jar on a windowsill where moonlight will touch it overnight.',
      'In the morning, transfer to a covered bottle and store in the fridge for up to three days.',
      'Take a small sip before bed. Whisper: “I sleep beneath her watching. I wake beneath her blessing.”'
    ],
    note: 'Moon water is not for those with conditions affected by raw water; substitute with hot tea brewed under the moonlight as a safe alternative.'
  },

  // -----------------------------------------------------------
  // CHAPTER V — SELF LOVE + BEAUTY
  // -----------------------------------------------------------
  { kind: 'chapter-divider', chapter: 'V', title: 'Self Love & Beauty', verse: 'You were not put here to earn your worth. You were put here to remember it.' },
  {
    kind: 'page', chapter: 'V', number: 22, title: 'Rose Bath Ritual',
    preview: true,
    intent: 'To soak in the frequency of self-love.',
    needs: ['A handful of dried rose petals (or fresh)', 'A cup of pink Himalayan or sea salt', 'A pink or white candle', 'Soft music if you wish'],
    steps: [
      'Run a warm bath. Scatter the petals on the surface as it fills.',
      'Stir in the salt with your hand, sunwise, three turns.',
      'Light the candle and place it where you can see it from the tub.',
      'Step in slowly. Submerge to the heart. Place hands over the heart.',
      'Say: “I am the beloved. I am the lover. I am the love itself.”',
      'Stay as long as feels good. Rinse with cool water at the end and pat dry with a soft towel.'
    ],
    cross_sell: ['Rose Soap', 'Heart Healing Bath Salts', 'Rose Loose Botanical']
  },
  {
    kind: 'page', chapter: 'V', number: 23, title: 'Mirror Confidence Spell',
    intent: 'To meet your own eyes with kindness.',
    needs: ['A mirror', 'A small candle', 'Three minutes of unbroken time'],
    steps: [
      'Light the candle and place it beside the mirror.',
      'Look directly into your own eyes. (This is the hardest part. It gets easier.)',
      'Say slowly, with feeling: “I see you. I am proud of you. We are going to be alright.”',
      'Repeat for three full breaths. Smile if you can. Cry if you need to.',
      'Snuff the candle. Carry the warmth with you.'
    ]
  },
  {
    kind: 'page', chapter: 'V', number: 24, title: 'Beauty Through Intention',
    intent: 'To turn your daily skincare or grooming into ritual.',
    needs: ['Whatever you already use', 'A moment of slowness'],
    steps: [
      'Before applying any cream, oil, or balm, place a small amount in your palm.',
      'Hover the other hand above. Whisper one quality you wish to embody today — “softness,” “confidence,” “peace.”',
      'Apply with the same gentleness you would offer a child. Trace each cheekbone like a small benediction.',
      'Look in the mirror and nod once: “Thank you, body.”'
    ],
    cross_sell: ['Age Reversal Beauty Balm', 'Hair Regrowth Serum', 'Custom Facial Oil']
  },
  {
    kind: 'page', chapter: 'V', number: 25, title: 'Heart Healing Rite',
    intent: 'To offer a gentle pour of love to a tender heart.',
    needs: ['Rose petals or rose tea', 'A pink candle', 'Your favorite blanket'],
    steps: [
      'Wrap yourself in the blanket. Sit somewhere quiet. Light the candle.',
      'Sip the rose tea or hold a few petals in your palm.',
      'Place a hand on your heart. Speak the truth out loud, even if your voice shakes: “It hurt. I am still here. I am still good. I am still loved.”',
      'Stay until the candle has burned at least an inch, or the tea is gone, or the tears are spent. Then sleep, eat, walk — something gentle and ordinary.'
    ]
  },

  // -----------------------------------------------------------
  // CHAPTER VI — PROSPERITY
  // -----------------------------------------------------------
  { kind: 'chapter-divider', chapter: 'VI', title: 'Prosperity', verse: 'Abundance is not what you receive. It is what you can hold without tightening your hands.' },
  {
    kind: 'page', chapter: 'VI', number: 26, title: 'Abundance Candle Casting',
    intent: 'To open the channels for honest, fitting abundance to flow.',
    needs: ['A green candle', 'A small coin', 'A pinch of basil or cinnamon', 'A bay leaf and pen (optional)'],
    steps: [
      'Anoint the candle with olive oil. Roll in the herb.',
      'Hold the coin in your hand and breathe gratitude into it for what you already have.',
      'Place the coin at the base of the candle.',
      'If using a bay leaf, write one specific intention on it (“right work,” “sufficient ease,” “a path to ____”) and place it beneath.',
      'Light the candle. Say: “I receive what is mine to receive, in right time, in right way, harming none.”',
      'Let burn safely. Carry the coin in your wallet for one moon cycle.'
    ]
  },
  {
    kind: 'page', chapter: 'VI', number: 27, title: 'Gratitude Magnetism',
    intent: 'To reorient the inner field toward what is already abundant.',
    needs: ['A notebook', 'Five minutes a day for nine days'],
    steps: [
      'Each morning, write nine specific gratitudes. Not categories — specifics. “The sound of the kettle.” “The friend who texted yesterday.”',
      'Read them aloud as if reading a love letter.',
      'On day nine, light a small candle and read the full list. Burn one page (safely) as offering.'
    ]
  },
  {
    kind: 'page', chapter: 'VI', number: 28, title: 'Career Blessing',
    intent: 'To bless your work, your hands, and your name.',
    needs: ['A token from your work (a tool, a pen, a uniform, a business card)', 'Salt water', 'A candle'],
    steps: [
      'Wipe the token with salt water. Dry with a clean cloth.',
      'Hold it before the candle and say: “May this work serve. May my hands be steady. May my name carry truth. May the right doors open and the wrong doors close gently.”',
      'Return the token to its place. Repeat at the start of each new season.'
    ]
  },
  {
    kind: 'page', chapter: 'VI', number: 29, title: 'Business Success Ritual',
    intent: 'To bless a new venture, launch, or offering.',
    needs: ['A green or gold candle', 'A printed copy of the offering, or a written description', 'A small bowl of grain (rice, oats, or grain)'],
    steps: [
      'Place the page beneath the bowl. Light the candle nearby.',
      'Sprinkle a few grains across the page as you say: “May this work nourish those it reaches. May it return nourishment to me. May it grow honestly, in right time.”',
      'Leave overnight. In the morning, scatter the grains outdoors for the birds.'
    ]
  },

  // -----------------------------------------------------------
  // CHAPTER VII — HERBAL WISDOM
  // -----------------------------------------------------------
  { kind: 'chapter-divider', chapter: 'VII', title: 'Herbal Wisdom', verse: 'Every plant is a teacher. Listen first, then ask.' },
  {
    kind: 'page', chapter: 'VII', number: 30, title: 'Lavender',
    body: ['Lavender is the great soother. She gentles fevered minds, restless bodies, and heated rooms. She is the herb of mothers, of midwives, of anyone who tends.'],
    correspondences: { element: 'Air', planet: 'Mercury', uses: 'Sleep, peace, cleansing, mild grief, headache' },
    practice: 'Tuck a sprig under your pillow. Drink her as tea after a hard day. Add to baths to wash off other people’s noise.',
    cross_sell: ['Lavender Soap', 'DreamEase Capsules', 'Lavender Loose Botanical']
  },
  {
    kind: 'page', chapter: 'VII', number: 31, title: 'Rose',
    body: ['Rose is the mother of self-love. She is gentle and fierce in equal measure — each thorn a kind reminder that love also has limits and dignity.'],
    correspondences: { element: 'Water', planet: 'Venus', uses: 'Self-love, heart healing, beauty, devotion' },
    practice: 'Add petals to bathwater. Steep into honey. Place on the altar in any rite of devotion.',
    cross_sell: ['Rose Soap', 'Rose Loose Botanical', 'Heart Healing Blend']
  },
  {
    kind: 'page', chapter: 'VII', number: 32, title: 'Calendula',
    body: ['Calendula is sun-bright and skin-loving. She mends what has been scraped — the visible wounds and the invisible ones.'],
    correspondences: { element: 'Fire', planet: 'Sun', uses: 'Skin, gentle healing, courage, warmth' },
    practice: 'Infuse petals in oil for a week, strain, and use the golden oil on dry hands and small scrapes.',
    cross_sell: ['Calendula Loose Botanical', 'Custom Healing Balm']
  },
  {
    kind: 'page', chapter: 'VII', number: 33, title: 'Rosemary',
    body: ['Rosemary is the rememberer. She sharpens the mind, guards the home, and holds memory across long winters.'],
    correspondences: { element: 'Fire', planet: 'Sun', uses: 'Protection, clarity, memory, focus' },
    practice: 'Place a sprig over the front door. Brush a sprig through your hair before a hard meeting. Burn a small bundle for cleansing.',
    cross_sell: ['Hair Regrowth Serum', 'Rosemary Loose Botanical']
  },
  {
    kind: 'page', chapter: 'VII', number: 34, title: 'Mint',
    body: ['Mint is the cool refresher. She wakes a tired mind, settles a churning stomach, and brightens a stale room.'],
    correspondences: { element: 'Air', planet: 'Mercury', uses: 'Energy, digestion, prosperity, refreshment' },
    practice: 'Tuck fresh leaves into a glass of water. Place dried mint in your wallet to invite small luck.',
    cross_sell: ['Custom Tea Blend', 'Peppermint Loose Botanical']
  },
  {
    kind: 'page', chapter: 'VII', number: 35, title: 'Chamomile',
    body: ['Chamomile is the small sun of the meadow. Quiet, modest, profoundly steadying. The herb of children’s bellies and grown-ups’ nerves.'],
    correspondences: { element: 'Water', planet: 'Sun', uses: 'Calm, sleep, gentle digestion, peace at home' },
    practice: 'Brew strong tea, sweeten with honey, sip slowly. Add to baby baths. Tuck a sachet beside the bed.',
    cross_sell: ['Chamomile Loose Botanical', 'Custom Sleep Tea']
  },
  {
    kind: 'page', chapter: 'VII', number: 36, title: 'Basil',
    body: ['Basil is the household guardian and bringer of plenty. Where she grows on a windowsill, hard luck softens.'],
    correspondences: { element: 'Fire', planet: 'Mars', uses: 'Protection, prosperity, warmth, courage' },
    practice: 'Keep a living basil plant near the kitchen. Pinch a leaf between thumb and finger before any working for prosperity.',
    cross_sell: ['Basil Loose Botanical', 'Custom Hearth Blend']
  },
  {
    kind: 'page', chapter: 'VII', number: 37, title: 'Sage (Garden / Common)',
    body: ['Garden sage is the wise grandmother of the herb garden. (Note: this Grimior honors common garden sage — Salvia officinalis — not endangered white sage. Please source ethically.)'],
    correspondences: { element: 'Air', planet: 'Jupiter', uses: 'Wisdom, throat, mild cleansing, longevity' },
    practice: 'Burn a small leaf or bundle for clearing. Brew a weak tea for sore throats. Add a leaf to any solemn vow.',
    cross_sell: ['Sage Loose Botanical (ethically sourced)', 'Custom Smoke Bundle']
  },
  {
    kind: 'page', chapter: 'VII', number: 38, title: 'Lemon Balm',
    body: ['Lemon balm is brightness. She lifts the heavy, gentles the anxious, and reminds the body that joy is allowed.'],
    correspondences: { element: 'Water', planet: 'Moon', uses: 'Mood, soft anxiety, sleep, heart-ease' },
    practice: 'Steep fresh leaves in cool water on a warm afternoon. Place the cup in sunlight for a few minutes before drinking.',
    cross_sell: ['Lemon Balm Loose Botanical', 'Custom Mood Blend']
  },
  {
    kind: 'page', chapter: 'VII', number: 39, title: 'Mugwort',
    body: ['Mugwort is the dreamkeeper at the gate of sleep. Use her gently and only when invited.'],
    correspondences: { element: 'Earth', planet: 'Moon', uses: 'Dreams, intuition, gentle protection' },
    practice: 'Tuck one small leaf in a dream pillow. Avoid in pregnancy. Begin with very small amounts.',
    note: 'Mugwort is contraindicated in pregnancy and breastfeeding. Always check herb safety for your particular body.'
  },

  // -----------------------------------------------------------
  // CHAPTER VIII — SEASONAL MAGIC
  // -----------------------------------------------------------
  { kind: 'chapter-divider', chapter: 'VIII', title: 'Seasonal Magic', verse: 'The earth has already written the calendar. Our work is to live by it.' },
  {
    kind: 'page', chapter: 'VIII', number: 40, title: 'Spring Renewal',
    body: ['Spring is permission. Permission to begin, to leaf, to be foolish with hope again.'],
    practice: 'Open every window. Wash the curtains. Plant one seed in any small pot. Bury an old grief at its root and water both.'
  },
  {
    kind: 'page', chapter: 'VIII', number: 41, title: 'Summer Power',
    body: ['Summer is the long arc of the doing. The harvest is being earned now, in the heat, in the perspiration, in the tending.'],
    practice: 'Choose one project that is yours to grow this season. Speak its name aloud each morning while drinking your first water.'
  },
  {
    kind: 'page', chapter: 'VIII', number: 42, title: 'Autumn Gratitude',
    body: ['Autumn is the slow turning. She asks: what grew? what was lost? what will I keep, what will I compost?'],
    practice: 'Write three columns: “Keep,” “Thank,” “Release.” Burn the “Release” page in a fire-safe dish under a waning moon.'
  },
  {
    kind: 'page', chapter: 'VIII', number: 43, title: 'Winter Stillness',
    body: ['Winter is permission to do less. The roots are working in the dark; you are not behind — you are growing in a way no one is meant to see.'],
    practice: 'Light a single candle each evening. Keep nothing else on. Let your nervous system remember silence.'
  },

  // -----------------------------------------------------------
  // CHAPTER IX — SACRED LIVING
  // -----------------------------------------------------------
  { kind: 'chapter-divider', chapter: 'IX', title: 'Sacred Living', verse: 'Magic is mostly the way you make your bed and the way you greet your dog.' },
  {
    kind: 'page', chapter: 'IX', number: 44, title: 'Morning Ritual',
    steps: [
      'Before any screen, lay one hand on your heart for ten breaths.',
      'Drink a full glass of water at room temperature.',
      'Open one window, even briefly. Greet the sky.',
      'Speak your day’s intention out loud, in one short sentence: “Today, I am ____.”'
    ]
  },
  {
    kind: 'page', chapter: 'IX', number: 45, title: 'Evening Ritual',
    steps: [
      'When you arrive home, wash your hands and forearms in cool water. Speak: “The day is set down.”',
      'Light one candle, even just for ten minutes.',
      'Eat something warm if you can.',
      'Before sleep, name three things from the day that were small and good.'
    ]
  },
  {
    kind: 'page', chapter: 'IX', number: 46, title: 'Weekly Reset',
    steps: [
      'Choose one consistent day. Sunday is traditional but any day works.',
      'Change the sheets, even if not strictly needed.',
      'Wipe down the most-used surface in your home with rosemary or lavender water.',
      'Tidy the altar (or the place that functions as one).',
      'Plan one act of pleasure for the week. Put it on the calendar.'
    ]
  },
  {
    kind: 'page', chapter: 'IX', number: 47, title: 'Digital Detox Rite',
    body: ['The screen is a doorway, and like any doorway, it must close sometimes for the soul to know where it ends.'],
    steps: [
      'Choose a window: an hour, an evening, a Sunday. Tell someone, so it is real.',
      'Put devices in a basket. Cover with a cloth.',
      'Light a candle on top of the basket as a small ceremony of farewell.',
      'When you return to the screen, return slowly. Drink water first. Decide what you came for before you open it.'
    ]
  },
  {
    kind: 'page', chapter: 'IX', number: 48, title: 'Journaling for Healing',
    prompts: [
      'Where in my body is today living right now?',
      'What part of me has been quiet lately, and what would it say if I asked?',
      'Who am I when no one is watching me work?',
      'What would self-compassion say about this exact moment?',
      'What am I proud of that I have not told anyone?'
    ]
  },

  // -----------------------------------------------------------
  // CHAPTER X — MOON MAGIC
  // -----------------------------------------------------------
  { kind: 'chapter-divider', chapter: 'X', title: 'Moon Magic', verse: 'She does not hurry, and yet she changes everything.' },
  {
    kind: 'page', chapter: 'X', number: 49, title: 'New Moon Ritual (Setting Intentions)',
    needs: ['A piece of clean paper', 'A pen with ink that pleases you', 'A quiet hour'],
    steps: [
      'Sit at a clean surface. Light a candle.',
      'Write at the top: “I am ready to call in...” Then list three intentions in present tense, as if already true.',
      'Read aloud once. Fold the page small. Place under a houseplant or beneath the candle.',
      'Revisit at the next full moon.'
    ]
  },
  {
    kind: 'page', chapter: 'X', number: 50, title: 'Waxing Moon Practices',
    body: ['The waxing moon grows. So does anything you tend in this window: courage, projects, plant cuttings, friendships.'],
    practice: 'Each evening from new to full, name one small action you took toward your intention. Out loud.'
  },
  {
    kind: 'page', chapter: 'X', number: 51, title: 'Full Moon Ceremony (Charging + Gratitude)',
    needs: ['Crystals, jewelry, or a glass of water', 'Open sky or a window'],
    steps: [
      'Place items where the moon’s light will touch them through the night.',
      'Stand beneath the moon (or at the window) for at least three breaths.',
      'Speak gratitude for one specific thing that has grown since the new moon.',
      'In the morning, retrieve your charged items.'
    ]
  },
  {
    kind: 'page', chapter: 'X', number: 52, title: 'Waning Moon Release',
    body: ['The waning moon is the quiet broom. What is no longer alive can be set down here without violence.'],
    practice: 'Write what you are releasing on a small slip of paper. Tear into pieces and bury in earth, or burn safely. Speak: “Thank you. You may go.”'
  },
  {
    kind: 'page', chapter: 'X', number: 53, title: 'Dark Moon Stillness',
    body: ['The dark moon is the rest before the next breath. It is not a void; it is a pause.'],
    practice: 'Do as little as possible. Bath, soft food, early sleep. Take notes if dreams come strange and bright.'
  },

  // -----------------------------------------------------------
  // CHAPTER XI — CRYSTAL ALLIES
  // -----------------------------------------------------------
  { kind: 'chapter-divider', chapter: 'XI', title: 'Crystal Allies', verse: 'The stones remember. The stones hold time the way we cannot.' },
  {
    kind: 'page', chapter: 'XI', number: 54, title: 'Clear Quartz — The Amplifier',
    body: ['Clear quartz amplifies, focuses, and remembers intention. She is a willing student of any magic offered with clean motive.'],
    practice: 'Hold under cool water to cleanse. Set in moonlight to charge. Speak your intention to her in one sentence.'
  },
  {
    kind: 'page', chapter: 'XI', number: 55, title: 'Rose Quartz — The Heart Stone',
    body: ['Rose quartz is the slow medicine for the cracked heart. Patient, soft, unjudging.'],
    practice: 'Place over the heart while resting. Carry in a pocket on hard days. Pair with rose petals in the bath.'
  },
  {
    kind: 'page', chapter: 'XI', number: 56, title: 'Amethyst — The Crown',
    body: ['Amethyst quiets the mind, eases sleep, and opens the way for steady intuition.'],
    practice: 'Keep beside the bed. Hold during meditation. Place in the corner of a room for general calm.'
  },
  {
    kind: 'page', chapter: 'XI', number: 57, title: 'Black Tourmaline — The Guardian',
    body: ['Black tourmaline is the quiet bouncer at your door. She sends static back into the earth.'],
    practice: 'Place near the front door, near the wifi router, or anywhere energy feels grippy. Cleanse weekly under running water.'
  },

  // -----------------------------------------------------------
  // CHAPTER XII — CANDLE MAGIC
  // -----------------------------------------------------------
  { kind: 'chapter-divider', chapter: 'XII', title: 'Candle Magic', verse: 'A candle is a prayer with a wick.' },
  {
    kind: 'page', chapter: 'XII', number: 58, title: 'Candle Color Correspondences',
    body: [
      'White — purification, all-purpose. White can substitute for any color.',
      'Black — protection, absorption of negativity, clean release.',
      'Red — courage, vitality, action.',
      'Pink — self-love, friendship, tenderness.',
      'Green — abundance, healing, growth.',
      'Gold/Yellow — confidence, success, joy.',
      'Blue — peace, communication, sleep.',
      'Purple — intuition, devotion, sovereignty.'
    ]
  },
  {
    kind: 'page', chapter: 'XII', number: 59, title: 'Anointing a Candle',
    steps: [
      'Choose a clean candle. Lay out olive or jojoba oil, plus the herb of your working.',
      'For drawing in: oil from base toward wick, in long strokes.',
      'For releasing: oil from wick toward base.',
      'Roll lightly in dried herb. Whisper your intention three times as you do.',
      'Light only in a safe holder, on a heat-safe surface, never unattended.'
    ]
  },
  {
    kind: 'page', chapter: 'XII', number: 60, title: 'Setting Candle Intentions',
    body: ['A candle without intention is just light. A candle with intention is a small altar.'],
    practice: 'Before lighting, hold the candle in both hands. Speak one specific, present-tense sentence. Light. Watch the first thirty seconds of flame in silence.'
  },
  {
    kind: 'page', chapter: 'XII', number: 61, title: 'Reading the Flame',
    body: [
      'Steady, tall flame — the working is well-received.',
      'Flickering — the message is moving; pay attention.',
      'Crackling or popping — spirits or energies are speaking; listen.',
      'Black smoke — the working is moving through resistance; offer kindness.',
      'Going out unexpectedly — pause, re-light only after asking what is being shown.'
    ],
    note: 'These are gentle suggestions, not laws. Your own knowing is the final reader.'
  },

  // -----------------------------------------------------------
  // CHAPTER XIII — TEA MAGIC
  // -----------------------------------------------------------
  { kind: 'chapter-divider', chapter: 'XIII', title: 'Tea Magic', verse: 'A kettle is a chapel.' },
  {
    kind: 'page', chapter: 'XIII', number: 62, title: 'Brewing Sacred Tea',
    steps: [
      'Fill the kettle with reverence. Speak gratitude to the water.',
      'While it heats, choose your herb with intention, not habit.',
      'Pour onto the herb in a slow spiral. Cover and steep.',
      'Stir sunwise three times before drinking. Sip slowly. Let the first sip teach you.'
    ]
  },
  {
    kind: 'page', chapter: 'XIII', number: 63, title: 'Tea Leaf Reading (Gentle)',
    steps: [
      'Use loose-leaf tea, no strainer. Drink down most of the cup.',
      'Swirl the remaining liquid sunwise three times. Invert onto a saucer. Wait one minute.',
      'Lift the cup and look at the leaves left behind. What shape do you see first? Trust that one.',
      'Write a single sentence about it in your journal.'
    ]
  },
  {
    kind: 'page', chapter: 'XIII', number: 64, title: 'Healing Tea Recipes',
    body: [
      'Calm Tea — chamomile, lemon balm, a small pinch of lavender.',
      'Clarity Tea — peppermint, rosemary, a thin slice of fresh ginger.',
      'Heart Tea — rose petals, hawthorn berry (small amount), tulsi.',
      'Comfort Tea — oat straw, chamomile, a touch of cinnamon.'
    ],
    note: 'Always check herb safety for pregnancy, breastfeeding, medications, and existing conditions.'
  },

  // -----------------------------------------------------------
  // CHAPTER XIV — BATH RITUALS
  // -----------------------------------------------------------
  { kind: 'chapter-divider', chapter: 'XIV', title: 'Bath Rituals', verse: 'Water is the oldest medicine. Let her hold what you cannot.' },
  {
    kind: 'page', chapter: 'XIV', number: 65, title: 'Cleansing Bath',
    needs: ['1 cup sea salt', 'A handful of rosemary or lavender', 'A white candle'],
    steps: [
      'Run a warm bath. Stir in the salt and herbs.',
      'Step in. Submerge as much of you as you can.',
      'Speak: “What is mine, stay. What is not mine, return now to its keeper, in love.”',
      'Drain the tub while still inside. Let the water carry it all away. Rinse with cool water before rising.'
    ]
  },
  {
    kind: 'page', chapter: 'XIV', number: 66, title: 'Healing Bath Salts (Recipe)',
    body: ['A simple ratio for a soft, healing soak.'],
    steps: [
      '2 cups epsom salt',
      '1/2 cup pink himalayan or sea salt',
      '1/4 cup baking soda',
      '1 tablespoon dried rose petals',
      '1 tablespoon dried lavender',
      '10 drops lavender or frankincense oil (optional)'
    ],
    practice: 'Mix in a clean glass jar. Add 1/2 to 1 cup per bath. Store in a cool, dark place.',
    cross_sell: ['Heart Healing Bath Salts', 'Custom Bath Soak']
  },
  {
    kind: 'page', chapter: 'XIV', number: 67, title: 'Floral Soak',
    body: ['A bath that is not for cleansing but for delight — a way of refusing scarcity.'],
    steps: [
      'Scatter rose petals, calendula petals, and lavender buds across warm water.',
      'Light at least one candle.',
      'No goal. No prayer. Just be in the water as long as it is warm.',
      'When you rise, towel dry without rinsing. Carry the petals’ scent into your evening.'
    ]
  },

  // -----------------------------------------------------------
  // CHAPTER XV — GROUNDING & EARTH WORK
  // -----------------------------------------------------------
  { kind: 'chapter-divider', chapter: 'XV', title: 'Grounding & Earth Work', verse: 'The earth has been holding you longer than you have been doubting yourself.' },
  {
    kind: 'page', chapter: 'XV', number: 68, title: 'Tree Communion',
    steps: [
      'Find a tree you like. (You will know.) Greet it without touching first.',
      'Place a hand lightly on the trunk. Breathe with it for one minute.',
      'Ask silently: “Is there anything you would have me know today?”',
      'Leave a small offering before you go — a few drops of water, a strand of your hair, a kind word.'
    ]
  },
  {
    kind: 'page', chapter: 'XV', number: 69, title: 'Forest Bathing (Shinrin-yoku, gently adapted)',
    steps: [
      'Walk slowly into a wooded place — even a city park works. Phone away.',
      'Use one sense at a time. Five minutes of listening. Five minutes of looking. Five of smelling. Five of feeling bark, leaf, soil.',
      'Speak nothing. End by laying both hands on the ground for one minute.'
    ]
  },
  {
    kind: 'page', chapter: 'XV', number: 70, title: 'Stone Connection',
    steps: [
      'Find a stone outdoors that asks to come with you. Ask permission.',
      'Wash it gently. Hold it in both hands.',
      'Tell it the truest thing you can say today.',
      'Keep it on your altar, your desk, or under your pillow for one moon cycle. Return to where you found it after.'
    ]
  },

  // -----------------------------------------------------------
  // CHAPTER XVI — LIGHT BODY PRACTICES
  // -----------------------------------------------------------
  { kind: 'chapter-divider', chapter: 'XVI', title: 'Light Body Practices', verse: 'Your body of light is older than your skin and longer than your name.' },
  {
    kind: 'page', chapter: 'XVI', number: 71, title: 'Daily Aura Cleanse',
    steps: [
      'Stand or sit comfortably. Hands relaxed.',
      'Imagine a soft golden waterfall pouring through the crown of your head, washing through every cell, exiting through the soles of your feet into the earth.',
      'Continue for one full minute. The earth gladly composts what is not yours.',
      'Seal: pat your shoulders, arms, hips, and thighs lightly. Done.'
    ]
  },
  {
    kind: 'page', chapter: 'XVI', number: 72, title: 'Chakra Balancing (Simple)',
    body: [
      'Root — red, base of spine. Color: I am safe.',
      'Sacral — orange, lower belly. Color: I feel.',
      'Solar plexus — yellow, above navel. Color: I act.',
      'Heart — green, chest center. Color: I love.',
      'Throat — blue, base of throat. Color: I speak.',
      'Third eye — indigo, between brows. Color: I see.',
      'Crown — violet, top of head. Color: I am.'
    ],
    practice: 'Place hand to each. Speak its sentence aloud. Linger where you are quiet. That is where the work is.'
  },
  {
    kind: 'page', chapter: 'XVI', number: 73, title: 'Energy Hygiene',
    body: ['Most psychic exhaustion is borrowed energy you have not yet returned.'],
    practice: 'After every social or work-heavy day: hand-wash up to the elbows in cool water. Speak: “What is not mine, return to its keeper. What is mine, return to me, blessed.” Dry with a clean towel.'
  },

  // -----------------------------------------------------------
  // CHAPTER XVII — BLESSINGS
  // -----------------------------------------------------------
  { kind: 'chapter-divider', chapter: 'XVII', title: 'Blessings', verse: 'A blessing is the kindest spell. It only ever asks for good.' },
  {
    kind: 'page', chapter: 'XVII', number: 74, title: 'Blessing the Home',
    steps: [
      'Light a candle in the most-used room.',
      'Walk every doorway, touching the frame, saying: “May this home be safe. May this home be warm. May this home be a place where the kind ones rest.”',
      'Repeat seasonally, after long travel, or after any difficult conversation in the house.'
    ]
  },
  {
    kind: 'page', chapter: 'XVII', number: 75, title: 'Blessing the Threshold',
    steps: [
      'Stand at the front door. Inside.',
      'Speak: “What enters here, enter in love. What leaves here, leave in love.”',
      'Touch the doorframe with both hands.',
      'Sprinkle a thin line of salt across the outside threshold.'
    ]
  },
  {
    kind: 'page', chapter: 'XVII', number: 76, title: 'Blessing Children',
    body: ['Children are already close to the kind ones. We are not adding magic to them — we are remembering it with them.'],
    steps: [
      'At bedtime, place a hand lightly on the crown of the head.',
      'Whisper: “You are loved. You are safe. The kind ones are with you tonight.”',
      'Hum or sing one line of any soft song you know.'
    ]
  },
  {
    kind: 'page', chapter: 'XVII', number: 77, title: 'Blessing the Pet',
    steps: [
      'Sit at your animal’s level. Wait until they choose to come close.',
      'Place a hand gently on chest or back.',
      'Speak: “Thank you for the keeping of me. May your body be well, your sleep deep, your heart easy.”',
      'Add a pinch of dried lavender to their bedding (avoid for cats; choose chamomile instead).'
    ]
  },

  // -----------------------------------------------------------
  // CHAPTER XVIII — SACRED TOOLS
  // -----------------------------------------------------------
  { kind: 'chapter-divider', chapter: 'XVIII', title: 'Sacred Tools', verse: 'A tool is only a tool. It is the keeper that makes it sacred.' },
  {
    kind: 'page', chapter: 'XVIII', number: 78, title: 'Cauldron Care',
    body: ['A cauldron need only be a heat-safe vessel of cast iron, ceramic, or stone. It holds fire, water, herbs, and offerings.'],
    practice: 'Wipe out after each use with a dry cloth. Re-season iron with a thin layer of oil. Speak gratitude to the vessel each season.'
  },
  {
    kind: 'page', chapter: 'XVIII', number: 79, title: 'Wand Crafting',
    steps: [
      'Walk in nature with the question: “Which branch is mine?” Trust the first one that catches your eye.',
      'Ask the tree before taking. Take only one fallen branch (do not cut living wood).',
      'Strip bark gently with a knife if you wish, or leave as found.',
      'Anoint the tip with olive oil. Speak its first instruction: “We work for the highest good. We harm none.”'
    ]
  },
  {
    kind: 'page', chapter: 'XVIII', number: 80, title: 'Bell + Singing Bowl',
    body: ['A bell announces the beginning. A bowl holds the long, listening sound of a working.'],
    practice: 'Ring once at the start of each rite to gather attention. Strike the bowl at the close to seal. Cleanse weekly under cool running water (only metal bowls, never wood-rim crystal bowls without care).'
  },
  {
    kind: 'page', chapter: 'XVIII', number: 81, title: 'Building an Altar',
    body: ['An altar is a small, kept place that says: “here, I remember.”'],
    steps: [
      'Choose a flat surface near where you live, not where you store things.',
      'Cover with a cloth that pleases you.',
      'Place one item for each element: a stone (earth), a feather or bell (air), a candle (fire), a shell or small bowl (water), and one image, photo, or symbol of spirit.',
      'Add fresh flowers, water, or food offerings as called.',
      'Tend at least once a week.'
    ]
  },

  // -----------------------------------------------------------
  // CHAPTER XIX — JOURNALING PROMPTS
  // -----------------------------------------------------------
  { kind: 'chapter-divider', chapter: 'XIX', title: 'Journaling Prompts', verse: 'The pen is a slow oracle. She tells the truth if you give her time.' },
  {
    kind: 'page', chapter: 'XIX', number: 82, title: 'Shadow to Light',
    prompts: [
      'What part of myself have I been afraid to look at, and what would I find if I did?',
      'Who do I resent right now, and what truth is hidden inside the resentment?',
      'What apology do I owe myself?'
    ]
  },
  {
    kind: 'page', chapter: 'XIX', number: 83, title: 'Inner Compass',
    prompts: [
      'When was the last time I felt completely myself? What was around me?',
      'What activity returns me to my own body the fastest?',
      'If I knew I was loved exactly as I am, what would I stop doing?'
    ]
  },
  {
    kind: 'page', chapter: 'XIX', number: 84, title: 'Gratitude Pages',
    prompts: [
      'Three sounds I am grateful for today.',
      'A person who showed up for me this year.',
      'A small daily mercy I have been overlooking.',
      'One body part I want to thank tonight.'
    ]
  },

  // -----------------------------------------------------------
  // CHAPTER XX — CLOSING THE BOOK
  // -----------------------------------------------------------
  { kind: 'chapter-divider', chapter: 'XX', title: 'Closing the Book', verse: 'A book closed is not a book ended. It is a book waiting.' },
  {
    kind: 'page', chapter: 'XX', number: 85, title: 'Living the Magic',
    body: ['You are not meant to be a magician for an hour and an ordinary person the rest of the day. The magic is the way you butter the toast. The way you hand someone their change. The way you let yourself sit down.']
  },
  {
    kind: 'page', chapter: 'XX', number: 86, title: 'Daily Devotion',
    body: ['Pick one thing. One. Do it every day for forty days. A candle, a glass of water, a hand to the heart, a single line of gratitude. Forty days will change something you cannot yet see.']
  },
  {
    kind: 'page', chapter: 'XX', number: 87, title: 'Sharing the Light',
    body: ['When you share what you have learned, share gently. Some people are ready, some are not, and both are sacred. Be the kind one in their story — not the urgent one.']
  },
  {
    kind: 'page', chapter: 'XX', number: 88, title: 'Final Blessing',
    body: [
      'May your hands be warm. May your sleep be sweet. May your kettle always sing.',
      'May the kind ones walk a little ahead of you on the road, and the wise ones a little behind.',
      'May this Grimior find you again whenever you need it, and may you find yourself in the finding.'
    ],
    closing: '— In love, always. — Amber'
  }
];

// Number all pages with stable indexes for navigation.
window.GRIMIOR_PAGES.forEach(function(p, i) {
  p.index = i;
});

// Provide an array of preview-eligible page indexes for the paywall.
window.GRIMIOR_PREVIEW_INDEXES = window.GRIMIOR_PAGES
  .map(function(p, i) { return p.preview ? i : -1; })
  .filter(function(i) { return i !== -1; });
