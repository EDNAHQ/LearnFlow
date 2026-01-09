---
name: health-checks
description: Use at session start to scan all projects for issues before they become emergencies
---

# Automated Health Checks

## Overview

At the start of any session, quickly scan all projects for problems. Catch issues before they surprise you.

**Core principle:** Know the state of everything before deciding what to work on.

## Health Check Report

```
"Run health checks on all projects"

→ Scans each project
→ Reports issues found
→ Prioritizes what needs attention
```

## What Gets Checked

### 1. Build Status

```bash
npm run build  # or equivalent
```

| Result | Status |
|--------|--------|
| Builds successfully | ✅ Healthy |
| Build warnings | ⚠️ Warning |
| Build fails | ❌ Broken |

### 2. Test Status

```bash
npm test
```

| Result | Status |
|--------|--------|
| All tests pass | ✅ Healthy |
| Some tests skip | ⚠️ Warning |
| Tests failing | ❌ Broken |

### 3. Dependencies

```bash
npm audit
npm outdated
```

| Result | Status |
|--------|--------|
| No issues | ✅ Healthy |
| Outdated deps | ⚠️ Warning |
| Security vulnerabilities | ❌ Critical |

### 4. Git Status

```bash
git status
git log -1 --format="%ar"  # Last commit time
```

| Result | Status |
|--------|--------|
| Clean, recent commits | ✅ Healthy |
| Uncommitted changes | ⚠️ Warning |
| No commits in 30+ days | ⚠️ Stale |
| Merge conflicts | ❌ Broken |

### 5. Environment

```bash
# Check .env exists and has values
# Check required services reachable
```

| Result | Status |
|--------|--------|
| All configured | ✅ Healthy |
| Missing optional vars | ⚠️ Warning |
| Missing required vars | ❌ Broken |

## Health Report Format

```markdown
# Project Health Report

**Generated:** 2025-12-22 09:00
**Projects scanned:** 8

---

## 🚨 Critical Issues (fix now)

### app-2: Build Failing
- **Issue:** TypeScript error in src/api/users.ts:45
- **Since:** 2 days ago (commit abc123)
- **Impact:** Cannot deploy
- **Action:** Fix type error

### app-5: Security Vulnerability
- **Issue:** Critical vulnerability in lodash < 4.17.21
- **Severity:** High (remote code execution)
- **Action:** Run `npm audit fix`

---

## ⚠️ Warnings (address soon)

### app-1: Outdated Dependencies
- **Issue:** 5 packages outdated (2 major versions behind)
- **Risk:** Missing security patches
- **Action:** Run `npm update` when time permits

### app-3: Stale Project
- **Issue:** No commits in 45 days
- **Last commit:** 2025-11-07
- **Action:** Review if still active

### app-4: Uncommitted Changes
- **Issue:** 3 files modified, not committed
- **Files:** src/config.ts, .env.local, package.json
- **Action:** Commit or stash

---

## ✅ Healthy Projects

| Project | Build | Tests | Deps | Git |
|---------|-------|-------|------|-----|
| app-1   | ✅    | ✅    | ⚠️   | ✅  |
| app-6   | ✅    | ✅    | ✅   | ✅  |
| app-7   | ✅    | ✅    | ✅   | ✅  |
| app-8   | ✅    | ✅    | ✅   | ✅  |

---

## Summary

- **Critical:** 2 projects need immediate attention
- **Warnings:** 3 projects have minor issues
- **Healthy:** 4 projects are good

**Recommendation:** Fix app-2 build first (blocking), then app-5 security issue.
```

## Quick Health Check

For faster scanning:

```
"Quick health check"

→ Build + test only (skip deep analysis)
→ 30 seconds per project vs 2 minutes
```

```markdown
# Quick Health Check

| Project | Build | Tests | Status |
|---------|-------|-------|--------|
| app-1   | ✅    | ✅    | Healthy |
| app-2   | ❌    | -     | BROKEN |
| app-3   | ✅    | ✅    | Healthy |
| app-4   | ✅    | ⚠️ 2 skip | Warning |
| app-5   | ✅    | ✅    | Healthy |
| app-6   | ✅    | ✅    | Healthy |
| app-7   | ✅    | ✅    | Healthy |
| app-8   | ✅    | ✅    | Healthy |

**Needs attention:** app-2 (build broken)
```

## Single Project Health

Check one project in depth:

```
"Health check app-2"
```

```markdown
# Health Check: app-2

**Path:** C:\projects\app-2
**Checked:** 2025-12-22 09:15

## Build
❌ **FAILING**
```
error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
  src/api/users.ts:45:12
```

## Tests
⏭️ **SKIPPED** (build must pass first)

## Dependencies
⚠️ **3 vulnerabilities**
- 1 critical (lodash)
- 2 moderate (axios, webpack)

Run: `npm audit fix`

## Git
✅ **Clean**
- Branch: main
- Last commit: 2 hours ago
- No uncommitted changes

## Environment
✅ **Configured**
- .env exists
- All required vars present

## Summary
**Status:** ❌ Broken
**Primary issue:** Build failing due to type error
**Action:** Fix src/api/users.ts:45
```

## Scheduled Health Checks

Run automatically at key times:

| When | Type | Purpose |
|------|------|---------|
| Session start | Quick | Catch overnight issues |
| Before AFK work | Full | Ensure projects are workable |
| Weekly (Monday) | Full + deps | Catch stale issues |

## Health Check Script

Create `.claude/scripts/health-check.js` for faster execution:

```javascript
// Quick health check across projects
const projects = [
  'C:/projects/app-1',
  'C:/projects/app-2',
  // ... etc
];

async function checkProject(path) {
  const results = {
    path,
    build: await runCommand('npm run build', path),
    test: await runCommand('npm test', path),
    audit: await runCommand('npm audit --json', path),
    git: await runCommand('git status --porcelain', path),
  };
  return results;
}

// Run all checks in parallel
const results = await Promise.all(projects.map(checkProject));
```

## Integration

Use with:
- **smart-prioritization**: Health issues become high priority
- **multi-project-dashboard**: Show health status in dashboard
- **delegation-queue**: Don't queue work for broken projects
- **dependency-scout**: Deeper dive on specific project

## Fixing Common Issues

### Build Failing

```
1. Read the error message
2. Go to the file/line mentioned
3. Fix the issue
4. Re-run build to verify
```

### Security Vulnerabilities

```
1. Run: npm audit
2. Try: npm audit fix
3. If breaking changes: npm audit fix --force (careful)
4. Or manually update specific packages
```

### Stale Project

```
1. Check if project is still needed
2. If yes: review and update
3. If no: archive or mark inactive
```

### Uncommitted Changes

```
1. Review what changed
2. Commit if intentional
3. Stash if work in progress
4. Discard if accidental
```

