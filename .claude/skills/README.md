# Custom Skills Library

Skills for autonomous, productive Claude work across multiple projects.

## Quick Reference

| Need To... | Use Skill |
|------------|-----------|
| Work while human is away | `autonomy/prepare-autonomous-execution` |
| Push through uncertainty | `autonomy/autonomous-resilience` |
| Fix errors without stopping | `autonomy/error-recovery-loop` |
| Clear confused context | `autonomy/context-refresh` |
| Break down big tasks | `execution/task-decomposition` |
| Run tasks in parallel | `execution/parallel-execution` |
| Verify work is done | `execution/completion-checklist` |
| Quick improvements | `execution/proactive-optimization` |
| Track progress visibly | `monitoring/progress-heartbeat` |
| See UI changes | `monitoring/visual-feedback-loop` |
| Find blockers early | `monitoring/dependency-scout` |
| Always be able to undo | `monitoring/rollback-ready` |
| See project state | `project-management/project-status` |
| See all projects | `project-management/multi-project-dashboard` |
| Capture ideas quickly | `project-management/capture-to-backlog` |
| Apply consistent patterns | `scaling/project-templates` |
| Reuse solutions | `scaling/cross-project-knowledge` |
| Know what to work on | `scaling/smart-prioritization` |
| Queue work for later | `scaling/delegation-queue` |
| Remember project context | `scaling/client-context` |
| Check all projects health | `monitoring/health-checks` |
| Generate progress reports | `project-management/standup-generator` |
| Generate images | `integrations/image-generation` |
| Generate audio/speech | `integrations/audio-generation` |
| Transcribe audio to text | `integrations/transcription` |
| Search the web | `integrations/web-research` |
| Translate content | `integrations/translation` |
| Validate environment vars | `environment/env-validator` |
| Generate smart commits | `git-automation/smart-commit` |
| Run only affected tests | `testing-tools/test-impact` |
| Understand codebase | `code-intelligence/codebase-context` |
| See worktree status | `git-automation/worktree-dashboard` |

---

## Categories

### 🤖 Autonomy
*Working independently without human intervention*

| Skill | Purpose |
|-------|---------|
| `autonomous-resilience` | Make decisions, push through uncertainty, don't wait for human |
| `error-recovery-loop` | Systematically debug and fix errors (try 5 approaches before giving up) |
| `context-refresh` | When context is polluted, hand off to fresh subagent cleanly |
| `prepare-autonomous-execution` | Pre-flight checklist before AFK work |

### ⚡ Execution
*Getting work done efficiently*

| Skill | Purpose |
|-------|---------|
| `task-decomposition` | Break big tasks into 15-30 minute pieces |
| `parallel-execution` | Run independent tasks simultaneously with multiple subagents |
| `completion-checklist` | Verify "done" means actually done |
| `proactive-optimization` | Quick improvements after completing tasks |

### 📊 Monitoring
*Tracking progress and catching issues*

| Skill | Purpose |
|-------|---------|
| `progress-heartbeat` | Log progress every 15 min, catch stalls early |
| `visual-feedback-loop` | Screenshot and verify UI changes visually |
| `dependency-scout` | Find blockers (missing APIs, credentials) before starting |
| `rollback-ready` | Maintain safe rollback points, enable bold changes |
| `health-checks` | Scan all projects for issues at session start |

### 📁 Project Management
*Organizing across multiple projects*

| Skill | Purpose |
|-------|---------|
| `project-status` | Quick status when opening a project |
| `multi-project-dashboard` | See all projects at once |
| `capture-to-backlog` | Capture ideas without losing focus |
| `standup-generator` | Auto-generate daily/weekly summaries |

### 🚀 Scaling
*Multiply your output across projects*

| Skill | Purpose |
|-------|---------|
| `project-templates` | Your patterns applied consistently everywhere |
| `cross-project-knowledge` | Solutions from one project help all others |
| `smart-prioritization` | Always work on the highest-impact task |
| `delegation-queue` | Queue work to execute while you're away |
| `client-context` | Remember who each project is for |

### 🔌 Integrations
*Extend capabilities with external APIs*

| Skill | Purpose |
|-------|---------|
| `image-generation` | Generate images (DALL-E, Stable Diffusion) |
| `audio-generation` | Generate speech (OpenAI TTS, ElevenLabs) |
| `transcription` | Convert audio to text (Whisper, AssemblyAI) |
| `web-research` | Search for real-time info (Tavily, Perplexity) |
| `translation` | Translate content (DeepL, Google) |

### 🔧 Environment
*Configuration and setup validation*

| Skill | Purpose |
|-------|---------|
| `env-validator` | Validate all required environment variables are set |

### 🔀 Git Automation
*Streamlined git workflows*

| Skill | Purpose |
|-------|---------|
| `smart-commit` | Auto-generate conventional commit messages from diff |
| `worktree-dashboard` | See status of all git worktrees at a glance |

### 🧪 Testing Tools
*Faster, smarter testing*

| Skill | Purpose |
|-------|---------|
| `test-impact` | Run only tests affected by code changes |

### 🧠 Code Intelligence
*Understanding and navigating codebases*

| Skill | Purpose |
|-------|---------|
| `codebase-context` | Generate structured summary for subagents or onboarding |

---

## Typical Workflows

### Starting an Autonomous Session

```
1. dependency-scout      → Find blockers early
2. prepare-autonomous-execution → Pre-flight checklist
3. rollback-ready        → Create safety tag
4. task-decomposition    → Break work into pieces
5. [Execute with other skills as needed]
```

### During Work

```
• autonomous-resilience  → Make decisions
• error-recovery-loop    → Fix problems
• progress-heartbeat     → Stay visible
• completion-checklist   → Verify each task
• proactive-optimization → Quick wins
```

### When Stuck

```
• error-recovery-loop    → Try 5 approaches
• context-refresh        → Fresh subagent if confused
• rollback-ready         → Undo and try differently
```

### Returning from AFK

```
1. project-status        → See what happened
2. multi-project-dashboard → Overview of all projects
3. Review progress-heartbeat logs
```

---

## Scripts

Located in `.claude/scripts/`:

### Visual Feedback
| Script | Purpose |
|--------|---------|
| `screenshot.js` | Capture browser screenshots |
| `setup-visual-feedback.js` | One-time setup for screenshots |

### Development Tools
| Script | Purpose |
|--------|---------|
| `env-validator.js` | Validate .env against .env.example |
| `smart-commit.js` | Generate conventional commits from git diff |
| `test-impact.js` | Find tests affected by code changes |
| `codebase-context.js` | Generate codebase summary for subagents |
| `worktree-dashboard.js` | Display status of all git worktrees |

### API Integrations (`scripts/apis/`)
| Script | Purpose | API Keys Needed |
|--------|---------|-----------------|
| `generate-image.js` | Create images | OPENAI_API_KEY or REPLICATE_API_TOKEN |
| `generate-audio.js` | Text-to-speech | OPENAI_API_KEY or ELEVENLABS_API_KEY |
| `transcribe.js` | Speech-to-text | OPENAI_API_KEY or ASSEMBLYAI_API_KEY |
| `search-web.js` | Web search | TAVILY_API_KEY or PERPLEXITY_API_KEY |
| `translate.js` | Translation | DEEPL_API_KEY or GOOGLE_TRANSLATE_API_KEY |

---

## Adding New Skills

1. Choose appropriate category folder
2. Create `skill-name.md` with frontmatter:
   ```yaml
   ---
   name: skill-name
   description: Use when [trigger condition]
   ---
   ```
3. Follow structure: Overview → When to Use → How to Use → Examples

