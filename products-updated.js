// ---- UPDATED PRODUCTS DATA ----
// Replaces the PRODUCTS array in data.js with richer descriptions,
// short card versions, expanded full-page content, and brand voice copy.

const PRODUCTS_EXTENDED = {
  'beauty-balm': {
    shortDesc: 'A luminous botanical balm created to soften, restore, and renew. Saffron, rose, and lavender offer antioxidant beauty support while rich oils deeply hydrate and encourage a smoother, more radiant glow.',
    expandedDesc: `A radiant botanical infusion created to nourish and restore the skin's natural glow. Herbs like saffron, rose, and lavender provide antioxidant support while rich oils help deeply hydrate and soften the skin. Designed to promote smoother texture, youthful radiance, and natural beauty. Each application is an act of devotion: a moment to slow down, breathe in the botanical fragrance, and let the plant wisdom do its quiet, powerful work. Crafted in small batches with intention and care, this balm is designed for those who believe that true beauty is nourished from the outside in — and that the skin deserves the same reverence as the spirit.`,
    whyYoullLoveIt: 'Because it transforms your skincare routine into a sacred ritual. Because it smells like a botanical garden in full bloom. Because your skin will feel softer, smoother, and more radiant after the very first use.',
    craftedWithIntention: 'Every batch of this balm is handcrafted using cold-infused botanical oils, ethically sourced resins, and plant waxes chosen for their affinity with human skin. No synthetic fragrances, no fillers — only the concentrated intelligence of plants.',
    importantNote: 'These botanical products are crafted to support general wellness and self-care. They are not intended to diagnose, treat, cure, or prevent any disease. Please review ingredients carefully and consult a qualified healthcare professional if you are pregnant, nursing, taking medications, or have a medical condition.',
    benefits: ['Deeply moisturizes and softens dry or mature skin', 'Supports a smoother, more radiant appearance over time', 'Nourishes with botanical antioxidants and plant-based fatty acids', 'Transforms daily skincare into a luxurious apothecary ritual'],
    whoItsFor: 'Perfect for anyone seeking a rich herbal balm that feels indulgent, restorative, and glow-enhancing — especially those with dry, tired, or mature skin who want a plant-based approach to beauty.'
  },
  'pain-balm': {
    shortDesc: 'A powerful herbal balm made to warm, soothe, and comfort the body. Turmeric, cayenne, peppermint, comfrey, and arnica help support circulation and ease tension in tired muscles and joints.',
    expandedDesc: `A deeply soothing herbal balm crafted for muscles, joints, and tension. Botanicals like turmeric, cayenne, and peppermint work together to warm circulation and calm discomfort, while healing herbs such as comfrey and arnica help support recovery. A comforting blend designed to ease the body naturally. Formulated with arnica's legendary ability to ease bruising and soreness, the warming fire of cayenne that draws circulation to cold, stiff places, the cooling clarity of wintergreen that cuts through pain like a mountain breeze, and comfrey for its powerful anti-inflammatory and tissue-healing properties — this is not just a balm. It is a conversation between plant wisdom and the body's own intelligence. Massage it in slowly, with intention. Feel the warmth bloom under your palms. Let the botanicals do what they have done for centuries: bring the body back to ease.`,
    whyYoullLoveIt: 'Because it works. Because it smells like a forest apothecary. Because it turns the act of caring for your body into something that feels intentional, not medicinal.',
    craftedWithIntention: 'Handcrafted in small batches using slow-infused botanical oils, pure essential oils, and plant-based waxes. Every ingredient is chosen for its traditional reputation and its synergy with the others.',
    importantNote: 'These botanical products are crafted to support general wellness and self-care. They are not intended to diagnose, treat, cure, or prevent any disease. For use on external areas only. Avoid contact with eyes and broken skin. Consult a healthcare professional if you have a medical condition.',
    benefits: ['Supports comfort for sore muscles, joints, and areas of tension', 'Powerful botanical anti-inflammatory relief', 'Warming and cooling botanical action for targeted relief', 'Ideal for massage and post-activity recovery rituals', 'Crafted with herbs traditionally used for centuries to ease physical discomfort'],
    whoItsFor: 'Made for those who want a natural, botanical comforting balm to support recovery, ease, and relaxation — athletes, those with chronic tension, and anyone who works hard with their body and deserves plant-based care.'
  },
  'vital-vitality': {
    shortDesc: 'A vibrant botanical blend crafted to awaken natural energy, circulation, and clarity. Nettle, hibiscus, and green tea help nourish vitality while lion\'s mane and mushroom allies support focus and uplifted balance. 30-day supply · 60 capsules.',
    expandedDesc: `A vibrant botanical blend designed to awaken the body's natural energy. Herbs like nettle, green tea, and hibiscus nourish the blood and support circulation, while lion's mane and medicinal mushrooms help sharpen focus and clarity. A daily ritual to fuel vitality, balance, and radiant wellbeing. Drawing on the ancient traditions of Ayurveda and Siberian herbalism, this capsule blend brings together the most revered adaptogenic roots and botanicals on earth: ashwagandha, the great stress-modulator of Ayurvedic medicine; rhodiola, the golden root of Siberian shamans who used it to endure extreme cold and fatigue; eleuthero, the endurance tonic of Soviet athletes and cosmonauts; and maca, the Andean root that has sustained mountain communities for millennia. Together, they do not force energy — they restore it. They do not stimulate the nervous system — they nourish it. The result is a clean, sustained vitality that feels like your own, because it is.`,
    whyYoullLoveIt: 'Because it gives you energy that feels natural, not jittery. Because it supports your focus without the afternoon crash. Because it works with your body, not against it.',
    craftedWithIntention: 'Each capsule contains a thoughtfully calibrated blend of whole-herb powders and standardized extracts, encapsulated in small batches to preserve potency and freshness.',
    importantNote: 'These botanical products are crafted to support general wellness and self-care. They are not intended to diagnose, treat, cure, or prevent any disease. Consult a healthcare professional before use if you are pregnant, nursing, taking medications, or have a medical condition.',
    benefits: ['Supports clean, sustained natural energy without stimulants', 'Encourages mental clarity, focus, and cognitive resilience', 'Helps the body adapt to physical and emotional stress', 'Crafted for everyday vitality, balance, and long-term wellness'],
    whoItsFor: 'Ideal for those who feel depleted, mentally foggy, or in need of a more natural way to support their momentum — especially those navigating high-stress periods, demanding schedules, or recovery from burnout.'
  },
  'immune-at-ease': {
    shortDesc: 'A comforting herbal shield created to support resilience through every season. Garlic, warming botanicals, and immune-loving herbs help fortify the body while encouraging balance and gentle recovery.',
    expandedDesc: `A protective botanical shield crafted to support the body's natural defenses. Herbs such as elderflower, garlic, and warming spices help strengthen immunity while soothing inflammation. Designed to help the body stay resilient, balanced, and ready for seasonal changes. Rather than simply stimulating immune response, this blend works to build the deep reserves that allow the body to respond wisely and recover gracefully. Elderberry, revered across European folk medicine for centuries, brings its anthocyanin-rich intelligence to the formula. Astragalus, the great tonic root of Traditional Chinese Medicine, builds what practitioners call "wei qi" — the protective energy that guards the body's boundaries. Echinacea, North America's most beloved immune herb, activates the body's first line of defense. And reishi mushroom, the ancient "mushroom of immortality," weaves through the formula like a wise elder, supporting immune intelligence and deep restoration. Together, they create something greater than the sum of their parts: a botanical ally for every season.`,
    whyYoullLoveIt: 'Because it supports your immune system the way nature intended — gently, intelligently, and sustainably. Because it feels like nourishment, not medicine.',
    craftedWithIntention: 'Formulated using whole-herb powders, dual-extracted mushroom concentrates, and standardized botanical extracts — all encapsulated in small batches for maximum freshness and potency.',
    importantNote: 'These botanical products are crafted to support general wellness and self-care. They are not intended to diagnose, treat, cure, or prevent any disease. Consult a healthcare professional before use if you are pregnant, nursing, taking medications, or have a medical condition.',
    benefits: ['Supports the body\'s natural immune response and seasonal resilience', 'Encourages everyday wellness, balance, and vitality', 'Crafted with herbs traditionally used across multiple healing traditions', 'Plant-based support for whole-body strength and recovery'],
    whoItsFor: 'Perfect for those wanting a daily herbal companion to help support strength, balance, and whole-body wellness — especially during seasonal transitions, periods of stress, or recovery.'
  },
  'hair-serum': {
    shortDesc: 'A sacred botanical scalp elixir designed to awaken roots and restore vitality. Rosemary, fenugreek, and plant oils help stimulate circulation, nourish follicles, and encourage fuller, healthier-looking hair.',
    expandedDesc: `A luxurious botanical elixir designed to awaken the scalp and nourish each strand. Oils infused with herbs such as rosemary, fenugreek, and nourishing plant oils help stimulate circulation to the scalp while strengthening follicles. Crafted to encourage fuller, stronger, and more vibrant hair growth. Rosemary, whose ability to support scalp circulation has been studied in modern research, forms the aromatic backbone of this formula. Peppermint adds its cooling, invigorating energy, awakening the scalp like a breath of mountain air. Castor oil, rich and deeply penetrating, coats each strand with a protective botanical embrace. And saw palmetto, revered in traditional medicine for its role in hormonal balance, works quietly beneath the surface to support the hair's natural growth cycle. This is not a quick fix — it is a ritual of restoration.`,
    whyYoullLoveIt: 'Because it smells incredible. Because it turns your hair care routine into a scalp massage ritual. Because it works with your body\'s own biology to support the hair you want.',
    craftedWithIntention: 'Each bottle is handcrafted using cold-pressed botanical oils, slow-infused herbal extracts, and pure essential oils — no silicones, no synthetic fragrances, no fillers.',
    importantNote: 'These botanical products are crafted to support general wellness and self-care. They are not intended to diagnose, treat, cure, or prevent any disease. For external use only. Patch test recommended before first use.',
    benefits: ['Nourishes the scalp and supports healthy hair root conditions', 'Supports stronger, healthier-looking strands over time', 'Encourages softness, shine, and natural vitality from root to end', 'Ideal as part of a regular scalp massage and hair care ritual'],
    whoItsFor: 'For those wanting a botanical approach to scalp care, hair strength, and fuller-looking beauty — especially those experiencing thinning, dryness, or scalp imbalance.'
  },
  'lucid-dream-tea': {
    shortDesc: 'A sacred evening brew — like stepping through a doorway between the waking world and the dreaming one.',
    expandedDesc: `Long before sleep was something we managed, it was something we entered — a threshold between worlds, a sacred space where the unconscious speaks and the soul wanders freely. Lucid Dream Tea was crafted to honor this ancient understanding of sleep as a portal, not just a pause. Mugwort, the dreamer's herb, has been used by indigenous cultures worldwide to deepen dream recall and invite visionary states. Blue lotus, sacred to the ancient Egyptians, brings a gentle, euphoric calm that softens the boundary between waking and dreaming. Valerian root anchors the nervous system in deep rest, while passionflower wraps the mind in a quiet, vine-like stillness. Brew this tea slowly. Drink it in the hour before sleep. Set an intention. And let the plants guide you inward.`,
    whyYoullLoveIt: 'Because it makes bedtime feel like a ceremony. Because it deepens your dream life in ways that feel genuinely magical. Because it is one of the most ancient forms of plant medicine there is.',
    craftedWithIntention: 'Blended from whole-leaf and whole-flower botanicals, sourced for quality and potency. Each batch is prepared with intention and care for the dreamer who uses it.',
    importantNote: 'These botanical products are crafted to support general wellness and self-care. They are not intended to diagnose, treat, cure, or prevent any disease. Mugwort should be avoided during pregnancy. Consult a healthcare professional before use if you are taking medications or have a medical condition.',
    benefits: ['Supports deeper, more vivid dream states and dream recall', 'Encourages relaxation and a peaceful transition into sleep', 'Honors the ancient tradition of plant-assisted dreaming', 'A beautiful evening ritual for the spiritually curious'],
    whoItsFor: 'For dreamers, mystics, and anyone who wants to explore the inner landscape of sleep with the support of sacred plant allies.'
  },
  'dreamease-capsules': {
    shortDesc: 'A peaceful nighttime blend for deep rest and a softened nervous system. Lavender, chamomile, and rose help quiet the mind, ease tension, and invite restorative, dream-filled sleep.',
    expandedDesc: `A gentle nighttime botanical ally for deep, restorative rest. Calming herbs like lavender, chamomile, and rose work together to quiet the mind while nervine botanicals help the body settle into deeper sleep cycles. Perfect for unwinding the nervous system and inviting peaceful dreams. This gentle capsule blend draws on the most trusted nervine and sedative botanicals in the herbal tradition: valerian root, whose deep, earthy medicine has been used across European herbalism for centuries to ease the nervous system into sleep; passionflower, the vine of peace, whose delicate tendrils seem to reach into the anxious mind and gently loosen its grip; lemon balm, bright and lemony, that lifts mood while calming the nervous system; and chamomile, the most beloved bedtime herb in the world, whose apple-scented flowers have been tucked into pillows and brewed into cups for as long as humans have needed comfort. Together, they create a formula that does not force sleep — it invites it. Gently. Consistently. Without grogginess.`,
    whyYoullLoveIt: 'Because it works without leaving you foggy in the morning. Because it feels like a warm cup of tea in capsule form. Because it supports the kind of sleep that actually restores you.',
    craftedWithIntention: 'Each capsule contains a carefully calibrated blend of whole-herb powders and standardized extracts, encapsulated in small batches to preserve the integrity of every botanical.',
    importantNote: 'These botanical products are crafted to support general wellness and self-care. They are not intended to diagnose, treat, cure, or prevent any disease. Consult a healthcare professional before use if you are pregnant, nursing, taking medications, or have a medical condition.',
    benefits: ['Supports relaxation and a peaceful transition into sleep', 'Encourages deeper, more restorative rest without morning grogginess', 'Helps nourish the nervous system and ease mental tension', 'Crafted for busy minds and tired spirits who long for true rest'],
    whoItsFor: 'Perfect for those seeking a gentle, plant-based sleep companion that feels grounding, soothing, and intentional — especially those with stress-related insomnia or overactive minds at bedtime.'
  },
  'collagen-rebuilder': {
    shortDesc: 'A deeply nourishing ocean-based formula rich in omega-3s, minerals, and collagen-building support. Sardine-derived nutrients help feed the brain, joints, skin, and heart with highly bioavailable strength.',
    expandedDesc: `A powerful ocean-derived source of nourishment for the body's structural health. Sardines naturally provide omega-3 fatty acids, collagen-supporting peptides, and essential minerals that help support heart health, brain function, and joint mobility. A simple way to replenish the body with deeply bioavailable nutrients. Collagen is the body's most abundant protein — the invisible scaffolding that gives skin its firmness, hair its strength, and joints their resilience. As we age, the body's ability to produce it naturally begins to slow. These capsules were formulated to support this process from within, using ocean-derived nutrients that the body recognizes and absorbs with ease. Rich in omega-3 fatty acids for heart and brain health, collagen-building peptides for skin elasticity and joint support, and essential minerals for whole-body vitality — this is beauty and structural wellness as nourishment, not as illusion.`,
    whyYoullLoveIt: 'Because it supports beauty from the inside out — the way nature intended. Because it complements your skincare routine with botanical intelligence. Because it feels like self-care at the cellular level.',
    craftedWithIntention: 'Formulated using whole-herb powders and concentrated botanical extracts, encapsulated in small batches with care and intention for the person who takes their wellness seriously.',
    importantNote: 'These botanical products are crafted to support general wellness and self-care. They are not intended to diagnose, treat, cure, or prevent any disease. Consult a healthcare professional before use if you are pregnant, nursing, taking medications, or have a medical condition.',
    benefits: ['Supports heart health with omega-3 fatty acids', 'Provides collagen-supporting peptides for skin and joints', 'Essential minerals for whole-body vitality and renewal', 'Deeply bioavailable ocean-derived nutrients'],
    whoItsFor: 'Ideal for those seeking a simple, potent way to replenish the body with omega-3s, collagen support, and essential minerals — especially those focused on heart health, brain function, joint mobility, and structural wellness.'
  }
};

