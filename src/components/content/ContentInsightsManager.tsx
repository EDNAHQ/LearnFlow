
import { useState, useCallback } from "react";
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
    setCurrentQuestion(question);
    setShowInsightsDialog(true);
  }, []);
  
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
