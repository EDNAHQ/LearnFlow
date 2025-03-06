
import { useState, useCallback, useEffect } from "react";

interface TextSelectionPosition {
  x: number;
  y: number;
}

export const useTextSelection = () => {
  const [selectedText, setSelectedText] = useState<string>("");
  const [popupPosition, setPopupPosition] = useState<TextSelectionPosition | null>(null);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    
    if (selection && !selection.isCollapsed) {
      const text = selection.toString().trim();
      
      if (text && text.length > 5 && text.length < 500) {
        // Get selection coordinates for positioning the popup
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setSelectedText(text);
        setPopupPosition({ 
          x: rect.left + (rect.width / 2), 
          y: rect.bottom + window.scrollY 
        });
      } else if (text.length > 0 && text.length <= 5) {
        // If text is too short, clear selection but show a tooltip
        console.log("Text selection too short (minimum 6 characters)");
        setSelectedText("");
        setPopupPosition(null);
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
    setPopupPosition(null);
    
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
    popupPosition,
    handleTextSelection,
    clearSelection
  };
};

// Export the type so it can be used in other components
export type { TextSelectionPosition };
