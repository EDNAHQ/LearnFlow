---
name: bugfix
description: "Use when fixing any bug - complete workflow from report to verified fix"
---

# Bugfix Workflow

## Overview

End-to-end workflow for fixing bugs. Ensures you find the real cause and don't just patch symptoms.

**Core principle:** A bug is not fixed until you understand WHY it happened and have a test proving it won't recur.

## When to Use

- "Fix this bug"
- "This is broken"
- "X doesn't work"
- "Getting error when..."
- Any unexpected behavior that needs correcting

## The Complete Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  PHASE 1: SAFETY                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  1. rollback-ready       Create checkpoint BEFORE touching code     │    │
│  │  2. skill-usage          Check for applicable debugging skills      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                              ↓                                              │
│  PHASE 2: INVESTIGATE (NO FIXES YET)                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  3. debugging            Systematic root cause investigation        │    │
│  │  4. root-cause-tracing   Trace bug backward to original trigger     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                              ↓                                              │
│  PHASE 3: REPRODUCE                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  5. tdd (RED)            Write failing test that exposes bug        │    │
│  │     └─ Test MUST fail before proceeding                             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                              ↓                                              │
│  PHASE 4: FIX                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  6. tdd (GREEN)          Write minimal fix to pass test             │    │
│  │  7. error-recovery-loop  If fix doesn't work, loop systematically   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                              ↓                                              │
│  PHASE 5: VERIFY                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  8. completion-checklist All tests pass, no regressions             │    │
│  │  9. defense-in-depth     Add guards to prevent recurrence           │    │
│  │  10. smart-commit        Commit with descriptive message            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Phase 1: Safety

### Step 1: Create Rollback Point
```
Read: monitoring/rollback-ready

BEFORE any code changes:
git stash (if uncommitted work)
git tag -a pre-fix-[bug-name] -m "Before fixing [bug]"
```

**Why:** Bug fixes often create new bugs. You need a clean escape route.

### Step 2: Check Debugging Skills
```
Read: workflows/skill-usage

Relevant skills for debugging:
- development/debugging/debugging (REQUIRED)
- development/debugging/root-cause-tracing
- development/debugging/defense-in-depth
- development/debugging/condition-based-waiting (for timing bugs)
- autonomy/error-recovery-loop (for autonomous debugging)
```

## Phase 2: Investigate

### Step 3: Systematic Debugging
```
Read: development/debugging/debugging

THE IRON LAW: No fixes without root cause investigation first.

Investigation checklist:
1. [ ] Read complete error message (not just first line)
2. [ ] Read complete stack trace
3. [ ] Reproduce bug consistently
4. [ ] Check recent changes (git diff, git log)
5. [ ] Find similar working code to compare
```

**STOP. Do NOT proceed to fixing until you can answer:**
> "The bug happens because [X], originating from [Y]."

### Step 4: Trace to Root Cause
```
Read: development/debugging/root-cause-tracing

Trace backward:
1. What is the symptom? (Error message, wrong behavior)
2. What code directly causes this?
3. What called that code?
4. What value was passed? Where did it come from?
5. Keep tracing until you find the ORIGIN, not just the symptom.

Fix at the source, not where the error appears.
```

**Output:** Written statement of root cause:

```markdown
## Root Cause Analysis

**Symptom:** [What user sees]
**Direct cause:** [Code that errors/misbehaves]
**Root cause:** [Original source of the problem]
**Why it happens:** [Explanation]
```

## Phase 3: Reproduce

### Step 5: Write Failing Test
```
Read: development/tdd/tdd

MANDATORY: Write a test that FAILS due to the bug.

test('should [expected behavior]', () => {
  // Setup that triggers the bug
  // ...
  
  // This assertion will FAIL until bug is fixed
  expect(result).toBe(expectedValue);
});

Run the test. Verify it fails.
```

**Why:** 
- Proves you understand the bug
- Prevents regression forever
- Defines clear success criteria

**If you cannot write a failing test:**
- You don't understand the bug well enough
- Go back to Phase 2

