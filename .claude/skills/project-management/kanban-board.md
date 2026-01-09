---
name: kanban-board
description: Use when user says /board or wants to see a visual kanban view of their tasks and ideas
---

# Kanban Board

Visual kanban-style view of your tasks organized by status columns.

## Overview

See all your work at a glance in a board format with Backlog, Doing, Blocked, and Done columns. Move items between columns with simple commands.

## When to Use

- User says `/board`
- User wants to "see the board" or "show my kanban"
- User wants to move items between columns
- User wants to archive completed work

## Syntax

```
/board                      # Show the board
/board move <id> <status>   # Move item to column (backlog|doing|blocked|done)
/board archive              # Archive all done items
/board archive <id>         # Archive specific item
/board focus                # Show only doing + blocked (hide backlog/done)
/board project <name>       # Show board for specific project
```

## Implementation

### Step 1: Determine context

Check for files:
1. Current project's `.claude/pm/tasks.md`
2. Central hub's `.claude/pm/ideas.md`
3. If `project <name>` specified, use `.claude/pm/projects/<name>.md`

### Step 2: Parse and render

#### `/board` (default view)

Read items and group by status. Render as:

```
╔══════════════════════════════════════════════════════════════════════╗
║                           YOUR BOARD                                  ║
╠═══════════════════╦═══════════════════╦═══════════════════╦══════════╣
║ BACKLOG (4)       ║ DOING (2)         ║ BLOCKED (1)       ║ DONE (3) ║
╠═══════════════════╬═══════════════════╬═══════════════════╬══════════╣
║ [1] Refactor user ║ [3] !Fix auth bug ║ [5] !Deploy prod  ║ [8] ✓    ║
║ [2] Add tests     ║ [7] Update docs   ║     → approval    ║ [9] ✓    ║
║ [4] Perf optimize ║                   ║                   ║ [10] ✓   ║
║ [6] Update deps   ║                   ║                   ║          ║
╚═══════════════════╩═══════════════════╩═══════════════════╩══════════╝

Commands: /board move <id> doing | /board archive | /tasks show <id>
```

Or a simpler ASCII version:

```
## BACKLOG (4)
  [1] Refactor user service
  [2] Add unit tests
  [4] Performance optimization
  [6] Update dependencies

## DOING (2)
  [3] !Fix authentication bug (p1)
  [7] Update documentation

## BLOCKED (1)
  [5] !Deploy to production (p1)
      → waiting for approval

## DONE (3)
  [8] ✓ Fix login form
  [9] ✓ Setup CI/CD
  [10] ✓ Write README

---
Move: `/board move <id> <status>`
Archive completed: `/board archive`
```

Priority indicators:
- `!!!` = p0 (critical)
- `!!` = p1 (high)
- `!` = p2 (normal, often omitted)
- (none) = p3 (low)

#### `/board move <id> <status>`

Update item status:

```bash
node .claude/scripts/pm-utils.js update "<file>" <id> '{"status": "<status>"}'
```

Valid statuses: `backlog`, `doing`, `blocked`, `done`

Response:
```
Moved #<id> "<title>" → <STATUS>
```

Then re-render the board to show the change.

#### `/board archive`

Move all "done" items to archived status:

```bash
# For each item with status=done:
node .claude/scripts/pm-utils.js update "<file>" <id> '{"status": "archived"}'
```

Response:
```
Archived 3 completed items.
Your board is now clean!
```

#### `/board archive <id>`

Archive a specific item:

```bash
node .claude/scripts/pm-utils.js update "<file>" <id> '{"status": "archived"}'
```

Response:
```
Archived #<id>: "<title>"
```

#### `/board focus`

Show only Doing and Blocked columns (work in progress):

```
## FOCUS VIEW

### DOING (2)
  [3] !Fix authentication bug
  [7] Update documentation

### BLOCKED (1)
  [5] !Deploy to production
      → waiting for approval

---
3 items need attention. Backlog and Done hidden.
```

#### `/board project <name>`

Load and display a project-specific board:

```bash
node .claude/scripts/pm-utils.js render ".claude/pm/projects/<name>.md" kanban
```

Response header:
```
## PROJECT: <name>
```

Then render the board as normal.

## Visual Conventions

| Symbol | Meaning |
|--------|---------|
| `!!!` | Critical priority (p0) |
| `!!` | High priority (p1) |
| `!` | Normal priority (p2) |
| `→` | Blocked reason follows |
| `✓` | Completed item |
| `[n]` | Item ID for commands |

## Tips

- The board auto-detects context - shows project board if in a project, central if not
- Use `/board focus` when you need to concentrate on active work
- Archive regularly to keep the Done column clean
- Blocked items always show their reason so nothing gets lost
- Use `/tasks show <id>` to see full details of any item
