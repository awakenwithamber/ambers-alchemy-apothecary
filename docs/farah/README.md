# Farah agent network — reference documents

These files were supplied with the Sept 2026 master build prompt and are kept
here as **planning reference only**. Nothing in this folder is executed or
deployed.

- `FARAH.md`, `FORGE.md`, `HAVEN.md`, `LUNNA.md`, `SAGE.md`, `SENTINEL.md`,
  `SPARK.md` — agent role descriptions.
- `permissions.yaml` — the proposed agent permission model. Agents must stay
  read-only / draft-only until Amber approves each capability.
- `brand.md`, `business.md`, `BUILD_STATUS.md`, `DEPLOYMENT.md`,
  `FIRST_30_DAYS.md`, `UPLOADED_README.md` — context from the upload.
- `reference/001_awaken_network_core.sql` — the uploaded schema draft. It is
  **not** a migration and must not be copied into
  `netlify/database/migrations/` without review: live migrations are
  roll-forward only and must match the existing `orders` / `audit_log` tables.
- `reference/farah-os.package.json.txt`, `reference/farah-os.tsconfig.json.txt` — from the upload's
  separate agent project; not used by this site.

The live Lunna guide is `netlify/functions/lunna.mjs` + `js/lunna.js`.

The upload also contained a `.env.example` and a `.gitignore` for the separate
agent project. They were deliberately not copied here. The example file lists
these variable names (values must only ever live in the host's environment
settings, never in Git): `AI_PROVIDER`, `AI_MODEL`, `AI_API_KEY`,
`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_DEFAULT_BRANCH`, `N8N_BASE_URL`,
`N8N_API_KEY`, `FLOWISE_BASE_URL`, `FLOWISE_API_KEY`, `PUBLIC_SITE_URL`,
`STAGING_SITE_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`,
`SENTRY_DSN`, `OWNER_APPROVAL_EMAIL`. None of them are needed by the live site;
Supabase is not the site's database (Netlify Database is), so the Supabase
names apply only if that agent project is ever built.
