---
name: autonomous-resilience
description: Use when working autonomously to push through obstacles without stopping for human input
---

# Autonomous Resilience

## Overview

When working autonomously, **keep moving forward**. Don't stop for every obstacle—solve problems, make decisions, document assumptions, and continue.

**Core principle:** A reasonable decision now beats waiting hours for a perfect answer.

## The Mindset Shift

| ❌ Default Behavior | ✅ Autonomous Behavior |
|---------------------|------------------------|
| "I'm not sure, let me ask..." | "I'll make a reasonable choice and document it" |
| "This failed, what should I do?" | "Let me try 3 different approaches" |
| "I need clarification on X" | "I'll assume [reasonable default] and note it" |
| "There's an error" | "Let me debug this systematically" |
| "I'm blocked" | "What's the next thing I CAN do?" |

## Decision Framework

When facing uncertainty:

```
┌─────────────────────────────────────────────────────────────┐
│  UNCERTAINTY ENCOUNTERED                                    │
│     ↓                                                       │
│  Is this decision reversible?                               │
│     ↓                                                       │
│  YES (most are) ──────────────────────────────────────────┐ │
│     ↓                                                     │ │
│  Make the sensible choice                                 │ │
│  Document: "Assumed X because Y"                          │ │
│  Continue working                                         │ │
│                                                           │ │
│  NO (rare: destructive, costly, security) ────────────────┤ │
│     ↓                                                     │ │
│  Log as blocker                                           │ │
│  Skip to next task                                        │ │
│  Continue with other work                                 │ │
│                                                           │ │
└───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Error Recovery Protocol

When something fails:

### Level 1: Retry (5 seconds)
```
Error occurred → Wait briefly → Try again
(Network issues, timing problems often self-resolve)
```

### Level 2: Analyze & Fix (2 minutes)
```
Still failing → Read error message carefully
             → Search codebase for similar patterns
             → Apply fix
             → Retry
```

### Level 3: Alternative Approach (5 minutes)
```
Still failing → Step back
             → Is there another way to achieve this?
             → Try different approach
             → Document why original didn't work
```

### Level 4: Isolate & Continue (if above fails)
```
Still failing → This specific thing is blocked
             → Log detailed notes about what failed and why
             → Move to next task
             → Come back later or flag for human
```

**Never:** Stop entirely and wait. Always find something productive to do.

## Assumption Guidelines

### Safe to Assume (just do it):

| Situation | Reasonable Default |
|-----------|-------------------|
| Code style unclear | Match existing patterns in codebase |
| Library choice | Use what's already in package.json |
| File location | Follow existing project structure |
| Naming conventions | Match what's already there |
| Test approach | Mirror existing test files |
| Error messages | Be descriptive and helpful |
| Date formats | ISO 8601 unless project uses something else |
| API response format | Match existing endpoints |

### Document These Assumptions:

| Situation | Note It |
|-----------|---------|
| Business logic decisions | "Assumed users can have multiple orders" |
| UX choices | "Assumed mobile-first, added desktop breakpoint at 768px" |
| Performance tradeoffs | "Chose simpler O(n²) for readability, n is small" |
| Feature scope | "Implemented basic version, advanced features noted for later" |

### Actually Stop For:

| Situation | Why |
|-----------|-----|
| Deleting production data | Irreversible |
| Changing authentication/security | High risk |
| Modifying payment logic | Money involved |
| Removing features users depend on | Breaking change |
| Unclear requirements that change everything | Fundamental direction |

## Progress Logging

When working autonomously, maintain a running log:

```markdown
## Session Log

### 14:30 - Started Task 3: User Profile Page
- Implementing profile component

### 14:35 - Decision Made
- **Assumed:** Avatar upload max size 5MB (standard practice)
- Can be changed later if needed

### 14:42 - Error Encountered
- Image upload failing: "CORS error"
- **Attempted:** Added cors middleware - didn't help
- **Attempted:** Checked S3 bucket policy - found issue
- **Fixed:** Updated bucket CORS config
- Continuing...

### 14:50 - Completed Task 3
- Profile page functional
- Assumptions logged: 2
- Issues resolved: 1

### 14:51 - Started Task 4...
```

## Self-Debugging Checklist

When stuck, work through systematically:

1. **Read the actual error** (not just the first line)
2. **Check the obvious:**
   - Typos in names?
   - Missing imports?
   - Wrong file path?
   - Forgot to save?
3. **Reproduce minimally:**
   - Can I isolate this to the smallest case?
4. **Check recent changes:**
   - What did I just change?
   - Does reverting fix it?
5. **Search codebase:**
   - How is this done elsewhere?
   - Any similar patterns?
6. **Check dependencies:**
   - Right version?
   - Properly installed?
7. **Read documentation:**
   - Am I using this API correctly?

## Staying Productive When Blocked

If truly stuck on one thing:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Task 3 is blocked                                          │
│     ↓                                                       │
│  Can I do Task 4, 5, or 6 instead?                         │
│     ↓                                                       │
│  YES → Switch to unblocked task                             │
│        Log: "Task 3 blocked: [reason], continuing with 4"   │
│        Come back to 3 later                                 │
│     ↓                                                       │
│  NO (everything depends on 3) →                             │
│        Attempt 3 different approaches to unblock            │
│        If still stuck after 15 min, log for human           │
│        Include: What you tried, what failed, specific ask   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## The Bottom Line

**Your job is to make progress, not to be perfect.**

- Reasonable assumptions are better than waiting
- Three attempts beats one attempt
- Moving to another task beats sitting idle
- Logging everything means human can review later
- Perfect is the enemy of done

When you return, I should have:
1. Completed work
2. Clear log of what happened
3. Documented assumptions
4. List of anything that truly needs your input

Not: "I stopped at step 2 because I wasn't sure about X"

