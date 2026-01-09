---
name: idea-capture
description: Use when user says /idea or wants to quickly capture an idea, thought, or task
---

# Idea Capture

Quick-capture ideas, tasks, and thoughts to your personal command center.

## Overview

Instantly save ideas with optional priority and project tags. Ideas are stored in `.claude/pm/ideas.md` for later processing.

## When to Use

- User says `/idea` followed by text
- User wants to "jot down" or "remember" something
- Quick brain dump without organizing

## Syntax

```
/idea <text>                    # Basic capture
/idea p0 <text>                 # With priority (p0=critical, p1=high, p2=normal, p3=low)
/idea @project-name <text>      # Tagged to a project
/idea p1 @myapp Fix login bug   # Combined
```

## Implementation

When the user invokes this skill:

### Step 1: Parse the input

Extract from the user's message:
- **Priority**: Look for `p0`, `p1`, `p2`, or `p3` at the start (default: `p2`)
- **Project**: Look for `@project-name` pattern (optional)
- **Title**: Everything else is the idea title

### Step 2: Determine the target file

Check context:
1. If user specified `@project-name`, use `.claude/pm/projects/<project-name>.md`
2. If current directory has `.claude/pm/tasks.md`, offer to add there (project-local)
3. Otherwise, use the central hub at `<superpowers-path>/.claude/pm/ideas.md`

### Step 3: Add the item

Use the pm-utils.js script:

```bash
node .claude/scripts/pm-utils.js add "<target-file>" '{"title": "<title>", "priority": "<priority>", "project": "<project>"}'
```

Or manually append to the file:

```markdown
## [<next-id>] <title>
**Status:** backlog
**Priority:** <priority>
**Project:** <project>  # if specified
**Created:** <today>
**Updated:** <today>

### Updates
- <today>: Created
```

### Step 4: Confirm capture

Respond with:
```
Captured idea #<id>: "<title>"
Priority: <priority> | Location: <file>
```

## Examples

**Input:** `/idea Build a webhook notification system`
**Output:**
```
Captured idea #7: "Build a webhook notification system"
Priority: p2 | Location: .claude/pm/ideas.md
```

**Input:** `/idea p1 @superpowers Add dark mode toggle`
**Output:**
```
Captured idea #8: "Add dark mode toggle"
Priority: p1 | Project: superpowers | Location: .claude/pm/projects/superpowers.md
```

## File Format Reference

Ideas are stored as markdown with this structure:

```markdown
# Ideas

Central idea backlog for quick capture.

## [1] First idea title
**Status:** backlog
**Priority:** p2
**Created:** 2025-01-15
**Updated:** 2025-01-15

### Updates
- 2025-01-15: Created

## [2] Second idea title
**Status:** doing
**Priority:** p1
**Tags:** feature, urgent
**Created:** 2025-01-14
**Updated:** 2025-01-15

Started working on the implementation.

### Updates
- 2025-01-15: Status → doing
- 2025-01-14: Created
```

## Tips

- Ideas default to `backlog` status - use `/tasks` or `/board` to move them
- Use priorities sparingly: most ideas should be p2 (normal)
- The `@project` tag creates/appends to a project-specific file
- Ideas are timestamped automatically
