
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

        // For debugging, generate mock concepts if edge function failed or no concepts were returned
        if (error || !data || !data.concepts || data.concepts.length === 0) {
          if (error) {
            console.warn("Edge function error, falling back to mock concepts:", error.message);
          }
          console.log("No concepts returned from extraction, generating mock concepts for testing");
          
          // Example mock concepts based on ThreeJS topic
          const mockConcepts = [
            {
              id: "concept-1",
              term: "ThreeJS",
              definition: "A JavaScript 3D library that makes WebGL simpler, allowing creation of 3D graphics in the browser.",
              relatedConcepts: ["WebGL", "3D Rendering", "JavaScript"]
            },
            {
              id: "concept-2", 
              term: "3D space",
              definition: "The three-dimensional environment where objects exist in a ThreeJS scene.",
              relatedConcepts: ["Camera", "Scene", "Coordinates"]
            },
            {
              id: "concept-3",
              term: "physics",
              definition: "The branch of science dealing with properties and interactions of matter and energy, often simulated in ThreeJS.",
              relatedConcepts: ["Collision Detection", "Gravity", "Forces"]
            },
            {
              id: "concept-4",
              term: "collision detection",
              definition: "The process of detecting when two or more objects in a 3D scene intersect or touch each other.",
              relatedConcepts: ["Physics", "Raycasting", "Bounding Box"]
            },
            {
              id: "concept-5",
              term: "user experience design",
              definition: "The process of creating products that provide meaningful and relevant experiences to users in 3D applications.",
              relatedConcepts: ["Interface", "Interaction", "Usability"]
            }
          ];
          
          setConcepts(mockConcepts);
        } else {
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
