---
name: proactive-optimization
description: Use after completing features to identify and apply obvious improvements without being asked
---

# Proactive Optimization

## Overview

After getting something working, **look for obvious improvements**. Don't wait to be asked. A good developer doesn't just make it work—they make it right.

**Core principle:** Leave code better than you found it (within reason).

## When to Optimize

### ✅ Good Times to Optimize

- Just finished a feature and tests pass
- Notice something while working nearby
- Quick win that takes < 5 minutes
- Fixes something that would cause problems later

### ❌ Bad Times to Optimize

- In the middle of debugging something else
- Optimization would take > 15 minutes
- Not sure if it's actually better
- Would require changing lots of other code
- Purely aesthetic preference

## The Quick Scan

After completing a task, quickly scan for:

### 1. Obvious Code Issues

```
□ Duplicate code that could be extracted
□ Magic numbers that should be constants
□ Dead code that can be removed
□ Console.logs left behind
□ TODO comments you can resolve now
□ Obvious typos in names
```

### 2. Performance Quick Wins

```
□ N+1 queries (fetching in loops)
□ Missing loading states
□ Unnecessary re-renders (React)
□ Missing indexes (if you touched DB)
□ Large dependencies for small features
```

### 3. Error Handling Gaps

```
□ Missing try/catch on async operations
□ No error messages for users
□ Silent failures that should log
□ Missing input validation
```

### 4. Developer Experience

```
□ Missing TypeScript types
□ Unclear function names
□ Missing comments on complex logic
□ Inconsistent formatting
```

## The 5-Minute Rule

If an improvement takes **less than 5 minutes**:
→ Just do it. Don't ask.

If it takes **5-15 minutes**:
→ Do it, but note it in your progress log.

If it takes **more than 15 minutes**:
→ Add to backlog for later. Don't derail current work.

## Optimization Checklist

Quick pass after each task:

```markdown
## Post-Task Optimization Check

**Task completed:** [task name]

**Quick scan (2 min):**
- [ ] Any console.logs to remove?
- [ ] Any obvious duplication?
- [ ] Any magic numbers?
- [ ] Any missing error handling?
- [ ] Any dead code?

**Found & fixed:**
- [List quick fixes applied]

**Added to backlog:**
- [Larger items for later]
```

## Examples

### Example 1: Quick Win

```javascript
// Noticed while working on UserProfile:

// Before
const MAX_SIZE = 5242880; // What is this?

// After (< 1 min fix)
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
```

### Example 2: Extract Duplication

```javascript
// Noticed same pattern in 3 places:

// Before (in 3 files)
const user = await db.user.findUnique({ where: { id } });
if (!user) throw new NotFoundError('User not found');

// After (extracted, 5 min)
// utils/db.ts
async function findUserOrThrow(id: string) {
  const user = await db.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError('User not found');
  return user;
}
```

### Example 3: Add to Backlog (Too Big)

```markdown
## Added to Backlog

**Issue:** UserProfile component is 400 lines
**Improvement:** Should split into smaller components
**Estimated time:** 30-45 minutes
**Priority:** Low (works fine, just long)

→ Not doing now, but noted for future refactor sprint
```

## What NOT to Optimize

### Don't Touch:

- **Working code you didn't modify** - Leave it alone
- **Style preferences** - Not worth the churn
- **Premature optimization** - Wait for actual performance issues
- **Other people's patterns** - Unless clearly broken
- **Things you're not sure about** - If you might make it worse, don't

### The Rule:

> "If I introduced this code, I should clean it up.
> If someone else wrote it and it works, I should leave it alone."

## Logging Optimizations

In your progress/heartbeat log:

```markdown
### 14:45 - Task 3 Complete + Optimization

**Task:** User profile page
**Status:** ✅ Complete

**Optimizations applied:**
- Removed 3 console.logs
- Extracted duplicate validation into helper
- Added missing error boundary

**Time spent on optimizations:** 6 minutes

**Backlog items added:**
- Split UserProfile into smaller components (30 min estimate)
```

## Integration

Use after:
- **completion-checklist** passes
- Before moving to next task
- As part of **progress-heartbeat** update

Don't let optimization block progress. Quick wins only.

