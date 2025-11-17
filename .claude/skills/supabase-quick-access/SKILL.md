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
- **Working Directory**: `C:\Users\OEM\CascadeProjects\LearnFlow`

### ⚡ Most Common Commands (Copy-Paste Ready)

**Push migrations:**
```bash
cd C:\Users\OEM\CascadeProjects\LearnFlow; supabase db push
```

**Regenerate types after migration:**
```bash
cd C:\Users\OEM\CascadeProjects\LearnFlow; supabase gen types typescript --project-id hjivfywgkiwjvpquxndg > src/integrations/supabase/types.ts
```

**Deploy edge function:**
```bash
cd C:\Users\OEM\CascadeProjects\LearnFlow; supabase functions deploy <function-name> --project-ref hjivfywgkiwjvpquxndg
```

**Check migration status:**
```bash
cd C:\Users\OEM\CascadeProjects\LearnFlow; supabase migration list
```


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

## 🗄️ Database Migrations

### Migration Workflow

**1. Create a new migration:**
```bash
cd C:\Users\OEM\CascadeProjects\LearnFlow
supabase migration new <migration_name>
```
Creates a new migration file in `supabase/migrations/` with timestamp prefix.

**2. Push migrations to remote database:**
```bash
cd C:\Users\OEM\CascadeProjects\LearnFlow
supabase db push
```
Pushes all local migrations that haven't been applied to the remote database.

**3. Check migration status:**
```bash
supabase migration list
```
Shows which migrations are applied locally vs remotely.

**4. Pull remote migrations:**
```bash
supabase db pull
```
Syncs remote migrations to local (if remote has migrations not in local).

**5. Repair migration history (if out of sync):**
```bash
# Mark a migration as reverted
supabase migration repair --status reverted <migration_timestamp>

# Mark a migration as applied
supabase migration repair --status applied <migration_timestamp>
```

**6. Regenerate TypeScript types after migrations:**
```bash
cd C:\Users\OEM\CascadeProjects\LearnFlow
supabase gen types typescript --project-id hjivfywgkiwjvpquxndg > src/integrations/supabase/types.ts
```
**CRITICAL**: Always regenerate types after applying migrations to keep TypeScript types in sync.

### Migration Troubleshooting

**Problem**: "Remote migration versions not found in local migrations directory"
- **Solution**: Run `supabase db pull` to sync, or repair migration history with `supabase migration repair`

**Problem**: "Migration history does not match"
- **Solution**: Use `supabase migration repair` to mark migrations as reverted/applied to match actual state

**Problem**: Types are out of sync after migration
- **Solution**: Always run `supabase gen types typescript --project-id hjivfywgkiwjvpquxndg > src/integrations/supabase/types.ts`

### Migration Best Practices

1. **Always test migrations locally first** (if using local Supabase)
2. **Regenerate types immediately after pushing migrations**
3. **Use descriptive migration names**: `20240101000000_extend_user_profiles_capability_data.sql`
4. **Include RLS policies** in migrations for new tables
5. **Add indexes** for frequently queried columns
6. **Use transactions** for complex migrations (Supabase handles this automatically)

## 🚀 Edge Functions Deployment

### Deploy Single Function
```bash
cd C:\Users\OEM\CascadeProjects\LearnFlow
supabase functions deploy <function-name> --project-ref hjivfywgkiwjvpquxndg
```

### Deploy All Functions
```bash
cd C:\Users\OEM\CascadeProjects\LearnFlow
supabase functions deploy --project-ref hjivfywgkiwjvpquxndg
```

### View Function Logs
```bash
supabase functions logs <function-name> --project-ref hjivfywgkiwjvpquxndg
```

### View Deployment Dashboard
```
https://supabase.com/dashboard/project/hjivfywgkiwjvpquxndg/functions
```

### Edge Functions in LearnFlow

**generate-learning-content** (`supabase/functions/generate-learning-content/`)
- Handles learning plan generation and step content creation
- Handlers: `plan-generator.ts`, `content-generator.ts`, `questions-generator.ts`
- Deploy: `supabase functions deploy generate-learning-content --project-ref hjivfywgkiwjvpquxndg`

**edna-sso** (`supabase/functions/edna-sso/`)
- SSO authentication handler
- Deploy: `supabase functions deploy edna-sso --project-ref hjivfywgkiwjvpquxndg`

**sso-login** (`supabase/functions/sso-login/`)
- SSO login handler
- Deploy: `supabase functions deploy sso-login --project-ref hjivfywgkiwjvpquxndg`

**text-to-speech** (`supabase/functions/text-to-speech/`)
- Text-to-speech conversion
- Deploy: `supabase functions deploy text-to-speech --project-ref hjivfywgkiwjvpquxndg`

**openai-tts** (`supabase/functions/openai-tts/`)
- OpenAI TTS integration
- Deploy: `supabase functions deploy openai-tts --project-ref hjivfywgkiwjvpquxndg`

**generate-mental-model-images** (`supabase/functions/generate-mental-model-images/`)
- Generates mental model diagrams
- Deploy: `supabase functions deploy generate-mental-model-images --project-ref hjivfywgkiwjvpquxndg`

**generate-ai-insight** (`supabase/functions/generate-ai-insight/`)
- Generates AI insights for Explore Further questions
- Deploy: `supabase functions deploy generate-ai-insight --project-ref hjivfywgkiwjvpquxndg`

**generate-deep-dive-topics** (`supabase/functions/generate-deep-dive-topics/`)
- Lists related topics
- Deploy: `supabase functions deploy generate-deep-dive-topics --project-ref hjivfywgkiwjvpquxndg`

**generate-deep-dive-content** (`supabase/functions/generate-deep-dive-content/`)
- Generates deep dive articles
- Deploy: `supabase functions deploy generate-deep-dive-content --project-ref hjivfywgkiwjvpquxndg`

## 📋 Common Commands Reference

### Project Management
```bash
# List all projects
supabase projects list

# Link to project (already linked for LearnFlow)
supabase link --project-ref hjivfywgkiwjvpquxndg

# Check project status
supabase status
```

### Database Operations
```bash
# Push migrations
supabase db push

# Pull migrations
supabase db pull

# Reset local database (WARNING: destructive)
supabase db reset

# Execute SQL directly
supabase db execute "<SQL>" --project-ref hjivfywgkiwjvpquxndg
```

### Type Generation
```bash
# Generate TypeScript types
supabase gen types typescript --project-id hjivfywgkiwjvpquxndg > src/integrations/supabase/types.ts

# Generate types for local database
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

## 🔧 LearnFlow-Specific Workflows

### Complete Migration Workflow
1. Create migration: `supabase migration new <name>`
2. Write SQL in the generated file
3. Push to remote: `supabase db push`
4. Regenerate types: `supabase gen types typescript --project-id hjivfywgkiwjvpquxndg > src/integrations/supabase/types.ts`
5. Verify types updated correctly

### Complete Edge Function Deployment Workflow
1. Make changes to function in `supabase/functions/<function-name>/`
2. Deploy: `supabase functions deploy <function-name> --project-ref hjivfywgkiwjvpquxndg`
3. Check logs if issues: `supabase functions logs <function-name> --project-ref hjivfywgkiwjvpquxndg`
4. Monitor in dashboard: https://supabase.com/dashboard/project/hjivfywgkiwjvpquxndg/functions

### generate-learning-content Function Details
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

