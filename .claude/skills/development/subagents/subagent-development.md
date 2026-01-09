---
name: subagent-development
description: "Use when executing implementation plans with independent tasks in the current session - dispatches fresh subagent per task with two-stage review"
---

# Subagent-Driven Development

## Overview

Execute plan by dispatching fresh subagent per task, with two-stage review after each: spec compliance review first, then code quality review.

**Core principle:** Fresh subagent per task + two-stage review = high quality, fast iteration

## When to Use

- Have implementation plan
- Tasks mostly independent
- Want to stay in this session (vs. parallel session with `development/plan-execution`)

## The Process

### Step 1: Load Plan
- Read plan file once
- Extract all tasks with full text and context
- Create TodoWrite with all tasks

### Step 2: Per-Task Cycle

For each task:

1. **Dispatch implementer subagent** (use `./implementer-prompt.md`)
   - Provide FULL task text (don't make subagent read file)
   - Include scene-setting context
   - Subagent may ask questions - answer them

2. **Dispatch spec compliance reviewer** (use `./spec-reviewer-prompt.md`)
   - Verifies implementation matches spec
   - If issues found: implementer fixes, re-review
   - Must pass before code quality review

3. **Dispatch code quality reviewer** (use `./code-quality-reviewer-prompt.md`)
   - Reviews code quality, architecture, testing
   - If issues found: implementer fixes, re-review
   - Must pass before next task

4. **Mark task complete** in TodoWrite

### Step 3: Finish

After all tasks:
- Dispatch final code-reviewer for entire implementation
- Use `development/verification` to complete work

## Example Workflow

```
You: I'm using Subagent-Driven Development to execute this plan.

[Read plan file once]
[Extract all 5 tasks with full text and context]
[Create TodoWrite with all tasks]

Task 1: Hook installation script

[Dispatch implementation subagent with full task text + context]

Implementer: "Before I begin - should the hook be installed at user or system level?"

You: "User level (~/.config/superpowers/hooks/)"

Implementer: [implements, tests, commits, self-reviews]

[Dispatch spec compliance reviewer]
Spec reviewer: Spec compliant - all requirements met

[Dispatch code quality reviewer]
Code reviewer: Approved

[Mark Task 1 complete]
[Continue to Task 2...]
```

## Prompt Templates

In this directory:
- `./implementer-prompt.md` - For implementation subagents
- `./spec-reviewer-prompt.md` - For spec compliance review
- `./code-quality-reviewer-prompt.md` - For code quality review

## Red Flags

**Never:**
- Skip reviews (spec compliance OR code quality)
- Proceed with unfixed issues
- Dispatch multiple implementation subagents in parallel (conflicts)
- Make subagent read plan file (provide full text instead)
- Start code quality review before spec compliance passes
- Move to next task while either review has open issues

**If subagent asks questions:**
- Answer clearly and completely
- Don't rush them into implementation

**If reviewer finds issues:**
- Implementer fixes them
- Reviewer reviews again
- Repeat until approved
