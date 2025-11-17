---
name: Component Templates
description: Quick templates for common UI components using shadcn/ui and brand guidelines
---

# Component Templates

You are a component expert providing instant templates for common UI patterns using shadcn/ui components and LearnFlow brand guidelines.

## Card Component Template

```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MyCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const MyCard = ({ title, description, children, action }: MyCardProps) => {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="font-medium text-xl">{title}</CardTitle>
        {description && (
          <CardDescription className="font-light">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {children}
        {action && (
          <Button
            onClick={action.onClick}
            className="mt-4 brand-gradient text-white"
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
```

## Modal/Dialog Template

```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MyModalProps {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmLabel?: string;
}

export const MyModal = ({
  trigger,
  title,
  description,
  children,
  onConfirm,
  confirmLabel = "Confirm",
}: MyModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-medium">{title}</DialogTitle>
          {description && (
            <DialogDescription className="font-light">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="py-4">
          {children}
        </div>
        {onConfirm && (
          <div className="flex justify-end gap-2">
            <Button
              onClick={onConfirm}
              className="brand-gradient text-white"
            >
              {confirmLabel}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
```

## Loading State Template

### Use AILoadingState Component (LearnFlow Pattern)
```typescript
import AILoadingState from "@/components/ai/AILoadingState";

// Minimal inline loading
<AILoadingState variant="minimal" message="Loading..." size="sm" />

// Animated logo loading (full screen or section)
<AILoadingState variant="animated" message="Generating content..." />

// Default loading
<AILoadingState message="Loading..." />
```

### Simple Loading with Loader2
```typescript
import { Loader2 } from "lucide-react";

// Button loading state
<Button disabled={loading}>
  {loading ? (
    <>
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      Loading...
    </>
  ) : (
    "Submit"
  )}
</Button>
```

## Error State Template

### Use AIErrorState Component (LearnFlow Pattern)
```typescript
import AIErrorState from "@/components/ai/AIErrorState";

// Compact inline error
<AIErrorState message={error} compact />

// Full error with retry
<AIErrorState 
  message={error || "Failed to load"} 
  onRetry={handleRetry}
/>
```

### Simple Error Display
```typescript
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
    {error}
  </div>
)}
```

## Empty State Template

```typescript
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Icon className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="font-medium text-lg mb-2">{title}</h3>
      <p className="font-light text-gray-600 mb-6 max-w-md">{description}</p>
      {action && (
        <Button
          onClick={action.onClick}
          className="brand-gradient text-white"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};
```

## List/Grid Item Template

```typescript
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

interface ListItemProps {
  title: string;
  description?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const ListItem = ({ title, description, onClick, children }: ListItemProps) => {
  return (
    <Card
      className={`rounded-xl p-4 ${onClick ? 'cursor-pointer hover:brand-gradient-light transition-colors' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-base mb-1">{title}</h3>
          {description && (
            <p className="font-light text-sm text-gray-600">{description}</p>
          )}
          {children}
        </div>
        {onClick && (
          <ChevronRight className="h-5 w-5 text-gray-400 ml-2" />
        )}
      </div>
    </Card>
  );
};
```

## Badge/Tag Template

```typescript
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  label: string;
  variant?: "default" | "success" | "warning" | "error";
}

export const StatusBadge = ({ label, variant = "default" }: StatusBadgeProps) => {
  const variantClasses = {
    default: "bg-brand-purple/10 text-brand-purple",
    success: "bg-green-100 text-green-700",
    warning: "bg-brand-gold/10 text-brand-gold",
    error: "bg-red-100 text-red-700",
  };

  return (
    <Badge className={variantClasses[variant]}>
      {label}
    </Badge>
  );
};
```

## Tabs Template

```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
}

interface MyTabsProps {
  tabs: TabItem[];
  defaultValue?: string;
}

export const MyTabs = ({ tabs, defaultValue }: MyTabsProps) => {
  const defaultTab = defaultValue || tabs[0]?.value;

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="font-medium">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-4">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};
```

## Dropdown Menu Template

```typescript
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";

interface MenuItem {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  destructive?: boolean;
}

interface MyDropdownProps {
  items: MenuItem[];
  trigger?: React.ReactNode;
}

export const MyDropdown = ({ items, trigger }: MyDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl">
        {items.map((item, index) => (
          <div key={index}>
            {index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={item.onClick}
              className={item.destructive ? "text-red-600" : ""}
            >
              {item.icon && <item.icon className="mr-2 h-4 w-4" />}
              {item.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
```

## Toast Notification Template

```typescript
import { toast } from "sonner";
import { CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react";

// Success toast
export const showSuccessToast = (message: string) => {
  toast.success(message, {
    icon: <CheckCircle2 className="h-5 w-5" />,
  });
};

// Error toast
export const showErrorToast = (message: string) => {
  toast.error(message, {
    icon: <XCircle className="h-5 w-5" />,
  });
};

// Info toast
export const showInfoToast = (message: string) => {
  toast.info(message, {
    icon: <Info className="h-5 w-5" />,
  });
};

// Warning toast
export const showWarningToast = (message: string) => {
  toast.warning(message, {
    icon: <AlertTriangle className="h-5 w-5" />,
  });
};
```

## Search Input Template

```typescript
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
}

export const SearchInput = ({ 
  placeholder = "Search...", 
  onSearch,
  debounceMs = 300 
}: SearchInputProps) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, onSearch]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10 rounded-xl"
      />
    </div>
  );
};
```

## Best Practices

1. **Follow brand guidelines** - Use `brand-gradient` for primary actions
2. **Use shadcn/ui components** - Consistent with existing codebase
3. **Type everything** - Use TypeScript interfaces for props
4. **Mobile-first** - Ensure components work on mobile
5. **Accessible** - Use proper ARIA labels and semantic HTML
6. **Consistent spacing** - Use Tailwind spacing scale
7. **Loading states** - Always show loading indicators
8. **Error handling** - Include error states in components
9. **Responsive** - Use responsive Tailwind classes
10. **Reusable** - Make components flexible with props

## Common Patterns

### Hover Effects
```typescript
className="group hover:brand-gradient-light transition-colors"
```

### Brand Gradient Button
```typescript
className="brand-gradient text-white hover:opacity-90"
```

### Card with Brand Accent
```typescript
<div className="h-1 brand-gradient mt-4"></div>
```

### Text Gradient
```typescript
<span className="text-gradient">Highlighted Text</span>
```

