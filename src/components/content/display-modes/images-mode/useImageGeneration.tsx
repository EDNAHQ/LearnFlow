import { useState, useCallback } from 'react';
import { useMentalModelImagesTable } from '@/hooks/content/useMentalModelImagesTable';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useImageGeneration = (pathId: string, topic: string) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);

  const {
    images,
    loading,
    generateImage,
    resetFailedImages,
    createInitialPrompts
  } = useMentalModelImagesTable({ pathId });

  const handleGenerateCustomImage = useCallback(async () => {
    if (!customPrompt.trim()) return;

    try {
      setIsGeneratingCustom(true);

      // Call edge function with custom prompt
      const { data, error } = await supabase.functions.invoke('generate-mental-model-images', {
        body: {
          pathId,
          prompts: [customPrompt.trim()]
        },
      });

      if (error) throw error;

      setCustomPrompt('');
      setShowPromptInput(false);
      toast.success('Custom image generation started!');
    } catch (error) {
      console.error('Failed to generate custom image:', error);
      toast.error('Failed to generate custom image');
    } finally {
      setIsGeneratingCustom(false);
    }
  }, [customPrompt, pathId]);

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
  };
};