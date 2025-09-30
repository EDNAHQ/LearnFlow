import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EDGE_FUNCTIONS } from "@/integrations/supabase/functions";
import AIContentModal from "./AIContentModal";

interface ExploreFurtherSideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: string;
  topic: string;
  content?: string;
}

const ExploreFurtherSideModal = ({
  open,
  onOpenChange,
  question,
  topic,
  content = ""
}: ExploreFurtherSideModalProps) => {
  const [insight, setInsight] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && question) {
      generateInsight();
    } else if (!open) {
      setInsight("");
      setError(null);
    }
  }, [open, question]);

  const generateInsight = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.generateAIInsight, {
        body: {
          selectedText: content || "Current section content",
          topic: topic,
          question: question,
        },
      });

      if (error) throw error;

      setInsight(data.insight || "Sorry, I couldn't generate an insight for this question.");
    } catch (err) {
      console.error("Error generating AI insight:", err);
      setError("Failed to generate insight. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AIContentModal
      open={open}
      onOpenChange={onOpenChange}
      title="Explore Further"
      subtitle={question}
      content={insight}
      isLoading={isLoading}
      error={error}
      onRetry={generateInsight}
      topic={topic}
      contentType="explore-further"
      widthVariant="halfRight"
    />
  );
};

export default ExploreFurtherSideModal;
