
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ContentQuestionsGeneratorProps {
  content: string;
  topic: string | undefined;
  title: string;
  stepId: string;
  onQuestionsGenerated: (questions: string[]) => void;
}

const ContentQuestionsGenerator = ({ 
  content, 
  topic, 
  title, 
  stepId, 
  onQuestionsGenerated 
}: ContentQuestionsGeneratorProps) => {
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsGenerated, setQuestionsGenerated] = useState(false);

  // Generate related questions once content is loaded
  const generateRelatedQuestions = useCallback(async () => {
    if (!content || !topic || questionsGenerated || loadingQuestions) {
      return;
    }
    
    setLoadingQuestions(true);
    try {
      console.log(`Generating questions for: ${title} (ID: ${stepId})`);
      
      const response = await supabase.functions.invoke('generate-learning-content', {
        body: {
          content: content,
          topic,
          title,
          generateQuestions: true
        }
      });
      
      if (response.data?.questions && Array.isArray(response.data.questions)) {
        console.log(`Received ${response.data.questions.length} questions for: ${title}`);
        onQuestionsGenerated(response.data.questions);
      }
    } catch (error) {
      console.error("Error generating related questions:", error);
      onQuestionsGenerated([]);
    } finally {
      setLoadingQuestions(false);
      setQuestionsGenerated(true);
    }
  }, [content, topic, title, stepId, questionsGenerated, loadingQuestions, onQuestionsGenerated]);

  // Trigger question generation once content is loaded
  useEffect(() => {
    if (content && topic) {
      if (!questionsGenerated && !loadingQuestions) {
        generateRelatedQuestions();
      }
    }
  }, [content, topic, questionsGenerated, loadingQuestions, generateRelatedQuestions]);

  return (
    <div style={{ display: 'none' }}>
      {loadingQuestions && <span>Loading questions...</span>}
    </div>
  );
};

export default ContentQuestionsGenerator;
