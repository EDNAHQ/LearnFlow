---
description: Start a structured brainstorming session
arguments:
  - name: topic
    description: What to brainstorm about
    required: true
---

Run a structured brainstorming session following the brainstorming skill.

**Phase 1: Divergent Thinking (Generate)**
- Generate 10+ ideas without judgment
- Include wild/unconventional ideas
- Build on previous ideas
- No criticism yet

**Phase 2: Organize**
- Group similar ideas
- Identify themes
- Note connections

**Phase 3: Evaluate**
- Score by feasibility (1-5)
- Score by impact (1-5)
- Identify quick wins (high impact, high feasibility)

**Phase 4: Select**
- Recommend top 3 ideas
- Explain trade-offs
- Suggest next steps

**Output format:**
```
## Brainstorm: <topic>

### Ideas Generated
1. [idea]
2. [idea]
...

### Top Recommendations
1. **[Best idea]** - why
2. **[Second]** - why
3. **[Third]** - why

### Quick Wins
- [High impact, easy to do]

### Next Steps
- [ ] Action item
```

Offer to capture selected ideas to the board with `/idea`.
