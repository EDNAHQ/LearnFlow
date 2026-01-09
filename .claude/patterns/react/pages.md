# Pages

## When to Use
Creating route-level components.

## Structure

```tsx
// pages/users/[id].tsx
import { useParams } from 'react-router-dom'
import { useUser } from '@/hooks/useUser'
import { PageLayout } from '@/components/layout'
import { UserProfile, UserActivity } from '@/features/users'
import { ErrorPage, LoadingPage } from '@/components/feedback'

export function UserPage() {
  // 1. Route params
  const { id } = useParams<{ id: string }>()

  // 2. Data fetching
  const { data: user, isLoading, error } = useUser(id!)

  // 3. States at page level
  if (isLoading) return <LoadingPage />
  if (error) return <ErrorPage error={error} />
  if (!user) return <ErrorPage message="User not found" />

  // 4. Compose features
  return (
    <PageLayout title={user.name}>
      <UserProfile user={user} />
      <UserActivity userId={user.id} />
    </PageLayout>
  )
}
```

## Conventions

### Pages vs Components

| Pages DO | Pages DON'T |
|----------|-------------|
| Define route layout | Contain business logic |
| Fetch/prefetch data | Manage complex local state |
| Handle route params | Render detailed UI |
| Compose features | Define reusable components |
| Set page metadata | Style individual elements |

### Data Fetching

**Parallel (independent data):**
```tsx
function DashboardPage() {
  const stats = useStats()
  const activity = useRecentActivity()
  const alerts = useAlerts()

  if (stats.isLoading || activity.isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <DashboardLayout>
      <StatsPanel data={stats.data} />
      <ActivityFeed data={activity.data} />
    </DashboardLayout>
  )
}
```

**Dependent (one needs another):**
```tsx
function TeamMemberPage() {
  const { teamId, memberId } = useParams()
  const { data: team } = useTeam(teamId)
  const { data: member } = useTeamMember(
    team?.id,
    memberId,
    { enabled: !!team }
  )
  // ...
}
```

### URL State

Keep shareable state in URL:

```tsx
function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const category = searchParams.get('category') ?? 'all'
  const sort = searchParams.get('sort') ?? 'newest'
  const page = Number(searchParams.get('page') ?? 1)

  const setCategory = (cat: string) => {
    setSearchParams((params) => {
      params.set('category', cat)
      params.set('page', '1')
      return params
    })
  }

  // ...
}
```

### Nested Layouts

```tsx
function SettingsLayout() {
  return (
    <div className="settings">
      <SettingsSidebar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

function ProfileSettings() {
  return (
    <>
      <h1>Profile</h1>
      <ProfileForm />
    </>
  )
}
```

## Example

```tsx
export function OrdersPage() {
  const [searchParams] = useSearchParams()
  const status = searchParams.get('status') ?? 'all'

  const { data: orders, isLoading, error } = useOrders({ status })

  if (isLoading) return <OrdersPageSkeleton />
  if (error) return <ErrorPage error={error} retry={() => refetch()} />

  return (
    <PageLayout
      title="Orders"
      actions={<CreateOrderButton />}
    >
      <OrderFilters currentStatus={status} />

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          action={<CreateOrderButton />}
        />
      ) : (
        <OrderList orders={orders} />
      )}
    </PageLayout>
  )
}
```

## Anti-Patterns

| Anti-Pattern | Fix |
|--------------|-----|
| Business logic in pages | Move to hooks/services |
| Fetching deep in tree | Fetch at page level |
| Prop drilling from page | Compose with slots |
| 500+ line pages | Extract to features |
| Missing loading states | Always handle loading |
| URL + useState conflict | Single source of truth |

## Checklist

- [ ] Route params validated/typed
- [ ] Data fetching at page level
- [ ] Loading state handled
- [ ] Error state with recovery
- [ ] Empty state handled
- [ ] Page title/metadata set
- [ ] URL reflects shareable state
- [ ] No business logic in page
