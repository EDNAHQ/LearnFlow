
import { useState, useEffect, useRef, useCallback } from "react";
import { formatContent } from "@/utils/contentFormatter";
import ContentMarginNotesRenderer from "./ContentMarginNotesRenderer";
import ContentHelperTip from "../ContentHelperTip";
import ContentQuestionsSection from "./ContentQuestionsSection";
import { useConceptLinking } from "@/hooks/useConceptLinking";

interface ContentSectionCoreProps {
  loadedDetailedContent: string;
  topic?: string;
  title: string;
  stepId: string;
  onTextSelection: (event: React.MouseEvent | React.TouchEvent) => void;
  onQuestionClick: (question: string) => void;
}

const ContentSectionCore = ({
  loadedDetailedContent,
  topic,
  title,
  stepId,
  onTextSelection,
  onQuestionClick
}: ContentSectionCoreProps) => {
  // Track if margin notes have been generated to prevent regeneration
  const marginNotesGenerated = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Get concepts from the loaded content
  const { concepts, isLoading: conceptsLoading } = useConceptLinking(loadedDetailedContent, topic);
  
  // State to track the currently focused concept
  const [focusedConcept, setFocusedConcept] = useState<string | null>(null);
  
  // Handler for clicking on related concepts
  const handleConceptClick = useCallback((conceptTerm: string) => {
    setFocusedConcept(conceptTerm);
    
    // Find the concept in the content and scroll to it
    if (contentRef.current) {
      const textContent = contentRef.current.textContent || '';
      const conceptIndex = textContent.toLowerCase().indexOf(conceptTerm.toLowerCase());
      
      if (conceptIndex !== -1) {
        // Create a range to highlight the concept
        const selection = window.getSelection();
        const range = document.createRange();
        
        // This is an approximation; finding the exact text node would require recursion
        try {
          const textNodes = Array.from(contentRef.current.querySelectorAll('*'))
            .filter(el => el.textContent?.toLowerCase().includes(conceptTerm.toLowerCase()))
            .flatMap(el => Array.from(el.childNodes).filter(node => 
              node.nodeType === Node.TEXT_NODE && 
              node.textContent?.toLowerCase().includes(conceptTerm.toLowerCase())
            ));
            
          if (textNodes.length > 0) {
            const targetNode = textNodes[0];
            const targetText = targetNode.textContent || '';
            const nodeConceptIndex = targetText.toLowerCase().indexOf(conceptTerm.toLowerCase());
            
            // Scroll the parent element into view
            let parentElement = targetNode.parentElement;
            if (parentElement) {
              parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              
              // Highlight effect
              const originalBg = parentElement.style.backgroundColor;
              parentElement.style.backgroundColor = 'rgba(109, 66, 239, 0.1)';
              parentElement.style.transition = 'background-color 0.5s ease';
              
              setTimeout(() => {
                parentElement!.style.backgroundColor = originalBg;
              }, 2000);
            }
          }
        } catch (error) {
          console.error("Error highlighting concept:", error);
        }
      }
    }
  }, []);
  
  // Reset focused concept when content changes
  useEffect(() => {
    setFocusedConcept(null);
  }, [loadedDetailedContent]);
  
  return (
    <div 
      className="prose prose-gray max-w-none w-full"
      onMouseUp={onTextSelection}
      onTouchEnd={onTextSelection}
    >
      <div 
        className="content-section relative"
        ref={contentRef}
      >
        {formatContent(
          loadedDetailedContent, 
          topic, 
          onQuestionClick,
          concepts,
          handleConceptClick
        )}
      </div>
      
      {/* Concept loading indicator */}
      {conceptsLoading && (
        <div className="text-xs text-gray-500 italic mt-4">
          Analyzing content for key concepts...
        </div>
      )}
      
      {/* Margin Notes Renderer - Adds margin notes to content */}
      {!marginNotesGenerated.current && topic && (
        <ContentMarginNotesRenderer
          content={loadedDetailedContent}
          topic={topic}
          contentRef={contentRef}
          onNotesGenerated={() => {marginNotesGenerated.current = true}}
        />
      )}
      
      {/* Questions Section */}
      <ContentQuestionsSection
        loadedDetailedContent={loadedDetailedContent}
        topic={topic}
        title={title}
        stepId={stepId}
        onQuestionClick={onQuestionClick}
      />
      
      <ContentHelperTip />
    </div>
  );
};

export default ContentSectionCore;
