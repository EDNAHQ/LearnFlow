import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useContentMode } from "@/hooks/useContentMode";
import TextModeDisplay from "../TextModeDisplay";
import SlideModeDisplay from "../SlideModeDisplay";
import AudioModeDisplay from "../AudioModeDisplay";
import { generateStepContent } from "@/utils/learning/generateStepContent";

interface ContentDisplayProps {
  content?: string;
  index?: number;
  detailedContent?: string | null;
  pathId?: string;
  topic?: string;
  title?: string;
  stepId?: string;
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
  stepId
}) => {
  const { mode } = useContentMode();
  const [enhancing, setEnhancing] = useState<boolean>(false);

  // Per-step generation on first view: if no detailed_content, generate in-place
  useEffect(() => {
    const maybeGenerate = async () => {
      if (!stepId || !pathId || !topic) return;
      if (detailedContent) return;
      try {
        setEnhancing(true);
        await generateStepContent({ id: stepId, title: title || "", description: content || "" }, topic, true);
      } catch (e) {
        console.error("Per-step generation failed:", e);
      } finally {
        setEnhancing(false);
      }
    };
    maybeGenerate();
  }, [stepId, detailedContent, pathId, topic, title, content]);

  // Handle question clicks for insights
  const handleQuestionClick = (question: string) => {
    console.log("Dispatching question event from ContentDisplay:", question);
    
    // Create a custom event to communicate with ContentInsightsManager
    const event = new CustomEvent("ai:insight-request", {
      detail: { question, topic }
    });
    
    // Dispatch the event so ContentInsightsManager can catch it
    window.dispatchEvent(event);
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
        
        {mode === "podcast" && (
          <AudioModeDisplay 
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


