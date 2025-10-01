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

export interface ImagesModeDisplayProps {
  stepId: string;
  title: string;
  topic: string;
  pathId: string;
}