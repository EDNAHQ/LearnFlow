---
name: capture-to-backlog
description: Use when you have an idea for any project but don't want to lose focus on current work
---

# Capture to Backlog

## Overview

Quickly capture ideas, bugs, or tasks for any project without context-switching.

**Core principle:** Capture immediately, organize later, never lose focus.

## When to Use

- You think of something for a different project
- User mentions a bug or feature idea
- You notice something that should be fixed later
- Any "oh, I should remember to..." moment

## The Pattern

1. **Identify** which project it's for
2. **Capture** to that project's backlog
3. **Confirm** briefly
4. **Continue** with current work

**Total interruption: ~5 seconds**

## Capture Format

Add to the appropriate project's `.claude/backlog.md`:

```markdown
## Priority: [High/Medium/Low]
- [ ] [Brief description] (captured [date])
  - Context: [any relevant details]
```

## Examples

### Quick Bug

```
User: "Oh, the login on app-3 is broken on mobile"

→ Add to app-3 backlog:
  ## Priority: High
  - [ ] Login broken on mobile (captured 2025-12-21)

→ Respond: "Captured to app-3 backlog as high priority. Continuing..."
```

### Feature Idea

```
User: "We should add dark mode to app-1 someday"

→ Add to app-1 backlog:
  ## Priority: Low / Ideas
  - [ ] Add dark mode (captured 2025-12-21)

→ Respond: "Added to app-1 ideas. Continuing..."
```

### With Context

```
User: "The API rate limiting on app-4 needs work - 
       we got throttled by Stripe last week"

→ Add to app-4 backlog:
  ## Priority: High
  - [ ] Improve API rate limiting (captured 2025-12-21)
    - Context: Got throttled by Stripe, need backoff strategy

→ Respond: "Captured to app-4 with context. Continuing..."
```

## If Project Doesn't Have Backlog

```
Project app-6 doesn't have a backlog yet.
Creating .claude/backlog.md and adding your item.
```

Create the file with standard structure:

```markdown
# App-6 Backlog

## Priority: High

## Priority: Medium

## Priority: Low / Ideas
- [ ] [the captured item] (captured [date])

## Done (recent)
```

## Quick Syntax

For rapid capture, accept shorthand:

| Input | Interpretation |
|-------|----------------|
| "app-3: fix mobile login" | High priority (bug implied) |
| "app-1: add dark mode, low" | Low priority |
| "idea for app-2: notifications" | Ideas section |
| "bug in app-4: rate limiting" | High priority |

## Don't Do

- ❌ Switch to the other project
- ❌ Start investigating the issue
- ❌ Ask clarifying questions (capture what you know)
- ❌ Try to prioritize extensively

Just capture and continue. Prioritization happens during planning sessions.

## Batch Capture

If user dumps multiple items:

```
User: "app-1 needs dark mode, app-2 has a payment bug, 
       and I want to add search to app-3"

→ Capture all three to respective backlogs
→ Respond: "Captured 3 items:
   - app-1: dark mode (ideas)
   - app-2: payment bug (high)
   - app-3: add search (medium)
   Continuing with current work..."
```

