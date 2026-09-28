<!-- Human requirements authority. Version this file when Amber gives new explicit requirements. Where this conflicts with the Netlify project rules (e.g. Stripe vs. Cash App + Venmo only), the conflict is unresolved until Amber decides. -->

AMBER'S AWAKENAGAIN.COM MASTER SOURCE OF TRUTH
Historical requirements consolidation • current specification • prompts • agents • workflows • decision ledger • 26 September 2026
Purpose: reconstruct the website Amber has described across prior conversations, retain every still-relevant requirement, preserve useful prompts/workflows, and prevent obsolete instructions from overriding newer decisions.
Scope rule: newer explicit instructions override older conflicting instructions. Older ideas remain only when they were never superseded or when they provide useful historical context. Assistant-generated proposals are not treated as Amber requirements unless Amber adopted or reaffirmed them.
This document is designed to be handed to Claude, Codex, a developer, or another implementation agent as the human-readable requirements authority. Before production changes, the implementation agent must audit the live repository, live deployment binding, database, payment configuration, and current environment rather than assuming historical files describe production accurately.
1. Brand North Star
AwakenAgain.com is the digital home of Awaken With Amber LLC and Amber's Alchemy Apothecary. It should feel less like a conventional online store and more like a living, interconnected digital sanctuary: mystical, feminine, botanical, forest-fantasy, meditative, premium, personal, educational, and genuinely useful.
• Amber's Alchemy Apothecary is the botanical/product division under Awaken With Amber LLC.
• The experience should connect handcrafted botanical products, spiritual self-care, intuitive services, botanical education, rituals, meditations, personalized recommendations, memberships, and AI-guided customer support.
• The visual identity should preserve the established dark-purple/gold mystical atmosphere and botanical feeling while remaining readable, mobile-first, uncluttered, and easy to navigate.
• The site should feel alive and contextual: a visitor should be able to move naturally from an article to an herb, from an herb to a formula, from a formula to a product, from a quiz result to a custom remedy, and from educational content to a ritual, meditation, service, or Grimoire entry.
• Content should not exist as isolated pages. Search, internal relationships, related-content modules, and clear next actions should make the whole ecosystem discoverable.
• Do not import unrelated Functional Neurology & Sleep Medicine / Dr. Maya Thomas material into this project.
2. Current Experience Architecture
2.1 Persistent navigation
• Home
• Shop
• Services
• Facts & Articles
• Herb & Ingredient Library
• Herbal Allies Quiz / Build a Remedy
• Living Grimoire
• Meditations & Rituals
• About
• Favorites / Saved Content
• Account
• Help / FAQ
• Site-wide Search
• Cart icon/count. Checkout should be reached through the cart flow rather than being a primary-navigation destination.
Earlier versions used labels such as Herbal Wisdom and Herbal Knowledge. Amber later asked for clearer labels. Use Facts & Articles for the broad educational/content hub and Herb & Ingredient Library for the structured botanical reference library.
2.2 Homepage
1. Consent-based atmospheric entry. Offer an obvious sound choice rather than autoplaying without consent. Preserve the mystical/forest-fantasy/meditative mood.
2. Hero that immediately explains the AWAKEN ecosystem and gives strong pathways such as Take the Herbal Allies Quiz, Shop by Goal, Shop, Book a Service, and Enter/Join the Living Grimoire.
3. Compact 'Choose Your Path' / 'What can we help you with?' experience rather than dumping the full site onto the homepage.
4. Short About / product-story section explaining Amber's handcrafted approach and, where accurate for a specific product, that Amber grows, harvests, and dries her organic goods.
5. Soap/product-gallery context placed above the homepage soap gallery.
6. Curated featured products rather than the entire catalog.
7. Clickable 'Customers Are Using Our Formulas For' wellness-topic cards that lead to supporting educational articles. Use compliant wellness language rather than diagnosis/treatment claims.
8. A few genuine, permission-approved customer reviews. Do not fabricate reviews, review counts, 'verified buyer' labels, or star averages.
9. Featured Facts & Articles, botanical records, meditations/rituals, services, quiz CTA, and Living Grimoire preview.
10. Final CTA strip and complete footer with policies, contact, social destinations, and accessibility-friendly navigation.
Historical correction: an older homepage placed the full shop, builders, education, FAQ, contact, and checkout into one long flow. Later audits explicitly rejected that density. Dedicated destinations should carry the depth; the homepage should guide discovery.
3. Audio & Atmosphere
• Preserve the consent-based audio entrance. Earlier explicit button wording included green 'Experience Calming Music' and red 'Continue Without'. Later wording also used 'Enter with sound'; implementation may modernize copy without removing the choice.
• Preserve the original music asset where available and restore it if a later build accidentally replaced or removed it.
• Preserve low oscillator/tone layers at 333 Hz, 444 Hz, 777 Hz, and 134 Hz as an experiential feature; do not make unsupported physiological or medical claims about what those frequencies do.
• Initial volume should remain subtle (historically around 7%) with an accessible visible sound toggle.
• Respect reduced-motion/accessibility preferences and do not let media materially degrade performance.
4. Public Knowledge System
4.1 Facts & Articles
• Substantial educational and reflective articles rather than thin SEO pages.
• Articles & Guides, formula explainers, Research & Safety, ritual/wellness education, metaphysical learning, and related AWAKEN subjects.
• Every article should link to relevant botanical records, related formulas/products, safety context, quiz pathways, services, rituals/meditations, and other useful reading.
• Use ethical SEO/AEO. No keyword stuffing, doorway pages, copied articles, hidden text, spam backlinks, fabricated citations, or fake Wikipedia placement.
4.2 Herb & Ingredient Library
• One public structured botanical destination. Earlier separate Herb Encyclopedia and Ingredient Library concepts were merged.
• Each record should support: common name, botanical name, plant part, accurate botanical image, traditional-use context, preparation context, safety/contraindication notes, citations/evidence fields, related products/formulas, related articles, and quiz relationships.
• Do not repeat generic botanical art for unrelated herbs. Use correct herb-specific imagery.
• Use the same verified botanical record to power library pages, ingredient panels, quiz explanations, formula pages, internal recommendations, search, and structured data.
• Build a Botanical Knowledge Graph: Herb/Ingredient → traditional use → safety → evidence/citations → formula → product → article → quiz rule → customer goal.
5. Herbal Allies Quiz & Build Your Own Remedy
• Preserve the Herbal Allies Quiz as a central experience and prominent homepage pathway.
• Mobile layout must be compact enough that instructions, choices, progress, and buttons remain visible without becoming difficult to read.
• Do not give customers an arbitrary 'swap the recommended herb' control. Explain each recommended herb, what role it serves, and why the rules selected it.
• During the quiz—not after results—let the customer choose whether selected concerns/goals should become one combined remedy or separate remedies.
• Quiz results should prepopulate the custom-remedy configuration.
• Completion should be able to build the remedy and add it to the shared cart with all configuration details.
• Keep email/marketing consent separate, explicit, and optional.
• Use safety exclusions and acknowledgements where relevant. The quiz is educational/personalization logic, not diagnosis.
• Do not lose quiz state during mobile navigation or transition into the builder.
• Every button/result action must work and be tested.
5.1 Custom remedy builder
• Guided, elegant, simple, and magical rather than overwhelming.
• Support customer intention/goal, remedy form, approved botanicals, optional notes, allergy/sensitivity confirmation, medication/pregnancy cautions where relevant, size/quantity, and optional customer-created formula name.
• Use accurate terminology for the actual preparation. Historical files noted that some products called 'tinctures' were coconut-oil extractions; do not call a non-alcohol extraction an alcohol tincture.
• Carry the full custom configuration into cart, checkout, order record, confirmation, admin, and fulfillment.
6. Custom Soap Builder
• Keep the Soap Builder separate from the Herbal Allies Quiz but connected to the same catalog/cart/order architecture.
• Mobile-first multi-step guided wizard; do not overwhelm customers with a giant form.
• Current desired choices include intention/skin experience where appropriate, sensitivity profile, base, botanicals/add-ins, ingredients to avoid, exfoliation, aroma/scent family, essential oil/fragrance choice when accurate, natural color, layer/design, shape, size, decorative topping, gift packaging, custom name, notes, quantity, and final visual/itemized summary.
• Preserve the recognizable layered soap language and approved real soap imagery. Historical construction descriptions referenced a transparent botanical layer and creamy goat-milk/shea layer where accurate.
• Show selected choices and calculated price before Add to Cart.
• Persist exact customization through cart, checkout, email, admin, and fulfillment.
• Use one shared cart; never create a competing soap-only cart/order system.
7. Shop & Product Catalog
• Dedicated Shop with categories and filters; homepage shows a curated subset only.
• One canonical product dataset must govern product IDs, variants, prices, SKUs, ingredients, images, descriptions, claims status, SEO fields, publication status, inventory/availability, and related content.
• Do not independently maintain competing production JSON/CSV/XLSX copies. Exports are generated artifacts from the canonical data source.
• Product pages should include real/approved imagery, concise compliant copy, fuller mystical description, ingredients/key botanicals when known, variants/size, price from canonical data, Add to Cart, safety/cautions as needed, related Herb & Ingredient Library entries, genuine reviews where available, related articles/rituals, and FAQs.
• Preserve the catalog voice and useful named sections from prior work where they fit: The Offering, Signature Details, The Enchantment, Suggested Ritual.
• Use Amber's actual product photographs where available; crop/optimize appropriately. Distinguish AI concept art from photographs of the shipped product.
• Do not silently invent missing ingredients, prices, certifications, sourcing claims, effects, or product photography.
7.1 Latest explicitly stated variant/pricing updates to preserve
• Balms and tincture/oil-style variants: $11.77 per ounce where Amber's latest catalog instruction applies; sizes referenced include 1 g lip-balm format, 1 oz pocket size, 2 oz, 3 oz, and 4 oz amber glass packaging.
• Soaps: Small Rose — 2 oz — $4.77; Medium Rose — 3 oz — $8.44; Large rectangular with waves — 4 oz — $11.77; Large circular with flowers — 4 oz — $11.77; Plain rectangular — 3 oz — $7.44.
• Later product/catalog files contain other capsule and product prices that conflict with older March/May pricing. The implementation must reconcile the newest approved master catalog before publishing; never guess.
7.2 Named product families accumulated across conversations
• DreamEase / Dream Ease
• Vital Vitality / newer capsule naming where approved
• Immune-at-Ease
• Natural Collagen Rebuilder
• Hair Regrowth Serum (public claims must be compliant even if legacy name remains)
• Age Reversal Beauty Balm / Amber's Age Reversal Balm naming to be reconciled against current catalog
• Ultimate Pain Balm / legacy pain-relieving naming to be reviewed for compliant public presentation
• Custom teas, capsules, balms/oil preparations, soaps, bundles, and ritual products
• Newer capsule names referenced: Vital Connect, Sacred Balance, Chill Pill, Vital Flow, Happy Pill
• Bundles historically referenced around Sleep, Stress, Gut, Pain, Hormone, Hair, and Energy; publish only currently approved/fulfillable bundles.
8. Living Grimoire
• Living Grimoire is a premium living knowledge experience distinct from the public Facts & Articles and Herb & Ingredient Library.
• Current membership price: $7.77/month.
• Benefits historically confirmed/requested include 10% storewide discount, monthly articles/rituals, exclusive recipes/DIY, early access, personalized recommendations, subscriber gifts, and member-specific offers/shipping treatment where currently configured.
• Essential safety information must never be hidden behind the paywall.
• Membership state should drive account entitlements and premium-content access server-side.
• Provide clear cancellation/manage-access instructions.
• Do not expose locked premium content, subscriber lists, bypass tokens, or admin logic in browser source.
• Historical implementations referenced public preview pages 1–7 and premium page 8 onward. Preserve this only if it still matches the current Grimoire content model; the price/entitlement rules matter more than obsolete page numbering.
9. Awaken With Amber Services
• Present services as a coherent companion ecosystem rather than unrelated cards.
• Services accumulated across conversations include hypnotherapy, tarot, runes/combined readings, house/aura/space cleansing, energy work, Energy4Life voice scan, custom-remedy guidance, past-life regression, and guided meditations.
• Each service page should explain what to expect, boundaries/disclaimers, booking CTA, related educational content, and relevant products/rituals without unsupported medical or guaranteed spiritual outcomes.
• Keep homepage service content compact; use dedicated service pages for depth.
• Booking links changed historically. Do not hardcode an old Google Calendar URL without checking the current approved booking destination.
10. Lunna Customer Experience
• Preserve the Lunna/Luna site assistant concept. Standardize the spelling in implementation once the current branded spelling is confirmed from the live project; recent Amber references use 'Lunna'.
• Lunna should be dismissible, educational, privacy-conscious, warm, helpful, and non-diagnostic.
• She should answer site/product/content questions from approved knowledge, explain quiz recommendations, help visitors find products/articles/services, and escalate order, safety, policy, or unresolved issues appropriately.
• Customer-support resolutions that are broadly useful may become reusable FAQ/SOP knowledge after review.
• Lunna must not invent ingredients, product availability, order status, medical advice, discounts, or policy.
11. Accounts, Favorites & Personalization
• Passwordless account experience has been requested in later architecture, along with saved content/favorites, order history, membership status, recommendations, email preferences, saved carts, and subscriber resources.
• Anonymous browsing should transition smoothly into quiz, cart, account creation, membership, and returning-customer personalization.
• Marketing consent must be separate and unchecked by default.
• Do not collect more sensitive health information than necessary for general product preferences/safety cautions.
12. Commerce, Cart & Checkout
• One cart should work across standard products, variants, custom remedies, custom soaps, memberships, services/digital items where purchasable.
• Historical implementation uses local cart state key `aa_cart`; retain only if the current codebase still uses it as the canonical client cart interface.
• All prices, discounts, shipping, taxes, membership benefits, and final totals must be recalculated/validated server-side from canonical data. Never trust browser-submitted totals.
• Checkout should be entered through the cart flow rather than exposed as a primary navigation destination.
• Orders need explicit statuses, payment verification, confirmation, admin visibility, fulfillment state, and failure/recovery handling.
• Direct/manual payment orders must not be marked paid until verified.
12.1 Payment-history conflict ledger
Payment architecture changed repeatedly across the project. This is exactly the kind of historical conflict that must not be flattened into one instruction:
• May 2026 builds referenced Stripe and later Shopify-first checkout.
• September 11 master implementation referenced PayPal as integrated processor plus Cash App and feature-flagged Venmo, while removing Stripe/Shopify/Square/Gumroad/Klarna/Afterpay.
• Later Amber instruction in memory states 'Only Cash App and Venmo' and to remove Stripe/Shopify/PayPal/Square, with Cash App $AmberPatten92 and Venmo handle to be verified before launch.
• Therefore the CURRENT REQUIREMENT is: do not reactivate a legacy processor because it appears in an old prompt. Audit the live site and use Amber's newest explicit payment decision. Cash App destination is $AmberPatten92. Venmo must not be published until its exact current handle/link is verified.
13. Shipping, Promotions & Customer Benefits
• Shipping expectation historically stated as 3–5 business days where accurate.
• Latest broad stored rule: free shipping at $100 general and $75 for subscribers. Older site/cart files used a $75 general threshold. Treat the newer explicit rule as current unless Amber changes it again.
• First-time free gift was requested historically; only advertise if currently fulfillable.
• Living Grimoire member discount: 10% storewide.
• Do not expose private promo codes publicly unless Amber explicitly intends them to be public.
• Policies for shipping, returns/refunds, damaged items, subscription terms, privacy, and contact should be linked clearly.
14. Search & Discovery
• Visible site-wide search is required.
• Search should cover products, herbs/ingredients, articles, rituals, meditations, services, FAQs/help, and accessible Grimoire metadata/content according to entitlement.
• Search updates when catalog/content/botanical records change.
• Use useful filters and mobile-friendly search behavior.
• Monitor broken links, orphan pages, search failures, and missing results.
15. SEO, AEO & Indexing
• Human-readable URLs, canonical URLs, XML sitemap, robots.txt, redirects, unique titles/descriptions, Open Graph/social metadata, breadcrumb schema, Product/Offer/Article/FAQ/Organization schema and other schema only when accurate.
• Person schema for Amber and LocalBusiness schema only when factual/applicable.
• Descriptive filenames and alt text; crawlable copy outside images; image sitemap where useful.
• Noindex admin, account, cart, checkout, previews, internal search, and duplicate filter/faceted pages as appropriate.
• Search Console, structured-data validation, Core Web Vitals monitoring, broken-link monitoring, and index coverage checks.
• Amber asked to get the herbal index into Wikipedia/search-engine discovery. Implement this ethically through strong indexable botanical pages, citations, schema, sitemaps, Search Console/IndexNow where supported, legitimate references/outreach, and Wikipedia/Wikidata only when editorial/notability/conflict-of-interest rules genuinely allow it. Never fabricate Wikipedia placement.
16. Accessibility, Mobile UX & Performance
• Target WCAG 2.2 AA.
• Proper heading hierarchy, real buttons, keyboard access, visible focus, labels/errors, modal/cart focus management, Escape behavior, descriptive alt text, sufficient contrast, reduced-motion support.
• Test navigation, quiz, remedy builder, soap builder, Grimoire, cart, account, search, and checkout on small screens.
• No hidden purchase buttons, clipped controls, overflowing drawers, unreadable text, or sticky controls blocking content.
• Optimize images, lazy-load below the fold, defer nonessential JavaScript, remove duplicate handlers/scripts, and preserve music without harming load performance.
17. Compliance, Trust & Content Safety
• Remove or soften disease-treatment/cure/prevention/reversal/diagnosis claims, guarantees, unsupported hormone/neurotransmitter claims, conventional-medication comparisons, and undocumented purity/certification/sourcing claims.
• Preferred framing includes traditional-use/supportive language, self-care/ritual language, 'may support general wellness', and clear variability/disclaimer context.
• Product names themselves may require review if they imply drug-like outcomes; do not assume a disclaimer cures an otherwise misleading claim.
• Use ingredient/allergen visibility, patch-test guidance for topicals, and pregnancy/breastfeeding/medication cautions for ingestible or interacting botanicals as relevant.
• Only real, traceable, permission-approved testimonials/reviews.
• Do not claim HIPAA compliance.
• Protect secrets, webhook URLs, private order data, payment proof, locked content, and customer data.
18. Admin Command Center
• Mobile-friendly owner/admin surface for orders, messages, analytics, catalog/product status, content status, memberships/subscribers, inventory, SEO/indexing, quiz/recommendation rules, agent approvals, workflow health, and incidents.
• CSV imports were requested for orders/subscribers/membership where appropriate.
• Privileged access should use least privilege, role checks, audit logs, session controls, and protected owner/super-admin authority.
• Historical database work referenced `profiles.is_super_admin`; preserve the capability concept but verify the actual current schema before coding against that exact field.
• High-impact actions—payment destination changes, DNS, production deploys, bulk email, database migrations, role escalation, destructive catalog edits—require explicit owner approval.
19. Canonical Technical Model
• Git is the controlled source for application code/static content.
• Production database is the source for customer, order, membership, workflow, approval, and operational state.
• One canonical product source governs commerce; exports are generated from it.
• Botanical Knowledge Graph and Content Graph provide relationships for search, recommendations, related content, quiz explanations, and SEO.
• Secrets stay server-side in approved environment/secret storage.
• Use preview/staging before production, automated tests, rollback points, audit logs, and human approval gates.
• Do not assume an old stack is current. Historical files reference Netlify, Supabase/Postgres, Vercel, Shopify, PayPal, and a later Coolify migration. The first implementation step is always a reality audit of the live deployment.
19.1 Repository / hosting chronology
Area
Current source of truth
Status
Supersedes / note

