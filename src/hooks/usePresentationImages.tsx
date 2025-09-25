import { useState, useEffect } from 'react';
import type { SlideContent } from '@/components/presentation/PresentationView';
import { generatePresentationImage } from '@/utils/presentation/generatePresentationImage';
import { generateImagePrompt, shouldGenerateImage } from '@/utils/presentation/imagePromptGenerator';

export const usePresentationImages = (
  slides: SlideContent[],
  topic?: string,
  enabled: boolean = false
) => {
  const [loadingImages, setLoadingImages] = useState<{ [key: number]: boolean }>({});
  const [enrichedSlides, setEnrichedSlides] = useState<SlideContent[]>(slides);

  useEffect(() => {
    if (!enabled || slides.length === 0) {
      setEnrichedSlides(slides);
      return;
    }

    const enrichSlidesWithImages = async () => {
      const newSlides = [...slides];
      const imagePromises: Promise<void>[] = [];

      slides.forEach((slide, index) => {
        // Skip if already has image or is code
        if (slide.imageUrl || slide.type === 'code') {
          return;
        }

        // Determine if this slide should have an image
        if (!shouldGenerateImage(index, slides.length, slide.content)) {
          return;
        }

        // Generate prompt for this slide
        const { prompt, shouldGenerate, type } = generateImagePrompt(
          slide.content,
          topic,
          index,
          slides.length
        );

        if (!shouldGenerate) return;

        // Set loading state
        setLoadingImages(prev => ({ ...prev, [index]: true }));

        // Create promise for image generation
        const imagePromise = generatePresentationImage({
          prompt,
          topic,
        }).then((result) => {
          if (result.success && result.imageUrl) {
            newSlides[index] = {
              ...slide,
              imageUrl: result.imageUrl,
              imageType: type,
            };
            setEnrichedSlides([...newSlides]);
          }
          setLoadingImages(prev => ({ ...prev, [index]: false }));
        }).catch((error) => {
          console.error(`Failed to generate image for slide ${index}:`, error);
          setLoadingImages(prev => ({ ...prev, [index]: false }));
        });

        imagePromises.push(imagePromise);
      });

      // Wait for all images (or at least start the process)
      await Promise.allSettled(imagePromises);
    };

    enrichSlidesWithImages();
  }, [slides, topic, enabled]);

  return {
    slides: enrichedSlides,
    loadingImages,
    isLoading: Object.values(loadingImages).some(Boolean),
  };
};