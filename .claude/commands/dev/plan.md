---
description: Execute a plan file or create a new plan
arguments:
  - name: action
    description: "Path to plan file, 'new <name>' to create, or 'list' to show plans"
    required: false
---

Work with plans following the plan-execution skill.

**Commands:**

`/plan` or `/plan list`
- List available plans in `docs/plans/` or `.claude/plans/`

`/plan new <name>`
- Create a new plan file with template
- Open for editing

`/plan <path>`
- Load and execute the specified plan
- Track progress through tasks
- Mark completed items

**Plan template:**
```markdown
# <Plan Name>

> **Goal:** <one sentence>

## Context
<background information>

## Tasks

### Task 1: <name>
**Files:** <files to modify>

- [ ] Step 1
- [ ] Step 2

### Task 2: <name>
...

## Verification
- [ ] All tests pass
- [ ] Changes reviewed
```

**During execution:**
- Work through tasks sequentially
- Check off completed steps
- Report blockers immediately
- Update the plan file with progress
