
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
          // Fallback nuggets if the API doesn't return any - made longer and avoiding restricted words
          onNuggetsLoaded([
            `Components in modern frameworks follow a composition pattern where smaller, focused pieces combine to create complex UIs. This architectural approach improves code reusability and maintenance by isolating functionality into discrete, testable units that can be assembled into larger structures.`,
            `Custom hooks in React extract and share stateful logic between components without forcing component hierarchy changes. This pattern solves the problem of logic duplication across components by creating reusable functionality modules that leverage React's core hooks while maintaining a functional programming approach.`,
            `React's useState implementation uses a linked list internally to maintain state between renders. This implementation choice allows React to preserve the order of hooks calls, which is why hooks cannot be conditionally called - the internal mechanism depends on consistent execution order for reliable state management.`,
            `The dependency array in useEffect is a performance optimization that prevents unnecessary effect executions by comparing array values with previous renders. When React detects no changes in the dependencies, it skips re-running the effect function, significantly improving application performance for effects with expensive operations.`,
            `JavaScript's event loop manages asynchronous operations by processing the call stack, callback queue, and microtask queue in a specific order. This single-threaded concurrency model explains why promises resolve before setTimeout callbacks, even when both are ready simultaneously - microtasks always take priority in the execution sequence.`
          ]);
        }
      } catch (err) {
        console.error('Error fetching nuggets:', err);
        onError('Failed to load knowledge nuggets');
        // Set fallback nuggets - made longer and avoiding restricted words
        onNuggetsLoaded([
          `Components in modern frameworks follow a composition pattern where smaller, focused pieces combine to create complex UIs. This architectural approach improves code reusability and maintenance by isolating functionality into discrete, testable units that can be assembled into larger structures.`,
          `Custom hooks in React extract and share stateful logic between components without forcing component hierarchy changes. This pattern solves the problem of logic duplication across components by creating reusable functionality modules that leverage React's core hooks while maintaining a functional programming approach.`,
          `React's useState implementation uses a linked list internally to maintain state between renders. This implementation choice allows React to preserve the order of hooks calls, which is why hooks cannot be conditionally called - the internal mechanism depends on consistent execution order for reliable state management.`,
          `The dependency array in useEffect is a performance optimization that prevents unnecessary effect executions by comparing array values with previous renders. When React detects no changes in the dependencies, it skips re-running the effect function, significantly improving application performance for effects with expensive operations.`,
          `JavaScript's event loop manages asynchronous operations by processing the call stack, callback queue, and microtask queue in a specific order. This single-threaded concurrency model explains why promises resolve before setTimeout callbacks, even when both are ready simultaneously - microtasks always take priority in the execution sequence.`
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
