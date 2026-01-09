# Mobile Views

## When to Use
Building responsive, mobile-first interfaces.

## Structure

### Breakpoints

```tsx
// Tailwind defaults
const breakpoints = {
  sm: 640,   // Large phones
  md: 768,   // Tablets
  lg: 1024,  // Small laptops
  xl: 1280,  // Desktops
}

// Mobile-first: base = mobile, enhance up
<div className="p-4 md:p-6 lg:p-8">

// ❌ Desktop-first (avoid)
<div className="p-8 sm:p-6 xs:p-4">
```

## Conventions

### Stack to Row

```tsx
<div className="flex flex-col gap-4 md:flex-row md:items-center">
  <div className="flex-1">Content</div>
  <div className="flex gap-2">
    <Button>Cancel</Button>
    <Button>Save</Button>
  </div>
</div>
```

### Hide/Show by Breakpoint

```tsx
<nav>
  {/* Mobile: hamburger */}
  <button className="md:hidden">
    <MenuIcon />
  </button>

  {/* Desktop: full nav */}
  <div className="hidden md:flex gap-4">
    <NavLink to="/">Home</NavLink>
    <NavLink to="/about">About</NavLink>
  </div>
</nav>
```

### Responsive Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>
```

### Touch Targets

```tsx
// Minimum 44x44px (WCAG)
<button className="min-h-[44px] min-w-[44px] p-2">
  <Icon />
</button>

// Adequate spacing
<div className="flex gap-4">  {/* Not gap-1 */}
  <IconButton icon={Edit} />
  <IconButton icon={Delete} />
</div>
```

### Bottom Navigation

```tsx
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="h-14 border-b" />

      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 border-t bg-white md:hidden">
        <BottomNavItems />
      </nav>

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 border-r">
        <SidebarNav />
      </aside>
    </div>
  )
}
```

### Responsive Tables

```tsx
function DataDisplay({ items }: { items: Item[] }) {
  return (
    <>
      {/* Mobile: cards */}
      <div className="space-y-4 md:hidden">
        {items.map(item => <Card key={item.id} />)}
      </div>

      {/* Desktop: table */}
      <table className="hidden md:table w-full">
        <thead>{/* ... */}</thead>
        <tbody>
          {items.map(item => <tr key={item.id} />)}
        </tbody>
      </table>
    </>
  )
}
```

### useIsMobile Hook

```tsx
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return isMobile
}
```

### Responsive Images

```tsx
<img
  src="/hero-mobile.jpg"
  srcSet="/hero-mobile.jpg 640w, /hero-tablet.jpg 1024w, /hero-desktop.jpg 1920w"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px"
  alt="Hero"
  loading="lazy"
/>
```

## Anti-Patterns

| Anti-Pattern | Fix |
|--------------|-----|
| Desktop-first CSS | Start mobile, add `md:` |
| Fixed widths | Use max-width, flex |
| Hover-only interactions | Add tap alternative |
| Tiny touch targets | Min 44x44px |
| Hiding critical content | Prioritize, don't hide |
| Heavy images on mobile | Responsive images |

## Checklist

- [ ] Mobile-first CSS
- [ ] Touch targets 44x44px minimum
- [ ] Adequate spacing between interactive elements
- [ ] No horizontal scroll on mobile
- [ ] Navigation accessible (bottom nav or hamburger)
- [ ] Tables convert to cards on mobile
- [ ] Images responsive/lazy loaded
- [ ] Forms usable with mobile keyboard
- [ ] Tested on actual device
