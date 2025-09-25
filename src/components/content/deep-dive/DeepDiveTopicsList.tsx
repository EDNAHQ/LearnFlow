
import React from "react";
import { Button } from "@/components/ui/button";
import DeepDiveTopicCard from "./DeepDiveTopicCard";
import { RelatedTopic } from "@/hooks/content";

interface DeepDiveTopicsListProps {
  isLoading: boolean;
  error: string | null;
  filteredTopics: RelatedTopic[];
  searchQuery: string;
  formatSimilarity: (score: number) => string;
  onTopicClick: (id: string, title: string) => void;
}

const DeepDiveTopicsList: React.FC<DeepDiveTopicsListProps> = ({
  isLoading,
  error,
  filteredTopics,
  searchQuery,
  formatSimilarity,
  onTopicClick
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-5 w-5 border-2 border-brand-purple border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Failed to load related topics</p>
        <Button 
          variant="link" 
          onClick={() => window.location.reload()}
          className="text-brand-purple mt-2"
        >
          Try again
        </Button>
      </div>
    );
  }

  if (filteredTopics.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {searchQuery ? "No matching topics found" : "No related topics available"}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filteredTopics.map((relatedTopic) => (
        <DeepDiveTopicCard
          key={relatedTopic.id}
          topic={relatedTopic}
          formatSimilarity={formatSimilarity}
          onClick={() => onTopicClick(relatedTopic.id, relatedTopic.title)}
        />
      ))}
    </div>
  );
};

export default DeepDiveTopicsList;
