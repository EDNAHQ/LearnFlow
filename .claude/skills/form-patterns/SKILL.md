---
name: Form Patterns
description: Quick templates and patterns for creating forms with react-hook-form, zod validation, and shadcn/ui components
---

# Form Patterns

You are a form expert providing instant access to form patterns. LearnFlow currently uses simple useState forms (see AuthForm.tsx), but has shadcn/ui Form components available for react-hook-form + zod when needed.

## Current Form Pattern (Simple useState)

```typescript
// Current pattern used in AuthForm.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export function MyForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Your logic here
      setSuccess("Success!");
    } catch (error: any) {
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
          className="h-12"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      <Button 
        type="submit" 
        variant="brand" 
        className="w-full h-12 text-base font-semibold" 
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit"
        )}
      </Button>
    </form>
  );
}
```

## Advanced Form Pattern (react-hook-form + zod)

When you need validation, use this pattern with shadcn/ui Form components:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// 1. Define Zod schema
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.number().min(18, "Must be 18 or older").optional(),
});

type FormValues = z.infer<typeof formSchema>;

// 2. Component with form
export const MyForm = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      age: undefined,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // Handle submission
      console.log(values);
    } catch (error) {
      // Handle error
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="brand-gradient text-white">
          Submit
        </Button>
      </form>
    </Form>
  );
};
```

## Common Zod Schemas

```typescript
// Email
z.string().email("Invalid email address")

// Required string with min length
z.string().min(2, "Must be at least 2 characters")

// Optional string
z.string().optional()

// Number with range
z.number().min(0).max(100)

// URL
z.string().url("Invalid URL")

// Password (min 8 chars)
z.string().min(8, "Password must be at least 8 characters")

// Confirm password match
z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Array with min items
z.array(z.string()).min(1, "At least one item required")

// Enum
z.enum(["option1", "option2"], {
  errorMap: () => ({ message: "Invalid option" }),
})
```

## Form Field Patterns

### Text Input
```typescript
<FormField
  control={form.control}
  name="fieldName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Label</FormLabel>
      <FormControl>
        <Input {...field} placeholder="Placeholder" />
      </FormControl>
      <FormDescription>Optional description</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Textarea
```typescript
import { Textarea } from "@/components/ui/textarea";

<FormField
  control={form.control}
  name="description"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Description</FormLabel>
      <FormControl>
        <Textarea {...field} rows={4} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Select Dropdown
```typescript
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

<FormField
  control={form.control}
  name="category"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Category</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Checkbox
```typescript
import { Checkbox } from "@/components/ui/checkbox";

<FormField
  control={form.control}
  name="terms"
  render={({ field }) => (
    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
      <FormControl>
        <Checkbox
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
      <div className="space-y-1 leading-none">
        <FormLabel>Accept terms</FormLabel>
        <FormMessage />
      </div>
    </FormItem>
  )}
/>
```

### Radio Group
```typescript
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

<FormField
  control={form.control}
  name="type"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Type</FormLabel>
      <FormControl>
        <RadioGroup
          onValueChange={field.onChange}
          defaultValue={field.value}
          className="flex flex-col space-y-1"
        >
          <FormItem className="flex items-center space-x-3 space-y-0">
            <FormControl>
              <RadioGroupItem value="option1" />
            </FormControl>
            <FormLabel className="font-normal">Option 1</FormLabel>
          </FormItem>
          <FormItem className="flex items-center space-x-3 space-y-0">
            <FormControl>
              <RadioGroupItem value="option2" />
            </FormControl>
            <FormLabel className="font-normal">Option 2</FormLabel>
          </FormItem>
        </RadioGroup>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Form Submission Patterns

### With Loading State
```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const onSubmit = async (values: FormValues) => {
  setIsSubmitting(true);
  try {
    await submitData(values);
    // Success handling
  } catch (error) {
    form.setError("root", {
      message: error instanceof Error ? error.message : "An error occurred",
    });
  } finally {
    setIsSubmitting(false);
  }
};

<Button type="submit" disabled={isSubmitting} className="brand-gradient text-white">
  {isSubmitting ? "Submitting..." : "Submit"}
</Button>
```

### With Supabase Integration
```typescript
import { supabase } from "@/integrations/supabase";

const onSubmit = async (values: FormValues) => {
  try {
    const { data, error } = await supabase
      .from("table_name")
      .insert(values);
    
    if (error) throw error;
    // Success handling
  } catch (error) {
    form.setError("root", {
      message: error instanceof Error ? error.message : "Failed to submit",
    });
  }
};
```

### With Error Display
```typescript
{form.formState.errors.root && (
  <div className="text-sm text-red-500">
    {form.formState.errors.root.message}
  </div>
)}
```

## Form Validation Patterns

### Conditional Validation
```typescript
const schema = z.object({
  hasAccount: z.boolean(),
  email: z.string().optional(),
}).refine((data) => {
  if (data.hasAccount) {
    return data.email && z.string().email().safeParse(data.email).success;
  }
  return true;
}, {
  message: "Email is required when account is selected",
  path: ["email"],
});
```

### Async Validation
```typescript
const schema = z.object({
  username: z.string().refine(async (username) => {
    const { data } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .single();
    return !data; // Username available if no data
  }, {
    message: "Username already taken",
  }),
});
```

## Best Practices

1. **Always use zodResolver** - Type-safe validation
2. **Define schema first** - Then infer TypeScript types
3. **Use FormField component** - Provides proper error handling
4. **Handle loading states** - Disable submit button during submission
5. **Display root errors** - Show general form errors
6. **Use FormDescription** - Help users understand fields
7. **Follow brand guidelines** - Use `brand-gradient` for submit buttons
8. **Mobile-friendly** - Ensure inputs are at least 44px tall

## Common Mistakes to Avoid

❌ Not using zodResolver - loses type safety
❌ Inline validation - use zod schemas instead
❌ Missing error handling - always handle submission errors
❌ No loading states - users don't know if form is submitting
❌ Skipping FormMessage - errors won't display properly
❌ Not following brand colors - use brand-gradient for buttons

