# Design System

## When to Use
Ensuring visual consistency with tokens, variants, and theming.

## Structure

### Tokens

```tsx
// tokens/colors.ts
export const colors = {
  // Semantic (use these)
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  secondary: '#6b7280',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',

  background: '#ffffff',
  backgroundAlt: '#f9fafb',
  foreground: '#111827',
  foregroundMuted: '#6b7280',

  border: '#e5e7eb',
  borderFocus: '#3b82f6',
} as const

// tokens/spacing.ts
export const spacing = {
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
} as const

// tokens/typography.ts
export const typography = {
  fontSize: {
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const
```

## Conventions

### Component Variants

```tsx
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary-hover',
        secondary: 'bg-secondary text-white hover:bg-secondary-hover',
        outline: 'border border-border hover:bg-gray-50',
        ghost: 'hover:bg-gray-100',
        destructive: 'bg-error text-white hover:bg-red-600',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ variant, size, ...props }: ButtonProps) {
  return <button className={buttonVariants({ variant, size })} {...props} />
}
```

### CSS Variables for Theming

```css
:root {
  --color-primary: #3b82f6;
  --color-background: #ffffff;
  --color-foreground: #111827;
  --radius-md: 0.375rem;
}

[data-theme='dark'] {
  --color-primary: #60a5fa;
  --color-background: #111827;
  --color-foreground: #f9fafb;
}
```

### Theme Context

```tsx
type Theme = 'light' | 'dark' | 'system'

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (theme: Theme) => void
} | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    const resolved = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme
    document.documentElement.dataset.theme = resolved
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

### Consistent Patterns

```tsx
// Form fields
function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  )
}

// Empty states
function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      {Icon && <Icon className="h-12 w-12 text-gray-400 mb-4" />}
      <h3 className="text-lg font-medium">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
```

## Anti-Patterns

| Anti-Pattern | Fix |
|--------------|-----|
| Magic numbers `padding: 13px` | Use spacing scale |
| One-off colors `#4a7fc1` | Use semantic tokens |
| Inconsistent button heights | Standardize variants |
| Inline styles | Use tokens/classes |
| 10 button variants | Reduce to 4-5 core |

## Checklist

- [ ] Using semantic color tokens
- [ ] Spacing from scale
- [ ] Typography from scale
- [ ] Component uses variant pattern
- [ ] Dark mode via CSS variables
- [ ] No inline magic numbers
- [ ] Consistent border radius
- [ ] Focus states visible
