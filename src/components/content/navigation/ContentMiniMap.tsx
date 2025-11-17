import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useBehaviorTracking } from "@/hooks/analytics";
import { useParams } from "react-router-dom";

interface MiniMapStep {
  id: string;
  title: string;
  order_index: number;
}

interface ContentMiniMapProps {
  steps: MiniMapStep[];
  currentStepIndex: number;
  onNavigateToStep: (index: number) => void;
  className?: string;
}

const ContentMiniMap: React.FC<ContentMiniMapProps> = ({
  steps,
  currentStepIndex,
  onNavigateToStep,
  className
}) => {
  const { pathId } = useParams();
  const { logBehavior } = useBehaviorTracking();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleStepClick = (index: number) => {
    // Track step navigation via minimap
    logBehavior({
      actionType: 'click',
      contentId: steps[index]?.id || `step-${index}`,
      contentType: 'step',
      pathId: pathId || undefined,
      stepId: steps[index]?.id,
      metadata: {
        navigation: 'minimap',
        fromStep: currentStepIndex,
        toStep: index,
        stepTitle: steps[index]?.title
      }
    });
    onNavigateToStep(index);
  };

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = window.scrollY;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(Math.min(scrolled, 100));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={cn(
        "w-full lg:sticky lg:top-24 lg:h-fit lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn(
        "bg-white/70 backdrop-blur-md rounded-2xl border border-gray-200/60 p-4 sm:p-6 shadow-lg transition-all duration-300",
        isHovered && "shadow-xl border-brand-primary/30"
      )}>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200/60">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Navigation
          </h3>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500">
              {currentStepIndex + 1}/{steps.length}
            </div>
            <div className="w-10 sm:w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-primary to-brand-accent"
                initial={{ width: "0%" }}
                animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {steps.map((step, index) => {
            const isCurrent = index === currentStepIndex;
            const isPast = index < currentStepIndex;
            const isFuture = index > currentStepIndex;

            return (
              <motion.button
                key={step.id}
                onClick={() => handleStepClick(index)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden",
                  isCurrent && "bg-gradient-to-r from-brand-primary/10 to-brand-accent/10 border border-brand-primary/30",
                  isPast && "bg-gray-50 hover:bg-gray-100",
                  isFuture && "bg-white hover:bg-gray-50 border border-transparent hover:border-gray-200"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isCurrent && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-primary to-brand-accent"
                    layoutId="activeIndicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <div className="flex items-start gap-3">
                  <div className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                    isCurrent && "bg-gradient-to-br from-brand-primary to-brand-accent text-white",
                    isPast && "bg-gray-300 text-gray-600",
                    isFuture && "bg-gray-200 text-gray-400 group-hover:bg-gray-300"
                  )}>
                    {isPast ? "✓" : index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "text-sm font-medium line-clamp-2 transition-colors",
                      isCurrent && "text-brand-primary font-semibold",
                      isPast && "text-gray-600",
                      isFuture && "text-gray-500 group-hover:text-gray-700"
                    )}>
                      {step.title}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200/60">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-primary via-brand-accent to-brand-highlight"
                initial={{ width: "0%" }}
                animate={{ width: `${scrollProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <div className="text-xs font-medium text-gray-500">
              {Math.round(scrollProgress)}%
            </div>
          </div>
          <div className="text-xs text-gray-400">Page scroll progress</div>
        </div>
      </div>
    </motion.div>
  );
};

export default ContentMiniMap;