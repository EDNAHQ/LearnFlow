---
description: Switch active project context
arguments:
  - name: project
    description: Project name or path to switch to (leave empty to list projects)
    required: false
---

# Project Context Switch

Switch between projects while preserving context and state.

## Behavior

### If no project specified:
List all known projects from `~/.claude/projects.json` or scan common locations:
- `~/Projects/`
- `~/Code/`
- `~/CascadeProjects/`

Show each with quick status:
```
## Available Projects

| # | Project | Branch | Status | Last Active |
|---|---------|--------|--------|-------------|
| 1 | app-1 | main | 3 doing | 2h ago |
| 2 | app-2 | feature/auth | 1 blocked | 1d ago |
| 3 | api-service | main | clean | 3d ago |

Switch with: /switch <name> or /switch <number>
```

### If project specified:

1. **Save current context** (if in a project):
   - Write to `.claude/context-snapshot.md`:
     - Current branch
     - Uncommitted changes count
     - Active tasks (doing/blocked)
     - Last file edited
     - Timestamp

2. **Load new project context**:
   - Read `.claude/context.md` (client/project info)
   - Read `.claude/context-snapshot.md` (last session state)
   - Read `.claude/pm/board.md` (current tasks)
   - Get git status

3. **Output summary**:
```
## Switched to: <project-name>

### Context
- **Client:** <client or "Personal">
- **Type:** <client project / internal / side project>
- **Priority:** <what matters most>

### Where You Left Off
- **Branch:** `<branch>`
- **Last Active:** <timestamp>
- **Uncommitted:** <n> files
- **Last Edit:** <file>

### Current Work
| Doing | Blocked |
|-------|---------|
| Task 1 | Task 3 (reason) |
| Task 2 | |

### Quick Actions
- `/status` - Full project status
- `/tasks` - Manage tasks
- `/board` - Visual board
```

## Projects Registry

Maintain `~/.claude/projects.json`:
```json
{
  "projects": [
    {
      "name": "app-1",
      "path": "/Users/you/Projects/app-1",
      "lastActive": "2024-01-15T10:30:00Z",
      "client": "Acme Corp"
    }
  ]
}
```

Auto-add projects when first switched to.

## Context Snapshot Format

`.claude/context-snapshot.md`:
```markdown
# Context Snapshot

**Saved:** 2024-01-15 10:30:00
**Branch:** feature/new-dashboard
**Uncommitted:** 3 files

## Active Tasks
- [#12] Building dashboard component (doing)
- [#8] Waiting on API endpoint (blocked)

## Recent Files
- src/components/Dashboard.tsx
- src/api/metrics.ts

## Notes
Working on chart integration, need to finish data fetching.
```