// Updated SOAPS with poetic descriptions — 9 Signature Scents
const SOAPS_EXTENDED = {
  'lavender-fairy-dream': {
    shortDesc: 'Soft floral, calming, and dreamy — a gentle twilight bar that quiets the mind and softens the skin.',
    expandedDesc: 'A gentle floral escape inspired by twilight gardens. Calming lavender helps soothe the mind while nourishing goat milk and shea butter soften and hydrate the skin, leaving you wrapped in peaceful botanical comfort. This double-layered artisan bar begins with a creamy goat milk base, rich in lactic acid and skin-loving proteins, then rises into a clear glycerin and castor oil top layer tinted with natural lavender botanicals and shimmering butterfly pea flower. Base scent crafted from geranium and a citrus blend.',
    benefits: ['Soothes sensitive and irritated skin', 'Calming lavender aroma supports relaxation', 'Goat milk gently exfoliates and nourishes', 'Glycerin top layer seals in moisture beautifully'],
    sizes: ['Small Rose 1oz — $4.99', 'Medium Bar 2oz — $6.99', 'Medium Rose 2oz — $7.99', 'Large Bar 3oz — $10.99', 'Large Round 4oz — $11.99'],
    botanicals: 'Lavender buds + Butterfly pea flower',
    scentProfile: 'Soft floral \u2022 calming \u2022 dreamy'
  },
  'gaias-rose': {
    shortDesc: 'Romantic, floral, and heart-opening — rose petals soften skin and lift the heart.',
    expandedDesc: 'A romantic bar inspired by nature\'s sacred bloom. Rose petals are cherished for their skin-softening and heart-lifting qualities, while creamy shea butter and goat milk restore moisture and leave skin glowing and refreshed. The creamy goat milk base is infused with French pink clay, while the clear glycerin top layer is scattered with dried rose petals and vibrant hibiscus that bloom against the skin with every wash.',
    benefits: ['Rose and hibiscus gently clarify and refine pores', 'Rose hip oil supports skin radiance and tone', 'Dried petals add a sensory botanical experience', 'Suitable for all skin types, especially combination'],
    sizes: ['Small Rose 1oz — $4.99', 'Medium Bar 2oz — $6.99', 'Medium Rose 2oz — $7.99', 'Large Bar 3oz — $10.99', 'Large Round 4oz — $11.99'],
    botanicals: 'Rose petals + Hibiscus',
    scentProfile: 'Romantic \u2022 floral \u2022 heart-opening'
  },
  'eucalyptus-mint-spa': {
    shortDesc: 'Fresh, cooling, and clean — cooling eucalyptus and mint awaken the senses and refresh tired skin.',
    expandedDesc: 'A bright, invigorating blend that awakens the senses. Cooling eucalyptus and mint help refresh tired skin and open the breath, while deeply moisturizing goat milk and shea butter leave the body feeling clean, energized, and renewed. This spa-inspired bar features vibrant spirulina green in the goat milk base, rising into a clear glycerin layer shimmering with crushed mint leaves for a truly revitalizing experience.',
    benefits: ['Mint and spirulina deeply purify and refresh', 'Peppermint provides an invigorating, cooling sensation', 'Spirulina supports clear, balanced skin', 'Ideal for oily, combination, or tired skin'],
    sizes: ['Small Rose 1oz — $4.99', 'Medium Bar 2oz — $6.99', 'Medium Rose 2oz — $7.99', 'Large Bar 3oz — $10.99', 'Large Round 4oz — $11.99'],
    botanicals: 'Mint leaves + Spirulina',
    scentProfile: 'Fresh \u2022 cooling \u2022 clean'
  },
  'warm-cinnamon-comfort': {
    shortDesc: 'Cozy, spicy, and grounding — cinnamon warmth encourages circulation with rich nourishment.',
    expandedDesc: 'A cozy, grounding soap infused with the warmth of cinnamon and spice. Cinnamon\'s natural stimulating properties encourage circulation while creamy shea butter and goat milk provide rich nourishment for soft, healthy skin. This warming bar features golden cinnamon tones in the goat milk base with subtle clove accents, creating a deep, spicy lather that feels like a warm blanket for the skin.',
    benefits: ['Cinnamon encourages healthy circulation', 'Clove adds deep antimicrobial warmth', 'Creamy shea butter and goat milk nourish deeply', 'Cozy, grounding warmth for soft, healthy skin'],
    sizes: ['Small Rose 1oz — $4.99', 'Medium Bar 2oz — $6.99', 'Medium Rose 2oz — $7.99', 'Large Bar 3oz — $10.99', 'Large Round 4oz — $11.99'],
    botanicals: 'Cinnamon + Clove',
    scentProfile: 'Cozy \u2022 spicy \u2022 grounding'
  },
  'orange-lily-goddess': {
    shortDesc: 'Bright, citrus, and radiant — sweet orange uplifts the mood while botanicals brighten and soften.',
    expandedDesc: 'A radiant citrus floral blend inspired by sunlight and blooming gardens. Sweet orange uplifts the mood while botanical oils help brighten and soften the skin, leaving a fresh glow and a gentle aura of natural sweetness. The goat milk base is rich with golden calendula petals while the clear glycerin top layer carries crushed orange peel that releases bright, joyful energy with every wash.',
    benefits: ['Calendula supports healing and reduces inflammation', 'Orange peel provides vitamin C and brightening', 'Ultra-radiant formula for a natural glow', 'Uplifting citrus aroma for mood and spirit'],
    sizes: ['Small Rose 1oz — $4.99', 'Medium Bar 2oz — $6.99', 'Medium Rose 2oz — $7.99', 'Large Bar 3oz — $10.99', 'Large Round 4oz — $11.99'],
    botanicals: 'Calendula + Orange peel',
    scentProfile: 'Bright \u2022 citrus \u2022 radiant'
  },
  'citrus-goddess-glow': {
    shortDesc: 'Sweet citrus, uplifting, and energizing — a radiant glow bar that brightens and lifts the spirit.',
    expandedDesc: 'There is a moment in the morning when the shower shifts from obligation to pleasure — when the fragrance of something bright and alive cuts through the fog of sleep. Citrus Goddess Glow was made for exactly that moment. The goat milk base is light and refreshing with crushed orange peel throughout; the clear glycerin top layer carries golden calendula petals in a fragrance that is simultaneously uplifting, clarifying, and deeply joyful. This is the bar that makes you glad to be awake.',
    benefits: ['Citrus oils are brightening and antioxidant-rich', 'Uplifts mood and supports emotional balance', 'Light, refreshing formula suitable for daily use', 'Energizing morning fragrance that lingers on the skin'],
    sizes: ['Small Rose 1oz — $4.99', 'Medium Bar 2oz — $6.99', 'Medium Rose 2oz — $7.99', 'Large Bar 3oz — $10.99', 'Large Round 4oz — $11.99'],
    botanicals: 'Orange peel + Calendula',
    scentProfile: 'Sweet citrus \u2022 uplifting \u2022 energizing'
  },
  'sacred-forest-ritual': {
    shortDesc: 'Earthy, resinous, and grounding — for those who need to come back to themselves.',
    expandedDesc: 'Close your eyes and imagine a forest after rain — the deep, resinous scent of ancient trees, the mineral richness of the earth beneath your feet. Sacred Forest Ritual soap brings that experience into your shower. The creamy goat milk base is infused with mineral-rich nettle leaf powder for deep green earthiness, while resin-inspired tones in the glycerin top layer create a fragrance that is grounding, clarifying, and deeply calming. This is the bar for those who need to come back to themselves.',
    benefits: ['Nettle is mineral-rich and supports skin clarity', 'Grounding earthy aroma for meditation and ritual', 'Resinous tones purify body and energy field', 'Earthy, forest-like aroma for stress relief'],
    sizes: ['Small Rose 1oz — $4.99', 'Medium Bar 2oz — $6.99', 'Medium Rose 2oz — $7.99', 'Large Bar 3oz — $10.99', 'Large Round 4oz — $11.99'],
    botanicals: 'Nettle + Resin-inspired tones',
    scentProfile: 'Earthy \u2022 resinous \u2022 grounding'
  },
  'fresh-mountain-air': {
    shortDesc: 'Clean, herbal, and awakening — like the first breath of crisp mountain morning air.',
    expandedDesc: 'Some mornings call for something sharp and alive — the kind of clean that feels like altitude, like cold water on the face, like the first deep breath at a mountain summit. Fresh Mountain Air soap was made for that feeling. Cool mint and light green herbal botanicals create a crisp, awakening lather in the goat milk base, while the clear glycerin top layer carries the clean herbal fragrance that clears the mind and invigorates the body with every wash.',
    benefits: ['Clean herbal aroma clears and refreshes the mind', 'Mint awakens and invigorates tired skin', 'Light botanical greens support skin clarity', 'Ideal for morning showers and fresh starts'],
    sizes: ['Small Rose 1oz — $4.99', 'Medium Bar 2oz — $6.99', 'Medium Rose 2oz — $7.99', 'Large Bar 3oz — $10.99', 'Large Round 4oz — $11.99'],
    botanicals: 'Mint + Light green herbs',
    scentProfile: 'Clean \u2022 herbal \u2022 awakening'
  },
  'sunlit-garden-bloom': {
    shortDesc: 'Floral, soft, and feminine — like being wrapped in sun-drenched petals from a gentle garden.',
    expandedDesc: 'There is a softness to a garden at midday — the way light filters through petals, the way chamomile and rose lean toward the sun. Sunlit Garden Bloom captures that quiet beauty in every wash. Soothing chamomile flowers and delicate rose petals create a gentle, feminine lather in the goat milk base, while the clear glycerin top layer blooms with scattered botanical petals that soften, calm, and wrap sensitive skin in warm, sun-kissed comfort.',
    benefits: ['Chamomile soothes and calms sensitive skin', 'Rose petals soften and add botanical beauty', 'Ultra-gentle formula for all skin types', 'Soft, feminine floral aroma uplifts the soul'],
    sizes: ['Small Rose 1oz — $4.99', 'Medium Bar 2oz — $6.99', 'Medium Rose 2oz — $7.99', 'Large Bar 3oz — $10.99', 'Large Round 4oz — $11.99'],
    botanicals: 'Chamomile + Rose mix',
    scentProfile: 'Floral \u2022 soft \u2022 feminine'
  }
};

