---
name: client-context
description: Use to remember who each project is for and adjust approach accordingly
---

# Client Context

## Overview

Each project has different stakeholders with different needs. Remember who you're building for and adjust accordingly.

**Core principle:** Context shapes decisions. Know your audience.

## Project Context Files

Create `.claude/context.md` in each project:

```markdown
# Project Context: app-2

## Client/Stakeholder

**Client:** Acme Corp
**Main Contact:** John Smith (john@acme.com)
**Relationship:** Paying client since 2024

## Communication Style

- **Updates:** Prefers weekly email summaries
- **Technical Level:** Non-technical, explain simply
- **Response Time:** Expects response within 24 hours
- **Meeting Preference:** Async when possible

## Project Priorities

| Priority | Notes |
|----------|-------|
| Stability | Very important - production system |
| Features | Moderate - wants new features but not rushed |
| Speed | Low - quality over speed |
| Cost | Moderate - has budget but value-conscious |

## Risk Tolerance

**Conservative** - Prefers proven approaches over cutting-edge.
Test thoroughly before deploying.

## Special Considerations

- Has compliance requirements (SOC 2)
- Data must stay in US regions
- Needs advance notice for any downtime
- End users are non-technical

## History

- Started: March 2024
- Major milestones: MVP launch (June), v2 (October)
- Past issues: Had incident in July (payment bug), rebuilt trust
- Current status: Happy, considering expansion

## What Success Looks Like

- Reliable payment processing
- Monthly feature additions
- Quick bug response
- Clear communication
```

## Using Context

### When Making Decisions

Before making a choice, check context:

```
Decision: Should I use new React 19 features?

Context check:
- Client: Acme Corp
- Risk tolerance: Conservative
- Priority: Stability over features

Decision: No, stick with proven React 18 patterns.
Document for future consideration.
```

### When Communicating

```
Bug found in app-2:

Context check:
- Client: Non-technical
- Communication: Clear, simple explanations

Message:
"We found a small issue with the login page that might 
cause a brief delay for some users. We've already fixed it 
and deployed the update. No action needed from your side."

NOT:
"Identified race condition in auth token refresh causing 
intermittent 401s. Patched with mutex implementation."
```

### When Prioritizing

```
app-2 has 3 items in backlog:
1. New dashboard widget (feature)
2. Performance optimization (improvement)
3. Security patch (maintenance)

Context check:
- Priority: Stability first
- Compliance: SOC 2 requirements

Order:
1. Security patch (compliance)
2. Performance (stability)
3. Dashboard widget (feature)
```

## Context Templates

### Client Project

```markdown
# Project Context

## Client
- **Name:** [Company name]
- **Contact:** [Primary contact]
- **Type:** [Paying client / Partner / etc.]

## Communication
- **Frequency:** [Daily / Weekly / As needed]
- **Channel:** [Email / Slack / etc.]
- **Style:** [Technical / Non-technical]

## Priorities
1. [Most important]
2. [Second]
3. [Third]

## Constraints
- [Budget / Timeline / Technical / Compliance]

## Risk Tolerance
[Conservative / Moderate / Aggressive]

## Success Metrics
- [What does success look like?]
```

### Internal Project

```markdown
# Project Context

## Purpose
- **Type:** Internal tool / Infrastructure / Experiment
- **Users:** [Who uses this internally]

## Constraints
- **Time:** [Deadline or ongoing]
- **Resources:** [Budget / Team availability]

## Priorities
- [Move fast / Be stable / Learn something]

## Success Metrics
- [What are we trying to achieve?]
```

### Personal/Side Project

```markdown
# Project Context

## Purpose
- **Goal:** [Learning / Portfolio / Fun / Profit]

## Constraints
- **Time:** [Hours per week available]
- **Priority:** [vs other projects]

## Preferences
- **Tech choices:** [Try new things / Stick with known]
- **Quality bar:** [Production-ready / Good enough]

## Success Metrics
- [What would make this worthwhile?]
```

## Context-Aware Behaviors

### Conservative Client (e.g., Enterprise)

```
DO:
- Test thoroughly before deploying
- Communicate changes in advance
- Use proven, stable libraries
- Document everything
- Follow their processes

DON'T:
- Deploy on Fridays
- Use bleeding-edge tech
- Make breaking changes without notice
- Assume they'll figure it out
```

### Fast-Moving Client (e.g., Startup)

```
DO:
- Move quickly
- Try new approaches
- Deploy frequently
- Iterate based on feedback
- Communicate efficiently

DON'T:
- Over-engineer solutions
- Wait for perfect
- Create heavy documentation
- Slow down for process
```

### Internal Project

```
DO:
- Balance speed and quality
- Make pragmatic choices
- Share knowledge with team
- Consider future maintenance

DON'T:
- Gold-plate
- Ignore team standards
- Create silos
```

## Quick Context Check

Before starting work:

```
"What's the context for app-2?"

→ Shows: Client (Acme), Priorities (Stability), Risk (Conservative)
→ Reminder: Test thoroughly, communicate changes
```

## Context in Standups

Include context-relevant framing:

```markdown
# Standup for app-2 (Acme Corp)

## For Client Update
[Non-technical summary suitable for John]

## Technical Details
[Full details for internal reference]
```

## Context Updates

Keep context current:

```
"Update app-2 context: They're now more open to new features, 
moving from conservative to moderate risk tolerance"
```

## Integration

Use with:
- **smart-prioritization**: Context affects priority
- **standup-generator**: Frame updates appropriately
- **cross-project-knowledge**: Solutions may not apply across different contexts

## The Value

Without context:
- Wrong priorities
- Wrong communication style
- Wrong technical choices
- Unhappy stakeholders

With context:
- Right work at right time
- Clear, appropriate communication
- Fitting solutions
- Happy stakeholders

