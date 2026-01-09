---
description: Run multiple agents in parallel for faster execution
arguments:
  - name: tasks
    description: Comma-separated list of tasks, or 'auto' to auto-detect parallelizable work
    required: false
---

# Parallel Agent Execution

Spin up multiple agents to work on independent tasks simultaneously.

## Usage Modes

### Mode 1: Explicit Tasks
```
/parallel Fix auth tests, Fix payment tests, Fix user tests
```

### Mode 2: Auto-Detect
```
/parallel auto
```
Analyzes current work and suggests parallelizable tasks.

### Mode 3: Interactive
```
/parallel
```
Prompts: "What tasks should I run in parallel?"

## Behavior

### 1. Parse Tasks

Split input by comma, clean up each task:
```
Input: "Fix auth tests, Fix payment tests, Fix user tests"
Tasks:
  1. Fix auth tests
  2. Fix payment tests
  3. Fix user tests
```

### 2. Validate Independence

Check that tasks are truly independent:
- Different files/directories
- No shared state
- No sequential dependencies

If tasks overlap, warn:
```
Warning: "Fix auth tests" and "Fix login flow" may touch same files.
Run sequentially instead? [y/n]
```

### 3. Dispatch Agents

Launch each task as a separate agent using the Task tool:

```
## Dispatching 3 Parallel Agents

| # | Task | Status |
|---|------|--------|
| 1 | Fix auth tests | Running... |
| 2 | Fix payment tests | Running... |
| 3 | Fix user tests | Running... |

Agents working independently. Will report when complete.
```

### 4. Monitor & Report

As agents complete:
```
## Agent Results

### Agent 1: Fix auth tests
**Status:** Complete
**Changes:** 2 files modified
**Summary:** Fixed race condition in token refresh

### Agent 2: Fix payment tests
**Status:** Complete
**Changes:** 1 file modified
**Summary:** Updated mock to match new API response

### Agent 3: Fix user tests
**Status:** Complete
**Changes:** 3 files modified
**Summary:** Fixed async timing issues

---

## Integration Check
- [ ] No conflicting changes
- [ ] All tests pass
- [ ] Ready to commit
```

## Auto-Detect Mode

When `/parallel auto` is run:

1. Check current context:
   - Failing tests → group by file/subsystem
   - Multiple tasks in "doing" → suggest splitting
   - Large feature → suggest decomposition

2. Suggest parallel tasks:
```
## Suggested Parallel Tasks

Based on current state, these can run in parallel:

1. **Fix auth.test.ts** (3 failing tests)
2. **Fix payment.test.ts** (2 failing tests)
3. **Fix user.test.ts** (1 failing test)

These are independent - different files, no shared state.

Run these in parallel? [y/n]
```

## Best Practices

### Good parallel tasks:
- Fix tests in different files
- Implement independent components
- Research separate topics
- Review different PRs

### Bad parallel tasks:
- Tasks that edit same files
- Sequential dependencies (A must finish before B)
- Tasks needing shared state
- Exploratory work (don't know scope yet)

## Limits

- Max 5 parallel agents (prevent resource exhaustion)
- Each agent has own context (no cross-talk)
- Parent monitors for conflicts
