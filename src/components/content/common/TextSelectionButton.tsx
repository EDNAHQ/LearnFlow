import React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { TextSelectionPosition } from "@/hooks/content";
import { AI_STYLES } from "@/components/ai";
import { cn } from "@/lib/utils";

interface TextSelectionButtonProps {
  position: TextSelectionPosition | null;
  onInsightRequest: () => void;
  visible: boolean;
}

const TextSelectionButton = ({ position, onInsightRequest, visible }: TextSelectionButtonProps) => {
  const buttonStyle = {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: 50
  } as const;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          style={buttonStyle}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="shadow-lg rounded-full"
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="icon"
                className={cn(AI_STYLES.buttons.ai, "rounded-full h-14 w-14 shadow-md")}
              >
                <Sparkles className="h-6 w-6" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className={cn("p-3 w-60 shadow-lg", AI_STYLES.borders.default)}>
              <div className="flex flex-col space-y-2">
                <p className={cn("text-sm font-medium", AI_STYLES.text.body)}>Get AI insights on your selection</p>
                <Button
                  onClick={onInsightRequest}
                  className={cn("w-full", AI_STYLES.buttons.ai)}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze Text
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TextSelectionButton;


