---
name: debugging
description: "Use when encountering any bug, test failure, or unexpected behavior - requires root cause investigation before proposing fixes"
---

# Systematic Debugging

## Overview

Random fixes waste time and create new bugs. Quick patches mask underlying issues.

**Core principle:** ALWAYS find root cause before attempting fixes. Symptom fixes are failure.

**Violating the letter of this process is violating the spirit of debugging.**

## The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you haven't completed Phase 1, you cannot propose fixes.

## The Four Phases

### Phase 1: Root Cause Investigation

**BEFORE attempting ANY fix:**

1. **Read Error Messages Carefully**
   - Don't skip past errors or warnings
   - Read stack traces completely
   - Note line numbers, file paths, error codes

2. **Reproduce Consistently**
   - Can you trigger it reliably?
   - What are the exact steps?

3. **Check Recent Changes**
   - Git diff, recent commits
   - New dependencies, config changes

4. **Gather Evidence in Multi-Component Systems**
   - Log what data enters/exits each component
   - Run once to gather evidence showing WHERE it breaks
   - THEN investigate that specific component

5. **Trace Data Flow** (see `./root-cause-tracing.md`)
   - Where does bad value originate?
   - Keep tracing up until you find the source
   - Fix at source, not at symptom

### Phase 2: Pattern Analysis

1. **Find Working Examples** - Similar working code in same codebase
2. **Compare Against References** - Read reference implementations completely
3. **Identify Differences** - What's different between working and broken?

### Phase 3: Hypothesis and Testing

1. **Form Single Hypothesis** - "I think X is the root cause because Y"
2. **Test Minimally** - SMALLEST possible change to test
3. **Verify Before Continuing** - Didn't work? Form NEW hypothesis

### Phase 4: Implementation

1. **Create Failing Test Case** - Use `development/tdd` skill
2. **Implement Single Fix** - ONE change at a time
3. **Verify Fix** - Test passes? No regressions?
4. **If 3+ Fixes Failed** - Question the architecture, discuss with human

## Red Flags - STOP and Follow Process

If you catch yourself thinking:
- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "I don't fully understand but this might work"
- "One more fix attempt" (when already tried 2+)

**ALL of these mean: STOP. Return to Phase 1.**

## Supporting Techniques

In this directory:
- `./root-cause-tracing.md` - Trace bugs backward to original trigger
- `./defense-in-depth.md` - Add validation at multiple layers
- `./condition-based-waiting.md` - Replace timeouts with condition polling
- `./find-polluter.sh` - Find which test creates unwanted state

## Quick Reference

| Phase | Key Activities | Success Criteria |
|-------|---------------|------------------|
| **1. Root Cause** | Read errors, reproduce, trace | Understand WHAT and WHY |
| **2. Pattern** | Find working examples, compare | Identify differences |
| **3. Hypothesis** | Form theory, test minimally | Confirmed or new hypothesis |
| **4. Implementation** | Create test, fix, verify | Bug resolved, tests pass |

## Real-World Impact

- Systematic approach: 15-30 minutes to fix
- Random fixes approach: 2-3 hours of thrashing
- First-time fix rate: 95% vs 40%

---

## Related Skills

| Skill | When to Use |
|-------|-------------|
| `autonomy/error-recovery-loop` | Autonomous version - when debugging without human intervention |
| `development/tdd/tdd` | After finding root cause, write failing test before fix |
| `monitoring/rollback-ready` | Create checkpoint before attempting risky fixes |
| `execution/task-decomposition` | If bug fix reveals larger problem requiring breakdown |

### In This Directory
- `./root-cause-tracing.md` - Deep technique for tracing bugs to source
- `./defense-in-depth.md` - Prevent bugs with multi-layer validation
- `./condition-based-waiting.md` - Fix flaky timing bugs