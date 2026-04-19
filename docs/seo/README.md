# SEO & Discoverability Runbook — `awakenagain.com`

Operational runbook for validating the technical-SEO, social-preview, schema,
and analytics work on this site after every deploy.

## 1. Social preview image — source of truth

Primary homepage share image: `/images/social-preview.png`
(currently a copy of `business-card.png` — 476 × 916 PNG, branded card).

When a proper 1200 × 630 branded image ("The Empress Amber" or similar) is
ready, drop it in at exactly this path and bump the
`og:image:width` / `og:image:height` meta values in `index.html`. No other
changes are needed — Open Graph, Twitter, LinkedIn, iMessage, Android
Messages, Slack, Discord, and Pinterest will all pick it up on their next
re-scrape.

Always keep the filename stable (`social-preview.png`) so CDN / platform
caches invalidate cleanly.

## 2. Where each piece lives

| Concern | File |
|---|---|
| Homepage `<head>` meta | `index.html` (lines ~1–60) |
| Structured data blocks | `index.html` (lines ~60–320) |
| GA4 / GTM bootstrap + Consent Mode v2 | `index.html` (near `</head>`) |
| Analytics event helpers (`window.AAA.*`) | `analytics.js` |
| Crawler rules | `robots.txt` |
| Canonical URL inventory | `sitemap.xml` |
| Preview / sitemap caching | `netlify.toml` |
| Keyword universe + content plan | `docs/seo/keyword-map.md` |

## 3. Validation checklist (run before any deploy that changes meta)

1. **Facebook / iMessage / Slack / Discord**
   https://developers.facebook.com/tools/debug/ → paste `https://awakenagain.com/`
   → Click "Scrape Again". Image, title, description should match.
2. **Twitter / X**
   https://cards-dev.twitter.com/validator → paste homepage URL.
3. **LinkedIn**
   https://www.linkedin.com/post-inspector/
4. **Google Rich Results**
   https://search.google.com/test/rich-results → paste homepage URL.
   Expected types: Organization, WebSite, WebPage, BreadcrumbList, FAQPage,
   Product (×8 via ItemList), LocalBusiness, CollectionPage (×2).
5. **Schema.org validator**
   https://validator.schema.org/
6. **Google Search Console**
   - Submit `https://awakenagain.com/sitemap.xml`
   - Request indexing on the homepage after meta/schema changes
   - Watch the Coverage + Enhancements reports for 1–2 weeks
7. **PageSpeed Insights** https://pagespeed.web.dev/ — target ≥ 90 mobile
   performance. Social-preview image should load in < 500 ms from CDN.

## 4. Activating GA4 / GTM

1. Create a GA4 property (or GTM container).
2. In `index.html`, set either `window.__AAA_GA4_ID__ = 'G-XXXXXXXXXX'` or
   `window.__AAA_GTM_ID__ = 'GTM-XXXXXXX'` — not both. GTM is recommended;
   it loads GA4 downstream plus any other pixels (Meta, Pinterest, TikTok).
3. Deploy. Visit the site; confirm tag firing via GA4 DebugView or
   GTM Tag Assistant.
4. Verify the following events show up in DebugView:
   `page_view`, `scroll_depth`, `outbound_click`, `video_play`,
   `add_to_cart`, `begin_checkout`, `newsletter_signup`,
   `contact_form_submit`.
5. Fire `window.AAA.purchase(orderId, cart, total)` once Amber manually
   confirms a Cash App or Venmo payment and flips the order to paid — that
   sends the GA4 `purchase` event with the real `transaction_id`.

## 5. Consent Mode v2

Default state: `analytics_storage` granted, all ad-storage categories denied.
Swap to an explicit consent UX (cookie banner) by calling
`window.AAA.grantAnalyticsConsent()` / `denyAnalyticsConsent()` from the
banner's accept / reject buttons.

## 6. Pinterest claim

- Generate a verification meta tag in Pinterest business settings.
- Paste it into the `<head>` of `index.html` alongside the existing
  `pinterest-rich-pin` tag.
- Submit the sitemap in Pinterest's URL submission tool.

## 7. Search Console domain property

Use a **domain property** (`awakenagain.com`) if DNS access is available — it
covers all subdomains and protocols in one place. Otherwise use the
URL-prefix property for `https://awakenagain.com/`.

## 8. Guardrails

- Never ship meta descriptions that duplicate each other across pages.
- Never add `noindex` to product, collection, article, or herb pages.
- Never add rel=nofollow to internal links.
- Never paste keyword lists into visible content.
- Never claim a product treats, cures, or prevents a specific disease — use
  "traditionally used to support" style language.
- Never buy backlinks or submit to link directories.
- Always compress images before upload (tinypng / squoosh) — target < 300 KB
  for product shots, < 500 KB for social previews.
