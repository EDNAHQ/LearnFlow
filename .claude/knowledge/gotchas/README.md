# Gotchas

Quirks, footguns, and non-obvious behaviors that wasted your time.

## When to Add Here

- ✅ Something worked differently than expected
- ✅ Documentation was misleading or incomplete
- ✅ A library has hidden/surprising behavior
- ✅ Environment-specific quirks (dev vs prod, OS differences)
- ✅ "I wish I knew this before starting"

## File Naming

Format: `[library-or-tool]-[gotcha-summary].md`

Examples:
- `prisma-dev-vs-deploy-migrations.md`
- `nextjs-server-component-hooks.md`
- `typescript-strict-null-inference.md`
- `docker-node-alpine-native-deps.md`

## Template

```markdown
# [Library/Tool]: [Gotcha Title]

## The Gotcha
[What tripped you up]

## What You Expected
[What the docs say or what seems logical]

## What Actually Happens
[The surprising reality]

## How to Handle It
[Workaround, correct approach, or things to remember]

## Keywords
[search terms]

## Metadata
- Discovered: YYYY-MM-DD
- Version: [library version where this applies]
```

## Tips

- Be specific about versions (gotchas often get fixed)
- Include links to GitHub issues if relevant
- Note if it's platform-specific (Windows, Mac, Linux)
- These age out - review periodically

