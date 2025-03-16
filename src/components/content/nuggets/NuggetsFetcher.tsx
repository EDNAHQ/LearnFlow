
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
          // Fallback nuggets if the API doesn't return any
          onNuggetsLoaded([
            `Hooks let components "hook into" React's lifecycle and state without classes.`,
            `Custom hooks enable sharing stateful logic between components without duplication.`,
            `React's useState hook is implemented using a linked list data structure internally.`,
            `The dependency array in useEffect works similarly to a manual memoization technique.`,
            `React's rules of hooks prevent conditional hook execution for internal consistency.`,
            `The useReducer hook is inspired by Redux's state management pattern.`,
            `Hooks can reduce bundle size by enabling more efficient tree-shaking in builds.`,
            `The Context API combined with hooks offers an alternative to prop drilling.`,
            `React's internal fiber architecture was redesigned to support hooks efficiently.`,
            `Debugging hooks often requires special tools like React DevTools for deeper insight.`
          ]);
        }
      } catch (err) {
        console.error('Error fetching nuggets:', err);
        onError('Failed to load knowledge nuggets');
        // Set fallback nuggets
        onNuggetsLoaded([
          `Hooks let components "hook into" React's lifecycle and state without classes.`,
          `Custom hooks enable sharing stateful logic between components without duplication.`,
          `React's useState hook is implemented using a linked list data structure internally.`,
          `The dependency array in useEffect works similarly to a manual memoization technique.`,
          `React's rules of hooks prevent conditional hook execution for internal consistency.`,
          `The useReducer hook is inspired by Redux's state management pattern.`,
          `Hooks can reduce bundle size by enabling more efficient tree-shaking in builds.`,
          `The Context API combined with hooks offers an alternative to prop drilling.`,
          `React's internal fiber architecture was redesigned to support hooks efficiently.`,
          `Debugging hooks often requires special tools like React DevTools for deeper insight.`
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
