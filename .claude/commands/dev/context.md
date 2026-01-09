---
description: Generate or refresh codebase context for planning and subagents
arguments:
  - name: action
    description: "Action: 'generate' (create full context), 'refresh' (update existing), 'for <subagent>' (context for specific agent), or leave empty to show current"
    required: false
---

Generate or refresh codebase context for better planning and subagent onboarding.

**Steps:**

1. **Generate fresh context:** `/dev:context generate`
   - Analyzes project structure
   - Documents skills, commands, scripts
   - Extracts key patterns and architecture
   - Saves to `.claude/context.md`

2. **Refresh existing context:** `/dev:context refresh`
   - Updates existing context
   - Checks for new files/changes
   - Refreshes timestamps

3. **Show current context:** `/dev:context` (no action)
   - Displays active context snapshot
   - Shows last updated time

4. **Context for subagent:** `/dev:context for <agent-type>`
   - Generates minimal context for specific agent
   - Includes only relevant info for that agent type
   - Example: `/dev:context for react-feature-builder`

**When to use:**
- Before starting `/dev:plan`
- When onboarding new subagents
- After major architectural changes
- Before complex feature work

**Notes:**
- Context is cached to reduce token usage
- Refresh when major changes occur
- Subagents automatically inherit context
