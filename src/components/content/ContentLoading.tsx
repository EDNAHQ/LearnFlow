
import { Loader2, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ContentLoadingProps {
  message?: string;
  goToProjects: () => void;
  generatingContent?: boolean;
  generatedSteps?: number;
  totalSteps?: number;
}

const ContentLoading = ({ 
  message = "Loading learning steps...", 
  goToProjects,
  generatingContent = false,
  generatedSteps = 0,
  totalSteps = 0
}: ContentLoadingProps) => {
  const progress = totalSteps > 0 ? (generatedSteps / totalSteps) * 100 : 0;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800 p-6">
      <div className="max-w-3xl w-full flex flex-col items-center">
        <div className="relative mb-6">
          <Loader2 className="w-12 h-12 animate-spin text-[#6D42EF]" />
          <Book className="w-5 h-5 text-[#E84393] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        
        <p className="text-lg mb-6">{message}</p>
        
        {generatingContent && totalSteps > 0 && (
          <div className="w-full max-w-md mb-6">
            <Progress 
              value={progress} 
              className="h-2 mb-2" 
              indicatorClassName="bg-gradient-to-r from-[#6D42EF] to-[#E84393]" 
            />
            <p className="text-gray-600 text-sm mt-2">
              Generating content... {Math.round(progress)}%
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Generated {generatedSteps} of {totalSteps} content pieces
            </p>
          </div>
        )}
        
        <Button 
          onClick={goToProjects} 
          className="bg-[#6D42EF] hover:bg-[#5835CB] text-white mt-4"
        >
          Back to Projects
        </Button>
      </div>
    </div>
  );
};

export default ContentLoading;
