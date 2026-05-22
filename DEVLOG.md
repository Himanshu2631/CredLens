## Day 1

**Hours worked:** 6

**What I did:**
- Set up the project using Next.js App Router
- Configured Tailwind CSS and shadcn/ui
- Created the initial folder structure and reusable layout system
- Built the landing page structure with navbar, hero section, and footer
- Added a responsive audit preview section
- Refactored repeated UI into reusable components
- Improved responsiveness and cleaned up the frontend structure
- Connected the project to GitHub and deployed the initial version on Vercel

**What I learned:**
- Good SaaS UI design depends a lot on spacing, typography, and layout consistency
- Reusable components make the frontend easier to manage and scale later
- Small UI improvements can make the app feel much more professional

**Blockers / what I'm stuck on:**
- Spent extra time adjusting responsive spacing for different screen sizes
- Needed multiple UI refinements to avoid making the landing page look like a generic template

**Plan for tomorrow:**
- Build the spend input form using React Hook Form
- Add localStorage persistence for form data
- Start working on the audit input flow and user interaction

---

## Day 2

**Hours worked:** 7

**What I did:**
- Built the multi-step `SpendAuditForm` using React Hook Form + Zod validation
- Split the form into 3 composable steps: Tool Stack → Spend Metrics → Use-case Intent
- Implemented `localStorage` persistence so users can resume a partially completed form on reload
- Created `ToolSelection.jsx` with a tool card grid and plan picker per tool
- Created `SpendMetrics.jsx` with a combined range slider + numeric input for monthly spend, and a custom stepper for seat counts
- Created `UseCaseSelection.jsx` with a tile-based use-case selector and optional goal textarea
- Added `FormProgressBar.jsx` and per-step validation via `trigger()` before advancing
- Wired up Zod schema per step to prevent bad data from propagating
- Created centralized pricing registry (`data/pricing.js`) with per-tool plan definitions, seat pricing flags, and min-seat constraints

**What I learned:**
- React Hook Form's `FormProvider` + `useFormContext` pattern makes splitting multi-step forms clean without prop drilling
- Zod's `.coerce` is essential for numeric inputs coming from string-typed HTML inputs
- Persisting form state to `localStorage` needs to happen **after mount** (`isMounted` flag) to avoid SSR hydration mismatches

**Blockers / what I'm stuck on:**
- The `watch()` function from `react-hook-form` is incompatible with React Compiler memoization — accepted as a known library limitation, not a product bug

**Plan for tomorrow:**
- Build the audit recommendation engine
- Implement rules for: tool redundancy, plan tier mismatches, API efficiency strategies, and seat pruning
- Structure output for financial clarity and believability

---

## Day 3

**Hours worked:** 8

**What I did:**

### Audit Engine Architecture
- Designed and implemented a clean rule-based audit engine in `lib/audit/`
- Created `savingsCalculator.js`: pure math utilities with no UI coupling
  - `sanitizeAuditInputs()` — normalizes all form data with full boundary checking
  - `buildSavingsResult()` — clamped savings result builder (no negative savings, no impossible values)
  - `calculatePlanDowngradeSavings()`, `calculateRedundantToolSavings()`, `calculateApiStrategySavings()` — rule-specific math helpers
- Created `explanationBuilder.js`: centralized copy catalog + recommendation formatter
  - `RECOMMENDATION_TEMPLATES` map with real, startup-focused copy for all 10 rules
  - `buildRecommendation()` — assembles a structured recommendation object with both raw numbers and formatted strings
  - `formatAuditReport()` — wraps the raw summary + recommendations into a clean, API-ready report shape
- Created `rulesEngine.js`: 10 audit rules as composable classes extending `AuditRule`
  - Rules cover: Copilot/Cursor overlap, general chat overlap, ChatGPT Team 1-seat, Claude Team under-minimum, oversized enterprise tiers, Gemini licensing, Anthropic prompt caching, OpenAI mini migration, OpenAI context pruning, and inactive seat pruning

### New Rule: PruneInactiveSeatsRule
- Fires when explicit `inactiveSeats` is provided, or when team size ≥ 5 (20% estimated baseline)
- Calculates inactive seat overhead across all subscription tools
- Generates actionable steps pointing to the specific admin consoles to deactivate seats

### Recommendation Schema Design
- Each recommendation exposes both the new structured schema and legacy flat fields for backward compatibility:
  - New: `estimatedSavings.monthly`, `estimatedSavings.formattedMonthly`, `estimatedImpact`, `whyItMatters`, `actionableSteps`
  - Legacy: `estimatedMonthlySavings`, `estimatedYearlySavings`, `priority`, `optimizedMonthlyCost`

