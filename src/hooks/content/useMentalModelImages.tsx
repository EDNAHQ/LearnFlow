import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EDGE_FUNCTIONS } from '@/integrations/supabase/functions';
import { toast } from 'sonner';

interface GenerateImageParams {
  pathId: string;
  prompt: string;
}

interface GeneratePathImagesParams {
  pathId: string;
  topic: string;
}

export const useMentalModelImages = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSingleImage = async ({ pathId, prompt }: GenerateImageParams) => {
    try {
      setIsGenerating(true);

      const { data, error } = await supabase.functions.invoke(
        EDGE_FUNCTIONS.generateMentalModelImages,
        {
          body: {
            pathId,
            prompts: [prompt],
          },
        }
      );

      if (error) throw error;

      toast.success('Image generation started!', {
        description: 'Your mental model image is being created. It will appear here shortly.',
      });

      return data;
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate image', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePathImages = async ({ pathId, topic }: GeneratePathImagesParams) => {
    try {
      setIsGenerating(true);

      const { data, error } = await supabase.functions.invoke(
        EDGE_FUNCTIONS.generatePathMentalModels,
        {
          body: {
            pathId,
            topic,
          },
        }
      );

      if (error) throw error;

      toast.success('Path images generation started!', {
        description: 'Multiple mental model images are being created for this learning path.',
      });

      return data;
    } catch (error) {
      console.error('Error generating path images:', error);
      toast.error('Failed to generate path images', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateSingleImage,
    generatePathImages,
    isGenerating,
  };
};
