---
name: task-manager
description: Use when user says /tasks or wants to manage tasks - add, start, complete, block, or list items
---

# Task Manager

Quick task management with simple commands for adding, starting, completing, and blocking work items.

## Overview

Manage your task workflow without leaving the conversation. Works with both project-local tasks and the central command center.

## When to Use

- User says `/tasks` with or without subcommand
- User wants to add, start, complete, or block a task
- User asks "what am I working on?"

## Syntax

```
/tasks                      # List current "doing" items
/tasks list                 # Same as above
/tasks all                  # Show all items (any status)
/tasks add <title>          # Add new task to backlog
/tasks start <id>           # Move item to "doing"
/tasks done <id>            # Mark item as "done"
/tasks block <id> <reason>  # Mark blocked with reason
/tasks unblock <id>         # Move back to "doing"
/tasks drop <id>            # Archive/remove item
/tasks show <id>            # Show full item details
```

## Implementation

### Step 1: Determine context

Check for task files in order:
1. Current project's `.claude/pm/tasks.md` (project-local)
2. Central hub's `.claude/pm/ideas.md` (superpowers repo)

If neither exists, offer to initialize.

### Step 2: Parse command

Extract subcommand and arguments from user input:
- Default (no subcommand): `list`
- Commands with ID: `start`, `done`, `block`, `unblock`, `drop`, `show`
- Commands with text: `add`
- `block` also takes a reason after the ID

### Step 3: Execute command

#### `/tasks` or `/tasks list`

Show items with status `doing`:

```bash
node .claude/scripts/pm-utils.js parse "<file>" | jq '.[] | select(.status == "doing")'
```

Render as:

```
## Currently Working On

| #  | Task                        | Priority |
|----|-----------------------------+----------|
| 3  | Fix authentication bug      | p1       |
| 7  | Update documentation        | p2       |

2 items in progress. Use `/tasks done <id>` to complete.
```

If empty:
```
No tasks in progress.

Use `/tasks start <id>` to begin working on something.
Use `/board` to see your full backlog.
```

#### `/tasks all`

Show all items grouped by status:

```
## All Tasks

### DOING (2)
[3] Fix authentication bug (p1)
[7] Update documentation (p2)

### BLOCKED (1)
[5] Deploy to production (p1) - waiting for approval

### BACKLOG (4)
[1] Refactor user service (p2)
[2] Add unit tests (p2)
[4] Performance optimization (p3)
[6] Update dependencies (p3)

### DONE (3)
[8] Fix login form (p2)
...
```

#### `/tasks add <title>`

Add new item to backlog:

```bash
node .claude/scripts/pm-utils.js add "<file>" '{"title": "<title>", "status": "backlog"}'
```

Response:
```
Added task #12: "<title>"
Status: backlog | Use `/tasks start 12` to begin.
```

#### `/tasks start <id>`

Move item to "doing":

```bash
node .claude/scripts/pm-utils.js update "<file>" <id> '{"status": "doing"}'
```

Response:
```
Started task #<id>: "<title>"
Good luck! Use `/tasks done <id>` when complete.
```

#### `/tasks done <id>`

Mark as completed:

```bash
node .claude/scripts/pm-utils.js update "<file>" <id> '{"status": "done"}'
```

Response:
```
Completed task #<id>: "<title>"
Nice work! You have <n> remaining tasks in progress.
```

#### `/tasks block <id> <reason>`

Mark as blocked:

```bash
node .claude/scripts/pm-utils.js update "<file>" <id> '{"status": "blocked", "blockedReason": "<reason>"}'
```

Response:
```
Blocked task #<id>: "<title>"
Reason: <reason>
Use `/tasks unblock <id>` when resolved.
```

#### `/tasks unblock <id>`

Move back to doing:

```bash
node .claude/scripts/pm-utils.js update "<file>" <id> '{"status": "doing", "blockedReason": null}'
```

Response:
```
Unblocked task #<id>: "<title>"
Back in progress!
```

#### `/tasks drop <id>`

Archive the item:

```bash
node .claude/scripts/pm-utils.js update "<file>" <id> '{"status": "archived"}'
```

Response:
```
Archived task #<id>: "<title>"
```

#### `/tasks show <id>`

Display full item details:

```bash
node .claude/scripts/pm-utils.js find "<file>" <id>
```

Response:
```
## Task #<id>: <title>

**Status:** <status>
**Priority:** <priority>
**Created:** <date>
**Updated:** <date>

<description>

### History
- 2025-01-16: Status → doing
- 2025-01-15: Created
```

## Error Handling

- **Item not found:** `Task #<id> not found. Use /tasks all to see available items.`
- **No file exists:** `No task file found. Initialize with /idea to create the command center.`
- **Invalid command:** `Unknown command "<cmd>". Try: list, add, start, done, block, unblock, drop, show`

## Tips

- Tasks inherit from ideas - `/idea` captures, `/tasks` manages
- Use `/board` for a visual kanban view
- Only one task in "doing" at a time? Consider it a focus technique!
- Blocked items surface in reviews so nothing gets forgotten
