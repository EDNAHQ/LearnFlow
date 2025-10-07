import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { EDGE_FUNCTIONS } from "@/integrations/supabase/functions";
import { supabase } from "@/integrations/supabase/client";
import AIContentModal from "@/components/content/modals/AIContentModal";

type Mode = "mental_models" | "socratic" | "worked_examples";

interface LearningModesToolbarProps {
  content: string;
  topic?: string;
  title?: string;
  getSelection?: () => string | null; // optional function to extract selected text
}

export default function LearningModesToolbar({ content, topic, title, getSelection }: LearningModesToolbarProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [result, setResult] = useState("");

  const buttons = useMemo(() => ([
    { key: "mental_models" as Mode, label: "Mental models" },
    { key: "socratic" as Mode, label: "Socratic" },
    { key: "worked_examples" as Mode, label: "Examples" },
  ]), []);

  const startTransform = useCallback(async (selectedMode: Mode) => {
    setMode(selectedMode);
    setOpen(true);
    setIsLoading(true);
    setError(null);
    setResult("");

    try {
      const selection = getSelection ? (getSelection() || "") : "";

      const { data, error: fnError } = await supabase.functions.invoke(EDGE_FUNCTIONS.learningModesTransform, {
        body: {
          mode: selectedMode,
          content,
          topic,
          title,
          selection,
        }
      });

      if (fnError) throw fnError;
      setResult(data?.content || "");
    } catch (e: any) {
      setError(e?.message || "Failed to transform content");
    } finally {
      setIsLoading(false);
    }
  }, [content, topic, title, getSelection]);

  const modalTitle = useMemo(() => {
    if (!mode) return "Learn it your way";
    if (mode === "mental_models") return "Mental model map";
    if (mode === "socratic") return "Socratic coach";
    return "Worked examples";
  }, [mode]);

  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-500 mr-2">Learn it your way:</span>
      {buttons.map(b => (
        <Button key={b.key} size="sm" variant="outline" onClick={() => startTransform(b.key)}>
          {b.label}
        </Button>
      ))}

      <AIContentModal
        open={open}
        onOpenChange={setOpen}
        title={modalTitle}
        subtitle={topic}
        content={result}
        isLoading={isLoading}
        error={error}
        contentType="insight"
        widthVariant="halfRight"
        placement="right"
        topic={topic}
      />
    </div>
  );
}


