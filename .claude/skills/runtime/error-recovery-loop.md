---
name: error-recovery-loop
description: Use when encountering errors during autonomous work to systematically recover without human intervention
---

# Error Recovery Loop

## Overview

When something fails, don't stop—**loop until it works or you've exhausted options**.

**Core principle:** Treat every error as a puzzle to solve, not a reason to stop.

## The Iron Law

```
NO FIXES WITHOUT UNDERSTANDING THE ROOT CAUSE FIRST
```

Random fixes waste time and create new bugs. If you haven't traced the error to its source, you're guessing.

## The Recovery Loop

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ERROR OCCURS                                              │
│       ↓                                                     │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  ATTEMPT 1: Quick Fix                               │   │
│   │  - Read error message                               │   │
│   │  - Apply obvious fix                                │   │
│   │  - Retry                                            │   │
│   └─────────────────────────────────────────────────────┘   │
│       ↓ still failing                                       │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  ATTEMPT 2: Deeper Analysis                         │   │
│   │  - Check stack trace                                │   │
│   │  - Look at surrounding code                         │   │
│   │  - Search codebase for patterns                     │   │
│   │  - Apply informed fix                               │   │
│   │  - Retry                                            │   │
│   └─────────────────────────────────────────────────────┘   │
│       ↓ still failing                                       │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  ATTEMPT 3: Different Approach                      │   │
│   │  - Step back from specific solution                 │   │
│   │  - Consider: is there another way?                  │   │
│   │  - Try alternative implementation                   │   │
│   │  - Retry                                            │   │
│   └─────────────────────────────────────────────────────┘   │
│       ↓ still failing                                       │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  ATTEMPT 4: Simplify                                │   │
│   │  - Remove complexity                                │   │
│   │  - Get minimal version working                      │   │
│   │  - Add features back incrementally                  │   │
│   │  - Retry                                            │   │
│   └─────────────────────────────────────────────────────┘   │
│       ↓ still failing                                       │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  ATTEMPT 5: Fresh Start                             │   │
│   │  - Revert to last working state                     │   │
│   │  - Approach from scratch with new knowledge         │   │
│   │  - Apply what you learned from failures             │   │
│   │  - Retry                                            │   │
│   └─────────────────────────────────────────────────────┘   │
│       ↓ still failing after 3+ genuine attempts             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  ⚠️  STOP - QUESTION THE ARCHITECTURE               │   │
│   │                                                     │   │
│   │  Pattern indicating architectural problem:          │   │
│   │  - Each fix reveals new problem elsewhere           │   │
│   │  - Fixes require "massive refactoring"              │   │
│   │  - Each fix creates new symptoms                    │   │
│   │                                                     │   │
│   │  Ask yourself:                                      │   │
│   │  - Is this pattern fundamentally sound?             │   │
│   │  - Are we sticking with it through inertia?         │   │
│   │  - Should we refactor vs. continue fixing?          │   │
│   │                                                     │   │
│   │  Discuss with human before attempting more fixes    │   │
│   └─────────────────────────────────────────────────────┘   │
│       ↓ after discussion or 5 attempts                      │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  LOG & MOVE ON                                      │   │
│   │  - Document everything tried                        │   │
│   │  - Note specific error and conditions               │   │
│   │  - Flag for human review                            │   │
│   │  - Continue with other tasks                        │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Common Error Patterns & Solutions

### Build/Compile Errors

| Error Pattern | First Try | Second Try |
|---------------|-----------|------------|
| "Module not found" | Check import path | Run `npm install` |
| "Cannot find X" | Check spelling | Check exports |
| "Type error" | Read the types | Check function signature |
| "Syntax error" | Check line above | Look for missing brackets |

### Runtime Errors

| Error Pattern | First Try | Second Try |
|---------------|-----------|------------|
| "undefined is not a function" | Check if value exists | Add null check |
| "Cannot read property of null" | Add optional chaining | Check data flow |
| "Network error" | Check if server running | Check URL/port |
| "CORS error" | Check server headers | Check request origin |

### Test Failures

| Error Pattern | First Try | Second Try |
|---------------|-----------|------------|
| "Expected X got Y" | Check test expectation | Check implementation |
| "Timeout" | Increase timeout | Add proper waiting |
| "Cannot find element" | Check selector | Wait for render |
| "Snapshot mismatch" | Review changes | Update snapshot if correct |

### Git Errors

| Error Pattern | First Try | Second Try |
|---------------|-----------|------------|
| "Merge conflict" | Resolve conflicts | Abort and retry differently |
| "Cannot push" | Pull first | Check remote state |
| "Uncommitted changes" | Stash or commit | Check what changed |

## Error Log Format

When logging errors for later review:

