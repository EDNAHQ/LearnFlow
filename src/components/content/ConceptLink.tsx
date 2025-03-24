
import React from "react";
import { InfoIcon } from "lucide-react";
import { 
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover";
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
          className="relative inline border-b-2 border-dotted border-[#6D42EF] text-[#6D42EF] font-medium cursor-pointer bg-purple-50/80 px-1.5 py-0.5 rounded hover:bg-purple-100/80 transition-colors" 
        >
          {children}
          <InfoIcon className="h-3.5 w-3.5 inline-block ml-0.5 text-[#6D42EF]" />
        </span>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-4 shadow-lg border-[#6D42EF]/20 bg-white text-gray-800"
        side={isMobile ? "bottom" : "top"}
        align="center"
        sideOffset={5}
      >
        <div>
          <h4 className="text-[#6D42EF] font-semibold text-lg mb-2">{term}</h4>
          <p className="text-sm mb-3">{definition}</p>
          
          {relatedConcepts && relatedConcepts.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Related concepts:</div>
              <div className="flex flex-wrap gap-1.5">
                {relatedConcepts.map((concept, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs cursor-pointer hover:bg-purple-50 border-purple-200"
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
