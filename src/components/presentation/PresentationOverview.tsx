
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { SlideContent } from "./PresentationView";

interface PresentationOverviewProps {
  slides: SlideContent[];
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
      className="fixed inset-0 z-50 p-4 sm:p-6 md:p-8 overflow-y-auto"
      initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
      exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      style={{
        background: 'rgba(255, 255, 255, 0.95)'
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-brand-purple via-brand-pink to-brand-gold bg-clip-text text-transparent">
              All Slides
            </h3>
            <p className="text-sm text-gray-600 mt-1">{slides.length} slides total</p>
          </div>
          <button
            onClick={handleClose}
            className="text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-brand-purple hover:via-brand-pink hover:to-brand-gold hover:bg-clip-text hover:text-transparent transition-all duration-300 px-3 sm:px-4 py-2 rounded-xl hover:bg-white/50 self-start sm:self-auto"
            type="button"
          >
            Close ✕
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {slides.map((slide, index) => {
            const isActive = currentSlide === index;
            return (
              <motion.div
                key={index}
                onClick={handleSelectSlide(index)}
                className="relative group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ y: -4 }}
              >
                {/* Gradient border for active slide */}
                {isActive && (
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-purple via-brand-pink to-brand-gold rounded-2xl opacity-75 blur-sm animate-pulse" />
                )}

                {/* Card container */}
                <div
                  className={cn(
                    "relative backdrop-blur-xl rounded-2xl p-5 transition-all duration-300 border",
                    isActive
                      ? "bg-white/90 border-transparent shadow-2xl"
                      : "bg-white/60 border-gray-200/50 hover:bg-white/80 hover:border-gray-300/50 shadow-lg hover:shadow-xl"
                  )}
                >
                  {/* Slide number with gradient */}
                  <div className="absolute top-3 right-3">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300",
                        isActive
                          ? "bg-gradient-to-r from-brand-purple via-brand-pink to-brand-gold text-white"
                          : "bg-gray-100 text-gray-600 group-hover:bg-gradient-to-r group-hover:from-brand-purple/20 group-hover:via-brand-pink/20 group-hover:to-brand-gold/20"
                      )}
                    >
                      {index + 1}
                    </div>
                  </div>

                  {/* Slide preview text */}
                  <p
                    className={cn(
                      "text-sm leading-relaxed line-clamp-5 mt-2 transition-colors duration-300",
                      isActive
                        ? "text-gray-800 font-medium"
                        : "text-gray-600",
                      slide.type === 'code' && "font-mono text-xs"
                    )}
                  >
                    {slide.type === 'code' ? (
                      <>
                        <span className="inline-block px-2 py-0.5 bg-gradient-to-r from-brand-purple/20 to-brand-pink/20 rounded text-xs font-sans mb-1">
                          {slide.language?.toUpperCase() || 'CODE'}
                        </span>
                        <br />
                        {slide.preview || slide.content.substring(0, 100) + '...'}
                      </>
                    ) : (
                      slide.content
                    )}
                  </p>

                  {/* Bottom gradient accent for active */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-purple via-brand-pink to-brand-gold rounded-b-2xl" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default PresentationOverview;
