---
name: standup-generator
description: Use to auto-generate daily or weekly summaries of progress across all projects
---

# Standup Generator

## Overview

Automatically generate summaries of what happened, what's next, and what's blocked. Useful for tracking, reporting, or just knowing where things stand.

**Core principle:** Never lose track of what you've accomplished.

## Daily Standup

```
"Generate daily standup"
```

Produces:

```markdown
# Daily Standup - 2025-12-22

## Yesterday (2025-12-21)

### Completed
- **app-2:** Fixed payment webhook signature validation
- **app-5:** Finished onboarding flow (all 5 screens)
- **app-1:** Added user profile API tests (85% coverage)

### In Progress
- **app-1:** User profile page (70% complete)

### Blocked
- **app-3:** Waiting on Stripe API key from client

---

## Today's Plan

### Priority Focus
1. **app-1:** Complete user profile page (~2 hours)
2. **app-3:** Resume Stripe integration (if key received)

### If Time Permits
- **app-4:** Update dependencies (security patches)
- **app-6:** Review and merge pending PR

---

## Blockers

| Project | Blocker | Waiting On | Days Blocked |
|---------|---------|------------|--------------|
| app-3 | Stripe API key | Client (John) | 3 days |

---

## Metrics

- **Tasks completed yesterday:** 3
- **Projects touched:** 3
- **Commits made:** 5
- **Time logged:** ~4.5 hours
```

## Weekly Summary

```
"Generate weekly summary"
```

Produces:

```markdown
# Weekly Summary - Week of 2025-12-16

## Accomplishments

### app-1: User System
- ✅ User registration API
- ✅ User login/logout
- ✅ Profile page (90% - finishing tomorrow)
- 📊 12 commits, 45 tests added

### app-2: Payments
- ✅ Fixed webhook validation issue
- ✅ Added retry logic for failed payments
- 📊 5 commits, 8 tests added

### app-5: Onboarding
- ✅ Completed entire onboarding flow
- ✅ 5 screens implemented
- ✅ Ready for launch
- 📊 8 commits, 15 tests added

### Other
- app-4: Dependency updates
- app-6: Code review for team PR

---

## This Week's Stats

| Metric | Count |
|--------|-------|
| Tasks completed | 12 |
| Commits made | 28 |
| Tests added | 68 |
| Projects touched | 5/8 |
| Hours worked | ~22 |

---

## Blockers Resolved
- app-2: Payment race condition (fixed Tuesday)
- app-5: Design clarification (resolved Monday)

## Still Blocked
- app-3: Stripe API key (5 days, escalate?)

---

## Next Week's Focus

### Must Complete
- [ ] app-1: Finish profile page
- [ ] app-3: Stripe integration (if unblocked)

### Should Do
- [ ] app-7: Start new feature work
- [ ] app-4: Address security vulnerabilities

### Stretch Goals
- [ ] app-1: Add profile image upload
- [ ] Refactor shared authentication code

---

## Notes
- app-5 is ready for client review
- Consider archiving app-8 (no activity in 2 months)
```

## Data Sources

The standup generator pulls from:

### 1. Progress Files
```
project/.claude/progress.md
project/.claude/heartbeat.md
```

### 2. Git History
```bash
git log --since="yesterday" --oneline
git log --since="1 week ago" --oneline
```

### 3. Backlog Status
```
project/.claude/backlog.md
```

### 4. Queue Results
```
.claude/queue.md
```

## Standup Templates

### For Solo Use (Personal Tracking)

```markdown
# Standup - [date]

## Done
- [list]

## Doing
- [list]

## Blocked
- [list]
```

### For Team/Client Reporting

```markdown
# Progress Report - [date]

## Summary
[One paragraph executive summary]

## Completed This Period
[Detailed list with context]

## In Progress
[Current work and expected completion]

## Upcoming
[What's planned next]

## Blockers & Risks
[Issues that need attention]

## Metrics
[Relevant stats]
```

### For Async Standups (Slack/Discord)

```
📅 *Standup - Dec 22*

✅ *Yesterday:*
• Fixed payment webhook (app-2)
• Finished onboarding flow (app-5)

🔄 *Today:*
• Complete profile page (app-1)
• Start search feature (app-3)

🚫 *Blocked:*
• app-3 Stripe key (waiting on John)
```

## Auto-Generation Triggers

Configure when standups are generated:

```markdown
# .claude/standup-config.md

## Schedule
- Daily: Generate at session start if last standup > 20 hours ago
- Weekly: Generate on Monday mornings

## Include
- Git commits from period
- Progress file updates
- Completed queue items
- Blocker changes

## Format
- Default: Markdown
- Slack: Use emoji formatting

## Notify
- Save to: .claude/standups/[date].md
- Copy to clipboard: yes
```

## Historical Standups

Store generated standups for reference:

```
.claude/standups/
├── 2025-12-22.md
├── 2025-12-21.md
├── 2025-12-20.md
├── week-2025-12-16.md
└── week-2025-12-09.md
```

## Querying History

```
"What did I work on last Tuesday?"
→ Reads standup from that date

"Show me app-2 progress this month"
→ Filters standups for app-2 mentions

"When did I finish the payment feature?"
→ Searches for completion mention
```

## Integration

Use with:
- **progress-heartbeat**: Primary data source for what happened
- **multi-project-dashboard**: Feeds into dashboard view
- **smart-prioritization**: Uses blockers and in-progress for priority
- **delegation-queue**: Completed queue items appear in standup

## Customization

### Adding Custom Sections

```markdown
## Time Tracking
[If you track time, add summary here]

## Learnings
[What you learned this week]

## Wins
[Celebrate accomplishments]
```

### Project-Specific Notes

```markdown
## app-1 Notes
- Client demo scheduled Friday
- Need to prepare test environment

## app-5 Notes  
- Ready for launch pending final review
- Marketing wants screenshots
```

## Quick Commands

| Command | Result |
|---------|--------|
| "standup" | Daily standup for today |
| "weekly" | Weekly summary |
| "what did I do yesterday" | Yesterday's completed items |
| "standup for app-2" | Project-specific standup |
| "blockers" | Just show current blockers |