Repository
Latest user-confirmed work referenced `awakenwithamber/ambers-alchemy-apothecary`; older Sept 16 agent spec also referenced `awakenwithamber/awakenagain-com`.
VERIFY LIVE BINDING
Do not move/merge until the actual production Git binding is identified.

DNS/domain
AwakenAgain.com; domain purchased/managed through Cloudflare.
CURRENT
Cloudflare DNS does not itself determine the hosting platform.

Hosting
Netlify was explicitly confirmed; later Coolify migration work began.
DECISION / VERIFY
Do not assume the migration completed.

Database/auth
Recent architecture repeatedly references Supabase/Postgres and RLS.
VERIFY LIVE
Inspect production env/schema before migration.

Checkout
Newest explicit Amber preference: Cash App + Venmo only; legacy processors appear in older builds.
CURRENT WITH VENMO VERIFY
Do not reactivate old processors from legacy code.

20. Agentic Operating System
20.1 Orchestrator / Farah
Farah is the coordinating layer for AwakenAgain.com: read goals/current state/analytics/task queue, decompose work, assign specialized agents, preserve successful knowledge, identify failures, propose the next highest-leverage experiment, and require human approval for consequential production actions.
20.2 Specialized agents
• Catalog Curator — canonical products, variants, ingredients, SKUs, pricing, imagery, availability, publication state and exports; flags conflicts instead of overwriting.
• Botanical Research & Safety Agent — botanical records, source quality, traditional-use language, contraindications, claim risk, citation freshness.
• Content & Internal-Linking Agent — articles, formula explainers, rituals, FAQs, service education, related-content relationships.
• SEO / Indexing Agent — metadata, canonicals, schema, sitemaps, robots, alt text, broken links, indexing and ethical outreach.
• Quiz & Recommendation Agent — approved explainable rules, safety exclusions, combined/separate remedy configuration; never invents ingredients.
• Commerce QA Agent — cart, variants, discounts, membership pricing, shipping, checkout, receipts, order creation and recovery.
• UX / Accessibility Agent — mobile layout, visible controls, tap targets, contrast, forms, navigation, search and accessibility regressions.
• Media & Asset Agent — product photos, botanical images, concept art, audio, meditations and alt text; prevents concept imagery being passed off as product photography.
• Customer Experience Agent / Lunna — approved knowledge, recommendation explanations, navigation and escalation.
• Analytics & Experiment Agent — acquisition, search, quiz completion, product views, conversion, membership and content engagement; proposes experiments rather than auto-publishing them.
• Release Guardian — tests, config conflict detection, secret/migration checks, release notes, rollback plan, deployment gates and post-release verification.
21. Core Automated Workflows
1. Product update: owner/import → Catalog Curator validates → Botanical/Safety reviews claims and ingredients → Media Agent validates imagery → SEO prepares metadata/schema → preview build → Commerce QA tests variants/cart → owner approval → Release Guardian publishes → sitemap/index refresh → analytics annotation.
2. New article: topic opportunity → research/sources → draft → safety/claim review → connect botanicals/products/formulas → internal links → SEO/schema → preview → owner approval → publish → index → measure engagement and downstream actions.
3. Quiz to cart: customer goals + combined/separate choice → recommendation rules + safety constraints → explain herbs/reasons → remedy configuration → server validation → shared cart → checkout/payment workflow → order record → confirmation.
4. Membership: join Grimoire → payment/membership verification → account entitlement → 10% benefit and other configured member benefits → premium access → renewal/failure/cancel events → customer communication → admin status.
5. Broken-site recovery: synthetic/health check → Release Guardian isolates affected route/function → compare last known good release → fix branch → tests → preview → approval → deploy → post-deploy verification → incident log.
6. Search/index: catalog/content/botanical change → update search index → regenerate sitemap/schema where needed → canonical/robots checks → supported index submission → monitor errors/orphan pages.
7. Customer support: question → Lunna retrieves approved knowledge/order-policy context → answer or route → unresolved issue becomes admin task → reviewed resolution may become FAQ/SOP.
8. Continuous improvement: Analytics Agent reviews signals on schedule → prioritized hypotheses → Amber selects → agents create preview experiment → QA → approval → release → measurement → retain or roll back based on evidence.
22. Farah Growth Studio — Preserved Mission
• Coordinate approved AI services, APIs, MCP tools, analytics, databases, websites and automations rather than acting as a content generator only.
• Research opportunities; develop hypotheses; create campaigns/assets; build supporting software/automations; test variations; measure performance; identify failures; improve; preserve successful knowledge; recommend the next highest-leverage experiment.
• Primary business is AwakenAgain.com unless Amber explicitly identifies another project.
• Do not silently publish experiments or make irreversible business/infrastructure changes.
23. Release & QA Gates
• Syntax/lint/type checks as appropriate to detected stack.
• Unit, integration and end-to-end tests.
• Accessibility tests and mobile review.
• Image-path/product-image validation.
• Link checks, SEO checks, structured-data validation.
• Secret scanning, dependency/security audit, license checks.
• Build and deploy preview.
• Cart persistence, product/variant integrity, membership entitlements, quiz regression, remedy-builder regression, soap-builder regression, email delivery, role-permission tests, and rollback rehearsal.
• Full customer journey test from discovery/quiz/product through order/payment confirmation and fulfillment state.
• No production release while critical cart, checkout/payment, subscriber access, mobile, security, or data-integrity tests fail.
24. Historical Requirements & Supersession Ledger
Area
Current source of truth
Status
Supersedes / note

