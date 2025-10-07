import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PromptSuggestionsModal } from './PromptSuggestionsModal';
import type { MentalModelImage } from './types';

interface ImageCardWithOptionsProps {
  image: MentalModelImage;
  index: number;
  onGenerate: (prompt?: string) => void;
  topic: string;
  stepTitle?: string;
}

export const ImageCardWithOptions: React.FC<ImageCardWithOptionsProps> = ({
  image,
  index,
  onGenerate,
  topic,
  stepTitle
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSelectPrompt = (prompt: string) => {
    onGenerate(prompt);
    setShowSuggestions(false);
  };

  // Only use brand colors
  const cardBackgrounds = [
    'bg-brand-primary/5',
    'bg-brand-accent/5',
    'bg-brand-primary/5',
    'bg-brand-accent/5',
  ];

  const borderColors = [
    'border-brand-primary/20 hover:border-brand-primary/40',
    'border-brand-accent/20 hover:border-brand-accent/40',
    'border-brand-primary/20 hover:border-brand-primary/40',
    'border-brand-accent/20 hover:border-brand-accent/40',
  ];

  const colorIndex = index % 4;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card className={`relative overflow-hidden border-2 transition-all duration-300 ${borderColors[colorIndex]} ${cardBackgrounds[colorIndex]}`}>
          {/* Content */}
          <div className="relative p-6">
            {/* Header with prompt preview */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Mental Model #{index + 1}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {image.prompt || 'Ready to generate a visualization'}
              </p>
            </div>

            {/* Image Display Area */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 mb-4">
              {image.image_url ? (
                <>
                  <img
                    src={image.image_url}
                    alt={`Mental model ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay on hover */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center gap-3"
                  >
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setShowSuggestions(true)}
                      className="bg-white/90 hover:bg-white"
                    >
                      Regenerate
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setShowSuggestions(true)}
                      className="bg-white/90 hover:bg-white"
                    >
                      Edit Prompt
                    </Button>
                  </motion.div>
                </>
              ) : image.is_generating ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-brand-primary/20 rounded-full" />
                    <div className="absolute inset-0 w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className="mt-4 text-sm text-gray-600 animate-pulse">Generating image...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <p className="text-gray-600 mb-4">
                    Ready to create a visual mental model
                  </p>
                  <Button
                    onClick={() => setShowSuggestions(true)}
                    size="sm"
                  >
                    Generate Image
                  </Button>
                </div>
              )}
            </div>

            {/* Status indicators */}
            {image.image_url && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-primary font-medium">
                  Generated
                </span>
                {image.created_at && (
                  <span className="text-gray-500">
                    {new Date(image.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      <PromptSuggestionsModal
        isOpen={showSuggestions}
        onClose={() => setShowSuggestions(false)}
        onSelectPrompt={handleSelectPrompt}
        topic={topic}
        stepTitle={stepTitle}
        currentContent={image.prompt}
      />
    </>
  );
};