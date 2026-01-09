# Dependency Mapper

Visualize and optimize task dependencies across all projects.

## When to Use

- Planning releases: What order minimizes bottlenecks?
- Starting work: Which task unblocks the most others?
- Risk assessment: What breaks if X fails?
- Resource planning: Which work can run in parallel?

## Behavior

### 1. Parse All Dependencies

Scan all projects for:

**Explicit dependencies** (in ideas.md):
```markdown
## [4] Get mobile app live into app store
**Blocks:** [#5] Marketplace expansion, [#6] API testing
**Blocked by:** [#7] HG API stability
```

**Implicit dependencies** (inferred):
```
Mobile app depends on:
  → API endpoints stable (from Help Genie API project)
  → Authentication working (shared auth logic)
  → Voice functionality (from Help Genie Voice)

Marketplace expansion depends on:
  → Mobile app shipped (marketing, testing)
  → API can handle 100K products (performance)
  → Scraping functionality (technical component)
```

**Cross-project dependencies**:
```
Help Genie Consumer → Help Genie API (REST calls)
Help Genie Mobile → Help Genie API (REST calls)
OMNI → Help Genie API (uses same endpoints)
LearnFlow → Help Genie API (integrates voice)
```

### 2. Build Dependency Graph

```
        API Stability
            ↑
      [#7] HG API ← [#2] Voice transcript
            ↑                    ↑
            |              [#3] Simulation
            |                    ↑
        [#4] Mobile ← ← ← ← ← ← ↓
            ↓
      [#5] Marketplace ← ← [#1] Brand Integrity
            ↓
      [#6] Sales Workflow
            ↓
      [#8] Tidyups
```

### 3. Analyze Critical Path

**Critical Path** = longest dependency chain

```
Critical Path Analysis:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Longest chain (13 days estimated):
  [#7] HG API (5 days)
    ↓
  [#4] Mobile App (4 days)
    ↓
  [#5] Marketplace (4 days)
    ↓
  DONE

Fast path (can parallel):
  [#1] Brand Integrity (2 days) — NO BLOCKERS
  [#3] Simulation (3 days) — NO BLOCKERS
  [#8] Tidyups (1 day) — NO BLOCKERS

Recommendation: Start critical path immediately, run others in parallel
Estimated total time: 13 days (not 19) by parallelizing
```

### 4. Identify Bottlenecks

```
🚨 BOTTLENECK: [#7] HG API
  Blocks: [#4] Mobile, [#5] Marketplace, [#6] Sales
  Impact: 3 downstream tasks blocked
  Status: In progress (devs managing)
  Mitigation: Ship mobile without full API (MVP), iterate

⚠️  BLOCKER: [#4] Mobile shipping to App Store
  Blocks: [#5] Marketplace (can't test without real users)
  Duration: 4 days estimated
  Mitigation: Start Marketplace planning in parallel

✓ NO BLOCKERS: [#1], [#3], [#8]
  Can start immediately, run in parallel
```

### 5. Generate Optimal Order

```
## 📋 Recommended Ship Order (Fastest Route)

### Phase 1: Start NOW (In Parallel)
- [#7] HG API stability work (devs)
- [#1] Brand Integrity module (you)
- [#3] Simulation area (you)
- [#8] Various tidyups (batch task)

### Phase 2: After #7 completes (4 days from now)
- [#4] Get Mobile App to Store (unblocks 2 others)
  - Depends on: #7 (API), but can ship MVP
  - Effort: 4 days

### Phase 3: After #4 completes (8 days from now)
- [#5] Expand Marketplace (needs real users for testing)
  - Depends on: #4, #7
  - Effort: 4 days
  - Revenue impact: HIGH

### Phase 4: Parallel to above
- [#2] Voice API endpoints (3 days)
- [#6] Auto Sales Presentations (2 days)

### Expected Timeline
```
Day 1  ├─ Start API (#7) ─────────────────┐
       ├─ Start Brand (#1) ────────┐      │
       ├─ Start Simulation (#3) ──┐│      │
       └─ Tidyups (#8) ──┐        ││      │
                         │        ││      │
Day 5  │ Ship Brand      │        ││  API ├─ Start Mobile (#4)
       │ Ship Simulation │        ││  Ready│
       └─ Ship Tidyups   │        ││      │
                         │        │└──────┤
Day 9  │ Mobile Ready ───┴────────┘       │
       │ Start Marketplace (#5) ──────────┘

Day 13 └─ Marketplace Ready (Ship!)
```

### 6. Risk & Mitigation

```
| Risk | Impact | Mitigation | Confidence |
|------|--------|-----------|------------|
| API delays | High - blocks 3 tasks | Already in progress, monitor | High |
| Mobile store approval | Medium - 3-5 day delay | Submit early, have fallback | Medium |
| Marketplace testing | Low - can test with mock data | Start data setup early | High |
| Brand module scope creep | Low - well-defined | Add to #8 if too big | High |
```

### 7. Resource Allocation

```
Optimal allocation to hit day 13 target:

You:
- Phase 1 (4 days): Brand + Simulation (parallel)
- Phase 4 (concurrent): Auto sales workflow review

Devs:
- Phase 1 (continuous): API stability (critical path)
- Phase 2 (4 days): Mobile app polish for store
- Phase 4 (2 days): Voice API endpoints

Result: All 8 ideas shipped in 13 days at best efficiency
```

## Advanced Analysis

### `--show-all-paths`
Show every possible completion path, ranked by duration

### `--resource-intensive`
Show where team is bottlenecked (not blocked, but busy)

### `--cascade-delays`
"If X takes 2 more days, how many days does shipping delay?"

### `--parallel-opportunity`
"Which sets of tasks can truly run in parallel?"

## Integration

Works with:
- `/pm:board` - Reorder items by critical path
- `/dev:plan` - Auto-suggest task dependencies
- `/pm:tasks` - Pre-populate task list in optimal order
- `/pm:standup` - Report progress toward critical path

## Output Formats

- **Mermaid diagram** - Visual dependency graph
- **Markdown table** - Task order with estimates
- **Critical path analysis** - Where bottlenecks are
- **JSON** - Programmatic dependency data

## Notes

- Updates daily from project backlog
- Learns velocity from completed work
- Adjusts estimates based on historical data
- Flags impossible deadlines
- Suggests parallel work to reduce timeline
