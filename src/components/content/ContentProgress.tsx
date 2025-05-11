
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TableProperties } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState, useCallback, memo } from "react";

interface Step {
  id: string;
  title: string;
}

interface ContentProgressProps {
  topic: string;
  currentStep: number;
  totalSteps: number;
  steps: Step[];
  onNavigateToStep: (step: number) => void;
}

// Function to truncate text to a specific word count
const truncateByWords = (text: string, wordLimit: number = 10): string => {
  const words = text.trim().split(/\s+/);
  
  if (words.length <= wordLimit) {
    return text;
  }
  
  return words.slice(0, wordLimit).join(' ') + '...';
};

// Memoize the component to prevent unnecessary re-renders
const ContentProgress = memo(({
  topic,
  currentStep,
  totalSteps,
  steps = [], // Provide default empty array to prevent mapping errors
  onNavigateToStep
}: ContentProgressProps) => {
  const [showAllSteps, setShowAllSteps] = useState(false);
  
  // Memoize the dialog close handler
  const handleStepSelect = useCallback((index: number) => {
    onNavigateToStep(index);
    setShowAllSteps(false);
  }, [onNavigateToStep]);
  
  // Truncate the topic text to 10 words
  const truncatedTopic = truncateByWords(topic);
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800 truncate max-w-[400px]" title={topic}>
            {truncatedTopic}
          </h1>
          
          <Dialog open={showAllSteps} onOpenChange={setShowAllSteps}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-[#6D42EF] hover:bg-[#6D42EF]/10"
                aria-label="Table of contents"
              >
                <TableProperties className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="pt-4">
                <h3 className="text-lg font-semibold mb-4">All Steps</h3>
                <div className="space-y-2">
                  {steps && steps.length > 0 ? steps.map((step, index) => (
                    <div 
                      key={step.id} 
                      className={`p-3 rounded-md cursor-pointer ${currentStep === index 
                        ? 'bg-brand-purple text-white' 
                        : 'hover:bg-gray-100'}`}
                      onClick={() => handleStepSelect(index)}
                    >
                      <div className="flex items-center">
                        <div className="mr-3 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-brand-purple font-medium">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium">{step.title}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="p-3">No steps available</div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="text-sm bg-[#6D42EF]/10 text-[#6D42EF] py-1.5 rounded-full font-semibold px-[20px]">
          Step {currentStep + 1} of {totalSteps}
        </div>
      </div>
      
      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-[#6D42EF] h-full rounded-full transition-all duration-300" 
          style={{
            width: `${(currentStep + 1) / totalSteps * 100}%`
          }}
        />
      </div>
    </div>
  );
});

// Add displayName for better debugging
ContentProgress.displayName = "ContentProgress";

export default ContentProgress;
