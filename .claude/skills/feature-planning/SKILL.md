---
name: Feature Planning & Execution
description: Systematic framework for breaking down features into frontend, backend, components, hooks, and database requirements
---

# Feature Planning & Execution Framework

You are a feature planning expert helping systematically break down features into actionable implementation steps.

## 🎯 Feature Breakdown Checklist

When planning a new feature, systematically consider:

### 1. User Flow & Requirements
- [ ] What is the user trying to accomplish?
- [ ] What are the entry points? (page, button, link, etc.)
- [ ] What are the success states?
- [ ] What are the error states?
- [ ] What data needs to be displayed?
- [ ] What actions can the user take?

### 2. Data Requirements
- [ ] What data needs to be stored? (new tables/columns?)
- [ ] What data needs to be fetched? (existing tables?)
- [ ] What data needs to be updated?
- [ ] What relationships exist? (foreign keys, joins)
- [ ] Do we need RLS policies?
- [ ] Do we need indexes for performance?

### 3. Backend/Edge Functions
- [ ] Do we need a new edge function?
- [ ] What operations are needed? (CRUD, AI generation, external APIs)
- [ ] What edge function handlers are needed?
- [ ] Do we need shared utilities? (check `_shared/` folder)
- [ ] What error handling is required?
- [ ] What authentication/authorization is needed?

### 4. Frontend Components
- [ ] What pages need to be created/modified?
- [ ] What new components are needed?
- [ ] Can we reuse existing UI components? (check `src/components/ui/`)
- [ ] What hooks are needed? (data fetching, state management)
- [ ] What routes need to be added?
- [ ] What navigation changes are needed?

### 5. State Management
- [ ] Do we need local state? (useState)
- [ ] Do we need global state? (Zustand store)
- [ ] Do we need React Query? (for server state)
- [ ] Do we need real-time updates? (Supabase subscriptions)

### 6. Integration Points
- [ ] What Supabase tables are involved?
- [ ] What edge functions are called?
- [ ] What external APIs are used?
- [ ] What hooks from other features are reused?

## 📋 Feature Planning Template

### Feature: [Feature Name]

**User Story:**
As a [user type], I want to [action] so that [benefit].

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Data Model:**
```typescript
// New tables needed:
- table_name: {
    id: UUID
    user_id: UUID (FK to profiles)
    // ... other fields
}

// Existing tables modified:
- existing_table: add column X
```

**Backend Requirements:**
- [ ] Edge function: `function-name`
  - Handler: `handler-name.ts`
  - Operations: [list operations]
  - Dependencies: [list dependencies]

**Frontend Requirements:**
- [ ] Page: `src/pages/PageName.tsx`
- [ ] Components:
  - `src/components/feature/ComponentName.tsx`
- [ ] Hooks:
  - `src/hooks/feature/useFeatureHook.ts`
- [ ] Routes: `/new-route`

**State Management:**
- [ ] Local state (useState)
- [ ] Global state (Zustand) - `src/store/featureStore.ts`
- [ ] Server state (React Query)

**Dependencies:**
- [ ] Requires feature X to be completed first
- [ ] Uses hook Y from feature Z
- [ ] Depends on table A existing

**Implementation Order:**
1. Database migrations (if needed)
2. Edge functions (if needed)
3. Hooks (data layer)
4. Components (UI layer)
5. Pages (routing)
6. Integration & testing

## 🔄 Common Feature Patterns

### Pattern 1: CRUD Feature
**Example:** User can create/edit/delete learning paths

**Breakdown:**
1. **Database**: `learning_paths` table (already exists)
2. **Edge Function**: None (use Supabase client directly)
3. **Hook**: `useLearningPaths.ts` with create/update/delete functions
4. **Component**: `LearningPathForm.tsx`, `LearningPathList.tsx`
5. **Page**: Modify existing `PlanPage.tsx` or create new page

### Pattern 2: AI-Generated Content Feature
**Example:** Generate learning content using AI

**Breakdown:**
1. **Database**: `learning_steps` table (store generated content)
2. **Edge Function**: `generate-learning-content` with handler
3. **Hook**: `useContentGeneration.ts` (calls edge function)
4. **Component**: `ContentGenerator.tsx` (triggers generation)
5. **Page**: Integrate into existing learning flow

### Pattern 3: Real-Time Feature
**Example:** Live updates when content is generated

**Breakdown:**
1. **Database**: Table with real-time enabled
2. **Edge Function**: Updates database
3. **Hook**: `useRealtimeUpdates.ts` (Supabase subscription)
4. **Component**: Displays live updates
5. **Page**: Shows real-time state

### Pattern 4: Analytics/Tracking Feature
**Example:** Track user behavior

