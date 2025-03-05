
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

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPrevious();
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onNext();
  };

  const handleToggleOverview = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleOverview) onToggleOverview();
  };

  const handleExit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMode();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center justify-between shadow-lg z-20">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
          onClick={handleToggleOverview}
          type="button"
        >
          <List className="h-4 w-4" />
          <span className="ml-1">Overview</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
          onClick={handleExit}
          type="button"
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
          onClick={handlePrevious}
          disabled={currentSlide === 0}
          type="button"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Previous</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
          onClick={handleNext}
          disabled={currentSlide === totalSlides - 1}
          type="button"
        >
          <span>Next</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default PresentationControls;
