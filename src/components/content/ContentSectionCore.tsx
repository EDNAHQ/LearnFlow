
import { useState, useEffect, useRef, useCallback } from "react";
import { formatContent } from "@/utils/contentFormatter";
import ContentMarginNotesRenderer from "./ContentMarginNotesRenderer";
import ContentHelperTip from "../ContentHelperTip";
import ContentQuestionsSection from "./ContentQuestionsSection";
import { useConceptLinking } from "@/hooks/useConceptLinking";
import { toast } from "sonner";

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
  const { concepts, isLoading: conceptsLoading, hasResults } = useConceptLinking(loadedDetailedContent, topic);
  
  // State to track the currently focused concept
  const [focusedConcept, setFocusedConcept] = useState<string | null>(null);
  
  // Debug output to help troubleshoot
  useEffect(() => {
    if (concepts.length > 0) {
      console.log("ContentSectionCore: Concepts ready to display:", concepts.length);
      console.log("Concept terms:", concepts.map(c => c.term).join(", "));
      
      // Debug check: Try to find these terms in the content
      setTimeout(() => {
        if (contentRef.current) {
          const textContent = contentRef.current.textContent || '';
          concepts.forEach(c => {
            const found = textContent.includes(c.term);
            console.log(`Concept "${c.term}" ${found ? 'found' : 'NOT FOUND'} in content`);
          });
        }
      }, 500);
    }
  }, [concepts]);
  
  // Handler for clicking on related concepts
  const handleConceptClick = useCallback((conceptTerm: string) => {
    console.log("Concept clicked:", conceptTerm);
    setFocusedConcept(conceptTerm);
    toast.info(`Highlighting concept: ${conceptTerm}`);
    
    // Find the concept in the content and scroll to it
    if (contentRef.current) {
      const textContent = contentRef.current.textContent || '';
      const conceptIndex = textContent.toLowerCase().indexOf(conceptTerm.toLowerCase());
      
      if (conceptIndex !== -1) {
        // Try to find the closest element containing this text
        try {
          const allElements = contentRef.current.querySelectorAll('*');
          let targetElement = null;
          
          for (const el of Array.from(allElements)) {
            if (el.textContent?.includes(conceptTerm)) {
              targetElement = el;
              break;
            }
          }
          
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Highlight effect
            const originalBg = targetElement.style.backgroundColor;
            targetElement.style.backgroundColor = 'rgba(109, 66, 239, 0.2)';
            targetElement.style.transition = 'background-color 0.5s ease';
            
            setTimeout(() => {
              targetElement.style.backgroundColor = originalBg;
            }, 2000);
          }
        } catch (error) {
          console.error("Error highlighting concept:", error);
        }
      }
    }
  }, []);
  
  // Handler for related question click specifically in the ContentSectionCore
  const handleQuestionClick = useCallback((question: string) => {
    console.log("Question clicked in ContentSectionCore:", question);
    // Pass the question to the parent handler
    onQuestionClick(question);
  }, [onQuestionClick]);
  
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
          handleQuestionClick, // Use the local handler that calls the parent handler
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
      
      {/* Concept result indicator */}
      {!conceptsLoading && concepts.length > 0 && (
        <div className="text-xs text-[#6D42EF] mt-4">
          {concepts.length} key concepts are highlighted throughout the text.
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
        onQuestionClick={handleQuestionClick} // Use the local handler
      />
      
      <ContentHelperTip />
    </div>
  );
};

export default ContentSectionCore;
