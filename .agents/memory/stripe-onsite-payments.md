---
name: Stripe on-site payments (no Shopify, no redirect)
description: Hard product constraint and the on-page payment patterns used for this apothecary site
---

Hard constraint for "Awaken Again / Amber's Alchemy Apothecary": **NO Shopify anywhere.** Payments are Stripe (on-site Elements, never a hosted-checkout redirect), Venmo, and Cash App only. Customers must complete checkout without leaving the site.

**Why:** Explicit, repeated owner requirement. Any redirect-based or Shopify flow is a regression.

**How to apply:**
- Storefront checkout: client creates a PaymentIntent via `/api/create-payment-intent`, then `stripe.confirmCardPayment` on-page. After success it POSTs the order to `/api/submission-created` (upserts `orders` + creates `review_requests`). `initStripe()` must actually be invoked when the checkout section opens, or it silently falls back to "pending external payment".
- Grimoire $3.33/mo paywall: on-page subscribe form → `createPaymentMethod` → `/api/grimoire-subscribe` (creates/reuses customer, subscription with `payment_behavior: default_incomplete`, returns clientSecret) → `confirmCardPayment` → `/api/grimoire-activate`. Only unlock content when activate returns `{ok:true}`.
- `grimoire-activate` must verify the subscription's customer email matches the requesting email (ownership), or any active subscription id could be claimed.
- Stripe webhook must reject events when `STRIPE_WEBHOOK_SECRET` is unset (don't trust unsigned events). Activation does not depend on the webhook.
- Known open item: `/api/create-payment-intent` trusts the client `amount`. Cart has dynamic/custom-blend pricing with no server catalog, so a strict server-side price check would reject legitimate custom orders — fixing properly needs authoritative server-side pricing for all products incl. custom blends.
