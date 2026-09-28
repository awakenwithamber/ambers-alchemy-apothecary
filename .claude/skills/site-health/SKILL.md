---
name: site-health
description: Diagnose and fix whatever the weekly site-health email or a failing check reports — broken URLs, missing meta, leaked Grimoire text, audio hash, webhook, disclaimers, expired claim reviews, catalog/page price mismatches. Use when Amber forwards the health report or says "something's broken".
---
# Site health
1. Reproduce locally: `node scripts/check-locked.mjs`, `audit-compliance.mjs`, `audit-seo.mjs`, `node --test tests/*.test.mjs`; against production, the same checks the scheduled function runs (`netlify/functions/site-health-weekly.mjs` exports `runHealth(site)`).
2. Also check: claims past `review_date` in `data/claims-registry.json`; prices in HTML vs catalog; images 404; forms responding; Stripe webhook rejecting unsigned requests; Grimoire endpoint returning 401 anonymously.
3. Triage by severity: payments/Grimoire leak/audio → fix first; compliance FAIL → next; SEO → next.
4. Fix only what's broken (inspector → approval → build). Anything needing Amber (env, DNS, Netlify, Stripe dashboard) goes in **Needs your action** with exact steps.
5. `release-gate` → `release-manager`.
