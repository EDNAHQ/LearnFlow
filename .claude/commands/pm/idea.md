---
description: Quick capture an idea to your command center
arguments:
  - name: text
    description: The idea to capture (optional: prefix with p0-p3 for priority, @project for tagging)
    required: true
---

# Quick Idea Capture

Capture ideas to the current project or route to a specific project.

## Parse Input

- **Priority**: p0/p1/p2/p3 at the start (default: p2)
- **Project**: @project-name routes to that project's backlog
- **Title**: Everything else

## Examples

```
/idea Add dark mode toggle
→ Captures to current project with p2 priority

/idea p1 Fix payment bug
→ Captures to current project with p1 priority

/idea @app-2 Add user avatars
→ Routes to app-2 project's backlog

/idea p0 @api-service Rate limiting is broken
→ Routes to api-service with p0 priority
```

## Behavior

### If @project specified:

1. Look up project path from `~/.claude/projects.json`
2. Write to `<project-path>/.claude/pm/ideas.md`
3. Confirm with project name in response

### If no @project:

1. Write to current project's `.claude/pm/ideas.md`

## File Format

Add to `.claude/pm/ideas.md`:

```markdown
## [<next-id>] <title>
**Status:** backlog
**Priority:** <priority>
**Created:** <today>
**Updated:** <today>

### Updates
- <today>: Created
```

## Response

```
Captured #<id>: "<title>" (priority: <priority>)
→ <project-name>/.claude/pm/ideas.md
```

Or if routed:
```
Captured #<id>: "<title>" (priority: <priority>)
→ Routed to @<project-name>
```
