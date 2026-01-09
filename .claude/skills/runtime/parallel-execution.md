---
name: parallel-execution
description: Use when multiple independent tasks can be worked on simultaneously by separate subagents
---

# Parallel Execution

## Overview

When tasks are **truly independent**, run them in parallel with multiple subagents. Don't do sequentially what can be done simultaneously.

**Core principle:** Independent work should happen in parallel.

## When to Parallelize

### ✅ Good Candidates

- Different features with no shared code
- Tests for different modules
- Documentation for separate components
- Bug fixes in unrelated areas
- Independent API endpoints

### ❌ Don't Parallelize

- Tasks that modify the same files
- Tasks with dependencies (A must finish before B)
- Database migrations (order matters)
- Tasks that share state
- When you're unsure if they're independent

## Independence Check

Before parallelizing, verify:

```
Task A and Task B are independent if:

□ They don't modify the same files
□ Neither depends on the other's output
□ They don't share database tables (for writes)
□ They don't share external resources
□ Order of completion doesn't matter
□ They won't have merge conflicts
```

## Parallel Execution Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  CONTROLLER (you)                                           │
│       │                                                     │
│       ├── Identify independent tasks                        │
│       │                                                     │
│       ├── Dispatch Subagent 1 ──→ Task A                    │
│       │                                                     │
│       ├── Dispatch Subagent 2 ──→ Task B                    │
│       │                                                     │
│       ├── Dispatch Subagent 3 ──→ Task C                    │
│       │                                                     │
│       │   [All work in parallel]                            │
│       │                                                     │
│       ├── Collect results                                   │
│       │                                                     │
│       ├── Check for conflicts                               │
│       │                                                     │
│       └── Integrate and verify                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Subagent Dispatch Template

For each parallel task:

```markdown
## Subagent Task: [Task Name]

**Scope:** [Specific files/areas this subagent owns]

**Boundaries:**
- ONLY modify files in: [list directories/files]
- Do NOT touch: [list off-limits areas]

**Task:**
[Full task description]

**Deliverables:**
- [ ] Implementation complete
- [ ] Tests passing
- [ ] Changes committed to branch: [branch-name]

**Report when done:**
- What was implemented
- Files changed
- Tests added/modified
- Any issues encountered
```

## Branch Strategy for Parallel Work

```
main
  │
  └── feature/user-system
        │
        ├── feature/user-system-auth      (Subagent 1)
        ├── feature/user-system-profile   (Subagent 2)
        └── feature/user-system-settings  (Subagent 3)
```

Each subagent works on its own branch. Merge when all complete.

## Conflict Prevention

### Before Dispatching

```markdown
## File Ownership Map

| Subagent | Owns | Shared (Read-Only) |
|----------|------|-------------------|
| 1 - Auth | src/auth/*, src/api/auth.ts | src/types/user.ts |
| 2 - Profile | src/profile/*, src/api/profile.ts | src/types/user.ts |
| 3 - Settings | src/settings/*, src/api/settings.ts | src/types/user.ts |

**Shared files:** No subagent modifies src/types/user.ts
If changes needed, flag for controller to handle after.
```

### After Completion

```bash
# Check for conflicts before merging
git checkout feature/user-system
git merge --no-commit feature/user-system-auth
git merge --no-commit feature/user-system-profile
git merge --no-commit feature/user-system-settings

# If conflicts, resolve before committing
```

## Parallel Execution Checklist

### Before

```
□ Identified independent tasks
□ Verified no file overlap
□ Created separate branches
□ Assigned clear ownership
□ Defined boundaries for each
```

### During

```
□ All subagents working
□ No cross-talk needed
□ Each stays in their lane
```

### After

```
□ All subagents reported complete
□ Checked for conflicts
□ Merged all branches
□ Ran full test suite
□ Verified integration works
```

## Example: Parallel Feature Build

### Scenario

Building user dashboard with 3 independent widgets:
- Activity feed
- Stats panel
- Quick actions

### Dispatch

```markdown
## Subagent 1: Activity Feed

**Scope:** src/components/dashboard/ActivityFeed/
**Task:** Build activity feed widget showing recent user actions
**Branch:** feature/dashboard-activity-feed
**Boundaries:** Only modify files in ActivityFeed directory

---

## Subagent 2: Stats Panel

**Scope:** src/components/dashboard/StatsPanel/
**Task:** Build stats panel showing user metrics
**Branch:** feature/dashboard-stats-panel
**Boundaries:** Only modify files in StatsPanel directory

---

## Subagent 3: Quick Actions

**Scope:** src/components/dashboard/QuickActions/
**Task:** Build quick actions widget with common tasks
**Branch:** feature/dashboard-quick-actions
**Boundaries:** Only modify files in QuickActions directory
```

### Integration

After all complete:

```bash
# Create integration branch
git checkout -b feature/dashboard-all

# Merge each (should be clean)
git merge feature/dashboard-activity-feed
git merge feature/dashboard-stats-panel
git merge feature/dashboard-quick-actions

# Update parent component to include all widgets
# Run tests
# Verify visually
```

## Parallelization Limits

### Practical Limits

| Factor | Recommendation |
|--------|----------------|
| Max parallel subagents | 3-5 (more gets hard to coordinate) |
| Task size | Each should be 15-30 min |
| Complexity | Keep parallel tasks simple |

### When to Serialize Instead

- Tasks are small (overhead of parallelizing > time saved)
- You're unsure about independence
- Need to learn from one task before doing next
- Debugging (focus is better than breadth)

## Integration with Other Skills

- **task-decomposition**: Break big task into parallel-able pieces
- **subagent-driven-development**: Parallel subagents follow same patterns
- **completion-checklist**: Each subagent runs checklist before reporting done
- **progress-heartbeat**: Log parallel execution status

