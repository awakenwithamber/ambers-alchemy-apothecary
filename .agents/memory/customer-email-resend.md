---
name: Customer email (Resend)
description: How customer-facing email works on this site and why Replit Mail can't be used for it
---

# Customer email

Customer-facing email (purchase confirmations, weekly promo) uses the **Resend** Replit connector, NOT the Replit Mail blueprint.

**Why:** Replit Mail (replitmail blueprint) can only send to the repl owner — it cannot email arbitrary customers. Any feature that emails buyers/subscribers must go through Resend (or another real ESP connector). Resend additionally requires the user to verify a sending domain before mail reaches real inboxes; until then it only sends from `onboarding@resend.dev` to the account's own email.

**How to apply:**
- Transport wrapper skips gracefully (logs + returns `{skipped:true}`) until the Resend connector is connected, so the rest of the app keeps working.
- Unsubscribe links are token-verified with `HMAC-SHA256(email, GRIMOIRE_JWT_SECRET)` (no token column). The secret must be present — fail closed (503), never fall back to a hardcoded secret, or links become forgeable.
- Purchase confirmations are made idempotent against webhook retries via an atomic claim: `UPDATE orders SET confirmation_sent_at=now() WHERE order_id=? AND confirmation_sent_at IS NULL RETURNING ...` — only send if a row was claimed.
- Weekly promo single-send is enforced by an atomic per-week claim row in `promo_sends` (id = `promo_week_<weekIndex>`); insert-conflict means already claimed. Don't rely on in-memory check-then-send timing. Manual admin sends only log a row when something was actually delivered, so a disconnected/empty run never blocks the scheduler's freshness check.