```markdown
## Error: [Brief Description]

**Task:** Task 3 - User profile page
**Time:** 14:42
**Error Message:**
```
[paste full error]
```

**What I Tried:**
1. [Attempt 1]: [What you did] → [Result]
2. [Attempt 2]: [What you did] → [Result]
3. [Attempt 3]: [What you did] → [Result]

**Root Cause (if found):** 
[Explanation]

**Resolution:**
[What finally worked] OR [Still unresolved - needs human input]

**Time Spent:** 12 minutes
```

## Root Cause Tracing

**Before fixing, trace backwards to find the source.**

Bugs often manifest deep in the call stack. Your instinct is to fix where the error appears, but that's treating a symptom.

### The Tracing Process

1. **Observe the symptom** - What error message do you see?
2. **Find immediate cause** - What code directly causes this?
3. **Ask: What called this?** - Trace one level up
4. **Keep tracing up** - What value was passed? Where did it come from?
5. **Find original trigger** - The source, not the symptom

### Adding Debug Info

When you can't trace manually:

```typescript
// Before the problematic operation
const stack = new Error().stack;
console.error('DEBUG:', {
  value,
  cwd: process.cwd(),
  stack,
});
```

**Critical:** Use `console.error()` in tests (logger may be suppressed)

### Real Example

```
Symptom: .git created in source directory (wrong place)

Trace:
1. git init runs in process.cwd() ← empty cwd parameter
2. WorktreeManager called with empty projectDir
3. Session.create() passed empty string
4. Test accessed context.tempDir before beforeEach
5. setupCoreTest() returns { tempDir: '' } initially

Root cause: Top-level variable accessing empty value
Fix: Made tempDir a getter that throws if accessed too early
```

**NEVER fix just where the error appears.** Trace back to find the original trigger.

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Issue is simple, don't need process" | Simple issues have root causes too. Process is fast for simple bugs. |
| "Emergency, no time for process" | Systematic debugging is FASTER than guess-and-check thrashing. |
| "Just try this first, then investigate" | First fix sets the pattern. Do it right from the start. |
| "I see the problem, let me fix it" | Seeing symptoms ≠ understanding root cause. |
| "One more fix attempt" (after 2+ failures) | 3+ failures = architectural problem. Question pattern, don't fix again. |

## Recovery Mindset

### DO:
- **Read the whole error** - not just the first line
- **Trace backwards** - find the source, not the symptom
- **Check the obvious first** - typos, missing saves, wrong file
- **Look for patterns** - how is this done elsewhere in codebase?
- **Simplify** - get a minimal case working
- **Take notes** - what you tried helps you and the human later
- **Set a time limit** - don't spend 2 hours on one error

### DON'T:
- **Panic and make random changes**
- **Try the same thing repeatedly**
- **Ignore error messages**
- **Give up after one attempt**
- **Wait for human without trying**
- **Fix at the symptom level** - trace to the source

## When to Actually Stop

Only stop and wait for human if:

1. **Security/Auth issues** - Don't guess on passwords, keys, permissions
2. **Data destruction risk** - Migrations, deletions, production changes
3. **Fundamental confusion** - Truly don't understand what's being asked
4. **External dependency** - Need API key, account access, etc.
5. **5+ genuine attempts failed** - You've really tried everything

Everything else: **Figure it out and keep going.**

## Recovery Examples

### Example 1: Import Error

```
Error: Cannot find module './UserProfile'

Attempt 1: Check file exists → File is UserProfile.tsx not UserProfile.js
Fix: Update import to './UserProfile.tsx' or './UserProfile'
Result: ✅ Fixed
```

### Example 2: API Not Working

```
Error: 404 on /api/users

Attempt 1: Check route exists → Route exists
Attempt 2: Check server running → Server not running!
Fix: Start server with npm run dev
Result: ✅ Fixed
```

### Example 3: Complex Bug

```
Error: State not updating after API call

Attempt 1: Check setState call → Looks correct
Attempt 2: Add console.log → API returns data fine
Attempt 3: Check component mounting → Found: component unmounts before setState
Attempt 4: Add cleanup/cancel pattern
Result: ✅ Fixed
```

### Example 4: Unresolvable

```
Error: OAuth callback failing

Attempt 1: Check redirect URI → Matches config
Attempt 2: Check credentials → Can't verify, don't have access
Attempt 3: Check logs → No server access
Attempt 4: Search docs → Need to verify app settings
Attempt 5: Try different auth flow → Same issue

Result: ❌ Logged for human
- Need: Access to OAuth provider dashboard
- Need: Verify app credentials and redirect URIs
- Continuing with other tasks...
```

## Integration with Progress Tracking

Every recovery attempt should be logged in your progress file:

```markdown
### 14:42 - Error Encountered
- **Error:** Module not found: './components/Header'
- **Attempts:** 2
- **Resolution:** File was in wrong directory, moved it
- **Time spent:** 3 minutes
- Continuing with task...
```

This creates a trail the human can review if needed.

