
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PresentationSlide from "./PresentationSlide";
import PresentationControls from "./PresentationControls";
import PresentationOverview from "./PresentationOverview";
import { useContentMode } from "@/hooks/useContentMode";

interface PresentationViewProps {
  content: string;
  title?: string;
}

const PresentationView = ({ content, title }: PresentationViewProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showOverview, setShowOverview] = useState(false);
  const [slides, setSlides] = useState<string[]>([]);
  const { setMode } = useContentMode();

  // Ensure content is always a properly formatted string
  const safeContent = (() => {
    if (typeof content === 'string') {
      return content;
    }
    
    try {
      // Handle nested objects by properly stringifying them
      if (content === null || content === undefined) {
        return "No content available";
      }
      
      if (typeof content === 'object') {
        return JSON.stringify(content, null, 2);
      }
      
      return String(content);
    } catch (error) {
      console.error("Error stringifying content:", error);
      return "Error displaying content";
    }
  })();

  useEffect(() => {
    if (safeContent) {
      console.log("Processing content for slides:", typeof safeContent);
      
      const paragraphs = safeContent
        .split(/\n\n|\n===+\n/)
        .map(p => p.trim())
        .filter(p => p.length > 0);
      
      let processedSlides = paragraphs;
      if (paragraphs.length <= 3 && safeContent.length > 1000) {
        processedSlides = [];
        paragraphs.forEach(paragraph => {
          if (paragraph.length > 400) {
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
  }, [safeContent]);

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

  const exitPresentation = useCallback(() => {
    setMode("text");
  }, [setMode]);

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

  if (!safeContent || slides.length === 0) {
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
      <div className="relative h-screen flex flex-col">
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
          onExit={exitPresentation}
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
