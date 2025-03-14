
import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { generateStepContent } from "@/utils/learningUtils";
import ContentLoader from "./content/ContentLoader";
import ContentHelperTip from "./ContentHelperTip";
import { formatContent } from "@/utils/contentFormatter";
import { useTextSelection } from "@/hooks/useTextSelection";
import AIInsightsDialog from "./AIInsightsDialog";
import TextSelectionButton from "./TextSelectionButton";
import ContentRelatedQuestions from "./ContentRelatedQuestions";
import { supabase } from "@/integrations/supabase/client";

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
  const [isLoading, setIsLoading] = useState(false);
  const [showInsightsDialog, setShowInsightsDialog] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsGenerated, setQuestionsGenerated] = useState(false);
  
  const { 
    selectedText, 
    showSelectionButton,
    selectionPosition,
    handleTextSelection
  } = useTextSelection();
  
  const stepId = content.split(":")[0]; // Extract step ID from content

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 200);

    return () => clearTimeout(timer);
  }, [index]);

  useEffect(() => {
    // Update loaded content when detailed content prop changes
    if (detailedContent) {
      setLoadedDetailedContent(detailedContent);
      setIsLoading(false);
    }
  }, [detailedContent]);

  // If no detailed content, try to load it directly
  useEffect(() => {
    if (!loadedDetailedContent && stepId && topic && !isLoading) {
      const loadContent = async () => {
        setIsLoading(true);
        try {
          const generatedContent = await generateStepContent(
            { id: stepId, title, description: content.split(":")[1] || "" },
            topic
          );
          setLoadedDetailedContent(generatedContent);
        } catch (error) {
          console.error("Error loading content:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadContent();
    }
  }, [loadedDetailedContent, stepId, title, content, topic, isLoading]);

  // Generate related questions once content is loaded - but only once
  const generateRelatedQuestions = useCallback(async () => {
    if (!loadedDetailedContent || !topic || questionsGenerated || relatedQuestions.length > 0) {
      return;
    }
    
    setLoadingQuestions(true);
    try {
      const response = await supabase.functions.invoke('generate-learning-content', {
        body: {
          content: loadedDetailedContent,
          topic,
          title,
          generateQuestions: true
        }
      });
      
      if (response.data?.questions && Array.isArray(response.data.questions)) {
        setRelatedQuestions(response.data.questions);
      }
    } catch (error) {
      console.error("Error generating related questions:", error);
    } finally {
      setLoadingQuestions(false);
      setQuestionsGenerated(true);
    }
  }, [loadedDetailedContent, topic, title, questionsGenerated, relatedQuestions.length]);

  // Trigger question generation once content is loaded
  useEffect(() => {
    if (loadedDetailedContent && topic && !questionsGenerated && !loadingQuestions) {
      generateRelatedQuestions();
    }
  }, [loadedDetailedContent, topic, questionsGenerated, loadingQuestions, generateRelatedQuestions]);

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
      {!loadedDetailedContent || isLoading ? (
        <ContentLoader />
      ) : (
        <div 
          className="prose prose-gray max-w-none w-full"
          onMouseUp={handleTextSelection}
          onTouchEnd={handleTextSelection}
        >
          <div className="content-section w-full">
            {formatContent(loadedDetailedContent, topic, handleQuestionClick)}
          </div>
          
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
