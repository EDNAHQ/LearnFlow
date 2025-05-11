
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
  const handleSelectSlide = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectSlide(index);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-white z-50 p-8 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium text-gray-800">All Slides ({slides.length})</h3>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleClose} 
            className="text-gray-800 hover:bg-gray-100"
            type="button"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {slides.map((slide, index) => (
            <div
              key={index}
              onClick={handleSelectSlide(index)}
              className={`relative p-4 rounded-lg cursor-pointer transition-all ${
                currentSlide === index 
                  ? 'bg-[#6D42EF] text-white shadow-md' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {/* Slide number indicator */}
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white text-[#6D42EF] flex items-center justify-center text-xs font-semibold">
                {index + 1}
              </div>
              
              <p className="text-sm line-clamp-4 mt-4">{slide}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default PresentationOverview;
