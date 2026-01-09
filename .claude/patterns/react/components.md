# Components

## When to Use
Creating any React component.

## Structure

```tsx
// 1. Imports (external → internal → types)
import { useState } from 'react'
import { Button } from '@/components/ui'
import type { User } from '@/types'

// 2. Types
interface UserCardProps {
  user: User
  onSelect?: (user: User) => void
  variant?: 'compact' | 'full'
}

// 3. Component
export function UserCard({ user, onSelect, variant = 'full' }: UserCardProps) {
  const [expanded, setExpanded] = useState(false)

  // Derived state (no useState for computed values)
  const displayName = user.firstName + ' ' + user.lastName

  // Handlers
  const handleClick = () => onSelect?.(user)

  // Early returns for edge cases
  if (!user) return null

  return (
    <div onClick={handleClick}>
      {/* ... */}
    </div>
  )
}
```

## Conventions

### Props
- Required props: no `?`
- Optional props: `?` with sensible defaults
- Max 2 levels of prop drilling, then use composition or context

```tsx
// ✅ Good
interface ButtonProps {
  children: React.ReactNode      // Required
  onClick: () => void            // Required
  variant?: 'primary' | 'secondary'  // Optional with default
}

// ❌ Bad: Everything optional
interface ButtonProps {
  children?: React.ReactNode
  onClick?: () => void
}
```

### Composition over Prop Drilling

```tsx
// ❌ Bad
<Page user={user}>
  <Sidebar user={user}>
    <UserMenu user={user} />
  </Sidebar>
</Page>

// ✅ Good
<Page>
  <Sidebar>
    <UserMenu user={user} />
  </Sidebar>
</Page>
```

### State Decisions

| Need | Solution |
|------|----------|
| UI state (open/closed) | `useState` |
| Computed from props | Derive inline |
| Complex logic | `useReducer` |
| Shared siblings | Lift to parent |
| App-wide | Context |
| Server data | React Query/SWR |

### Derived State

```tsx
// ❌ Bad: Syncing state from props
const [name, setName] = useState(user.name)
useEffect(() => setName(user.name), [user.name])

// ✅ Good: Derive directly
const name = user.name
```

## Example

```tsx
interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
  showQuickView?: boolean
}

export function ProductCard({
  product,
  onAddToCart,
  showQuickView = true
}: ProductCardProps) {
  const { data: inventory } = useInventory(product.id)

  const isInStock = inventory?.quantity > 0
  const formattedPrice = formatCurrency(product.price)

  if (!product) return null

  return (
    <article className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="price">{formattedPrice}</p>

      <Button
        onClick={() => onAddToCart(product)}
        disabled={!isInStock}
      >
        {isInStock ? 'Add to Cart' : 'Out of Stock'}
      </Button>

      {showQuickView && <QuickViewButton product={product} />}
    </article>
  )
}
```

## Anti-Patterns

| Anti-Pattern | Fix |
|--------------|-----|
| God components (500+ lines) | Split by responsibility |
| 15+ props | Compose smaller components |
| Boolean prop explosion | Use variant enums |
| Inline objects `style={{}}` | Extract or memoize |
| Index as key | Use stable IDs |
| Premature abstraction | Wait for 3 uses |

## Checklist

- [ ] Single responsibility (one sentence description)
- [ ] Props typed with interface
- [ ] Required vs optional intentional
- [ ] No prop drilling beyond 2 levels
- [ ] Loading/error/empty states handled
- [ ] Keyboard accessible
- [ ] No inline object literals in JSX
- [ ] Keys are stable (not index)
