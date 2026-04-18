// ============================================================
// GRIMOIRE SEO ARCHITECTURE
// Full herb pages with structured data, internal linking,
// category pages, FAQ sections, and schema markup
// ============================================================

// ---- HERB-TO-PRODUCT INTERNAL LINKS ----
const HERB_PRODUCT_LINKS = {
  'chamomile':      ['dreamease-capsules', 'lucid-dream-tea'],
  'valerian':       ['dreamease-capsules', 'lucid-dream-tea'],
  'passionflower':  ['dreamease-capsules', 'lucid-dream-tea'],
  'lemon-balm':     ['dreamease-capsules', 'lucid-dream-tea'],
  'lavender':       ['dreamease-capsules', 'lucid-dream-tea'],
  'mugwort':        ['lucid-dream-tea'],
  'blue-lotus':     ['lucid-dream-tea'],
  'hops':           ['dreamease-capsules'],
  'skullcap':       ['dreamease-capsules'],
  'ashwagandha':    ['vital-vitality', 'dreamease-capsules'],
  'rhodiola':       ['vital-vitality'],
  'eleuthero':      ['vital-vitality'],
  'maca':           ['vital-vitality'],
  'ginseng':        ['vital-vitality'],
  'moringa':        ['vital-vitality'],
  'cordyceps':      ['vital-vitality'],
  'lion-mane':      ['vital-vitality'],
  'schisandra':     ['vital-vitality'],
  'elderberry':     ['immune-at-ease'],
  'echinacea':      ['immune-at-ease'],
  'astragalus':     ['immune-at-ease'],
  'reishi':         ['immune-at-ease'],
  'turkey-tail':    ['immune-at-ease'],
  'oregano':        ['immune-at-ease'],
  'garlic':         ['immune-at-ease'],
  'propolis':       ['immune-at-ease'],
  'arnica':         ['pain-balm'],
  'cayenne':        ['pain-balm'],
  'wintergreen':    ['pain-balm'],
  'comfrey':        ['pain-balm'],
  'turmeric':       ['pain-balm'],
  'ginger':         ['pain-balm'],
  'boswellia':      ['pain-balm'],
  'white-willow':   ['pain-balm'],
  'rose-hip':       ['beauty-balm', 'collagen-rebuilder'],
  'frankincense':   ['beauty-balm'],
  'sea-buckthorn':  ['beauty-balm'],
  'neroli':         ['beauty-balm'],
  'helichrysum':    ['beauty-balm'],
  'horsetail':      ['collagen-rebuilder'],
  'amla':           ['collagen-rebuilder'],
  'rosemary':       ['hair-serum'],
  'peppermint':     ['hair-serum'],
  'saw-palmetto':   ['hair-serum'],
  'nettle':         ['hair-serum', 'collagen-rebuilder'],
  'burdock':        ['hair-serum'],
  'vitex':          ['vital-vitality'],
  'black-cohosh':   ['vital-vitality'],
  'dong-quai':      ['vital-vitality'],
  'shatavari':      ['vital-vitality'],
  'lion-mane':      ['vital-vitality'],
  'bacopa':         ['vital-vitality'],
  'gotu-kola':      ['vital-vitality'],
  'ginkgo':         ['vital-vitality'],
};

// ---- HERB PAIRINGS ----
const HERB_PAIRINGS = {
  'chamomile':     ['lavender', 'lemon-balm', 'passionflower', 'valerian', 'hops'],
  'lavender':      ['chamomile', 'lemon-balm', 'passionflower', 'rose-hip', 'neroli'],
  'valerian':      ['passionflower', 'chamomile', 'lemon-balm', 'hops', 'skullcap'],
  'passionflower': ['valerian', 'chamomile', 'lemon-balm', 'lavender', 'ashwagandha'],
  'lemon-balm':    ['chamomile', 'lavender', 'passionflower', 'holy-basil', 'valerian'],
  'ashwagandha':   ['rhodiola', 'holy-basil', 'eleuthero', 'schisandra', 'licorice'],
  'rhodiola':      ['ashwagandha', 'eleuthero', 'ginseng', 'schisandra', 'maca'],
  'eleuthero':     ['ashwagandha', 'rhodiola', 'ginseng', 'astragalus', 'schisandra'],
  'elderberry':    ['echinacea', 'astragalus', 'reishi', 'ginger', 'rosehip'],
  'echinacea':     ['elderberry', 'astragalus', 'goldenseal', 'oregano', 'garlic'],
  'astragalus':    ['elderberry', 'echinacea', 'reishi', 'eleuthero', 'licorice'],
  'reishi':        ['astragalus', 'turkey-tail', 'lion-mane', 'cordyceps', 'schisandra'],
  'turmeric':      ['ginger', 'black-pepper', 'boswellia', 'devil-claw', 'arnica'],
  'ginger':        ['turmeric', 'peppermint', 'fennel', 'chamomile', 'licorice'],
  'arnica':        ['comfrey', 'cayenne', 'wintergreen', 'st-johns-wort', 'turmeric'],
  'rose-hip':      ['sea-buckthorn', 'frankincense', 'neroli', 'helichrysum', 'calendula'],
  'frankincense':  ['myrrh', 'rose-hip', 'neroli', 'helichrysum', 'sea-buckthorn'],
  'rosemary':      ['peppermint', 'nettle', 'saw-palmetto', 'burdock', 'horsetail'],
  'peppermint':    ['rosemary', 'spearmint', 'ginger', 'fennel', 'lemon-balm'],
  'nettle':        ['rosemary', 'horsetail', 'burdock', 'dandelion', 'red-clover'],
  'lion-mane':     ['reishi', 'cordyceps', 'bacopa', 'gotu-kola', 'ashwagandha'],
  'bacopa':        ['lion-mane', 'gotu-kola', 'ginkgo', 'rosemary', 'ashwagandha'],
  'vitex':         ['black-cohosh', 'dong-quai', 'shatavari', 'maca', 'red-clover'],
  'black-cohosh':  ['vitex', 'dong-quai', 'red-clover', 'shatavari', 'maca'],
  'dandelion':     ['burdock', 'milk-thistle', 'artichoke', 'nettle', 'yellow-dock'],
  'milk-thistle':  ['dandelion', 'artichoke', 'burdock', 'turmeric', 'schisandra'],
};

