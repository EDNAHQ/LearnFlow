# Smart Task Router

Route yourself to highest-impact work across all 15 projects.

## When to Use

- Session start: What should I work on right now?
- Between tasks: What's next?
- Bottleneck detection: Where am I most needed?

## Behavior

### 1. Scan All Projects

For each of 15 projects:
- Read `.claude/pm/ideas.md` (backlog)
- Read `.claude/pm/board.md` (current work)
- Run `git status` (uncommitted changes)
- Check for blocked items
- Check dependencies from `.claude/context.md`

### 2. Analyze & Score

For each idea/task, calculate:

**Priority score** = (priority_level × 0.4) + (dependencies_blocking × 0.3) + (age_days / 100 × 0.3)

**Impact score** = (project_criticality × 0.5) + (revenue_potential × 0.3) + (unblocks_other_work × 0.2)

**Effort estimate** = (lines_changed + dependencies + unknowns) / 10

**Velocity score** = impact_score / effort_estimate

### 3. Rank & Route

Top 10 by velocity score:
```
| Rank | Project | Task | Impact | Effort | Velocity | Blocker? |
|------|---------|------|--------|--------|----------|----------|
| 1 | Help Genie Mobile | Get app to store | High | 40h | 3.2 | API stable? |
| 2 | OMNI | Marketplace expand | High | 30h | 2.8 | Yes - need API |
| 3 | Help Genie Consumer | Brand integrity | Medium | 15h | 2.1 | No |
```

### 4. Dependency Check

Flag blockers:
```
⚠️  Task #4 (Mobile app) blocks: #5 (Marketplace), #6 (API endpoints)
    → Recommend: Ship #4 FIRST
```

### 5. Recommendations

Output:
- **Top 3 next tasks** (ranked by impact/effort)
- **Blocked work** (what's waiting on what)
- **Quick wins** (high-impact, low-effort)
- **Critical path** (must ship first)

### Example Output

```
## 🎯 Today's Top Opportunities

### 1. Get Mobile App to App Store (p1)
- Impact: Unblocks marketplace expansion + API testing
- Effort: 40 hours (estimated)
- Velocity: 3.2x
- Blocks: #5, #6
- Next step: /dev:plan

### 2. Expand Marketplace Products (p2)
- Impact: Revenue growth, 100K+ products
- Effort: 30 hours (estimated)
- Velocity: 2.8x
- Blocked by: #4 (API stability)
- Status: WAITING - ready when #4 shipped

### 3. Brand Integrity Module (p2)
- Impact: Medium, improves Help Genie
- Effort: 15 hours
- Velocity: 2.1x
- Blocks: Nothing
- Next step: /dev:plan

## 📊 Critical Path

To ship features fastest, order by dependencies:
1. Mobile app to store (critical - unblocks 2 others)
2. Then marketplace expansion
3. Then brand integrity + tidyups

## ⚠️ Blocked Work

- Marketplace expansion: WAITING on API stability from #4
- Auto sales workflow: No blockers, ready to start
- Various tidyups: No blockers, batch together
```

## Integration

Works with:
- `/pm:status` - Post recommendations to daily status
- `/dev:plan` - Auto-suggest plan for top-ranked work
- `/dev:parallel` - Identify parallelizable blocked work
- `/pm:tasks` - Pre-stage next 5 tasks in smart order

## Notes

- Runs daily or on-demand
- Learns from velocity history
- Adjusts priority if blockers clear
- Surfaces hidden dependencies
- Prevents sub-optimal work sequencing
