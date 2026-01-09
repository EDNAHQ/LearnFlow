---
description: Scan all projects for code duplication and common patterns
arguments:
  - name: action
    description: "'scan' for full analysis, 'duplicates' for code duplication only, 'bugs' for common issues, or leave empty for summary"
    required: false
---

Cross-project analyzer - finds duplicated code, patterns, and bugs across all 15 projects.

**Steps:**
1. Scan all 15 projects for code patterns
2. Index functions, endpoints, schemas
3. Find 100% code duplications
4. Identify pattern duplications
5. Detect same bugs in multiple places
6. Generate prioritized report

**Usage:**
- `/pm:analyze` - Summary of duplications found
- `/pm:analyze scan` - Deep scan of all code
- `/pm:analyze duplicates` - Only code duplication
- `/pm:analyze bugs` - Find same issue in multiple projects

**Output:**
- Duplicated code locations
- Shared package candidates
- Common bug patterns
- Refactoring opportunities
- Estimated impact (time saved)
