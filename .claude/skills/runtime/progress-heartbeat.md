---
name: progress-heartbeat
description: Use during long autonomous work to maintain visible progress and catch stalls early
---

# Progress Heartbeat

## Overview

During long autonomous work, **actively track and report progress**. Don't go silent for hours. Maintain a heartbeat that shows work is happening and catches stalls early.

**Core principle:** Visible progress prevents invisible problems.

## The Heartbeat Pattern

Every **10-15 minutes** of work (or after each significant step):

```markdown
## Heartbeat: [timestamp]

**Working on:** Task 3 - User Profile
**Status:** Building profile form component
**Progress:** 40% (2/5 subtasks complete)
**Blockers:** None
**Last completed:** Profile API endpoint
**Next up:** Form validation
**Time on current subtask:** 8 minutes
```

## Why Heartbeats Matter

### For You (when you return)
- See exactly where things stopped
- Know what was accomplished
- Spot if Claude got stuck

### For Claude (self-monitoring)
- Forces check-in on progress
- Catches "spinning" early (stuck on one thing too long)
- Maintains focus

## Heartbeat File

Maintain `.claude/heartbeat.md` during autonomous work:

```markdown
# Autonomous Session Heartbeat

**Session started:** 2025-12-21 14:00
**Plan:** docs/plans/user-features.md
**Mode:** Autonomous

---

## 14:00 - Session Start
- Beginning with Task 1: User model
- 5 tasks total
- Estimated completion: ~16:00

## 14:12 - Heartbeat
- ✅ Task 1 complete (User model + migration)
- Starting Task 2: Registration API
- No issues

## 14:25 - Heartbeat  
- ✅ Task 2 complete (Registration API working)
- Starting Task 3: Login API
- No issues

## 14:38 - Heartbeat
- ⏳ Task 3 in progress
- Hit issue: bcrypt not hashing correctly
- Attempting fix #2
- Not blocked yet

## 14:45 - Heartbeat
- ✅ Task 3 complete (fixed bcrypt issue)
- Starting Task 4: Auth middleware
- Issue resolved: was using sync instead of async bcrypt

## 14:58 - Heartbeat
- ✅ Task 4 complete
- Starting Task 5: Protected routes
- 80% complete overall
- On track for ~15:15 completion

## 15:10 - Session Complete
- ✅ All 5 tasks complete
- Tests passing: 12/12
- Committed and pushed
- Total time: 1h 10m
```

## Stall Detection

If a heartbeat shows:
- **Same subtask for 2+ heartbeats** → Step back, try different approach
- **"Attempting fix #5+"** → Log as blocked, move on
- **Time on subtask > 30 min** → Decompose further or skip

### Self-Correction Script

At each heartbeat, ask:

```
1. Am I making progress? 
   YES → Continue
   NO → Why not?

2. Am I stuck on the same thing?
   YES → Have I tried 3+ approaches?
        YES → Log and move on
        NO → Try another approach
   NO → Continue

3. Is this taking too long?
   YES → Is it worth continuing?
        YES → Set 15 more minute limit
        NO → Log and move on
   NO → Continue

4. Any blockers forming?
   YES → Can I work around them?
        YES → Do so
        NO → Log and continue with other tasks
   NO → Continue
```

## Heartbeat Triggers

Write a heartbeat entry when:

- [x] Starting a new task
- [x] Completing a task
- [x] 15 minutes have passed
- [x] Encountering a problem
- [x] Resolving a problem
- [x] Making a significant decision
- [x] Changing approach

## Minimal Heartbeat (Quick Format)

For rapid logging:

```
14:25 | Task 2 | ✅ Complete | Starting Task 3
14:38 | Task 3 | 🔧 In progress | bcrypt issue, attempting fix
14:45 | Task 3 | ✅ Complete | bcrypt fixed (async/sync)
14:58 | Task 4 | ✅ Complete | 80% overall
```

## Session Summary

At end of autonomous session, write summary:

```markdown
# Session Summary

**Duration:** 1h 10m
**Tasks completed:** 5/5
**Issues encountered:** 1 (bcrypt async)
**Issues resolved:** 1

## What Got Done
- User model and migration
- Registration API
- Login API  
- Auth middleware
- Protected route examples

## Assumptions Made
- Used JWT for tokens (standard choice)
- 24h token expiry (can be configured)

## For Next Session
- Add refresh token flow
- Add password reset

## Needs Human Review
- None
```

## Integration

Use with:
- **autonomous-resilience**: Heartbeats catch when resilience isn't working
- **error-recovery-loop**: Log recovery attempts in heartbeat
- **prepare-autonomous-execution**: Heartbeat file is part of setup

