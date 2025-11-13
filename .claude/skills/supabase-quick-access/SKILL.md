---
name: Supabase Quick Access
description: Provides instant access to Supabase code patterns and common database operations, with LearnFlow project configuration
---

# Supabase Quick Access

You are a Supabase expert providing instant access to database operations, authentication patterns, and real-time features.

## 🚀 LearnFlow Project Quick Reference

### Project Details
- **Project Name**: LearnFlow
- **Project Reference ID**: `hjivfywgkiwjvpquxndg`
- **Region**: Oceania (Sydney)
- **Organization**: eosdqrnnloqyyotzstpn

### Quick Deploy Commands

#### Deploy Edge Functions
```bash
cd C:\Users\OEM\CascadeProjects\LearnFlow
supabase functions deploy <function-name> --project-ref hjivfywgkiwjvpquxndg
```

#### Example: Deploy generate-learning-content
```bash
supabase functions deploy generate-learning-content --project-ref hjivfywgkiwjvpquxndg
```

#### View Deployment Dashboard
```
https://supabase.com/dashboard/project/hjivfywgkiwjvpquxndg/functions
```

### Edge Functions Deployed
- **generate-learning-content**: Handles learning plan generation and step content creation
  - Location: `supabase/functions/generate-learning-content/`
  - Handlers: 
    - `plan-generator.ts` - Generates 10-step learning plans
    - `content-generator.ts` - Generates 600-700 word educational content per step
    - `questions-generator.ts` - Generates learning assessment questions
  - Utilities: OpenAI integration with Supabase database persistence
  - Config: Uses fallback import map at `supabase/functions/import_map.json`

## Core Setup

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);
```

## Authentication Patterns

- Sign up with email/password
- Sign in with credentials
- OAuth (Google/GitHub)
- Session management
- Sign out

## Database Operations

### SELECT
- Fetch all records
- Fetch with filters
- Fetch with sorting
- Fetch with pagination
- Fetch with joins
- Search/full-text search

### INSERT
- Single record
- Multiple records
- Batch operations

### UPDATE
- Update by ID
- Update with conditions
- Upsert (insert or update)

### DELETE
- Delete by ID
- Delete with conditions

## Real-Time

- Subscribe to table changes
- Subscribe to specific records
- Handle updates, inserts, deletes
- Proper cleanup on unmount

## File Storage

- Upload files
- Download files
- Delete files
- Get public URLs
- Manage permissions

## Best Practices

- Always handle errors
- Use TypeScript types
- Implement proper error handling
- Cache queries when appropriate
- Use real-time subscriptions efficiently
- Enable row-level security (RLS)
- Use indexes on frequently queried columns
- Implement pagination for large datasets
- Clean up subscriptions on component unmount

## When Using

Provide TypeScript code following these patterns. Include error handling and type safety. Adapt table names and columns to specific use case.

## LearnFlow Deployment Workflow

### For Quick Deployment of Edge Functions:
1. Make changes to the edge function files in `supabase/functions/`
2. Run: `supabase functions deploy generate-learning-content --project-ref hjivfywgkiwjvpquxndg`
3. Monitor in dashboard: https://supabase.com/dashboard/project/hjivfywgkiwjvpquxndg/functions

### generate-learning-content Function Overview
The function handles AI-powered learning content generation with three main handlers:

**Plan Generator** (`plan-generator.ts`)
- Creates a 10-step differentiated learning plan for any topic
- Returns JSON with step titles and descriptions
- Uses OpenAI with curriculum design expertise

**Content Generator** (`content-generator.ts`)
- Generates 600-700 word educational content per step
- Phase-aware: foundational → intermediate → advanced
- Includes content validation (length, truncation checks)
- Caches content in Supabase to avoid regeneration

**Questions Generator** (`questions-generator.ts`)
- Creates assessment questions for each step
- Validates and stores in database

All functions use shared OpenAI utilities and database persistence patterns with proper error handling.

