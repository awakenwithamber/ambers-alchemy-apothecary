---
name: Server architecture
description: How the Express server replaces Netlify for this static+serverless site on Replit
---

This project was originally built for Netlify (static files + Netlify Functions). On Replit it runs as an Express server (`server.js`) that:

1. Serves static files from the project root
2. Proxies the original `/.netlify/functions/*` CJS handler routes (auth-check, shopify-checkout, form-relay) via a `makeEvent` adapter
3. Hosts Supabase-backed API routes at `/api/reviews`, `/api/quiz-lead`, `/api/submission-created`
4. Redirects legacy `/.netlify/functions/reviews` etc. to new `/api/*` routes

**Why:** Netlify Functions (ESM, `@netlify/blobs`) don't run on Replit. Reviews/orders/leads moved to Supabase tables.

**Supabase-backed modules:** `api/reviews.js`, `api/quiz-lead.js`, `api/submission-created.js`
**Supabase client:** `lib/supabase.js` — exports `getAdminClient()` and `getAnonClient()`

**Port:** 5000 (0.0.0.0)
**Start command:** `node server.js`
**Deployment target:** autoscale
