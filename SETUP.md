# AWAKENAGAIN.COM — SETUP GUIDE (SHOPIFY EDITION)
# No Stripe needed — everything runs through Shopify.

═══════════════════════════════════════════════════════════
WHAT'S IN THIS PACKAGE
═══════════════════════════════════════════════════════════

netlify/functions/
  shopify-checkout.js   ← Creates Shopify checkout (server-side, secure)
  auth-check.js         ← Grimior paywall via Shopify customer lookup
  form-relay.js         ← Routes form submissions to Zapier webhooks

js/
  cart.js               ← Global cart (all Add to Cart buttons)
  soap-builder.js       ← Soap builder Step 5 Add to Cart fix
  shopify-checkout.js   ← Client-side button that calls the function
  form-handlers.js      ← All forms wired to form-relay

css/
  scroll-fix.css        ← Fixes scroll-lock on all pages

grimior.html            ← Paywall page with Shopify subscription check
netlify.toml            ← Redirects + function config

═══════════════════════════════════════════════════════════
STEP 1 — NETLIFY ENVIRONMENT VARIABLES
Go to: Netlify → Site Configuration → Environment Variables
═══════════════════════════════════════════════════════════

These MUST match exactly (case sensitive):

  SHOPIFY_STORE_DOMAIN       = [your store].myshopify.com
                               (you already set this up — check Netlify)

  SHOPIFY_STOREFRONT_TOKEN   = [your Storefront API token]
                               (you already set this up — check Netlify)

  SHOPIFY_ADMIN_TOKEN        = [NEW — see Step 2 below]
                               Needed for Grimior paywall auth check

  ZAPIER_CONTACT_WEBHOOK     = [from Zapier after building Zap 1]
  ZAPIER_CONSULTATION_WEBHOOK= [from Zapier after building Zap 2]
  ZAPIER_SOAP_ORDER_WEBHOOK  = [from Zapier after building Zap 3]
  ZAPIER_ORDER_WEBHOOK       = [from Zapier after building Zap 4]

═══════════════════════════════════════════════════════════
STEP 2 — GET SHOPIFY ADMIN API TOKEN (for Grimior paywall)
═══════════════════════════════════════════════════════════

You need ONE additional Shopify token — the Admin API token.
This is different from your Storefront token.

1. Go to your Shopify Admin
2. Settings → Apps and sales channels → Develop apps
3. Open your existing "AwakenAgain Store" app (or create one)
4. Click "Configure Admin API scopes"
5. Enable these read permissions:
     ✅ read_customers
     ✅ read_orders
6. Click Save → Install app
7. Copy the "Admin API access token" (starts with shpat_)
8. Paste into Netlify env as: SHOPIFY_ADMIN_TOKEN

═══════════════════════════════════════════════════════════
STEP 3 — SET UP GRIMIOR SUBSCRIPTION IN SHOPIFY
═══════════════════════════════════════════════════════════

Create a subscription product in Shopify for the Grimior:

1. Shopify Admin → Products → Add product
2. Title: "The Grimior — Full Archive Access"
3. Price: $3.33/month
4. SKU: sub-333
5. To enable recurring billing, install a free subscription app:
   Shopify App Store → search "Seal Subscriptions" (free) or
   "Appstle Subscriptions" (free tier available)
6. Set up the $3.33/month plan in the subscription app
7. Create a direct purchase link for this product
   → Put this link in grimior.html where it says:
   href="YOUR_SHOPIFY_GRIMIOR_PRODUCT_URL"

When a customer subscribes, the auth-check.js function will
automatically find their email in Shopify and grant access.

To manually grant access to someone:
  Shopify Admin → Customers → find them → Add tag: "grimior-subscriber"
  The auth-check function checks for this tag automatically.

═══════════════════════════════════════════════════════════
STEP 4 — CHECK YOUR PRODUCT HANDLES IN SHOPIFY
═══════════════════════════════════════════════════════════

The shopify-checkout.js function uses a HANDLE_MAP to match
cart items to Shopify products. Handles are auto-generated
from product titles (lowercase, spaces → hyphens).

To check your actual handles:
1. Shopify Admin → Products
2. Click any product
3. Look at the URL: /products/[this-is-the-handle]

If your handles don't match the HANDLE_MAP in
netlify/functions/shopify-checkout.js, edit that file
and update the right-hand values to match.

