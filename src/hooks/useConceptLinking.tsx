
import { useState, useEffect, useRef } from "react";
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
  const contentRef = useRef<string>('');
  const runAttempted = useRef<boolean>(false);

  useEffect(() => {
    // Reset state when content significantly changes
    if (content && contentRef.current && content !== contentRef.current) {
      if (content.substring(0, 50) !== contentRef.current.substring(0, 50)) {
        console.log("Content changed significantly, resetting concept extraction state");
        setHasRun(false);
        runAttempted.current = false;
        setConcepts([]);
        setError(null);
      }
    }
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    const extractConcepts = async () => {
      // Only run if we have meaningful content and topic, and haven't already run
      if (!content || !topic || content.length < 200 || hasRun || runAttempted.current) return;
      
      runAttempted.current = true;
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
          console.log("Concepts extracted successfully:", data.concepts.length);
          setConcepts(data.concepts);
          
          // Debug log each term that should be highlighted
          data.concepts.forEach((concept: Concept) => {
            console.log(`Looking for term in content: "${concept.term}"`);
            if (content.toLowerCase().includes(concept.term.toLowerCase())) {
              console.log(`✓ Found match for "${concept.term}" in content`);
            } else {
              console.log(`✗ No match found for "${concept.term}" in content`);
            }
          });
          
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
    hasResults: concepts.length > 0,
    resetExtraction: () => {
      setHasRun(false);
      runAttempted.current = false;
    }
  };
}
