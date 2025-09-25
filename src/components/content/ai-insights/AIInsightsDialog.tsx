import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import AIDialog from "@/components/ai/AIDialog";
import { AI_STYLES } from "@/components/ai";

interface AIInsightsDialogProps {
  selectedText: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: string;
  question?: string;
}

const AIInsightsDialog = ({
  selectedText,
  open,
  onOpenChange,
  topic,
  question = ""
}: AIInsightsDialogProps) => {
  const [insight, setInsight] = useState<string>("");
  const [userQuestion, setUserQuestion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && question) {
      setUserQuestion(question);
      generateInsight(question);
    } else if (!open) {
      setInsight("");
      setUserQuestion("");
      setError(null);
    }
  }, [open, question]);

  const generateInsight = async (questionText = userQuestion) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-ai-insight", {
        body: {
          selectedText: selectedText || "Current section content",
          topic: topic,
          question: questionText.trim() ? questionText : undefined,
        },
      });

      if (error) throw error;

      setInsight(data.insight || "Sorry, I couldn't generate an insight for this selection.");
    } catch (err) {
      console.error("Error generating AI insight:", err);
      setError("Failed to generate insight. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setInsight("");
    setUserQuestion("");
    setError(null);
    onOpenChange(false);
  };

  return (
    <AIDialog
      open={open}
      onOpenChange={onOpenChange}
      title="AI Insights"
      description={`Ask questions about ${topic}`}
      type="insight"
      size="md"
      isLoading={isLoading}
      error={error}
      onRetry={() => generateInsight()}
      selectedText={selectedText}
      content={insight}
      inputSection={!insight ? {
        placeholder: "E.g., Can you explain this concept further? How does this relate to...?",
        value: userQuestion,
        onChange: setUserQuestion,
        onSubmit: () => generateInsight(),
        submitLabel: "Get AI Insight"
      } : undefined}
      actions={insight ? (
        <>
          <Button
            onClick={() => setInsight("")}
            variant="outline"
            className={AI_STYLES.buttons.aiOutline}
          >
            Ask another question
          </Button>
          <Button
            onClick={handleClose}
            className={AI_STYLES.buttons.ai}
          >
            Done
          </Button>
        </>
      ) : undefined}
    />
  );
};

export default AIInsightsDialog;


