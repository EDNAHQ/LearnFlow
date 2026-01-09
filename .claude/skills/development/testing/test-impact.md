---
name: test-impact
description: Use when you want to run only the tests affected by recent code changes for faster TDD feedback
---

# Test Impact Analysis

## Overview

Determine which tests are affected by your code changes and run only those tests. Dramatically speeds up the TDD feedback loop in large codebases.

**Core principle:** Run what matters, skip what doesn't.

## When to Use

- During TDD cycles (run affected tests after each change)
- Before committing (verify affected tests pass)
- In CI for fast feedback on PRs
- When working on a specific feature area

## Quick Start

```bash
node .claude/scripts/test-impact.js
```

Output:
```
🔍 Test Impact Analysis

📝 8 file(s) changed
📋 150 test file(s) in project

──────────────────────────────────────────────────

🎯 3 test(s) affected (98% skipped)

Affected tests:
  • src/auth/__tests__/login.test.ts
  • src/auth/__tests__/session.test.ts
  • src/utils/__tests__/validation.test.ts

⏱️  Analysis completed in 0.45s

💡 To run affected tests:
   node test-impact.js --run
```

## Usage

### Analyze and Run

```bash
# Find and run affected tests
node .claude/scripts/test-impact.js --run
```

### Compare Against Different Refs

```bash
# Since last commit (default)
node .claude/scripts/test-impact.js --since=HEAD~1

# Since main branch
node .claude/scripts/test-impact.js --since=main

# Since a specific commit
node .claude/scripts/test-impact.js --since=abc123

# Since yesterday
node .claude/scripts/test-impact.js --since="@{yesterday}"
```

### Staged Changes Only

```bash
# Only consider what you're about to commit
node .claude/scripts/test-impact.js --staged --run
```

### Verbose Mode

```bash
# See detailed dependency analysis
node .claude/scripts/test-impact.js --verbose
```

Output:
```
📊 Building dependency graph...
  src/auth/__tests__/login.test.ts: 12 dependencies
  src/auth/__tests__/session.test.ts: 8 dependencies
  ...

🎯 Finding affected tests...
  src/auth/__tests__/login.test.ts: dependency changed (src/auth/validateCredentials.ts)
  src/auth/__tests__/session.test.ts: directly changed
```

### JSON Output

```bash
# For scripting/CI integration
node .claude/scripts/test-impact.js --format=json
```

```json
{
  "affected": [
    "src/auth/__tests__/login.test.ts",
    "src/auth/__tests__/session.test.ts"
  ],
  "total": 150,
  "skipped": 148,
  "changedFiles": ["src/auth/login.ts"],
  "analysisTime": "0.42s"
}
```

## How It Works

### 1. Identifies Changed Files

Uses git diff to find what changed:
- `--since=REF`: Compare against a git reference
- `--staged`: Only staged changes
- `--all`: All uncommitted changes

### 2. Finds All Test Files

Scans for files matching test patterns:
- `*.test.ts`, `*.test.tsx`
- `*.spec.ts`, `*.spec.tsx`
- `__tests__/**/*.ts`
- `test/**/*.ts`

### 3. Builds Dependency Graph

For each test file, traces all imports recursively to build a complete dependency tree.

### 4. Finds Affected Tests

A test is affected if:
- The test file itself changed
- Any file the test imports (directly or transitively) changed

## Integration with TDD Workflow

### Fast Feedback Loop

```bash
# Make a change
# Run affected tests only
node .claude/scripts/test-impact.js --all --run

# If green, stage and commit
git add .
node .claude/scripts/smart-commit.js
```

### Pre-Commit Verification

```bash
# Stage changes
git add .

# Run only tests affected by staged changes
node .claude/scripts/test-impact.js --staged --run

# If pass, commit
node .claude/scripts/smart-commit.js
```

### In CI Pipeline

```yaml
# Run affected tests for PRs
- name: Run Affected Tests
  run: |
    node .claude/scripts/test-impact.js --since=origin/main --run
```

## Supported Test Runners

| Runner | Auto-Detected | Flag |
|--------|---------------|------|
| Jest | ✅ | `--runner=jest` |
| Vitest | ✅ | `--runner=vitest` |
| Mocha | ✅ | `--runner=mocha` |
| AVA | ✅ | `--runner=ava` |

Detection is based on package.json dependencies and scripts.

## Options Reference

| Option | Description |
|--------|-------------|
| `--since=REF` | Git reference to compare against (default: HEAD~1) |
| `--staged` | Only analyze staged changes |
| `--all` | Analyze all uncommitted changes |
| `--format=list\|json` | Output format (default: list) |
| `--run` | Execute affected tests |
| `--runner=NAME` | Force specific test runner |
| `--verbose` | Show detailed analysis |

## Performance

| Project Size | Test Files | Analysis Time |
|--------------|------------|---------------|
| Small (< 100 files) | 20 | ~0.2s |
| Medium (100-500 files) | 50 | ~0.5s |
| Large (500-2000 files) | 150 | ~1-2s |
| Very Large (2000+) | 300+ | ~3-5s |

The script caches dependency parsing and skips node_modules.

## Example Scenarios

### Scenario 1: Small Change

```
Changed: src/utils/formatDate.ts

Affected tests:
  • src/utils/__tests__/formatDate.test.ts
  • src/components/__tests__/DatePicker.test.ts

Result: 2 of 150 tests run (99% skipped)
```

### Scenario 2: Core Module Change

```
Changed: src/core/api.ts

Affected tests:
  • src/api/__tests__/*.test.ts (12 files)
  • src/features/**/__tests__/*.test.ts (25 files)

Result: 37 of 150 tests run (75% skipped)
```

### Scenario 3: Config Change

```
Changed: jest.config.js

Affected tests:
  • All tests (configuration affects everything)

Result: 150 of 150 tests run (0% skipped)
Recommendation: Run full suite for config changes
```

## Limitations

- Doesn't track dynamic imports with variables
- Doesn't follow TypeScript path aliases (uses relative paths)
- Assumes changed test files need to run
- Doesn't detect runtime-only dependencies

## Tips

### Combine with watch mode

For even faster TDD, use with watch:

```bash
# Initial analysis to see scope
node .claude/scripts/test-impact.js --verbose

# Then use runner's watch on those files
npx jest --watch src/auth/__tests__/login.test.ts
```

### Before Big Merges

Check impact before merging a feature branch:

```bash
# See what tests will be affected by this branch
node .claude/scripts/test-impact.js --since=main --verbose
```

### CI Optimization

Only run full suite on main, affected on PRs:

```yaml
- if: github.ref == 'refs/heads/main'
  run: npm test

- if: github.event_name == 'pull_request'
  run: node .claude/scripts/test-impact.js --since=origin/main --run
```

