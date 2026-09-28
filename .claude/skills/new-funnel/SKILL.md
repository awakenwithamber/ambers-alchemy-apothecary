---
name: new-funnel
description: Build a conversion funnel (landing page + quiz + recommendation + offer + follow-up email + analytics) from the reusable template. Use for Sleep Ritual, Herbal Beginner, Botanical Gifts, or any new product funnel.
---
# New funnel
Config file `funnels/<slug>.json`: audience, promise (compliant), offer handles (from catalog), quiz questions, scoring rules, hard exclusions, email sequence ids, success thresholds.

1. Landing page via `seo-page`: one audience, one clear offer, compliant copy from approved registry wording, safety & interactions section, FDA disclaimer beside supplement claims.
2. Quiz (≤4 questions) → transparent rule-based recommendation: score by preferred form (tea / capsule / tincture / balm) and ritual preferences. **Hard exclusions:** pregnancy, nursing, medications, or medical conditions → "check with your healthcare provider" + contact Amber, no product push. No health-outcome promises.
3. Events via the cookieless first-party beacon (no PII): `landing_view, quiz_start, quiz_complete, recommendation_view, product_view, add_to_cart, checkout_start, payment_method_select, order_submitted, purchase_confirmed, guide_signup, retell_start, retell_escalation` — each with page, UTMs, experiment id. `purchase_confirmed` fires server-side from the Stripe webhook.
4. UTMs + experiment id persist through checkout into Stripe metadata and the order row.
5. Admin funnel view: landing → quiz start → quiz complete → checkout start → purchase, with targets.
6. Follow-up email via `email-campaign` (drafts only).

Starting targets (from the Sept 20 audit): Sleep — 30% quiz completion, 3% purchase conversion. Beginner — 8% article→email, 20% email→quiz. Gifts — 5% builder completion, AOV above single-product baseline. Paid ads wait until a funnel meets its targets.
Ad/voice/image specs (Arcads, Leonardo, Retell) are written as docs only in `docs/marketing/` — no integrations without separate approval.
