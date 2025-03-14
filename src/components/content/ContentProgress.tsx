
import { Progress } from "@/components/ui/progress";

interface ContentProgressProps {
  topic: string;
  pathTitle: string | null;
  currentStep: number;
  totalSteps: number;
}

const ContentProgress = ({ 
  topic, 
  pathTitle,
  currentStep, 
  totalSteps 
}: ContentProgressProps) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;
  
  // Use the AI-generated title if available, otherwise use the topic
  const displayTitle = pathTitle || topic;
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <h1 className="text-xl font-semibold">{displayTitle}</h1>
        <div className="text-sm font-medium">
          Step {currentStep + 1} of {totalSteps}
        </div>
      </div>
      <Progress value={progress} className="h-1.5" />
    </div>
  );
};

export default ContentProgress;
