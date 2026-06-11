---
name: Supabase on Node 20 (ws transport)
description: Why every Supabase call in this repo must go through lib/supabase.js, not raw createClient
---

All server-side Supabase access must use `getAdminClient()` / `getAnonClient()` from `lib/supabase.js`. These configure a `ws` WebSocket transport required for the Supabase client to work under Node 20 in this environment.

**Why:** Calling `createClient` directly (without the ws transport) causes requests to hang/fail silently — auth-check returned wrong results until switched to `getAdminClient()`.

**How to apply:** Any new handler that touches Supabase (orders, reviews, quiz leads, grimoire subscribers, paywall checks) must import from `lib/supabase.js`. Never `require('@supabase/supabase-js').createClient` directly in a route.
