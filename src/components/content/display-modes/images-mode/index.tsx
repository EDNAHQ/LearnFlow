import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ImagesModeDisplayProps } from './types';
import { useImageGeneration } from './useImageGeneration';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { ImageGridHeader } from './ImageGridHeader';
import { CustomPromptInput } from './CustomPromptInput';
import { PromptSuggestionsModal } from './PromptSuggestionsModal';
import { ImageCardWithOptions } from './ImageCardWithOptions';
import { InfoCard } from './InfoCard';

const ImagesModeDisplay: React.FC<ImagesModeDisplayProps> = ({
  stepId,
  title,
  topic,
  pathId,
}) => {
  const {
    images,
    loading,
    customPrompt,
    setCustomPrompt,
    showPromptInput,
    setShowPromptInput,
    isGeneratingCustom,
    handleGenerateCustomImage,
    handleGenerateImage,
    handleReset,
    completedCount,
    totalCount,
    isGeneratingAny,
    createInitialPrompts,
    currentImageId,
    setCurrentImageId,
  } = useImageGeneration(pathId, topic);

  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);

  if (loading) {
    return <LoadingState />;
  }

  if (images.length === 0) {
    const handleGeneratePrompts = async () => {
      try {
        const { triggerMentalModelGeneration } = await import('@/utils/triggerMentalModelGeneration');
        const prompts = await triggerMentalModelGeneration(pathId, topic);

        if (prompts && prompts.length > 0) {
          await createInitialPrompts(prompts);
        }
      } catch (error) {
        console.error('Failed to generate prompts:', error);
      }
    };

    return (
      <>
        <EmptyState
          onGenerateClick={() => setShowSuggestionsModal(true)}
          onGeneratePrompts={handleGeneratePrompts}
        />
        <PromptSuggestionsModal
          isOpen={showSuggestionsModal}
          onClose={() => setShowSuggestionsModal(false)}
          onSelectPrompt={async (prompt) => {
            await handleGenerateCustomImage(undefined, prompt);
          }}
          topic={topic}
          stepTitle={title}
        />
      </>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto px-3 sm:px-4"
    >
      <ImageGridHeader
        topic={topic}
        completedCount={completedCount}
        totalCount={totalCount}
        isGeneratingAny={isGeneratingAny}
        onGenerateCustom={() => setShowSuggestionsModal(true)}
        onReset={handleReset}
      />

      <PromptSuggestionsModal
        isOpen={showSuggestionsModal}
        onClose={() => setShowSuggestionsModal(false)}
        onSelectPrompt={async (prompt) => {
          await handleGenerateCustomImage(undefined, prompt);
        }}
        topic={topic}
        stepTitle={title}
      />

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {images.map((image, index) => (
          <ImageCardWithOptions
            key={image.id}
            image={image}
            index={index}
            onGenerate={(imageId) => {
              handleGenerateImage(images.findIndex(img => img.id === imageId));
            }}
            topic={topic}
            stepTitle={title}
          />
        ))}
      </div>

      <InfoCard title={title} />
    </motion.div>
  );
};

export default ImagesModeDisplay;