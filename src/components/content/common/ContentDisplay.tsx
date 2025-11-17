import React from "react";
import IntegratedContentDisplay from "./IntegratedContentDisplay";

interface ContentDisplayProps {
  content?: string;
  index?: number;
  detailedContent?: string | null;
  pathId?: string;
  topic?: string;
  title?: string;
  stepId?: string;
  onQuestionClick?: (question: string, content?: string) => void;
}

interface LearningStep {
  id: string;
  title: string;
  content: string;
  completed: boolean;
  detailed_content?: string | null;
  order_index?: number;
}

const ContentDisplay: React.FC<ContentDisplayProps> = ({
  content,
  index = 0,
  detailedContent,
  pathId,
  topic,
  title,
  stepId,
  onQuestionClick
}) => {
  return (
    <IntegratedContentDisplay
      content={content}
      index={index}
      detailedContent={detailedContent}
      pathId={pathId}
      topic={topic}
      title={title}
      stepId={stepId}
      onQuestionClick={onQuestionClick}
    />
  );
};

export default ContentDisplay;


