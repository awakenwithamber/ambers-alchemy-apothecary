# WHERE TO ADD EVERYTHING
## The Grimoire of Remembered Light — Implementation Guide
### Amber's Alchemy Apothecary / Awaken Again

This guide tells you exactly where each file goes and in what order to set everything up.

---

## STEP 1 — Stripe Setup (Do This First)

Go to: https://dashboard.stripe.com

### 1a. Create the Product
- Products → Add Product
- Name: **The Grimoire of Remembered Light**
- Pricing model: **Recurring**
- Price: **$3.33**
- Billing period: **Monthly**
- Save → copy the **Price ID** (starts with `price_`)

### 1b. Create Customer Portal
- Settings → Billing → Customer Portal
- Enable: Cancel subscription, Update payment method
- Save the portal link — you'll add it to your site footer

### 1c. Register Your Webhook Endpoint
- Developers → Webhooks → Add Endpoint
- URL: `https://YOUR-SITE.netlify.app/.netlify/functions/stripe-webhook`
- Events to listen for:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- Save → copy the **Webhook Signing Secret** (starts with `whsec_`)

---

## STEP 2 — Supabase Setup

Go to: https://supabase.com → Create new project

### 2a. Create the Database Table
Go to: Table Editor → New Table → Name it: `grimoire_subscribers`

Add columns exactly as listed in `03_database-schema.csv`:

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key, default: gen_random_uuid() |
| email | text | Unique constraint |
| stripe_customer_id | text | |
| stripe_subscription_id | text | |
| subscription_status | text | |
| current_period_end | timestamptz | |
| discount_code | text | Nullable |
| free_gift_sent | bool | Default: false |
| shopify_tag_applied | bool | Default: false |
| welcome_email_sent | bool | Default: false |
| created_at | timestamptz | Default: now() |
| updated_at | timestamptz | Default: now() |

### 2b. Copy Your Keys
- Settings → API
- Copy: **Project URL** → this is your `SUPABASE_URL`
- Copy: **service_role key** (secret) → this is your `SUPABASE_SERVICE_ROLE_KEY`

---

## STEP 3 — Netlify Setup

### 3a. Add Environment Variables
Go to: Netlify Dashboard → Your Site → Site Configuration → Environment Variables

Add these:

| Variable | Value |
|---|---|
| STRIPE_SECRET_KEY | sk_live_... (from Stripe) |
| STRIPE_WEBHOOK_SECRET | whsec_... (from Stripe webhook) |
| STRIPE_PRICE_ID | price_... (from your $3.33 product) |
| SUPABASE_URL | https://xxxx.supabase.co |
| SUPABASE_SERVICE_ROLE_KEY | your service role key |
| ADMIN_EMAIL | awaken@consultant.com |
| SITE_URL | https://your-netlify-site.netlify.app |

### 3b. Add the Serverless Functions
From `04_netlify-webhook-functions.js`, split into 3 separate files in your project:

```
your-project/
└── netlify/
    └── functions/
        ├── create-checkout-session.js   ← ZAP function 1
        ├── stripe-webhook.js            ← ZAP function 2
        └── check-grimoire-access.js     ← ZAP function 3
```

### 3c. Install Dependencies
In your project root, run:
```bash
npm install stripe @supabase/supabase-js
```

### 3d. Add `_redirects` File
In your `/public` or root folder, create a file called `_redirects`:
```
/grimoire    /index.html    200
```

---

## STEP 4 — Add the Grimoire Page to Your Site

### 4a. Public Section (Pages 1–7)
- These render for everyone, no auth needed
- Add the 7 preview pages as static HTML content on the grimoire page

### 4b. Unlock Form (Below Page 7)
Add this UI to your page (copy from `06_email-starter-templates.md` for copy):
- Input field: `Enter the email used for your subscription`
- Button: `Unlock the Full Grimoire`
- On click: POST to `/.netlify/functions/check-grimoire-access`
- If `unlocked: true` → show pages 8–333
- If `unlocked: false` → show subscribe button + locked message

### 4c. Subscribe Button
- On click: POST to `/.netlify/functions/create-checkout-session`
- Redirect user to returned Stripe Checkout URL

### 4d. Security — Store Full Content Safely
- Do NOT put pages 8–333 in your HTML source
- Do NOT use `display: none` as your only lock
- Store full content in Supabase or a protected JSON file
- Only fetch it after `check-grimoire-access` returns `{ unlocked: true }`

---

## STEP 5 — Zapier Setup

Go to: https://zapier.com → Create Zap

Use the prompts from `01_zapier-ai-builder-prompts.md` one at a time.

**Order to build Zaps:**
1. ZAP-1: New Subscriber Welcome Flow (most critical)
2. ZAP-2: Subscription Canceled / Payment Failed
3. ZAP-3: Invoice Renewal
4. ZAP-5: Free Gift Delivery
5. ZAP-4: Monthly Email Send
6. ZAP-6: Shopify Tag Sync (only if using Shopify)

---

## STEP 6 — Email Platform Setup (Mailchimp or Klaviyo)

### Mailchimp
- Audience → Create Audience: `Grimoire Subscribers`
- Tags → Create tag: `GrimoireSubscriber`
- Email templates → create 4 templates using `06_email-starter-templates.md`

### Klaviyo
- Lists → Create List: `Grimoire Subscribers`
- Segments → Create segment: tag = GrimoireSubscriber
- Flows → Create flows for Welcome, Reactivation, Free Gift, Monthly

---

## STEP 7 — Shopify Discount Setup (Optional)

1. Customers → Segments → Create segment: tag = GrimoireSubscriber
2. Discounts → Create automatic discount:
   - Type: Percentage
   - Value: 10%
   - Applies to: All products
   - Eligibility: Customer segment = GrimoireSubscriber
   - No expiry date
3. Enable ZAP-6 to keep tags synced with Stripe status

**Fallback option:** Use discount code `SEER10`, display it only inside the unlocked grimoire area.

---

## STEP 8 — Test Everything

Checklist:
- [ ] Visit grimoire page — pages 1–7 visible, pages 8–333 hidden
- [ ] Click Unlock button — Stripe Checkout opens
- [ ] Complete test payment (use Stripe test card: 4242 4242 4242 4242)
- [ ] Check Supabase — new row created with status `active`
- [ ] Return to grimoire page — enter test email — full grimoire unlocks
- [ ] Enter awaken@consultant.com — full grimoire unlocks (admin override)
- [ ] Enter unknown email — locked message appears
- [ ] Check Mailchimp/Klaviyo — welcome email sent
- [ ] Check Shopify — GrimoireSubscriber tag applied
- [ ] Cancel test subscription in Stripe — check Supabase updates to `canceled`
- [ ] Return to grimoire — enter same email — locked message appears

---

## File Map Summary

| File | Where It Goes |
|---|---|
| `01_zapier-ai-builder-prompts.md` | Paste into Zapier AI Builder one Zap at a time |
| `02_automation-map.json` | Reference doc / import into Zapier if supported |
| `03_database-schema.csv` | Use to build Supabase table or import to Airtable/Sheets |
| `04_netlify-webhook-functions.js` | Split into 3 files in `netlify/functions/` |
| `05_where-to-add-everything.md` | This file — your implementation checklist |
| `06_email-starter-templates.md` | Paste into Mailchimp, Klaviyo, or Gmail templates |
