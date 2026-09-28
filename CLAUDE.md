# AwakenAgain.com

Mystical/wellness e-commerce for Awaken With Amber LLC — Amber's Alchemy Apothecary (herbal soaps, balms/oil preparations, serums, capsules, teas, custom formulations) plus the Living Grimoire subscription, services, and botanical education. Voice: mystical but clean, reverent about tradition, careful about claims.

Requirements authority: *Amber's AwakenAgain.com Master Source of Truth — 26 September 2026*. Newer explicit instructions from Amber override older conflicting ones; old code is not a requirement. Audit reality before changing anything (`inspector` agent first).

## Invariants

Agents in `.claude/agents/` cite these by number.

1. **Payments.** Stripe embedded card checkout is primary (reinstated September 2026 and reaffirmed 28 September: "Stripe, Cash App and Venmo should be the checkout"). Cash App `$AmberPatten92` and Venmo are manual: the order stays *Awaiting Payment* until Amber verifies it, and the order number goes in the payment note. The Venmo link must be verified by Amber. PayPal buttons stay hidden while the account is restricted; leave that code in place. Never introduce Shopify checkout, Square, Gumroad, Klarna, Afterpay, or the old `$AmberAlchemy` cashtag. The client sends item ids and quantities only; the server recalculates every total. Orders become paid only through the signature-verified Stripe webhook, never from the browser or return page. No secrets or card data client-side.
2. **Locked audio.** `public/audio/awaken-ambient.mp3`, sha256 `57b069dd15f9faab06cc8f951f83cd5174b9d34c1b13423a85290729ccbbacf7`. The hash is the test. Never re-encode, trim, normalize, convert, rename, add a fallback format, or substitute. Loops with a fade-in; tones at 333/444/777/134 Hz, gain 0.008; opt-in modal, no autoplay; no physiological claims about the tones.
3. **Grimoire.** Access validated server-side only. Pages 1–7 free; 8–88 need an active $7.77/month subscription or the admin email; manual payers get a 30-day pass that does not auto-renew. Gated content never appears in page source, the search index, or client JSON. Safety information is never paywalled. The public Herb & Ingredient Library stays separate from the paid Grimoire.
4. **Stack & config.** Static HTML/CSS/JS, no framework — do not migrate. Netlify; `netlify.toml` is the only build/redirect source of truth (it sets `base`, an empty `command`, and `publish`, overriding the UI). Functions live in `netlify/functions/*.mjs`. Cloudflare DNS, A record unproxied to Netlify. Resend for email. No new dependencies, no build-step additions, no Edge Functions unless asked. Never commit an `.npmrc`.
5. **Images.** Relative `/images/products/` paths only. Never Google Drive, Dropbox, googleusercontent, or absolute URLs. `js/image-fallback.js` covers gaps — do not source replacements or generate illustrations. Never pass concept art off as product photography.
6. **Content & compliance.** Botanical content is educational: "traditionally used to support…", never treats, cures, heals, or prevents. FDA disclaimer on every page carrying botanical content and beside supplement claims; cosmetic wording for body products (see `.claude/skills/compliance-copy-check/REFERENCE.md`). Retired terms stay retired: age reversal, miracle, hair regrowth, parasite cleanse, heavy metal detox, diabetic, blood sugar, PTSD, bipolar. Light magic only — no curses, hexes, or harm-intent content; binding only when protective, self-directed, or consensual. Only real, permission-approved reviews. Never invent product facts, ingredients, prices, citations, herbal properties, or safety information; stop and ask. Do not claim HIPAA compliance.
7. **Secrets & data.** Secrets live only in Netlify environment variables; report variable names, never values. Nothing secret in frontend code, Git, HTML, client JSON, model prompts, or logs. No health free-text or PII in logs or AI prompts.
8. **Approval gates.** Production deploys, DNS, payment destinations, database migrations (roll forward only; never edit an applied migration), bulk email, role changes, and destructive data changes need Amber's explicit approval.

## Navigation taxonomy (Master Source of Truth §2.1)

Home · Shop · Services · Facts & Articles · Herb & Ingredient Library · Herbal Allies Quiz / Build a Remedy · Living Grimoire · Meditations & Rituals · About · Favorites · Account · Help / FAQ · Search · Cart. Checkout is reached from the cart, not the nav.

## Current catalog rules

- Soaps: Small Rose 2 oz $4.77 · Medium Rose 3 oz $8.44 · Plain Rectangular 3 oz $7.44 · Large Rectangular with Waves 4 oz $11.77 · Large Circular with Flowers 4 oz $11.77.
- Balms and oil-style preparations: $11.77 per ounce.
- Free shipping: $100 general, $75 for verified members.
- Living Grimoire: $7.77/month, 10% member discount.

## Where things actually live

The agent and skill files use some paths that differ from this repo. Use the actual paths.

| Referenced by agents | Actual in this repo |
|---|---|
| `netlify/lib/catalog-data.mjs` (server prices) | `lib/catalog.js` |
| canonical catalog JSON | `data.js` / `products-updated.js` (display) priced from `lib/catalog.js`; a single canonical JSON is still to be designated (Master Source of Truth §27) |
| `netlify/lib/grimoire-private-pages.mjs` | not built — Grimoire gating is still client-side and the premium pages are an empty placeholder |
| `_redirects` | `netlify.toml` redirects (there is no `_redirects` file) |
| `node scripts/check-locked.mjs`, `audit-compliance.mjs`, `audit-seo.mjs`, `scan-secrets.mjs` | present in `scripts/` |
| `tests/*.test.mjs` | present in `tests/` (`node --test tests/*.test.mjs`) |
| `release-gate` skill | `.claude/skills/release-gate/SKILL.md` |
| `data/claims-registry.json` | present (starts empty) |
| `netlify/functions/site-health-weekly.mjs` (named by the site-health skill) | not built — run the `scripts/` checks by hand |
| database | Netlify Database (`@netlify/database`, migrations in `netlify/database/migrations/`). Older docs name Supabase; that conflict is open for Amber |

## Working style

Amber works from a phone and routes work through agents. Inspect and report first, then stop for approval. Build only what was scoped — no refactors, no adjacent improvements. Report with a diff per file, `git show --stat HEAD`, the commit SHA, and what you did not do. Never claim "zero errors" or "100% compliant" — say "0 audit failures, N items pending review".
