CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY,
	"event" text NOT NULL,
	"actor" text DEFAULT 'system' NOT NULL,
	"subject_type" text,
	"subject_id" text,
	"detail" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text,
	"message" text NOT NULL,
	"handled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY,
	"order_id" integer NOT NULL,
	"product_id" text NOT NULL,
	"product_name" text NOT NULL,
	"variant_id" text,
	"variant_label" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price_cents" integer NOT NULL,
	"line_total_cents" integer NOT NULL,
	"customization" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY,
	"order_number" text NOT NULL UNIQUE,
	"status" text DEFAULT 'draft' NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"shipping_address" jsonb,
	"payment_method" text NOT NULL,
	"subtotal_cents" integer NOT NULL,
	"shipping_cents" integer DEFAULT 0 NOT NULL,
	"discount_cents" integer DEFAULT 0 NOT NULL,
	"total_cents" integer NOT NULL,
	"paypal_order_id" text,
	"paypal_capture_id" text,
	"manual_payment_reference" text,
	"requires_formulation_review" boolean DEFAULT false NOT NULL,
	"idempotency_key" text UNIQUE,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_results" (
	"id" serial PRIMARY KEY,
	"primary_ally" text NOT NULL,
	"secondary_ally" text NOT NULL,
	"answers" jsonb NOT NULL,
	"email" text,
	"consented_to_email" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "audit_log_event_idx" ON "audit_log" ("event");--> statement-breakpoint
CREATE INDEX "audit_log_subject_idx" ON "audit_log" ("subject_type","subject_id");--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" ("order_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" ("status");--> statement-breakpoint
CREATE INDEX "orders_email_idx" ON "orders" ("customer_email");--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id");