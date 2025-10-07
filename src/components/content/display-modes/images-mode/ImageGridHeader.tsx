import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ImageGridHeaderProps {
  topic: string;
  completedCount: number;
  totalCount: number;
  isGeneratingAny: boolean;
  onGenerateCustom: () => void;
  onReset: () => void;
}

export const ImageGridHeader: React.FC<ImageGridHeaderProps> = ({
  topic,
  completedCount,
  totalCount,
  isGeneratingAny,
  onGenerateCustom,
  onReset,
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 text-base sm:text-lg flex-1"
        >
          Visual representations to help you understand {topic}
        </motion.p>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            onClick={onReset}
            variant="ghost"
            className="w-full sm:w-auto"
          >
            Reset All
          </Button>
          <Button
            onClick={onGenerateCustom}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Generate Custom Image
          </Button>
        </div>
      </div>

      {isGeneratingAny && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 flex items-center gap-3 text-sm"
        >
          <span className="text-gray-600">
            {completedCount}/{totalCount} images generated
          </span>
        </motion.div>
      )}
    </div>
  );
};