---
name: dependency-scout
description: Use before starting work to identify external dependencies that might block autonomous execution
---

# Dependency Scout

## Overview

Before diving into work, **scout for blockers**. Identify external dependencies, missing credentials, unavailable services—anything that would stop you mid-task.

**Core principle:** Find blockers before they find you.

## When to Scout

- Before starting any autonomous session
- Before starting a new major task
- When a task involves external services
- When working on unfamiliar parts of the codebase

## The Scout Checklist

### 1. External Services

```
□ APIs the task needs - Are they accessible?
□ Databases - Can you connect?
□ Third-party services (Stripe, Auth0, etc.) - Configured?
□ External URLs - Are they reachable?
```

### 2. Credentials & Secrets

```
□ API keys present in .env?
□ Database connection strings?
□ OAuth credentials?
□ Service account keys?
□ Any placeholders like "YOUR_API_KEY_HERE"?
```

### 3. Development Environment

```
□ Required tools installed? (node, python, docker, etc.)
□ Correct versions? (check .nvmrc, package.json engines)
□ Dependencies installed? (node_modules, venv)
□ Dev server starts without errors?
```

### 4. Build & Test

```
□ Project builds successfully?
□ Tests pass before starting?
□ No blocking linter errors?
```

### 5. Permissions

```
□ File system access needed?
□ Network access needed?
□ Command execution allowed?
□ Git push access?
```

## Scout Report Template

Before starting, write a quick scout report:

```markdown
## Dependency Scout Report

**Task:** [Task being scouted for]
**Time:** [timestamp]

### External Services
- ✅ Database: Connected (PostgreSQL on localhost:5432)
- ✅ Redis: Connected (localhost:6379)
- ⚠️ Stripe: API key present but not tested
- ❌ SendGrid: No API key in .env

### Environment
- ✅ Node 18.17.0 (matches .nvmrc)
- ✅ Dependencies installed
- ✅ Dev server starts

### Build & Test
- ✅ Build passes
- ✅ 45/45 tests passing

### Blockers Found
1. **SendGrid API key missing**
   - Needed for: Email sending in Task 4
   - Impact: Can skip Task 4, do others first
   - Resolution: Need human to add key

### Recommendations
- Start with Tasks 1-3 (no email dependency)
- Flag Task 4 for when email is configured
- Proceed with autonomous execution
```

## Quick Scout (5 Minute Version)

For smaller tasks or familiar codebases:

```bash
# 1. Check environment
node --version  # or python, etc.
npm run build   # Does it build?
npm test        # Do tests pass?

# 2. Check .env
cat .env | grep -E "^[A-Z].*=.+$" | wc -l  # Are there values?

# 3. Check dev server
npm run dev &   # Does it start?
curl localhost:3000  # Does it respond?
```

If all pass → Good to go.

## Service-Specific Scouts

### Database Scout

```bash
# PostgreSQL
psql $DATABASE_URL -c "SELECT 1"

# MySQL
mysql -e "SELECT 1"

# MongoDB
mongosh --eval "db.runCommand({ping:1})"
```

### API Scout

```bash
# Check if API is reachable
curl -s -o /dev/null -w "%{http_code}" https://api.example.com/health

# Check if API key works
curl -H "Authorization: Bearer $API_KEY" https://api.example.com/me
```

### Docker Scout

```bash
# Check Docker running
docker info > /dev/null 2>&1 && echo "Docker OK"

# Check required images
docker images | grep -E "postgres|redis|nginx"

# Check containers running
docker ps
```

## Handling Found Blockers

### Can Work Around

```
Blocker: Stripe not configured
Workaround: Mock Stripe responses for now
Action: Continue with mock, flag for real integration later
```

### Can Skip

```
Blocker: SendGrid not configured  
Task affected: Task 4 (email notifications)
Action: Do Tasks 1-3, skip Task 4, note for human
```

### Cannot Proceed

```
Blocker: Database not accessible
Impact: All tasks require database
Action: STOP - document issue, request human help
```

## Pre-Flight Integration

Use with **prepare-autonomous-execution**:

```markdown
## Pre-Flight Checklist

### 1. Scout Complete
- [ ] Ran dependency scout
- [ ] All critical services accessible
- [ ] Credentials verified
- [ ] Blockers documented

### 2. Blocker Handling
- Tasks to skip: [list]
- Tasks to proceed: [list]
- Workarounds in place: [list]

### 3. Ready to Execute
- [ ] Environment clean
- [ ] Tests passing
- [ ] Scout report saved
```

## Example: Full Scout

```markdown
## Dependency Scout Report

**Task:** Build user notification system
**Time:** 2025-12-21 14:00

### Service Check

| Service | Status | Notes |
|---------|--------|-------|
| PostgreSQL | ✅ | localhost:5432, connected |
| Redis | ✅ | localhost:6379, connected |
| SendGrid | ❌ | SENDGRID_API_KEY not set |
| Twilio | ⚠️ | Key present, not verified |
| AWS S3 | ✅ | Credentials work |

### Environment Check

| Item | Status | Notes |
|------|--------|-------|
| Node version | ✅ | 18.17.0 (matches) |
| npm install | ✅ | No errors |
| Build | ✅ | 0 errors |
| Tests | ✅ | 52/52 passing |
| Linting | ⚠️ | 3 warnings (non-blocking) |

### Blockers

1. **SendGrid not configured**
   - Tasks affected: Task 5 (email notifications)
   - Workaround: Skip email, do push notifications only
   - Or: Mock email service for testing

2. **Twilio unverified**
   - Tasks affected: Task 6 (SMS notifications)
   - Action: Test before starting Task 6
   - Fallback: Skip if doesn't work

### Execution Plan

- Proceed with Tasks 1-4 (no external email/SMS)
- Task 5: Skip email, implement push only
- Task 6: Attempt Twilio, skip if fails
- Flag email/SMS for human follow-up

### Ready to Execute: ✅
```

This catches blockers BEFORE you hit them mid-task.

