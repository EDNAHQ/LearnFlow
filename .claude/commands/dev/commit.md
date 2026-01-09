---
description: Commit and push changes to EDNAHQ/Command-Center
arguments:
  - name: message_hint
    description: "Optional hint about what changed (e.g., 'add dark mode')"
    required: false
---

Commit staged changes to the current branch and push to EDNAHQ/Command-Center.

**Steps:**
1. Run `git status` and `git diff --cached` to see staged changes
2. If nothing staged, stage unstaged changes automatically
3. Analyze the changes to understand:
   - What type of change (feat/fix/refactor/docs/test/chore)
   - What components are affected
   - Why the change was made
4. Generate conventional commit message
5. Commit directly (no approval needed)
6. Push to current branch on `edna` remote (github.com/EDNAHQ/Command-Center)

**Commit message format:**
```
<type>(<scope>): <short description>

<body explaining why, not what>

🤖 Generated with Claude Code

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

**Commit types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring
- `docs`: Documentation
- `test`: Adding tests
- `chore`: Maintenance

**Remote:** Always push to `edna` (https://github.com/EDNAHQ/Command-Center.git)
