# Skill & Command Index

> **Auto-generated** - Do not edit manually. Run `node .claude/scripts/generate-skill-index.js` to regenerate.
>
> Last updated: 2025-12-22

Alphabetical quick-reference for all skills and commands. Use Ctrl+F to find what you need.

**Total: 48 skills, 20 commands**

---

## Commands

| Command | Category | Description |
|---------|----------|-------------|
| `/dev:brainstorm` | dev | What to brainstorm about |
| `/dev:commit` | dev | Optional hint about what changed |
| `/dev:debug` | dev | Description of the bug or issue |
| `/dev:parallel` | dev | Comma-separated list of tasks, or 'auto' to auto-detect parallelizable work |
| `/dev:plan` | dev | Path to plan file, 'new <name>' to create, or 'list' to show plans |
| `/dev:review` | dev | Optional: file path, 'staged', 'branch', or leave empty for unstaged changes |
| `/dev:verify` | dev | What to verify: 'commit', 'pr', 'release', or leave empty for general |
| `/dev:worktrees` | dev | Show git worktree status dashboard |
| `/pm:board` | pm | Optional: 'move <id> <status>' or 'archive' or leave empty to view |
| `/pm:dashboard` | pm | Cross-project dashboard overview |
| `/pm:idea` | pm | The idea to capture (optional: prefix with p0-p3 for priority, @project for tagging) |
| `/pm:standup` | pm | Number of days to look back (default: 1) |
| `/pm:status` | pm | Show project status overview |
| `/pm:switch` | pm | Project name or path to switch to (leave empty to list projects) |
| `/pm:tasks` | pm | Command: list/add/start/done/block/show (default: list doing items) |
| `/utils:edna` | utils | Show EDNA Command Center overview - all skills, commands, and capabilities |
| `/utils:image` | utils | Description of the image to generate |
| `/utils:research` | utils | What to research |
| `/utils:transcribe` | utils | Path to audio/video file |
| `/utils:translate` | utils | Text to translate, or 'file:<path>' for file, optionally prefix with 'to:<lang>' |

---

## Skills

## A

| Skill | Category | One-Line Description |
|-------|----------|---------------------|
| `audio-generation` | integrations | Use when you need to create audio - voiceovers, narration, text-to-speech, or sound content |
| `autonomous-resilience` | runtime | Use when working autonomously to push through obstacles without stopping for human input |

## B

| Skill | Category | One-Line Description |
|-------|----------|---------------------|
| `brainstorming` | development/planning | Use before any creative work - creating features, building components, adding functionality. Explores user intent, requirements and design before implementation. |
| `bugfix` | workflows | Use when fixing any bug - complete workflow from report to verified fix |

## C

| Skill | Category | One-Line Description |
|-------|----------|---------------------|
| `capture-to-backlog` | project-management | Use when you have an idea for any project but don't want to lose focus on current work |
| `client-context` | project-management | Use to remember who each project is for and adjust approach accordingly |
| `code-review` | development/review | Use when completing tasks, implementing features, or before merging to verify work meets requirements. Also use when receiving feedback to evaluate and respond appropriately. |
| `codebase-context` | development/planning | Use to generate a structured summary of the codebase for new subagents or for quickly understanding project architecture |
| `completion-checklist` | runtime | Use before marking any task complete to verify it's actually done - requires running verification commands and confirming output before making any success claims |
| `context-refresh` | runtime | Use when context becomes polluted, confused, or too long—spawn fresh subagent with clean handoff |
| `cross-project-knowledge` | project-management | Use to capture and apply solutions across all your projects so you don't re-solve the same problems |

## D

| Skill | Category | One-Line Description |
|-------|----------|---------------------|
| `debugging` | development/coding | Use when encountering any bug, test failure, or unexpected behavior - requires root cause investigation before proposing fixes |
| `delegation-queue` | project-management | Use to queue up work across multiple projects that Claude will execute while you're away |
| `dependency-scout` | runtime | Use before starting work to identify external dependencies that might block autonomous execution |

## E

| Skill | Category | One-Line Description |
|-------|----------|---------------------|
| `env-validator` | development/coding | Use before starting work to validate all required environment variables are properly configured |
| `error-recovery-loop` | runtime | Use when encountering errors during autonomous work to systematically recover without human intervention |

## G

