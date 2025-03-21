
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TableProperties } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

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

const ContentProgress = ({
  topic,
  currentStep,
  totalSteps,
  steps,
  onNavigateToStep
}: ContentProgressProps) => {
  const [showAllSteps, setShowAllSteps] = useState(false);
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 gap-2">
        <h1 className="text-3xl font-bold text-gray-800">
          {topic}
        </h1>
        
        <div className="flex items-center gap-2">
          <div className="text-sm bg-[#6D42EF]/10 text-[#6D42EF] py-1.5 rounded-full font-semibold px-[20px]">
            Step {currentStep + 1} of {totalSteps}
          </div>
          
          <Dialog open={showAllSteps} onOpenChange={setShowAllSteps}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-[#6D42EF] hover:bg-[#6D42EF]/10"
                aria-label="View all steps"
              >
                <TableProperties className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="pt-4">
                <h3 className="text-lg font-semibold mb-4">All Steps</h3>
                <div className="space-y-2">
                  {steps.map((step, index) => (
                    <div 
                      key={step.id} 
                      className={`p-3 rounded-md cursor-pointer ${currentStep === index 
                        ? 'bg-brand-purple text-white' 
                        : 'hover:bg-gray-100'}`}
                      onClick={() => {
                        onNavigateToStep(index);
                        setShowAllSteps(false);
                      }}
                    >
                      <div className="flex items-center">
                        <div className="mr-3 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-brand-purple font-medium">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium">{step.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
};

export default ContentProgress;