Homepage density
Curated gateway with dedicated deep pages.
CURRENT
Supersedes all-in-one long homepage.

Education naming
Facts & Articles + Herb & Ingredient Library.
CURRENT
Supersedes ambiguous Herbal Wisdom/Herbal Knowledge and separate Herb Encyclopedia/Ingredient Library.

Quiz herb swapping
Explain recommendation; no arbitrary swap control.
CURRENT
Supersedes May test language that allowed editing recommendations.

Combined vs separate remedies
Decision occurs during quiz before results.
CURRENT
Supersedes post-result decision.

Living Grimoire price
$7.77/month.
CURRENT
Supersedes older $3.33 references.

Soap prices
Use Sept 23 explicitly stated size/shape prices.
CURRENT
Supersedes older $5.99/$8.99/$12.99 set and older per-ounce builder assumptions where conflicting.

Balm/tincture variants
$11.77/oz rule and latest sizes where applicable.
CURRENT
Supersedes older Ultimate Pain Balm variant prices when the same item/variant conflicts.

Shipping
$100 general / $75 subscriber latest stored rule.
CURRENT
Supersedes older $75-general implementation unless Amber changes it.

Payments
Cash App + Venmo only is newest explicit preference; Venmo exact handle must be verified.
CURRENT
Supersedes Stripe, Shopify, PayPal, Square references in older prompts.

