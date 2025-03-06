
import { useState, useEffect, useRef } from "react";
import { ArrowRight, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client"; // Updated import

interface AIInsightsPopupProps {
  selectedText: string;
  position: { x: number; y: number };
  onClose: () => void;
  topic: string;
}

const AIInsightsPopup = ({ 
  selectedText, 
  position, 
  onClose,
  topic
}: AIInsightsPopupProps) => {
  const [insight, setInsight] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside to close
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
  
  // Fetch insights from AI
  useEffect(() => {
    const fetchInsight = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Call edge function
        const { data, error } = await supabase.functions.invoke("generate-ai-insight", {
          body: {
            text: selectedText,
            context: topic,
          },
        });
        
        if (error) throw error;
        
        setInsight(data.insight || "Sorry, I couldn't generate an insight for this selection.");
      } catch (err) {
        console.error("Error generating AI insight:", err);
        setError("Failed to generate insight. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInsight();
  }, [selectedText, topic]);
  
  // Calculate position to ensure popup stays in viewport
  const getAdjustedPosition = () => {
    if (!popupRef.current) return position;
    
    const popupWidth = 320; // Set a fixed width for calculation
    const windowWidth = window.innerWidth;
    const maxX = windowWidth - popupWidth - 20;
    
    return {
      x: Math.min(position.x - (popupWidth / 2), maxX),
      y: position.y + 10
    };
  };
  
  const adjustedPosition = getAdjustedPosition();
  
  return (
    <AnimatePresence>
      <motion.div
        ref={popupRef}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="fixed z-50 w-80 bg-white rounded-lg shadow-xl border border-gray-200"
        style={{
          left: `${adjustedPosition.x}px`,
          top: `${adjustedPosition.y}px`,
        }}
      >
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="text-sm font-medium text-[#6D42EF]">AI Insight</div>
          <Button 
            variant="ghost" 
            className="h-6 w-6 p-0" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4">
          {isLoading ? (
            <div className="flex flex-col items-center py-6">
              <Loader2 className="h-8 w-8 text-[#6D42EF] animate-spin mb-2" />
              <p className="text-sm text-gray-500">Generating insight...</p>
            </div>
          ) : error ? (
            <div className="text-red-500 text-sm py-2">{error}</div>
          ) : (
            <>
              <div className="text-sm text-gray-700 mb-3">
                <div className="italic text-xs text-gray-400 mb-1">You selected:</div>
                "{selectedText.length > 100 
                  ? selectedText.substring(0, 100) + "..." 
                  : selectedText}"
              </div>
              <div className="bg-gray-50 p-3 rounded-md text-sm">
                {insight}
              </div>
            </>
          )}
        </div>
        
        <div className="px-4 py-3 border-t border-gray-100 flex justify-end">
          <Button 
            className="bg-[#6D42EF] hover:bg-[#6D42EF]/90 text-white text-xs h-7 px-3"
            onClick={onClose}
          >
            Got it <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIInsightsPopup;
