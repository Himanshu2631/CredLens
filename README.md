# CredLens

**AI spend optimization for teams that run on subscriptions.**

CredLens audits your AI tool stack — subscriptions, API usage, seat allocations — and surfaces actionable recommendations to cut waste, optimize pricing tiers, and recover runway. Built as a production-ready SaaS MVP with persistent audit reports, shareable links, and Gemini-powered executive summaries.

---

## The Problem

Engineering teams paying for 6 AI subscriptions rarely know which ones actually get used, which plans are over-provisioned, or where API token budgets are silently inflating. CredLens gives you the same visibility a CFO would ask for — without requiring a CFO.

---

## Core Features

| Feature | Description |
|---|---|
| **AI Spend Audit** | Rule-based engine that evaluates tool overlap, plan tier fit, seat utilization, and API efficiency |
| **Optimization Recommendations** | Prioritized (High / Medium / Low) cards with specific dollar savings and actionable steps |
| **Gemini Executive Summary** | AI-generated narrative that contextualizes the audit for non-technical stakeholders |
| **MongoDB Persistence** | Audit reports saved to Atlas with full schema — shareable, retrievable, permanent |
| **Shareable Reports** | Public `/share/[id]` routes render a clean read-only audit view from any device |
| **Transactional Email** | Resend delivers a professional audit summary to the user's business email on save |
| **Subscriptions Hub** | Beta feature page showcasing SaaS seat management and renewal intelligence |
| **Cost Optimization Dashboard** | AI spend telemetry view with metric cards, redundancy alerts, and runway recovery insights |

---

## Screenshots

> Screenshots below reflect the current MVP build. Replace with actual captures before demo day.

### Onboarding — Spend Audit Form
```
[ Tool Stack ] → [ Spend Metrics ] → [ Use-case Intent ] → [ Generate Report ]
```
Multi-step form with per-step Zod validation, localStorage resume, and smooth step transitions.

### Audit Results Panel
Financial summary row (current spend → optimized spend → monthly savings → annual runway impact), sorted recommendation cards with expand-on-click detail, and the executive narrative block.

### Executive Summary
Gemini 2.5 Flash narrates the audit in plain English — covering spend distribution, highest-impact recommendations, and optimization posture — formatted for a founder or finance lead.

### Cost Optimization Dashboard
Metric cards (Cost Efficiency Score, Monthly Savings, Annual Runway Recovery, Workspace Utilization), telemetry chart, redundancy alerts, and a live insight feed.

### Subscriptions Hub
Beta access page with seat optimization, renewal monitoring, and duplicate SaaS detection — with a Resend-powered confirmation email on signup.

### Shared Report View
Public, read-only audit rendering at `/share/[auditId]`. No authentication required. Copy-link from the save card.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | JavaScript (ES Modules) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Forms | React Hook Form + Zod |
| Database | MongoDB Atlas via Mongoose |
| AI Provider | Google Gemini 2.5 Flash (`@google/generative-ai`) |
| Email | Resend SDK |
| Deployment | Vercel |

---

## Architecture

```
app/
├── page.js                  # Main audit flow (form + results, localStorage persistence)
├── dashboard/               # Cost Optimization Dashboard
├── subscriptions/           # SaaS Subscription Hub (beta)
├── share/[id]/              # Public read-only shared report
├── api/
│   ├── audit/               # POST — run audit, persist to MongoDB, trigger email
│   ├── leads/               # POST — capture business email + link audit
│   └── beta-requests/       # POST — save beta access request, send Resend confirmation

lib/
├── audit/
│   ├── rulesEngine.js       # 10 composable audit rules (AuditRule base class + subclasses)
│   ├── savingsCalculator.js # Pure math: sanitization, clamping, per-rule savings formulas
│   └── explanationBuilder.js# Recommendation copy catalog + structured output builder
├── ai/
│   ├── aiService.js         # Provider-agnostic AI dispatch layer
│   ├── providers/           # Gemini + mock provider implementations
│   └── prompts.js           # Structured audit summary prompt templates
├── email/                   # Resend integration, email template builders
└── db.js                    # Mongoose connection singleton with pooling

models/
├── Audit.js                 # Full audit schema: inputs, recommendations, summary, metadata
├── Lead.js                  # Business email + company capture linked to auditId
├── BetaRequest.js           # Subscription Hub beta waitlist
└── Subscription.js          # Future: recurring subscription tracking

components/
├── forms/SpendAuditForm/    # Multi-step form (ToolSelection, SpendMetrics, UseCaseSelection)
├── results/                 # AuditResultsPanel, AuditOverviewSection, RecommendationCard
├── audit/                   # AuditPreviewCard, ProviderIcon, MetricItem
└── dashboard/               # MetricCard, TelemetryChart, RedundancyAlerts, InsightFeed
```

