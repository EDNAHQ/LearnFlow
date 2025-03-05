
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface PresentationOverviewProps {
  slides: string[];
  currentSlide: number;
  onSelectSlide: (index: number) => void;
  onClose: () => void;
}

const PresentationOverview = ({
  slides,
  currentSlide,
  onSelectSlide,
  onClose,
}: PresentationOverviewProps) => {
  return (
    <motion.div
      className="fixed inset-0 bg-white/95 z-50 p-8 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium text-gray-800">Slides Overview</h3>
          <Button variant="outline" size="icon" onClick={onClose} className="text-gray-800 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {slides.map((slide, index) => (
            <div
              key={index}
              onClick={() => onSelectSlide(index)}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                currentSlide === index 
                  ? 'bg-brand-purple text-white shadow-md' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <div className="text-xs font-medium mb-2">Slide {index + 1}</div>
              <p className="text-sm line-clamp-4">{slide}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default PresentationOverview;
