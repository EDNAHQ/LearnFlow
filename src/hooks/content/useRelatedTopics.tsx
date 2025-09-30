
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
    if (!currentTopic) {
      console.log("🔍 [useRelatedTopics] No topic provided, skipping fetch");
      return;
    }

    const fetchRelatedTopics = async () => {
      console.log("🔍 [useRelatedTopics] Starting fetch:", {
        topic: currentTopic,
        hasContent: !!currentContent,
        contentLength: currentContent?.length,
        title: currentTitle
      });

      setIsLoading(true);
      setError(null);

      try {
        // If we have content, use the AI-powered edge function
        if (currentContent) {
          console.log("🤖 [useRelatedTopics] Calling generate-deep-dive-topics edge function");

          const startTime = Date.now();
          const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.listRelatedTopics, {
            body: {
              content: currentContent,
              title: currentTitle || currentTopic,
              topic: currentTopic
            }
          });
          const elapsed = Date.now() - startTime;

          console.log(`⏱️ [useRelatedTopics] Edge function completed in ${elapsed}ms`, { data, error });

          if (error) {
            console.error("❌ [useRelatedTopics] Edge function error:", error);
            throw new Error(error.message);
          }

          if (data && data.topics) {
            console.log(`✅ [useRelatedTopics] Received ${data.topics.length} topics:`, data.topics);
            setRelatedTopics(data.topics);
          } else {
            console.error("❌ [useRelatedTopics] Invalid response format:", data);
            throw new Error("Invalid response format from AI service");
          }
        } else {
          // Fallback to the original database query method if no content is provided
          console.log("📊 [useRelatedTopics] No content provided, falling back to database query");

          const { data, error } = await supabase
            .from('learning_paths')
            .select('id, title, topic')
            .neq('topic', currentTopic)
            .limit(5);

          if (error) throw error;

          if (data) {
            console.log(`✅ [useRelatedTopics] Database returned ${data.length} paths`);
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
        console.error('❌ [useRelatedTopics] Error fetching related topics:', err);
        setError('Failed to load related topics');
      } finally {
        setIsLoading(false);
        console.log("🏁 [useRelatedTopics] Fetch complete");
      }
    };

    fetchRelatedTopics();
  }, [currentTopic, currentContent, currentTitle]);

  return { relatedTopics, isLoading, error };
}
