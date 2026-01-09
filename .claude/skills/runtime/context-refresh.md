---
name: context-refresh
description: Use when context becomes polluted, confused, or too long—spawn fresh subagent with clean handoff
---

# Context Refresh

## Overview

Long sessions accumulate context pollution: old errors, abandoned approaches, tangential discussions. When you feel confused or "heavy," **spawn a fresh subagent** with only the essential context.

**Core principle:** A clean slate with good notes beats a cluttered mind.

## When to Refresh

### Warning Signs

- [ ] You're referencing things from 30+ minutes ago
- [ ] You've tried multiple failed approaches (context has all of them)
- [ ] You're unsure what the current state actually is
- [ ] You keep making the same mistake repeatedly
- [ ] The conversation has gone in circles
- [ ] You feel "foggy" about what you're doing

### Automatic Triggers

Consider refresh after:
- 5+ error recovery attempts
- 3+ major context switches
- 60+ minutes of continuous work
- Completing a major milestone (before starting next)

## The Refresh Process

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  CURRENT CLAUDE (polluted context)                          │
│       ↓                                                     │
│  Write clean handoff document                               │
│       ↓                                                     │
│  Spawn fresh subagent with ONLY:                            │
│    - Current task                                           │
│    - Relevant file paths                                    │
│    - Key decisions made                                     │
│    - Current blockers (if any)                              │
│       ↓                                                     │
│  FRESH SUBAGENT (clean context)                             │
│       ↓                                                     │
│  Continues work with clarity                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Handoff Document Template

Before spawning, write `.claude/handoff.md`:

```markdown
# Context Handoff

**Created:** [timestamp]
**Reason:** [Context pollution / Major milestone / etc.]

## Current Task

[Exact task being worked on, from plan]

## Current State

**What's done:**
- [Completed item 1]
- [Completed item 2]

**What's in progress:**
- [Current work]

**What's left:**
- [Remaining item 1]
- [Remaining item 2]

## Key Files

- `src/components/UserProfile.tsx` - Main component being built
- `src/api/users.ts` - API layer (complete)
- `src/tests/user.test.ts` - Tests (3 passing, 2 TODO)

## Decisions Made

- Using React Query for data fetching (matches rest of app)
- Assumed 5MB max for avatar uploads
- Using existing Avatar component from design system

## Known Issues

- Image upload CORS issue - workaround in place, proper fix TODO
- TypeScript error on line 45 - need to add proper types

## What NOT to Revisit

- Don't re-explore authentication approach (already decided, implemented)
- Don't refactor the form (works, just needs validation added)

## Next Steps

1. Add form validation
2. Write remaining tests
3. Visual verification
```

## Spawning Fresh Subagent

Use this prompt template:

```
Task: Continue work on [task name]

Read the handoff document at .claude/handoff.md for full context.

Key points:
- [Most critical thing 1]
- [Most critical thing 2]

Start by reading the handoff, then continue from where it left off.
Report when task is complete or if you need clarification.
```

## What to Include in Handoff

### ✅ Include:

| Category | Examples |
|----------|----------|
| Current task | What specifically to work on |
| File locations | Where the relevant code is |
| Decisions made | So they're not re-debated |
| Completed work | What's done |
| Known issues | Problems already identified |
| Next concrete step | What to do first |

### ❌ Don't Include:

| Category | Why Not |
|----------|---------|
| Failed approaches | They'll try fresh approaches |
| Long error logs | Just summarize the issue |
| Tangential discussions | Not relevant |
| Full file contents | They can read files |
| Conversation history | Just the outcomes |

## Mini-Refresh (Same Session)

Sometimes you don't need a full subagent—just a mental reset:

```markdown
## Quick Refresh

Let me step back and clarify:

**What I'm doing:** Building user profile form
**Current file:** src/components/UserProfile.tsx
**Current problem:** Form validation not triggering
**What I've tried:** onChange handler, onBlur, useEffect
**Fresh approach:** Let me read how other forms in this codebase do it...
```

This clears your own context without spawning.

## Refresh Frequency Guidelines

| Work Type | Refresh After |
|-----------|---------------|
| Bug hunting | 30 min or 5 failed attempts |
| Feature building | Each major component |
| Refactoring | Each file or module |
| Debugging spiral | Immediately when noticed |

## Integration with Other Skills

- **progress-heartbeat**: Note refreshes in the heartbeat log
- **error-recovery-loop**: If 5 attempts fail, consider refresh
- **autonomous-resilience**: Refresh is a form of "don't stay stuck"
- **subagent-driven-development**: Each subagent is already a refresh

## Example Handoff

```markdown
# Context Handoff

**Created:** 2025-12-21 15:30
**Reason:** Spent 25 min debugging form—context cluttered with failed attempts

## Current Task

Task 3: User Profile Page - Add form validation

## Current State

**What's done:**
- Profile component structure
- API integration
- Avatar upload

**What's in progress:**
- Form validation (stuck)

**What's left:**
- Validation
- Error display
- Tests

## Key Files

- `src/components/UserProfile.tsx` (line 45-80 is the form)
- `src/lib/validation.ts` (project's validation utils)

## Decisions Made

- Using Zod for schema (matches rest of app)
- Email and name are required, bio is optional

## Known Issues

- Validation runs but errors don't display
- Suspect issue is in how form state updates

## What NOT to Revisit

- Don't change to different validation library
- Form structure is correct, just need validation wired up

## Next Steps

1. Look at how ProfileSettings.tsx does validation (it works)
2. Apply same pattern here
3. Add error display components
```

Fresh subagent reads this → immediately productive → no time wasted re-exploring.

