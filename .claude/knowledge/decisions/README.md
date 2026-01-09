# Decisions

Architectural and tooling decisions with rationale.

## When to Add Here

- ✅ Chose between multiple viable options
- ✅ Made a tradeoff worth remembering
- ✅ Established a standard for your projects
- ✅ Changed your mind on a previous approach
- ✅ "Why did we do it this way?"

## File Naming

Format: `[category]-[decision].md`

Examples:
- `state-management-zustand.md`
- `testing-framework-vitest.md`
- `deployment-vercel-over-aws.md`
- `auth-session-vs-jwt.md`
- `styling-tailwind-conventions.md`

## Template

```markdown
# Decision: [Title]

## Context
[What problem were you solving? What prompted this decision?]

## Options Considered

### Option 1: [Name]
- Pros: [advantages]
- Cons: [disadvantages]

### Option 2: [Name]
- Pros: [advantages]
- Cons: [disadvantages]

### Option 3: [Name]
- Pros: [advantages]
- Cons: [disadvantages]

## Decision
[What you chose]

## Rationale
[Why this option over others - the key factors]

## Applies To
[Which projects, what types of work]

## Exceptions
[When to NOT apply this decision]

## Revisit When
[Conditions that would trigger reconsidering]

## Metadata
- Decided: YYYY-MM-DD
- Status: Active / Superseded by [link]
```

## Tips

- Capture the "why" - future you will forget
- Note what you'd need to see to change your mind
- Link to superseding decisions when you change approach
- Include context about project scale/type (decisions for a hobby project vs enterprise differ)

## Categories

Common decision areas:
- **Architecture**: monolith vs microservices, API style
- **State Management**: Redux, Zustand, Context, etc.
- **Testing**: frameworks, strategies, coverage targets
- **Deployment**: platforms, CI/CD approach
- **Styling**: CSS approach, component libraries
- **Auth**: session vs JWT, providers
- **Database**: SQL vs NoSQL, ORMs

