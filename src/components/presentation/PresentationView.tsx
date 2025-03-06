
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

  // Parse content into slides with improved handling
  useEffect(() => {
    if (content) {
      // Split by double newlines or ===== separator
      const paragraphs = content
        .split(/\n\n|\n===+\n/)
        .map(p => p.trim())
        .filter(p => p.length > 0);
      
      // If we ended up with very few slides, try to split longer slides
      let processedSlides = paragraphs;
      if (paragraphs.length <= 3 && content.length > 1000) {
        // For longer content with few paragraph breaks, split by sentences
        // to create more manageable slides
        processedSlides = [];
        paragraphs.forEach(paragraph => {
          if (paragraph.length > 400) {
            // Split long paragraphs by sentences
            const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [];
            let currentSlide = "";
            
            sentences.forEach(sentence => {
              if (currentSlide.length + sentence.length < 400) {
                currentSlide += sentence;
              } else {
                if (currentSlide) processedSlides.push(currentSlide.trim());
                currentSlide = sentence;
              }
            });
            
            if (currentSlide) processedSlides.push(currentSlide.trim());
          } else {
            processedSlides.push(paragraph);
          }
        });
      }
      
      setSlides(processedSlides);
      console.log("Slides created:", processedSlides.length);
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

  const toggleOverview = useCallback(() => {
    setShowOverview(prev => !prev);
  }, []);

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
        setShowOverview(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextSlide, goToPreviousSlide, showOverview]);

  if (!content || slides.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md border border-gray-200">
          <p className="text-gray-600">No content available for presentation.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="fixed inset-0 bg-gray-50 z-40"
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
          onToggleOverview={toggleOverview}
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
