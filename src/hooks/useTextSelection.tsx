
import { useState, useCallback, useEffect } from "react";

interface TextSelectionPosition {
  x: number;
  y: number;
}

export const useTextSelection = () => {
  const [selectedText, setSelectedText] = useState<string>("");
  const [showInsightsDialog, setShowInsightsDialog] = useState<boolean>(false);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    
    if (selection && !selection.isCollapsed) {
      const text = selection.toString().trim();
      
      if (text && text.length > 5 && text.length < 500) {
        setSelectedText(text);
        setShowInsightsDialog(true);
      } else if (text.length > 0 && text.length <= 5) {
        // If text is too short, clear selection but don't show dialog
        console.log("Text selection too short (minimum 6 characters)");
        setSelectedText("");
      }
    }
  }, []);

  // Add document-level listener for mouseup to capture selections outside specific components
  useEffect(() => {
    document.addEventListener("mouseup", handleTextSelection);
    return () => {
      document.removeEventListener("mouseup", handleTextSelection);
    };
  }, [handleTextSelection]);

  const clearSelection = useCallback(() => {
    setSelectedText("");
    setShowInsightsDialog(false);
    
    // Clear text selection
    if (window.getSelection) {
      if (window.getSelection()?.empty) {
        window.getSelection()?.empty();
      } else if (window.getSelection()?.removeAllRanges) {
        window.getSelection()?.removeAllRanges();
      }
    }
  }, []);

  return {
    selectedText,
    showInsightsDialog,
    setShowInsightsDialog,
    handleTextSelection,
    clearSelection
  };
};

// Export the type so it can be used in other components
export type { TextSelectionPosition };
