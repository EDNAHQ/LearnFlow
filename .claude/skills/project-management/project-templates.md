---
name: project-templates
description: Use when creating new code to apply consistent patterns across all projects
---

# Project Templates

## Overview

Your patterns, documented once, applied everywhere. Stop re-explaining how you like things done.

**Core principle:** Every project should feel the same. Consistency enables speed.

## Setup: Create Your Patterns

Create `.claude/patterns/` directory with your standard patterns:

```
.claude/patterns/
├── api-endpoint.md       ← How you structure API routes
├── react-component.md    ← Your component patterns
├── database-model.md     ← How you do models/migrations
├── service-class.md      ← Business logic patterns
├── test-file.md          ← How you write tests
├── error-handling.md     ← Your error patterns
└── file-structure.md     ← Where things go in your projects
```

## Pattern Template

Each pattern file should include:

```markdown
# [Pattern Name]

## When to Use
[Trigger conditions]

## Structure
[The pattern itself - code, file structure, etc.]

## Example
[Real example from your codebase]

## Variations
[When to deviate and how]

## Anti-Patterns
[What NOT to do]
```

## Example Patterns

### API Endpoint Pattern

```markdown
# API Endpoint Pattern

## When to Use
Creating any new API endpoint

## Structure

Location: `src/api/[resource]/[action].ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '@/lib/errors';
import { db } from '@/lib/db';

// 1. Input validation schema
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

// 2. Handler function
export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // 3. Validate input
    const input = CreateUserSchema.parse(req.body);
    
    // 4. Business logic
    const user = await db.user.create({
      data: input,
    });
    
    // 5. Response
    res.status(201).json({ data: user });
  } catch (error) {
    next(error);
  }
}
```

## Naming Conventions
- File: `create-user.ts`, `get-users.ts`, `update-user.ts`
- Function: `createUser`, `getUsers`, `updateUser`
- Route: `POST /api/users`, `GET /api/users`, `PATCH /api/users/:id`

## Anti-Patterns
- ❌ Business logic in route handler (extract to service)
- ❌ Manual validation (use Zod schemas)
- ❌ Catching errors without re-throwing
```

### React Component Pattern

```markdown
# React Component Pattern

## When to Use
Creating any new React component

## Structure

Location: `src/components/[ComponentName]/`

```
ComponentName/
├── index.ts              ← Re-export
├── ComponentName.tsx     ← Main component
├── ComponentName.test.tsx ← Tests
├── ComponentName.styles.ts ← Styled components (if needed)
└── types.ts              ← TypeScript types (if complex)
```

```tsx
// ComponentName.tsx
import { FC } from 'react';

interface ComponentNameProps {
  title: string;
  onAction?: () => void;
}

export const ComponentName: FC<ComponentNameProps> = ({ 
  title, 
  onAction 
}) => {
  return (
    <div className="component-name">
      <h2>{title}</h2>
      {onAction && (
        <button onClick={onAction}>Action</button>
      )}
    </div>
  );
};
```

## Conventions
- Named exports (not default)
- Props interface named `[ComponentName]Props`
- Destructure props in function signature
- Optional props have `?` and sensible defaults

## Anti-Patterns
- ❌ Default exports
- ❌ Inline styles (use CSS/styled-components)
- ❌ Business logic in component (extract to hooks)
- ❌ Props spreading without type safety
```

### Test File Pattern

```markdown
# Test File Pattern

## When to Use
Writing tests for any new functionality

## Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createUser } from './create-user';

describe('createUser', () => {
  // Setup
  beforeEach(() => {
    // Reset state, mocks, etc.
  });

  // Group by behavior
  describe('when input is valid', () => {
    it('creates a user with the provided data', async () => {
      // Arrange
      const input = { email: 'test@example.com', name: 'Test' };
      
      // Act
      const result = await createUser(input);
      
      // Assert
      expect(result.email).toBe(input.email);
      expect(result.id).toBeDefined();
    });
  });

  describe('when input is invalid', () => {
    it('throws validation error for invalid email', async () => {
      const input = { email: 'not-an-email', name: 'Test' };
      
      await expect(createUser(input)).rejects.toThrow('Invalid email');
    });
  });
});
```

## Conventions
- File: `[name].test.ts` next to source file
- Describe blocks for grouping
- "when X" / "it does Y" naming
- Arrange-Act-Assert pattern
- One assertion per test (when practical)

## Anti-Patterns
- ❌ Testing implementation details
- ❌ Multiple unrelated assertions
- ❌ Shared mutable state between tests
- ❌ Skipping edge cases
```

## How to Use

### When Creating New Code

Before writing, Claude should:

1. Check if a pattern exists for this type of code
2. Read the pattern file
3. Apply the pattern to the new code
4. Match existing conventions in the project

### Prompt

```
"Create a new [thing]. Follow my patterns in .claude/patterns/"
```

Claude will:
- Read relevant pattern file
- Apply your conventions
- Create consistent code

### When Pattern Doesn't Exist

If you're creating something new:

1. Build it the way you want
2. If it's reusable, extract to a pattern
3. Pattern is now available for all future work

## Per-Project Overrides

Some projects might have different needs. Create project-specific patterns:

```
project-root/.claude/patterns/
└── api-endpoint.md    ← Overrides global pattern for this project
```

Priority:
1. Project patterns (project/.claude/patterns/)
2. Global patterns (~/.claude/patterns/)

## Pattern Discovery

When starting work on a project:

```
"What patterns do I have for this project?"

→ Lists available patterns from .claude/patterns/
→ Shows which are global vs project-specific
```

## Keeping Patterns Updated

When you improve how you do something:

1. Update the pattern file
2. All future code uses the improved pattern
3. (Optionally) refactor old code to match

Patterns are living documents, not set in stone.

