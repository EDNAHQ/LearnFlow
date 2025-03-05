
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, List, Minimize } from "lucide-react";
import { useContentMode } from "@/hooks/useContentMode";

interface PresentationControlsProps {
  currentSlide: number;
  totalSlides: number;
  onPrevious: () => void;
  onNext: () => void;
  onExit?: () => void;
  onToggleOverview?: () => void;
}

const PresentationControls = ({
  currentSlide,
  totalSlides,
  onPrevious,
  onNext,
  onToggleOverview,
}: PresentationControlsProps) => {
  const { toggleMode } = useContentMode();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-200 to-transparent p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
          onClick={onToggleOverview}
        >
          <List className="h-4 w-4" />
          <span className="ml-1">Overview</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
          onClick={() => toggleMode()}
        >
          <Minimize className="h-4 w-4" />
          <span className="ml-1">Exit</span>
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="text-gray-800 font-medium bg-white px-3 py-1 rounded-full border border-gray-200">
          {currentSlide + 1} / {totalSlides}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
          onClick={onPrevious}
          disabled={currentSlide === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Previous</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
          onClick={onNext}
          disabled={currentSlide === totalSlides - 1}
        >
          <span>Next</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default PresentationControls;