Cash App
$AmberPatten92.
CURRENT
Supersedes legacy $AmberAlchemy.

Hosting
Netlify historically confirmed; Coolify migration later initiated.
VERIFY
Do not assume migration completion.

Repository
`awakenwithamber/ambers-alchemy-apothecary` was later explicitly identified as correct repository.
LIKELY CURRENT / VERIFY BINDING
Supersedes older candidate repository assumptions unless live production proves otherwise.

Botanical imagery
Correct unique botanical imagery for each herb.
CURRENT
Supersedes generic/repeated imagery.

Reviews
Only genuine/traceable/permission-approved.
CURRENT
Supersedes any fabricated/unsupported review labels.

Site search
Visible, accessible, ecosystem-wide search.
CURRENT
Newer explicit requirement.

Agent autonomy
Autonomous for reversible/low-risk analysis; approval gates for consequential production actions.
CURRENT
Prevents silent destructive automation.

25. Prompt Library — Canonical Prompt for Implementation Agents
Use the following as the top-level handoff prompt. Specialized prompts should inherit these rules rather than contradict them.
You are the coordinated engineering, content, commerce, SEO, accessibility, QA, automation and operations team for AwakenAgain.com, Awaken With Amber LLC, and Amber's Alchemy Apothecary.

Treat 'Amber's AwakenAgain.com Master Source of Truth — 26 September 2026' as the human requirements authority.

