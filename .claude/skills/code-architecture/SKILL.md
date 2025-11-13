---
name: Code Architecture
description: Establishes consistent patterns for component structure, hooks, state management, and TypeScript conventions across LearnFlow
---

# Code Architecture

You are a code architecture expert ensuring consistency, maintainability, and scalability in the LearnFlow codebase.

## Directory Structure

```
src/
├── components/          # React components organized by feature
│   ├── ui/             # Reusable shadcn/Radix components
│   ├── auth/           # Authentication-related
│   ├── content/        # Content display components
│   ├── learning/       # Learning journey components
│   ├── journey/        # Journey/path components
│   └── [feature]/      # Feature-specific folders
├── hooks/              # Custom React hooks
│   ├── auth/           # Auth-related hooks
│   ├── content/        # Content hooks
│   └── [feature]/      # Feature-specific hooks
├── pages/              # Route pages
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client and helpers
├── utils/              # Utility functions
├── lib/                # Helper libraries
├── store/              # Global state (Zustand)
└── styles/             # Global styles
```

## Component Structure

### File Organization
- One component per file (unless very small)
- Component name matches filename in PascalCase
- Props interface defined above component
- Export at bottom of file

### Component Template

```typescript
// filename: MyComponent.tsx
import React from 'react';
import { useHook } from '@/hooks/useHook';

interface MyComponentProps {
  title: string;
  onClick: (id: string) => void;
  children?: React.ReactNode;
}

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  onClick,
  children,
}) => {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
};
```

### Props Conventions
- Always type props with interface (not inline)
- Use React.FC for function components
- Keep props interface in same file as component
- Props with optional values use `?:`
- Callbacks use verb prefixes: `onClick`, `onSubmit`, `onChange`

## Hooks Pattern

### Location Structure
```
hooks/
├── [feature]/
│   ├── useCustomHook.ts
│   └── index.ts (export all)
└── [feature]/
    └── useFeatureHook.ts
```

### Hook Template

```typescript
// filename: useMyHook.ts
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase';

export const useMyHook = () => {
  const [state, setState] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('table')
        .select('*');
      
      if (error) throw error;
      setState(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  return { state, loading, error, fetchData };
};
```

### Hook Conventions
- Prefix with `use` (React convention)
- Return object with state, loading, error, functions
- Handle loading and error states
- Always wrap async in try-catch
- Use useCallback for functions
- Clean up effects properly

## State Management (Zustand)

### Store Location
```
store/
└── [featureName]Store.ts
```

### Store Template

```typescript
// filename: learningStore.ts
import { create } from 'zustand';

interface LearningState {
  currentPath: string | null;
  progress: number;
  setCurrentPath: (path: string) => void;
  updateProgress: (progress: number) => void;
  reset: () => void;
}

export const useLearningStore = create<LearningState>((set) => ({
  currentPath: null,
  progress: 0,
  
  setCurrentPath: (path) => set({ currentPath: path }),
  updateProgress: (progress) => set({ progress }),
  reset: () => set({ currentPath: null, progress: 0 }),
}));
```

### State Management Rules
- Use Zustand for global state only
- Keep store focused on single feature
- Actions should be simple (business logic in hooks)
- Use descriptive action names (verb + noun)
- Reset/clear methods for cleanup

## TypeScript Conventions

### Type Definitions
- Define types/interfaces above components/hooks
- Use `interface` for objects, `type` for unions/primitives
- Export types that are used elsewhere
- Avoid `any` - use `unknown` if necessary

```typescript
// ✓ Good
interface UserData {
  id: string;
  email: string;
  name: string;
}

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ✗ Avoid
const userData: any = {};
type Data = {
  [key: string]: any;
};
```

### Async/Error Handling

```typescript
// ✓ Good - typed and handled
try {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  return data as User[];
} catch (err) {
  throw err instanceof Error ? err : new Error('Unknown error');
}

// ✗ Avoid
const data = await fetch(url).then(r => r.json());
```

## Naming Conventions

### Variables & Functions
- camelCase for variables and functions
- UPPER_CASE for constants
- Verb + noun for functions: `fetchUsers`, `handleClick`, `updateProfile`

### Components & Types
- PascalCase for components: `UserCard`, `LearningPath`
- PascalCase for types/interfaces: `UserData`, `PathState`

### File Names
- Components: PascalCase: `UserProfile.tsx`
- Hooks: camelCase with `use`: `useUserData.ts`
- Utils: camelCase: `formatDate.ts`
- Stores: camelCase with `Store`: `userStore.ts`

## Import/Export Conventions

### Consistent Pattern
```typescript
// ✓ Good - organized imports
import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/auth';
import { supabase } from '@/integrations/supabase';
import { formatDate } from '@/utils/formatDate';

// ✓ Export at bottom
export const MyComponent: React.FC<Props> = ({ ...props }) => {
  // ...
};
```

### Index Files (Barrel Exports)
```typescript
// filename: hooks/auth/index.ts
export { useAuth } from './useAuth';
export { useSession } from './useSession';
export type { AuthUser } from './types';
```

## API/Supabase Integration

### Pattern
```typescript
// Location: integrations/supabase/queries.ts
export const fetchUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  
  if (error) throw error;
  return data;
};

// Usage in component/hook
const { data: users } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
});
```

### Rules
- Separate queries into dedicated functions
- One query function per entity/operation
- Always handle errors explicitly
- Use React Query for data fetching
- Implement proper loading/error states

## Code Style

### Formatting & Linting
- Follow ESLint configuration
- Use Prettier for formatting
- Max line length: 80-100 characters
- Consistent spacing and indentation

### Comments
```typescript
// Use for: Why something is done this way
// Not for: What the code obviously does

// ✓ Good
// Retry fetch on network error per spec #123
if (isNetworkError(error)) {
  retry();
}

// ✗ Avoid
// Increment count
count++;
```

## Performance Patterns

### Component Memoization
```typescript
// Use React.memo for expensive renders
export const ExpensiveComponent = React.memo(({ data }: Props) => {
  return <div>{data}</div>;
});
```

### useCallback & useMemo
```typescript
// Memoize callbacks passed to child components
const handleClick = useCallback(() => {
  doSomething();
}, [dependency]);

// Memoize expensive computations
const expensiveValue = useMemo(() => {
  return compute(data);
}, [data]);
```

### Lazy Loading Routes
```typescript
const LazyPage = lazy(() => import('./pages/HeavyPage'));

// In routes
<Suspense fallback={<Loading />}>
  <LazyPage />
</Suspense>
```

## Testing Structure

### File Location
```
components/MyComponent.tsx
components/MyComponent.test.tsx  # Colocated with component
```

### Test Pattern
```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## Code Review Checklist

When reviewing code, check:

- [ ] Component has typed props interface
- [ ] Error handling implemented
- [ ] Loading states managed
- [ ] No TypeScript errors
- [ ] Follows naming conventions
- [ ] Proper file organization
- [ ] Reusable logic in hooks
- [ ] Global state in Zustand when needed
- [ ] No console.logs or debuggers
- [ ] Comments explain "why" not "what"
- [ ] Performance optimizations (memo, callbacks)
- [ ] Accessibility considered
- [ ] Mobile responsive
- [ ] Follows brand guidelines

## Common Patterns to Avoid

❌ Prop drilling - use hooks or context instead
❌ Inline component definitions - causes re-renders
❌ Large components - break into smaller pieces
❌ Global state for local state - use useState
❌ Missing error boundaries - wrap routes/sections
❌ No loading/error states - always show them
❌ Async in effects without cleanup - causes bugs
❌ Magic strings/numbers - use constants instead

