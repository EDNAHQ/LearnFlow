
import { useEffect, useState, useCallback, useRef } from "react";
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

const ContentSection = ({ title, content, index, detailedContent, topic }: ContentSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [loadedDetailedContent, setLoadedDetailedContent] = useState<string | null>(detailedContent || null);
  const [showInsightsDialog, setShowInsightsDialog] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  
  const { 
    selectedText, 
    showSelectionButton,
    selectionPosition,
    handleTextSelection
  } = useTextSelection();
  
  const contentRef = useRef<HTMLDivElement>(null);
  const stepId = content.split(":")[0]; // Extract step ID from content

  // Animation effect for fading in the content
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 200);

    return () => clearTimeout(timer);
  }, [index]);

  // Handle content detail loading
  const handleContentLoaded = useCallback((content: string) => {
    setLoadedDetailedContent(content);
  }, []);

  // Handle related questions
  const handleQuestionsGenerated = useCallback((questions: string[]) => {
    setRelatedQuestions(questions);
    setLoadingQuestions(false);
  }, []);

  // Dialog event handlers
  const handleDialogOpenChange = (open: boolean) => {
    setShowInsightsDialog(open);
    if (!open) {
      setCurrentQuestion("");
    }
  };

  const handleShowInsights = () => {
    setShowInsightsDialog(true);
  };

  const handleQuestionClick = (question: string) => {
    setCurrentQuestion(question);
    setShowInsightsDialog(true);
  };

  return (
    <div 
      className={cn(
        "transition-all duration-500 ease-in-out bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-8 mb-8 w-full max-w-[860px] mx-auto overflow-hidden",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      {/* Content Detail Loader - Hidden component that handles loading content */}
      <ContentDetailLoader
        stepId={stepId}
        title={title}
        content={content}
        topic={topic}
        detailedContent={detailedContent}
        onContentLoaded={handleContentLoaded}
      />
      
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
            dangerouslySetInnerHTML={{ __html: formatContent(loadedDetailedContent, topic, handleQuestionClick) }}
          />
          
          {/* Questions Generator - Generates questions based on content */}
          <ContentQuestionsGenerator 
            content={loadedDetailedContent}
            topic={topic}
            title={title}
            stepId={stepId}
            onQuestionsGenerated={handleQuestionsGenerated}
          />
          
          {/* Margin Notes Renderer - Adds margin notes to content */}
          <ContentMarginNotesRenderer
            content={loadedDetailedContent}
            topic={topic || ""}
            contentRef={contentRef}
          />
          
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
};

export default ContentSection;
