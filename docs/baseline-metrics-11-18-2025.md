# LearnFlow Performance Baseline - November 18, 2025

## 1. Bundle Metrics

### Production Build Output
```
Command: npm run build
Date: 2025-11-18
Branch: enhancement/personalization-and-content-updates

Main JS Bundle:
  - dist/assets/index-DWZRz8zB.js: 1,827.39 KB (minified)
  - Gzip: 571.00 KB
  - Single chunk (warning: >500 KB)

CSS Bundle:
  - dist/assets/index-CnM4WEi6.css: 137.17 KB (raw)
  - Gzip: 20.60 KB

HTML:
  - dist/index.html: 7.67 KB
  - Gzip: 2.69 KB

Browser (preload):
  - dist/assets/browser-DjXkBhpK.js: 0.30 KB
  - Gzip: 0.25 KB
```

### Key Observations
- Main bundle is **571 KB gzipped** (single chunk - no code splitting detected)
- Warning: Rollup suggesting `dynamic import()` and `manualChunks` for optimization
- Dynamic import conflict detected: `triggerMentalModelGeneration.ts` imported both dynamically and statically
- CSS is well-optimized at 20.6 KB gzip
- **Potential quick wins**: Code-split by route, lazy-load heavy features

---

## 2. Code Quality Metrics

### ESLint Results
```
Command: npm run lint
Date: 2025-11-18

Total: 339 problems
- Errors: 308
- Warnings: 31

Top Issues by Category:
1. lucide-react restricted imports: ~100 errors
   - Files affected: Nearly all UI and components
   - Issue: ESLint rule forbids lucide-react but it's used everywhere
   - Action needed: Either remove restriction or update imports

2. Unexpected 'any' type violations: ~80 errors
   - Spread across: hooks, utils, edge functions, components
   - Files: useBehaviorTracking, AIContentModal, LearningJourney, etc.
   - Action needed: Add proper TypeScript types

3. React Hook exhaustive-deps: ~25 warnings
   - Files: useChat, useLearningSession, useStepNavigation, etc.
   - Issue: Missing dependencies in useEffect/useCallback
   - Severity: Medium (potential stale closures)

4. Fast refresh export violations: ~15 warnings
   - Files: PersonalizationDiscoveryContext, theme-provider, etc.
   - Issue: Mixing components with constants in same file
   - Action needed: Split into separate files

5. Miscellaneous:
   - @ts-nocheck on edge functions: 3 errors
   - prefer-const violations: 2 errors
   - Empty interface types: 3 errors
```

### TypeScript Compilation
```
Command: npx tsc --noEmit
Result: ✓ 0 errors

Full type safety achieved - no compilation errors.
```

---

## 3. Lighthouse Report

**Status: Pending** - requires browser automation setup with dev server running on localhost:5173

Planned routes to test:
- `/` (Home)
- `/plan` (Learning Plan)
- `/content` (Content Display)

Metrics to capture:
- Performance score
- PWA score
- SEO score

---

## 4. React DevTools Profiler

**Status: Pending** - requires React DevTools + profiler session on running app

Components to profile:
- `ContentPage` - used for displaying learning content
- `LearningCommandCenter` - central learning interface

Watch for:
- Commits >16 ms (target for 60 FPS)
- Unnecessary re-renders
- Memoization opportunities

---

## 5. Supabase Query Analysis

**Status: Pending** - requires `supabase logs tail` while exercising app

Command to run:
```bash
supabase logs tail --project hjivfywgkiwjvpquxndg --limit 50
```

Items to look for:
- Query execution times (>100ms flagged)
- Repetitive errors
- Connection timeouts
- N+1 queries
- Hot tables (tables hit most frequently)

---

## 6. Summary & Recommendations

### Immediate Actions (High Priority)
1. **Fix ESLint lucide-react restriction** - Either remove the rule or update all imports
2. **Add TypeScript types for `any`** - ~80 violations across codebase
3. **Code split main bundle** - 571 KB is too large for single chunk
4. **Fix React Hook deps** - ~25 missing dependencies could cause bugs

### Medium Priority
1. Implement React.memo/useMemo in content components
2. Lazy-load heavy edge functions (Replicate, TTS)
3. Set up React Profiler CI tracking
4. Implement Lighthouse CI checks

### Investigation Needed
1. Why lucide-react is restricted (seems counter to brand enforcement)
2. Whether audio/TTS features can be lazy-loaded
3. Supabase query patterns (look for N+1)
4. Context re-render patterns in PersonalizationDiscoveryContext

---

## Baseline Metrics Table

| Metric | Value | Status | Next Steps |
|--------|-------|--------|-----------|
| JS Bundle (gzip) | 571 KB | ⚠️ Large | Code split by route |
| CSS Bundle (gzip) | 20.6 KB | ✓ Good | Maintain |
| Total Size | 591.6 KB | ⚠️ Large | Target: <400 KB |
| TypeScript errors | 0 | ✓ Clean | Maintain |
| ESLint errors | 308 | ⚠️ High | Fix lucide/any types |
| ESLint warnings | 31 | ⚠️ Medium | Fix hook deps |
| Lighthouse (pending) | — | ⏳ Waiting | Run browser tests |
| React Profiler (pending) | — | ⏳ Waiting | Profile content views |
| Supabase logs (pending) | — | ⏳ Waiting | Monitor queries |

---

## Files Affected (By Issue Type)

### lucide-react Import Errors (100+ files)
Sample files:
- src/components/ai/AIErrorState.tsx
- src/components/home/HeroSection.tsx
- src/components/content/ContentHeader.tsx
- src/components/navigation/MainNav.tsx
- src/components/projects/DeleteProjectDialog.tsx
- All UI components in src/components/ui/

### TypeScript `any` Violations
- src/hooks/analytics/useBehaviorTracking.ts
- src/components/journey/LearningJourneyWizard.tsx (17 violations)
- src/pages/AdminGenerateTopics.tsx
- src/utils/markdown/markdownComponents.tsx

### React Hook Dependency Issues
- src/components/content/loading/KnowledgeNuggetLoading.tsx
- src/hooks/content/useChat.tsx
- src/hooks/analytics/useLearningSession.tsx

---

**Report Generated:** 2025-11-18 by Performance Baseline Task
**Status:** Initial metrics captured; Lighthouse and profiler pending browser setup

