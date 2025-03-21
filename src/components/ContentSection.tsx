
import { useEffect, useState, useCallback, useRef, memo } from "react";
import { cn } from "@/lib/utils";
import ContentLoader from "./content/ContentLoader";
import ContentHelperTip from "./ContentHelperTip";
import { formatContent } from "@/utils/contentFormatter";
import { useTextSelection } from "@/hooks/useTextSelection";
import AIInsightsDialog from "./AIInsightsDialog";
import TextSelectionButton from "./TextSelectionButton";
import ContentRelatedQuestions from "./ContentRelatedQuestions";
import ContentDetailLoader from "./content/ContentDetailLoader";
import ContentQuestionsGenerator from "./content/ContentQuestionsGenerator";
import ContentMarginNotesRenderer from "./content/ContentMarginNotesRenderer";
import "@/styles/content.css";

interface ContentSectionProps {
  title: string;
  content: string;
  index: number;
  detailedContent?: string | null;
  pathId?: string;
  topic?: string;
}

// Use memo to prevent unnecessary re-renders
const ContentSection = memo(({ title, content, index, detailedContent, topic }: ContentSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [loadedDetailedContent, setLoadedDetailedContent] = useState<string | null>(null);
  const [showInsightsDialog, setShowInsightsDialog] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [contentLoaded, setContentLoaded] = useState(false);
  
  // Track if margin notes have been generated to prevent regeneration
  const marginNotesGenerated = useRef(false);
  const questionsGenerated = useRef(false);
  
  const { 
    selectedText, 
    showSelectionButton,
    selectionPosition,
    handleTextSelection
  } = useTextSelection();
  
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Extract step ID from content if it's in expected format
  const stepId = content.includes(':') ? content.split(":")[0] : '';
  
  // Reset state when content changes
  useEffect(() => {
    setIsVisible(false);
    
    // Only reset content if it has changed significantly
    if (!loadedDetailedContent || content.substring(0, 20) !== loadedDetailedContent.substring(0, 20)) {
      setLoadedDetailedContent(null);
      setContentLoaded(false);
      marginNotesGenerated.current = false;
      questionsGenerated.current = false;
    }
    
    // Animation effect for fading in the content - use a fixed short timeout
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [content, detailedContent, index, topic, loadedDetailedContent]);

  // Initialize with detailed content if available - only do this once per content change
  useEffect(() => {
    if (detailedContent && typeof detailedContent === 'string' && !contentLoaded) {
      setLoadedDetailedContent(detailedContent);
      setContentLoaded(true);
      console.log("Using provided detailed content");
    }
  }, [detailedContent, contentLoaded]);

  // Handle content detail loading - memoize callback
  const handleContentLoaded = useCallback((loadedContent: string) => {
    if (typeof loadedContent === 'string' && !contentLoaded) {
      console.log("Content loaded successfully", loadedContent.substring(0, 100) + "...");
      setLoadedDetailedContent(loadedContent);
      setContentLoaded(true);
    }
  }, [contentLoaded]);

  // Handle related questions - memoize callback
  const handleQuestionsGenerated = useCallback((questions: string[]) => {
    if (!questionsGenerated.current) {
      setRelatedQuestions(questions);
      setLoadingQuestions(false);
      questionsGenerated.current = true;
    }
  }, []);

  // Dialog event handlers - memoize callbacks
  const handleDialogOpenChange = useCallback((open: boolean) => {
    setShowInsightsDialog(open);
    if (!open) {
      setCurrentQuestion("");
    }
  }, []);

  const handleShowInsights = useCallback(() => {
    setShowInsightsDialog(true);
  }, []);

  const handleQuestionClick = useCallback((question: string) => {
    setCurrentQuestion(question);
    setShowInsightsDialog(true);
  }, []);

  return (
    <div 
      className={cn(
        "transition-all duration-300 ease-in-out bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-8 mb-8 w-full max-w-5xl mx-auto overflow-hidden",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      {/* Only show ContentDetailLoader if content is not already loaded */}
      {!contentLoaded && (
        <ContentDetailLoader
          stepId={stepId}
          title={title}
          content={content}
          topic={topic}
          detailedContent={detailedContent}
          onContentLoaded={handleContentLoaded}
        />
      )}
      
      {!loadedDetailedContent ? (
        <ContentLoader />
      ) : (
        <div 
          className="prose prose-gray max-w-none w-full"
          onMouseUp={handleTextSelection}
          onTouchEnd={handleTextSelection}
        >
          <div 
            className="content-section relative"
            ref={contentRef}
          >
            {formatContent(loadedDetailedContent, topic, handleQuestionClick)}
          </div>
          
          {/* Questions Generator - Generates questions based on content */}
          {!questionsGenerated.current && (
            <ContentQuestionsGenerator 
              content={loadedDetailedContent}
              topic={topic}
              title={title}
              stepId={stepId}
              onQuestionsGenerated={handleQuestionsGenerated}
            />
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
          
          {/* Display related questions */}
          <ContentRelatedQuestions 
            questions={relatedQuestions}
            isLoading={loadingQuestions}
            onQuestionClick={handleQuestionClick}
          />
          
          <ContentHelperTip />
        </div>
      )}
      
      {/* Floating Selection Button */}
      <TextSelectionButton 
        position={selectionPosition}
        onInsightRequest={handleShowInsights}
        visible={showSelectionButton}
      />
      
      {/* AI Insights Dialog */}
      {topic && (
        <AIInsightsDialog
          selectedText={selectedText}
          open={showInsightsDialog}
          onOpenChange={handleDialogOpenChange}
          topic={topic}
          question={currentQuestion}
        />
      )}
    </div>
  );
});

// Add display name for better debugging
ContentSection.displayName = "ContentSection";

export default ContentSection;