| Skill | Category | One-Line Description |
|-------|----------|---------------------|
| `git-worktrees` | development/git | Use when starting feature work that needs isolation from current workspace or before executing implementation plans |

## H

| Skill | Category | One-Line Description |
|-------|----------|---------------------|
| `health-checks` | runtime | Use at session start to scan all projects for issues before they become emergencies |

## I

| Skill | Category | One-Line Description |
|-------|----------|---------------------|
| `idea-capture` | project-management | Use when user says /idea or wants to quickly capture an idea, thought, or task |
| `image-generation` | integrations | Use when you need to create images - hero images, icons, placeholders, marketing assets, or visual content |

## K

| Skill | Category | One-Line Description |
|-------|----------|---------------------|
| `kanban-board` | project-management | Use when user says /board or wants to see a visual kanban view of their tasks and ideas |

## M

| Skill | Category | One-Line Description |
|-------|----------|---------------------|
| `multi-project-dashboard` | project-management | Use when you want to see status across all your projects at once |

## N

| Skill | Category | One-Line Description |
|-------|----------|---------------------|
| `new-feature` | workflows | Use when implementing a new feature from scratch - complete workflow from idea to deployment |

## P

| Skill | Category | One-Line Description |
|-------|----------|---------------------|
| `parallel-agents` | workflows | Use when facing 2+ independent tasks that can be worked on without shared state or sequential dependencies |
| `parallel-execution` | runtime | Use when multiple independent tasks can be worked on simultaneously by separate subagents |
| `plan-execution` | development/planning | Use when you have a spec or requirements for a multi-step task - covers both writing detailed implementation plans and executing them with review checkpoints |
| `prepare-autonomous-execution` | runtime | Use when setting up work that should run without interruption while you're away from your desk |
| `proactive-optimization` | runtime | Use after completing features to identify and apply obvious improvements without being asked |
| `progress-heartbeat` | runtime | Use during long autonomous work to maintain visible progress and catch stalls early |
| `project-status` | project-management | Use at the start of any session to understand current project state and resume work |
| `project-templates` | project-management | Use when creating new code to apply consistent patterns across all projects |

## R

| Skill | Category | One-Line Description |
|-------|----------|---------------------|
| `rollback-ready` | runtime | Use to maintain safe rollback points throughout autonomous work so you can always recover |

## S

| Skill | Category | One-Line Description |
|-------|----------|---------------------|
| `skill-authoring` | meta | Use when creating new skills, editing existing skills, or verifying skills work before deployment |
| `skill-usage` | workflows | Use when starting any conversation - establishes how to find and use skills, requiring skill check before ANY response including clarifying questions |
| `smart-commit` | development/git | Use when committing changes to automatically generate meaningful conventional commit messages |
| `smart-prioritization` | project-management | Use when deciding what to work on to focus on highest-impact tasks across all projects |
| `standup-generator` | project-management | Use to auto-generate daily or weekly summaries of progress across all projects |
| `subagent-development` | development/subagents | Use when executing implementation plans with independent tasks in the current session - dispatches fresh subagent per task with two-stage review |

## T

| Skill | Category | One-Line Description |
|-------|----------|---------------------|
| `task-decomposition` | runtime | Use when a task feels too big or complex—break it into smaller, achievable pieces |
| `task-manager` | project-management | Use when user says /tasks or wants to manage tasks - add, start, complete, block, or list items |
| `tdd` | development/testing | Use when implementing any feature or bugfix - requires writing test first, watching it fail, then writing minimal code to pass |
| `test-impact` | development/testing | Use when you want to run only the tests affected by recent code changes for faster TDD feedback |
| `transcription` | integrations | Use when you need to convert audio or video to text - meetings, interviews, podcasts, or any spoken content |
| `translation` | integrations | Use when you need to translate content - UI strings, documentation, or any text between languages |

## V

| Skill | Category | One-Line Description |
|-------|----------|---------------------|
| `verification` | development/testing | Use when about to claim work is complete or when finishing a development branch - requires running verification commands and presenting completion options |
| `visual-feedback-loop` | runtime | Use when building UI/frontend features to continuously verify changes visually in the browser |

## W

| Skill | Category | One-Line Description |
|-------|----------|---------------------|
| `web-research` | integrations | Use when you need real-time information from the web - current docs, recent changes, latest practices |
| `worktree-dashboard` | development/git | Use to see status of all git worktrees when managing parallel development branches |

