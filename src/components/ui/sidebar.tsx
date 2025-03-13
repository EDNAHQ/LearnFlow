
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const sidebarVariants = cva(
  "fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border overflow-y-auto scrollbar-none",
  {
    variants: {
      variant: {
        default: "bg-sidebar border-sidebar-border",
        light: "bg-white border-gray-100",
        dark: "bg-gray-900 border-gray-800",
        transparent: "bg-transparent border-transparent backdrop-blur-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  container?: HTMLElement | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, variant, container, open, onOpenChange, ...props }, ref) => {
    return (
      <div
        className={cn(
          sidebarVariants({ variant }),
          className,
          !open && "translate-x-[-100%]",
          "transition-transform"
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("sticky top-0 z-10 px-6 py-4 bg-inherit", className)}
    {...props}
  />
))

SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("sticky bottom-0 z-10 px-6 py-4 bg-inherit", className)}
    {...props}
  />
))

SidebarFooter.displayName = "SidebarFooter"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-6 py-4 w-full", className)} {...props} />
))

SidebarContent.displayName = "SidebarContent"

const SidebarTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold text-sidebar-foreground", className)}
    {...props}
  />
))

SidebarTitle.displayName = "SidebarTitle"

const SidebarDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-sidebar-foreground/80", className)}
    {...props}
  />
))

SidebarDescription.displayName = "SidebarDescription"

const SidebarItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center py-2 text-sidebar-foreground hover:text-sidebar-foreground/90 rounded-md cursor-pointer",
      className
    )}
    {...props}
  />
))

SidebarItem.displayName = "SidebarItem"

const SidebarItemActive = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center py-2 text-sidebar-primary bg-sidebar-accent rounded-md cursor-pointer",
      className
    )}
    {...props}
  />
))

SidebarItemActive.displayName = "SidebarItemActive"

const SidebarItemIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("w-4 h-4 mr-3 shrink-0", className)}
    {...props}
  />
))

SidebarItemIcon.displayName = "SidebarItemIcon"

const SidebarSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("h-[1px] w-full bg-sidebar-border my-4", className)}
    {...props}
  />
))

SidebarSeparator.displayName = "SidebarSeparator"

export {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarTitle,
  SidebarDescription,
  SidebarItem,
  SidebarItemActive,
  SidebarItemIcon,
  SidebarSeparator,
}
