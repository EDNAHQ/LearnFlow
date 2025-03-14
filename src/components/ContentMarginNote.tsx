
import React from "react";
import { LightbulbIcon } from "lucide-react";
import { 
  HoverCard,
  HoverCardTrigger,
  HoverCardContent
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";

interface ContentMarginNoteProps {
  insight: string;
  isLoading?: boolean;
}

const ContentMarginNote = ({ insight, isLoading = false }: ContentMarginNoteProps) => {
  return (
    <div className="absolute right-[-60px] mt-2">
      <HoverCard openDelay={100} closeDelay={200}>
        <HoverCardTrigger asChild>
          <button 
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6D42EF]/90 to-[#E84393]/90 flex items-center justify-center text-white shadow-md hover:shadow-lg transition-all group"
            aria-label="View additional insight"
          >
            <LightbulbIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </HoverCardTrigger>
        <HoverCardContent 
          className="w-80 p-4 shadow-lg border-[#6D42EF]/20 bg-white text-gray-800"
          side="right"
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
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

export default ContentMarginNote;
