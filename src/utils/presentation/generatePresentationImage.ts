import { supabase } from '@/integrations/supabase/client';

export interface GenerateImageOptions {
  prompt: string;
  stepId?: string;
  topic?: string;
}

export interface GenerateImageResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export const generatePresentationImage = async (
  options: GenerateImageOptions
): Promise<GenerateImageResult> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-presentation-image', {
      body: {
        prompt: options.prompt,
        stepId: options.stepId,
        topic: options.topic,
      },
    });

    if (error) {
      console.error('Error calling image generation function:', error);

      // Check for common configuration issues
      if (error.message?.includes('500') || error.message?.includes('Internal')) {
        console.error('⚠️ Image generation failed - likely missing REPLICATE_API_TOKEN in Supabase Edge Function secrets');
      }

      return {
        success: false,
        error: error.message || 'Failed to generate image',
      };
    }

    if (!data || !data.imageUrl) {
      return {
        success: false,
        error: 'No image URL returned from generation',
      };
    }

    return {
      success: true,
      imageUrl: data.imageUrl,
    };
  } catch (error) {
    console.error('Exception in generatePresentationImage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};