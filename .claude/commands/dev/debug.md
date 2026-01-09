---
description: Start a systematic debugging session
arguments:
  - name: problem
    description: Description of the bug or issue
    required: true
---

Run systematic debugging following the debugging skill.

**Phase 1: Understand**
- What is the expected behavior?
- What is the actual behavior?
- When did it start? What changed?
- Can you reproduce it consistently?

**Phase 2: Isolate**
- Find the minimal reproduction case
- Identify which component/layer is failing
- Add strategic logging/breakpoints
- Binary search through code if needed

**Phase 3: Root Cause**
- Don't just fix symptoms
- Ask "why?" 5 times
- Check for similar issues elsewhere
- Understand the full chain of causation

**Phase 4: Fix & Verify**
- Make the minimal fix
- Add a test that would have caught this
- Check for regressions
- Document what you learned

**Output format:**
```
## Debug Session: <problem>

### Symptoms
- [observed behavior]

### Root Cause
[explanation of why this happened]

### Fix
[what was changed and why]

### Prevention
- [test added]
- [process improvement]
```
