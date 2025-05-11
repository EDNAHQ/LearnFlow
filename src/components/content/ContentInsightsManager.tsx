
import { useState, useCallback, useEffect } from "react";
import AIInsightsDialog from "../AIInsightsDialog";
import TextSelectionButton from "../TextSelectionButton";
import { useTextSelection } from "@/hooks/useTextSelection";

interface ContentInsightsManagerProps {
  topic?: string;
}

const ContentInsightsManager = ({ topic }: ContentInsightsManagerProps) => {
  const [showInsightsDialog, setShowInsightsDialog] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  
  const { 
    selectedText, 
    showSelectionButton,
    selectionPosition,
    handleTextSelection
  } = useTextSelection();
  
  // Dialog event handlers
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
    console.log("ContentInsightsManager handling question:", question);
    setCurrentQuestion(question);
    setShowInsightsDialog(true);
  }, []);
  
  // Listen for AI insight request events
  useEffect(() => {
    const handleInsightRequest = (event: CustomEvent) => {
      const { question } = event.detail;
      console.log("AI insight request received for question:", question);
      if (question) {
        handleQuestionClick(question);
      }
    };

    // Add event listener for custom AI insight request events
    window.addEventListener("ai:insight-request", handleInsightRequest as EventListener);
    
    // Clean up event listener on unmount
    return () => {
      window.removeEventListener("ai:insight-request", handleInsightRequest as EventListener);
    };
  }, [handleQuestionClick]);
  
  return (
    <>
      {/* Text selection handling */}
      <div className="w-full" onMouseUp={handleTextSelection} onTouchEnd={handleTextSelection}>
        {/* Passed as render props to parent component */}
      </div>
      
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
      
      {/* Return values needed by parent */}
      <div style={{ display: 'none' }} data-insights-manager="true" />
    </>
  );
};

export { ContentInsightsManager, type ContentInsightsManagerProps };
