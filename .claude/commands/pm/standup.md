---
description: Generate a daily standup summary
arguments:
  - name: days
    description: "Number of days to look back (default: 1)"
    required: false
---

Generate a standup report following the standup-generator skill.

**Gather information:**
1. Git log for recent commits: `git log --oneline --since="<days> days ago" --author="$(git config user.name)"`
2. Check `.claude/pm/ideas.md` for items marked "doing" or recently "done"
3. Look for any "blocked" items

**Generate standup:**
```
## Standup - <date>

### Yesterday (Done)
- [completed items from git + board]

### Today (Planned)
- [items marked "doing" on board]
- [inferred from context]

### Blockers
- [any blocked items with reasons]
- (none) if clear

### Notes
- [optional: anything noteworthy]
```

Keep it concise - this should be quick to read in a meeting.
