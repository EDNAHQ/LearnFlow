
import { memo } from "react";
import { cn } from "@/lib/utils";

interface ContentSectionContainerProps {
  isVisible: boolean;
  children: React.ReactNode;
}

// Simple container component with fade-in animation
const ContentSectionContainer = memo(({ isVisible, children }: ContentSectionContainerProps) => {
  return (
    <div 
      className={cn(
        "transition-all duration-300 ease-in-out bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-8 mb-8 w-full max-w-5xl mx-auto overflow-hidden",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      {children}
    </div>
  );
});

// Add display name for better debugging
ContentSectionContainer.displayName = "ContentSectionContainer";

export default ContentSectionContainer;
