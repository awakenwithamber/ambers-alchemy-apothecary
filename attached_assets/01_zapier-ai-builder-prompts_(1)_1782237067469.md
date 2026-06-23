# Zapier AI Builder Prompts
## The Grimoire of Remembered Light — Amber's Alchemy Apothecary

Use each prompt below inside Zapier's AI Builder to generate or configure the corresponding Zap. Paste them one at a time.

---

## ZAP 1 — New Subscriber Welcome Flow

**Paste this into Zapier AI Builder:**

```
When a new Stripe subscription is created with status "active", do the following:

1. Look up or create a record in the Supabase table called grimoire_subscribers using the customer's email as the unique key. Set these fields:
   - email: customer email from Stripe
   - stripe_customer_id: customer ID from Stripe
   - stripe_subscription_id: subscription ID from Stripe
   - subscription_status: "active"
   - current_period_end: subscription current_period_end from Stripe (convert from Unix timestamp to date)
   - created_at: current date/time
   - updated_at: current date/time

2. Add or update the subscriber's email in Mailchimp (or Klaviyo). Add them to the audience/list called "Grimoire Subscribers". Set the tag: GrimoireSubscriber.

3. Send a welcome email via Gmail or your email platform using the subject: "The book recognizes you. Welcome back, Seer." and include the free digital gift download link.

4. (Optional) If using Shopify: find or create the Shopify customer by email and add the customer tag: GrimoireSubscriber.
```

---

## ZAP 2 — Subscription Canceled or Payment Failed

**Paste this into Zapier AI Builder:**

```
When a Stripe subscription status changes to "canceled", "unpaid", "past_due", "incomplete", or "incomplete_expired", do the following:

1. Find the record in the Supabase table grimoire_subscribers where email matches the Stripe customer email.

2. Update that record:
   - subscription_status: set to the new Stripe status (canceled / unpaid / past_due)
   - updated_at: current date/time

3. Remove the tag "GrimoireSubscriber" from the subscriber in Mailchimp or Klaviyo.

4. (Optional) If using Shopify: find the Shopify customer by email and remove the tag: GrimoireSubscriber.

5. Send a reactivation email with subject: "Your grimoire has gone quiet — reactivate your subscription" and include a link back to the subscription page.
```

---

## ZAP 3 — Invoice Payment Succeeded (Renewal)

**Paste this into Zapier AI Builder:**

```
When a Stripe invoice payment succeeds for a recurring subscription, do the following:

1. Find the record in Supabase grimoire_subscribers where stripe_subscription_id matches the invoice subscription ID.

2. Update that record:
   - subscription_status: "active"
   - current_period_end: new current_period_end date from Stripe
   - updated_at: current date/time

3. Confirm the subscriber still has the GrimoireSubscriber tag in Mailchimp/Klaviyo. If not, re-add it.
```

---

## ZAP 4 — Monthly Subscriber Email Send

**Paste this into Zapier AI Builder:**

```
On the 1st of every month at 9:00 AM, do the following:

1. Find all records in Supabase grimoire_subscribers where subscription_status = "active".

2. For each active subscriber, send an email via Gmail or your email platform with:
   - Subject: [Monthly — use template from email-templates file]
   - Body: Include the seasonal article, ritual of the month, recipe of the month, and a reminder of their 10% sitewide discount.

Note: If using Mailchimp or Klaviyo, instead of sending individual emails, trigger a campaign send to the "Grimoire Subscribers" audience/list segment tagged GrimoireSubscriber.
```

---

## ZAP 5 — Free Gift Delivery After Signup

**Paste this into Zapier AI Builder:**

```
When a new record is created in Supabase grimoire_subscribers with subscription_status = "active", wait 2 minutes, then:

1. Send an email to the subscriber's email address with:
   - Subject: "Your free gift from the Grimoire — welcome, Seer"
   - Body: Include the download link for the free digital gift (moon calendar PDF / ritual page / grimoire bookmark).
   - Include a reminder of their 10% discount code or Shopify tag benefit.
```

---

## ZAP 6 — Shopify Discount Tag Sync (Optional)

**Paste this into Zapier AI Builder:**

```
When a Supabase grimoire_subscribers record is updated:

- If subscription_status = "active": Find the Shopify customer by email. Add tag: GrimoireSubscriber. This activates their automatic 10% discount.

- If subscription_status = "canceled" or "unpaid": Find the Shopify customer by email. Remove tag: GrimoireSubscriber. This deactivates the discount.
```
