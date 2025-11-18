# LearnFlow Optimization Program

Central ledger for every optimization initiative. Treat this file as the single source of truth: before starting work, claim a task by setting `Status` to `in-progress`, add your handle, and link PRs/tests in the `Deliverables` line when finished. I’ll keep this file curated so all agents share the same playbook.

## How To Use This Plan
- Always open `.claude/skills/feature-planning/SKILL.md` before scoping a ticket; capture its checklist inside your PR/issue.
- Any UI-related task must also review `.claude/skills/brand-enforcement/SKILL.md` and confirm brand-safe colors, Lucide icons, typography, and responsive behavior.
- Async operations require loading/error states that follow `.claude/skills/error-handling/SKILL.md` and leverage `AILoadingState` / `AIErrorState` components where applicable.
- Required status values: `pending`, `in-progress`, `blocked`, `needs-review`, `done`.
- When you complete a task, update this file and notify the orchestrator (me) so I can validate against checklists before we mark `done`.

## Baseline & Progress Metrics
| Metric | Command / Source | Last Sample | Notes |
| --- | --- | --- | --- |
| Bundle size (client) | `npm run build && npx vite-bundle-visualizer` | 2025-11-18 — JS 571 KB gzip, CSS 20.6 KB gzip | Single chunk >500 KB; needs route-based code splitting |
| Route module weight | `npx source-map-explorer dist/assets/index-*.js` + `scripts/analyze-bundle-modules.js` | 2025-11-18 — Content 128 KB, Home 96 KB, Audio 64 KB, Journey 58 KB, Projects 42 KB, Community 36 KB | Report: `reports/route-weight.html`; lazy-load Audio/Journey/Projects/Community |
| Render complexity review | Static analysis of `src/pages/**` + component tree tracing | _pending_ | Document components with heavy props/state before optimization; no browser profiling |
| Supabase query audit | Review `supabase/functions/**`, `supabase/migrations/**` | _pending_ | Code-based analysis of queries/index usage; note hotspots |
| ESLint / TypeScript | `npm run lint`, `tsc --noEmit` | 2025-11-18 — ESLint 308 errors / 31 warnings; TSC 0 errors | Lint errors dominated by lucide rule + `any` usage |

---

## Phase 0 – Baseline & Guardrails

### [P0-01] Capture Initial Metrics
- **Status:** `in-progress` **Owner:** Baseline Task (2025-11-18) **Dependencies:** none
- **Scope:** Run every command in the metrics table and record results above (include date, branch, env).
- **Progress:**
  - ✓ Bundle build: 571 KB gzip (single chunk, no code-splitting)
  - ✓ ESLint/TypeScript: 308 errors / 31 warnings; 0 TS errors
  - ✓ Module analysis: Top 10 modules identified (~158 KB potential savings); HTML report saved to `reports/route-weight.html`
  - ✓ Dependency audit: @radix-ui (38 KB), recharts (24 KB), lucide-react (24 KB), date-fns (19 KB), react-syntax-highlighter (14 KB)
  - ⏳ Render complexity review (ContentPage + LearningCommandCenter trees)
  - ⏳ Supabase query audit (functions + migrations)
- **Files/Areas:** `docs/optimization-plan.md`, `docs/baseline-metrics-11-18-2025.md`, `reports/route-weight.html`, `scripts/analyze-bundle-modules.js`, `src/pages/**`, `supabase/functions/**`.
- **Deliverables:** Metrics table updated + raw reports attached to repo (or linked).
- **Verification:** Pending metrics collected + orchestrator validation; outstanding items moved to follow-up tickets if blocked.

### [P0-02] Lint & Type Health Sweep
- **Status:** `in-progress` 
- **Owner:** Performance Analysis / 2025-11-18
- **Scope:** Run `npm run lint` and `tsc --noEmit`, categorize errors by directory, open follow-up tickets for each category.
- **Files/Areas:** `eslint.config.js`, `tsconfig*.json`, entire `src/**`.
- **Findings (Baseline):**
  - **ESLint:** 308 errors, 31 warnings
    - lucide-react restricted imports: ~100 errors (contradicts brand enforcement rule?)
    - TypeScript `any` violations: ~80 errors (highest priority)
    - React Hook exhaustive-deps missing: ~25 warnings
  - **TypeScript:** ✓ 0 errors (full type safety)
  - **Detailed report:** See `docs/baseline-metrics-11-18-2025.md`
- **Deliverables:** Summary block + detailed baseline report
- **Verification:** No uncategorized errors remain; CI command outputs stored.

### [P0-03] TODO / FIXME Backlog
- **Status:** `pending`
- **Scope:** `rg -n "TODO|FIXME" src supabase` and log each finding (file, context) into a backlog table; mark quick wins.
- **Deliverables:** New subsection “Inline Debt Log” in this file with entries.
- **Verification:** Spot check multiple files to confirm coverage.

### [P0-04] Brand & Skills Enforcement Check
- **Status:** `pending`
- **Scope:** Audit recent PRs/components for brand violations, confirm every future ticket references the required skills.
- **Deliverables:** Short checklist result and remediation tickets if violations exist.
- **Verification:** Orchestrator sign-off.

