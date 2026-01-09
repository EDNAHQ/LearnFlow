---
description: Get smart task routing across all projects
arguments:
  - name: filter
    description: "Optional: filter by project, priority, or type (e.g., 'help-genie', 'p1', 'quick-win')"
    required: false
---

Smart task router - tells you what to work on next for maximum impact.

**Steps:**
1. Scan all 15 projects for ideas, tasks, blocked work
2. Analyze dependencies and estimate effort
3. Calculate impact/effort velocity for each task
4. Rank by highest impact with fewest blockers
5. Show top 3 next tasks + critical path

**Usage:**
- `/pm:route` - Top opportunities right now
- `/pm:route quick-win` - High-impact, low-effort tasks
- `/pm:route help-genie` - Only Help Genie projects
- `/pm:route p1` - Only high-priority items

**Output:**
- Ranked list of top 3 next tasks
- Dependency analysis (what blocks what)
- Critical path to shipping features fastest
- Blocked work waiting on what
