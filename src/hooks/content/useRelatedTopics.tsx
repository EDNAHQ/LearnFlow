
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EDGE_FUNCTIONS } from '@/integrations/supabase/functions';

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
        if (currentContent) {
          const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.listRelatedTopics, {
            body: {
              content: currentContent,
              title: currentTitle || currentTopic,
              topic: currentTopic
            }
          });

          if (error) {
            throw new Error(error.message);
          }

          if (data && data.topics) {
            setRelatedTopics(data.topics);
          } else {
            throw new Error("Invalid response format from AI service");
          }
        } else {
          const { data, error } = await supabase
            .from('learning_paths')
            .select('id, title, topic')
            .neq('topic', currentTopic)
            .limit(5);

          if (error) throw error;

          if (data) {
            const processed: RelatedTopic[] = data.map(item => ({
              id: item.id,
              title: item.title || 'Untitled',
              description: `Learn more about ${item.topic}`,
              similarity: Math.random() * 0.5 + 0.5
            }));

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
