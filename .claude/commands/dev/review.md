---
description: Run a code review on current changes or specified files
arguments:
  - name: target
    description: "Optional: file path, 'staged', 'branch', or leave empty for unstaged changes"
    required: false
---

Perform a thorough code review following the code-review skill.

**Determine what to review:**
- No args: Review unstaged changes (`git diff`)
- `staged`: Review staged changes (`git diff --cached`)
- `branch`: Review all changes on current branch vs main
- File path: Review that specific file

**Review checklist:**
1. **Correctness** - Does it work? Edge cases handled?
2. **Security** - Any vulnerabilities? Input validation?
3. **Performance** - Inefficiencies? N+1 queries?
4. **Readability** - Clear naming? Good structure?
5. **Testing** - Adequate coverage? Edge cases tested?

**Output format:**
```
## Code Review

### Summary
[1-2 sentence overview]

### Issues Found
- **[severity]** file:line - description

### Suggestions
- [optional improvements]

### Verdict
[APPROVE / REQUEST CHANGES / NEEDS DISCUSSION]
```