**Breakdown:**
1. **Database**: `behavior_logs` table (already exists)
2. **Edge Function**: None (direct insert)
3. **Hook**: `useBehaviorTracking.ts` (wraps logging)
4. **Component**: Automatic (tracked in existing components)
5. **Page**: Analytics dashboard (optional)

## 🚀 Quick Feature Execution Workflow

### Step 1: Database First (if needed)
```sql
-- Create migration
supabase migration new feature_name

-- Add tables/columns
-- Add indexes
-- Add RLS policies

-- Push migration
supabase db push

-- Regenerate types
supabase gen types typescript --project-id hjivfywgkiwjvpquxndg > src/integrations/supabase/types.ts
```

### Step 2: Edge Function (if needed)
```typescript
// Create function structure
supabase/functions/feature-name/
  ├── index.ts (main handler)
  ├── handlers/
  │   └── handler-name.ts
  └── utils/ (if needed)

// Reference existing patterns:
// - Check supabase/functions/_shared/ for utilities
// - Follow CORS pattern from other functions
// - Use error handling patterns
```

### Step 3: Hook (Data Layer)
```typescript
// Create hook in appropriate folder
src/hooks/feature/useFeatureHook.ts

// Pattern:
export const useFeatureHook = () => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    // Supabase query or edge function call
  }, []);

  return { data, loading, error, fetchData };
};
```

### Step 4: Components (UI Layer)
```typescript
// Create component
src/components/feature/FeatureComponent.tsx

// Use existing UI components from src/components/ui/
// Follow brand guidelines
// Include loading/error states
```

### Step 5: Page Integration
```typescript
// Add/modify page
src/pages/FeaturePage.tsx

// Add route in App.tsx
// Include navigation updates
```

## 🎨 Feature-Specific Considerations

### UI Features
- [ ] Check `src/components/ui/` for reusable components
- [ ] Follow brand guidelines (colors, typography, icons)
- [ ] Mobile responsive design
- [ ] Loading states
- [ ] Error states
- [ ] Empty states

### Data Features
- [ ] TypeScript types from `src/integrations/supabase/types.ts`
- [ ] Error handling in hooks
- [ ] Loading states
- [ ] Optimistic updates (if applicable)
- [ ] Cache invalidation (React Query)

### Real-Time Features
- [ ] Supabase subscription setup
- [ ] Cleanup on unmount
- [ ] Handle connection errors
- [ ] Debounce/throttle updates

### AI Features
- [ ] Edge function handler
- [ ] Prompt engineering
- [ ] Error handling for AI failures
- [ ] Loading states (can be long)
- [ ] Streaming responses (if applicable)

## 🔍 Feature Discovery Questions

Before implementing, ask:

1. **Does this already exist?**
   - Search codebase for similar functionality
   - Check existing hooks/components

2. **What's the simplest version?**
   - MVP first, iterate later
   - Can we reuse existing patterns?

3. **What are the edge cases?**
   - Empty states
   - Error states
   - Loading states
   - User not authenticated
   - Network failures

4. **What needs to be tracked?**
   - Analytics events?
   - Behavior logs?
   - Progress tracking?

5. **What are the performance implications?**
   - Large data sets?
   - Frequent updates?
   - Expensive computations?

## 📝 Feature Implementation Checklist

- [ ] Database migrations created and pushed
- [ ] Types regenerated after migrations
- [ ] Edge functions created (if needed)
- [ ] Edge functions deployed
- [ ] Hooks created with error handling
- [ ] Components created with loading/error states
- [ ] Brand guidelines followed
- [ ] Mobile responsive
- [ ] Accessibility considered
- [ ] Routes added
- [ ] Navigation updated
- [ ] Real-time subscriptions cleaned up (if applicable)
- [ ] Error boundaries added (if needed)
- [ ] Analytics tracking added (if applicable)

## 🎯 Quick Reference: Feature Types

### Simple CRUD
- Database: Existing or new table
- Backend: Supabase client (no edge function)
- Frontend: Hook + Component + Page

### AI Generation
- Database: Store generated content
- Backend: Edge function with AI provider
- Frontend: Hook (calls edge function) + Component + Page

### Real-Time Updates
- Database: Table with real-time enabled
- Backend: Edge function or direct updates
- Frontend: Hook with subscription + Component + Page

### Analytics/Dashboard
- Database: Query existing tables
- Backend: Edge function for aggregations (if complex)
- Frontend: Hook + Chart components + Dashboard page

### Integration Feature
- Database: Store integration config/data
- Backend: Edge function (external API calls)
- Frontend: Hook + Settings component + Integration page

---

**Remember:** Start with the data model, then backend, then frontend. Test each layer before moving to the next.

