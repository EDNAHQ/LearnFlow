
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Concept {
  id: string;
  term: string;
  definition: string;
  relatedConcepts?: string[];
}

export function useConceptLinking(content: string, topic: string | undefined) {
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState<boolean>(false);

  useEffect(() => {
    const extractConcepts = async () => {
      // Only run if we have meaningful content and topic, and haven't already run
      if (!content || !topic || content.length < 100 || hasRun) return;
      
      setIsLoading(true);
      setError(null);
      console.log("Starting concept extraction for:", topic);
      
      try {
        // Call the edge function to extract concepts
        const { data, error } = await supabase.functions.invoke('extract-key-concepts', {
          body: {
            content,
            topic
          }
        });
        
        if (error) throw new Error(error.message);
        
        if (data && data.concepts && data.concepts.length > 0) {
          console.log("Concepts extracted successfully:", data.concepts);
          setConcepts(data.concepts);
        } else {
          console.log("No concepts found in the content");
          setConcepts([]);
        }
        
        // Mark as run to prevent multiple extractions
        setHasRun(true);
      } catch (err) {
        console.error("Failed to extract concepts:", err);
        setError("Failed to analyze content for concepts");
        toast.error("Couldn't analyze content for concepts");
      } finally {
        setIsLoading(false);
      }
    };
    
    extractConcepts();
  }, [content, topic, hasRun]);

  // Find a concept by term
  const findConcept = (term: string): Concept | undefined => {
    return concepts.find(concept => 
      concept.term.toLowerCase() === term.toLowerCase() ||
      concept.term.toLowerCase().includes(term.toLowerCase()) ||
      term.toLowerCase().includes(concept.term.toLowerCase())
    );
  };

  return {
    concepts,
    isLoading,
    error,
    findConcept,
    hasResults: concepts.length > 0
  };
}
