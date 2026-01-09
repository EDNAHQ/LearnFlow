# Architecture

## When to Use
Organizing code into layers, deciding where state lives.

## Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Pages          Route components, data orchestration        │
├─────────────────────────────────────────────────────────────┤
│  Features       Domain-specific components and logic        │
├─────────────────────────────────────────────────────────────┤
│  Components     Reusable UI primitives                      │
├─────────────────────────────────────────────────────────────┤
│  Hooks          Shared stateful logic                       │
├─────────────────────────────────────────────────────────────┤
│  Services       API calls, external integrations            │
├─────────────────────────────────────────────────────────────┤
│  Utils          Pure functions, helpers                     │
└─────────────────────────────────────────────────────────────┘
```

## Conventions

### Layer Rules

| Layer | Can Import From | Cannot Import |
|-------|-----------------|---------------|
| Pages | Features, Components, Hooks, Services | Other Pages |
| Features | Components, Hooks, Services, Utils | Pages, Other Features* |
| Components | Hooks, Utils | Pages, Features, Services |
| Hooks | Services, Utils | Pages, Features, Components |
| Services | Utils | Everything else |
| Utils | Nothing | Everything |

*Features can import shared sub-features if designed for reuse.

### Feature Encapsulation

```tsx
// features/users/index.ts - Public API only
export { UserProfile } from './components/UserProfile'
export { UserList } from './components/UserList'
export { useUser } from './hooks/useUser'
export type { User } from './types'

// Internal components NOT exported
```

### State Location

```
URL state (filters, pagination)?     → useSearchParams / router
Server data (fetched)?               → React Query / SWR
App-wide (theme, auth)?              → Context
Shared between siblings?             → Lift to parent
Local to one component?              → useState
```

### State Boundaries

```tsx
// ✅ Good: Clear boundaries
<AuthProvider>
  <ThemeProvider>
    <QueryClientProvider>
      <Router>
        <Routes />
      </Router>
    </QueryClientProvider>
  </ThemeProvider>
</AuthProvider>

// ❌ Bad: God context
<AppContext.Provider value={{ user, theme, cart, notifications }}>
```

### API Layer

```tsx
// services/api.ts - Base config
const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// services/userService.ts - Domain specific
export const userService = {
  getAll: () => api.get<User[]>('/users').then(r => r.data),
  getById: (id: string) => api.get<User>(`/users/${id}`).then(r => r.data),
  create: (data: CreateUser) => api.post<User>('/users', data).then(r => r.data),
}

// hooks/useUser.ts - React Query wrapper
export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => userService.getById(id),
  })
}
```

### Error Boundaries

```tsx
<RootErrorBoundary>
  <Layout>
    <Sidebar />
    <ErrorBoundary fallback={<ContentError />}>
      <MainContent />
    </ErrorBoundary>
  </Layout>
</RootErrorBoundary>
```

## Example

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── index.ts
│   └── users/
│       ├── components/
│       ├── hooks/
│       └── index.ts
├── components/
│   ├── ui/           # Button, Input, Modal
│   ├── layout/       # Page layouts
│   └── feedback/     # Loading, Error, Empty
├── hooks/            # Shared hooks
├── services/         # Shared API
├── utils/            # Pure helpers
├── types/            # Shared types
└── pages/            # Routes
```

## Anti-Patterns

| Anti-Pattern | Fix |
|--------------|-----|
| Circular imports | Extract shared code down |
| Barrel file explosion | Export only public API |
| 5+ levels prop drilling | Context or composition |
| Business logic in components | Extract to hooks/services |
| API calls in components | Service layer + React Query |
| Everything in Redux | Local state first |

## Checklist

- [ ] Clear layer boundaries
- [ ] Features encapsulated with public API
- [ ] State at appropriate level
- [ ] Server state with caching library
- [ ] API layer abstracted
- [ ] Error boundaries placed
- [ ] No circular dependencies