---

## Phase 1 – Architecture & Data Layer

### [P1-01] Hook & State Inventory
- **Status:** `pending`
- **Scope:** Map each file under `src/hooks/**` to its data sources (tables, edge functions, Zustand stores). Flag duplicated logic, missing loading/error handling, and inconsistent React Query usage.
- **Deliverables:** Table added in this task with columns: Hook, Domain, Data Source, Issues, Follow-up Ticket.
- **Verification:** Random hook spot checks confirm metadata accuracy.

### [P1-02] Supabase Functions Audit
- **Status:** `pending`
- **Scope:** Review every folder under `supabase/functions/`; document handler purpose, dependencies on `_shared`, error/logging gaps, and type mismatches with `src/integrations/supabase/types.ts`.
- **Deliverables:** Per-function checklist + prioritized fixes.
- **Verification:** Ensure regenerated types when schema drift found.

### [P1-03] Routing & Layout Consolidation
- **Status:** `pending`
- **Scope:** Inspect `src/pages/**` and `src/components/navigation/**` for duplicate layout wrappers or navigation state. Propose shared layout components and document route tree.
- **Deliverables:** Route map diagram (text-based) + list of consolidation tasks.
- **Verification:** Orchestrator reviews for coverage of all top-level routes.

### [P1-04] Store & React Query Alignment
- **Status:** `pending`
- **Scope:** Evaluate `src/store/*` and React Query usage for overlapping responsibilities; define guidelines for when to use each.
- **Deliverables:** Policy note inside this task + tickets for required refactors.
- **Verification:** Sample components align with new policy.

---

## Phase 2 – Vertical Feature Pods
Each pod uses the Feature Planning template (user story, data model, backend/frontend/state, dependencies). Agents update the pod section directly.

### Pod LRN – Learning & Journey (`src/components/learning/**`, `src/components/journey/**`, `src/components/learning-command-center/**`, `src/hooks/learning-steps/**`)
1. **[LRN-01] Data Flow & Progress Mapping** – Document how learning paths/steps move from Supabase to UI, note missing indexes or cache opportunities. _Status: pending._
2. **[LRN-02] Hook Consolidation** – Ensure single source for fetching/updating steps; add loading/error/empty states via `AILoadingState`/`AIErrorState`. _Status: pending._
3. **[LRN-03] Navigation & Progress UI Audit** – Review `useStepNavigation`, `LearningCommandCenter` for responsiveness, accessibility, and brand compliance. _Status: pending._

### Pod CNT – Content & AI (`src/components/content/**`, `src/components/ai/**`, `src/hooks/content/**`, `supabase/functions/generate-*`)
1. **[CNT-01] Display Mode Performance Review** – Profile Text/Slides/Audio/Chat/Images components for unnecessary renders; capture React Profiler traces. _Status: pending._
2. **[CNT-02] Edge Function Contract Audit** – Ensure frontend payloads match `generate-learning-content`, `generate-deep-dive-topics`, etc.; document schema + error handling improvements. _Status: pending._
3. **[CNT-03] UX Loading & Retry Patterns** – Verify streaming indicators, toast notifications, and retry logic for AI calls. _Status: pending._

### Pod AUD – Audio & Podcast (`src/components/audio/**`, `src/components/audio-page/**`, `src/components/podcast/**`, `hooks/audio/**`, `supabase/functions/text-to-speech`, `openai-tts`)
1. **[AUD-01] Player Component Audit** – Standardize waveform/player primitives, ensure memoization and lazy loading. _Status: pending._
2. **[AUD-02] TTS Pipeline Review** – Document ElevenLabs/OpenAI flows, caching, and storage usage; add cost-control levers. _Status: pending._
3. **[AUD-03] Accessibility & Controls** – Ensure keyboard control, captions, and brand-compliant UI. _Status: pending._

### Pod COM – Community & Projects (`src/components/community/**`, `src/components/projects/**`, `hooks/projects/**`, `hooks/community/**`)
1. **[COM-01] Card/List Pattern Alignment** – Move to shared UI components, enforce brand colors, add pagination/sorting hooks. _Status: pending._
2. **[COM-02] Project Data Consistency** – Audit Supabase interactions for projects/work outputs; ensure optimistic updates or proper invalidation. _Status: pending._
3. **[COM-03] Engagement Metrics** – Define and log analytics events via `hooks/analytics/**`. _Status: pending._

### Pod PER – Personalization & Profile (`src/components/personalization/**`, `src/components/profile/**`, `hooks/personalization/**`, `contexts/PersonalizationDiscoveryContext.tsx`)
1. **[PER-01] Context Footprint Review** – Measure context value sizes and memoization to prevent rerenders. _Status: pending._
2. **[PER-02] Supabase Subscription Hygiene** – Ensure subscriptions unsubscribe on unmount and handle reconnection. _Status: pending._
3. **[PER-03] Brand & Accessibility Audit** – Verify Poppins weights, gradients, and label/ARIA coverage. _Status: pending._

---

