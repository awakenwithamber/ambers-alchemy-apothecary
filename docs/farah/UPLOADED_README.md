# FARAH OS

FARAH OS is the central AI operations layer for AwakenAgain / The Awaken Network.

## What it coordinates
- Product and platform development
- Bug detection and repair workflows
- Website + API + mobile development handoff
- SEO and content operations
- Customer service through Lunna
- Marketing and sales support
- HR/admin support
- Automation orchestration
- Shared business knowledge and operating rules

## Core architecture
- GitHub: source of truth for code and change history
- Supabase: auth, database, storage and shared application data
- n8n: automation and agent workflow orchestration
- Flowise (optional): visual AI assistants and RAG flows
- Expo/React Native: Android + iOS app
- Web app: React/Next.js or existing AwakenAgain frontend
- Playwright: browser testing
- Google Search Console: SEO/indexing monitoring

## Safety model
FARAH may autonomously research, draft, test, document and prepare changes. High-risk actions require owner approval before execution, including payments, refunds above limits, account deletion, permission changes, database migrations, production secrets, legal commitments, publishing medical claims, and destructive production changes.

## Start here
1. Copy `.env.example` to `.env`.
2. Add only the credentials you intentionally want the system to use.
3. Review `config/permissions.yaml`.
4. Customize `knowledge/brand.md` and `knowledge/business.md`.
5. Import the n8n templates in `automations/`.
6. Connect your repository and Supabase project.
7. Run tests before enabling any production automation.

## Agents
- FARAH — Operations Director / Orchestrator
- FORGE — Developer / Bug Fixer / Upgrader
- SAGE — SEO / Research / Content Strategy
- LUNNA — Customer Service / Community Concierge
- SPARK — Sales / Marketing / Campaigns
- HAVEN — HR / Admin / SOPs / Onboarding
- SENTINEL — QA / Security / Release Gatekeeper

