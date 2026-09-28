# Compliance reference — AwakenAgain.com
Practical rules drawn from FDA (DSHEA structure/function + cosmetic vs drug), FTC advertising substantiation
and endorsement guidance, CAN-SPAM, and state automatic-renewal laws. Not legal advice; final labels and
policies deserve attorney review.

## §1 Supplements (capsules, teas, tinctures, powders)
- Allowed: structure/function statements — "supports", "traditionally used to support", "part of a calming evening ritual".
- Never: diagnose, treat, cure, mitigate, or prevent a disease, or name a disease/symptom cluster as the target
  (insomnia, anxiety disorder, depression, diabetes, hypertension, infections, dementia/Alzheimer's, cancer, etc.).
- The exact disclaimer, adjacent to the claim (asterisk-linked is fine) on product pages, cards showing benefits,
  quiz results, funnel pages, emails, and label templates — and in every footer:
  > These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.
- Keep the catalog's extended safety line: pregnant/nursing, medical condition, medication → consult a healthcare professional; keep out of reach of children.
- Label reminder for physical products: structure/function claims on labels also require FDA notification within 30 days of first marketing (Amber's action — list as Blocked).

## §2 Cosmetics (soaps, balms, serums, salves, body oils, scrubs)
- Allowed: cleanses, moisturizes, softens, smells, looks, feels — "softer-feeling skin", "radiant-looking", "fuller-looking hair", "comforting massage ritual".
- Drug triggers (remove/reframe): treats/heals/cures; acne, eczema, psoriasis, rosacea, dermatitis, infection;
  anti-inflammatory, antibacterial, antifungal, antiseptic; pain, relief, soothes burns/wounds/rashes; muscle or joint
  effects; hair growth/regrowth/loss/thicker hair; repairs skin cells, collagen production, scars, detox.
- Safety warnings ("avoid eyes and open wounds", "patch test", "external use only") are required and are not claims.
- True soap (lye + fats, cleansing only) is regulated differently from "cosmetic soap" — wording still stays cosmetic.
- List ingredients in the catalog's existing order; disclose fragrance/essential-oil allergens where known.

## §3 Subscription — The Grimoire of Wellness, $7.77/month
Shown before payment, next to the subscribe button (clear, conspicuous, not in a tooltip):
> **$7.77/month. Renews automatically every month on the date you join until you cancel.** Includes Grimoire pages 8–88 and new entries as they're added. Cancel anytime online from your account (Manage membership) or the link in any receipt — access continues to the end of the paid period.

Consent checkbox (unchecked by default, required before Stripe Checkout loads):
> ☐ I agree this membership renews automatically at $7.77/month until I cancel.

Confirmation email (transactional) restates: price, renewal frequency, next billing date, what's included, how to cancel (direct link), contact email.
Cancellation: online, self-serve, no call or chat required — Stripe customer portal + emailed link. No "save" gauntlet.
Price changes: advance email notice before the new price applies.
Manual 30-day Venmo/Cash App pass:
> One-time 30-day pass. **Does not auto-renew.** We'll email you before it ends.

## §4 Marketing email (weekly Grimoire email, newsletter, promos, follow-ups)
Headers: `List-Unsubscribe: <https://awakenagain.com/unsubscribe?t=TOKEN>, <mailto:...>` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click` (HMAC-signed token).
Footer on every marketing email:
> You're receiving this because you subscribed at AwakenAgain.com. [Unsubscribe instantly](…) · [Email preferences](…)
> Awaken With Amber LLC · 239 S 1200 W, Salt Lake City, UT 84104
Rules: honest From and subject; unsubscribe works with one click and takes effect immediately (legal max is 10 business days — do better); suppressed addresses never re-added; contact-form and order emails are not marketing consent; the address comes from `BUSINESS_POSTAL_ADDRESS` (fallback: the address above) — block sends if both are missing. Transactional mail (receipts, shipping, sign-in links, renewal notices) carries no promotional content.

## §5 Truthful marketing (FTC)
- Social proof: only real, countable numbers ("312 orders shipped" from order data) — never "trusted by hundreds" without data.
- Reviews/testimonials: real customers only, unedited in meaning, no implied cures, disclose any incentive; never fabricated or AI-written.
- Credentials: only accurate, disclosed qualifications ("Formulated by Amber Lynn Patten").
- Sourcing: precise, verified statements; no "every/never/100%" absolutes unless verified.
- Counts (herbs, products) render from data, never hard-coded.
- "Secure checkout" only beside the Stripe card path; manual methods described as manual.
- Spiritual services: for entertainment/spiritual purposes, no guaranteed outcomes, not a substitute for medical, legal, financial, or mental-health care.

## §6 Policy pages (draft templates — fill only with facts Amber supplies)
- **Privacy:** data collected (orders, email, account, cookieless analytics), purposes, processors (Stripe, Supabase, Resend, Netlify), retention, rights + deletion request email, no sale of data, children under 13.
- **Terms:** Awaken With Amber LLC (Utah), educational content, no medical advice, IP, limitation of liability, governing law Utah.
- **Shipping:** Standard $7.00, Priority $14.00 (from catalog), processing time (Amber), carriers, lost packages.
- **Returns & Refunds:** consumables/opened items, damaged items, digital/subscription refunds, how to request.
- **Accessibility:** WCAG 2.2 AA goal, contact for barriers.
- **Disclaimer:** §1 FDA text + educational/spiritual disclaimer.
- **Contact:** business email; mailing address 239 S 1200 W, Salt Lake City, UT 84104.
