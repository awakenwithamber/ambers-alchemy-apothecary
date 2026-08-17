# Vercel Deployment Guide — Amber's Alchemy Apothecary

This guide walks you through deploying the site to Vercel, including all required
environment variables, custom domain setup, and DNS configuration at Cloudflare.

---

## 1. Environment Variables

The app reads configuration from environment variables. Below is the complete list,
grouped by priority. Add each one in the Vercel dashboard under
**Settings → Environment Variables** (see step-by-step instructions in section 2).

### Required (app will not function without these)

| Variable | Description | Where it's used |
|---|---|---|
| `SUPABASE_URL` | Your Supabase project URL, e.g. `https://xxxxx.supabase.co` | `lib/supabase.js` — all database access |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase **service role** key (server-side, bypasses RLS). Found in Supabase → Settings → API → `service_role` secret | `lib/supabase.js` — admin client for writes/reads |
| `SUPABASE_ANON_KEY` | Supabase **anon/public** key. Found in Supabase → Settings → API → `anon` public key | `lib/supabase.js` — anon client |
| `STRIPE_SECRET_KEY` | Stripe **secret** key (`sk_live_...` or `sk_test_...`) | `api/stripe.js`, `api/submission-created.js` — payment creation & verification |
| `STRIPE_PUBLISHABLE_KEY` | Stripe **publishable** key (`pk_live_...` or `pk_test_...`) | `api/stripe.js` — served to client JS for Stripe Elements init |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`). Create a webhook endpoint in Stripe pointing to `https://awakenagain.com/api/stripe-webhook` and copy the signing secret | `api/stripe.js` — verifies incoming Stripe webhook signatures |
| `GRIMOIRE_JWT_SECRET` | A strong random secret string used to sign admin JWTs, generate unsubscribe tokens, and hash OTP codes. Generate one with: `openssl rand -hex 32` | `api/admin.js`, `api/email.js`, `api/grimoire-auth.js` |
| `ADMIN_PASSWORD` | Password for logging into the admin dashboard at `/admin` | `api/admin.js` — `POST /api/admin/login` |
| `RESEND_API_KEY` | Resend API key (`re_...`) for sending transactional & marketing email. Found in Resend → API Keys | `lib/mailer.js` — all outgoing email |

### Optional (have built-in defaults — set to override)

| Variable | Description | Default if not set |
|---|---|---|
| `OWNER_EMAIL` | Shop owner email address — receives a BCC of every order confirmation and is the default reply-to | `awaken@consultant.com` |
| `EMAIL_REPLY_TO` | Reply-to address for outgoing emails (customer replies go here) | Same as `OWNER_EMAIL` |
| `EMAIL_FROM` | From-address for outgoing emails. Must be a verified sender domain in Resend | `Amber's Alchemy Apothecary <onboarding@resend.dev>` |
| `PUBLIC_SITE_URL` | Canonical public site URL used in email links | `https://awakenagain.com` |
| `REVIEWS_ADMIN_TOKEN` | Shared secret token protecting review moderation/deletion endpoints. If not set, admin review operations will be rejected | _(none — endpoint returns 401)_ |
| `GRIMOIRE_GIFT_URL` | Direct URL to the free gift asset sent to new Grimoire subscribers | Falls back to the grimoire page (`/grimoir`) |
| `STRIPE_PORTAL_URL` | Stripe Customer Portal URL for subscription self-service | Falls back to the grimoire page (`/grimoir`) |

### Optional Zapier webhooks (leave blank if not using Zapier)

These forward form submissions to Zapier automations. If a webhook URL is not set,
the submission is still saved to Supabase — the Zapier forward is simply skipped.

| Variable | Description |
|---|---|
| `ZAPIER_CONTACT_WEBHOOK` | Zapier webhook URL for `contact` form submissions |
| `ZAPIER_CONSULTATION_WEBHOOK` | Zapier webhook URL for `consultation` form submissions |
| `ZAPIER_SOAP_ORDER_WEBHOOK` | Zapier webhook URL for `soap-order` form submissions |
| `ZAPIER_ORDER_WEBHOOK` | Zapier webhook URL for `order` form submissions |

### NOT needed on Vercel (ignore these)

These variables were used by the Replit/Netlify hosting platform and are **not** needed
on Vercel. Vercel provides equivalents automatically or the code path is not reached:

| Variable | Why it's not needed |
|---|---|
| `PORT` | Vercel sets the port automatically for serverless functions |
| `NODE_ENV` | Vercel sets `NODE_ENV=production` automatically |
| `REPLIT_DEV_DOMAIN` | Replit-specific dev domain — not applicable |
| `REPLIT_CONNECTORS_HOSTNAME` | Replit connectors proxy — Resend key is provided directly via `RESEND_API_KEY` instead |
| `REPL_IDENTITY` | Replit auth token — not applicable |
| `WEB_REPL_RENEWAL` | Replit deployment token — not applicable |
| `NETLIFY_BLOBS_CONTEXT` | Set programmatically by `server.js` for local dev only; Vercel doesn't use Netlify Blobs |
| `URL` / `DEPLOY_PRIME_URL` | Netlify deployment URLs — replaced by `PUBLIC_SITE_URL` |

