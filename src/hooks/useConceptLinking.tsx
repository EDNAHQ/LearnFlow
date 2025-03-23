
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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

  useEffect(() => {
    const extractConcepts = async () => {
      if (!content || !topic || content.length < 100) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Call the edge function to extract concepts
        const { data, error } = await supabase.functions.invoke('extract-key-concepts', {
          body: {
            content,
            topic
          }
        });
        
        if (error) throw new Error(error.message);
        
        if (data && data.concepts) {
          setConcepts(data.concepts);
        }
      } catch (err) {
        console.error("Failed to extract concepts:", err);
        setError("Failed to analyze content for concepts");
      } finally {
        setIsLoading(false);
      }
    };
    
    extractConcepts();
  }, [content, topic]);

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
    findConcept
  };
}
