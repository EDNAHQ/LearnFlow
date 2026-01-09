---
description: Manage tasks - list, add, start, complete, or block items
arguments:
  - name: action
    description: "Command: list/add/start/done/block/show (default: list doing items)"
    required: false
---

Manage tasks in `.claude/pm/ideas.md`.

**Commands:**

| Command | Action |
|---------|--------|
| `/tasks` or `/tasks list` | Show items with status "doing" |
| `/tasks all` | Show all items grouped by status |
| `/tasks add <title>` | Add new item to backlog |
| `/tasks start <id>` | Move item to "doing" |
| `/tasks done <id>` | Mark item as "done" |
| `/tasks block <id> <reason>` | Mark blocked with reason |
| `/tasks unblock <id>` | Move back to "doing" |
| `/tasks show <id>` | Show full item details |

**When updating items:**
- Set `**Updated:**` to today's date
- Add entry to `### Updates` section: `- <date>: Status → <new-status>`

**Response format:**
- Keep it brief and actionable
- Show next suggested action when helpful
