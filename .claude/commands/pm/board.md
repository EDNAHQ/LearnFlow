---
description: Show your kanban board or move items between columns
arguments:
  - name: action
    description: "Optional: 'move <id> <status>' or 'archive' or leave empty to view"
    required: false
---

Show or manage the kanban board from `.claude/pm/ideas.md`.

**If no action (just `/board`):**
Read the ideas file and render items grouped by status:

```
## BACKLOG (n)
  [1] Item title
  [2] Another item

## DOING (n)
  [3] !High priority item (p1)

## BLOCKED (n)
  [4] Blocked item
      → reason here

## DONE (n)
  [5] ✓ Completed item
```

Priority indicators: !!! (p0), !! (p1), ! (p2), none (p3)

**If `/board move <id> <status>`:**
Update the item's status (backlog/doing/blocked/done) and show confirmation.

**If `/board archive`:**
Move all "done" items to "archived" status and confirm count.