// ---- SEO HERB DATA EXTENSIONS ----
const HERB_SEO_DATA = {
  'chamomile': {
    plantFamily: 'Asteraceae',
    partsUsed: ['Flowers'],
    traditionalUses: 'Chamomile has been brewed as a calming tea across European folk medicine for centuries. Ancient Egyptians dedicated it to the sun god Ra and used it to treat fevers. In German herbalism, it was called "alles zutraut" — capable of anything — and was used for everything from digestive upset to skin inflammation. Medieval herbalists prescribed it for anxiety, insomnia, and as a gentle remedy for children.',
    modernApplications: 'Contemporary herbalism values chamomile for its gentle nervine action — calming the nervous system without sedation. It is widely used to support relaxation, ease digestive discomfort, and promote restful sleep. Topically, chamomile\'s anti-inflammatory properties make it a beloved ingredient in skincare for sensitive and irritated skin.',
    preparationMethods: ['Tea (most traditional — steep 1-2 tsp dried flowers in hot water for 5-10 minutes)', 'Tincture (1:5 in 40% alcohol)', 'Capsules (standardized extract)', 'Infused oil (for topical use)', 'Compress (for skin inflammation)'],
    safetyNotes: 'Generally considered very safe. Those with ragweed or daisy family allergies should use with caution. Avoid therapeutic doses during pregnancy. May enhance the effects of sedative medications.',
    faq: [
      { q: 'Can chamomile help with sleep?', a: 'Chamomile is one of the most widely used herbs for sleep support. Its gentle nervine action helps calm the nervous system and ease the transition into rest, making it ideal as a bedtime tea or in sleep formulas.' },
      { q: 'Is chamomile safe during pregnancy?', a: 'Chamomile tea in moderate culinary amounts is generally considered safe during pregnancy. However, therapeutic doses (concentrated extracts, tinctures, or large amounts of tea) should be avoided. Always consult your healthcare provider.' },
      { q: 'What does chamomile taste like?', a: 'Chamomile has a mild, slightly sweet, apple-like flavor with subtle floral notes. It is one of the most pleasant-tasting herbal teas, which is part of why it has been enjoyed for centuries.' },
      { q: 'How is chamomile different from other sleep herbs?', a: 'Unlike valerian or hops, chamomile is a very gentle nervine — it calms without strong sedation. It is ideal for mild anxiety, everyday stress, and light sleep support, especially for children and those sensitive to stronger herbs.' }
    ]
  },
  'lavender': {
    plantFamily: 'Lamiaceae',
    partsUsed: ['Flowers', 'Essential oil'],
    traditionalUses: 'Lavender has been used medicinally since ancient Rome, where soldiers carried it to treat wounds. The name comes from the Latin "lavare" — to wash — reflecting its use in bathing and cleansing rituals. In medieval Europe, lavender was strewn across floors and tucked into linens to repel insects and promote sleep. French herbalists used it extensively for headaches, anxiety, and nervous exhaustion.',
    modernApplications: 'Lavender is one of the most studied aromatic herbs for anxiety and sleep. Aromatherapy research supports its use for reducing anxiety and improving sleep quality. Topically, lavender essential oil is used for minor burns, skin irritation, and headache relief. In herbal medicine, lavender tea and tincture are used for nervous tension, mild depression, and digestive upset related to stress.',
    preparationMethods: ['Tea (steep 1 tsp dried flowers in hot water for 5-7 minutes)', 'Essential oil (aromatherapy, topical — always diluted)', 'Tincture', 'Infused oil (for massage and topical use)', 'Bath soak (dried flowers or essential oil)'],
    safetyNotes: 'Very safe for most people. Essential oil should always be diluted before topical use. Some individuals may experience skin sensitivity. Avoid undiluted essential oil internally. May enhance sedative effects of medications.',
    faq: [
      { q: 'Can lavender help with anxiety?', a: 'Lavender is one of the most researched herbs for anxiety support. Both aromatherapy and oral preparations have been studied, with evidence supporting its ability to reduce mild anxiety and promote a sense of calm.' },
      { q: 'Is lavender safe for children?', a: 'Lavender is generally considered gentle enough for children in appropriate amounts. Lavender essential oil should always be diluted before use on children\'s skin. Consult a healthcare provider for internal use in young children.' },
      { q: 'What is the best way to use lavender for sleep?', a: 'Many people find lavender most effective for sleep through aromatherapy — a few drops on a pillow or in a diffuser. Lavender tea before bed is also a beloved tradition. Oral supplements are available for those who want a more concentrated effect.' }
    ]
  },
  'ashwagandha': {
    plantFamily: 'Solanaceae',
    partsUsed: ['Root', 'Leaves (less common)'],
    traditionalUses: 'Ashwagandha is one of the most revered herbs in Ayurvedic medicine, where it has been used for over 3,000 years as a Rasayana — a rejuvenating tonic for vitality, longevity, and mental clarity. Its name in Sanskrit means "smell of horse," referring both to its distinctive aroma and its traditional reputation for conferring the strength and vitality of a horse. It was prescribed for exhaustion, nervous debility, sexual vitality, and as a tonic for the elderly and convalescent.',
    modernApplications: 'Ashwagandha is one of the most clinically studied adaptogens. Research supports its use for reducing cortisol levels, improving stress resilience, supporting thyroid function, enhancing athletic performance, and improving sleep quality. It is particularly valued for its ability to support the HPA axis — the body\'s stress response system.',
    preparationMethods: ['Capsules (most common for standardized extract)', 'Powder (traditional Ayurvedic preparation — mixed with warm milk and honey)', 'Tincture', 'Tea (root decoction)'],
    safetyNotes: 'Generally well tolerated. Avoid during pregnancy. May interact with thyroid medications, immunosuppressants, and sedatives. Those with nightshade sensitivity should use with caution. Start with lower doses to assess tolerance.',
    faq: [
      { q: 'How long does ashwagandha take to work?', a: 'Ashwagandha is an adaptogen that builds its effects over time. Most people notice improvements in stress resilience, sleep quality, and energy within 4-8 weeks of consistent use, though some notice effects sooner.' },
      { q: 'Can ashwagandha help with anxiety?', a: 'Ashwagandha has been studied for its anxiolytic effects, with research showing it can significantly reduce perceived stress and anxiety by supporting the body\'s cortisol regulation and HPA axis function.' },
      { q: 'Is ashwagandha safe for long-term use?', a: 'Ashwagandha has a long history of safe use in Ayurvedic medicine. Current research supports its safety for most people at standard doses. As with any supplement, periodic breaks are generally recommended. Consult a healthcare provider for long-term use.' }
    ]
  },
  'elderberry': {
    plantFamily: 'Adoxaceae',
    partsUsed: ['Berries', 'Flowers', 'Bark (less common)'],
    traditionalUses: 'Elderberry has been used medicinally across Europe, North America, and beyond for thousands of years. Native American tribes used it extensively for fever, infections, and respiratory illness. In European folk medicine, the elder tree was considered sacred — a "medicine chest" in plant form. Hippocrates called it his "medicine chest." The berries were made into syrups, wines, and tinctures for colds, flu, and immune support.',
    modernApplications: 'Elderberry is one of the most researched herbs for immune support. Studies have shown elderberry extract can reduce the duration and severity of colds and flu. Its rich anthocyanin content provides powerful antioxidant activity. It is used both for prevention during cold and flu season and for recovery support during illness.',
    preparationMethods: ['Syrup (most popular — cooked berries with honey)', 'Capsules', 'Tincture', 'Tea (dried berries or flowers)', 'Gummies and lozenges'],
    safetyNotes: 'Raw elderberries contain compounds that can cause nausea — always cook or properly prepare before use. Elderberry supplements are generally safe. May interact with immunosuppressant medications. Avoid in autoimmune conditions without professional guidance.',
    faq: [
      { q: 'Does elderberry really work for colds and flu?', a: 'Elderberry is one of the better-studied herbal remedies for respiratory illness. Multiple clinical trials have shown elderberry extract can reduce the duration of colds and flu by 2-4 days and reduce symptom severity.' },
      { q: 'When should I start taking elderberry?', a: 'Elderberry is most effective when taken at the first sign of illness. It can also be taken preventively during cold and flu season. For prevention, many people take it daily throughout winter months.' },
      { q: 'Is elderberry safe for children?', a: 'Elderberry syrup is widely used for children and is generally considered safe. Always use properly prepared products (raw berries can cause nausea). Consult a pediatrician for infants and young children.' }
    ]
  },
  'turmeric': {
    plantFamily: 'Zingiberaceae',
    partsUsed: ['Rhizome (root)'],
    traditionalUses: 'Turmeric has been used in Ayurvedic and Traditional Chinese Medicine for over 4,000 years. In Ayurveda, it is considered a sacred herb — used in religious ceremonies, healing rituals, and as a daily tonic. It was applied topically for skin conditions, taken internally for digestive health, and used as a general anti-inflammatory and wound healer. In South Asian cultures, turmeric paste is still applied to the skin before weddings as a beauty and purification ritual.',
    modernApplications: 'Turmeric\'s active compound curcumin is one of the most studied natural anti-inflammatory agents. Research supports its use for joint health, digestive support, brain health, and antioxidant protection. It is widely used in integrative medicine for inflammatory conditions, metabolic health, and cognitive support. Bioavailability is enhanced significantly when taken with black pepper (piperine) or fat.',
    preparationMethods: ['Capsules (standardized curcumin extract — most bioavailable)', 'Golden milk (turmeric with warm milk, black pepper, and honey)', 'Tea', 'Topical paste (for skin)', 'Cooking spice (traditional daily use)'],
    safetyNotes: 'Generally very safe at culinary doses. High doses may cause digestive upset. May interact with blood thinners (warfarin) and diabetes medications. Avoid therapeutic doses during pregnancy. Choose supplements with black pepper extract (piperine) for better absorption.',
    faq: [
      { q: 'What is the difference between turmeric and curcumin?', a: 'Turmeric is the whole root spice. Curcumin is the primary active compound within turmeric, responsible for most of its anti-inflammatory and antioxidant effects. Curcumin makes up about 3% of turmeric by weight, so standardized curcumin extracts provide a much higher concentration than turmeric powder alone.' },
      { q: 'Does turmeric help with joint pain?', a: 'Multiple studies have shown curcumin to be effective for supporting joint comfort, particularly in inflammatory conditions. Some research suggests it may be comparable to certain anti-inflammatory medications for joint support, with fewer side effects.' },
      { q: 'Why should I take turmeric with black pepper?', a: 'Curcumin alone has poor bioavailability — the body absorbs very little of it. Piperine, the active compound in black pepper, has been shown to increase curcumin absorption by up to 2,000%. Most quality turmeric supplements include black pepper extract (BioPerine) for this reason.' }
    ]
  },
  'rosemary': {
    plantFamily: 'Lamiaceae',
    partsUsed: ['Leaves', 'Essential oil'],
    traditionalUses: 'Rosemary has been associated with memory and remembrance since ancient Greece, where students wore garlands of it during exams. In medieval Europe, it was burned as incense to purify the air during illness, used in wedding ceremonies as a symbol of fidelity, and placed on graves as a token of remembrance. Traditional herbalists used it for headaches, poor circulation, hair loss, and as a digestive tonic.',
    modernApplications: 'Modern research has confirmed rosemary\'s traditional reputation for cognitive support — studies show rosemary aroma can improve memory and concentration. Topically, rosemary oil has been shown in clinical trials to support hair regrowth, with one study finding it comparable to minoxidil for androgenetic alopecia. It is also used for scalp circulation, digestive support, and as an antioxidant.',
    preparationMethods: ['Essential oil (scalp massage — diluted in carrier oil)', 'Tea (fresh or dried leaves)', 'Tincture', 'Infused oil (for hair and scalp)', 'Culinary use (fresh or dried)'],
    safetyNotes: 'Safe at culinary doses. Essential oil should be diluted before topical use. Avoid therapeutic doses during pregnancy. High doses may cause seizures in rare cases. May interact with blood thinners and ACE inhibitors.',
    faq: [
      { q: 'Can rosemary oil help with hair growth?', a: 'Yes — rosemary oil is one of the most evidence-backed natural remedies for hair support. A 2015 clinical trial found rosemary oil to be as effective as 2% minoxidil for androgenetic alopecia after 6 months of use, with less scalp itching.' },
      { q: 'How do I use rosemary oil for hair?', a: 'Dilute 3-5 drops of rosemary essential oil in 1 tablespoon of carrier oil (such as jojoba or castor oil). Massage into the scalp for 5-10 minutes, then leave for at least 30 minutes before washing. Use 2-3 times per week for best results.' },
      { q: 'Does rosemary improve memory?', a: 'Research suggests rosemary aroma can improve memory and cognitive performance. One study found that simply being in a room diffused with rosemary essential oil improved memory test scores by 15%. Oral rosemary preparations are also studied for cognitive support.' }
    ]
  },
  'ginger': {
    plantFamily: 'Zingiberaceae',
    partsUsed: ['Rhizome (root)'],
    traditionalUses: 'Ginger is one of the oldest and most universally used medicinal plants in the world. It appears in ancient Chinese, Indian, Greek, and Arab medical texts. In Ayurveda, it is called "vishwabhesaj" — the universal medicine. Traditional uses span virtually every culture: for nausea, digestive upset, cold and flu, pain, and as a warming circulatory tonic. Sailors carried it to prevent seasickness; midwives recommended it for morning sickness.',
    modernApplications: 'Ginger is one of the most clinically studied herbs. Research strongly supports its use for nausea (including chemotherapy-induced nausea and morning sickness), anti-inflammatory effects for joint pain, digestive support, and circulation. Its gingerol compounds are potent anti-inflammatory agents that inhibit the same pathways as many pharmaceutical anti-inflammatory drugs.',
    preparationMethods: ['Tea (fresh ginger root — most bioavailable)', 'Capsules (standardized extract)', 'Tincture', 'Topical (infused oil or balm for pain)', 'Culinary use (fresh, dried, or powdered)'],
    safetyNotes: 'Generally very safe. May cause mild heartburn in sensitive individuals at high doses. May interact with blood thinners (warfarin) — use with caution. Considered safe during pregnancy at culinary doses for nausea; consult healthcare provider for therapeutic doses.',
    faq: [
      { q: 'Can ginger help with nausea?', a: 'Ginger is one of the most evidence-backed natural remedies for nausea. Multiple clinical trials support its effectiveness for morning sickness, motion sickness, and chemotherapy-induced nausea. It is widely recommended by integrative healthcare providers as a first-line natural option.' },
      { q: 'Is ginger anti-inflammatory?', a: 'Yes — ginger contains gingerols and shogaols that inhibit inflammatory pathways including COX-2, the same pathway targeted by many anti-inflammatory medications. Research supports its use for joint pain, muscle soreness, and general inflammation.' },
      { q: 'How much ginger should I take daily?', a: 'For general wellness, 1-2 grams of dried ginger per day (about 1 teaspoon of fresh grated ginger) is commonly used. For therapeutic purposes, doses of 1-3 grams of standardized extract are used in research. Start with lower amounts and assess tolerance.' }
    ]
  },
  'peppermint': {
    plantFamily: 'Lamiaceae',
    partsUsed: ['Leaves', 'Essential oil'],
    traditionalUses: 'Peppermint is a natural hybrid of watermint and spearmint, first described by botanist John Ray in 1696. However, mint has been used medicinally since ancient Egypt — dried mint leaves have been found in Egyptian tombs dating to 1000 BCE. Greek and Roman physicians used it extensively for digestive complaints, headaches, and as a cooling remedy for fevers. In medieval European herbalism, mint was one of the most commonly prescribed plants.',
    modernApplications: 'Peppermint is one of the most researched herbs for digestive health. Enteric-coated peppermint oil capsules are clinically proven to reduce symptoms of IBS. Topically, peppermint oil is effective for tension headaches (comparable to acetaminophen in some studies). For scalp health, peppermint oil has been shown to increase scalp circulation and support hair growth.',
    preparationMethods: ['Tea (most common — steep fresh or dried leaves)', 'Enteric-coated capsules (for IBS support)', 'Essential oil (topical — always diluted)', 'Tincture', 'Aromatherapy (for headache and focus)'],
    safetyNotes: 'Very safe at culinary doses. Essential oil should always be diluted before topical use. Avoid applying near the face of infants and young children (menthol can cause breathing difficulties). Enteric-coated capsules are preferred for IBS to avoid heartburn. May interact with certain medications metabolized by the liver.',
    faq: [
      { q: 'Can peppermint help with IBS?', a: 'Yes — peppermint oil is one of the most evidence-backed natural remedies for IBS. Multiple meta-analyses confirm that enteric-coated peppermint oil capsules significantly reduce IBS symptoms including abdominal pain, bloating, and bowel irregularity.' },
      { q: 'Does peppermint oil help with headaches?', a: 'Research supports topical peppermint oil for tension headaches. A 1996 study found that applying diluted peppermint oil to the forehead and temples was as effective as 1,000mg of acetaminophen for tension headache relief.' },
      { q: 'Is peppermint good for hair growth?', a: 'A 2014 study found that peppermint oil applied to the scalp increased the number of hair follicles, follicle depth, and overall hair growth — outperforming minoxidil in some measures. It is thought to work by increasing scalp circulation.' }
    ]
  },
  'valerian': {
    plantFamily: 'Caprifoliaceae',
    partsUsed: ['Root', 'Rhizome'],
    traditionalUses: 'Valerian has been used as a sleep and anxiety remedy since ancient Greece and Rome. Hippocrates described its properties, and Galen prescribed it for insomnia. In medieval Europe, it was so valued as a sleep remedy that it was called "all-heal." During World War II, it was used in England to relieve stress from air raids. The name may derive from the Latin "valere" — to be strong or healthy.',
    modernApplications: 'Valerian is one of the most studied herbs for sleep and anxiety. Research supports its use for reducing the time to fall asleep, improving sleep quality, and reducing nighttime waking. It is thought to work by increasing GABA levels in the brain — the same mechanism as benzodiazepine medications, but more gently and without dependency risk.',
    preparationMethods: ['Capsules (most common for standardized extract)', 'Tea (strong decoction of dried root)', 'Tincture', 'Combination formulas (often with hops, lemon balm, or passionflower)'],
    safetyNotes: 'Generally considered safe for short-term use. May cause vivid dreams or morning grogginess in some people. Avoid combining with alcohol or sedative medications. Not recommended during pregnancy. Allow 2-4 weeks of consistent use for full effect.',
    faq: [
      { q: 'How long does valerian take to work?', a: 'For acute use (single dose before bed), valerian may help within 30-60 minutes. For chronic insomnia, research suggests consistent use for 2-4 weeks provides the most significant benefit as the herb builds its effect over time.' },
      { q: 'Does valerian cause dependency?', a: 'Unlike pharmaceutical sleep medications, valerian is not known to cause physical dependency or withdrawal. It works through different mechanisms than benzodiazepines and does not appear to create tolerance with regular use.' },
      { q: 'Why does valerian smell so strong?', a: 'Valerian root has a distinctive, earthy, somewhat pungent smell due to its isovaleric acid content. This is actually a sign of quality and potency. The smell dissipates when taken in capsule form, which most people prefer.' }
    ]
  },
  'echinacea': {
    plantFamily: 'Asteraceae',
    partsUsed: ['Root', 'Aerial parts', 'Seeds'],
    traditionalUses: 'Echinacea was the most widely used medicinal plant of the Plains Indians of North America, used by over 14 tribes for a wider variety of ailments than any other plant. It was used for everything from toothaches and sore throats to snake bites and infections. European settlers learned of its uses from Native Americans, and by the late 1800s it was the most popular herbal remedy in the United States.',
    modernApplications: 'Echinacea is one of the most researched herbs for immune support. Meta-analyses show it can reduce the incidence of the common cold by up to 58% and reduce the duration of colds by 1-4 days. It works primarily by activating macrophages and natural killer cells — the immune system\'s first responders. It is most effective when taken at the first sign of illness.',
    preparationMethods: ['Tincture (most bioavailable — especially fresh root)', 'Capsules (standardized extract)', 'Tea', 'Throat spray', 'Combination formulas (often with elderberry or goldenseal)'],
    safetyNotes: 'Generally safe for short-term use. Those with autoimmune conditions should consult a healthcare provider before use. Avoid in progressive systemic diseases (MS, lupus, HIV). May cause mild allergic reactions in those sensitive to the daisy family. Not recommended for continuous long-term use — cycle with breaks.',
    faq: [
      { q: 'When should I take echinacea?', a: 'Echinacea is most effective when taken at the very first sign of illness — the earlier the better. It can also be taken preventively during cold and flu season, though cycling (taking it for 2-3 weeks then taking a break) is generally recommended for preventive use.' },
      { q: 'Which part of echinacea is most effective?', a: 'Different species and parts have different active compounds. Echinacea purpurea aerial parts are most studied for immune activation. Echinacea angustifolia root is traditional and highly valued. Many practitioners prefer combination products using multiple species and parts.' },
      { q: 'Can I take echinacea every day?', a: 'Most herbalists recommend cycling echinacea rather than taking it continuously. A common approach is 2-3 weeks on, 1-2 weeks off for preventive use. During acute illness, it can be taken more frequently for a shorter period.' }
    ]
  },
  'reishi': {
    plantFamily: 'Ganodermataceae',
    partsUsed: ['Fruiting body', 'Mycelium'],
    traditionalUses: 'Reishi mushroom has been revered in Traditional Chinese Medicine for over 2,000 years as the "mushroom of immortality" (Lingzhi). It was so rare and precious in ancient China that it was reserved exclusively for emperors and royalty. Taoist monks used it as a spiritual tonic to support meditation, longevity, and connection to the divine. It appears in ancient Chinese art as a symbol of good fortune, longevity, and spiritual power.',
    modernApplications: 'Reishi is one of the most extensively studied medicinal mushrooms. Research supports its use for immune modulation, liver protection, stress adaptation, sleep support, and cardiovascular health. Its beta-glucans and triterpenes work synergistically to support immune intelligence — helping the immune system respond appropriately rather than simply stimulating it.',
    preparationMethods: ['Dual-extracted capsules or powder (most bioavailable — requires both hot water and alcohol extraction)', 'Tea (long decoction)', 'Tincture (dual extraction preferred)', 'Coffee blends'],
    safetyNotes: 'Generally well tolerated. May cause mild digestive upset initially. May interact with blood thinners and immunosuppressants. Avoid during pregnancy. Choose dual-extracted products for maximum bioavailability of both water-soluble and fat-soluble compounds.',
    faq: [
      { q: 'What is the difference between reishi fruiting body and mycelium?', a: 'The fruiting body (the actual mushroom) contains higher concentrations of beta-glucans and triterpenes — the primary active compounds. Mycelium-based products are often grown on grain and may contain significant amounts of starch. Most practitioners prefer dual-extracted fruiting body products for therapeutic use.' },
      { q: 'Can reishi help with sleep?', a: 'Reishi has been studied for sleep support, with research suggesting it can improve sleep quality and increase total sleep time. It is thought to work through its effects on the nervous system and its adaptogenic properties rather than as a direct sedative.' },
      { q: 'How long does reishi take to work?', a: 'Reishi is a tonic herb that builds its effects over time. Most people notice improvements in energy, stress resilience, and sleep quality after 4-8 weeks of consistent use. Some effects, like immune support, may be more immediate.' }
    ]
  }
};

