---
name: cross-project-knowledge
description: Use to capture and apply solutions across all your projects so you don't re-solve the same problems
---

# Cross-Project Knowledge

## Overview

When you solve something in one project, that knowledge should help in all your other projects. Solutions should compound, not be forgotten.

**Core principle:** Solve once, apply everywhere.

## The Knowledge Base

Create `.claude/knowledge/` to store reusable solutions:

```
.claude/knowledge/
├── solutions/           ← Specific problems you've solved
│   ├── auth-token-refresh.md
│   ├── cors-configuration.md
│   ├── react-query-caching.md
│   └── stripe-webhook-handling.md
│
├── gotchas/             ← Things that tripped you up
│   ├── prisma-migrations.md
│   ├── next-js-hydration.md
│   └── typescript-strict-mode.md
│
└── decisions/           ← Why you chose certain approaches
    ├── state-management.md
    ├── testing-strategy.md
    └── deployment-approach.md
```

## Solution Template

When you solve something tricky, capture it:

```markdown
# [Problem Title]

## The Problem
[What was happening, error messages, symptoms]

## The Cause
[Root cause - why it was happening]

## The Solution
[How you fixed it - code, config, steps]

## Projects Affected
[Which of your projects have this / could have this]

## Keywords
[Search terms: error messages, library names, symptoms]
```

## Example: Captured Solution

```markdown
# Auth Token Refresh Race Condition

## The Problem
Users getting logged out randomly. Multiple API calls firing simultaneously, 
all trying to refresh the token at once, causing race condition.

Error: "Invalid refresh token" appearing intermittently

## The Cause
When access token expires, multiple concurrent requests all detect expiry
and try to refresh. First one succeeds, invalidates refresh token. 
Others fail with invalid token.

## The Solution

Implement refresh token mutex:

```typescript
// lib/auth.ts
let refreshPromise: Promise<string> | null = null;

export async function getValidToken(): Promise<string> {
  const token = getStoredToken();
  
  if (!isExpired(token)) {
    return token;
  }
  
  // If refresh already in progress, wait for it
  if (refreshPromise) {
    return refreshPromise;
  }
  
  // Start refresh, store promise so others can wait
  refreshPromise = refreshToken()
    .then(newToken => {
      storeToken(newToken);
      return newToken;
    })
    .finally(() => {
      refreshPromise = null;
    });
  
  return refreshPromise;
}
```

## Projects Affected
- app-1: Has this issue (fixed)
- app-2: Uses same auth pattern (should apply)
- app-3: Different auth (not applicable)

## Keywords
token refresh, race condition, concurrent requests, 401, invalid refresh token,
logout randomly, auth expiry
```

## How Knowledge Gets Applied

### Automatic Pattern Matching

When working on any project, Claude should:

1. Recognize similar problems
2. Check knowledge base for existing solutions
3. Suggest or apply known fixes

```
Claude: "This looks like the token refresh race condition 
         we solved in app-1. Want me to apply the same fix?"
```

### Search When Stuck

When encountering an error:

```
"Check knowledge base for: [error message or symptom]"

→ Searches solutions/ and gotchas/
→ Shows relevant past solutions
```

### Proactive Suggestions

When building something new:

```
Claude: "You're implementing webhook handling. Based on your 
         knowledge base, here are things to watch out for:
         - Idempotency (see stripe-webhook-handling.md)
         - Timeout handling (see webhook-gotchas.md)"
```

## Capturing New Knowledge

### When to Capture

- [x] Spent > 30 min debugging something
- [x] Found a non-obvious solution
- [x] Hit a "gotcha" that could happen again
- [x] Made a decision that has tradeoffs
- [x] Discovered something not in official docs

### Quick Capture

During work, quick-capture for later:

```markdown
## Quick Capture: [date]

**Problem:** [one line]
**Solution:** [one line]
**Details:** [write up later]

---
```

Then flesh out when you have time.

### From Debugging Sessions

After fixing a tricky bug:

```
"Capture this solution to knowledge base"

Claude: [Creates solution file with problem, cause, solution]
        [Tags with keywords for searchability]
        [Notes which projects might benefit]
```

## Cross-Project Sync

When you apply a fix to one project:

```
Claude: "This fix (token refresh mutex) might apply to:
         - app-2 (same auth pattern)
         - app-5 (similar setup)
         
         Want me to check and apply to those projects too?"
```

## Decision Records

For bigger decisions, capture the "why":

```markdown
# Decision: State Management

## Context
Needed to choose state management for new projects.

## Options Considered
1. Redux - Familiar, but verbose
2. Zustand - Simple, less boilerplate
3. React Query + Context - Good for server state

## Decision
React Query for server state, Zustand for client state.

## Rationale
- Most state is server data (React Query handles well)
- Minimal client-only state (Zustand is lighter than Redux)
- Reduces boilerplate significantly

## Applies To
All new React projects. Legacy projects stay on Redux.

## Revisit When
- React Query has major breaking changes
- Project has complex client-side state
```

## Knowledge Maintenance

### Periodic Review

Monthly, review knowledge base:

- [ ] Remove outdated solutions (library updated, etc.)
- [ ] Consolidate duplicates
- [ ] Add tags for better searchability
- [ ] Check if gotchas are still relevant

### Versioning

Tag solutions with when they were captured:

```markdown
## Metadata
- Captured: 2025-12-21
- Last verified: 2025-12-21
- Libraries: react-query@5, axios@1.6
```

Helps know if solution is still current.

## Integration

Use with:
- **error-recovery-loop**: Search knowledge before giving up
- **project-templates**: Patterns vs. specific solutions
- **proactive-optimization**: Apply known improvements

The knowledge base is your second brain for coding patterns.

