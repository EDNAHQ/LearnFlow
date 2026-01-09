---
description: Show project status overview
arguments: []
---

Generate a project health overview following the project-status skill.

**Gather information:**
1. Git status - uncommitted changes, branch info
2. Recent commits - `git log --oneline -10`
3. Board status - items in each column from `.claude/pm/`
4. Any blocked items
5. Package health - outdated deps if package.json exists

**Output format:**
```
## Project Status: <project-name>

### Git
- Branch: `<branch>` (ahead/behind main)
- Changes: <n> files modified, <n> staged
- Last commit: <time ago> - <message>

### Board
| Backlog | Doing | Blocked | Done |
|---------|-------|---------|------|
| 5 | 2 | 1 | 12 |

### In Progress
- [#3] Task currently being worked on
- [#7] Another active task

### Blocked
- [#5] Blocked task - reason

### Recent Activity
- <date>: <commit message>
- <date>: <commit message>

### Health Checks
- [ ] Tests passing
- [ ] No security vulnerabilities
- [ ] Dependencies up to date
```
