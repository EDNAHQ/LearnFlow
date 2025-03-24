
import { memo } from "react";
import ConceptNetworkViewer from "./ConceptNetworkViewer";

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
  if (!concepts || concepts.length === 0 || !currentTopic) {
    return null;
  }

  const handleConceptClick = (conceptTerm: string) => {
    console.log("Concept clicked in ContentSectionConcepts:", conceptTerm);
    onConceptClick(conceptTerm);
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <ConceptNetworkViewer 
        concepts={concepts}
        onConceptClick={handleConceptClick}
        currentTopic={currentTopic}
      />
    </div>
  );
});

// Add display name for better debugging
ContentSectionConcepts.displayName = "ContentSectionConcepts";

export default ContentSectionConcepts;
