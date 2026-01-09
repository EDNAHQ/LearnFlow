---
name: project-status
description: Use at the start of any session to understand current project state and resume work
---

# Project Status

## Overview

Quickly understand where things stand in the current project and resume from where you left off.

**Core principle:** Never start a session confused about project state.

## When to Use

- Opening a project for the first time in a session
- Resuming after a break
- Before deciding what to work on

## What to Check

### 1. Current Work (`.claude/current-plan.md`)

If exists, report:
- What feature/fix is in progress
- How many tasks completed vs remaining
- Last task worked on

### 2. Progress State (`.claude/progress.md`)

If exists, report:
- When was last session
- Where did we stop
- Any blockers noted
- Any assumptions made while working autonomously

### 3. Backlog (`.claude/backlog.md`)

If exists, summarize:
- Count of high priority items
- Count of medium priority items
- Any urgent bugs noted

### 4. Git State

Quick check:
- Current branch
- Uncommitted changes?
- Ahead/behind remote?

## Report Format

```
📊 PROJECT STATUS: [project name]

🔨 CURRENT WORK: [feature name]
   Progress: [X/Y tasks] | Last: [task name]
   Branch: [branch name]
   
⏰ LAST SESSION: [date/time]
   Stopped at: [description]
   Blockers: [none or list]

📋 BACKLOG: [X high] | [Y medium] | [Z ideas]
   Top priority: [first high-pri item]

🔀 GIT: [branch] | [clean/dirty] | [ahead/behind]

Ready to continue current work, or switch focus?
```

## If No `.claude/` Directory

This project hasn't been set up for tracking yet.

Offer to create:
```
This project doesn't have tracking set up yet.
Would you like me to create:
- .claude/backlog.md (track all work items)
- .claude/current-plan.md (track active work)
- .claude/progress.md (track session state)
```

## Quick Actions

Based on status, offer relevant next steps:

| Situation | Offer |
|-----------|-------|
| Current work in progress | "Continue from [task]?" |
| Current work blocked | "Address blocker first?" |
| Current work complete | "Mark done and pick from backlog?" |
| No current work | "Start something from backlog?" |
| Empty backlog | "Brainstorm what to build?" |