---

## By Tag

### 🔴 Rigid Skills (Follow Exactly)
- `tdd` - Use when implementing any feature or bugfix - requires writing test first, watching it fail, then writing minimal code to pass
- `debugging` - Use when encountering any bug, test failure, or unexpected behavior - requires root cause investigation before proposing fixes
- `skill-usage` - Use when starting any conversation - establishes how to find and use skills, requiring skill check before ANY response including clarifying questions

### 🟢 Flexible Skills (Adapt to Context)
- `task-decomposition` - Use when a task feels too big or complex—break it into smaller, achievable pieces
- `brainstorming` - Use before any creative work - creating features, building components, adding functionality
- `project-templates` - Use when creating new code to apply consistent patterns across all projects

### 🤖 Autonomous-Critical
Skills essential for AFK work:
- `prepare-autonomous-execution`
- `autonomous-resilience`
- `error-recovery-loop`
- `progress-heartbeat`
- `rollback-ready`

### 🔌 External APIs Required
- `image-generation` - OPENAI_API_KEY or REPLICATE_API_TOKEN
- `audio-generation` - OPENAI_API_KEY or ELEVENLABS_API_KEY
- `transcription` - OPENAI_API_KEY or ASSEMBLYAI_API_KEY
- `web-research` - TAVILY_API_KEY or PERPLEXITY_API_KEY
- `translation` - DEEPL_API_KEY or GOOGLE_TRANSLATE_API_KEY

### 📜 Has Companion Script
- `env-validator` → `scripts/env-validator.js`
- `smart-commit` → `scripts/smart-commit.js`
- `test-impact` → `scripts/test-impact.js`
- `codebase-context` → `scripts/codebase-context.js`
- `worktree-dashboard` → `scripts/worktree-dashboard.js`
- `visual-feedback-loop` → `scripts/screenshot.js`
- `image-generation` → `scripts/apis/generate-image.js`
- `audio-generation` → `scripts/apis/generate-audio.js`
- `transcription` → `scripts/apis/transcribe.js`
- `web-research` → `scripts/apis/search-web.js`
- `translation` → `scripts/apis/translate.js`

---

## Quick Decision Tree

```
What do I need?
│
├─ Starting work on a project?
│  └─ project-status → dependency-scout → prepare-autonomous-execution
│
├─ Building a new feature?
│  └─ brainstorming → task-decomposition → tdd → verification
│
├─ Fixing a bug?
│  └─ debugging → root-cause-tracing → tdd → verification
│
├─ Working AFK/autonomously?
│  └─ prepare-autonomous-execution → autonomous-resilience → error-recovery-loop
│
├─ Stuck on an error?
│  └─ error-recovery-loop → context-refresh (if confused)
│
├─ Need external capability?
│  └─ Check integrations/ (image, audio, transcription, web, translation)
│
└─ Managing multiple projects?
   └─ multi-project-dashboard → smart-prioritization → delegation-queue
```

---

## All Categories

### development/coding
- `debugging`
- `env-validator`

### development/git
- `git-worktrees`
- `smart-commit`
- `worktree-dashboard`

### development/planning
- `brainstorming`
- `codebase-context`
- `plan-execution`

### development/review
- `code-review`

### development/subagents
- `subagent-development`

### development/testing
- `tdd`
- `test-impact`
- `verification`

### integrations
- `audio-generation`
- `image-generation`
- `transcription`
- `translation`
- `web-research`

### meta
- `skill-authoring`

### project-management
- `capture-to-backlog`
- `client-context`
- `cross-project-knowledge`
- `delegation-queue`
- `idea-capture`
- `kanban-board`
- `multi-project-dashboard`
- `project-status`
- `project-templates`
- `smart-prioritization`
- `standup-generator`
- `task-manager`

### runtime
- `autonomous-resilience`
- `completion-checklist`
- `context-refresh`
- `dependency-scout`
- `error-recovery-loop`
- `health-checks`
- `parallel-execution`
- `prepare-autonomous-execution`
- `proactive-optimization`
- `progress-heartbeat`
- `rollback-ready`
- `task-decomposition`
- `visual-feedback-loop`

### workflows
- `bugfix`
- `new-feature`
- `parallel-agents`
- `skill-usage`

