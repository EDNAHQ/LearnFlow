
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
  onExit,
  onToggleOverview,
}: PresentationControlsProps) => {
  const { toggleMode } = useContentMode();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#1A1A1A]/50 to-transparent p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-white/10 border-0 backdrop-blur-sm text-white hover:bg-white/20"
          onClick={onToggleOverview}
        >
          <List className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="bg-white/10 border-0 backdrop-blur-sm text-white hover:bg-white/20"
          onClick={() => toggleMode()}
        >
          <Minimize className="h-4 w-4" />
          <span className="text-xs ml-1">Exit</span>
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="text-white text-sm font-medium">
          {currentSlide + 1} / {totalSlides}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-white/10 border-0 backdrop-blur-sm text-white hover:bg-white/20"
          onClick={onPrevious}
          disabled={currentSlide === 0}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="bg-white/10 border-0 backdrop-blur-sm text-white hover:bg-white/20"
          onClick={onNext}
          disabled={currentSlide === totalSlides - 1}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PresentationControls;
