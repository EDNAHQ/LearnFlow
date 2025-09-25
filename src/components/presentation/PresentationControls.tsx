
import { useContentMode } from "@/hooks/content";
import { cn } from "@/lib/utils";

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

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-4xl px-8">
      {/* Glassmorphic floating control bar */}
      <div className="relative">
        {/* Gradient accent line on top */}
        <div className="absolute -top-px left-0 right-0 h-[2px] bg-gradient-to-r from-brand-purple via-brand-pink to-brand-gold rounded-t-2xl" />

        <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-brand-purple hover:via-brand-pink hover:to-brand-gold hover:bg-clip-text hover:text-transparent transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-white/50"
            onClick={handleToggleOverview}
            type="button"
          >
            Overview
          </button>

          <button
            className="text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-brand-purple hover:via-brand-pink hover:to-brand-gold hover:bg-clip-text hover:text-transparent transition-all duration-300 px-3 py-1.5 rounded-lg hover:bg-white/50"
            onClick={handleExit}
            type="button"
          >
            Exit
          </button>
        </div>
      
        {/* Progress indicator with gradient */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSlides }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === currentSlide
                    ? "w-8 bg-gradient-to-r from-brand-purple via-brand-pink to-brand-gold"
                    : i < currentSlide
                    ? "w-1.5 bg-gradient-to-r from-brand-purple/40 via-brand-pink/40 to-brand-gold/40"
                    : "w-1.5 bg-gray-300"
                )}
              />
            ))}
          </div>
        </div>
      
        <div className="md:hidden flex items-center gap-2">
          <div className="text-sm font-medium bg-gradient-to-r from-brand-purple via-brand-pink to-brand-gold bg-clip-text text-transparent">
            {currentSlide + 1} / {totalSlides}
          </div>
        </div>
      
        <div className="flex items-center gap-3">
          <button
            className={cn(
              "text-sm font-medium px-4 py-2 rounded-xl transition-all duration-300",
              currentSlide === 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gradient-to-r hover:from-brand-purple hover:via-brand-pink hover:to-brand-gold hover:bg-clip-text hover:text-transparent hover:bg-white/50"
            )}
            onClick={handlePrevious}
            disabled={currentSlide === 0}
            type="button"
          >
            ← Previous
          </button>

          <button
            className={cn(
              "text-sm font-medium px-4 py-2 rounded-xl transition-all duration-300",
              currentSlide === totalSlides - 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gradient-to-r hover:from-brand-purple hover:via-brand-pink hover:to-brand-gold hover:bg-clip-text hover:text-transparent hover:bg-white/50"
            )}
            onClick={handleNext}
            disabled={currentSlide === totalSlides - 1}
            type="button"
          >
            Next →
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default PresentationControls;
