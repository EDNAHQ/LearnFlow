---
name: env-validator
description: Use before starting work to validate all required environment variables are properly configured
---

# Environment Validator

## Overview

Validate that all required environment variables are set before starting work. Catches missing API keys, database URLs, and other configuration issues before they cause runtime failures.

**Core principle:** Find missing configuration at pre-flight, not mid-task.

## When to Use

- Before starting any autonomous session
- After cloning a project
- When switching between environments (dev/staging/prod)
- As part of dependency-scout checklist
- When debugging "it works on my machine" issues

## Quick Start

```bash
node .claude/scripts/env-validator.js
```

Output:
```
📋 Environment Validation Report

   Template: .env.example
   Env File: .env

✅ Valid (8):
   DATABASE_URL
   REDIS_URL
   NODE_ENV
   PORT
   ...

❌ Missing (2):
   STRIPE_SECRET_KEY
      └─ Required for payment processing
   SENDGRID_API_KEY
      └─ Required for email sending

──────────────────────────────────────────────────

❌ 2 issue(s) found with 10 required variables
```

## Usage

### Basic Validation

```bash
node .claude/scripts/env-validator.js
```

### Strict Mode (Fail on Missing)

```bash
# Exit code 1 if any issues - useful for CI/scripts
node .claude/scripts/env-validator.js --strict
```

### Check for Empty Values

```bash
# Treat empty strings as missing
node .claude/scripts/env-validator.js --check-empty
```

### Show Values (Masked)

```bash
# See what's configured (secrets are masked)
node .claude/scripts/env-validator.js --show-values
```

Output:
```
✅ Valid (3):
   DATABASE_URL = postgres://localhost:5432/mydb
   API_KEY = sk-1****9f3c
   NODE_ENV = development
```

### Different Environments

```bash
# Validate production config
node .claude/scripts/env-validator.js --template=.env.production.example --env=.env.production
```

## Template File Format

Your `.env.example` should document all variables:

```bash
# Database connection (required)
DATABASE_URL=postgres://user:pass@localhost:5432/dbname

# Redis for caching (required)
REDIS_URL=redis://localhost:6379

# API Keys
STRIPE_SECRET_KEY=sk_test_xxx
SENDGRID_API_KEY=SG.xxx

# Optional - defaults will be used if not set
# (optional) Enable debug logging
DEBUG=false

# (optional) Custom port
PORT=3000
```

**Key features:**
- Comments above variables become descriptions
- `(optional)` in comment marks variable as optional
- Placeholder values (`xxx`, `your_`, etc.) are detected

## Integration with dependency-scout

Add to your scout checklist:

```markdown
## Dependency Scout Report

### Environment Check
- Run: `node .claude/scripts/env-validator.js --strict`
- Result: [PASS/FAIL]
- Missing: [list if any]
```

## Integration with CI

```yaml
# GitHub Actions example
- name: Validate Environment
  run: node .claude/scripts/env-validator.js --strict --check-empty
  env:
    # ... your env vars
```

## What It Detects

| Issue | Example | Detection |
|-------|---------|-----------|
| Missing variable | `STRIPE_KEY` not in .env | ❌ Missing |
| Empty value | `STRIPE_KEY=` | ⚠️ Empty (with --check-empty) |
| Placeholder | `STRIPE_KEY=your_key_here` | ⚠️ Placeholder |
| Secret exposure | Shows `sk_1234...` | Masked automatically |

## Placeholder Detection

The script recognizes common placeholder patterns:

- `your_api_key_here`
- `xxx` or `XXX`
- `<your-key>`
- `CHANGEME`
- `TODO`
- `placeholder`
- `example`

## Options Reference

| Option | Description |
|--------|-------------|
| `--template=FILE` | Template file (default: `.env.example`) |
| `--env=FILE` | Env file to validate (default: `.env`) |
| `--strict` | Exit code 1 on any issues |
| `--quiet` | Only show errors |
| `--show-values` | Show values (secrets masked) |
| `--check-empty` | Treat empty as missing |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All required variables present |
| 1 | Missing variables (with --strict) |
| 2 | Template file not found |

## Pre-Flight Checklist Integration

```markdown
## Pre-Flight Checklist

### Environment
- [ ] Run `node .claude/scripts/env-validator.js --strict`
- [ ] All required variables set
- [ ] No placeholder values
- [ ] Secrets properly configured
```

## Troubleshooting

### "Template file not found"

Create `.env.example` with all required variables:

```bash
# Copy from your .env and remove sensitive values
cp .env .env.example
# Then edit to replace secrets with placeholders
```

### "Looks like a placeholder"

Replace placeholder values with real credentials:

```bash
# Before
STRIPE_KEY=your_stripe_key_here

# After
STRIPE_KEY=sk_live_xxxxxxxxxxxxx
```

### Variables in .env but not in template

The script only checks variables listed in the template. Add missing variables to `.env.example` to track them.

