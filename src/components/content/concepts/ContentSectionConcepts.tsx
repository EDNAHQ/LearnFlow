
import { memo, useState } from "react";
import ConceptNetworkViewer from "./ConceptNetworkViewer";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { AI_STYLES } from "@/components/ai";
import { cn } from "@/lib/utils";

interface ContentSectionConceptsProps {
  concepts: any[];
  onConceptClick: (conceptTerm: string) => void;
  currentTopic: string;
}

// Component for displaying the concept network visualization
const ContentSectionConcepts = memo(({ 
  concepts, 
  onConceptClick, 
  currentTopic 
}: ContentSectionConceptsProps) => {
  const [isOpen, setIsOpen] = useState(true);
  
  // Add debugging to help troubleshoot
  console.log("ContentSectionConcepts rendering with", concepts.length, "concepts");
  
  if (!concepts || concepts.length === 0 || !currentTopic) {
    console.log("ContentSectionConcepts: Not rendering due to missing data");
    return null;
  }

  const handleConceptClick = (conceptTerm: string) => {
    console.log("Concept clicked in ContentSectionConcepts:", conceptTerm);
    onConceptClick(conceptTerm);
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-200 bg-white rounded-lg shadow-sm p-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className={cn("text-lg font-semibold flex items-center gap-2", AI_STYLES.text.primary)}>
            <Sparkles size={20} className={AI_STYLES.text.accent} />
            Interactive Concept Network
          </h3>
          <CollapsibleTrigger asChild>
            <button className="p-1 rounded-md hover:bg-gray-100 text-gray-500">
              {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent>
          <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
            <ConceptNetworkViewer 
              concepts={concepts}
              onConceptClick={handleConceptClick}
              currentTopic={currentTopic}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Click on any concept to highlight it in the text or get more information.
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
});

// Add display name for better debugging
ContentSectionConcepts.displayName = "ContentSectionConcepts";

export default ContentSectionConcepts;
