
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Grid, Minimize } from "lucide-react";
import { useContentMode } from "@/hooks/useContentMode";
import { cn } from "@/lib/utils";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink 
} from "@/components/ui/pagination";

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
  onExit,
}: PresentationControlsProps) => {
  const { setMode } = useContentMode();

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
    if (onExit) {
      onExit();
    } else {
      setMode("text");
    }
  };

  // Generate pagination numbers - show max 5 slides
  const getPaginationNumbers = () => {
    if (totalSlides <= 7) {
      return Array.from({ length: totalSlides }, (_, i) => i);
    }
    
    let pages = [0]; // Always show first slide
    
    if (currentSlide < 3) {
      pages = [...pages, 1, 2, 3, 4];
    } else if (currentSlide > totalSlides - 4) {
      pages = [...pages, totalSlides - 5, totalSlides - 4, totalSlides - 3, totalSlides - 2, totalSlides - 1];
    } else {
      pages = [...pages, currentSlide - 2, currentSlide - 1, currentSlide, currentSlide + 1, currentSlide + 2];
    }
    
    if (!pages.includes(totalSlides - 1)) {
      if (pages[pages.length - 1] !== totalSlides - 2) {
        pages.push(-1); // -1 indicates ellipsis
      }
      pages.push(totalSlides - 1);
    }
    
    if (pages[1] !== 1 && pages[1] !== -1) {
      pages = [pages[0], -1, ...pages.slice(1)];
    }
    
    return pages;
  };

  const pageNumbers = getPaginationNumbers();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4 flex items-center justify-between z-20">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="rounded-full bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm"
          onClick={handleToggleOverview}
          type="button"
        >
          <Grid className="h-4 w-4 mr-1" />
          <span>Overview</span>
        </Button>
        
        <Button
          size="sm"
          className="rounded-full bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm"
          onClick={handleExit}
          type="button"
        >
          <Minimize className="h-4 w-4 mr-1" />
          <span>Exit</span>
        </Button>
      </div>
      
      <div className="hidden md:block">
        <Pagination>
          <PaginationContent>
            {pageNumbers.map((pageIndex, i) => (
              pageIndex === -1 ? (
                <PaginationItem key={`ellipsis-${i}`}>
                  <span className="px-2">...</span>
                </PaginationItem>
              ) : (
                <PaginationItem key={pageIndex}>
                  <PaginationLink
                    onClick={(e) => {
                      e.preventDefault();
                      if (pageIndex < currentSlide) {
                        for (let i = 0; i < currentSlide - pageIndex; i++) {
                          onPrevious();
                        }
                      } else if (pageIndex > currentSlide) {
                        for (let i = 0; i < pageIndex - currentSlide; i++) {
                          onNext();
                        }
                      }
                    }}
                    isActive={currentSlide === pageIndex}
                    className="rounded-full w-8 h-8 p-0 flex items-center justify-center"
                  >
                    {pageIndex + 1}
                  </PaginationLink>
                </PaginationItem>
              )
            ))}
          </PaginationContent>
        </Pagination>
      </div>
      
      <div className="md:hidden flex items-center gap-2">
        <div className="text-gray-700 font-medium bg-white px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">
          {currentSlide + 1} / {totalSlides}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={currentSlide === 0 ? "outline" : "default"}
          className={cn(
            "rounded-full shadow-sm",
            currentSlide === 0 
              ? "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50" 
              : "bg-brand-purple hover:bg-brand-purple/90 text-white"
          )}
          onClick={handlePrevious}
          disabled={currentSlide === 0}
          type="button"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Previous</span>
        </Button>
        
        <Button
          size="sm"
          variant={currentSlide === totalSlides - 1 ? "outline" : "default"}
          className={cn(
            "rounded-full shadow-sm",
            currentSlide === totalSlides - 1 
              ? "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50" 
              : "bg-brand-purple hover:bg-brand-purple/90 text-white"
          )}
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
