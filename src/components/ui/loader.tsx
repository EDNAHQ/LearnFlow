
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
      <div className="h-2 w-full bg-gray-200 rounded-full dark:bg-gray-700">
        <div className="h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full w-3/4 animate-[progress_1.5s_ease-in-out_infinite]"></div>
      </div>
    </div>
  )
);
BarLoader.displayName = "BarLoader";
