
import { useState, useCallback, useEffect } from "react";

interface TextSelectionPosition {
  x: number;
  y: number;
}

export const useTextSelection = () => {
  const [selectedText, setSelectedText] = useState<string>("");
  const [showInsightsDialog, setShowInsightsDialog] = useState<boolean>(false);
  const [selectionPosition, setSelectionPosition] = useState<TextSelectionPosition | null>(null);
  const [showSelectionButton, setShowSelectionButton] = useState<boolean>(false);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    
    if (selection && !selection.isCollapsed) {
      const text = selection.toString().trim();
      
      if (text && text.length > 5 && text.length < 500) {
        setSelectedText(text);
        setShowSelectionButton(true);
      }
    }
  }, []);

  const clearSelectionData = useCallback(() => {
    setSelectedText("");
    setShowSelectionButton(false);
    setSelectionPosition(null);
  }, []);

  const handleShowInsights = useCallback(() => {
    if (selectedText) {
      setShowInsightsDialog(true);
    }
  }, [selectedText]);

  const clearSelection = useCallback(() => {
    setSelectedText("");
    setShowInsightsDialog(false);
    setShowSelectionButton(false);
    setSelectionPosition(null);
    
    // Clear text selection
    if (window.getSelection) {
      if (window.getSelection()?.empty) {
        window.getSelection()?.empty();
      } else if (window.getSelection()?.removeAllRanges) {
        window.getSelection()?.removeAllRanges();
      }
    }
  }, []);

  useEffect(() => {
    // Simplified approach: just show the button whenever there's a selection
    const checkForSelection = () => {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        const text = selection.toString().trim();
        if (text && text.length > 5 && text.length < 500) {
          setSelectedText(text);
          setShowSelectionButton(true);
        } else {
          clearSelectionData();
        }
      }
    };

    // Check periodically for text selection
    const selectionInterval = setInterval(checkForSelection, 500);
    
    // Also check on user interaction
    document.addEventListener("mouseup", checkForSelection);
    document.addEventListener("touchend", checkForSelection);
    
    return () => {
      clearInterval(selectionInterval);
      document.removeEventListener("mouseup", checkForSelection);
      document.removeEventListener("touchend", checkForSelection);
    };
  }, [clearSelectionData]);

  return {
    selectedText,
    showInsightsDialog,
    setShowInsightsDialog,
    selectionPosition,
    showSelectionButton,
    handleShowInsights,
    handleTextSelection,
    clearSelection
  };
};

// Export the type so it can be used in other components
export type { TextSelectionPosition };
