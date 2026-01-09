# Hooks

## When to Use
Extracting reusable stateful logic from components.

## Structure

```tsx
interface UseCounterOptions {
  initial?: number
  min?: number
  max?: number
}

interface UseCounterReturn {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
}

export function useCounter(options: UseCounterOptions = {}): UseCounterReturn {
  const { initial = 0, min = -Infinity, max = Infinity } = options

  const [count, setCount] = useState(initial)

  const increment = useCallback(() => {
    setCount((c) => Math.min(c + 1, max))
  }, [max])

  const decrement = useCallback(() => {
    setCount((c) => Math.max(c - 1, min))
  }, [min])

  const reset = useCallback(() => setCount(initial), [initial])

  return { count, increment, decrement, reset }
}
```

## Conventions

### Naming
```tsx
// ✅ Describes what it manages
useAuth()
useLocalStorage()
useDebounce()
useMediaQuery()

// ❌ Vague
useData()
useFetch()
useCustomHook()
```

### Dependencies
1. Include all reactive values
2. Use `useCallback`/`useMemo` for objects/functions in deps
3. Never omit deps to "prevent re-runs"

```tsx
// ❌ Bad: Missing dependency
useEffect(() => {
  fetchResults(query).then(setResults)
}, [])  // query missing

// ✅ Good
useEffect(() => {
  fetchResults(query).then(setResults)
}, [query])
```

### Stable Callbacks

```tsx
// ❌ New function every render
const handleClick = () => console.log('clicked')

// ✅ Stable reference
const handleClick = useCallback(() => {
  console.log('clicked')
}, [])
```

## Common Patterns

### Data Fetching
```tsx
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(res.statusText)
      setData(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown'))
    } finally {
      setIsLoading(false)
    }
  }, [url])

  useEffect(() => { fetchData() }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}
```

### Debounce
```tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
```

### Local Storage
```tsx
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : initial
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}
```

### Media Query
```tsx
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    window.matchMedia(query).matches
  )

  useEffect(() => {
    const mq = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])

  return matches
}
```

## Testing

```tsx
import { renderHook, act } from '@testing-library/react'

test('increments counter', () => {
  const { result } = renderHook(() => useCounter({ initial: 0 }))

  expect(result.current.count).toBe(0)

  act(() => result.current.increment())

  expect(result.current.count).toBe(1)
})
```

## Anti-Patterns

| Anti-Pattern | Fix |
|--------------|-----|
| Lying deps array | Include all deps |
| Object deps `[{...}]` | Destructure or memoize |
| Conditional hooks | Move condition inside |
| 100+ line hooks | Split into focused hooks |
| Side effects in render | Wrap in useEffect |

## Checklist

- [ ] Name starts with `use`
- [ ] Single responsibility
- [ ] Return type is typed
- [ ] All dependencies included
- [ ] Callbacks memoized
- [ ] Cleanup in useEffect return
- [ ] Works with SSR
- [ ] Has tests
