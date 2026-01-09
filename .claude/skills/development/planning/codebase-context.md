---
name: codebase-context
description: Use to generate a structured summary of the codebase for new subagents or for quickly understanding project architecture
---

# Codebase Context Generator

## Overview

Generate a comprehensive summary of a codebase's structure, tech stack, and patterns. Essential for loading context into subagents or quickly understanding an unfamiliar project.

**Core principle:** Every agent needs context. Make it fast to share.

## When to Use

- Before dispatching a subagent to work on the codebase
- When returning to a project after time away
- When onboarding to a new project
- To document project architecture
- For parallel-execution skill (each subagent gets context)

## Quick Start

```bash
node .claude/scripts/codebase-context.js
```

Output:
```markdown
# Codebase Context

## Project Overview

**Name:** my-app
**Description:** A web application for task management
**Version:** 1.0.0

## Git Status

- **Branch:** feat/user-dashboard
- **Last Commit:** abc123 feat: add dashboard layout
- **Status:** 3 uncommitted changes

## Tech Stack

- **Language:** TypeScript
- **Framework:** Next.js, React
- **Testing:** Vitest, Testing Library
- **Database:** Prisma

## Directory Structure

my-app
├── src/
│   ├── components/
│   ├── pages/
│   ├── api/
│   └── utils/
├── prisma/
├── tests/
└── ...
```

## Usage

### For Subagent Context

```bash
# Generate optimized context for subagents
node .claude/scripts/codebase-context.js --for-subagent --output=context.md
```

This adds:
- Working conventions
- Pre-change checklist
- Pattern guidelines

### Focus on Specific Area

```bash
# Just the auth module
node .claude/scripts/codebase-context.js --focus=src/auth
```

### Include Coding Patterns

```bash
node .claude/scripts/codebase-context.js --include-patterns
```

Adds:
```markdown
## Coding Patterns

- **Component Structure:** folder-per-component
- **State Management:** Zustand
- **Data Fetching:** TanStack Query
- **Styling:** Tailwind CSS
```

### JSON Output

```bash
# For programmatic use
node .claude/scripts/codebase-context.js --format=json
```

### Adjust Tree Depth

```bash
# Shallow (quick overview)
node .claude/scripts/codebase-context.js --depth=2

# Deep (detailed structure)
node .claude/scripts/codebase-context.js --depth=5
```

## Integration with Subagent Workflows

### Dispatching Subagents

Before dispatching a subagent:

```bash
# Generate context file
node .claude/scripts/codebase-context.js --for-subagent --output=.claude/context.md
```

Then in subagent prompt:
```markdown
## Context

Read `.claude/context.md` for codebase overview before starting work.
```

### Parallel Execution

For parallel-execution skill:

```bash
# Generate once at session start
node .claude/scripts/codebase-context.js --for-subagent --output=.claude/context.md

# Each subagent reads the same context
```

### Per-Area Context

For focused subagent work:

```bash
# Auth-focused subagent
node .claude/scripts/codebase-context.js --focus=src/auth --output=auth-context.md

# API-focused subagent  
node .claude/scripts/codebase-context.js --focus=src/api --output=api-context.md
```

## What It Detects

### Tech Stack Detection

| Category | Detected From |
|----------|---------------|
| Language | tsconfig.json, file extensions |
| Framework | package.json dependencies |
| Testing | Jest, Vitest, Mocha, Playwright |
| Database | Prisma, Drizzle, Mongoose |
| Styling | Tailwind, Styled Components, Emotion |

### Patterns Detection

| Pattern | How Detected |
|---------|--------------|
| Component structure | src/components folder layout |
| State management | zustand, redux, jotai in deps |
| Data fetching | react-query, swr, trpc in deps |
| Styling approach | tailwind, styled-components in deps |

### Key Files Included

- README.md (first 50 lines)
- .env.example
- tsconfig.json
- CONTRIBUTING.md

## Options Reference

| Option | Description |
|--------|-------------|
| `--format=markdown\|json` | Output format (default: markdown) |
| `--output=FILE` | Write to file |
| `--depth=N` | Directory tree depth (default: 3) |
| `--include-deps` | Include dependency list |
| `--include-patterns` | Include pattern analysis |
| `--for-subagent` | Optimized for subagent context |
| `--focus=PATH` | Focus on specific directory |

## Example Output (Full)

```markdown
# Codebase Context

## Project Overview

**Name:** task-manager
**Description:** A collaborative task management app
**Version:** 2.1.0

## Git Status

- **Branch:** main
- **Last Commit:** def456 chore: update dependencies
- **Status:** clean

## Tech Stack

- **Language:** TypeScript
- **Framework:** Next.js, React
- **Testing:** Vitest, Playwright
- **Database:** Prisma (PostgreSQL)
- **Other:** Tailwind CSS, tRPC, Zod

## Directory Structure

task-manager
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   └── layouts/
│   ├── pages/
│   │   ├── api/
│   │   ├── dashboard/
│   │   └── auth/
│   ├── server/
│   │   ├── routers/
│   │   └── db/
│   ├── hooks/
│   ├── utils/
│   └── types/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/
│   ├── e2e/
│   └── unit/
└── ...

## Available Scripts

- `npm run dev`: next dev
- `npm run build`: next build
- `npm run test`: vitest run
- `npm run lint`: eslint . --ext .ts,.tsx

## Coding Patterns

- **Component Structure:** folder-per-component
- **State Management:** Zustand
- **Data Fetching:** tRPC
- **Styling:** Tailwind CSS

## Working in This Codebase

### Before Making Changes

1. Review existing patterns in the codebase
2. Run tests: `npm test`
3. Check linting: `npm run lint`

### Conventions to Follow

- Match existing code style and patterns
- Write tests for new functionality
- Keep commits focused and well-described

## Key Files

### README.md

[First 50 lines of README...]

### .env.example

[Environment variables template...]
```

## Tips

### Keep Context Fresh

Regenerate context when:
- Major refactoring completed
- New patterns established
- Dependencies significantly changed

### Size Considerations

For very large codebases:
```bash
# Shallow depth for overview
node .claude/scripts/codebase-context.js --depth=2

# Focus on relevant area
node .claude/scripts/codebase-context.js --focus=src/features/auth
```

### Combine with Other Skills

```markdown
## Subagent Dispatch

1. Generate context: `node .claude/scripts/codebase-context.js --for-subagent --output=context.md`
2. Run dependency-scout: Check for blockers
3. Dispatch with context file reference
```

