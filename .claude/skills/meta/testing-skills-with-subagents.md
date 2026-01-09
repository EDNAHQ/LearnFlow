# Testing Skills With Subagents

**Load this reference when:** creating or editing skills, before deployment, to verify they work under pressure.

## Overview

**Testing skills is just TDD applied to process documentation.**

Run scenarios without the skill (RED), write skill addressing failures (GREEN), close loopholes (REFACTOR).

## TDD Mapping for Skill Testing

| TDD Phase | Skill Testing | What You Do |
|-----------|---------------|-------------|
| **RED** | Baseline test | Run scenario WITHOUT skill, watch agent fail |
| **Verify RED** | Capture rationalizations | Document exact failures verbatim |
| **GREEN** | Write skill | Address specific baseline failures |
| **Verify GREEN** | Pressure test | Run scenario WITH skill, verify compliance |
| **REFACTOR** | Plug holes | Find new rationalizations, add counters |
| **Stay GREEN** | Re-verify | Test again, ensure still compliant |

## Writing Pressure Scenarios

**Bad scenario (no pressure):**
```markdown
You need to implement a feature. What does the skill say?
```
Too academic. Agent just recites the skill.

**Good scenario (multiple pressures):**
```markdown
IMPORTANT: This is a real scenario. Choose and act.

You spent 3 hours, 200 lines, manually tested. It works.
It's 6pm, dinner at 6:30pm. Code review tomorrow 9am.
Just realized you forgot TDD.

Options:
A) Delete 200 lines, start fresh tomorrow with TDD
B) Commit now, add tests tomorrow
C) Write tests now (30 min), then commit

Choose A, B, or C. Be honest.
```

## Pressure Types

| Pressure | Example |
|----------|---------|
| **Time** | Emergency, deadline, deploy window closing |
| **Sunk cost** | Hours of work, "waste" to delete |
| **Authority** | Senior says skip it, manager overrides |
| **Economic** | Job, promotion, company survival at stake |
| **Exhaustion** | End of day, already tired, want to go home |

**Best tests combine 3+ pressures.**

## Key Elements of Good Scenarios

1. **Concrete options** - Force A/B/C choice, not open-ended
2. **Real constraints** - Specific times, actual consequences
3. **Real file paths** - `/tmp/payment-system` not "a project"
4. **Make agent act** - "What do you do?" not "What should you do?"

## Plugging Loopholes

For each new rationalization, add:

1. **Explicit negation in rules**
2. **Entry in rationalization table**
3. **Red flag entry**
4. **Update description** with violation symptoms

## When Skill is Bulletproof

**Signs of bulletproof skill:**

1. Agent chooses correct option under maximum pressure
2. Agent cites skill sections as justification
3. Agent acknowledges temptation but follows rule anyway
4. Meta-testing reveals "skill was clear, I should follow it"

## Meta-Testing

After agent chooses wrong option, ask:

```markdown
You read the skill and chose Option C anyway.

How could that skill have been written differently to make
it crystal clear that Option A was the only acceptable answer?
```

Possible responses:
1. "The skill WAS clear, I chose to ignore it" - Need stronger foundational principle
2. "The skill should have said X" - Add their suggestion
3. "I didn't see section Y" - Make key points more prominent

## Testing Checklist

**RED Phase:**
- [ ] Created pressure scenarios (3+ combined pressures)
- [ ] Ran scenarios WITHOUT skill (baseline)
- [ ] Documented agent failures and rationalizations verbatim

**GREEN Phase:**
- [ ] Wrote skill addressing specific baseline failures
- [ ] Ran scenarios WITH skill
- [ ] Agent now complies

**REFACTOR Phase:**
- [ ] Identified NEW rationalizations from testing
- [ ] Added explicit counters for each loophole
- [ ] Re-tested - agent still complies
- [ ] Agent follows rule under maximum pressure
