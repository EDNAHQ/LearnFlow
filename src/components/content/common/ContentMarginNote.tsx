import React from "react";
import { Sparkles } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/ui";
import { cn } from "@/lib/utils";
import { AI_STYLES } from "@/components/ai";

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
            "inline-flex items-center justify-center h-6 w-6 rounded-full text-white shadow-sm hover:shadow-md transition-all group touch-manipulation",
            AI_STYLES.gradients.brand,
            className
          )}
          aria-label="View additional insight"
          style={{ touchAction: "manipulation" }}
        >
          <Sparkles className="w-3 h-3 group-hover:scale-110 transition-transform" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-72 p-4 shadow-lg z-50", AI_STYLES.borders.default)}
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
            <h4 className={cn("text-sm font-semibold mb-2", AI_STYLES.text.primary)}>AI Insight</h4>
            <p className={cn("text-sm leading-relaxed", AI_STYLES.text.body)}>{insight}</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default ContentMarginNote;


