---
name: release-gate
description: Runs the pre-release checks from Master Source of Truth §23 and returns PASS/FAIL per gate. Any FAIL blocks the release. Use before release-manager merges or deploys anything.
---
<!-- Authored by Claude on 2026-09-28 from MSoT §23. This skill was referenced by the
     uploaded agents (release-manager, qa-tester, site-health, seo-page, add-herb-entry)
     but was not part of the upload. Amber: replace it if you have your own version. -->

Run from the repo root. Report each gate as PASS / FAIL / NOT RUN with the actual output — never
"zero errors" or "100% compliant". Do not run `netlify deploy` or change production settings here.

## Automated gates (all must PASS)
1. **Syntax** — `node --check` on every changed `.js`/`.mjs` file (the site has no build step or linter).
2. **Unit/integration tests** — `node --test tests/*.test.mjs` → 0 fail.
3. **Locked invariants** — `node scripts/check-locked.mjs` → 0 FAIL (audio sha256, Grimoire gating,
   banned processors / `$AmberAlchemy`, no autoplay).
4. **Secrets** — `node scripts/scan-secrets.mjs` → 0 FAIL. Report file:line + pattern name only.
5. **SEO / structured data** — `node scripts/audit-seo.mjs` → 0 FAIL (WARNs listed, not blocking).
6. **Compliance copy** — `node scripts/audit-compliance.mjs` → 0 FAIL; every WARN gets a human read
   by the `compliance-reviewer` agent.
7. **Config** — `netlify.toml` parses (`python3 -c "import tomllib;tomllib.load(open('netlify.toml','rb'))"`),
   the `/*` catch-all is the last redirect, and every forced 404 sits above it.
8. **Dependencies** — `npm audit --omit=dev` reviewed; no new dependency added without approval.

## Manual / preview gates (record who checked and how)
9. Deploy preview builds (release-manager pushes the branch; Netlify builds it — never deploy by hand).
10. Mobile review and accessibility pass (keyboard, focus, contrast, alt text) on changed pages.
11. Image paths resolve; each product/herb shows its own correct image.
12. Link check on changed pages; canonical and sitemap entries match.
13. Regression: cart persistence, product/variant prices (server totals), quiz, remedy builder, soap
    builder, membership entitlement, role permissions.
14. Payments: Stripe test-mode card order → webhook marks paid; Cash App / Venmo orders stay
    `awaiting_manual_payment` until Amber confirms. Email delivery only claimed when the provider accepted it.
15. Full customer journey: discovery/quiz/product → cart → order/payment confirmation → fulfilment state.
16. Rollback rehearsal: name the commit to revert.

## Blocking rule
No production release while any cart, checkout/payment, subscriber-access, mobile, security or
data-integrity gate FAILs or is NOT RUN. Report the result to `release-manager`.
