
import { supabase } from "@/integrations/supabase/client";

export interface MarginNote {
  id: string;
  paragraph: string;
  insight: string;
}

/**
 * Generates margin notes for the given content
 * @param content The detailed content to analyze
 * @param topic The learning topic
 * @returns An array of margin notes with insights
 */
export const generateMarginNotes = async (
  content: string,
  topic: string
): Promise<MarginNote[]> => {
  // Split content into paragraphs
  const paragraphs = content
    .split("\n\n")
    .filter(p => p.trim().length > 100)  // Only consider substantial paragraphs
    .slice(0, 5);  // Limit to 5 paragraphs for analysis
  
  if (paragraphs.length === 0) {
    return [];
  }
  
  // Select 2-3 paragraphs to generate insights for
  const selectedParagraphs = paragraphs.length <= 3 
    ? paragraphs 
    : paragraphs
        .sort(() => 0.5 - Math.random())  // Shuffle
        .slice(0, Math.min(3, Math.ceil(paragraphs.length / 2)));  // Take 2-3
  
  try {
    const response = await supabase.functions.invoke('generate-margin-notes', {
      body: {
        paragraphs: selectedParagraphs,
        topic
      }
    });
    
    if (response.error) {
      console.error("Error generating margin notes:", response.error);
      return [];
    }
    
    return response.data.marginNotes || [];
  } catch (error) {
    console.error("Error calling generate-margin-notes function:", error);
    return [];
  }
};
