---
name: delegation-queue
description: Use to queue up work across multiple projects that Claude will execute while you're away
---

# Delegation Queue

## Overview

Queue up work for Claude to do while you're away. Work happens across multiple projects without you being there.

**Core principle:** Your time away should still be productive time.

## The Queue File

Create `.claude/queue.md` to define work:

```markdown
# Work Queue

**Created:** 2025-12-21 18:00
**Mode:** Execute when ready
**Notify:** Update queue.md with results

---

## Queue Items

### 1. 🔴 [HIGH] app-2: Fix payment webhook
- **Project:** C:\projects\app-2
- **Task:** Fix Stripe webhook signature validation
- **Reference:** See error in logs/webhook-errors.log
- **Definition of done:** Webhooks processing successfully, tests passing
- **Estimated time:** 1 hour

### 2. 🟠 [MEDIUM] app-5: Finish onboarding flow  
- **Project:** C:\projects\app-5
- **Task:** Complete final screen of onboarding
- **Reference:** See design in docs/onboarding-design.md
- **Definition of done:** All 5 screens working, user can complete flow
- **Estimated time:** 30 minutes

### 3. 🟠 [MEDIUM] app-1: Write API tests
- **Project:** C:\projects\app-1
- **Task:** Add tests for user endpoints
- **Reference:** Endpoints in src/api/users/
- **Definition of done:** 80%+ coverage on user endpoints
- **Estimated time:** 45 minutes

### 4. 🟡 [LOW] app-4: Update dependencies
- **Project:** C:\projects\app-4
- **Task:** Run npm update, fix any breaking changes
- **Definition of done:** All deps updated, tests passing
- **Estimated time:** 30 minutes

---

## Execution Rules

- Execute in priority order (HIGH → MEDIUM → LOW)
- Use all autonomy skills (error-recovery, resilience, etc.)
- Update queue.md after each item
- If blocked > 15 min, skip and continue
- Commit after each completed item
```

## Queue Item Template

```markdown
### [#] [PRIORITY] project-name: Brief description
- **Project:** [path to project]
- **Task:** [What to do - be specific]
- **Reference:** [Plan file, design doc, or specific instructions]
- **Definition of done:** [How to know it's complete]
- **Estimated time:** [Rough estimate]
- **Dependencies:** [Optional: what must be true before starting]
- **Notes:** [Optional: context, gotchas, preferences]
```

## Priority Levels

| Priority | When to Use | Execution |
|----------|-------------|-----------|
| 🔴 HIGH | Must be done, time-sensitive | Execute first, don't skip |
| 🟠 MEDIUM | Important, should be done | Execute in order |
| 🟡 LOW | Nice to have | Execute if time, OK to skip |

## Execution Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  READ queue.md                                              │
│       ↓                                                     │
│  FOR EACH item (by priority):                               │
│       ↓                                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ cd [project directory]                               │   │
│  │      ↓                                               │   │
│  │ Run dependency-scout (quick check)                   │   │
│  │      ↓                                               │   │
│  │ Execute task using autonomy skills                   │   │
│  │      ↓                                               │   │
│  │ Run completion-checklist                             │   │
│  │      ↓                                               │   │
│  │ Update queue.md with result                          │   │
│  │      ↓                                               │   │
│  │ Commit changes                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│       ↓                                                     │
│  NEXT item                                                  │
│       ↓                                                     │
│  WRITE summary to queue.md                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Queue Status Updates

As work progresses, queue.md is updated:

```markdown
### 1. 🔴 [HIGH] app-2: Fix payment webhook
- **Status:** ✅ COMPLETED
- **Completed:** 2025-12-21 19:15
- **Duration:** 52 minutes
- **Result:** Webhook validation fixed, 3 tests added
- **Commit:** abc123

### 2. 🟠 [MEDIUM] app-5: Finish onboarding flow
- **Status:** ✅ COMPLETED
- **Completed:** 2025-12-21 19:45
- **Duration:** 28 minutes
- **Result:** All screens complete, flow tested
- **Commit:** def456

### 3. 🟠 [MEDIUM] app-1: Write API tests
- **Status:** ⏳ IN PROGRESS
- **Started:** 2025-12-21 19:47
- **Progress:** 60% (3/5 endpoint groups covered)

### 4. 🟡 [LOW] app-4: Update dependencies
- **Status:** 📋 PENDING
```

## Blocked Items

When an item can't be completed:

```markdown
### 3. 🟠 [MEDIUM] app-3: Integrate Stripe
- **Status:** 🚫 BLOCKED
- **Blocked at:** 2025-12-21 20:30
- **Reason:** STRIPE_API_KEY not configured in .env
- **Attempted:** Checked .env, .env.example, environment
- **Needs:** Human to add Stripe API key
- **Skipped to:** Item 4
```

## Queue Summary

At end of execution, append summary:

```markdown
---

## Execution Summary

**Session:** 2025-12-21 18:30 - 21:45
**Duration:** 3 hours 15 minutes

### Results

| # | Project | Task | Status | Time |
|---|---------|------|--------|------|
| 1 | app-2 | Payment webhook | ✅ Done | 52m |
| 2 | app-5 | Onboarding flow | ✅ Done | 28m |
| 3 | app-1 | API tests | ✅ Done | 65m |
| 4 | app-4 | Update deps | ✅ Done | 35m |

### Commits Made
- app-2: abc123 "fix: webhook signature validation"
- app-5: def456 "feat: complete onboarding flow"
- app-1: ghi789 "test: add user API tests"
- app-4: jkl012 "chore: update dependencies"

### Blocked Items
- None

### Notes
- app-1 tests revealed a bug in user deletion - logged to backlog
- app-4 had breaking change in axios, fixed with minor refactor

### Ready for Review
All items completed. Run tests in each project to verify.
```

## Starting Queue Execution

When ready to start:

```
"Execute the work queue"

OR

"Execute queue items 1-3 only"

OR

"Execute HIGH priority items from queue"
```

Claude will:
1. Read queue.md
2. Apply prepare-autonomous-execution for first project
3. Work through items
4. Update queue as it goes
5. Write summary when done

## Quick Queue (Inline)

For simpler queuing without a file:

```
"While I'm away:
 1. Finish the profile page on app-1
 2. Fix the login bug on app-3
 3. Update deps on app-5 if you have time"
```

Claude will:
- Create queue.md from your instructions
- Execute in order
- Report results

## Queue Management

### Adding to Queue

```
"Add to queue: app-2 needs the payment form completed, medium priority"
```

### Reprioritizing

```
"Move app-4 deps update to high priority - security issue found"
```

### Clearing Queue

```
"Clear completed items from queue"
```

## Integration

Use with:
- **prepare-autonomous-execution**: Run before each project switch
- **smart-prioritization**: Helps build the queue
- **progress-heartbeat**: Logs progress during execution
- **rollback-ready**: Safety net for each project
- **multi-project-dashboard**: See queue status across projects

## Best Practices

### Good Queue Items

✅ Specific and actionable
✅ Clear definition of done
✅ Reasonable scope (< 2 hours each)
✅ Has reference material if needed

### Bad Queue Items

❌ Vague: "Improve app-1"
❌ Too big: "Build entire feature"
❌ No clear done: "Work on bugs"
❌ Missing context: "Fix the thing John mentioned"

## Time Estimates

Be realistic:

| Estimate | Actual (typical) |
|----------|------------------|
| 30 min | 30-45 min |
| 1 hour | 1-1.5 hours |
| 2 hours | 2-3 hours |

Add 30-50% buffer for unexpected issues.