// ---- CATEGORY PAGES ----
const HERB_CATEGORIES = {
  sleep: {
    title: 'Herbs for Sleep',
    icon: '🌙',
    description: 'These plants have been used across healing traditions for centuries to support restful sleep, calm the nervous system, and ease the transition from waking into dreaming. Each works through different mechanisms — some are gentle nervines, others are deeper sedatives, and some work best as part of a nightly ritual.',
    herbs: ['chamomile', 'valerian', 'passionflower', 'lemon-balm', 'lavender', 'hops', 'skullcap', 'ashwagandha', 'magnolia', 'california-poppy', 'mugwort', 'blue-lotus', 'kava', 'holy-basil']
  },
  stress: {
    title: 'Herbs for Stress & Anxiety',
    icon: '🌿',
    description: 'Adaptogens and nervines form the backbone of herbal stress support. Adaptogens help the body regulate its stress response over time, while nervines provide more immediate calming effects. Together, they offer a comprehensive botanical approach to modern stress.',
    herbs: ['ashwagandha', 'rhodiola', 'holy-basil', 'lemon-balm', 'passionflower', 'lavender', 'schisandra', 'eleuthero', 'kava', 'skullcap', 'mimosa', 'reishi', 'licorice', 'maca']
  },
  energy: {
    title: 'Herbs for Energy & Vitality',
    icon: '⚡',
    description: 'Unlike stimulants that force energy through the nervous system, these adaptogenic and tonic herbs work by nourishing the body\'s own energy-producing systems. The result is a clean, sustainable vitality that builds over time rather than depleting reserves.',
    herbs: ['ashwagandha', 'rhodiola', 'eleuthero', 'maca', 'ginseng', 'moringa', 'cordyceps', 'lion-mane', 'schisandra', 'licorice', 'ginger', 'codonopsis', 'shatavari', 'nettle']
  },
  immune: {
    title: 'Herbs for Immune Support',
    icon: '🛡️',
    description: 'These botanicals support immune health through different mechanisms — some activate the immune system\'s first responders, others build deep immune reserves over time, and some modulate immune intelligence to help the body respond wisely rather than over- or under-reacting.',
    herbs: ['elderberry', 'echinacea', 'astragalus', 'reishi', 'turkey-tail', 'andrographis', 'oregano', 'garlic', 'cat-claw', 'propolis', 'black-seed', 'thyme', 'goldenseal', 'boneset']
  },
  digestion: {
    title: 'Herbs for Digestive Health',
    icon: '🌱',
    description: 'The gut is often called the second brain — and herbal medicine has always recognized its central role in overall health. These plants support digestion through different pathways: some stimulate digestive secretions, others soothe inflammation, and some support the gut microbiome.',
    herbs: ['ginger', 'peppermint', 'chamomile', 'fennel', 'licorice', 'marshmallow-root', 'slippery-elm', 'dandelion', 'artichoke', 'gentian', 'milk-thistle', 'yellow-dock', 'burdock', 'triphala']
  },
  beauty: {
    title: 'Herbs for Skin & Beauty',
    icon: '✨',
    description: 'True beauty is nourished from within and without. These botanicals support skin health through anti-inflammatory, antioxidant, and collagen-supporting actions — both topically and internally. They represent the intersection of ancient beauty wisdom and modern botanical science.',
    herbs: ['rose-hip', 'sea-buckthorn', 'frankincense', 'neroli', 'helichrysum', 'calendula', 'horsetail', 'amla', 'nettle', 'burdock', 'turmeric', 'green-tea', 'aloe', 'tamanu']
  },
  hormones: {
    title: 'Herbs for Hormonal Balance',
    icon: '🌸',
    description: 'Hormonal balance is a dynamic, whole-body process that involves the endocrine system, the nervous system, the liver, and the gut. These herbs support hormonal health through multiple pathways — from phytoestrogenic activity to adaptogenic support for the adrenal-thyroid-gonadal axis.',
    herbs: ['vitex', 'black-cohosh', 'dong-quai', 'maca', 'red-clover', 'shatavari', 'ashwagandha', 'evening-primrose', 'licorice', 'wild-yam', 'red-raspberry', 'motherwort', 'schisandra', 'tribulus']
  },
  cognitive: {
    title: 'Herbs for Brain & Focus',
    icon: '🧠',
    description: 'Nootropic and cognitive-supportive herbs work through multiple mechanisms — improving cerebral circulation, supporting neurotransmitter balance, protecting neurons from oxidative stress, and enhancing the brain\'s capacity for plasticity and learning.',
    herbs: ['lion-mane', 'bacopa', 'ginkgo', 'rhodiola', 'ashwagandha', 'rosemary', 'gotu-kola', 'holy-basil', 'schisandra', 'eleuthero', 'periwinkle', 'club-moss', 'sage', 'green-tea']
  }
};

