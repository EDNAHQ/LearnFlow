import { useState, useCallback } from 'react';
import { useMentalModelImagesTable } from '@/hooks/content/useMentalModelImagesTable';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useImageGeneration = (pathId: string, topic: string) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);

  const {
    images,
    loading,
    generateImage,
    resetFailedImages,
    createInitialPrompts,
    updateImagePrompt
  } = useMentalModelImagesTable({ pathId });

  const handleGenerateCustomImage = useCallback(async (imageId?: string, prompt?: string) => {
    const finalPrompt = prompt || customPrompt.trim();
    if (!finalPrompt) return;

    try {
      setIsGeneratingCustom(true);

      // If imageId provided, update existing image
      if (imageId) {
        await updateImagePrompt(imageId, finalPrompt);
        await generateImage(imageId);
      } else {
        // Create new image with custom prompt
        const { data, error } = await supabase.functions.invoke('generate-mental-model-images', {
          body: {
            pathId,
            prompts: [finalPrompt]
          },
        });

        if (error) throw error;
      }

      setCustomPrompt('');
      setShowPromptInput(false);
      setCurrentImageId(null);
      toast.success('Image generation started!');
    } catch (error) {
      console.error('Failed to generate image:', error);
      toast.error('Failed to generate image');
      throw error; // Re-throw to handle in modal
    } finally {
      setIsGeneratingCustom(false);
    }
  }, [customPrompt, pathId, generateImage, updateImagePrompt]);

  const handleGenerateImage = useCallback(async (index: number) => {
    console.log('handleGenerateImage called with index:', index);
    const image = images[index];
    console.log('Found image:', image);

    if (!image || image.status === 'generating') {
      console.log('Image not found or already generating, skipping');
      return;
    }

    try {
      console.log('Calling generateImage with id:', image.id);
      await generateImage(image.id);
    } catch (error) {
      console.error('Failed to generate image:', error);
      toast.error('Failed to generate image');
    }
  }, [images, generateImage]);

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
    createInitialPrompts,
    currentImageId,
    setCurrentImageId,
  };
};