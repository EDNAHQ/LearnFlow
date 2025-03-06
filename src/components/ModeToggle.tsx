
import { Button } from "@/components/ui/button";
import { BookOpen, Presentation } from "lucide-react";
import { useContentMode } from "@/hooks/useContentMode";
import { cn } from "@/lib/utils";

export const ModeToggle = () => {
  const { mode, toggleMode } = useContentMode();

  return (
    <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full p-1 border border-gray-200">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => mode !== "e-book" && toggleMode()}
        className={cn(
          "rounded-full px-3 flex items-center gap-1.5",
          mode === "e-book" 
            ? "bg-[#6D42EF] text-white" 
            : "text-white hover:text-[#6D42EF] hover:bg-white/20"
        )}
      >
        <BookOpen className="h-4 w-4" />
        <span className="text-xs font-medium">Read</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => mode !== "presentation" && toggleMode()}
        className={cn(
          "rounded-full px-3 flex items-center gap-1.5",
          mode === "presentation" 
            ? "bg-[#6D42EF] text-white" 
            : "text-white hover:text-[#6D42EF] hover:bg-white/20"
        )}
      >
        <Presentation className="h-4 w-4" />
        <span className="text-xs font-medium">Present</span>
      </Button>
    </div>
  );
};
