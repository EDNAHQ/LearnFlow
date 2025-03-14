
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { generateStepContent } from "@/utils/learningUtils";
import ContentLoader from "./content/ContentLoader";
import ContentHelperTip from "./ContentHelperTip";
import { formatContent } from "@/utils/contentFormatter";
import { useTextSelection } from "@/hooks/useTextSelection";
import AIInsightsDialog from "./AIInsightsDialog";
import TextSelectionButton from "./TextSelectionButton";

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
  const { 
    selectedText, 
    showInsightsDialog, 
    setShowInsightsDialog,
    selectionPosition,
    showSelectionButton,
    handleShowInsights,
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

  const handleDialogOpenChange = (open: boolean) => {
    setShowInsightsDialog(open);
    if (!open) {
      // Clear the text selection when dialog is closed
      if (window.getSelection) {
        if (window.getSelection()?.empty) {
          window.getSelection()?.empty();
        } else if (window.getSelection()?.removeAllRanges) {
          window.getSelection()?.removeAllRanges();
        }
      }
    }
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
            {formatContent(loadedDetailedContent)}
          </div>
          
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
        />
      )}
    </div>
  );
};

export default ContentSection;
