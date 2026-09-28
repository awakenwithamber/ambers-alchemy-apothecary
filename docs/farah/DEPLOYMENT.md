# Deployment Order

## Phase 1 — Foundation
1. Create or choose the GitHub repository.
2. Create a Supabase project and schema.
3. Put all secrets in the hosting platform's secret manager, not the repository.
4. Connect staging deployment.
5. Add Playwright smoke tests.

## Phase 2 — Automation
1. Deploy n8n Community Edition on a low-cost host or existing server.
2. Add GitHub, Supabase, email and monitoring credentials in n8n's credential vault.
3. Start with Bug-to-PR and Support workflows.
4. Keep destructive actions disabled.

## Phase 3 — Customer AI
1. Build the approved knowledge collection.
2. Give LUNNA retrieval access to knowledge, not raw production tables by default.
3. Enable read-only account lookup only where necessary.
4. Require handoff for refunds/security/legal/safety.

## Phase 4 — Mobile
1. Connect Expo/React Native app to the same Supabase backend.
2. Implement auth, profiles, covens/groups, feed, events and notifications.
3. Run closed beta.
4. Publish when store requirements are satisfied.
