import { useState, useEffect, useCallback } from 'react';
import { useMentalModelImagesTable } from '@/hooks/content/useMentalModelImagesTable';
import { triggerMentalModelGeneration } from '@/utils/triggerMentalModelGeneration';

export const useImageGenerationTable = (pathId: string, topic: string) => {
  const {
    images,
    loading,
    generateImage,
    resetFailedImages,
    createInitialPrompts,
  } = useMentalModelImagesTable({ pathId });

  const [customPrompt, setCustomPrompt] = useState('');
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);

  // Check if we need to create initial prompts
  useEffect(() => {
    const checkAndCreatePrompts = async () => {
      if (!loading && images.length === 0 && pathId && topic) {
        console.log('No images found, generating initial prompts...');
        try {
          const data = await triggerMentalModelGeneration(pathId, topic);
          if (data?.prompts && Array.isArray(data.prompts)) {
            await createInitialPrompts(data.prompts);
          }
        } catch (error) {
          console.error('Error creating initial prompts:', error);
        }
      }
    };

    checkAndCreatePrompts();
  }, [loading, images.length, pathId, topic, createInitialPrompts]);

  const handleGenerateCustomImage = useCallback(async () => {
    if (!customPrompt.trim()) return;

    try {
      setIsGeneratingCustom(true);

      // Add the custom prompt to the database
      await createInitialPrompts([customPrompt.trim()]);

      setCustomPrompt('');
      setShowPromptInput(false);
    } catch (error) {
      console.error('Failed to generate custom image:', error);
    } finally {
      setIsGeneratingCustom(false);
    }
  }, [customPrompt, createInitialPrompts]);

  const handleGenerateImage = useCallback(async (imageId: string) => {
    await generateImage(imageId);
  }, [generateImage]);

  const handleReset = useCallback(async () => {
    await resetFailedImages();
  }, [resetFailedImages]);

  const completedCount = images.filter((img) => img.status === 'completed').length;
  const totalCount = images.length;
  const isGeneratingAny = images.some((img) => img.status === 'generating');

  return {
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
  };
};