# Threat Model

## Project Overview

This is a public-facing Node.js/Express storefront deployed on Replit autoscale. The app serves mostly static HTML/JS pages plus server-side API endpoints for checkout, Grimoire subscription access, admin reporting, reviews, form capture, and customer email workflows. The backend uses Supabase with a service-role client, Stripe for payments and subscriptions, and Resend for outbound email.

Production entrypoint is `server.js` via `npm start`. The browser is untrusted. All security decisions must be enforced by the Express backend, not by static page logic.

## Assets

- **Supabase service-role credentials and application secrets** — these keys can bypass row-level restrictions and expose or modify all stored business and customer data.
- **Admin access** — the `/admin` dashboard exposes orders, leads, subscribers, reviews, and email broadcast actions.
- **Payment and order integrity** — checkout amounts, order status, transaction identifiers, and subscription state must reflect trusted server-side payment records.
- **Subscriber-only Grimoire content** — paid content must only be disclosed to active subscribers after server-side verification.
- **Customer data** — orders, form submissions, quiz leads, email lists, and review submissions contain PII and business-sensitive information.
- **Outbound email capability** — purchase confirmations and weekly promo sends can be abused for spam or fraudulent messaging if triggered without authorization.

## Trust Boundaries

- **Browser → Express API** — all client input is attacker-controlled, including prices, order details, email addresses, and review data.
- **Express API → Supabase** — the server uses privileged database access; any missing validation or authorization can become full data compromise or tampering.
- **Express API → Stripe** — payment creation and subscription state must be bound to trusted server-side records, not client assertions.
- **Express API → Resend** — email-sending endpoints and flows must not be triggerable by unauthorized users.
- **Public → Admin boundary** — `/api/admin/*` and any moderation/export functionality must require strong server-side authentication and resist brute force and token leakage.
- **Public → Subscriber boundary** — Grimoire access checks must authenticate the user, not just identify an email address.
- **Dev-only helpers → Production** — local adapters and legacy compatibility routes must not remain internet-reachable in production unless protected.

## Scan Anchors

- **Production entrypoint:** `server.js`
- **Highest-risk server areas:** `api/admin.js`, `api/stripe.js`, `api/submission-created.js`, `api/reviews.js`, `api/email.js`, `netlify/functions/auth-check.js`, `lib/supabase.js`
- **Public surfaces:** `/api/create-payment-intent`, `/api/grimoire-subscribe`, `/api/grimoire-activate`, `/api/submission-created`, `/api/reviews*`, `/.netlify/functions/auth-check`, `/_blobs/*`
- **Admin surfaces:** `/admin`, `/api/admin/*`, `/api/reviews/admin`, `/api/reviews/export`, `/api/reviews/:id`
- **Usually dev/legacy:** most `netlify/functions/*.mjs` files are not mounted by `server.js`; only mounted compatibility routes should be treated as production-reachable.

## Threat Categories

### Spoofing

This project has two sensitive identity checks: admin access and subscriber-only Grimoire access. The system must require cryptographically verifiable proof of identity for both. Knowing an email address must never be enough to gain subscriber access, and admin authentication must not depend on leaked or guessable secrets.

### Tampering

Checkout totals, payment status, order records, review verification state, and subscription entitlements are all high-value targets for tampering. The server must derive charge amounts, paid status, and entitlement changes from trusted server-side records or verified webhook events. Client-submitted totals, transaction IDs, and status fields must be treated as untrusted.

### Information Disclosure

The application stores customer PII, mailing-list data, orders, leads, and subscriber records in Supabase. Responses, exports, and admin endpoints must disclose only the minimum data needed to authorized users. Secrets such as Supabase service-role keys, admin passwords, and signing keys must never be committed to the repo or exposed to the client.

### Denial of Service

Public endpoints that write to the database, trigger emails, create Stripe objects, or write server-side storage can be abused for cost amplification or operational disruption if left unauthenticated or unthrottled. Production-only helper routes must not expose arbitrary storage or expensive operations to the public internet.

### Elevation of Privilege

The main privilege boundaries are public user → subscriber and public user → admin. The system must enforce those boundaries server-side on every request. Missing authorization on admin/moderation/export routes, insecure paywall logic, arbitrary write helpers, or forged payment/order flows can all grant capabilities beyond what a public user should have.