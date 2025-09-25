
import React from "react";
import { Sparkles } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/ui";
import { AI_STYLES } from "@/components/ai";
import { cn } from "@/lib/utils";

interface ConceptLinkProps {
  term: string;
  definition: string;
  relatedConcepts?: string[];
  onRelatedConceptClick?: (concept: string) => void;
  children: React.ReactNode;
}

const ConceptLink = ({ 
  term, 
  definition, 
  relatedConcepts = [],
  onRelatedConceptClick,
  children 
}: ConceptLinkProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <span
          className={cn(
            "relative inline border-b-2 border-dotted font-medium cursor-pointer px-1.5 py-0.5 rounded transition-colors",
            AI_STYLES.text.primary,
            AI_STYLES.backgrounds.surface,
            AI_STYLES.backgrounds.hover
          )}
        >
          {children}
          <Sparkles className={cn("h-3.5 w-3.5 inline-block ml-0.5", AI_STYLES.text.primary)} />
        </span>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-80 p-4 shadow-lg", AI_STYLES.borders.default)}
        side={isMobile ? "bottom" : "top"}
        align="center"
        sideOffset={5}
      >
        <div>
          <h4 className={cn("font-semibold text-lg mb-2", AI_STYLES.text.primary)}>{term}</h4>
          <p className="text-sm mb-3">{definition}</p>
          
          {relatedConcepts && relatedConcepts.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Related concepts:</div>
              <div className="flex flex-wrap gap-1.5">
                {relatedConcepts.map((concept, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className={cn("text-xs cursor-pointer", AI_STYLES.backgrounds.hover, AI_STYLES.borders.default)}
                    onClick={() => onRelatedConceptClick && onRelatedConceptClick(concept)}
                  >
                    {concept}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ConceptLink;
