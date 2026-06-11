---
name: Supabase setup
description: Project ref, key retrieval method, and Node 20 WebSocket fix for this project
---

Project ref: `orpaqodqlvjczshtcxif`
URL env var: `SUPABASE_URL` (shared env var)
Anon key env var: `SUPABASE_ANON_KEY` (shared env var — public key, safe as env var)
Service role key env var: `SUPABASE_SERVICE_ROLE_KEY` (shared env var)

Keys were fetched via Supabase Management API using a Personal Access Token (PAT starting with `sbp_...`).
Endpoint: `GET https://api.supabase.com/v1/projects/{ref}/api-keys`

**Why:** User kept providing wrong credentials (Stripe keys). PAT approach avoids user confusion.

**How to apply:** If keys ever need refreshing, use the Management API endpoint above with a fresh PAT from https://supabase.com/dashboard/account/tokens

**Node 20 WebSocket fix:** Must pass `realtime: { transport: ws }` when creating Supabase client on Node 20. The `ws` package must be installed. See `lib/supabase.js`.

Tables created: `reviews`, `orders`, `quiz_leads`, `review_requests`
