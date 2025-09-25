
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PresentationSlide from "./PresentationSlide";
import PresentationControls from "./PresentationControls";
import PresentationOverview from "./PresentationOverview";
import { useContentMode } from "@/hooks/content";

export interface SlideContent {
  type: 'text' | 'code' | 'mixed';
  content: string;
  language?: string;
  preview?: string;
  imageUrl?: string;
  imageType?: 'hero' | 'concept' | 'technical' | 'ambient';
}

interface PresentationViewProps {
  content: string;
  title?: string;
}

const PresentationView = ({ content, title }: PresentationViewProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showOverview, setShowOverview] = useState(false);
  const { setMode } = useContentMode();
  const slidesProcessed = useRef(false);

  // Helper function to split text into slides
  const splitTextIntoSlides = (text: string): SlideContent[] => {
    const paragraphs = text
      .split(/\n\n|\n===+\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const slides: SlideContent[] = [];

    paragraphs.forEach(paragraph => {
      // If paragraph is short enough, make it a slide
      if (paragraph.length <= 600) {
        slides.push({ type: 'text', content: paragraph });
      } else {
        // Split long paragraphs by sentences
        const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
        let currentSlide = "";

        sentences.forEach(sentence => {
          if (currentSlide.length + sentence.length < 600) {
            currentSlide += sentence;
          } else {
            if (currentSlide) slides.push({ type: 'text', content: currentSlide.trim() });
            currentSlide = sentence;
          }
        });

        if (currentSlide) slides.push({ type: 'text', content: currentSlide.trim() });
      }
    });

    return slides.length > 0 ? slides : [{ type: 'text', content: text }];
  };

  // Process content once using useMemo to avoid unnecessary re-renders
  const slides = useMemo((): SlideContent[] => {
    // Don't reprocess if we've already done it
    if (slidesProcessed.current) {
      return [];
    }

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

    if (!safeContent) {
      return [];
    }

    // Smart content splitting that preserves code blocks
    const processedSlides: SlideContent[] = [];

    // Match markdown code blocks with language tags
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(safeContent)) !== null) {
      // Add text before code block
      const textBefore = safeContent.substring(lastIndex, match.index).trim();
      if (textBefore) {
        // Split long text into multiple slides
        const textSlides = splitTextIntoSlides(textBefore);
        processedSlides.push(...textSlides);
      }

      // Add code block as its own slide
      const language = match[1] || 'text';
      const code = match[2].trim();
      processedSlides.push({
        type: 'code',
        content: code,
        language: language,
        preview: code.split('\n').slice(0, 2).join('\n') + '...'
      });

      lastIndex = codeBlockRegex.lastIndex;
    }

    // Add remaining text after last code block
    const textAfter = safeContent.substring(lastIndex).trim();
    if (textAfter) {
      const textSlides = splitTextIntoSlides(textAfter);
      processedSlides.push(...textSlides);
    }

    // If no code blocks were found, process as regular text
    if (processedSlides.length === 0) {
      const textSlides = splitTextIntoSlides(safeContent);
      processedSlides.push(...textSlides);
    }

    slidesProcessed.current = true;
    return processedSlides;
  }, [content]);

  // Reset slides processing flag when content changes completely
  useEffect(() => {
    slidesProcessed.current = false;
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

  const exitPresentation = useCallback(() => {
    setMode("text");
  }, [setMode]);

  // Go to a specific slide directly
  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index);
      setShowOverview(false);
    }
  }, [slides.length]);

  // Use a memo-ed keyboard handler to avoid unnecessary re-renders
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
      } else if (e.key >= "1" && e.key <= "9") {
        const slideNumber = parseInt(e.key, 10) - 1;
        if (slideNumber < slides.length) {
          goToSlide(slideNumber);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextSlide, goToPreviousSlide, showOverview, slides.length, goToSlide]);

  if (slides.length === 0) {
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
      className="fixed inset-0 z-40 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Dynamic gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white" />

      {/* Ambient floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-20"
          style={{
            background: 'radial-gradient(circle, #6654f5 0%, transparent 70%)',
            top: '10%',
            left: '5%',
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
          style={{
            background: 'radial-gradient(circle, #ca5a8b 0%, transparent 70%)',
            top: '50%',
            right: '10%',
          }}
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className="absolute w-[450px] h-[450px] rounded-full blur-3xl opacity-15"
          style={{
            background: 'radial-gradient(circle, #f2b347 0%, transparent 70%)',
            bottom: '10%',
            left: '30%',
          }}
          animate={{
            x: [0, -60, 0],
            y: [0, -40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </div>

      {/* Subtle vignette effect */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.03) 100%)'
      }} />

      <div className="relative min-h-screen flex flex-col">
        <div className="flex-1 relative overflow-hidden">
          {slides.map((slide, index) => (
            <PresentationSlide
              key={index}
              slideContent={slide}
              isActive={currentSlide === index}
              slideNumber={index + 1}
              totalSlides={slides.length}
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
            onSelectSlide={goToSlide}
            onClose={() => setShowOverview(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PresentationView;
