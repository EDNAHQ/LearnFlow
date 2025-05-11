
import { useState } from "react";
import { useRelatedTopics } from "@/hooks/useRelatedTopics";
import { supabase } from "@/integrations/supabase/client";

export interface TopicDetails {
  id: string;
  title: string;
}

export function useDeepDiveTopics(topic: string | null, content?: string | null, title?: string | null) {
  const { relatedTopics, isLoading, error } = useRelatedTopics(topic, content, title);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<TopicDetails | null>(null);
  const [deepDiveContent, setDeepDiveContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filter topics based on search query
  const filteredTopics = searchQuery
    ? relatedTopics.filter(topic => 
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : relatedTopics;

  // Format similarity score as percentage
  const formatSimilarity = (score: number) => {
    return `${Math.round(score * 100)}%`;
  };

  const generateDeepDiveContent = async (topicId: string, topicTitle: string) => {
    setSelectedTopic({ id: topicId, title: topicTitle });
    setIsGenerating(true);
    setDialogOpen(true);
    setDeepDiveContent(null);
    
    try {
      const selectedTopicDetails = relatedTopics.find(t => t.id === topicId);
      
      if (!selectedTopicDetails) {
        throw new Error("Topic details not found");
      }
      
      console.log(`Generating deep dive content for "${topicTitle}"...`);
      
      const { data, error } = await supabase.functions.invoke('generate-deep-dive-content', {
        body: {
          topic: topic,
          title: topicTitle,
          originalContent: content
        }
      });
      
      if (error) throw error;
      
      if (data && data.content) {
        setDeepDiveContent(data.content);
      } else {
        throw new Error("Invalid response format from AI service");
      }
    } catch (err) {
      console.error('Error generating deep dive content:', err);
      setDeepDiveContent(`# Error Generating Content\n\nWe couldn't generate deep dive content for "${topicTitle}" at this time. Please try again later.`);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    relatedTopics,
    filteredTopics,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    selectedTopic,
    deepDiveContent,
    isGenerating,
    dialogOpen,
    setDialogOpen,
    formatSimilarity,
    generateDeepDiveContent
  };
}
