import React from "react";
import { useContentMode } from "@/hooks/content";
import TextModeDisplay from "../display-modes/TextModeDisplay";
import SlideModeDisplay from "../display-modes/SlideModeDisplay";
import ImagesModeDisplay from "../display-modes/ImagesModeDisplay";
import AudioModeDisplay from "../display-modes/AudioModeDisplay";
import ChatModeDisplay from "../display-modes/ChatModeDisplay";

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
  const { mode } = useContentMode();

  // Handle question clicks - pass to parent with content
  const handleQuestionClick = (question: string) => {
    console.log("Question clicked from ContentDisplay:", question);
    if (onQuestionClick) {
      onQuestionClick(question, detailedContent || content);
    }
  };

  if (!content && !title && !stepId) {
    return <div>No content available.</div>;
  }

  const displayContent = content || '';
  const displayTitle = title || '';
  const displayStepId = stepId || '';

  return (
    <div className="w-full">
      <div className="pb-8">
        {mode === "text" && (
          <TextModeDisplay
            content={detailedContent || displayContent}
            title={displayTitle}
            index={index}
            detailedContent={detailedContent}
            pathId={pathId}
            topic={topic}
            onQuestionClick={handleQuestionClick}
          />
        )}
        
        {mode === "slides" && (
          <SlideModeDisplay
            content={detailedContent || displayContent}
            title={displayTitle}
            detailedContent={detailedContent}
            pathId={pathId}
            topic={topic}
            onQuestionClick={handleQuestionClick}
          />
        )}

        {mode === "images" && (
          <ImagesModeDisplay
            stepId={displayStepId}
            title={displayTitle}
            topic={topic || ''}
            pathId={pathId || ''}
          />
        )}

        {mode === "podcast" && (
          <AudioModeDisplay
            content={detailedContent || displayContent}
            title={displayTitle}
            pathId={pathId || ''}
            stepId={displayStepId}
            topic={topic || ''}
          />
        )}

        {mode === "chat" && (
          <ChatModeDisplay
            content={detailedContent || displayContent}
            title={displayTitle}
            pathId={pathId || ''}
            stepId={displayStepId}
            topic={topic || ''}
          />
        )}
      </div>
    </div>
  );
};

export default ContentDisplay;


