
import { Button } from "@/components/ui/button";
import { BookOpen, Presentation, Music } from "lucide-react";
import { useContentMode } from "@/hooks/useContentMode";
import { cn } from "@/lib/utils";

export const ModeToggle = () => {
  const { mode, toggleMode } = useContentMode();

  // This component has been replaced by the built-in tabs in ContentDisplay.tsx
  // Kept for backward compatibility
  return (
    <div className="hidden">
      {/* Functionality moved to ContentDisplay.tsx */}
    </div>
  );
};
