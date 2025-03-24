
import { useState, useEffect, useRef, useCallback } from "react";
import { formatContent } from "@/utils/contentFormatter";
import ContentMarginNotesRenderer from "./ContentMarginNotesRenderer";
import ContentHelperTip from "../ContentHelperTip";
import ContentQuestionsSection from "./ContentQuestionsSection";
import { useConceptLinking } from "@/hooks/useConceptLinking";
import { toast } from "sonner";
import ContentSectionConcepts from "./ContentSectionConcepts";

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
  const { concepts, isLoading: conceptsLoading, hasResults, resetExtraction } = useConceptLinking(
    loadedDetailedContent, 
    topic
  );
  
  useEffect(() => {
    // Re-analyze concepts if content changes significantly
    if (loadedDetailedContent && loadedDetailedContent.length > 0) {
      resetExtraction();
    }
  }, [loadedDetailedContent, resetExtraction]);
  
  // State to track the currently focused concept
  const [focusedConcept, setFocusedConcept] = useState<string | null>(null);
  
  // Debug output to help troubleshoot
  useEffect(() => {
    if (concepts.length > 0) {
      console.log("ContentSectionCore: Concepts ready to display:", concepts.length);
      
      // Debug check: Try to find these terms in the content
      if (contentRef.current) {
        const textContent = contentRef.current.textContent || '';
        concepts.forEach(c => {
          const found = textContent.includes(c.term);
          console.log(`Concept "${c.term}" ${found ? 'found' : 'NOT FOUND'} in content`);
        });
      }
      
      // Notify user concepts were found
      toast.success(`${concepts.length} key concepts identified`, {
        description: "Important terms are highlighted throughout the text",
        duration: 3000
      });
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
            if (el.textContent?.toLowerCase().includes(conceptTerm.toLowerCase())) {
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
    <div className="space-y-6 w-full">
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
            handleQuestionClick, 
            concepts,
            handleConceptClick
          )}
        </div>
        
        {/* Concept loading indicator - ALWAYS SHOW THIS when loading */}
        {conceptsLoading && (
          <div className="text-xs text-gray-500 italic mt-4 flex items-center">
            <div className="animate-spin mr-1 h-3 w-3 border border-[#6D42EF] border-t-transparent rounded-full"></div>
            Analyzing content for key concepts...
          </div>
        )}
        
        {/* Concept result indicator - Only show when we have results */}
        {!conceptsLoading && concepts.length > 0 && (
          <div className="text-xs text-[#6D42EF] font-medium mt-4 flex items-center">
            <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#6D42EF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {concepts.length} key concepts are highlighted throughout the text
          </div>
        )}
      </div>
      
      {/* Margin Notes Renderer - Adds margin notes to content */}
      {!marginNotesGenerated.current && topic && (
        <ContentMarginNotesRenderer
          content={loadedDetailedContent}
          topic={topic}
          contentRef={contentRef}
          onNotesGenerated={() => {marginNotesGenerated.current = true}}
        />
      )}
      
      {/* Concept Network Viewer - Explicitly check if we have concepts */}
      {concepts && concepts.length > 0 && topic && (
        <ContentSectionConcepts 
          concepts={concepts}
          onConceptClick={handleConceptClick}
          currentTopic={topic}
        />
      )}
      
      {/* Questions Section */}
      <ContentQuestionsSection
        loadedDetailedContent={loadedDetailedContent}
        topic={topic}
        title={title}
        stepId={stepId}
        onQuestionClick={handleQuestionClick}
      />
      
      <ContentHelperTip />
    </div>
  );
};

export default ContentSectionCore;
