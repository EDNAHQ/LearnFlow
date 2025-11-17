---
name: Edge Function Templates
description: Quick templates for creating Supabase edge functions with consistent patterns for CORS, error handling, and AI integration
---

# Edge Function Templates

You are an edge function expert providing instant templates for Supabase Deno edge functions with LearnFlow patterns.

## Basic Edge Function Template

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts"; // Most functions use this
// Note: Some functions like generate-learning-content use "./utils/cors.ts" - check existing pattern

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { data } = await req.json();

    // Your logic here

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
```

## Edge Function with Authentication

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Your authenticated logic here
    const { data } = await req.json();

    return new Response(
      JSON.stringify({ success: true, userId: user.id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
```

## Edge Function with AI Integration

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAIClient } from "../_shared/ai-provider/index.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, topic } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize AI client
    const aiClient = createAIClient();

    // Generate content
    const response = await aiClient.chat({
      functionType: 'content-generation', // or 'quick-insights', 'deep-analysis', etc.
      messages: [
        { role: 'user', content: prompt }
      ],
      maxTokens: 2000,
      temperature: 0.7,
    });

    const content = response.content;

    if (!content) {
      throw new Error('Empty response from AI');
    }

    return new Response(
      JSON.stringify({ content }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
```

## Edge Function with Database Operations

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, data } = await req.json();

    let result;

    switch (action) {
      case 'create':
        const { data: created, error: createError } = await supabase
          .from('table_name')
          .insert(data)
          .select()
          .single();
        
        if (createError) throw createError;
        result = created;
        break;

      case 'read':
        const { data: read, error: readError } = await supabase
          .from('table_name')
          .select('*')
          .eq('id', data.id);
        
        if (readError) throw readError;
        result = read;
        break;

      case 'update':
        const { data: updated, error: updateError } = await supabase
          .from('table_name')
          .update(data)
          .eq('id', data.id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        result = updated;
        break;

      case 'delete':
        const { error: deleteError } = await supabase
          .from('table_name')
          .delete()
          .eq('id', data.id);
        
        if (deleteError) throw deleteError;
        result = { success: true };
        break;

      default:
        throw new Error('Invalid action');
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
```

## Edge Function with RLS Context (User's Permissions)

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') || '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    // Create client with user's auth context (respects RLS)
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    });

    // Get user (optional - function can work without auth)
    const { data: { user } } = await supabaseClient.auth.getUser();

    // Queries now respect RLS policies
    const { data, error } = await supabaseClient
      .from('table_name')
      .select('*');

    if (error) throw error;

    return new Response(
      JSON.stringify({ data, userId: user?.id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
```

## AI Function Types Available

From `_shared/ai-provider/config.ts`:

- `'content-generation'` - maxTokens: 2500, temperature: 0.7
- `'quick-insights'` - maxTokens: 500, temperature: 0.7
- `'deep-analysis'` - maxTokens: 2000, temperature: 0.7
- `'structured-extraction'` - maxTokens: 1000, temperature: 0.2
- `'related-topics'` - maxTokens: 800, temperature: 0.7
- `'chat-tutor'` - maxTokens: 1500, temperature: 0.8
- `'topic-recommendations'` - maxTokens: 1000, temperature: 0.7

## Deployment Pattern

```bash
# Deploy function
cd C:\Users\OEM\CascadeProjects\LearnFlow
supabase functions deploy function-name --project-ref hjivfywgkiwjvpquxndg

# View in dashboard
https://supabase.com/dashboard/project/hjivfywgkiwjvpquxndg/functions
```

## Best Practices

1. **Always handle CORS** - Use `corsHeaders` from `_shared/cors.ts`
2. **Handle OPTIONS requests** - Required for CORS preflight
3. **Use try-catch** - Always wrap logic in try-catch
4. **Return proper status codes** - 200 for success, 400 for bad request, 401 for unauthorized, 500 for errors
5. **Log errors** - Use `console.error` for debugging
6. **Validate input** - Check required fields before processing
7. **Use AI client** - Use `createAIClient()` from `_shared/ai-provider`
8. **Respect RLS** - Use ANON key with auth header for user-scoped queries
9. **Service role for admin** - Use SERVICE_ROLE_KEY only when bypassing RLS is needed

## Common Patterns

### Input Validation
```typescript
const { field1, field2 } = await req.json();

if (!field1 || !field2) {
  return new Response(
    JSON.stringify({ error: 'field1 and field2 are required' }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

### Method Validation
```typescript
if (req.method !== 'POST') {
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

### Error Response Format
```typescript
return new Response(
  JSON.stringify({ 
    error: error instanceof Error ? error.message : 'Unknown error',
    // Optional: include more context
    details: process.env.DENO_ENV === 'development' ? error.stack : undefined,
  }),
  {
    status: 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  }
);
```

