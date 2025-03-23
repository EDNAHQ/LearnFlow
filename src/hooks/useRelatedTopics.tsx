
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RelatedTopic {
  id: string;
  title: string;
  description: string;
  similarity: number;
}

export function useRelatedTopics(currentTopic: string | null, limit: number = 5) {
  const [relatedTopics, setRelatedTopics] = useState<RelatedTopic[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentTopic) return;
    
    const fetchRelatedTopics = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // For now, we'll simulate this with a basic algorithm
        // In production, you'd want to use a more sophisticated similarity search
        
        // Simulated API call
        const { data, error } = await supabase
          .from('learning_paths')
          .select('id, title, topic')
          .neq('topic', currentTopic)
          .limit(limit);
          
        if (error) throw error;
        
        if (data) {
          // Process the data to create related topics with similarity scores
          const processed: RelatedTopic[] = data.map(item => ({
            id: item.id,
            title: item.title || 'Untitled',
            description: `Learn more about ${item.topic}`,
            // Simulate relevance score - in a real app, this would be calculated based on actual content similarity
            similarity: Math.random() * 0.5 + 0.5 // Random score between 0.5 and 1.0
          }));
          
          // Sort by simulated similarity
          processed.sort((a, b) => b.similarity - a.similarity);
          
          setRelatedTopics(processed);
        }
      } catch (err) {
        console.error('Error fetching related topics:', err);
        setError('Failed to load related topics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedTopics();
  }, [currentTopic, limit]);

  return { relatedTopics, isLoading, error };
}
