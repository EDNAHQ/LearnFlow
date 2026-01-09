---
name: prepare-autonomous-execution
description: Use when setting up work that should run without interruption while you're away from your desk
---

# Prepare Autonomous Execution

## Overview

Prepares your project for unattended execution by ensuring all dependencies, permissions, and state tracking are in place before you leave.

**Core principle:** Front-load all interactive steps so Claude can work autonomously.

## When to Use

- Before going AFK (lunch, meetings, overnight)
- When you want Claude to execute a plan without interruption
- Before starting subagent-driven-development on a large plan

## Pre-Flight Checklist

**IMPORTANT: Use TodoWrite to create todos for each section below.**

### 1. Dependencies & Setup (Run NOW)

These commands may need approval—run them while you're present:

```bash
# Package managers
npm install        # or yarn, pnpm
pip install -r requirements.txt
cargo build

# Git state
git fetch origin
git status         # Ensure clean working directory

# Build/compile
npm run build      # or equivalent
```

- [ ] All dependencies installed
- [ ] Git working directory clean
- [ ] Project builds successfully
- [ ] Tests pass before starting

### 2. Plan Review

Before autonomous execution, verify:

- [ ] Plan file exists (e.g., `docs/plans/current-plan.md`)
- [ ] Plan has been approved by you
- [ ] Tasks are well-defined with clear acceptance criteria
- [ ] No tasks require external services you haven't configured
- [ ] No tasks need credentials/API keys you haven't provided
- [ ] Estimated runtime fits your AFK window

### 3. Environment Verification

Check that Claude can do what the plan requires:

- [ ] File read/write permissions work
- [ ] Git operations work (commit, branch, etc.)
- [ ] Test runner works
- [ ] Any external tools the plan needs are available

### 4. Progress Tracking Setup

Create or verify progress tracking file:

```markdown
# Autonomous Execution Progress

**Plan:** [path to plan file]
**Started:** [timestamp]
**Mode:** Autonomous (AFK)

## Tasks
[Will be populated from plan]

## Blockers Encountered
[Claude will log any issues here]

## Assumptions Made
[Claude will log decisions made without human input]
```

Save as: `.claude/progress.md` or `afk-progress.md` in project root

### 5. Execution Command

Start with clear instructions:

```
Execute the plan at [path/to/plan.md] using subagent-driven-development.

Rules for autonomous execution:
1. Update progress file after each task
2. If you hit a blocker you can't resolve, log it and continue to next task
3. Document any assumptions you make
4. Commit after each completed task
5. Do not wait for human input—make reasonable decisions and document them
```

## Command Whitelist Recommendations

For uninterrupted execution, these commands should be pre-approved in Claude Code settings:

**Git:**
- `git add`, `git commit`, `git push`, `git checkout`, `git branch`
- `git status`, `git diff`, `git log`, `git fetch`

**Node/JavaScript:**
- `npm test`, `npm run *`, `npm install`
- `node`, `npx`

**Python:**
- `python`, `python3`, `pip`
- `pytest`, `python -m pytest`

**General:**
- `cat`, `ls`, `mkdir`, `rm`, `cp`, `mv`
- `grep`, `find`, `head`, `tail`

## What To Do When You Return

1. Check progress file first
2. Review "Blockers Encountered" section
3. Review "Assumptions Made" section
4. Run full test suite
5. Review git log for commits made

## Red Flags - Don't Go AFK If:

- Plan has ambiguous tasks ("improve performance" without metrics)
- Tasks depend on external APIs you haven't tested
- Working on production systems
- Plan hasn't been reviewed and approved
- Tests aren't passing before you start

## Safety Notes

**This skill prepares for autonomous execution but does NOT bypass security.**

For truly unattended execution, you must either:
1. Pre-approve commands in Claude Code settings, OR
2. Run with `--dangerously-skip-permissions` flag (use in sandbox only)

The permission system exists to protect you. Bypassing it is your choice, not something skills can override.

