
import React, { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import type { TextSelectionPosition } from "@/hooks/useTextSelection";

interface TextSelectionButtonProps {
  position: TextSelectionPosition | null;
  onInsightRequest: () => void;
  visible: boolean;
}

const TextSelectionButton = ({ position, onInsightRequest, visible }: TextSelectionButtonProps) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  
  // Adjust position to ensure button stays in viewport
  const getAdjustedPosition = () => {
    if (!position) return { top: 0, left: 0 };
    
    const buttonWidth = 180; // Approximate width of button
    const windowWidth = window.innerWidth;
    const maxX = windowWidth - buttonWidth - 10;
    
    return {
      top: `${position.y + 10}px`,
      left: `${Math.min(position.x - buttonWidth / 2, maxX)}px`,
    };
  };

  // Prevent default touch behavior to avoid unwanted page interactions
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (buttonRef.current?.contains(e.target as Node)) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && position && (
        <motion.div
          ref={buttonRef}
          className="selection-button fixed z-50 shadow-lg rounded-full"
          style={getAdjustedPosition()}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            onClick={onInsightRequest}
            className="bg-[#6D42EF] hover:bg-[#6D42EF]/90 text-white rounded-full pl-4 pr-5 py-2 flex items-center"
            size="sm"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Get AI Insights
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TextSelectionButton;
