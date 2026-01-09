---
description: Run pre-completion verification checklist
arguments:
  - name: scope
    description: "What to verify: 'commit', 'pr', 'release', or leave empty for general"
    required: false
---

Run verification checklist following the verification skill.

**General checklist:**
- [ ] Code compiles/builds without errors
- [ ] All tests pass
- [ ] No linting errors
- [ ] Changes match requirements
- [ ] No debug code left behind (console.log, TODO, etc.)
- [ ] No sensitive data exposed

**For commits:**
- [ ] Commit message is clear
- [ ] Only relevant files included
- [ ] No unintended changes

**For PRs:**
- [ ] Branch is up to date with main
- [ ] PR description is complete
- [ ] Reviewers assigned
- [ ] CI checks pass

**For releases:**
- [ ] Version bumped appropriately
- [ ] Changelog updated
- [ ] All PRs merged
- [ ] Smoke tests pass
- [ ] Rollback plan ready

**Output:**
```
## Verification: <scope>

### Passed
- [x] Check that passed

### Failed
- [ ] Check that failed - details

### Warnings
- [!] Something to be aware of

### Verdict
[READY / NOT READY - reasons]
```
