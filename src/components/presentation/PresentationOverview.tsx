
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
      className="fixed inset-0 bg-black/90 z-50 p-8 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium text-white">Slides Overview</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {slides.map((slide, index) => (
            <div
              key={index}
              onClick={() => {
                onSelectSlide(index);
                onClose();
              }}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                currentSlide === index 
                  ? 'bg-[#6D42EF] text-white' 
                  : 'bg-gray-800 text-gray-100 hover:bg-gray-700'
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
