
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AIDialog from "@/components/ai/AIDialog";
import { AI_STYLES } from "@/components/ai";
import { cn } from "@/lib/utils";

interface ConceptDetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  concept: {
    term: string;
    definition: string;
  } | null;
  topic: string | null;
}

const ConceptDetailPopup: React.FC<ConceptDetailPopupProps> = ({
  isOpen,
  onClose,
  concept,
  topic
}) => {
  const [detailedExplanation, setDetailedExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchDetailedExplanation = async () => {
    if (!concept || !topic) return;

    if (detailedExplanation && retryCount === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log(`Fetching explanation for "${concept.term}" in topic "${topic}"`);

      const { data, error: invokeError } = await supabase.functions.invoke('generate-concept-explanation', {
        body: {
          concept: concept.term,
          definition: concept.definition || "",
          topic
        }
      });

      if (invokeError) {
        console.error("Edge function error:", invokeError);
        throw new Error(invokeError.message);
      }

      if (!data) {
        throw new Error("No data received from the edge function");
      }

      if (data.error) {
        console.error("API error:", data.error);
        throw new Error(data.error);
      }

      if (data.explanation) {
        console.log("Explanation received, length:", data.explanation.length);
        setDetailedExplanation(data.explanation);
        setRetryCount(0);
      } else {
        console.error("No explanation in response:", data);
        throw new Error("No explanation received");
      }
    } catch (err) {
      console.error("Failed to fetch concept explanation:", err);
      setError(`Couldn't load a detailed explanation at this time. ${err.message}`);
      toast.error("Failed to load concept explanation");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && concept) {
      fetchDetailedExplanation();
    }
  }, [isOpen, concept?.term, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  return (
    <AIDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={concept?.term || "Concept Details"}
      description={topic ? `In the context of ${topic}` : "Understanding this concept in depth"}
      type="concept"
      size="lg"
      isLoading={isLoading}
      error={error}
      onRetry={handleRetry}
    >
      <div className={cn(AI_STYLES.backgrounds.surface, "p-4 rounded-lg mb-4", AI_STYLES.borders.default)}>
        <h3 className="text-sm uppercase text-gray-500 font-medium mb-2">Definition</h3>
        <p className={AI_STYLES.text.body}>{concept?.definition || "No definition available"}</p>
      </div>

      {!isLoading && !error && detailedExplanation && (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <h3 className={cn("text-lg font-medium mb-3", AI_STYLES.text.primary)}>Detailed Explanation</h3>
          <div className={AI_STYLES.text.body}>
            <ReactMarkdown>{detailedExplanation}</ReactMarkdown>
          </div>
        </div>
      )}
    </AIDialog>
  );
};

export default ConceptDetailPopup;
