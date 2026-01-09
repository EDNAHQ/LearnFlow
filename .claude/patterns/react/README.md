# React Patterns

Quality standards for React TypeScript development.

## Quick Reference

| Building... | Use Pattern |
|-------------|-------------|
| UI elements | [components.md](components.md) |
| Stateful logic | [hooks.md](hooks.md) |
| Route views | [pages.md](pages.md) |
| App structure | [architecture.md](architecture.md) |
| File layout | [organization.md](organization.md) |
| Styling/theming | [design-system.md](design-system.md) |
| Responsive UI | [mobile-views.md](mobile-views.md) |

## Core Principles

1. **Components are the unit of reuse** - Small, focused, composable
2. **Colocation over separation** - Keep related code together
3. **Explicit over implicit** - Props > context > globals
4. **Mobile-first** - Start with constraints, enhance for space

## Quality Gates

Before any React code is "done":

- [ ] Component has single responsibility
- [ ] Props are typed with interface
- [ ] No prop drilling beyond 2 levels
- [ ] Loading/error/empty states handled
- [ ] Responsive across breakpoints
- [ ] Accessible (keyboard, screen reader)
