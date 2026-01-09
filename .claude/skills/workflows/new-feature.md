---
name: new-feature
description: "Use when implementing a new feature from scratch - complete workflow from idea to deployment"
---

# New Feature Workflow

## Overview

End-to-end workflow for implementing a new feature. Chains together the right skills in the right order.

**Core principle:** Features fail when steps are skipped. This workflow ensures nothing is missed.

## When to Use

- "Add [X] feature"
- "Implement [X] functionality"  
- "Build [X] component/page/API"
- Any new capability being added to the codebase

## The Complete Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  PHASE 1: UNDERSTAND                                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  1. skill-usage          Check for applicable skills FIRST          │    │
│  │  2. codebase-context     Understand existing patterns & architecture│    │
│  │  3. dependency-scout     Find blockers (APIs, credentials, etc.)    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                              ↓                                              │
│  PHASE 2: PLAN                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  4. brainstorming        Explore approaches, clarify requirements   │    │
│  │  5. task-decomposition   Break into 15-30 min pieces                │    │
│  │  6. rollback-ready       Create checkpoint before changes           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                              ↓                                              │
│  PHASE 3: IMPLEMENT (per subtask)                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  7. tdd                  Write failing test FIRST                   │    │
│  │  8. [implement]          Write minimal code to pass test            │    │
│  │  9. visual-feedback-loop If UI: screenshot and verify               │    │
│  │  10. smart-commit        Commit with conventional message           │    │
│  │  11. progress-heartbeat  Log progress (especially if AFK)           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                              ↓ repeat for each subtask                      │
│  PHASE 4: VERIFY                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  12. completion-checklist  Verify done means DONE                   │    │
│  │  13. verification          Full implementation check                │    │
│  │  14. code-review           Review for quality issues                │    │
│  │  15. proactive-optimization Quick wins if time allows               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Phase 1: Understand

### Step 1: Check for Applicable Skills
```
Read: workflows/skill-usage

Ask yourself:
- What category does this feature fall into?
- Are there integration skills needed? (image, audio, web search)
- Are there pattern files for this type of code?
```

### Step 2: Understand Codebase Context
```
Run: node .claude/scripts/codebase-context.js

Look for:
- Similar existing features to use as reference
- Architectural patterns in use
- Naming conventions
- Test patterns
```

### Step 3: Scout for Blockers
```
Read: monitoring/dependency-scout

Check:
- [ ] External APIs needed? Do I have keys?
- [ ] Database changes needed? Migrations ready?
- [ ] Third-party services? Credentials available?
- [ ] Design assets? Available or need to generate?
```

**STOP if blockers found.** Resolve before proceeding.

## Phase 2: Plan

### Step 4: Brainstorm Approach
```
Read: development/brainstorming

Explore:
- Multiple implementation approaches
- Trade-offs of each
- Edge cases and error scenarios
- User experience considerations
```

### Step 5: Decompose into Tasks
```
Read: execution/task-decomposition

Requirements:
- Each task ≤ 30 minutes
- Each task independently testable
- Clear order and dependencies
- Acceptance criteria for each
```

**Output:** TodoWrite with all subtasks

### Step 6: Create Rollback Point
```
Read: monitoring/rollback-ready

git tag -a pre-feature-[name] -m "Before implementing [feature]"
git push origin pre-feature-[name]
```

## Phase 3: Implement (Per Subtask)

**Repeat this loop for each decomposed task:**

### Step 7: TDD - Write Failing Test
```
Read: development/tdd/tdd

MANDATORY:
1. Write test that describes expected behavior
2. Run test - MUST fail
3. Verify failure message makes sense
```

### Step 8: Implement
```
Write MINIMAL code to pass the test.

Rules:
- No features beyond test requirements
- No "while I'm here" improvements
- No premature abstraction
```

### Step 9: Visual Verification (If UI)
```
Read: monitoring/visual-feedback-loop

node .claude/scripts/screenshot.js http://localhost:3000/[page]

Check:
- Layout correct?
- Text visible and not cut off?
- Colors/spacing match design?
- Responsive if applicable?
```

### Step 10: Commit
```
Read: git-automation/smart-commit

node .claude/scripts/smart-commit.js

Or manually:
git add -A
git commit -m "feat([scope]): [description]"
```

### Step 11: Log Progress
```
Read: monitoring/progress-heartbeat

Log to progress file:
- Task completed: [name]
- Time: [timestamp]
- Tests passing: [yes/no]
- Notes: [any issues encountered]
```

## Phase 4: Verify

### Step 12: Completion Checklist
```
Read: execution/completion-checklist

Verify:
- [ ] All subtasks marked complete
- [ ] All tests pass (not just new ones)
- [ ] No linter errors
- [ ] No TypeScript errors
- [ ] Feature works as expected
```

### Step 13: Full Verification
```
Read: development/verification

- [ ] Requirements met (re-read original request)
- [ ] Edge cases handled
- [ ] Error states handled
- [ ] Loading states (if applicable)
- [ ] Mobile responsive (if applicable)
```

### Step 14: Code Review
```
Read: development/code-review/code-review

Self-review or dispatch reviewer subagent:
- Code quality
- Naming clarity
- Test coverage
- Documentation if needed
```

### Step 15: Proactive Optimization (Optional)
```
Read: execution/proactive-optimization

If time allows:
- Quick performance wins
- Minor code cleanup
- Documentation improvements
```

## Autonomous Variation

For AFK execution, add:

```
Before starting:
Read: autonomy/prepare-autonomous-execution

During execution:
Read: autonomy/autonomous-resilience
Read: autonomy/error-recovery-loop

Additional rules:
- Commit after EVERY subtask (not just at end)
- Log to progress file every 15 minutes
- If stuck for > 20 minutes, log blocker and continue
```

## Quick Reference

| Phase | Skills Used | Output |
|-------|-------------|--------|
| Understand | skill-usage, codebase-context, dependency-scout | Clear scope, no blockers |
| Plan | brainstorming, task-decomposition, rollback-ready | TodoWrite with subtasks |
| Implement | tdd, visual-feedback-loop, smart-commit, progress-heartbeat | Working code per subtask |
| Verify | completion-checklist, verification, code-review | Confirmed complete feature |

## Common Shortcuts

**Simple feature (< 1 hour):**
Skip brainstorming, lighter decomposition, combine verify steps

**UI-only feature:**
Emphasize visual-feedback-loop, can relax TDD for pure styling

**API-only feature:**
Skip visual feedback, emphasize test coverage

**Spike/exploration:**
Skip TDD initially, but write tests before merging

