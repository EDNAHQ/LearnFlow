
import { motion } from "framer-motion";
import { memo, useState, useEffect } from "react";

interface PresentationSlideProps {
  content: string;
  isActive: boolean;
}

// Use memo to prevent unnecessary re-renders
const PresentationSlide = memo(({ content, isActive }: PresentationSlideProps) => {
  // Track if slide has been activated to prevent unnecessary animations when switching slides
  const [wasActive, setWasActive] = useState(false);
  
  useEffect(() => {
    if (isActive && !wasActive) {
      setWasActive(true);
    }
  }, [isActive, wasActive]);

  // Don't render slides that have never been active to improve performance
  if (!isActive && !wasActive) {
    return null;
  }
  
  // Use a simpler version for inactive but previously shown slides
  if (!isActive) {
    return (
      <div className="absolute inset-0 opacity-0 z-0 pointer-events-none" />
    );
  }
  
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center p-6 opacity-100 z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full max-w-5xl mx-auto px-8 py-12 bg-white text-gray-800 rounded-xl shadow-md border border-gray-100">
        <p className="text-xl leading-relaxed font-light">{content}</p>
      </div>
    </motion.div>
  );
});

// Add displayName for better debugging
PresentationSlide.displayName = "PresentationSlide";

export default PresentationSlide;
