---
name: Supabase DDL / schema changes
description: Why schema changes to the Supabase tables can't be applied from this environment, and the pattern to use instead
---

# Supabase schema changes can't be applied from here

The app's tables (e.g. `grimoir_subscribers`, `orders`, `reviews`) live in **Supabase**, reached ONLY via the Supabase REST API + service-role key. There is **no** direct Postgres path:
- No Supabase DB connection string / password in env (only `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
- No `supabase`/`postgres` Replit connector (`listConnections` returns 401).
- `pg` is not installed; `process.env` is not exposed inside the code_execution sandbox.
- `DATABASE_URL` / `PG*` / `executeSql` target the **Replit built-in Postgres**, which is EMPTY of these tables — it is NOT Supabase.

**Why it matters:** REST/PostgREST cannot run DDL. So `ALTER TABLE`/`ADD COLUMN` cannot be applied automatically. They must be run by the user in the **Supabase SQL Editor**.

**How to apply (the pattern that works):**
- Write the migration as an idempotent SQL file (`scripts/*.sql`, `ADD COLUMN IF NOT EXISTS ...`) for the user to paste into Supabase SQL Editor.
- Make app code **resilient to missing columns** so nothing breaks before the migration runs: attempt the rich upsert/update; on a missing-column error (`PGRST204`, or message matching /column .* does not exist/i or /could not find the .* column/i) retry with only the core/guaranteed columns. See `resilientUpsert`/`resilientUpdate` + `isMissingColumnErr` in `api/stripe.js`.