// ---- RENDER FULL HERB PAGE (SEO-STRUCTURED) ----
function renderFullHerbPage(herb) {
  const seoData = HERB_SEO_DATA[herb.id] || {};
  const pairings = HERB_PAIRINGS[herb.id] || [];
  const relatedProductIds = HERB_PRODUCT_LINKS[herb.id] || [];
  const relatedProducts = relatedProductIds.map(pid => PRODUCTS.find(p => p.id === pid)).filter(Boolean);

  const preparationMethods = seoData.preparationMethods || herb.uses?.map(u => u.charAt(0).toUpperCase() + u.slice(1)) || [];
  const safetyNotes = seoData.safetyNotes || (herb.contraindications ? herb.contraindications.join('. ') : 'Consult a qualified healthcare professional before use, especially if pregnant, nursing, taking medications, or managing a health condition.');
  const faq = seoData.faq || [];

  // Find category pages this herb belongs to
  const herbCategories = Object.entries(HERB_CATEGORIES)
    .filter(([key, cat]) => cat.herbs.includes(herb.id))
    .map(([key, cat]) => ({ key, ...cat }));

  return `
    <div class="herb-full-page" itemscope itemtype="https://schema.org/Drug">
      <!-- Hero -->
      <div class="herb-page-hero">
        <img src="${herb.illustration || herb.img}"
          alt="${herb.name} botanical illustration — ${herb.latin}"
          class="herb-page-hero-img"
          itemprop="image"
          onerror="this.outerHTML='<div class=img-placeholder>' + (this.alt || '🌿') + '</div>'">
        <div class="herb-page-hero-info">
          <div class="herb-page-emoji">${herb.emoji || '🌿'}</div>
          <h1 class="herb-page-name" itemprop="name">${herb.name}</h1>
          <p class="herb-page-latin" itemprop="alternateName"><em>${herb.latin}</em></p>
          ${seoData.plantFamily ? `<p class="herb-page-family">Family: <strong>${seoData.plantFamily}</strong></p>` : ''}
          ${seoData.partsUsed ? `<p class="herb-page-parts">Parts Used: <strong>${seoData.partsUsed.join(', ')}</strong></p>` : ''}
          <div class="herb-page-categories">
            ${(herb.categories || []).map(c => `<span class="herb-cat-badge herb-cat-${c}">${c}</span>`).join('')}
          </div>
        </div>
      </div>

      <!-- Short Description -->
      <div class="herb-page-section">
        <p class="herb-page-short-desc" itemprop="description">${herb.desc || ''}</p>
      </div>

      <!-- Traditional Uses -->
      ${seoData.traditionalUses ? `
      <div class="herb-page-section">
        <h2 class="herb-page-section-title">📜 Traditional Uses</h2>
        <p class="herb-page-text">${seoData.traditionalUses}</p>
      </div>` : ''}

      <!-- Modern Wellness Applications -->
      ${seoData.modernApplications ? `
      <div class="herb-page-section">
        <h2 class="herb-page-section-title">🔬 Modern Wellness Applications</h2>
        <p class="herb-page-text">${seoData.modernApplications}</p>
      </div>` : ''}

      <!-- Benefits -->
      ${herb.benefits && herb.benefits.length ? `
      <div class="herb-page-section">
        <h2 class="herb-page-section-title">✨ Key Benefits</h2>
        <ul class="herb-page-benefits">
          ${herb.benefits.map(b => `<li>${b}</li>`).join('')}
        </ul>
        <button class="add-to-custom-btn herb-page-add-custom-btn" onclick="if(typeof addToCustomCreation==='function'){document.getElementById('herbModal').style.display='none';document.body.style.overflow='';addToCustomCreation('${herb.id}')}">+ Add to My Custom Creation</button>
      </div>` : ''}

      <!-- Preparation Methods -->
      ${preparationMethods.length ? `
      <div class="herb-page-section">
        <h2 class="herb-page-section-title">🫖 Preparation Methods</h2>
        <ul class="herb-page-prep">
          ${preparationMethods.map(m => `<li>${m}</li>`).join('')}
        </ul>
      </div>` : ''}

      <!-- Safety Considerations -->
      <div class="herb-page-section herb-page-safety">
        <h2 class="herb-page-section-title">⚠️ Safety Considerations</h2>
        <p class="herb-page-text">${safetyNotes}</p>
        <p class="herb-page-disclaimer">These botanical products are crafted to support general wellness. They are not intended to diagnose, treat, cure, or prevent any disease. Always consult a qualified healthcare professional before use.</p>
      </div>

      <!-- Products Featuring This Herb -->
      ${relatedProducts.length ? `
      <div class="herb-page-section">
        <h2 class="herb-page-section-title">🛍️ Products Featuring This Herb</h2>
        <div class="herb-related-products">
          ${relatedProducts.map(p => `
            <button class="herb-related-product-card" onclick="closeHerbModal(); setTimeout(() => openProductModal('${p.id}'), 300)">
              <img src="${p.img}" alt="${p.name}" onerror="this.style.display='none'">
              <div>
                <strong>${p.name}</strong>
                <p>${p.benefit || p.desc?.substring(0, 60) + '…'}</p>
              </div>
            </button>
          `).join('')}
        </div>
      </div>` : ''}

      <!-- Herb Pairings -->
      ${pairings.length ? `
      <div class="herb-page-section">
        <h2 class="herb-page-section-title">🌿 Herbs That Work Well With ${herb.name}</h2>
        <p class="herb-page-text-sm">These botanical allies share complementary energies and are often combined in traditional formulas:</p>
        <div class="herb-pairings-grid">
          ${pairings.map(pid => {
            const paired = BOTANICALS.find(b => b.id === pid);
            if (!paired) return '';
            return `
              <button class="herb-pairing-card botanical-chip" data-herb-id="${pid}" onclick="openHerbModal('${pid}')">
                <img src="${paired.illustration || paired.img}" alt="${paired.name}" onerror="this.style.display='none'">
                <span>${paired.name}</span>
              </button>`;
          }).join('')}
        </div>
      </div>` : ''}

      <!-- Related Categories -->
      ${herbCategories.length ? `
      <div class="herb-page-section">
        <h2 class="herb-page-section-title">🔍 Explore Related Wellness Topics</h2>
        <div class="herb-category-links">
          ${herbCategories.map(cat => `
            <button class="herb-category-link" onclick="closeHerbModal(); showCategoryPage('${cat.key}')">
              ${cat.icon} ${cat.title}
            </button>
          `).join('')}
        </div>
      </div>` : ''}

      <!-- FAQ -->
      ${faq.length ? `
      <div class="herb-page-section">
        <h2 class="herb-page-section-title">❓ Frequently Asked Questions</h2>
        <div class="herb-faq">
          ${faq.map((item, i) => `
            <div class="herb-faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
              <button class="herb-faq-question" onclick="toggleFaq(this)" itemprop="name">
                ${item.q}
                <span class="herb-faq-toggle">+</span>
              </button>
              <div class="herb-faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
                <p itemprop="text">${item.a}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>` : ''}
    </div>
  `;
}

// ---- CATEGORY PAGE RENDERER ----
function showCategoryPage(categoryKey) {
  const cat = HERB_CATEGORIES[categoryKey];
  if (!cat) return;

  const herbs = cat.herbs.map(id => BOTANICALS.find(b => b.id === id)).filter(Boolean);

  const existing = document.getElementById('category-page-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'category-page-modal';
  modal.className = 'category-modal-overlay';
  modal.innerHTML = `
    <div class="category-modal">
      <button class="category-modal-close" onclick="closeCategoryPage()">✕</button>
      <div class="category-modal-header">
        <div class="category-modal-icon">${cat.icon}</div>
        <h1 class="category-modal-title">${cat.title}</h1>
        <p class="category-modal-desc">${cat.description}</p>
      </div>
      <div class="category-herbs-grid">
        ${herbs.map(h => `
          <button class="category-herb-card botanical-chip" data-herb-id="${h.id}" onclick="closeCategoryPage(); setTimeout(() => openHerbModal('${h.id}'), 300)">
            <img src="${h.illustration || h.img}" alt="${h.name} — ${h.latin}" onerror="this.style.display='none'">
            <div class="category-herb-info">
              <h3>${h.name}</h3>
              <p class="category-herb-latin"><em>${h.latin}</em></p>
              <p class="category-herb-desc">${h.desc ? h.desc.substring(0, 80) + '…' : ''}</p>
            </div>
          </button>
        `).join('')}
      </div>
      <div class="category-modal-footer">
        <button class="category-explore-btn" onclick="closeCategoryPage(); showSection('grimoire')">
          🌿 Explore The Full Grimoire
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeCategoryPage(); });

  // Init botanical chips
  if (typeof initBotanicalChips === 'function') setTimeout(initBotanicalChips, 100);
}

