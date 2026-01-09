---
name: task-decomposition
description: Use when a task feels too big or complex—break it into smaller, achievable pieces
---

# Task Decomposition

## Overview

Big tasks cause problems: context bloat, losing track, half-finished work. When something feels too big, **break it down before starting**.

**Core principle:** If you can't complete it in 15-30 minutes, it's too big.

## When to Decompose

### Automatic Triggers

Break down the task if:

- [ ] You're not sure where to start
- [ ] Multiple files need to change
- [ ] Multiple features bundled together
- [ ] You catch yourself thinking "this is complex"
- [ ] The task has "and" in it ("build X and Y and Z")
- [ ] Estimated time > 30 minutes

### The Sniff Test

Ask yourself:
> "Can I hold this entire task in my head?"

If no → decompose.

## Decomposition Patterns

### Pattern 1: Vertical Slice

Break by **feature completeness**, not by layer.

```
❌ BAD: By layer (leaves incomplete features)
   - Task 1: Build all database models
   - Task 2: Build all API routes
   - Task 3: Build all UI components

✅ GOOD: By feature (each is complete & testable)
   - Task 1: User registration (model + API + UI)
   - Task 2: User login (model + API + UI)
   - Task 3: User profile (model + API + UI)
```

### Pattern 2: By Risk

Do the **uncertain/risky parts first**.

```
Original: "Integrate Stripe payments"

Decomposed:
1. Verify Stripe SDK works (spike)
2. Create checkout session (core feature)
3. Handle webhooks (can fail silently at first)
4. Add error handling & edge cases
5. Add tests
```

Risky part (SDK integration) is validated before investing in details.

### Pattern 3: By Dependency

Order tasks so **each unblocks the next**.

```
Original: "Build dashboard with charts"

Decomposed:
1. Create empty dashboard page with layout
2. Add data fetching (mock data fine)
3. Add first chart component
4. Add second chart component
5. Replace mock data with real API
6. Add loading states
```

Each step is testable. Never blocked.

### Pattern 4: Working → Better → Best

Get something **working first**, then improve.

```
Original: "Build image upload with cropping, compression, and CDN"

Decomposed:
1. Basic file upload (works, but unoptimized)
2. Add file type validation
3. Add size limits
4. Add compression
5. Add cropping UI
6. Move to CDN storage
```

Working at step 1. Each step improves it.

## Decomposition Template

When breaking down a task:

```markdown
## Original Task
[Paste the original task description]

## Why Decomposing
[Too big / Multiple concerns / Uncertainty / etc.]

## Subtasks

### 1. [First subtask - smallest viable piece]
- What: [Specific deliverable]
- Verify: [How to know it's done]
- Time: ~[X] minutes

### 2. [Second subtask]
- What: [Specific deliverable]
- Verify: [How to know it's done]
- Time: ~[X] minutes

### 3. [Continue...]

## Order Rationale
[Why this order? Dependencies? Risk? etc.]
```

## Example Decomposition

### Before:

```
Task: Build user authentication system
```

😰 This is huge. Where to even start?

### After:

```markdown
## Original Task
Build user authentication system

## Why Decomposing
Multiple features (register, login, logout, sessions)
Multiple layers (DB, API, UI, middleware)
Estimated 2-3 hours

## Subtasks

### 1. Create User model & migration
- What: User table with email, password_hash, created_at
- Verify: Can create user in DB via script
- Time: ~10 minutes

### 2. Add registration API endpoint
- What: POST /api/auth/register - creates user
- Verify: Can register via curl
- Time: ~15 minutes

### 3. Add login API endpoint
- What: POST /api/auth/login - returns token
- Verify: Can login via curl, get token
- Time: ~15 minutes

### 4. Add auth middleware
- What: Middleware that validates token on protected routes
- Verify: Protected route rejects without token
- Time: ~10 minutes

### 5. Add registration UI
- What: Registration form component
- Verify: Can register through UI
- Time: ~20 minutes

### 6. Add login UI
- What: Login form component  
- Verify: Can login through UI
- Time: ~15 minutes

### 7. Add logout & session management
- What: Logout button, redirect on session expiry
- Verify: Full login/logout flow works
- Time: ~15 minutes

## Order Rationale
Backend first (1-4), then UI (5-7)
Each step testable independently
Core auth before polish
```

Now each subtask is ~10-20 minutes. Manageable.

## Self-Check

After decomposing, verify:

- [ ] Each subtask is independently completable
- [ ] Each subtask is testable/verifiable
- [ ] Subtasks are ordered by dependency
- [ ] No subtask is > 30 minutes
- [ ] Doing subtask 1 doesn't require knowing about subtask 5

## When NOT to Decompose

- Task is already small and clear
- Simple bug fix with obvious solution
- Single-file change
- You can hold it all in your head

Don't create overhead for simple tasks.

## Integration with Autonomous Work

When working through a plan autonomously:

1. Look at next task
2. **If too big → decompose first**
3. Add subtasks to your TodoWrite
4. Work through subtasks
5. Mark original task complete when all subtasks done

This prevents getting lost in big tasks while you're away.

---

## Related Skills

| Skill | When to Use |
|-------|-------------|
| `execution/parallel-execution` | After decomposing, run independent subtasks in parallel |
| `development/plan-execution` | For executing decomposed plans systematically |
| `development/subagent-development/subagent-development` | Dispatch subagent per decomposed task |
| `autonomy/prepare-autonomous-execution` | Before AFK execution of decomposed work |
| `execution/completion-checklist` | Verify each subtask is truly complete |

### Precedes
- `development/tdd/tdd` - Each subtask should use TDD
- `monitoring/progress-heartbeat` - Track progress through subtasks

