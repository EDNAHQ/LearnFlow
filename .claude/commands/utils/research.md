---
description: Quick web research on a topic
arguments:
  - name: query
    description: What to research
    required: true
---

Perform web research following the web-research skill.

**Process:**
1. Search for the query using web search
2. Find 3-5 relevant sources
3. Synthesize key information
4. Cite sources

**Output format:**
```
## Research: <query>

### Summary
[2-3 paragraph synthesis of findings]

### Key Points
- [important finding 1]
- [important finding 2]
- [important finding 3]

### Sources
1. [Title](url) - brief note
2. [Title](url) - brief note
3. [Title](url) - brief note

### Related Topics
- [topic that might be worth exploring]
```

Focus on actionable, current information. Flag if sources are outdated.
