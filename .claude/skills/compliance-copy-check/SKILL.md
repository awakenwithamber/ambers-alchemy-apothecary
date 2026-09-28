---
name: compliance-copy-check
description: Make website, product, email, and article wording legally compliant (FDA supplement disclaimer, cosmetic-only wording for soaps/balms/serums, disease-claim removal, subscription auto-renewal terms, CAN-SPAM unsubscribe footers, truthful social proof). Use whenever copy is written or changed, or for a full-site compliance sweep.
---
# Compliance copy check
Reference texts, word lists, and templates: `REFERENCE.md` (same folder). Read it first.

## Sweep procedure
1. `node scripts/audit-compliance.mjs --json > /tmp/compliance.json` — baseline.
2. For each FAIL: fix now. For each WARN: add or update an entry in `data/claims-registry.json` with a treatment.
3. Apply risk-reducing rewrites directly (qualify / reframe / remove) → status `applied-pending-review`. Never add a benefit; never mark `approved`; never invent evidence.
4. Apply the mandatory items everywhere they belong (REFERENCE §1–§4): FDA disclaimer beside supplement claims + footer; cosmetic wording on body products; subscription terms + unchecked consent + confirmation email + online cancel; marketing-email headers, footer, postal address, suppression.
5. Classify every catalog product as supplement / cosmetic / bundle / digital / service; fix category–type mismatches so the right rules apply. Bundles containing both follow both rules per item.
6. Policy layer: ensure Privacy, Terms, Shipping, Returns & Refunds, Accessibility, Disclaimer, Contact pages exist from REFERENCE §6, marked *Draft — owner/attorney review* until Amber approves, and are linked in every footer.
7. Re-run until 0 FAIL. Produce/refresh `docs/COMPLIANCE-AUDIT.md`: page/product · check · pass/fail · fix applied · pending item. Blocked-on-Amber items listed separately — never marked pass.
8. Hand the diff to `compliance-reviewer` for a human-judgment pass (implied claims the regex misses).

Honesty rule: report "0 audit failures, N pending review", never "100% compliant". Automated screening is not legal review.
