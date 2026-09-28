---
name: seo-page
description: Create or fix an indexable route (article, landing page, category, service page) with unique meta, canonical, schema, breadcrumbs, internal links, and sitemap entry. Use for new pages, fixing duplicate/fragment routes, or /herbal-library-type 404s.
---
# SEO page
1. Real standalone page (or 301 in `_redirects` if replacing an old URL) — never a `#fragment` route in the sitemap.
2. Head: unique `<title>` ≤65, unique description 70–160, self-canonical on `https://awakenagain.com`, OG + Twitter, `lang`, viewport.
3. Body: breadcrumb (taxonomy names from CLAUDE.md), one H1, logical H2/H3, related links, a clear next action, no dead ends, image alt text without keyword stuffing.
4. JSON-LD matching visible content only (Article / Product / BreadcrumbList / FAQPage for real FAQs).
5. Add to sitemap + search index; private routes get `noindex` and stay out of the sitemap.
6. `node scripts/audit-seo.mjs` → 0 FAIL, then `compliance-reviewer`, `release-gate`.
