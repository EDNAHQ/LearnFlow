import React from 'react';
import { motion } from 'framer-motion';
import { ImagesModeDisplayProps } from './types';
import { useImageGeneration } from './useImageGeneration';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { ImageGridHeader } from './ImageGridHeader';
import { CustomPromptInput } from './CustomPromptInput';
import { ImageCard } from './ImageCard';
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
  } = useImageGeneration(pathId, topic);

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
          onGenerateClick={() => setShowPromptInput(true)}
          onGeneratePrompts={handleGeneratePrompts}
        />
        <CustomPromptInput
          show={showPromptInput}
          value={customPrompt}
          isGenerating={isGeneratingCustom}
          title={title}
          topic={topic}
          onChange={setCustomPrompt}
          onGenerate={handleGenerateCustomImage}
          onCancel={() => {
            setShowPromptInput(false);
            setCustomPrompt('');
          }}
        />
      </>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto"
    >
      <ImageGridHeader
        topic={topic}
        completedCount={completedCount}
        totalCount={totalCount}
        isGeneratingAny={isGeneratingAny}
        onGenerateCustom={() => setShowPromptInput(!showPromptInput)}
        onReset={handleReset}
      />

      <CustomPromptInput
        show={showPromptInput}
        value={customPrompt}
        isGenerating={isGeneratingCustom}
        title={title}
        topic={topic}
        onChange={setCustomPrompt}
        onGenerate={handleGenerateCustomImage}
        onCancel={() => {
          setShowPromptInput(false);
          setCustomPrompt('');
        }}
      />

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {images.map((image, index) => (
          <ImageCard
            key={index}
            image={image}
            index={index}
            onGenerate={() => handleGenerateImage(index)}
          />
        ))}
      </div>

      <InfoCard title={title} />
    </motion.div>
  );
};

export default ImagesModeDisplay;