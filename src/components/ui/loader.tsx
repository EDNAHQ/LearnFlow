
import * as React from "react";
import { cn } from "@/lib/utils";

export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const BarLoader = React.forwardRef<HTMLDivElement, LoaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("animate-pulse", className)}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <div className="h-2 w-full bg-gray-200 rounded-full dark:bg-gray-700 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-brand-purple to-brand-pink rounded-full animate-[progress_2s_ease-in-out_infinite] relative">
          {/* Add a shine effect for more visual feedback */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shine"></div>
        </div>
      </div>
    </div>
  )
);
BarLoader.displayName = "BarLoader";
