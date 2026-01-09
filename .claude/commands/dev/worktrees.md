---
description: Show git worktree status dashboard
arguments: []
---

Display a dashboard of all git worktrees following the worktree-dashboard skill.

**Gather info:**
```bash
git worktree list
```

For each worktree, show:
- Path
- Branch name
- Last commit (date + message)
- Dirty/clean status
- Ahead/behind remote

**Output format:**
```
## Git Worktrees

| Path | Branch | Status | Last Commit |
|------|--------|--------|-------------|
| /main | main | clean, up-to-date | 2h ago: feat: add login |
| /feature-x | feature-x | 3 uncommitted | 1d ago: wip |
| /hotfix | hotfix-123 | clean, 2 ahead | 30m ago: fix: auth |

### Actions
- `git worktree add <path> <branch>` - Create new worktree
- `git worktree remove <path>` - Remove worktree
```

If no worktrees exist (just main), explain what worktrees are and how to create one.
