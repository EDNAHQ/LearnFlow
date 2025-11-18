import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Section } from '@/hooks/content/useContentProgress';

interface ContentProgressIndicatorProps {
  sections: Section[];
  completedSections: Set<string>;
  progressPercentage: number;
  onSectionClick: (sectionId: string) => void;
  className?: string;
}

export const ContentProgressIndicator: React.FC<ContentProgressIndicatorProps> = ({
  sections,
  completedSections,
  progressPercentage,
  onSectionClick,
  className,
}) => {
  if (sections.length === 0) return null;

  return (
    <div className={cn(
      "hidden lg:block fixed right-8 top-1/2 -translate-y-1/2 z-10",
      className
    )}>
      <div className="flex flex-col items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg border border-brand-purple/10">
        {/* Progress bar */}
        <div className="w-1 h-32 bg-gray-200 rounded-full relative overflow-hidden">
          <div
            className="absolute bottom-0 w-full bg-brand-gradient rounded-full transition-all duration-300"
            style={{ height: `${progressPercentage}%` }}
          />
        </div>

        {/* Section dots */}
        <div className="flex flex-col gap-3 items-center">
          {sections.map((section, index) => {
            const isCompleted = completedSections.has(section.id);
            const isH2 = section.level === 2;

            return (
              <button
                key={section.id}
                onClick={() => onSectionClick(section.id)}
                className={cn(
                  "transition-all duration-200 hover:scale-110",
                  "focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 rounded-full",
                  isH2 && "mb-1"
                )}
                aria-label={`Go to ${section.title}`}
                title={section.title}
              >
                {isCompleted ? (
                  <CheckCircle2
                    className={cn(
                      "text-brand-purple",
                      isH2 ? "h-5 w-5" : "h-4 w-4"
                    )}
                  />
                ) : (
                  <Circle
                    className={cn(
                      "text-gray-400 hover:text-brand-purple transition-colors",
                      isH2 ? "h-5 w-5" : "h-4 w-4"
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Progress percentage */}
        <div className="text-xs font-medium text-brand-purple mt-2">
          {Math.round(progressPercentage)}%
        </div>
      </div>
    </div>
  );
};