### Testing & Validation
- Written 78 assertions across 3 test suites:
  - `tests/test-savings-calculator.mjs` — 27 assertions covering sanitization, subscription baseline, savings formatting, and API strategy math
  - `tests/test-audit-engine.mjs` — 45 assertions across 6 scenario fixtures (solo dev, Series A team, enterprise abuse, schema validation, zero-recommendation, implicit seat estimation)
  - `tests/test-pricing-utils.mjs` — 6 assertions covering pricing registry access and legacy audit adapter
- All 78 assertions pass with zero failures

### Engineering Cleanup (Day 3 End Pass)
- Added `"type": "module"` to `package.json` — eliminates Node.js ES module reparsing overhead warning on test execution
- Added `"test"` npm script — developers can now run all suites with `npm test`
- Fixed `next.config.mjs` — added `turbopack.root: __dirname` to suppress the spurious "multiple lockfiles" Turbopack workspace detection warning
- Refactored `generateAuditAnalysis` in `data/pricing.js` — marked `@deprecated`, added structured JSDoc, retained full backward compatibility with the pricing-utils test suite, and added inline comments explaining the circular dependency boundary that prevents a live import of `runSpendAudit`
- Zero ESLint errors; 1 pre-existing React Compiler warning on `watch()` (known upstream library limitation, not a bug)

**What I learned:**
- Separating "copy" from "math" in the recommendation engine makes both significantly easier to maintain and test independently
- Savings estimates need explicit clamping — otherwise floating point errors and edge cases silently produce negative or infinite "savings"
- ESM module type declaration in `package.json` is essential for a clean Node.js test DX; without it, Node.js parses every file twice

**Plan for Day 4:**
- Build the audit results panel (right-side read panel after form submission)
  - Summary metrics block: current spend, optimized spend, runway restored %
  - Recommendation list with expandable cards showing `whyItMatters` + `actionableSteps`
  - Priority sorting (High → Medium → Low) with filtered views
- Wire the form's `onSubmitSuccess` callback to populate the results panel
- Add subtle transition animations between form submission and results reveal
- Consider: PDF/CSV export of the audit report using the `recommendationExplanations` catalog

---

## Day 4

**Hours worked:** 5

**What I did:**

### Audit Results Page Structure
- Created a new `components/results/` directory with 5 focused components:
  - `ImpactBadge.jsx` — reusable High/Medium/Low priority indicator pill
  - `AuditMetricTile.jsx` — single KPI cell: mono label + large tabular-nums value + subtext
  - `SummaryMetricsRow.jsx` — 4-KPI strip (current spend → optimized → monthly savings → annual savings), 2×2 on mobile / 1×4 on desktop
  - `AuditRecommendationCard.jsx` — expand-on-click card: collapsed = scan line, expanded = `whyItMatters` + numbered `actionableSteps` + savings breakdown footer
  - `AuditEmptyState.jsx` — zero-recommendation positive state ("Your AI stack looks lean")
- Composed all sub-components into `AuditResultsPanel.jsx`:
  - Report header: audit date, tool count, status indicator, "Re-run Audit" ghost button
  - `SummaryMetricsRow` consumes `auditResult.summary` directly
  - Recommendations sorted High → Medium → Low before rendering
  - Footer shows subscription baseline cost for engineering accountability

### page.js Integration
- Replaced the dev-only JSON inspector block with `AuditResultsPanel`
- Right column now conditionally renders: idle → rules catalog, post-submit → results panel
- Wired `onReset` to clear `activeAudit` state and return to form view
- Added `scrollIntoView` on submit for mobile UX

### ProviderIcon Expansion
- Extended `ProviderIcon` from 3 providers (openai, anthropic, default) to 9:
  - `chatgpt`, `claude`, `cursor`, `copilot`, `gemini`, `openai_api`, `anthropic_api`, `v0_dev`, `all`
  - Each has a distinct SVG icon mark and accent color for instant visual differentiation at 28px

### Engineering Quality
- Zero ESLint errors on all new components
- Dev server starts clean with no compilation errors
- Every rendered number comes from `runSpendAudit()` output — no hardcoded demo data

**What I learned:**
- `tabular-nums` in Tailwind is essential for financial values — prevents layout shifts as digits change between recommendations
- Expand-on-click (Linear pattern) keeps a long recommendation list scannable without modals or extra navigation
- Conditional right-column rendering (form idle state → results state) is cleaner UX than showing both simultaneously — the form recedes, the report takes focus

**Plan for Day 5:**
- Add filter tabs (All / High / Medium / Low) above the recommendation list
- Wire a "Copy Report" button that serializes the `recommendationExplanations` dict to clipboard
- Add a print/PDF stylesheet for a clean export-ready format
- Consider persisting the last audit result to `localStorage` so users can return to their report