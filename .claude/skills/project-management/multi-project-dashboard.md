---
name: multi-project-dashboard
description: Use when you want to see status across all your projects at once
---

# Multi-Project Dashboard

## Overview

See the state of all your projects in one view to decide where to focus.

**Core principle:** One glance to know what needs attention across all projects.

## When to Use

- Start of day/week planning
- Deciding which project to work on
- Checking what's blocked across projects
- After AFK execution to see what completed

## Configuration

Set your projects root in `.claude/config.md` or specify when asked:

```markdown
# Claude Config

projects_root: C:\Users\GGPC\Projects
# or: ~/projects
```

Default: Scans common locations (`~/projects`, `~/code`, `~/dev`)

## How It Works

1. Scan all directories in projects root
2. Look for `.claude/` subdirectory in each
3. Read status files from each project
4. Compile into dashboard view

## Dashboard Format

```
╔══════════════════════════════════════════════════════════════════╗
║  PROJECT DASHBOARD                          [2025-12-21 14:30]   ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  🔨 ACTIVE WORK                                                  ║
║  ┌────────────┬─────────────────────┬────────────┬─────────────┐ ║
║  │ Project    │ Current Task        │ Progress   │ Status      │ ║
║  ├────────────┼─────────────────────┼────────────┼─────────────┤ ║
║  │ app-1      │ Password Reset      │ 3/5 tasks  │ ⏳ Active   │ ║
║  │ app-5      │ Stripe Migration    │ 7/7 tasks  │ ✅ Ready    │ ║
║  │ app-7      │ Bug Fixes           │ 2/4 tasks  │ 🔴 Blocked  │ ║
║  └────────────┴─────────────────────┴────────────┴─────────────┘ ║
║                                                                  ║
║  📋 BACKLOG SUMMARY                                              ║
║  ┌────────────┬────────┬────────┬────────┐                       ║
║  │ Project    │ High   │ Medium │ Ideas  │                       ║
║  ├────────────┼────────┼────────┼────────┤                       ║
║  │ app-1      │ 2      │ 4      │ 3      │                       ║
║  │ app-2      │ 3      │ 1      │ 0      │ ← needs attention     ║
║  │ app-3      │ 0      │ 2      │ 5      │                       ║
║  │ app-4      │ 1      │ 0      │ 2      │                       ║
║  │ app-6      │ 0      │ 0      │ 1      │                       ║
║  │ app-8      │ 0      │ 3      │ 4      │                       ║
║  └────────────┴────────┴────────┴────────┘                       ║
║                                                                  ║
║  ⚡ RECOMMENDATIONS                                               ║
║  • app-5: Ready to merge/deploy (all tasks complete)             ║
║  • app-7: Blocked - needs API key (see .claude/progress.md)      ║
║  • app-2: 3 high priority items waiting                          ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

## Status Icons

| Icon | Meaning |
|------|---------|
| ⏳ | Work in progress |
| ✅ | Ready (all tasks done) |
| 🔴 | Blocked (needs human input) |
| 💤 | Idle (no active work) |
| ⚠️ | Stale (no activity in 7+ days) |

## Actions from Dashboard

| Command | Action |
|---------|--------|
| "Open app-1" | Switch to that project, show detailed status |
| "What's blocking app-7?" | Show blocker details |
| "Start work on app-2" | Open project, pick from backlog |
| "Deploy app-5" | Switch to project, run finishing workflow |

## For AFK Execution

Can queue multiple projects:

```
"Run autonomous execution on app-1 and app-7. 
Update dashboard when done."
```

After completion, dashboard shows what was accomplished.