FIRST: audit reality. Identify the actual production repository and branch, Netlify/Coolify/other deployment binding, domain/DNS configuration, database/auth provider and schema, canonical product dataset, current payment path, environment variables by NAME only, live content routes, working integrations, and current production behavior. Do not make destructive changes while those facts are unresolved.

RECONCILIATION RULES:
1. Newer explicit Amber instructions override older conflicting instructions.
2. Do not reactivate legacy payment providers, hosting assumptions, prices, repositories, or workflows merely because old code contains them.
3. Never invent product ingredients, prices, sourcing/certification, customer reviews, medical claims, botanical facts, images, order state, or business settings.
4. Preserve the mystical botanical identity, consent-based audio, Herbal Allies Quiz, Living Grimoire, Lunna, product catalog, builders, services, customer/account features, search and content ecosystem unless a current requirement explicitly replaces a behavior.
5. One source of truth per business concept. Flag conflicts.
6. Human approval is required for production deployment, DNS, payments, database migrations, destructive data changes, bulk email, privileged role changes, and other consequential actions.

BUILD THE CURRENT EXPERIENCE:
- curated mobile-first homepage;
- Shop and canonical catalog;
- Facts & Articles;
- Herb & Ingredient Library / botanical knowledge graph;
- Herbal Allies Quiz with explainable recommendations and combined-vs-separate remedy choice before results;
- custom remedy builder and custom soap builder;
- Living Grimoire at $7.77/month with configured member benefits;
- Awaken With Amber services;
- Lunna customer experience;
- accounts, favorites, orders, membership, email preferences and personalization;
- ecosystem-wide search;
- owner/admin command center;
- compliant SEO/AEO/schema/indexing;
- accessibility, performance, security, analytics and auditability.

