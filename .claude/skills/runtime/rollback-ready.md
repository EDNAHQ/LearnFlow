---
name: rollback-ready
description: Use to maintain safe rollback points throughout autonomous work so you can always recover
---

# Rollback Ready

## Overview

Always maintain the ability to **undo everything** and return to a known good state. Tag working states, commit frequently, and never get into an unrecoverable position.

**Core principle:** Every change should be reversible.

## The Safety Net

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  KNOWN GOOD STATE (tagged)                                  │
│       │                                                     │
│       ├── Change 1 (committed)                              │
│       │     └── Rollback: git revert abc123                 │
│       │                                                     │
│       ├── Change 2 (committed)                              │
│       │     └── Rollback: git revert def456                 │
│       │                                                     │
│       ├── Change 3 (committed)                              │
│       │     └── Rollback: git revert ghi789                 │
│       │                                                     │
│       └── If everything breaks:                             │
│             git reset --hard pre-session-tag                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Session Start: Create Safety Tag

Before making any changes:

```bash
# Tag the current known-good state
git tag -a pre-session-$(date +%Y%m%d-%H%M) -m "Before autonomous session"

# Or simpler
git tag pre-work
```

Now you can always return:

```bash
git reset --hard pre-work
```

## Commit Strategy

### Commit Frequently

```
❌ BAD: One giant commit at the end
   - Can't rollback partially
   - All or nothing

✅ GOOD: Small commits after each logical change
   - Rollback any single change
   - Keep what works, undo what doesn't
```

### Commit Pattern

```bash
# After each completed subtask
git add -A
git commit -m "feat: add user registration form"

# After fixing something
git add -A
git commit -m "fix: resolve form validation error"

# After refactoring
git add -A
git commit -m "refactor: extract validation helpers"
```

### Commit Message Format

For easy rollback identification:

```
<type>: <short description>

Types:
- feat: New feature
- fix: Bug fix
- refactor: Code restructuring
- test: Adding tests
- docs: Documentation
- chore: Maintenance
```

## Rollback Scenarios

### Scenario 1: Last commit was bad

```bash
# Undo last commit, keep changes staged
git reset --soft HEAD~1

# Or undo last commit completely
git reset --hard HEAD~1
```

### Scenario 2: Specific commit was bad

```bash
# Find the bad commit
git log --oneline

# Revert just that commit
git revert abc123
```

### Scenario 3: Everything since tag is bad

```bash
# Nuclear option - return to safety tag
git reset --hard pre-work

# Or to a specific tag
git reset --hard pre-session-20251221-1400
```

### Scenario 4: Want to try something risky

```bash
# Create a savepoint before experimenting
git stash push -m "savepoint before experiment"

# Try risky thing
# ...

# If it worked, drop the stash
git stash drop

# If it failed, restore
git stash pop
```

## Milestone Tags

Tag significant progress points:

```bash
# After completing major feature
git tag milestone-auth-complete

# After all tests passing
git tag tests-green-20251221

# Before major refactor
git tag pre-refactor
```

## Rollback Checklist

Before any risky operation:

```
□ Current state committed?
□ Tag created for rollback point?
□ Know the rollback command?
□ Tests passing at this point?
```

## Database Considerations

Git can't rollback database changes! Handle separately:

### For Migrations

```bash
# Before running migrations
pg_dump mydb > backup-pre-migration.sql

# If migration fails
psql mydb < backup-pre-migration.sql
```

### For Data Changes

```bash
# Always have rollback migration
# up: ALTER TABLE users ADD COLUMN avatar
# down: ALTER TABLE users DROP COLUMN avatar
```

## File System Changes (Non-Git)

For changes outside git:

```bash
# Before modifying system files
cp important-file.conf important-file.conf.backup

# Before deleting
mv file-to-delete.txt file-to-delete.txt.bak
```

## Rollback Log

Track rollback points in your progress file:

```markdown
## Rollback Points

| Tag | Time | Description |
|-----|------|-------------|
| pre-session | 14:00 | Before starting any work |
| auth-done | 14:30 | Auth complete, tests pass |
| pre-refactor | 15:00 | Before major refactor |
| current | 15:20 | In progress |

**Current safe point:** auth-done (15 commits ago)
**Nuclear rollback:** pre-session (25 commits ago)
```

## Automatic Rollback Points

Create rollback points automatically:

```bash
# Add to your workflow - tag before each task
git tag task-$TASK_NUMBER-start

# After task complete
git tag task-$TASK_NUMBER-done
```

## Recovery Playbook

When things go wrong:

### Level 1: Recent mistake

```bash
# Undo last change
git checkout -- .  # Discard uncommitted changes
# or
git reset --hard HEAD  # Reset to last commit
```

### Level 2: Bad commits

```bash
# See what happened
git log --oneline -10

# Revert specific commits
git revert <commit1> <commit2>
```

### Level 3: Major rollback

```bash
# Return to milestone
git reset --hard milestone-auth-complete

# Or to session start
git reset --hard pre-session
```

### Level 4: Nuclear

```bash
# Return to main branch state
git checkout main
git branch -D feature-branch
git checkout -b feature-branch

# Start fresh
```

## Integration

Use with:
- **autonomous-resilience**: Enables bolder decisions (can always rollback)
- **error-recovery-loop**: Rollback is a valid recovery strategy
- **parallel-execution**: Each branch is a natural rollback boundary
- **prepare-autonomous-execution**: Create session tag in pre-flight

## The Rule

> "Before doing anything significant, ensure you can undo it."

This enables autonomy without fear. Try things. If they don't work, rollback and try differently.

