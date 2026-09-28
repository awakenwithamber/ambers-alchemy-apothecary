---
name: email-campaign
description: Draft, review, and schedule marketing emails (weekly Grimoire email, newsletter, funnel follow-ups, announcements) with CAN-SPAM compliance. Use for any email that isn't a receipt, shipping notice, or sign-in link.
---
# Email campaign
1. `content-drafter` writes the draft (approved facts only; honest subject line; one CTA).
2. Required on every marketing send (see compliance REFERENCE §4): RFC 8058 `List-Unsubscribe` + `List-Unsubscribe-Post` headers, visible unsubscribe link, Awaken With Amber LLC + 239 S 1200 W, Salt Lake City, UT 84104 (from `BUSINESS_POSTAL_ADDRESS`), consent/suppression check at send time, FDA disclaimer beside any supplement claim.
3. Recipients: only people with marketing consent. Order/contact-form emails are not consent.
4. Status flow: `draft → reviewed → approved (Amber) → scheduled → sent`. Nothing sends without Amber's approval; a kill switch env disables all marketing sends.
5. Test send to the admin address first; confirm one-click unsubscribe works and the address is suppressed immediately.
Transactional templates (receipts, renewal notices, sign-in links) carry `// lunarforge:transactional` and no promotions.
