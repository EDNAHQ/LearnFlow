
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface NuggetsFetcherProps {
  topic: string | null;
  onNuggetsLoaded: (nuggets: string[]) => void;
  onError: (error: string) => void;
}

const NuggetsFetcher: React.FC<NuggetsFetcherProps> = ({ 
  topic, 
  onNuggetsLoaded, 
  onError 
}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNuggets = async () => {
      if (!topic) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase.functions.invoke('generate-knowledge-nuggets', {
          body: { topic },
        });

        if (error) throw new Error(error.message);
        
        if (data && data.nuggets && data.nuggets.length > 0) {
          onNuggetsLoaded(data.nuggets);
        } else {
          // Fallback nuggets if the API doesn't return any - made longer
          onNuggetsLoaded([
            `Hooks let components "hook into" React's lifecycle and state without classes. This enables more functional programming approaches and encourages composition over inheritance.`,
            `Custom hooks enable sharing stateful logic between components without duplication. They follow the principle of "write once, use everywhere" and can abstract complex state management patterns.`,
            `React's useState hook is implemented using a linked list data structure internally. This implementation detail allows hooks to maintain their order between renders, which is crucial for their reliability.`,
            `The dependency array in useEffect works similarly to a manual memoization technique. It prevents unnecessary re-execution of side effects by checking referential equality of dependencies between renders.`,
            `React's rules of hooks prevent conditional hook execution for internal consistency. Breaking these rules can lead to bugs that are difficult to track down as the internal hook state management relies on consistent execution order.`
          ]);
        }
      } catch (err) {
        console.error('Error fetching nuggets:', err);
        onError('Failed to load knowledge nuggets');
        // Set fallback nuggets - made longer
        onNuggetsLoaded([
          `Hooks let components "hook into" React's lifecycle and state without classes. This enables more functional programming approaches and encourages composition over inheritance.`,
          `Custom hooks enable sharing stateful logic between components without duplication. They follow the principle of "write once, use everywhere" and can abstract complex state management patterns.`,
          `React's useState hook is implemented using a linked list data structure internally. This implementation detail allows hooks to maintain their order between renders, which is crucial for their reliability.`,
          `The dependency array in useEffect works similarly to a manual memoization technique. It prevents unnecessary re-execution of side effects by checking referential equality of dependencies between renders.`,
          `React's rules of hooks prevent conditional hook execution for internal consistency. Breaking these rules can lead to bugs that are difficult to track down as the internal hook state management relies on consistent execution order.`
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNuggets();
  }, [topic, onNuggetsLoaded, onError]);

  return null; // This is a non-visual component
};

export default NuggetsFetcher;
