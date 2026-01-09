# Patterns Library

Your coding conventions, documented once, applied everywhere.

**Core principle:** Every project should feel the same. Consistency enables speed.

---

## What Goes Here

Reusable patterns for how you structure code:

| Pattern Type | Example Files |
|--------------|---------------|
| API/Backend | `api-endpoint.md`, `service-class.md`, `middleware.md` |
| Frontend | `react-component.md`, `custom-hook.md`, `page-layout.md` |
| Data | `database-model.md`, `migration.md`, `validation-schema.md` |
| Testing | `unit-test.md`, `integration-test.md`, `e2e-test.md` |
| Infrastructure | `dockerfile.md`, `github-action.md`, `env-config.md` |
| Project Structure | `file-organization.md`, `naming-conventions.md` |

---

## Pattern Template

Each pattern file should follow this structure:

```markdown
# [Pattern Name]

## When to Use
[Trigger conditions - when should this pattern be applied?]

## Structure
[The pattern itself - file structure, code template]

## Example
[Real example from your codebase]

## Conventions
[Naming, formatting, style rules]

## Variations
[When to deviate and how]

## Anti-Patterns
[What NOT to do]
```

---

## Example: React Component Pattern

```markdown
# React Component Pattern

## When to Use
Creating any new React component

## Structure

Location: `src/components/[ComponentName]/`

```
ComponentName/
├── index.ts              ← Re-export
├── ComponentName.tsx     ← Main component
├── ComponentName.test.tsx ← Tests
└── types.ts              ← TypeScript types (if complex)
```

## Example

```tsx
// Button.tsx
import { FC } from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: FC<ButtonProps> = ({ 
  label, 
  onClick,
  variant = 'primary'
}) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
```

## Conventions
- Named exports (not default)
- Props interface named `[ComponentName]Props`
- Destructure props in function signature
- Optional props have sensible defaults

## Anti-Patterns
- ❌ Default exports
- ❌ Inline styles
- ❌ Business logic in component (use hooks)
- ❌ Props spreading without type safety
```

---

## How It Gets Used

### When Creating New Code

Claude automatically:
1. Checks if a pattern exists for what you're building
2. Reads the pattern file
3. Applies your conventions to the new code

### Prompt Examples

```
"Create a new API endpoint for user registration"
→ Claude reads api-endpoint.md and follows your pattern

"Add a Button component"
→ Claude reads react-component.md and matches your style

"Write tests for the auth service"
→ Claude reads unit-test.md and follows your test conventions
```

---

## Creating New Patterns

When you build something you like:

1. Build it the way you want first
2. Extract the reusable pattern
3. Create a pattern file

Or tell Claude:

```
"Extract this as a pattern for future use"
```

---

## Per-Project Overrides

Some projects have different needs. Create project-specific patterns:

```
project-root/.claude/patterns/
└── api-endpoint.md    ← Overrides global pattern for this project
```

Priority order:
1. Project patterns (`./claude/patterns/`)
2. Global patterns (`~/.claude/patterns/`)

---

## Keeping Patterns Updated

When you improve how you do something:

1. Update the pattern file
2. All future code uses the improved pattern
3. Optionally refactor old code to match

Patterns are living documents, not set in stone.

---

## Quick Reference

| Need | Pattern |
|------|---------|
| React components | `react/components.md` |
| Custom hooks | `react/hooks.md` |
| Page structure | `react/pages.md` |
| App architecture | `react/architecture.md` |
| File organization | `react/organization.md` |
| Design tokens/theming | `react/design-system.md` |
| Responsive/mobile | `react/mobile-views.md` |

See [react/README.md](react/README.md) for full React patterns.

---

## Related Skills

- `scaling/project-templates` - Full documentation on this system
- `code-intelligence/codebase-context` - Detects patterns in existing code
- `execution/completion-checklist` - Verifies new code follows patterns

