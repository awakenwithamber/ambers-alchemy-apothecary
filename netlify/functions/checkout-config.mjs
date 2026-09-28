// GET /api/checkout/config — tells the browser whether card checkout is live.
// The Stripe *publishable* key is public by design; the secret key never
// leaves the server.

import { json, env, stripeConfigured } from "../../lib/orders.mjs";

export default async () => {
  const cardEnabled = stripeConfigured();
  const publishableKey = env("STRIPE_PUBLISHABLE_KEY");
  return json({
    cardEnabled,
    publishableKey: cardEnabled ? publishableKey : null,
    methods: cardEnabled ? ["card", "cashapp", "venmo"] : ["cashapp", "venmo"],
  });
};

export const config = { path: "/api/checkout/config" };
