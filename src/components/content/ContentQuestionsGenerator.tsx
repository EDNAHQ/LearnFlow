
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContentQuestionsGeneratorProps {
  content: string;
  topic?: string;
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Generate fallback questions if the API fails
  const generateFallbackQuestions = () => {
    console.log("Generating fallback questions for:", title);
    
    // Create generic questions related to the topic
    const fallbackQuestions = [
      `What are the key concepts of ${topic || title}?`,
      `How does ${title} relate to real-world applications?`,
      `What are common misconceptions about ${title}?`,
      `How has our understanding of ${topic || title} evolved over time?`,
      `What future developments might we see in ${topic || title}?`
    ];
    
    onQuestionsGenerated(fallbackQuestions);
  };
  
  useEffect(() => {
    const generateQuestions = async () => {
      if (!content || !topic || isGenerating) return;
      
      setIsGenerating(true);
      console.log(`Generating questions for: ${title} (ID: ${stepId})`);
      
      try {
        const response = await supabase.functions.invoke('generate-learning-content', {
          body: {
            content: content.substring(0, 4000), // Limit content length
            topic,
            title,
            generateQuestions: true
          }
        });
        
        if (response.error) {
          console.error("Error generating questions:", response.error);
          
          // Use fallback questions after 1 retry
          if (retryCount > 0) {
            generateFallbackQuestions();
          } else {
            // Retry once
            setRetryCount(prev => prev + 1);
            setIsGenerating(false);
          }
          return;
        }
        
        const data = response.data;
        
        if (!data || !data.questions || !Array.isArray(data.questions)) {
          console.error("Invalid response format for questions:", data);
          generateFallbackQuestions();
          return;
        }
        
        console.log(`Generated ${data.questions.length} questions for: ${title}`);
        onQuestionsGenerated(data.questions);
      } catch (error) {
        console.error("Error generating questions:", error);
        generateFallbackQuestions();
      } finally {
        setIsGenerating(false);
      }
    };
    
    // Reset state when content changes
    setIsGenerating(false);
    setRetryCount(0);
    
    // Small delay to prevent too many requests at once
    const timer = setTimeout(() => {
      generateQuestions();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [content, topic, title, stepId, onQuestionsGenerated, retryCount]);
  
  // This is a "headless" component that doesn't render UI
  return null;
};

export default ContentQuestionsGenerator;
