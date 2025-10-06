import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MentalModelImage {
  id: string;
  path_id: string;
  prompt: string;
  image_url: string | null;
  status: 'not_generated' | 'generating' | 'completed' | 'failed';
  error: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
  generated_at: string | null;
}

interface UseMentalModelImagesTableProps {
  pathId: string;
}

export const useMentalModelImagesTable = ({ pathId }: UseMentalModelImagesTableProps) => {
  const [images, setImages] = useState<MentalModelImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch images from database
  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mental_model_images')
        .select('*')
        .eq('path_id', pathId)
        .order('display_order', { ascending: true });

      if (error) throw error;

      console.log('Fetched mental model images from table:', data);
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching mental model images:', error);
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  }, [pathId]);

  // Subscribe to real-time updates
  useEffect(() => {
    fetchImages();

    const channel = supabase
      .channel(`mental-model-images-${pathId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mental_model_images',
          filter: `path_id=eq.${pathId}`,
        },
        (payload) => {
          console.log('Mental model image change:', payload);

          if (payload.eventType === 'INSERT') {
            setImages(prev => [...prev, payload.new as MentalModelImage].sort((a, b) => a.display_order - b.display_order));
          } else if (payload.eventType === 'UPDATE') {
            setImages(prev => prev.map(img =>
              img.id === payload.new.id ? payload.new as MentalModelImage : img
            ));
          } else if (payload.eventType === 'DELETE') {
            setImages(prev => prev.filter(img => img.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pathId, fetchImages]);

  // Update image status
  const updateImageStatus = async (imageId: string, status: MentalModelImage['status'], error?: string) => {
    try {
      const updateData: any = { status, updated_at: new Date().toISOString() };
      if (error) updateData.error = error;
      if (status === 'completed') updateData.generated_at = new Date().toISOString();

      const { error: updateError } = await supabase
        .from('mental_model_images')
        .update(updateData)
        .eq('id', imageId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error updating image status:', error);
      throw error;
    }
  };

  // Generate single image
  const generateImage = async (imageId: string) => {
    console.log('generateImage called with imageId:', imageId);
    const image = images.find(img => img.id === imageId);
    console.log('Found image in generateImage:', image);

    if (!image) {
      console.error('Image not found for id:', imageId);
      return;
    }

    try {
      console.log('Updating status to generating for imageId:', imageId);
      // Optimistically update local state so UI reflects progress immediately
      setImages(prev => prev.map(img => img.id === imageId ? { ...img, status: 'generating', error: null, updated_at: new Date().toISOString() } : img));
      // Persist status to DB
      await updateImageStatus(imageId, 'generating');

      console.log('Calling edge function for imageId:', imageId);
      // Call edge function
      const { data, error } = await supabase.functions.invoke('generate-mental-model-images', {
        body: {
          imageIds: [imageId],
          pathId,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Edge function response:', data);
      toast.success('Image generation started!');

      // Poll as a fallback in case realtime misses events; stop when completed/failed
      const startTime = Date.now();
      const POLL_INTERVAL_MS = 3000;
      const TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes
      const interval = setInterval(async () => {
        try {
          const { data: refreshed, error: fetchError } = await supabase
            .from('mental_model_images')
            .select('*')
            .eq('id', imageId)
            .single();
          if (fetchError) throw fetchError;

          if (refreshed) {
            setImages(prev => prev.map(img => img.id === imageId ? refreshed as MentalModelImage : img));
            if (refreshed.status === 'completed' || refreshed.status === 'failed') {
              clearInterval(interval);
            }
          }

          if (Date.now() - startTime > TIMEOUT_MS) {
            clearInterval(interval);
          }
        } catch (e) {
          console.error('Polling error for image generation:', e);
        }
      }, POLL_INTERVAL_MS);
    } catch (error) {
      console.error('Error generating image:', error);
      // Reflect failure both locally and in DB
      setImages(prev => prev.map(img => img.id === imageId ? { ...img, status: 'failed', error: error instanceof Error ? error.message : 'Generation failed' } : img));
      await updateImageStatus(imageId, 'failed', error instanceof Error ? error.message : 'Generation failed');
      toast.error('Failed to generate image');
    }
  };

  // Reset failed images
  const resetFailedImages = async () => {
    try {
      const failedImages = images.filter(img => img.status === 'failed' || img.status === 'generating');

      if (failedImages.length === 0) return;

      const { error } = await supabase
        .from('mental_model_images')
        .update({
          status: 'not_generated',
          error: null,
          updated_at: new Date().toISOString()
        })
        .in('id', failedImages.map(img => img.id));

      if (error) throw error;

      toast.success('Reset failed images');
      await fetchImages();
    } catch (error) {
      console.error('Error resetting images:', error);
      toast.error('Failed to reset images');
    }
  };

  // Create initial prompts if none exist
  const createInitialPrompts = async (prompts: string[]) => {
    try {
      const imagesToCreate = prompts.map((prompt, index) => ({
        path_id: pathId,
        prompt,
        status: 'not_generated',
        display_order: index,
      }));

      const { error } = await supabase
        .from('mental_model_images')
        .insert(imagesToCreate);

      if (error) throw error;

      toast.success('Mental model prompts created');
      await fetchImages();
    } catch (error) {
      console.error('Error creating prompts:', error);
      toast.error('Failed to create prompts');
    }
  };

  return {
    images,
    loading,
    fetchImages,
    generateImage,
    resetFailedImages,
    createInitialPrompts,
    updateImageStatus,
  };
};