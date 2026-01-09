# EDNA Command Center

Central hub for managing development workflows, projects, and autonomous execution across your entire development ecosystem.

## Quick Start

- **View all projects:** [`PROJECTS.md`](./PROJECTS.md)
- **View all skills & commands:** [`skills/SKILL-INDEX.md`](./skills/SKILL-INDEX.md)
- **Start your session:** `/pm:status`

## What's Inside

### Core Capabilities

- **48 Skills** - Reusable workflows for development, project management, and automation
- **20 Commands** - CLI shortcuts for common operations (e.g., `/dev:plan`, `/pm:tasks`, `/utils:image`)
- **15 Active Projects** - Across multiple platforms and domains
- **Autonomous Execution** - Built-in support for hands-off work with progress tracking and recovery

### Skill Categories

- **Development:** Planning, git workflows, code review, testing, debugging
- **Project Management:** Task tracking, kanban board, idea capture, dashboards
- **Runtime/Autonomy:** Error recovery, progress monitoring, parallel execution, dependency tracking
- **Integrations:** Web research, image generation, transcription, translation, audio generation

## Project Ecosystem

See [`PROJECTS.md`](./PROJECTS.md) for the complete registry of 15 active projects across multiple domains:

- **Help Genie Ecosystem** - Consumer help platform (6 projects)
- **Learning Platforms** - Educational technology (2 projects)
- **AI Intelligence** - Advanced AI solutions (2 projects)
- **Maintenance & Archive** - Legacy and low-activity projects (5 projects)

## Key Workflows

### Development
```
/dev:brainstorm → /dev:plan → code → /dev:review → /dev:verify → /dev:commit
```

### Bug Fixes
```
/dev:debug → fix → /dev:review → /dev:verify → /dev:commit
```

### Autonomous Work
```
/pm:status → prepare work → enable autonomous resilience → let it run
```

### Project Navigation
```
/pm:dashboard → /pm:switch <project> → /pm:status → /pm:tasks
```

## Directory Structure

```
.claude/
├── commands/          # CLI command definitions
├── skills/            # Reusable skill definitions
├── scripts/           # Supporting scripts (JS, Node.js)
├── projects/          # Claude Code project metadata
├── PROJECTS.md        # Central project registry
└── README.md          # This file
```

## Getting Help

- `/help` - Get help with Claude Code features
- [Official Claude Code Docs](https://github.com/anthropics/claude-code)
- [`skills/SKILL-INDEX.md`](./skills/SKILL-INDEX.md) - Browse all available skills

## Shared Skills Architecture

All 48 skills are centralized in EDNA and symlinked to every other project. Single source of truth—changes here automatically propagate everywhere.

**Setup (one time):**
```bash
node .claude/scripts/setup-shared-skills.js --fix
```

**Check status:**
```bash
node .claude/scripts/setup-shared-skills.js
```

Projects with local skills keep them (◐ status). Projects without inherit EDNA's (✓ status).

---

**Last Updated:** 2025-12-22
