
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PresentationSlide from "./PresentationSlide";
import PresentationControls from "./PresentationControls";
import PresentationOverview from "./PresentationOverview";

interface PresentationViewProps {
  content: string;
}

const PresentationView = ({ content }: PresentationViewProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showOverview, setShowOverview] = useState(false);
  const [slides, setSlides] = useState<string[]>([]);

  // Parse content into slides (paragraphs)
  useEffect(() => {
    if (content) {
      const paragraphs = content.split("\n\n").filter(p => p.trim().length > 0);
      setSlides(paragraphs);
    }
  }, [content]);

  const goToNextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  }, [currentSlide, slides.length]);

  const goToPreviousSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  }, [currentSlide]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showOverview) return;
      
      if (e.key === "ArrowRight" || e.key === " ") {
        goToNextSlide();
      } else if (e.key === "ArrowLeft") {
        goToPreviousSlide();
      } else if (e.key === "Escape") {
        setShowOverview(false);
      } else if (e.key === "o") {
        setShowOverview(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextSlide, goToPreviousSlide, showOverview]);

  if (!content || slides.length === 0) {
    return <div className="text-center py-10">No content available for presentation.</div>;
  }

  return (
    <motion.div 
      className="fixed inset-0 bg-gray-100 z-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative min-h-screen flex flex-col">
        <div className="flex-1 relative overflow-hidden">
          {slides.map((slide, index) => (
            <PresentationSlide 
              key={index} 
              content={slide} 
              isActive={currentSlide === index} 
            />
          ))}
        </div>
        
        <PresentationControls 
          currentSlide={currentSlide}
          totalSlides={slides.length}
          onPrevious={goToPreviousSlide}
          onNext={goToNextSlide}
          onToggleOverview={() => setShowOverview(true)}
        />
      </div>
      
      <AnimatePresence>
        {showOverview && (
          <PresentationOverview
            slides={slides}
            currentSlide={currentSlide}
            onSelectSlide={(index) => {
              setCurrentSlide(index);
              setShowOverview(false);
            }}
            onClose={() => setShowOverview(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PresentationView;
