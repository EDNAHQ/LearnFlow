
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

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-brand-purple mb-4">Concept Map</h3>
      <ConceptNetworkViewer 
        concepts={concepts}
        onConceptClick={onConceptClick}
        currentTopic={currentTopic}
      />
    </div>
  );
});

// Add display name for better debugging
ContentSectionConcepts.displayName = "ContentSectionConcepts";

export default ContentSectionConcepts;
