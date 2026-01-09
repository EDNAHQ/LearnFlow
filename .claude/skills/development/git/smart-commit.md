---
name: smart-commit
description: Use when committing changes to automatically generate meaningful conventional commit messages
---

# Smart Commit

## Overview

Automatically generate conventional commit messages by analyzing your git diff. Understands what changed and creates descriptive, properly-formatted commits.

**Core principle:** Consistent, meaningful commits without the mental overhead.

## When to Use

- After completing a unit of work
- During autonomous execution (consistent commit style)
- When you want well-formatted conventional commits
- To enforce commit message standards

## Quick Start

```bash
# Stage your changes
git add .

# Generate commit message and commit
node .claude/scripts/smart-commit.js
```

Output:
```
📝 Generated Commit Message:

──────────────────────────────────────────────────
feat(auth): add password reset flow
──────────────────────────────────────────────────

📊 4 file(s) changed

✅ Committed successfully!
```

## Usage

### Dry Run (Preview Only)

```bash
node .claude/scripts/smart-commit.js --dry-run
```

See the generated message without committing.

### Force Type or Scope

```bash
# Override detected type
node .claude/scripts/smart-commit.js --type=fix

# Override scope
node .claude/scripts/smart-commit.js --scope=payments

# Both
node .claude/scripts/smart-commit.js --type=feat --scope=auth
```

### Include Detailed Body

```bash
node .claude/scripts/smart-commit.js --body
```

Output:
```
feat(auth): add password reset

Added:
- src/auth/resetPassword.ts
- src/auth/resetPassword.test.ts

Modified:
- src/auth/index.ts
```

### Breaking Changes

```bash
node .claude/scripts/smart-commit.js --breaking
```

Output: `feat(api)!: change response format`

### Amend Previous Commit

```bash
node .claude/scripts/smart-commit.js --amend
```

## How It Works

The script analyzes your changes to determine:

### 1. Commit Type

| Detected Pattern | Type |
|------------------|------|
| New exports, new files | `feat` |
| Bug fix keywords in diff | `fix` |
| Test files only | `test` |
| .md files, README | `docs` |
| CSS/SCSS only | `style` |
| package.json, configs | `chore` |
| Performance keywords | `perf` |
| Refactor keywords | `refactor` |

### 2. Scope

Extracted from directory structure:

```
src/components/Button.tsx  → scope: ui
src/api/users.ts           → scope: api  
src/hooks/useAuth.ts       → scope: hooks
```

### 3. Subject

Based on what files changed:

```
Single file: "add UserProfile"
Multiple related: "update auth, session"
Many files: "update components files"
```

## Conventional Commit Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type | When to Use |
|------|-------------|
| `feat` | New feature for the user |
| `fix` | Bug fix for the user |
| `docs` | Documentation only changes |
| `style` | Formatting, missing semicolons, etc. |
| `refactor` | Code change that neither fixes nor adds |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `chore` | Build process, dependencies, tooling |

### Breaking Changes

Use `!` suffix: `feat(api)!: remove deprecated endpoints`

## Integration with Workflow

### After Each Task Completion

```bash
# Complete task
# Run tests
npm test

# Stage and commit
git add .
node .claude/scripts/smart-commit.js
```

### In Autonomous Execution

Add to completion-checklist:

```markdown
## Task Completion
- [ ] Implementation done
- [ ] Tests passing
- [ ] Commit with: `node .claude/scripts/smart-commit.js`
```

### In Subagent Work

Each subagent commits with smart-commit for consistent history:

```markdown
## Subagent Completion
After task:
1. Verify tests pass
2. Stage changes: `git add .`
3. Commit: `node .claude/scripts/smart-commit.js`
4. Report completion
```

## Options Reference

| Option | Description |
|--------|-------------|
| `--staged` | Analyze staged changes only (default) |
| `--all` | Include unstaged changes |
| `--dry-run` | Preview without committing |
| `--type=TYPE` | Force commit type |
| `--scope=SCOPE` | Force scope |
| `--breaking` | Mark as breaking change |
| `--amend` | Amend previous commit |
| `--body` | Include detailed body |

## Examples

### Feature Commit

```bash
# Added new payment component
git add src/payments/
node .claude/scripts/smart-commit.js
# → feat(payments): add PaymentForm
```

### Bug Fix

```bash
# Fixed login issue
git add src/auth/login.ts
node .claude/scripts/smart-commit.js --type=fix
# → fix(auth): update login
```

### Test Addition

```bash
# Added tests
git add src/**/*.test.ts
node .claude/scripts/smart-commit.js
# → test: add auth, user tests
```

### Documentation

```bash
# Updated README
git add README.md
node .claude/scripts/smart-commit.js
# → docs: update README
```

### Breaking Change

```bash
# Changed API format
git add src/api/
node .claude/scripts/smart-commit.js --breaking
# → feat(api)!: update response format
```

## Tips

### Good Commit Hygiene

1. **Commit small, commit often** - easier to generate good messages
2. **One logical change per commit** - clearer auto-generated descriptions
3. **Stage related files together** - better scope detection

### When Auto-Detection Fails

Use manual overrides:

```bash
# Script detected 'chore' but it's really a feature
node .claude/scripts/smart-commit.js --type=feat

# Better scope than auto-detected
node .claude/scripts/smart-commit.js --scope=payments
```

### Review Before Committing

Always use `--dry-run` first when unsure:

```bash
node .claude/scripts/smart-commit.js --dry-run
# Review the message
# If good, run without --dry-run
```

## Troubleshooting

### "No changes to commit"

```bash
# Stage your changes first
git add .
node .claude/scripts/smart-commit.js

# Or use --all to include unstaged
node .claude/scripts/smart-commit.js --all
```

### Wrong Type Detected

Override with `--type`:

```bash
node .claude/scripts/smart-commit.js --type=feat
```

### Want More Detail

Use `--body` for file list:

```bash
node .claude/scripts/smart-commit.js --body
```

