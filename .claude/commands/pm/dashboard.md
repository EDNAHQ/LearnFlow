---
description: Cross-project dashboard overview
arguments: []
---

# Multi-Project Dashboard

Show unified status across all registered projects.

## Gather Data

For each project in `~/.claude/projects.json`:
1. Read `.claude/pm/board.md` for task counts
2. Read `.claude/context-snapshot.md` for last activity
3. Quick `git status` for uncommitted work
4. Read `.claude/context.md` for client info

## Output Format

```
# Project Dashboard

## Overview

| Project | Client | Doing | Blocked | Uncommitted | Last Active |
|---------|--------|-------|---------|-------------|-------------|
| app-1 | Acme Corp | 2 | 1 | 3 files | 2h ago |
| app-2 | Internal | 1 | 0 | clean | 1d ago |
| api-svc | Beta Inc | 0 | 2 | 1 file | 3d ago |

**Totals:** 3 doing, 3 blocked, 4 uncommitted files

---

## Attention Needed

### Blocked Items
- **app-1** [#5]: Waiting on API keys - @john
- **api-svc** [#12]: Dependency conflict - needs research
- **api-svc** [#14]: Client feedback pending

### Stale Projects (no activity >7 days)
- **old-project**: Last active 14 days ago

### Uncommitted Work
- **app-1**: 3 files on `feature/dashboard`
- **api-svc**: 1 file on `main`

---

## Quick Stats

| Metric | Count |
|--------|-------|
| Active projects | 3 |
| Total in progress | 3 |
| Total blocked | 3 |
| Projects with uncommitted work | 2 |

---

## Quick Actions
- `/switch <project>` - Switch to a project
- `/status` - Current project status
- `/tasks list all` - All tasks across projects
```

## Sorting

Projects sorted by:
1. Has blocked items (needs attention)
2. Has uncommitted work (needs commit)
3. Last active (most recent first)

## Refresh

Dashboard data is gathered fresh each time - no caching.

## Cross-Project Tasks View

If user runs `/dashboard tasks`:

```
# All Tasks Across Projects

## Doing
| Project | Task | Started |
|---------|------|---------|
| app-1 | [#3] Dashboard component | 2h ago |
| app-1 | [#7] API integration | 1d ago |
| app-2 | [#2] Auth flow | 3h ago |

## Blocked
| Project | Task | Reason | Since |
|---------|------|--------|-------|
| app-1 | [#5] Deploy | Waiting on keys | 2d |
| api-svc | [#12] Upgrade | Dep conflict | 1d |
```
