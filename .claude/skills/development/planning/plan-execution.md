---
name: plan-execution
description: "Use when you have a spec or requirements for a multi-step task - covers both writing detailed implementation plans and executing them with review checkpoints"
---

# Plan Execution

## Overview

Write comprehensive implementation plans assuming the engineer has zero context. Then execute with batch checkpoints for review.

**Save plans to:** `docs/plans/YYYY-MM-DD-<feature-name>.md`

---

## Part 1: Writing Plans

### Plan Document Header

Every plan MUST start with:

```markdown
# [Feature Name] Implementation Plan

> **For Claude:** Use development/plan-execution to implement this plan task-by-task.

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries]

---
```

### Bite-Sized Task Granularity

**Each step is one action (2-5 minutes):**
- "Write the failing test" - step
- "Run it to make sure it fails" - step
- "Implement the minimal code to make the test pass" - step
- "Run the tests and make sure they pass" - step
- "Commit" - step

### Task Structure

```markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

**Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

**Step 3: Write minimal implementation**

[Complete code]

**Step 4: Run test to verify it passes**

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: add specific feature"
```
```

### Remember

- Exact file paths always
- Complete code in plan (not "add validation")
- Exact commands with expected output
- DRY, YAGNI, TDD, frequent commits

---

## Part 2: Executing Plans

### Step 1: Load and Review Plan

1. Read plan file
2. Review critically - identify any questions or concerns
3. If concerns: Raise them before starting
4. If no concerns: Create TodoWrite and proceed

### Step 2: Execute Batch

**Default: First 3 tasks**

For each task:
1. Mark as in_progress
2. Follow each step exactly
3. Run verifications as specified
4. Mark as completed

### Step 3: Report

When batch complete:
- Show what was implemented
- Show verification output
- Say: "Ready for feedback."

### Step 4: Continue

Based on feedback:
- Apply changes if needed
- Execute next batch
- Repeat until complete

### Step 5: Complete Development

After all tasks complete and verified:
- Use `development/verification` skill to finish

## When to Stop and Ask for Help

**STOP executing immediately when:**
- Hit a blocker mid-batch
- Plan has critical gaps
- You don't understand an instruction
- Verification fails repeatedly

**Ask for clarification rather than guessing.**

---

## Execution Options After Writing Plan

**"Plan complete. Two execution options:**

**1. Subagent-Driven (this session)** - Fresh subagent per task, review between tasks, fast iteration. Use `development/subagent-development`.

**2. Parallel Session (separate)** - Open new session, batch execution with checkpoints. Use this skill's Part 2.

**Which approach?"**
