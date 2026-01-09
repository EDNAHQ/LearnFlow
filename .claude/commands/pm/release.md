---
description: Visualize dependencies and optimal task order for shipping features
arguments:
  - name: action
    description: "'plan' for release plan, 'critical' for critical path only, 'gantt' for timeline visualization"
    required: false
---

Dependency mapper - shows what to ship in what order for fastest delivery.

**Steps:**
1. Parse all task dependencies from all 15 projects
2. Build dependency graph
3. Calculate critical path (longest chain)
4. Identify bottlenecks
5. Suggest parallel work
6. Generate optimal shipping order

**Usage:**
- `/pm:release` - Full dependency analysis + optimal order
- `/pm:release plan` - Detailed phased release plan
- `/pm:release critical` - Show critical path only
- `/pm:release gantt` - Visual timeline

**Output:**
- Dependency graph (text or Mermaid diagram)
- Critical path analysis
- Bottlenecks and risks
- Recommended task order
- Timeline estimate
- Parallelization opportunities