Current HANDLE_MAP includes handles for:
  - All 5 ritual bundles
  - All 9 signature soaps
  - All core remedies (DreamEase, Chill Pill, etc.)
  - Custom soap + custom remedy catch-alls

═══════════════════════════════════════════════════════════
STEP 5 — ADD TAGS TO index.html
═══════════════════════════════════════════════════════════

Add in <head> (after your last stylesheet):
  <link rel="stylesheet" href="/css/scroll-fix.css">

Add before </body> in this order:
  <script src="/js/cart.js"></script>
  <script src="/js/soap-builder.js"></script>
  <script src="/js/shopify-checkout.js"></script>
  <script src="/js/form-handlers.js"></script>

Remove or replace any previous shopify-checkout script tags
to avoid conflicts.

═══════════════════════════════════════════════════════════
STEP 6 — FORM IDs (check these in index.html)
═══════════════════════════════════════════════════════════

Make sure your forms have these exact id attributes:

  Contact form:         id="contact-form"
  Consultation form:    id="consultation-form"
  Custom soap form:     id="soap-order-form"
  Checkout form:        id="checkout-form"

═══════════════════════════════════════════════════════════
STEP 7 — GRIMIOR PAGE
═══════════════════════════════════════════════════════════

In grimior.html:
1. Add your existing nav HTML where it says <!-- your nav -->
2. Add your existing footer where it says <!-- your footer -->
3. Add your existing CSS <link> tags to <head>
4. Paste pages 1-7 content into <!-- PASTE PAGES 1-7 HERE -->
5. Paste full archive into <!-- PASTE FULL GRIMIOR CONTENT -->
6. Update the subscription product URL

═══════════════════════════════════════════════════════════
STEP 8 — ZAPIER (4 ZAPS)
═══════════════════════════════════════════════════════════

At zapier.com → Create → Zap:

For each Zap:
  Trigger: Webhooks by Zapier → Catch Hook → Continue
  Action: Resend → Send Email → connect with Resend API key

ZAP 1 — Contact
  Webhook URL → save as ZAPIER_CONTACT_WEBHOOK
  To: awaken@consultant.com, dare2be4ree@gmail.com
  Subject: ✦ New Message — {{name}}

ZAP 2 — Consultation
  Webhook URL → save as ZAPIER_CONSULTATION_WEBHOOK
  To: awaken@consultant.com
  Subject: ✦ New Consultation — {{name}}

ZAP 3 — Soap Order
  Webhook URL → save as ZAPIER_SOAP_ORDER_WEBHOOK
  To: awaken@consultant.com, dare2be4ree@gmail.com
  Subject: ✦ Soap Order — {{name}} · {{quantity}} bars

ZAP 4 — Order (Cash App / Venmo)
  Webhook URL → save as ZAPIER_ORDER_WEBHOOK
  To: awaken@consultant.com, dare2be4ree@gmail.com
  Subject: ✦ New Order — {{name}} via {{paymentMethod}}

After all 4 Zaps are built, add the 4 webhook URLs as
Netlify environment variables (Step 1 above).

═══════════════════════════════════════════════════════════
STEP 9 — DEPLOY
═══════════════════════════════════════════════════════════

1. Push all files to GitHub
2. Netlify auto-deploys
3. Check: Netlify → Functions — you should see:
     shopify-checkout
     auth-check
     form-relay
4. Test soap builder → Add to Cart → cart badge updates ✓
5. Test Shopify checkout button → redirects to Shopify ✓
6. Test a contact form → check Zapier task history ✓
7. Test Grimior with awaken@consultant.com → full access ✓

═══════════════════════════════════════════════════════════
THINGS THAT STILL NEED YOUR INPUT
═══════════════════════════════════════════════════════════

□ Confirm your SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN
  are already in Netlify (from previous setup)
□ Get SHOPIFY_ADMIN_TOKEN (Step 2 — 5 minutes)
□ Create Grimior subscription product in Shopify (Step 3)
□ Build 4 Zapier Zaps and add webhook URLs to Netlify (Step 8)
□ Add <script> and <link> tags to index.html (Step 5)
□ Update form IDs in index.html if needed (Step 6)
□ Add nav/footer/content to grimior.html (Step 7)
