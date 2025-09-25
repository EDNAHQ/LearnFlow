
import { useState, useCallback, useRef } from "react";
import ContentRelatedQuestions from "../common/ContentRelatedQuestions";
import ContentQuestionsGenerator from "./ContentQuestionsGenerator";

interface ContentQuestionsSectionProps {
  loadedDetailedContent: string;
  topic?: string;
  title?: string;
  stepId?: string;
  onQuestionClick?: (question: string) => void;
}

const ContentQuestionsSection = ({ 
  loadedDetailedContent,
  topic,
  title = "",
  stepId = "",
  onQuestionClick = () => {}
}: ContentQuestionsSectionProps) => {
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  
  // Track if questions have been generated to prevent regeneration
  const questionsGenerated = useRef(false);
  
  // Handle related questions
  const handleQuestionsGenerated = useCallback((questions: string[]) => {
    if (!questionsGenerated.current) {
      setRelatedQuestions(questions);
      setLoadingQuestions(false);
      questionsGenerated.current = true;
    }
  }, []);
  
  return (
    <>
      {/* Questions Generator - Generates questions based on content */}
      {!questionsGenerated.current && (
        <ContentQuestionsGenerator 
          content={loadedDetailedContent}
          topic={topic}
          title={title}
          stepId={stepId}
          onQuestionsGenerated={handleQuestionsGenerated}
        />
      )}
      
      {/* Display related questions */}
      <ContentRelatedQuestions 
        questions={relatedQuestions}
        isLoading={loadingQuestions}
        onQuestionClick={onQuestionClick}
      />
    </>
  );
};

export default ContentQuestionsSection;
