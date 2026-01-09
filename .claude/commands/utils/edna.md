---
description: Show EDNA Command Center overview - all skills, commands, and capabilities
arguments: []
---

# EDNA Command Center

Display a comprehensive summary of all available capabilities.

## Instructions

Generate a structured overview showing:

### 1. Quick Stats
Count and list:
- Total skills (from `.claude/skills/`)
- Total commands (from `.claude/commands/`)
- Total scripts (from `.claude/scripts/`)

### 2. Commands → Skills Mapping

Show all available slash commands and which skills they invoke:

| Command | Category | Invokes Skill | Description |
|---------|----------|---------------|-------------|
| `/brainstorm` | dev | brainstorming | Explore ideas before implementation |
| `/commit` | dev | smart-commit | Auto-generate meaningful commit messages |
| `/debug` | dev | debugging | Systematic bug investigation |
| `/plan` | dev | plan-execution | Create and execute implementation plans |
| `/review` | dev | code-review | Code review with checklist |
| `/verify` | dev | verification | Verify work is complete before claiming done |
| `/worktrees` | git | worktree-dashboard | Manage parallel development branches |
| `/board` | pm | kanban-board | Visual kanban view of tasks |
| `/idea` | pm | idea-capture | Quick capture ideas to backlog |
| `/standup` | pm | standup-generator | Generate progress summaries |
| `/status` | pm | project-status | Current project state overview |
| `/tasks` | pm | task-manager | Manage tasks (add/start/done/block) |
| `/image` | utils | image-generation | Create images via AI |
| `/research` | utils | web-research | Search web for current info |
| `/transcribe` | utils | transcription | Convert audio/video to text |
| `/translate` | utils | translation | Translate content between languages |
| `/edna` | utils | (this command) | Show this overview |

### 3. Skill Categories

List all skill categories with their skills:

**Core Development:**
- `development/` - brainstorming, git-worktrees, plan-execution, verification
- `development/code-review/` - code-review
- `development/debugging/` - debugging
- `development/tdd/` - tdd
- `development/skill-authoring/` - skill-authoring
- `development/subagent-development/` - subagent-development

**Autonomy & Execution:**
- `autonomy/` - autonomous-resilience, context-refresh, error-recovery-loop, prepare-autonomous-execution
- `execution/` - completion-checklist, parallel-execution, proactive-optimization, task-decomposition

**Monitoring & Safety:**
- `monitoring/` - dependency-scout, health-checks, progress-heartbeat, rollback-ready, visual-feedback-loop

**Project Management:**
- `project-management/` - capture-to-backlog, idea-capture, kanban-board, multi-project-dashboard, project-status, standup-generator, task-manager

**Scaling & Multi-Project:**
- `scaling/` - client-context, cross-project-knowledge, delegation-queue, project-templates, smart-prioritization

**Integrations (External APIs):**
- `integrations/` - audio-generation, image-generation, transcription, translation, web-research

**Workflows (End-to-End):**
- `workflows/` - bugfix, new-feature, parallel-agents, skill-usage

**Other:**
- `code-intelligence/` - codebase-context
- `environment/` - env-validator
- `git-automation/` - smart-commit, worktree-dashboard
- `testing-tools/` - test-impact

### 4. Scripts & APIs

List scripts that power skills:

**Development Scripts:**
- `codebase-context.js` - Generate codebase summaries
- `smart-commit.js` - Analyze changes for commit messages
- `test-impact.js` - Find tests affected by changes
- `env-validator.js` - Validate environment variables
- `worktree-dashboard.js` - Git worktree status

**API Integration Scripts:** (require API keys)
- `generate-image.js` - OpenAI/Replicate image generation
- `generate-audio.js` - OpenAI/ElevenLabs TTS
- `transcribe.js` - OpenAI/AssemblyAI transcription
- `search-web.js` - Tavily/Perplexity web search
- `translate.js` - DeepL/Google translation

**Utility Scripts:**
- `screenshot.js` - Capture screenshots for visual feedback
- `pm-utils.js` - Project management utilities
- `generate-skill-index.js` - Auto-generate SKILL-INDEX.md

### 5. Quick Reference

**Start a session:** `/status` → see where you left off

**Build something new:** `/brainstorm` → `/plan` → code → `/review` → `/verify` → `/commit`

**Fix a bug:** `/debug` → fix → `/review` → `/verify` → `/commit`

**Manage work:** `/tasks` to track, `/board` to visualize, `/standup` to summarize

**Need external help:** `/research` for web, `/image` for visuals, `/transcribe` for audio

---

*For the full skill index with descriptions, see `.claude/skills/SKILL-INDEX.md`*
