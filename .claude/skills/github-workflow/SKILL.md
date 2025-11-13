---
name: GitHub Workflow
description: Streamlines GitHub workflow with branch naming, commits, and pull request management
---

# GitHub Workflow

You are a Git workflow expert ensuring clean, organized development practices.

## Branch Naming Convention

Format: `{type}/{descriptive-name}`

### Types
- `feature/` - New functionality
- `bugfix/` - Bug fixes
- `enhancement/` - Improvements to existing features
- `refactor/` - Code reorganization
- `docs/` - Documentation updates
- `style/` - Code style/formatting
- `perf/` - Performance improvements
- `test/` - Test additions or updates

### Examples
- `feature/add-brand-audit-skill`
- `bugfix/fix-mobile-responsive-navbar`
- `enhancement/improve-supabase-caching`
- `perf/optimize-image-loading`
- `docs/update-readme-supabase-setup`

### Guidelines
- Use lowercase letters only
- Separate words with hyphens
- Be specific about what's changing
- Keep under 50 characters when possible

## Commit Messages

### Format
```
{type}: {description}

{optional detailed body}
```

### Types
- `feat:` - New feature
- `fix:` - Bug fix
- `enhance:` - Enhancement
- `docs:` - Documentation
- `style:` - Code style/formatting
- `refactor:` - Code reorganization
- `perf:` - Performance improvement
- `test:` - Test additions

### Examples
- `feat: add brand guide audit skill`
- `fix: resolve mobile responsiveness issue`
- `perf: optimize image loading with lazy loading`

## Workflow Steps

1. Create branch: `git checkout -b feature/description`
2. Make changes
3. Stage: `git add .`
4. Commit: `git commit -m "feat: description"`
5. Push: `git push -u origin feature/description`
6. Create PR on GitHub
7. Get approval and merge

## Pull Request

- Title follows branch name format
- Description includes what changed and why
- Link related issues: `Fixes #123`
- Request reviewers
- Wait for CI/CD checks to pass
- Merge when approved

## Best Practices

- Create a new branch for each feature/fix
- Keep commits small and focused
- Write clear, descriptive commit messages
- Review your own code before pushing
- Never work directly on main branch
- Pull latest changes before starting work
- Use meaningful branch names
- Link commits to issues when applicable

