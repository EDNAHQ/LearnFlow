
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
        "transition-all duration-300 ease-in-out bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 p-8 md:p-10 mb-8 w-full overflow-hidden relative",
        "before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-br before:from-brand-primary/20 before:via-brand-accent/20 before:to-brand-highlight/20 before:-z-10",
        "hover:shadow-2xl hover:border-brand-primary/30 hover:bg-white/90",
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