AGENT SYSTEM:
Farah orchestrates Catalog Curator, Botanical Research & Safety, Content/Internal Linking, SEO/Indexing, Quiz & Recommendation, Commerce QA, UX/Accessibility, Media & Assets, Lunna/Customer Experience, Analytics & Experiments, and Release Guardian.

WORKFLOW:
research/audit → validate → create/repair → connect → preview → automated tests → owner approval where required → deploy → post-deploy verification → measure → improve.

DELIVERY:
Return the audit, conflicts, chosen canonical sources, implementation plan, changed files, tests, unresolved decisions, rollback method and exact next step. Do not merely describe work when the environment allows implementation. Never claim production success without evidence.
26. Implementation Roadmap
1. Reality map: audit live Git binding, deployment, DNS, database/auth, canonical catalog, payment configuration, environment names, integrations and production branch.
2. Data reconciliation: compare current master product JSON/catalogs, variants, recipes/ingredients, imagery, services, botanical records and membership rules. Produce a conflict report; designate canonical records.
3. Knowledge graph + unified search: botanical/product/article/ritual/meditation/service/membership relationships and search indexes.
4. Information architecture: implement the curated AWAKEN hub navigation and dedicated deep-content routes.
5. Commerce/account completion: canonical variants, cart, current payment rules, orders, receipts/notifications, member benefits, favorites, passwordless account and email preferences.
6. Agent layer: begin read-only; then preview-writing; then narrowly approved production actions with audit logs and approval gates.
7. QA/launch: mobile/device matrix, accessibility, performance, SEO/schema, forms, search, account/auth, commerce, membership, email, security, backup/rollback, monitoring.
8. Continuous improvement: analytics-led experiments with explicit hypotheses, preview testing, Amber approval, measurement and documented keep/rollback decisions.
27. Recent File Families to Reconcile
• `products.master.final.json` and `products.master.corrected (3).json` — compare field-by-field; do not assume the filename 'final' means newest/correctest.
• `AwakenAgain_True_Master_Catalog.zip`, `AwakenAgain_Portable_Master_Catalog_UPDATED.zip`, `AwakenAgain_Master_Catalog.docx`, updated master catalog spreadsheets, automation product JSON, Shopify-oriented exports, and source master PDFs — treat as candidate source material and reconcile to one canonical catalog.
• `AWAKENAGAIN_MASTER_IMPLEMENTATION_PROMPT(1).md` — strong Sept 11 enterprise/audit/QA architecture, but its payment and some deployment assumptions may be superseded.
• `AWAKEN-NETWORK-MASTER-FINALIZING-AGENT.md` — useful Sept 16 agent/database/Grimoire architecture, but repository/payment assumptions must be reconciled against later Amber decisions.
• `AwakenAgain_Master_Fix_Prompt_May_24_2026.*` and May 25 corrected prompt — valuable preservation, homepage, cart, quiz, builder, compliance and QA requirements; payment/pricing/booking details are historical unless reaffirmed.
• `AMBERS_UPDATES_AwakenAgain_2026-09-16_to_2026-09-25.docx` — useful recent consolidation, but replaced by this all-history source-of-truth document.
• Product Image Library and recent botanical/site assets — preserve and map to canonical records; validate that each image actually represents the associated item/herb.
28. Do-Not-Lose Checklist
• Mystical botanical identity and atmospheric entry.
• Consent-based audio and original music/tone experience.
• Herbal Allies Quiz and personalized explanations.
• Combined-vs-separate remedy choice before results.
• Build-a-remedy flow into cart.
• Custom Soap Builder.
• Shop by Goal.
• Public Facts & Articles.
• Public Herb & Ingredient Library with correct botanical images.
• Living Grimoire $7.77 membership.
• Lunna.
• Awaken With Amber services and booking path.
• Site-wide search.
• Favorites/saved content, accounts, orders, membership state and email preferences.
• Mobile-first layouts with every button visible/functional.
• Real product photography where available.
• Canonical product/catalog data and latest variants.
• Admin dashboard/command center.
• SEO/AEO/schema/indexing and internal knowledge relationships.
• Compliance review for copy and imagery.
• Farah + specialized agents + human approval gates.
• Testing, preview deployment, rollback, monitoring and continuous improvement.
29. Decisions That Must Be Verified Against Live Reality Before Coding
• Did the Coolify migration actually replace Netlify, or was it only started?
• Which GitHub repository is currently bound to production?
• Which product master is the current canonical dataset after the Sept 23–24 catalog work?
• What exact Venmo business handle/link is currently approved?
• Is any integrated card/payment processor still intentionally active, or should production now expose only Cash App + verified Venmo?
• What database/auth schema is actually live (including whether `profiles.is_super_admin` exists)?
• What is the current approved booking URL? Historical conversations contain more than one Google Calendar link.
• Which product names/prices in the latest master catalog supersede older named/priced products?
• Which membership shipping/free-gift benefits are currently operational rather than merely planned?
30. Definition of Done
AwakenAgain.com is not 'done' merely because pages render. It is done for a release when the experience feels unmistakably AWAKEN; the information architecture is understandable; every visible control works; product/botanical/content data is internally consistent; quiz/builders/cart/account/membership/search are connected; claims and reviews are credible; mobile/accessibility/security tests pass; search engines can understand the content; the admin can operate the business; agents can assist without silently changing protected systems; and the release can be rolled back safely.
Document status: replaces the limited Sept 16–25 'Amber's Updates' consolidation as the broader historical source-of-truth. It should continue to be versioned when Amber gives new explicit requirements.