---

## 2. Step-by-Step Vercel Deployment

### Step 1 — Sign up at Vercel

1. Go to [vercel.com](https://vercel.com) and click **Sign Up**.
2. Choose **Continue with GitHub** and authorize Vercel to access your GitHub account.
3. Once logged in, you'll be on the Vercel dashboard.

### Step 2 — Import the repository

1. Click **Add New…** → **Project**.
2. Under "Import Git Repository," find and select the **ambers-alchemy-apothecary** repo.
   - If it doesn't appear, click **Adjust GitHub App Permissions** and grant access to the repo, then refresh.
3. On the "Configure Project" screen:
   - **Framework Preset:** leave as "Other" (this is a static site + serverless API routes).
   - **Root Directory:** leave as default (repo root).
   - **Build Command:** leave **blank** — no build step is needed. The site is pre-built static HTML/JS/CSS.
   - **Output Directory:** leave as default (`.` / project root).
   - **Install Command:** leave as default (Vercel will auto-detect `package.json` and run `npm install`).
4. **Do NOT click Deploy yet** — we need to add environment variables first. Click **Environment Variables** to expand that section.

### Step 3 — Add environment variables

In the "Environment Variables" section of the import screen (or later under
**Settings → Environment Variables**), add each variable from the table in
section 1 above. For each one:

1. Enter the **Name** (e.g., `SUPABASE_URL`).
2. Enter the **Value** (your actual key/URL).
3. Select the environment: check **Production** (and **Preview** if you want preview
   deployments to also work).
4. Click **Add**.

**Add all 9 required variables first:**

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
GRIMOIRE_JWT_SECRET
ADMIN_PASSWORD
RESEND_API_KEY
```

**Then add the optional variables you want to customize:**

```
OWNER_EMAIL          → e.g. amber@awakenagain.com
EMAIL_REPLY_TO       → e.g. amber@awakenagain.com
EMAIL_FROM           → e.g. Amber's Alchemy Apothecary <hello@awakenagain.com>
PUBLIC_SITE_URL      → https://awakenagain.com
REVIEWS_ADMIN_TOKEN  → (a strong random string)
GRIMOIRE_GIFT_URL    → (optional gift download URL)
STRIPE_PORTAL_URL    → (optional Stripe Customer Portal URL)
```

> **Tip:** You can also add all variables via the Vercel CLI after deploying:
> ```bash
> vercel env add SUPABASE_URL
> vercel env add SUPABASE_SERVICE_ROLE_KEY
> # ... repeat for each variable
> ```

### Step 4 — Deploy

1. Click **Deploy**.
2. Wait for the deployment to finish (should take under a minute — there's no build step).
3. You'll get a temporary URL like `ambers-alchemy-apothecary-xxxx.vercel.app`.
   Click **Visit** to verify the site loads.

### Step 5 — Connect the custom domain (awakenagain.com)

1. From the Vercel project dashboard, go to **Settings → Domains**.
2. Enter `awakenagain.com` and click **Add**.
3. Vercel will detect that the domain is not yet pointed and show you the DNS records to add.
   It will also offer to add the `www.awakenagain.com` subdomain — accept that too.
4. Vercel will display the exact DNS records needed (see Step 6 for the typical values).

### Step 6 — Configure DNS at Cloudflare

The domain `awakenagain.com` is managed at Cloudflare. Log into your Cloudflare
dashboard and go to **DNS → Records** for the `awakenagain.com` zone.

Add (or update) these records:

| Type | Name | Value | Proxy status |
|---|---|---|---|
| **A** | `@` (apex domain) | `76.76.21.21` | **DNS only** (gray cloud) |
| **CNAME** | `www` | `cname.vercel-dns.com` | **DNS only** (gray cloud) |

> **Important — Cloudflare proxy (orange cloud):** Vercel manages its own SSL/edge
> and the Cloudflare proxy can interfere with Vercel's certificate provisioning
> and routing. Set both records to **DNS only** (gray cloud / proxy off). You can
> toggle this by clicking the orange cloud icon next to each record in Cloudflare
> until it turns gray.

After saving the DNS records:

1. Go back to the Vercel **Settings → Domains** page.
2. Vercel will begin verifying the DNS configuration. This can take a few minutes
   (sometimes up to 30 minutes for DNS propagation).
3. Once verified, Vercel will automatically provision an SSL certificate.
4. The domain will show a green checkmark when fully configured.

> **If you previously had other A/CNAME records for the apex domain** (e.g., pointing
> to Netlify or Replit), **remove or replace them** with the Vercel A record above.
> Having conflicting records will prevent Vercel from claiming the domain.

### Step 7 — Update the Stripe webhook endpoint

1. Go to the [Stripe Dashboard](https://dashboard.stripe.com) → **Developers → Webhooks**.
2. Edit your existing webhook endpoint (or create a new one).
3. Set the endpoint URL to: `https://awakenagain.com/api/stripe-webhook`
4. Ensure these events are subscribed:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing Secret** (`whsec_...`) and make sure it matches the
   `STRIPE_WEBHOOK_SECRET` environment variable in Vercel.

---

## 3. Notes — What Changed From the Replit/Netlify Version

### Architecture summary

The app has three layers:
1. **Static frontend** — HTML, CSS, and client-side JavaScript served directly.
2. **API routes** (`/api/*`) — serverless functions handling payments, admin,
   reviews, forms, email, and authentication.
3. **Supabase** — PostgreSQL database + auth (hosted externally, unchanged).

### What was the Replit version

On Replit, the app ran as a single **Express.js server** (`server.js`) that:
- Served static files.
- Mounted all API routes from the `api/` directory as Express route handlers.
- Adapted legacy Netlify Functions (CommonJS and ESM) to run inside the Express
  server via `runCjsHandler()` and `runEsmHandler()`.
- Provided a local filesystem-backed blob store (`/_blobs/*`) for development,
  replacing `@netlify/blobs`.
- Set `NETLIFY_BLOBS_CONTEXT` programmatically so the `@netlify/blobs` client
  would talk to the local blob server during development.
- Used Replit's connectors proxy to obtain the Resend API key dynamically
  (via `REPLIT_CONNECTORS_HOSTNAME` + `REPL_IDENTITY` tokens).

### What changes for Vercel

| Area | Replit/Netlify | Vercel |
|---|---|---|
| **Server process** | Long-running Express server (`server.js`) on a fixed port | Serverless functions — each `/api/*.js` file in the `api/` directory becomes an automatic serverless endpoint. No persistent server process. |
| **Static files** | Served by Express `express.static()` | Served directly by Vercel's CDN from the project root. |
| **Email credentials (Resend)** | Fetched dynamically from Replit's connectors proxy at runtime | Provided directly via the `RESEND_API_KEY` environment variable. The Replit connector lookup code in `lib/mailer.js` gracefully falls through to the env var, which is the path Vercel uses. |
| **Blob storage** | Filesystem-backed local blobs (dev) / `@netlify/blobs` (Netlify) | Not used on Vercel. The blob routes are gated behind `NODE_ENV !== 'production'` and won't be reachable in production. |
| **Environment variables** | `REPLIT_DEV_DOMAIN`, `REPL_IDENTITY`, `WEB_REPL_RENEWAL`, `REPLIT_CONNECTORS_HOSTNAME`, `NETLIFY_BLOBS_CONTEXT`, `PORT` | Not needed. Vercel sets `PORT` and `NODE_ENV` automatically. Resend key is provided via `RESEND_API_KEY` directly. |
| **CORS allowed origins** | Included the Replit dev domain dynamically | Only `https://awakenagain.com` in production (the Replit dev domain entry is a no-op without `REPLIT_DEV_DOMAIN`). |
| **Build step** | None | None — no build command is needed. Vercel serves static files directly and deploys `api/*.js` as serverless functions. |
| **URL used in emails** | Fell back to Replit dev domain | Set `PUBLIC_SITE_URL=https://awakenagain.com` (or rely on the built-in default). |
| **`netlify.toml` redirects** | Netlify-native redirect rules | Need to be handled by `vercel.json` if equivalent redirects are required. The Express server's catch-all routes (e.g., `/grimoir`, `/grimoire`, `/grimior` → `grimoir.html`) are handled server-side; on Vercel these should be configured as redirects in `vercel.json`. |

### What stays the same

- All Supabase database tables, schemas, and RLS policies — unchanged.
- All Stripe products, prices, and webhook events — unchanged (just update the
  webhook endpoint URL to the new domain).
- The `api/*.js` route handlers — these are already written as exported functions
  compatible with Vercel's serverless function format.
- The `lib/*.js` modules (supabase, mailer, email-content, catalog) — unchanged,
  they read from the same environment variables.
- All client-side JavaScript, HTML, and CSS — unchanged.
- The admin dashboard at `/admin` — unchanged.

### Post-deployment checklist

- [ ] Site loads at `https://awakenagain.com`
- [ ] Admin dashboard accessible at `https://awakenagain.com/admin` (login with `ADMIN_PASSWORD`)
- [ ] A test form submission appears in the admin dashboard
- [ ] A test Stripe payment (use Stripe test cards in test mode) completes and appears in admin orders
- [ ] Stripe webhook events are received (check Stripe Dashboard → Webhooks → endpoint logs)
- [ ] A test order confirmation email is delivered (check Resend dashboard → Logs)
- [ ] Grimoire subscription flow works (subscribe → OTP email → verify → access)
- [ ] Unsubscribe link in emails works (`/unsubscribe?email=...&token=...`)
