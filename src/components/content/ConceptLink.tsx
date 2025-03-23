
import React from "react";
import { InfoIcon } from "lucide-react";
import { 
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

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
          className="relative inline border-b-2 border-dotted border-purple-500 text-purple-900 font-medium group cursor-pointer bg-purple-50/60 px-0.5 rounded" 
        >
          {children}
          <span className="inline-block ml-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
            <InfoIcon className="h-3.5 w-3.5 inline-block text-purple-500" />
          </span>
        </span>
      </PopoverTrigger>
      <PopoverContent 
        className="w-72 p-4 shadow-lg border-[#6D42EF]/20 bg-white text-gray-800"
        side={isMobile ? "bottom" : "top"}
        align="center"
        sideOffset={5}
      >
        <div>
          <h4 className="text-[#6D42EF] font-semibold mb-1">{term}</h4>
          <p className="text-sm mb-3">{definition}</p>
          
          {relatedConcepts && relatedConcepts.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Related concepts:</div>
              <div className="flex flex-wrap gap-1">
                {relatedConcepts.map((concept, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs cursor-pointer hover:bg-purple-50"
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
