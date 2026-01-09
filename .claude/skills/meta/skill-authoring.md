---
name: skill-authoring
description: "Use when creating new skills, editing existing skills, or verifying skills work before deployment"
---

# Writing Skills

## Overview

**Writing skills IS Test-Driven Development applied to process documentation.**

You write test cases (pressure scenarios with subagents), watch them fail (baseline behavior), write the skill (documentation), watch tests pass (agents comply), and refactor (close loopholes).

**Core principle:** If you didn't watch an agent fail without the skill, you don't know if the skill teaches the right thing.

**REQUIRED BACKGROUND:** You MUST understand `development/tdd` before using this skill.

## What is a Skill?

Skills are modular packages that extend an agent's capabilities. Think of them as "onboarding guides" that transform a general-purpose agent into a specialist.

**Skills provide:**
- Specialized workflows (multi-step procedures)
- Tool integrations (file formats, APIs, scripts)
- Domain expertise (schemas, business logic)
- Bundled resources (scripts, references, assets)

## Core Principles

### Concise is Key

The context window is a public good. Only add context the agent doesn't already have.

**Good** (~50 tokens):
```markdown
## Extract PDF text
```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```
```

**Bad** (~150 tokens): Explanation Claude already knows.

### SKILL.md Structure

**Frontmatter (YAML):**
```yaml
---
name: skill-name-with-hyphens
description: Use when [specific triggering conditions]
---
```

- Only `name` and `description` fields (max 1024 chars total)
- `description`: Third-person, starts with "Use when..."
- **NEVER summarize workflow in description** - just triggering conditions

**Body structure:**
```markdown
# Skill Name

## Overview
Core principle in 1-2 sentences.

## When to Use
Symptoms, use cases, when NOT to use.

## Core Pattern
Before/after comparison or quick reference.

## Implementation
Inline code or links to references/scripts.

## Common Mistakes
What goes wrong + fixes.
```

### Directory Layout

```
skill-name/
├── skill-name.md         # Main instructions (<500 lines)
├── supporting-file.md    # Additional docs
└── script.sh             # Executable tools
```

## The Iron Law

```
NO SKILL WITHOUT A FAILING TEST FIRST
```

Same as TDD for code. Applies to NEW skills AND EDITS.

## RED-GREEN-REFACTOR for Skills

### RED: Baseline Testing

Run pressure scenario WITHOUT skill. Document:
- What choices did they make?
- What rationalizations (verbatim)?
- Which pressures triggered violations?

### GREEN: Write Minimal Skill

Address the specific rationalizations documented. Don't add hypothetical counters.

Run same scenarios WITH skill. Agent should comply.

### REFACTOR: Close Loopholes

Agent found new rationalization? Add:

1. **Explicit negation in rules**
2. **Entry in rationalization table**
3. **Red flag entry**
4. **Update description** with violation symptoms

Re-test until bulletproof.

## Bulletproofing Against Rationalization

Skills that enforce discipline need to resist rationalization.

### Close Every Loophole Explicitly

```markdown
Write code before test? Delete it. Start over.

**No exceptions:**
- Don't keep it as "reference"
- Don't "adapt" it while writing tests
- Delete means delete
```

### Add Foundational Principle

```markdown
**Violating the letter of the rules is violating the spirit of the rules.**
```

### Build Rationalization Table

| Excuse | Reality |
|--------|---------|
| "Too simple to test" | Simple code breaks. Test takes 30 seconds. |
| "I'll test after" | Tests passing immediately prove nothing. |

## Skill Creation Checklist

- [ ] Created pressure scenarios (3+ combined pressures)
- [ ] Ran scenarios WITHOUT skill (baseline)
- [ ] Documented failures verbatim
- [ ] Wrote skill addressing specific failures
- [ ] Ran scenarios WITH skill - verified compliance
- [ ] Added counters for new rationalizations
- [ ] Re-tested until bulletproof

**Supporting references in this directory:**
- `./testing-skills-with-subagents.md` - Complete testing methodology