## Phase 4: Fix

### Step 6: Minimal Fix
```
Read: development/tdd/tdd

Write the SMALLEST change that makes the test pass.

Rules:
- Fix at root cause, not at symptom
- ONE change at a time
- No "while I'm here" improvements
- No refactoring yet
```

### Step 7: If Fix Doesn't Work
```
Read: autonomy/error-recovery-loop

Recovery loop:
1. Quick fix → retry
2. Deeper analysis → retry
3. Different approach → retry
4. Simplify → retry
5. Fresh start → retry
6. If still failing after 5 genuine attempts → question architecture, discuss with human
```

## Phase 5: Verify

### Step 8: Completion Checklist
```
Read: execution/completion-checklist

Verify:
- [ ] Bug-specific test passes
- [ ] ALL other tests still pass
- [ ] No new linter/TypeScript errors
- [ ] Manual verification - bug is actually fixed
- [ ] Edge cases - similar scenarios also work
```

### Step 9: Defense in Depth (Optional but Recommended)
```
Read: development/debugging/defense-in-depth

Ask: "How can I prevent this class of bug in the future?"

Options:
- Add runtime validation at entry points
- Add TypeScript stricter types
- Add assertions that catch this earlier
- Add logging for future debugging
```

### Step 10: Commit
```
Read: git-automation/smart-commit

Format:
git commit -m "fix([scope]): [what was fixed]

Root cause: [brief explanation]
Closes #[issue-number] (if applicable)"
```

## Autonomous Variation

For AFK debugging:

```
Read: autonomy/error-recovery-loop

Key additions:
- Time-box investigation: 30 minutes max on root cause
- If stuck, log what you know and continue to other tasks
- Commit working state before attempting risky fixes
- Document assumptions made without human input

Log format:
## Bug Fix Attempt: [bug name]
Started: [timestamp]
Root cause found: [yes/no]
Attempts: [list]
Resolution: [fixed/blocked/needs human]
Time spent: [X minutes]
```

## Quick Reference

| Phase | Skills Used | Output |
|-------|-------------|--------|
| Safety | rollback-ready, skill-usage | Checkpoint created |
| Investigate | debugging, root-cause-tracing | Written root cause statement |
| Reproduce | tdd (RED) | Failing test |
| Fix | tdd (GREEN), error-recovery-loop | Passing test |
| Verify | completion-checklist, defense-in-depth, smart-commit | Committed fix |

## Common Patterns

### Timing/Race Condition Bugs
```
Extra skill: development/debugging/condition-based-waiting

Replace:
  await sleep(1000);  // Arbitrary timeout

With:
  await waitFor(() => condition === true);  // Condition-based
```

### State Management Bugs
```
Trace data flow carefully:
- Where is state initialized?
- What modifies it?
- What reads it?
- Is there a stale reference?
```

### API/Network Bugs
```
Check:
- Request payload correct?
- Response status/body?
- Auth headers present?
- CORS configured?
- Server actually running?
```

### UI/Rendering Bugs
```
Extra skill: monitoring/visual-feedback-loop

After fix:
node .claude/scripts/screenshot.js http://localhost:3000/[page]
Visually confirm fix
```

## Red Flags - STOP

If you find yourself:

| Behavior | Problem | Action |
|----------|---------|--------|
| Fixing without understanding | Symptom patching | Return to Phase 2 |
| Multiple fix attempts failing | Missing root cause | Return to Phase 2 |
| "One more try" (after 2+ failures) | Thrashing | Stop, question architecture |
| Fixing where error appears | Not tracing to source | Use root-cause-tracing |
| Skipping the failing test | Will regress later | Write the test |

## Anti-Patterns

❌ **Shotgun debugging:** Making random changes hoping something works
❌ **Symptom patching:** Fixing where error appears, not root cause
❌ **Untested fixes:** "It works now" without a test to prove it
❌ **Drive-by refactoring:** Cleaning up code while fixing bugs
❌ **Optimistic merging:** Merging without running all tests

