
import React, { useState, useRef, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface AIInsightsPopupProps {
  selectedText: string;
  position: { x: number; y: number } | null;
  onClose: () => void;
  topic: string;
}

const AIInsightsPopup = ({ selectedText, position, onClose, topic }: AIInsightsPopupProps) => {
  const [insight, setInsight] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    const fetchInsight = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await window.supabase.functions.invoke("generate-ai-insight", {
          body: {
            selectedText,
            topic
          }
        });

        if (error) {
          throw new Error(error.message);
        }

        setInsight(data.insight);
      } catch (error) {
        console.error("Error fetching AI insight:", error);
        toast.error("Failed to get AI insight. Please try again.");
        setInsight("Sorry, I couldn't generate insights for this text. Please try again with a different selection.");
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedText && position) {
      fetchInsight();
    }
  }, [selectedText, topic]);

  if (!position) return null;

  // Calculate position, ensuring the popup stays within viewport
  const calculatePosition = () => {
    if (!position) return { top: 0, left: 0 };
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const popupWidth = 320; // Estimated popup width
    const popupHeight = 300; // Estimated popup height
    
    let left = position.x;
    let top = position.y + 20; // Add some offset from cursor
    
    // Adjust horizontal position if needed
    if (left + popupWidth > viewportWidth - 20) {
      left = viewportWidth - popupWidth - 20;
    }
    
    // Adjust vertical position if needed
    if (top + popupHeight > viewportHeight - 20) {
      top = position.y - popupHeight - 10;
    }
    
    return { top, left };
  };

  const { top, left } = calculatePosition();

  return (
    <AnimatePresence>
      <motion.div
        ref={popupRef}
        className="fixed z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
        style={{ top, left }}
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <div className="p-3 bg-[#1A1A1A] text-white flex items-center justify-between">
          <h3 className="text-sm font-medium">AI Insight</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 rounded-full text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#6D42EF] mb-2" />
              <p className="text-sm text-gray-500">Analyzing your selection...</p>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
            </div>
          )}
        </div>
        
        <div className="p-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 italic">
          Insights about: "{selectedText.length > 30 ? selectedText.substring(0, 30) + '...' : selectedText}"
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIInsightsPopup;
