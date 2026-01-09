---
name: smart-prioritization
description: Use when deciding what to work on to focus on highest-impact tasks across all projects
---

# Smart Prioritization

## Overview

When you sit down to work, immediately know what's most valuable to focus on. No decision fatigue. No working on the wrong thing.

**Core principle:** Always work on what matters most right now.

## Daily Prioritization

At the start of any session, analyze all projects and recommend focus:

```
"What should I work on today?"

→ Scans all project backlogs
→ Checks progress files for in-flight work
→ Considers urgency, impact, effort
→ Recommends prioritized list
```

## The Prioritization Framework

### Priority Factors

| Factor | Weight | Questions |
|--------|--------|-----------|
| **Urgency** | High | Is something broken? Deadline approaching? Users affected? |
| **Impact** | High | How many users/$ affected? Blocking other work? |
| **Effort** | Medium | Quick win vs. major project? |
| **Momentum** | Medium | Is something 90% done? Stale for too long? |
| **Dependencies** | Low | Blocking someone else? Being blocked? |

### Priority Tiers

```
🔴 P0 - DO NOW
   - Production is broken
   - Users are affected
   - Revenue impact
   - Security issue

🟠 P1 - DO TODAY  
   - Important feature deadline
   - Bug affecting some users
   - Blocking other work
   - Client waiting

🟡 P2 - DO THIS WEEK
   - Planned feature work
   - Non-critical bugs
   - Technical debt
   - Improvements

🟢 P3 - DO EVENTUALLY
   - Nice to have
   - Ideas to explore
   - Minor polish
   - Someday/maybe
```

## Priority Report Format

```markdown
# Daily Priority Report

**Date:** 2025-12-21
**Available time:** ~4 hours

---

## 🔴 Immediate (do first)

### app-2: Payment webhook failing
- **Impact:** Orders not processing, revenue affected
- **Effort:** ~1 hour (known issue pattern)
- **Action:** Fix webhook signature validation

---

## 🟠 High Priority (do today if possible)

### app-5: Complete onboarding flow
- **Status:** 90% done (just needs final screen)
- **Impact:** Feature ready for launch
- **Effort:** ~30 min
- **Recommendation:** Quick win, finish it

### app-1: User profile page
- **Status:** In progress from yesterday
- **Impact:** Needed for next release
- **Effort:** ~2 hours remaining
- **Recommendation:** Continue momentum

---

## 🟡 Medium Priority (this week)

### app-3: Add search feature
- **Impact:** User-requested, improves UX
- **Effort:** ~4 hours
- **Recommendation:** Start if time permits

### app-4: Update dependencies
- **Impact:** Security patches pending
- **Effort:** ~1 hour
- **Recommendation:** Maintenance task

---

## 📋 Summary

**Recommended focus order:**
1. app-2: Payment webhook (🔴 P0 - broken)
2. app-5: Finish onboarding (🟠 quick win)
3. app-1: Continue profile page (🟠 momentum)
4. app-3: Start search if time (🟡)

**Total estimated:** 4.5 hours
**Suggested scope:** Items 1-3 today

---

## 🚫 Blocked / Waiting

- app-6: Waiting on client for API keys
- app-3: Design mockups pending
```

## Prioritization Signals

### Urgency Signals

| Signal | Priority Bump |
|--------|---------------|
| Production error | 🔴 P0 |
| User-reported bug | 🟠 P1 |
| Deadline this week | 🟠 P1 |
| Deadline this month | 🟡 P2 |
| No deadline | 🟢 P3 |

### Impact Signals

| Signal | Priority Bump |
|--------|---------------|
| Affects all users | +2 |
| Affects paying users | +2 |
| Revenue impact | +2 |
| Blocks team members | +1 |
| Improves DX only | +0 |

### Effort Signals (for tiebreaking)

| Signal | Recommendation |
|--------|----------------|
| < 30 min | Do immediately (quick win) |
| 30 min - 2 hours | Good work session |
| 2 - 4 hours | Needs dedicated block |
| > 4 hours | Needs decomposition first |

### Momentum Signals

| Signal | Recommendation |
|--------|----------------|
| 90% done | Finish it (closure) |
| Just started | Continue (context fresh) |
| Stale 7+ days | Revisit or descope |
| Stale 30+ days | Evaluate if still needed |

## Quick Prioritization

For faster decisions:

```
"Quick priority check"

→ app-2: 🔴 Payment broken - FIX NOW
→ app-5: 🟠 Almost done - Quick win
→ app-1: 🟠 In progress - Continue
→ Others: Can wait
```

## Context Switching Guidance

### When to Switch Projects

✅ Switch when:
- Current task is done
- Blocked and can't unblock yourself
- Higher priority item emerges
- Natural break point

❌ Don't switch when:
- Mid-task (finish first)
- Avoiding difficulty (push through)
- Just bored (discipline)

### Batching Recommendations

```
"How should I batch today's work?"

→ Morning (high focus): app-2 payment fix, app-1 profile page
→ Afternoon (lower focus): app-4 dependency updates, code review
→ End of day: Quick wins, documentation
```

## Weekly Planning

At week start:

```
"Plan my week across projects"

Monday:
- app-2: Payment fix (urgent)
- app-1: Profile page

Tuesday:
- app-1: Complete profile
- app-5: Onboarding flow

Wednesday:
- app-3: Start search feature
- app-4: Dependency updates

Thursday:
- app-3: Continue search
- Buffer for unexpected

Friday:
- Finish in-progress items
- Code review
- Planning for next week
```

## Integration with Backlog

Each project's backlog should have priority tags:

```markdown
# app-1 Backlog

## 🔴 P0 - Critical

## 🟠 P1 - High
- [ ] Complete profile page (in progress)
- [ ] Fix login timeout issue

## 🟡 P2 - Medium  
- [ ] Add avatar upload
- [ ] Improve loading states

## 🟢 P3 - Low / Ideas
- [ ] Dark mode
- [ ] Animations
```

Prioritization skill reads these and compares across projects.

## Automatic Priority Updates

Priorities can change automatically:

| Event | Priority Change |
|-------|-----------------|
| Bug reported in production | → 🔴 P0 |
| Deadline < 3 days | → 🟠 P1 |
| Stale > 14 days | Flag for review |
| Dependencies resolved | Unblock, bump priority |

## Integration

Use with:
- **multi-project-dashboard**: See priorities visually
- **project-status**: Priority context when opening project
- **capture-to-backlog**: Assign priority when capturing

Start every session with: "What should I focus on?"

