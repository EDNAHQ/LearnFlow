
import { useState, useCallback } from "react";

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
      }
    }
  }, []);

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

export type TextSelectionPosition = TextSelectionPosition;
