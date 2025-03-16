
import React from "react";
import { LightbulbIcon } from "lucide-react";
import { 
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ContentMarginNoteProps {
  insight: string;
  isLoading?: boolean;
  className?: string;
}

const ContentMarginNote = ({ insight, isLoading = false, className }: ContentMarginNoteProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          className={cn(
            "inline-flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-[#6D42EF]/90 to-[#E84393]/90 text-white shadow-sm hover:shadow-md transition-all group touch-manipulation",
            className
          )}
          aria-label="View additional insight"
          style={{ touchAction: "manipulation" }}
        >
          <LightbulbIcon className="w-3 h-3 group-hover:scale-110 transition-transform" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-72 p-4 shadow-lg border-[#6D42EF]/20 bg-white text-gray-800 z-50"
        side={isMobile ? "bottom" : "right"}
        align={isMobile ? "center" : "start"}
        sideOffset={5}
        alignOffset={5}
      >
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        ) : (
          <div>
            <h4 className="text-sm font-semibold text-[#6D42EF] mb-2">AI Insight</h4>
            <p className="text-sm leading-relaxed">{insight}</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default ContentMarginNote;