// Custom Remedy description
const CUSTOM_REMEDY_EXTENDED = {
  shortDesc: 'Create a personalized botanical blend crafted around your unique needs, goals, and wellness intentions.',
  expandedDesc: `This is not a product you choose from a shelf. It is a formula that chooses you — or rather, that you and Amber craft together through a guided process of intention, honesty, and botanical wisdom. The Custom Remedy experience begins with your health goals and moves through a careful assessment of your symptoms, your lifestyle, and your safety profile. From there, Amber selects up to five botanicals from the living library of the Grimoire — each one chosen for its specific affinity with your needs, its compatibility with the others, and its safety for your unique situation. Every custom remedy is reviewed before preparation. Every formula is made in small batches, with care, with intention, and with the understanding that you are not a diagnosis — you are a whole person who deserves a whole-plant approach.`,
  whyYoullLoveIt: 'Because it is made for you, not for everyone. Because Amber reviews every formula before it is prepared. Because it feels like having an herbalist in your corner.',
  craftedWithIntention: 'Every custom remedy is handcrafted in small batches using whole-herb powders, standardized extracts, and botanical preparations chosen specifically for the individual who ordered them. No two formulas are identical.',
  importantNote: 'Custom remedies are reviewed for safety before preparation. Orders are fulfilled within 24–48 hours of safety review completion. These botanical products are crafted to support general wellness and self-care. They are not intended to diagnose, treat, cure, or prevent any disease.',
  benefits: ['Personalized support based on your individual health goals', 'Crafted with botanical knowledge and intentional formulation', 'Flexible options across sleep, energy, immunity, digestion, beauty, and more', 'Reviewed before fulfillment for added safety and care'],
  whoItsFor: 'For those who want something more tailored than an off-the-shelf remedy and value a custom-crafted herbal experience that honors their unique needs.'
};


