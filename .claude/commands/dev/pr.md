---
description: Manage GitHub pull requests for EDNAHQ/Command-Center
arguments:
  - name: action
    description: "Action: 'create' (create new PR), 'list' (show open PRs), 'status' (check current), or PR number to view details"
    required: false
---

Manage GitHub pull requests for EDNAHQ/Command-Center repository.

**Steps:**

1. **Create PR:** `/dev:pr create`
   - Checks current branch and upstream changes
   - Generates PR title from recent commits
   - Creates PR against main
   - Opens in browser

2. **List open PRs:** `/dev:pr list`
   - Shows all open PRs
   - Displays author, status, review count
   - Shows mergeable status

3. **Check PR status:** `/dev:pr status` or `/dev:pr <number>`
   - Shows PR details, reviews, checks
   - Indicates if ready to merge
   - Lists pending changes

**Workflow:**
```
/dev:plan → code → /dev:commit → /dev:pr create → review → merge
```

**Notes:**
- Requires GitHub CLI (`gh`) installed and authenticated
- PRs are always against `main` branch
- Repository: https://github.com/EDNAHQ/Command-Center