**Data flow:**
1. User completes the 3-step form → `runSpendAudit()` fires client-side immediately for instant results
2. On "Save & Link Report" → POST `/api/audit` persists the report to MongoDB, returns `auditId`
3. Gemini summary generates server-side against the full recommendation payload
4. Resend delivers the audit summary email to the provided business email
5. A shareable `/share/[auditId]` URL is generated and copied to clipboard

---

## Engineering Decisions

**The audit engine is rule-based, not AI-calculated.**
Savings calculations happen in `lib/audit/rulesEngine.js` — pure JavaScript, fully unit-tested, deterministic. This was a deliberate choice: LLMs are unreliable at precise financial arithmetic. The AI (Gemini) only receives the already-computed recommendations and writes a plain-English summary. This separation keeps the math auditable and keeps the product honest.

**Savings clamping is explicit.**
`buildSavingsResult()` enforces hard minimum/maximum bounds on every calculated value. Floating-point edge cases and extreme input combinations otherwise silently produce negative savings or infinite percentages — both of which would destroy trust in a financial product.

**Copy and math are separated.**
`explanationBuilder.js` owns all human-readable strings (recommendation titles, `whyItMatters` copy, `actionableSteps`). `savingsCalculator.js` owns only numbers. This lets you A/B test messaging or translate strings without touching calculation logic.

**Resend over client-side email.**
Email delivery runs server-side through the Resend SDK in Next.js API routes. The API key never touches the client bundle. Using a proper transactional email provider (vs. client-side SMTP workarounds) means deliverability is production-grade from day one.

**MongoDB persistence with a full schema.**
Audit results are persisted with the full input payload, computed recommendations, AI summary, and metadata. This makes the shared report route trivial — `GET /share/[id]` fetches the document and renders it. It also sets up audit history and team workspaces as zero-schema-migration additions later.

**AI provider is pluggable.**
`lib/ai/aiService.js` dispatches to whichever provider is set in `AI_PROVIDER`. The mock provider returns realistic-looking summaries in development so you don't burn API quota on every dev reload. Switching to Claude or GPT-4o is a one-line env change.

---

## Local Setup

**Prerequisites:** Node.js 20+, a MongoDB Atlas cluster, a Gemini API key (optional for dev), a Resend API key (optional for dev).

```bash
# 1. Clone the repo
git clone https://github.com/Himanshu2631/CredLens.git
cd CredLens

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Fill in your values (see below)

# 4. Start the dev server
npm run dev
```

### Environment Variables

```bash
# .env.local

# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/credlens

# Gemini API key — leave blank to use the mock AI provider
GEMINI_API_KEY=

# AI provider: 'gemini' | 'mock'  (default: 'mock' when key is absent)
AI_PROVIDER=mock

# Resend API key — email delivery is silently skipped if not set
RESEND_API_KEY=re_...

# Sender address (must be verified in your Resend account)
RESEND_FROM_EMAIL=audit@yourdomain.com
```

### Run Tests

```bash
npm test
```

78 assertions across 8 test suites covering the savings calculator, audit engine rules, pricing utilities, DB connectivity, AI summary generation, beta request flow, email delivery, and dashboard compilation.

---

## Deployment

CredLens deploys to Vercel with zero configuration beyond environment variables.

```bash
# Deploy via Vercel CLI
npx vercel --prod
```

Set the following in your Vercel project settings under **Environment Variables**:

- `MONGODB_URI`
- `GEMINI_API_KEY`
- `AI_PROVIDER` → `gemini`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

**Production considerations:**
- MongoDB Atlas connection pooling is handled by the singleton in `lib/db.js` — no extra configuration needed for Vercel's serverless functions
- Resend API key must be server-side only — never prefix with `NEXT_PUBLIC_`
- The `AI_PROVIDER=mock` fallback means the app stays functional in environments without a Gemini key (summaries are static but data is real)

---

## Roadmap

These are the natural next milestones after MVP:

- **PDF export** — browser print stylesheet is already in `globals.css`; full PDF generation via `@react-pdf/renderer` is the next step
- **Audit history** — schema is already designed for it; needs a user session model and a `/reports` list page
- **Authentication** — NextAuth with GitHub/Google OAuth; team workspace concept follows naturally
- **Slack integration** — post audit summaries to a channel on save; webhook architecture is straightforward given the existing email flow
- **Recurring optimization checks** — cron-triggered re-audits against saved profiles; alert when pricing changes affect existing recommendations
- **Team workspaces** — shared audit history, role-based access, and comment threads on recommendations
- **CSV / Notion export** — export the recommendation list to a Notion database or spreadsheet for finance team handoff

---

## Project Structure Notes

- `data/pricing.js` — Central pricing registry for all supported AI tools. Adding a new tool means adding one entry here; the audit engine picks it up automatically.
- `lib/audit/rulesEngine.js` — Each rule is a class extending `AuditRule`. New rules are additive — no existing logic changes.
- `components/results/` — All post-audit UI. The panel is fully decoupled from the form; it only needs a valid `auditResult` object.

---

## License

MIT
