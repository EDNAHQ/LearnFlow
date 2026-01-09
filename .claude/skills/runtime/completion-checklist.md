---
name: completion-checklist
description: Use before marking any task complete to verify it's actually done - requires running verification commands and confirming output before making any success claims
---

# Completion Checklist

## Overview

"Done" should mean **actually done**, not "I wrote the code." Before marking any task complete, run through a verification checklist.

**Core principle:** Evidence before claims, always.

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If you haven't run the verification command in this message, you cannot claim it passes.

## The Gate Function

```
BEFORE claiming any status or expressing satisfaction:

1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
5. ONLY THEN: Make the claim

Skip any step = lying, not verifying
```

## The Checklist

Before marking a task complete:

### 1. Code Complete
- [ ] All requirements from the task are implemented
- [ ] No TODO comments left behind (or they're for future tasks)
- [ ] No placeholder/mock data that should be real
- [ ] No commented-out code that should be removed

### 2. It Actually Works
- [ ] Ran the code / feature manually
- [ ] Works for the happy path
- [ ] Handles obvious error cases
- [ ] Doesn't break existing functionality

### 3. Tests
- [ ] New tests written for new functionality
- [ ] All tests pass (new and existing)
- [ ] Tests actually test the behavior, not just coverage

### 4. Code Quality
- [ ] No linting errors
- [ ] No type errors (if TypeScript)
- [ ] Follows existing code patterns
- [ ] Reasonably readable

### 5. Git State
- [ ] Changes committed with clear message
- [ ] Committed to correct branch
- [ ] No unintended files included

### 6. Documentation (if applicable)
- [ ] API changes documented
- [ ] README updated if needed
- [ ] Comments for non-obvious code

## Quick Version

For smaller tasks, use the quick check:

```
□ Works?
□ Tests pass?
□ Committed?
```

If all three → Done.

## Task-Type Specific Checklists

### Frontend Component

```
□ Component renders without errors
□ Visual check: looks correct (screenshot if autonomous)
□ Responsive: works on mobile viewport
□ Accessibility: keyboard navigable, proper labels
□ Tests: render + interaction tests
□ No console errors/warnings
□ Committed
```

### API Endpoint

```
□ Endpoint responds correctly (curl/test)
□ Returns proper status codes
□ Handles invalid input gracefully
□ Authentication/authorization works
□ Tests: success + error cases
□ No server errors in logs
□ Committed
```

### Bug Fix

```
□ Bug no longer reproducible
□ Root cause addressed (not just symptoms)
□ Test added that would catch regression
□ No new bugs introduced
□ All existing tests still pass
□ Committed
```

### Database Change

```
□ Migration runs successfully
□ Migration is reversible
□ Data preserved correctly
□ Application still works with new schema
□ Tests updated for new schema
□ Committed
```

### Refactor

```
□ Behavior unchanged (tests still pass)
□ No functionality removed accidentally
□ Code is actually cleaner/better
□ Performance not degraded
□ Committed
```

## Completion Log Entry

When marking complete, log:

```markdown
### Task 3: User Profile Page ✅

**Completed:** 14:45
**Duration:** 18 minutes

**Verification:**
- [x] Works: Tested profile page manually
- [x] Tests: 4 new tests, all passing
- [x] Committed: abc123 "feat: add user profile page"

**Notes:**
- Used existing Avatar component
- Assumed 5MB max for photo upload
```

## Common "Done" Lies

Things that feel done but aren't:

| Feels Done | Actually Not Done |
|------------|-------------------|
| "Code compiles" | Doesn't mean it works |
| "Works on my machine" | Didn't test error cases |
| "Tests pass" | Tests might not cover the change |
| "I committed it" | Committed to wrong branch |
| "Feature works" | But broke something else |
| "Just need to clean up" | That's still work |

## Red Flags - STOP

If you catch yourself:
- Using "should", "probably", "seems to"
- Expressing satisfaction before verification ("Great!", "Perfect!", "Done!")
- About to commit/push/PR without verification
- Relying on partial verification
- Thinking "just this once"
- Tired and wanting work over

**ALL of these mean: RUN THE VERIFICATION COMMAND FIRST.**

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Should work now" | RUN the verification |
| "I'm confident" | Confidence ≠ evidence |
| "Just this once" | No exceptions |
| "Linter passed" | Linter ≠ tests ≠ build |
| "I'm tired" | Exhaustion ≠ excuse |
| "Partial check is enough" | Partial proves nothing |

## When to Skip Verification

Almost never. But acceptable shortcuts:

- **Trivial typo fix:** Just commit
- **Comment update:** Just commit
- **Config change already tested:** Just commit

Everything else: **Run the checklist.**

## Integration

Use this:
- After each task in **subagent-driven-development**
- Before marking complete in **TodoWrite**
- At each **heartbeat** for in-progress work
- Definitely before **finishing-a-development-branch**

