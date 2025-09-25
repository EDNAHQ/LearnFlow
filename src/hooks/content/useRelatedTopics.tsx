
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RelatedTopic {
  id: string;
  title: string;
  description: string;
  similarity: number;
}

export function useRelatedTopics(currentTopic: string | null, currentContent?: string | null, currentTitle?: string | null) {
  const [relatedTopics, setRelatedTopics] = useState<RelatedTopic[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentTopic) return;
    
    const fetchRelatedTopics = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // If we have content, use the AI-powered edge function
        if (currentContent) {
          console.log("Fetching AI-generated related topics");
          
          const { data, error } = await supabase.functions.invoke('generate-deep-dive-topics', {
            body: {
              content: currentContent,
              title: currentTitle || currentTopic,
              topic: currentTopic
            }
          });
          
          if (error) throw new Error(error.message);
          
          if (data && data.topics) {
            setRelatedTopics(data.topics);
          } else {
            throw new Error("Invalid response format from AI service");
          }
        } else {
          // Fallback to the original database query method if no content is provided
          console.log("Falling back to database query for related topics");
          
          const { data, error } = await supabase
            .from('learning_paths')
            .select('id, title, topic')
            .neq('topic', currentTopic)
            .limit(5);
            
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
        }
      } catch (err) {
        console.error('Error fetching related topics:', err);
        setError('Failed to load related topics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedTopics();
  }, [currentTopic, currentContent, currentTitle]);

  return { relatedTopics, isLoading, error };
}
