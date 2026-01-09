# Organization

## When to Use
Setting up file structure, naming, and imports.

## Structure

```
src/
├── app/                    # Shell, providers, router
├── pages/                  # Route components
├── features/               # Domain modules
├── components/             # Shared UI
│   ├── ui/                 # Primitives
│   ├── layout/             # Layouts
│   └── feedback/           # Loading, Error, Empty
├── hooks/                  # Shared hooks
├── services/               # API layer
├── utils/                  # Pure helpers
├── types/                  # Shared types
├── constants/              # App constants
└── assets/                 # Static files
```

## Conventions

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserCard.tsx` |
| Hooks | camelCase + use | `useAuth.ts` |
| Utils | camelCase | `formatDate.ts` |
| Tests | .test suffix | `UserCard.test.tsx` |

### Component Names

```tsx
// ✅ Descriptive
UserProfileCard.tsx
ProductSearchInput.tsx
ConfirmDeleteModal.tsx

// ❌ Generic
Card.tsx
Input.tsx
Modal.tsx
```

### Feature Module

```
features/users/
├── components/
│   ├── UserCard.tsx
│   └── UserCard.test.tsx
├── hooks/
│   └── useUser.ts
├── services/
│   └── userApi.ts
├── types.ts
└── index.ts              # Public exports
```

### Index Exports

```tsx
// ✅ Explicit public API
export { UserCard } from './components/UserCard'
export { useUser } from './hooks/useUser'
export type { User } from './types'

// ❌ Re-export everything
export * from './components'
export * from './hooks'
```

### Import Order

```tsx
// 1. React/framework
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// 2. Third-party
import { format } from 'date-fns'
import clsx from 'clsx'

// 3. Internal (aliases)
import { Button } from '@/components/ui'
import { useAuth } from '@/hooks'
import type { User } from '@/types'

// 4. Relative (same feature)
import { UserAvatar } from './UserAvatar'
```

### Path Aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/features/*": ["src/features/*"]
    }
  }
}
```

### Component Folder (when complex)

```
UserProfile/
├── UserProfile.tsx
├── UserProfile.test.tsx
├── UserProfileHeader.tsx
├── useUserProfile.ts
└── index.ts
```

## Example

```tsx
// features/orders/index.ts
export { OrderList } from './components/OrderList'
export { OrderDetails } from './components/OrderDetails'
export { useOrders } from './hooks/useOrders'
export { useOrder } from './hooks/useOrder'
export type { Order, OrderStatus } from './types'

// Usage in pages
import { OrderList, useOrders } from '@/features/orders'
```

## Anti-Patterns

| Anti-Pattern | Fix |
|--------------|-----|
| `/components/buttons/` | Feature-based or flat |
| 50+ files in one folder | Split into sub-folders |
| 5+ levels deep | Flatten, use aliases |
| `utils.ts` with 100 functions | Split by domain |
| Circular dependencies | Restructure layers |
| Re-export everything | Explicit exports |

## Checklist

- [ ] Feature modules have clear boundaries
- [ ] Public API via index.ts
- [ ] Files named descriptively
- [ ] Tests colocated with code
- [ ] Path aliases configured
- [ ] No circular dependencies
- [ ] No folder has 50+ files
- [ ] Import order consistent
