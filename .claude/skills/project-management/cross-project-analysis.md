# Cross-Project Analysis

Detect duplicated code, patterns, and bugs across all 15 projects.

## When to Use

- Weekly sweep: Find code duplication
- Before refactoring: Identify what to extract
- Bug fixes: Check if same issue exists elsewhere
- Pattern detection: Find repeated solutions

## Behavior

### 1. Scan All Projects

For each of 15 projects:
- Clone/refresh latest code
- Index all TypeScript, JavaScript, Python, PHP, SQL files
- Extract function signatures, API endpoints, database schemas
- Catalog error handling patterns
- Note package versions and dependencies

### 2. Find Duplications

#### Code Duplication
```typescript
// Found in 3 projects: Help Genie Consumer, OMNI, LearnFlow
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

Duplication: 100% match in:
  • help-genie-consumer/src/utils/validation.ts:42
  • Omni-Intelligence-Main/lib/validation.js:15
  • LearnFlow/src/helpers/validation.py:28
```

#### Pattern Duplication
```
Found: "Error handling wrapper" in 4 projects
  • OMNI: src/middleware/errorHandler.js
  • Help Genie Consumer: utils/errorBoundary.tsx
  • Help Genie Voice: src/handlers/error.ts
  • LearnFlow: app/middleware.py

Recommendation: Extract to shared package
```

#### API Endpoint Duplication
```
Found: User authentication endpoints duplicated
  • Help Genie Consumer: POST /api/auth/login
  • OMNI: POST /api/v1/auth/login
  • LearnFlow: POST /auth/login

Issue: 3 different implementations, inconsistent response format
Recommendation: Create shared auth service
```

### 3. Detect Common Bugs

When a bug is fixed in one project, check others:
```
Fixed in Help Genie Consumer: Race condition in token refresh
  → Check other projects with token logic...
  → Found in: Help Genie Mobile (SAME BUG)
  → Found in: OMNI (SAME PATTERN)

Recommendation: Apply fix to all 3, create unit test shared across projects
```

### 4. Generate Report

```markdown
## Cross-Project Analysis Report
**Generated:** 2025-12-22
**Projects Scanned:** 15
**Issues Found:** 12

### 🔴 Critical Issues (Fix in Multiple Projects)

#### 1. Duplicate Email Validation (High Priority)
- **Locations:** 3 projects
- **Type:** 100% code duplication
- **Risk:** Inconsistent validation across apps
- **Action:** Extract to @shared/validation package

#### 2. Race Condition in Token Refresh
- **Locations:** 2 projects (Help Genie Mobile, OMNI)
- **Type:** Same bug pattern
- **Risk:** Session bugs in production
- **Action:** Apply fix from Help Genie Consumer to others

### 🟡 Medium Issues (Refactor Opportunity)

#### 3. Error Handling Pattern
- **Locations:** 4 projects use similar pattern
- **Opportunity:** Create shared error handler middleware
- **Effort:** 4 hours to extract, 2 hours to integrate per project
- **Benefit:** Consistent error responses, easier debugging

#### 4. Database Seed Data Pattern
- **Locations:** 3 projects (LearnFlow, LearningPortal, Help Genie Consumer)
- **Opportunity:** Create shared seeding utilities
- **Effort:** 3 hours
- **Benefit:** Consistent test data, easier to maintain

### 🟢 Low Issues (Nice to Have)

#### 5. Logging Pattern Inconsistency
- **Locations:** All 15 projects
- **Issue:** Different logging levels, formats
- **Recommendation:** Standardize on Winston/Pino
- **Effort:** 2 hours setup, 30 min per project

### 📊 Statistics

| Category | Count |
|----------|-------|
| Code duplications (100%) | 3 |
| Pattern duplications | 4 |
| Shared bugs | 2 |
| Refactor opportunities | 5 |
| Standardization needs | 3 |

### 💡 Quick Wins

**Extract these shared packages:**
1. `@shared/validation` - Email, phone, password validators
2. `@shared/error-handler` - Middleware for 4 projects
3. `@shared/testing-utils` - Common test helpers

**Estimated impact:** 10 hours of extraction, saves 30+ hours of duplicate code maintenance per year
```

### 5. Integration

Output format:
- Markdown report saved to `.claude/analysis/cross-project-report.md`
- Structured JSON for programmatic use
- Priority-ranked action items

Works with:
- `/dev:review` - "Check this against other projects"
- `/dev:parallel` - Batch similar refactoring across projects
- `/pm:board` - Create new ideas for cleanup tasks

## Advanced Options

- `--ignore-test-files` - Skip test duplication
- `--min-lines 10` - Only flag duplications >10 lines
- `--show-pattern-only` - Don't report exact code, just patterns
- `--projects help-genie-*` - Analyze subset of projects

## Notes

- Runs weekly or on-demand
- Caches results to avoid rescanning everything
- Learns from previous fixes (don't flag same bug twice)
- Suggests shared package structure
- Can generate migration plan for extracting code
