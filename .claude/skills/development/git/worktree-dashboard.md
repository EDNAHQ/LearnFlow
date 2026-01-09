---
name: worktree-dashboard
description: Use to see status of all git worktrees when managing parallel development branches
---

# Git Worktree Dashboard

## Overview

Display the status of all git worktrees at a glance. Essential for managing parallel development branches and seeing which worktrees have uncommitted changes, are ahead/behind, or have gone stale.

**Core principle:** See all your parallel work in one view.

## When to Use

- At the start of a development session
- Before switching between worktrees
- To check which branches have uncommitted work
- When cleaning up old feature branches
- During parallel-execution to monitor branch status

## Quick Start

```bash
node .claude/scripts/worktree-dashboard.js
```

Output:
```
🌳 Git Worktree Dashboard

┌──────────────────────┬──────────────────────┬────────────┐
│ Branch               │ Status               │ Last       │
├──────────────────────┼──────────────────────┼────────────┤
│ ✅ feat/auth ←       │ clean                │ 2h ago     │
│ 🔧 feat/dashboard    │ 3 modified           │ 4h ago     │
│ ⬆️ fix/login         │ ahead 5              │ 1d ago     │
│ ✅ feat/payments     │ clean                │ 3d ago     │
│ ⬇️ feat/old-feature  │ behind 12            │ 15d ago ⚠️ │
└──────────────────────┴──────────────────────┴────────────┘

Legend: ✅ clean  🔧 uncommitted  ⬆️ ahead  ⬇️ behind  ⚠️ stale  ← current

📊 5 worktree(s): 3 clean, 2 with changes
⚠️  1 worktree(s) have no commits in 14+ days
```

## Usage

### Fetch Before Display

```bash
# Get latest remote status first
node .claude/scripts/worktree-dashboard.js --fetch
```

### Compact View

```bash
node .claude/scripts/worktree-dashboard.js --format=compact
```

Output:
```
✅ feat/auth ← you are here
   clean (2h ago)

🔧 feat/dashboard
   3 modified (4h ago)

⬆️ fix/login
   ahead 5 (1d ago)
```

### Verbose Mode

```bash
node .claude/scripts/worktree-dashboard.js --format=compact --verbose
```

Output:
```
✅ feat/auth ← you are here
   clean (2h ago)
   "feat(auth): add session validation"
   /home/user/projects/app-auth

🔧 feat/dashboard
   3 modified (4h ago)
   "feat(dashboard): add widget grid"
   /home/user/projects/app-dashboard
```

### Include Main Branch

```bash
# By default, main/master is hidden if other worktrees exist
node .claude/scripts/worktree-dashboard.js --include-main
```

### Stale Detection

```bash
# Mark worktrees with no commits in 7+ days
node .claude/scripts/worktree-dashboard.js --stale=7
```

### JSON Output

```bash
node .claude/scripts/worktree-dashboard.js --format=json
```

```json
[
  {
    "branch": "feat/auth",
    "path": "/home/user/projects/app-auth",
    "detached": false,
    "status": {
      "clean": true,
      "modified": 0,
      "staged": 0,
      "untracked": 0,
      "ahead": 0,
      "behind": 0
    },
    "lastCommit": {
      "date": "2024-12-22T10:30:00Z",
      "message": "feat(auth): add session validation"
    },
    "isCurrent": true
  }
]
```

## Status Indicators

| Emoji | Meaning |
|-------|---------|
| ✅ | Clean - no uncommitted changes |
| 🔧 | Has uncommitted changes |
| ⬆️ | Ahead of remote (needs push) |
| ⬇️ | Behind remote (needs pull) |
| ❓ | Error reading status |
| ⚠️ | Stale (no recent commits) |
| ← | Current worktree |

## Integration with Workflows

### Session Start

Add to your session start routine:

```bash
# Check all worktree status
node .claude/scripts/worktree-dashboard.js --fetch
```

### With using-git-worktrees Skill

Before creating a new worktree:

```bash
# See existing worktrees
node .claude/scripts/worktree-dashboard.js

# Create new if needed
git worktree add ../feat-new-feature -b feat/new-feature
```

### Cleanup Stale Worktrees

```bash
# Find stale worktrees
node .claude/scripts/worktree-dashboard.js --stale=7

# Remove stale ones
git worktree remove ../old-feature-branch
```

### In parallel-execution

Monitor branch status during parallel work:

```markdown
## Parallel Execution Status

Before merging parallel branches:
1. Run: `node worktree-dashboard.js --fetch`
2. Verify all branches are clean
3. Check ahead/behind status
4. Merge in order
```

## Options Reference

| Option | Description |
|--------|-------------|
| `--format=table\|compact\|json` | Output format (default: table) |
| `--fetch` | Fetch from remote first |
| `--include-main` | Include main/master worktree |
| `--verbose` | Show paths and commit messages |
| `--stale=DAYS` | Mark as stale after N days (default: 14) |

## Worktree Management Tips

### Creating Worktrees

```bash
# Create worktree for new feature
git worktree add ../app-feature-name -b feat/feature-name

# Create worktree for existing branch
git worktree add ../app-fix-bug fix/bug-name
```

### Switching Worktrees

```bash
# Just cd to the worktree directory
cd ../app-feature-name
```

### Removing Worktrees

```bash
# Remove a worktree (branch remains)
git worktree remove ../app-old-feature

# Force remove if has changes
git worktree remove --force ../app-old-feature
```

### Common Worktree Layout

```
projects/
├── app/                 # main branch
├── app-feat-auth/       # feat/auth worktree
├── app-feat-dashboard/  # feat/dashboard worktree
└── app-fix-login/       # fix/login worktree
```

## Troubleshooting

### "Not a git repository"

Run from within a git repository, not from a worktree's parent directory.

### Missing worktrees

If worktrees exist but aren't shown:
```bash
# Prune broken worktree references
git worktree prune
```

### Stale lock files

```bash
# If a worktree shows locked
git worktree unlock ../path-to-worktree
```

## Example Workflows

### Morning Routine

```bash
# 1. See all parallel work
node .claude/scripts/worktree-dashboard.js --fetch

# 2. Note any stale branches to clean up
# 3. Continue work on most recent worktree
```

### Before PR

```bash
# Check the feature branch is clean and up to date
node .claude/scripts/worktree-dashboard.js

# If behind, update
cd ../app-feature-branch
git pull origin main
```

### Cleanup Session

```bash
# Find stale worktrees (7+ days old)
node .claude/scripts/worktree-dashboard.js --stale=7 --verbose

# For each stale worktree, decide:
# - Continue work: cd there and commit
# - Merge: push and create PR
# - Abandon: git worktree remove ../path
```