if (typeof PRODUCTS !== 'undefined' && typeof PRODUCTS_EXTENDED !== 'undefined') { PRODUCTS.forEach(p => { if (PRODUCTS_EXTENDED[p.id]) { Object.assign(p, PRODUCTS_EXTENDED[p.id]); if (PRODUCTS_EXTENDED[p.id].shortDesc) { p.desc = PRODUCTS_EXTENDED[p.id].shortDesc; } } }); }

if (typeof SOAPS !== 'undefined' && typeof SOAPS_EXTENDED !== 'undefined') { SOAPS.forEach(s => { if (SOAPS_EXTENDED[s.id]) { Object.assign(s, SOAPS_EXTENDED[s.id]); if (SOAPS_EXTENDED[s.id].shortDesc) { s.desc = SOAPS_EXTENDED[s.id].shortDesc; } } }); }

// Normalize every soap to a single consistent shape so any component can render
// from the central data source. All signature soaps are double-layered unless
// overridden on the individual entry.
if (typeof SOAPS !== 'undefined') {
  SOAPS.forEach(s => {
    s.title = s.title || s.name;
    s.description = s.description || s.desc || s.shortDesc || '';
    s.scent = s.scent || s.scentProfile || '';
    s.botanicals = s.botanicals || '';
    if (typeof s.layered === 'undefined') s.layered = true;
    s.base = s.base || (s.layered
      ? 'Top: castor oil + vegetable glycerin with natural botanical color. Bottom: shea butter + goat milk.'
      : 'Single-base full bar — castor oil, vegetable glycerin, shea butter, and goat milk blended into one formula.');
    s.image = s.image || s.img || s.illustration || '';
  });
}
