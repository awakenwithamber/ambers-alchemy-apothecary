-- Roll-forward only: fixed-window request counter for the Lunna assistant.
-- Buckets are hashed client IPs; no message content is stored.
CREATE TABLE IF NOT EXISTS "assistant_rate_limits" (
	"bucket" text PRIMARY KEY NOT NULL,
	"window_start" timestamp DEFAULT now() NOT NULL,
	"count" integer DEFAULT 0 NOT NULL
);