function closeCategoryPage() {
  const modal = document.getElementById('category-page-modal');
  if (modal) {
    modal.style.animation = 'advisorFadeOut 0.3s ease forwards';
    setTimeout(() => modal.remove(), 300);
  }
}

// ---- FAQ TOGGLE ----
function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const toggle = btn.querySelector('.herb-faq-toggle');
  const isOpen = answer.style.maxHeight && answer.style.maxHeight !== '0px';
  answer.style.maxHeight = isOpen ? '0px' : '500px';
  answer.style.opacity = isOpen ? '0' : '1';
  toggle.textContent = isOpen ? '+' : '−';
}

// ---- SCHEMA MARKUP INJECTION ----
function injectHerbSchema(herb) {
  const seoData = HERB_SEO_DATA[herb.id] || {};
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Drug',
    'name': herb.name,
    'alternateName': herb.latin,
    'description': herb.desc,
    'image': herb.illustration || herb.img,
    'mechanismOfAction': seoData.modernApplications || '',
    'administrationRoute': (seoData.preparationMethods || []).join(', '),
    'warning': seoData.safetyNotes || 'Consult a healthcare professional before use.',
    'url': `https://awakenagain.com/#grimoire-${herb.id}`,
    'isPartOf': {
      '@type': 'WebSite',
      'name': "Amber's Alchemy Apothecary",
      'url': 'https://awakenagain.com'
    }
  };

  const existing = document.getElementById(`schema-${herb.id}`);
  if (existing) existing.remove();

  const script = document.createElement('script');
  script.id = `schema-${herb.id}`;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

// ---- OVERRIDE openHerbModal TO USE FULL PAGE ----
// This function patches the existing openHerbModal to use the new full-page renderer
function patchHerbModal() {
  if (typeof openHerbModal !== 'undefined') {
    const originalOpen = openHerbModal;
    window.openHerbModal = function(herbId) {
      const herb = BOTANICALS.find(b => b.id === herbId);
      if (!herb) return;

      // Inject schema markup
      injectHerbSchema(herb);

      // Use the full page renderer
      const modal = document.getElementById('herb-modal');
      if (modal) {
        const content = modal.querySelector('.herb-modal-content, .modal-content, .herb-detail');
        if (content) {
          content.innerHTML = renderFullHerbPage(herb);
          modal.style.display = 'flex';
          modal.classList.add('active');
          // Re-init botanical chips
          if (typeof initBotanicalChips === 'function') setTimeout(initBotanicalChips, 100);
          return;
        }
      }
      // Fallback to original
      originalOpen(herbId);
    };
  }
}

// ---- CLOSE HERB MODAL ----
function closeHerbModal() {
  const modal = document.getElementById('herb-modal');
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('active');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(patchHerbModal, 200);
});
