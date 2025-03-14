
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
        
        // Get selection position for the floating button
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Position the button near the end of the selection
        setSelectionPosition({
          x: rect.right,
          y: rect.bottom + window.scrollY
        });
        
        setShowSelectionButton(true);
      } else {
        // Clear selection data if text is too short or too long
        clearSelectionData();
      }
    } else {
      // No selection, clear data
      clearSelectionData();
    }
  }, []);

  const clearSelectionData = () => {
    setSelectedText("");
    setShowSelectionButton(false);
    setSelectionPosition(null);
  };

  const handleShowInsights = () => {
    setShowInsightsDialog(true);
    setShowSelectionButton(false);
  };

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

  // Add document-level listeners for both mouse and touch events
  useEffect(() => {
    // For mouse users
    document.addEventListener("mouseup", handleTextSelection);
    
    // For touch device users
    document.addEventListener("touchend", handleTextSelection);
    
    // Clear selection when clicking elsewhere
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      // Only clear if not clicking on our selection button or dialog
      if (!target.closest('.selection-button') && !target.closest('[role="dialog"]')) {
        clearSelectionData();
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    
    return () => {
      document.removeEventListener("mouseup", handleTextSelection);
      document.removeEventListener("touchend", handleTextSelection);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [handleTextSelection]);

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
