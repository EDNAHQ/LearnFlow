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
      className="max-w-4xl mx-auto"
    >
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-12 border border-gray-200 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Mental Model Images Yet
        </h3>
        <p className="text-gray-600 mb-6">
          Generate visual mental models to help understand this content
        </p>

        <div className="flex flex-col items-center gap-4">
          {onGeneratePrompts && (
            <Button onClick={onGeneratePrompts} variant="default">
              Generate Mental Model Prompts
            </Button>
          )}
          <Button onClick={onGenerateClick} variant="outline">
            Generate Custom Image
          </Button>
        </div>
      </div>
    </motion.div>
  );
};