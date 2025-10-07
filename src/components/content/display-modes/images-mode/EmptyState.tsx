import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onGenerateClick: () => void;
  onGeneratePrompts?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onGenerateClick, onGeneratePrompts }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4"
    >
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 sm:p-10 border border-gray-200">
        <div className="text-center mb-8">
          <h3 className="text-xl sm:text-2xl font-bold mb-3 bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
            Visualize Your Learning
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Transform complex concepts into memorable visual mental models.
            Choose from smart suggestions or describe your own visualization.
          </p>
        </div>

        <div className="flex flex-col items-stretch sm:items-center gap-3 sm:gap-4 max-w-md mx-auto">
          <Button
            onClick={onGenerateClick}
            variant="default"
            className="w-full sm:w-auto h-auto py-3"
          >
            <div className="text-center">
              <div className="font-semibold">Choose from Suggestions</div>
              <div className="text-xs opacity-90">Pick from curated visualization styles</div>
            </div>
          </Button>

          {onGeneratePrompts && (
            <Button
              onClick={onGeneratePrompts}
              variant="outline"
              className="w-full sm:w-auto h-auto py-3"
            >
              <div className="text-center">
                <div className="font-semibold">Auto-Generate Set</div>
                <div className="text-xs text-gray-600">Create 4 visualizations automatically</div>
              </div>
            </Button>
          )}
        </div>

        {/* Visual examples preview */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
          {[
            { label: 'Architecture' },
            { label: 'Mind Map' },
            { label: 'Process Flow' },
            { label: 'Concepts' },
          ].map((type, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className="p-3 rounded-lg border border-brand-primary/20 bg-brand-primary/5"
            >
              <div className="text-xs text-gray-700 text-center font-medium">{type.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};