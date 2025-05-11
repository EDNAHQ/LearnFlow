
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Book, ArrowRight } from "lucide-react";
import { RelatedTopic } from "@/hooks/useRelatedTopics";

interface DeepDiveTopicCardProps {
  topic: RelatedTopic;
  formatSimilarity: (score: number) => string;
  onClick: () => void;
}

const DeepDiveTopicCard: React.FC<DeepDiveTopicCardProps> = ({
  topic,
  formatSimilarity,
  onClick
}) => {
  return (
    <div 
      className="bg-white hover:bg-gray-50 rounded-lg p-3 cursor-pointer border border-gray-100"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0">
          <Book className="h-5 w-5 text-brand-purple" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-800">{topic.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2">{topic.description}</p>
          <div className="flex items-center mt-1.5 gap-2">
            <Badge variant="outline" className="text-xs bg-brand-purple/10 text-brand-purple border-brand-purple/20">
              {formatSimilarity(topic.similarity)} match
            </Badge>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
};

export default DeepDiveTopicCard;
