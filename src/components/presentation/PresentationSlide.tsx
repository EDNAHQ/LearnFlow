
import { motion } from "framer-motion";
import { memo } from "react";

interface PresentationSlideProps {
  content: string;
  isActive: boolean;
}

// Use memo to prevent unnecessary re-renders
const PresentationSlide = memo(({ content, isActive }: PresentationSlideProps) => {
  // Don't render inactive slides with animations to improve performance
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
