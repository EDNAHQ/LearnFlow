import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Step } from "@/components/learning/LearningStep";
import { cn } from "@/lib/utils";

interface StepDetailModalProps {
  step: Step | null;
  index: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const StepDetailModal = ({ step, index, isOpen, onClose }: StepDetailModalProps) => {
  if (!step) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden pointer-events-auto flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative p-6 border-b border-gray-200 flex-shrink-0">
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>

                <div className="pr-12">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg font-bold text-lg bg-brand-purple text-white shadow-md">
                      {index !== null ? index + 1 : ''}
                    </div>
                    <h2 className="text-2xl font-bold text-brand-black">
                      Chapter {index !== null ? index + 1 : ''}
                    </h2>
                  </div>
                  <h3 className="text-xl font-bold text-gradient leading-tight">
                    {step.title}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="prose prose-sm max-w-none">
                  <p className="text-base font-light leading-relaxed text-gray-700 whitespace-pre-wrap">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 flex-shrink-0 flex justify-end">
                <Button
                  onClick={onClose}
                  className="brand-gradient text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default StepDetailModal;



