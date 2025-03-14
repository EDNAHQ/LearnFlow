
import { useEffect, useState } from "react";
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
  const [questionsGenerated, setQuestionsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Reset state when content or topic changes
  useEffect(() => {
    setQuestionsGenerated(false);
  }, [content, topic]);

  // Generate questions based on the content
  useEffect(() => {
    const generateQuestions = async () => {
      if (!content || !topic || questionsGenerated || isGenerating) {
        return;
      }
      
      setIsGenerating(true);
      console.log(`Generating questions for: ${title} (ID: ${stepId})`);
      
      try {
        const { data, error } = await supabase.functions.invoke('generate-related-questions', {
          body: { content, topic, title }
        });
        
        if (error) {
          console.error("Error generating questions:", error);
          onQuestionsGenerated([]);
          return;
        }
        
        if (data && data.questions && Array.isArray(data.questions)) {
          console.log(`Received ${data.questions.length} questions for: ${title}`);
          onQuestionsGenerated(data.questions);
        } else {
          console.error("Invalid response format from generate-related-questions:", data);
          onQuestionsGenerated([]);
        }
      } catch (error) {
        console.error("Error calling generate-related-questions function:", error);
        onQuestionsGenerated([]);
      } finally {
        setIsGenerating(true);
        setQuestionsGenerated(true);
      }
    };
    
    generateQuestions();
  }, [content, topic, title, stepId, questionsGenerated, isGenerating, onQuestionsGenerated]);

  return null; // This is a non-visual component
};

export default ContentQuestionsGenerator;
