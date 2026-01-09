# Knowledge Base

A persistent memory for solutions, gotchas, and decisions that compound over time.

**Core principle:** Solve once, remember forever.

---

## Structure

```
knowledge/
├── solutions/    ← Specific problems you've solved
├── gotchas/      ← Things that tripped you up
├── decisions/    ← Why you chose certain approaches
└── README.md     ← You are here
```

---

## solutions/

**What goes here:** Specific technical problems you've debugged and fixed.

**When to capture:**
- Spent > 30 minutes debugging something
- Found a non-obvious solution
- Hit an issue that could happen in other projects

**Template:**

```markdown
# [Problem Title]

## The Problem
[What was happening - error messages, symptoms]

## The Cause
[Root cause - why it was happening]

## The Solution
[How you fixed it - code, config, steps]

## Keywords
[Search terms: error messages, library names, symptoms]

## Metadata
- Captured: YYYY-MM-DD
- Projects: [which projects had this]
```

**Example files:**
- `auth-token-refresh-race-condition.md`
- `cors-configuration.md`
- `react-query-stale-cache.md`

---

## gotchas/

**What goes here:** Quirks, footguns, and non-obvious behaviors that wasted your time.

**When to capture:**
- Something worked differently than expected
- Documentation was misleading or incomplete
- A library has a hidden behavior

**Template:**

```markdown
# [Library/Tool]: [Gotcha Title]

## The Gotcha
[What tripped you up]

## What You Expected
[What you thought would happen]

## What Actually Happens
[The reality]

## How to Handle It
[Workaround or correct approach]

## Keywords
[Search terms]
```

**Example files:**
- `prisma-migrations-dev-vs-prod.md`
- `nextjs-hydration-mismatch.md`
- `typescript-strict-null-checks.md`

---

## decisions/

**What goes here:** Architectural and tooling decisions with rationale.

**When to capture:**
- Chose between multiple options
- Made a tradeoff worth remembering
- Established a standard for your projects

**Template:**

```markdown
# Decision: [Title]

## Context
[What problem were you solving?]

## Options Considered
1. [Option A] - [pros/cons]
2. [Option B] - [pros/cons]
3. [Option C] - [pros/cons]

## Decision
[What you chose]

## Rationale
[Why this option over others]

## Applies To
[Which projects/situations]

## Revisit When
[Conditions that would change this decision]
```

**Example files:**
- `state-management-zustand.md`
- `testing-framework-vitest.md`
- `deployment-vercel.md`

---

## How It Gets Used

### During Debugging
When stuck on an error, Claude checks `solutions/` and `gotchas/` for similar issues before starting from scratch.

### When Building New Features
Claude checks `decisions/` to apply your established patterns and preferences.

### Cross-Project Learning
A solution captured from one project helps in all your other projects.

---

## Quick Capture

When you solve something tricky, tell Claude:

```
"Capture this solution to the knowledge base"
```

Claude will create a properly formatted file in the right folder.

---

## Maintenance

Monthly, review:
- [ ] Remove outdated solutions (library versions changed)
- [ ] Consolidate duplicates
- [ ] Add keywords for better searchability
- [ ] Archive decisions that no longer apply

---

## Related Skills

- `scaling/cross-project-knowledge` - Full documentation on this system
- `autonomy/error-recovery-loop` - Searches knowledge base when debugging
- `execution/proactive-optimization` - Applies known improvements