## Phase 3 – Shared UI & Utilities

### [UI-01] Component Library Consolidation (`src/components/ui/**`)
- **Status:** `pending`
- **Scope:** Catalog all 53 UI components, deprecate duplicates, document canonical variants (buttons, cards, badges, inputs).
- **Deliverables:** Matrix of components → consumers, plus refactor tickets.
- **Verification:** No feature imports deprecated components after cleanup.

### [UI-02] Styling & Token Enforcement (`src/index.css`, `tailwind.config.ts`, `App.css`)
- **Status:** `pending`
- **Scope:** Ensure only brand colors/gradients exist; move stray hex codes into Tailwind config tokens.
- **Deliverables:** Diff summary + updated brand checklist in this task.
- **Verification:** `rg "#[0-9a-fA-F]{3,6}" src` only matches approved palette.

### [UT-01] Utilities & Lib Audit (`src/utils/**`, `src/lib/utils.ts`)
- **Status:** `pending`
- **Scope:** List every helper, mark unused ones, add tests for non-trivial logic, consolidate duplicated formatters.
- **Deliverables:** Inventory table + PR links for removals/tests.
- **Verification:** Dead code eliminated; tests cover key helpers.

---

## Phase 4 – Tooling, Testing & Observability

### [TQ-01] Lint/TS Enforcement
- **Status:** `pending`
- **Scope:** Add rules for path aliases, exhaustive-deps, forbidden colors/icons; ensure CI gating.
- **Deliverables:** Updated `eslint.config.js`, `tsconfig*.json`, CI proof.
- **Verification:** CI fails when violations introduced.

### [TQ-02] Test Coverage Expansion
- **Status:** `pending`
- **Scope:** Introduce Vitest/React Testing Library for hooks (content generation, learning steps) and Playwright smoke for critical flows.
- **Deliverables:** Coverage report baseline + test plan.
- **Verification:** Tests run in CI; coverage % recorded here.

### [TQ-03] Edge Function Observability
- **Status:** `pending`
- **Scope:** Standardize logging schema for `supabase/functions/**`, add error metrics, consider lightweight tracing.
- **Deliverables:** Shared logger utility + docs snippet in this task.
- **Verification:** Logs show correlation IDs across functions.

### [TQ-04] Release & Regression Checklist
- **Status:** `pending`
- **Scope:** Define final QA checklist (brand, accessibility, metrics) to run after each phase.
- **Deliverables:** Checklist appended here + reference to automation (scripts or CI jobs).
- **Verification:** At least one phase completes the checklist with recorded results.

---

## Ticket Template (Copy/Paste)
```
[TASK-ID] <Descriptive Name>
Status: pending → in-progress → needs-review → done
Owner: @handle
Scope: <what to inspect/update>
Files/Areas: <paths>
Dependencies: <other tasks or migrations>
Steps:
  1. Review feature plan & brand enforcement skills.
  2. ...
Deliverables:
  - PR: <link>
  - Tests: <commands/results>
Verification:
  - Checklist items ticked
  - Metrics updated if applicable
```

Use this template when adding new tasks so every agent receives consistent instructions and the orchestrator can track progress centrally.

---

## 🔍 Baseline Metrics Summary (November 18, 2025)

**Date:** 2025-11-18  
**Branch:** `enhancement/personalization-and-content-updates`  
**Status:** P0-01 `in-progress`, P0-02 `in-progress`

### Performance Baselines Captured

| Component | Metric | Value | Status | Target |
|-----------|--------|-------|--------|--------|
| **JavaScript Bundle** | Gzip size | 571 KB | ⚠️ High | < 400 KB |
| **CSS Bundle** | Gzip size | 20.6 KB | ✓ Good | Maintain |
| **Total Bundle** | Combined gzip | 591.6 KB | ⚠️ High | < 420 KB |
| **TypeScript** | Compilation errors | 0 | ✓ Clean | 0 (maintain) |
| **ESLint** | Total issues | 308 errors, 31 warnings | ⚠️ High | <50 total |
| **Route module weight** | Content 128 KB, Home 96 KB, Audio 64 KB, Journey 58 KB, Projects 42 KB, Community 36 KB | ⚠️ High | Lazy-load non-core routes; see `reports/route-weight.html` |
| **Render complexity** | Pending | — | ⏳ Next | document heavy trees |
| **Supabase query audit** | Pending | — | ⏳ Next | flag expensive queries |

### Quick Wins Identified

1. **Fix lucide-react ESLint rule** - ~100 errors, contradicts brand enforcement policy
2. **Remove `any` types** - ~80 violations (focus on highest-impact files first)
3. **Code-split main bundle** - 571 KB single chunk can be split by route
4. **Fix Hook dependencies** - ~25 warnings (exhaustive-deps)

### Files Pending Analysis

- Component complexity audit: `src/pages/ContentPage.tsx`, `LearningCommandCenter/index.tsx`, related children
- Supabase query/code review: `supabase/functions/**`, migrations touching learning/content tables

### Detailed Metrics Report

📄 **Full report:** `docs/baseline-metrics-11-18-2025.md`

