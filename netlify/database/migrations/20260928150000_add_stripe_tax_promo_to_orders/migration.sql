-- Roll-forward only: adds the columns the Stripe + Cash App + Venmo checkout
-- needs. No existing column is renamed, dropped, or retyped.
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "stripe_payment_intent_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "tax_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "promo_code" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customer_phone" text;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "orders_stripe_pi_idx" ON "orders" ("stripe_payment_intent_id");
