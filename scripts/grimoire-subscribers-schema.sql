-- Grimoire subscribers — schema extension
-- ---------------------------------------------------------------------------
-- The grimoir_subscribers table lives in Supabase (Postgres). It is reached by
-- the app only through the Supabase REST API with the service-role key; there is
-- no direct Postgres connection string available in this environment, so this
-- DDL cannot be applied automatically from the app.
--
-- HOW TO APPLY:
--   1. Open your Supabase project -> SQL Editor.
--   2. Paste and run the statements below (they are idempotent — safe to re-run).
--
-- The application is written to work WHETHER OR NOT these columns exist yet
-- (writes that reference them fall back to the core columns), so applying this
-- migration only enables persistence of the new fields; nothing breaks before
-- it is applied.
-- ---------------------------------------------------------------------------

ALTER TABLE grimoir_subscribers
  ADD COLUMN IF NOT EXISTS subscription_status  text,
  ADD COLUMN IF NOT EXISTS current_period_end   timestamptz,
  ADD COLUMN IF NOT EXISTS discount_code        text,
  ADD COLUMN IF NOT EXISTS free_gift_sent       boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS welcome_email_sent   boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS shopify_tag_applied  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at           timestamptz NOT NULL DEFAULT now();
