---
name: Error Handling Patterns
description: Consistent error handling patterns for components, hooks, and edge functions
---

# Error Handling Patterns

You are an error handling expert ensuring consistent error patterns across LearnFlow.

## Component Error Display Patterns

### AI Error State (LearnFlow Pattern)
```typescript
import AIErrorState from "@/components/ai/AIErrorState";

// Compact inline error
<AIErrorState message={error} compact />

// Full error with retry
<AIErrorState 
  message={error || "Failed to generate content"} 
  onRetry={handleRetry}
/>
```

### Simple Error Display (Current Pattern)
```typescript
// Simple error display used in AuthForm and other components
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
    {error}
  </div>
)}

// Success message pattern
{success && (
  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
    {success}
  </div>
)}
```

### Inline Error (Compact)
```typescript
import { AlertCircle } from "lucide-react";

<div className="flex items-center gap-2 text-red-500 text-sm">
  <AlertCircle className="h-4 w-4" />
  <span>{error}</span>
</div>
```

### Compact Error Display
```typescript
import { AlertCircle } from "lucide-react";

export const CompactError = ({ error }: { error: string | null }) => {
  if (!error) return null;

  return (
    <div className="flex items-center gap-2 text-red-500 text-sm">
      <AlertCircle className="h-4 w-4" />
      <span>{error}</span>
    </div>
  );
};
```

### Inline Form Error
```typescript
// Already handled by FormMessage component from react-hook-form
<FormMessage /> // Displays field-level errors automatically
```

## Hook Error Handling Pattern

```typescript
import { useState, useCallback } from 'react';

export const useMyHook = () => {
  const [data, setData] = useState<DataType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      
      const { data, error: supabaseError } = await supabase
        .from('table')
        .select('*');
      
      if (supabaseError) throw supabaseError;
      setData(data);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error in useMyHook:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchData };
};
```

## Async Function Error Handling

```typescript
// Always wrap async operations in try-catch
const handleAction = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const result = await someAsyncOperation();
    // Handle success
  } catch (err) {
    const errorMessage = err instanceof Error 
      ? err.message 
      : 'An unexpected error occurred';
    setError(errorMessage);
    
    // Optional: Show toast notification
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};
```

## Supabase Query Error Handling

```typescript
const fetchData = async () => {
  try {
    const { data, error } = await supabase
      .from('table_name')
      .select('*');
    
    if (error) {
      // Supabase errors are already Error objects
      throw error;
    }
    
    return data;
  } catch (err) {
    // Handle specific Supabase error codes
    if (err instanceof Error) {
      if (err.message.includes('JWT')) {
        // Auth error
        throw new Error('Authentication required');
      } else if (err.message.includes('permission')) {
        // RLS error
        throw new Error('You do not have permission to access this');
      }
    }
    throw err;
  }
};
```

## Edge Function Error Handling

```typescript
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Your logic
    const result = await someOperation();
    
    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in edge function:', error);
    
    // Determine status code
    const status = error instanceof Error && error.message.includes('Unauthorized')
      ? 401
      : error instanceof Error && error.message.includes('not found')
      ? 404
      : 500;
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
```

## Error Boundary Pattern

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-medium mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4 text-center">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="brand-gradient text-white"
          >
            Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Toast Notification Pattern

```typescript
import { toast } from 'sonner';

// Success
toast.success('Operation completed successfully');

// Error
toast.error('Operation failed: ' + errorMessage);

// Loading
const toastId = toast.loading('Processing...');
// Later: toast.success('Done!', { id: toastId });
```

## Error Type Detection

```typescript
// Check for specific error types
const isNetworkError = (error: unknown) => {
  return error instanceof Error && (
    error.message.includes('network') ||
    error.message.includes('fetch') ||
    error.message.includes('timeout')
  );
};

const isAuthError = (error: unknown) => {
  return error instanceof Error && (
    error.message.includes('JWT') ||
    error.message.includes('authentication') ||
    error.message.includes('Unauthorized')
  );
};

const isValidationError = (error: unknown) => {
  return error instanceof Error && (
    error.message.includes('validation') ||
    error.message.includes('invalid') ||
    error.message.includes('required')
  );
};
```

## Best Practices

1. **Always handle errors** - Never let errors bubble up unhandled
2. **Clear error messages** - User-friendly messages, not technical jargon
3. **Log errors** - Use `console.error` for debugging
4. **Clear previous errors** - Set error to null when starting new operations
5. **Provide retry options** - Allow users to retry failed operations
6. **Use proper error types** - Distinguish between network, auth, validation errors
7. **Show loading states** - Users should know something is happening
8. **Use error boundaries** - Catch React component errors
9. **Consistent error format** - Use same error display components
10. **Handle edge cases** - What if error is null? What if it's not an Error object?

## Common Error Scenarios

### Network Error
```typescript
catch (err) {
  if (err instanceof Error && err.message.includes('fetch')) {
    setError('Network error. Please check your connection.');
  }
}
```

### Authentication Error
```typescript
catch (err) {
  if (err instanceof Error && err.message.includes('JWT')) {
    // Redirect to login or show auth error
    setError('Please sign in to continue');
  }
}
```

### Validation Error
```typescript
catch (err) {
  if (err instanceof Error && err.message.includes('validation')) {
    // Show field-specific errors
    form.setError('fieldName', { message: err.message });
  }
}
```

### Rate Limit Error
```typescript
catch (err) {
  if (err instanceof Error && err.message.includes('rate limit')) {
    setError('Too many requests. Please wait a moment.');
  }
}
```

