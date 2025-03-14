
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
  // Split content into paragraphs (more robust)
  const paragraphs = content
    .split(/\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 80 && !p.startsWith('#') && !p.startsWith('-') && !p.startsWith('*'))  // Only substantial paragraphs, no headings/lists
    .slice(0, 10);  // Consider up to 10 paragraphs for analysis
  
  if (paragraphs.length === 0) {
    console.log("No suitable paragraphs found for insights");
    return [];
  }
  
  // Select 2-3 paragraphs evenly distributed through the content
  let selectedParagraphs = [];
  
  if (paragraphs.length <= 3) {
    selectedParagraphs = paragraphs;
  } else {
    // Get paragraphs from beginning, middle, and end to ensure good distribution
    selectedParagraphs = [
      paragraphs[0], // First paragraph
      paragraphs[Math.floor(paragraphs.length / 2)], // Middle paragraph
      paragraphs[paragraphs.length - 1] // Last paragraph
    ];
  }
  
  console.log(`Selected ${selectedParagraphs.length} paragraphs for insights from ${paragraphs.length} total`);
  
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
