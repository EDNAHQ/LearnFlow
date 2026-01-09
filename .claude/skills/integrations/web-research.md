---
name: web-research
description: Use when you need real-time information from the web - current docs, recent changes, latest practices
---

# Web Research

## Overview

Search the web for real-time information using Tavily or Perplexity.

**Core principle:** Get current information when your training data might be outdated.

## When to Use

- Looking up current library documentation
- Finding recent best practices
- Checking latest version features
- Researching current API changes
- Getting up-to-date information
- Answering questions about recent events
- Validating approaches against current standards

## Setup

### API Keys Required

```bash
# For Tavily (search-focused)
TAVILY_API_KEY=tvly-...

# For Perplexity (AI-powered answers)
PERPLEXITY_API_KEY=pplx-...
```

### Script Location

```
.claude/scripts/apis/search-web.js
```

## Usage

### Basic

```bash
node .claude/scripts/apis/search-web.js "React 19 new features"
```

### With Options

```bash
# Include AI-generated answer
node search-web.js "Next.js 14 app router best practices" --include-answer

# Deep search (more thorough)
node search-web.js "TypeScript 5.3 changes" --depth=advanced

# More results
node search-web.js "Tailwind CSS v4" --max-results=10

# Use Perplexity (AI answers)
node search-web.js "latest Node.js LTS version" --provider=perplexity

# Save results
node search-web.js "Prisma vs Drizzle 2024" --output=orm-research.json
```

## Provider Comparison

| Feature | Tavily | Perplexity |
|---------|--------|------------|
| Type | Search engine | AI + Search |
| Results | Links + snippets | AI answer + sources |
| Best for | Raw research | Quick answers |
| Depth | Configurable | Single response |
| Cost | ~$0.01/search | ~$0.005/search |

### When to Use Which

| Need | Provider |
|------|----------|
| Quick factual answer | Perplexity |
| Multiple source comparison | Tavily |
| Documentation lookup | Tavily |
| "What's the best X" questions | Perplexity |
| Comprehensive research | Tavily (advanced) |

## Use Cases

### 1. Documentation Lookup

```bash
# Find current React Query docs
node search-web.js "TanStack Query v5 useQuery documentation"

# Result: Links to official docs and examples
```

### 2. Best Practices Research

```bash
# Find current recommendations
node search-web.js "React Server Components best practices 2024" --include-answer

# Result: AI summary + source links
```

### 3. Version Comparison

```bash
# Research migration
node search-web.js "Next.js 14 vs 15 differences" --depth=advanced

# Result: Detailed comparison from multiple sources
```

### 4. Troubleshooting

```bash
# Find solutions to errors
node search-web.js "TypeError Cannot read properties of undefined React hydration"

# Result: Stack Overflow, GitHub issues, blog solutions
```

### 5. Library Selection

```bash
# Research options
node search-web.js "best React form library 2024 comparison" --include-answer

# Result: Comparison of react-hook-form, formik, etc.
```

## Integration with Work

### When Building Features

```
Before implementing:

1. "Is there a newer/better way to do this?"
   $ node search-web.js "[feature] React best practices 2024"

2. "What's the current recommended library?"
   $ node search-web.js "best [type] library React 2024"

3. "How do others solve this?"
   $ node search-web.js "[specific problem] solution"
```

### When Debugging

```
When stuck:

1. Search the exact error message
   $ node search-web.js "[error message]"

2. Search the symptom
   $ node search-web.js "[what's happening] React"

3. Check for known issues
   $ node search-web.js "[library] [problem] GitHub issue"
```

### When Staying Current

```
Periodic checks:

$ node search-web.js "React 19 release notes"
$ node search-web.js "TypeScript latest features"
$ node search-web.js "Next.js breaking changes"
```

## Writing Good Queries

### DO:
- Include version numbers when relevant
- Add year for time-sensitive topics
- Be specific about technology stack
- Include "best practices" or "recommended" for advice

### DON'T:
- Use vague queries ("how to code better")
- Forget context ("useEffect" → "React useEffect cleanup")
- Skip version info for rapidly changing tech

### Examples

```bash
# ❌ Too vague
node search-web.js "react forms"

# ✅ Specific
node search-web.js "react-hook-form v7 validation example TypeScript"

# ❌ Missing context
node search-web.js "app router"

# ✅ With context
node search-web.js "Next.js 14 app router dynamic routes"
```

## Output

### Tavily Response

```markdown
## Sources

### 1. React Query v5 Migration Guide
**URL:** https://tanstack.com/...

TanStack Query v5 introduces breaking changes including...

### 2. What's New in React Query v5
**URL:** https://blog.example.com/...

The latest version brings improved TypeScript support...
```

### Perplexity Response

```markdown
## Answer

React Query v5 (now TanStack Query) introduces several key changes:
1. Renamed package to @tanstack/react-query
2. New suspense support built-in
3. Improved TypeScript inference
...

## Sources
- tanstack.com/query/latest
- dev.to/article/...
```

## Caching Results

For repeated queries, save results:

```bash
node search-web.js "React 19 features" --output=react-19-research.json
```

Reference saved file instead of re-searching.

## Integration with Knowledge Base

After researching, capture valuable findings:

```markdown
# .claude/knowledge/solutions/react-query-v5-migration.md

## The Problem
Upgrading from React Query v4 to v5

## Research (2024-12-22)
[Findings from web search]

## Solution
[Migration steps discovered]
```

This prevents re-researching the same topics.

