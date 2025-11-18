import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { EDGE_FUNCTIONS } from "@/integrations/supabase/functions";
import { supabase } from "@/integrations/supabase/client";
import AIContentModal from "@/components/content/modals/AIContentModal";
import { Brain, HelpCircle, BookOpen, Layout, Target, BookOpenText } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "mental_models" | "socratic" | "worked_examples" | "visual_summary" | "active_practice" | "story_mode";

interface LearningModesToolbarProps {
  content: string;
  topic?: string;
  title?: string;
  getSelection?: () => string | null;
  onContentReplace?: (newContent: string) => void;
}

export default function LearningModesToolbar({ 
  content, 
  topic, 
  title, 
  getSelection,
  onContentReplace 
}: LearningModesToolbarProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [result, setResult] = useState("");

  const buttons = useMemo(() => ([
    { 
      key: "mental_models" as Mode, 
      label: "Mental models",
      icon: Brain,
      description: "Extract frameworks and patterns"
    },
    { 
      key: "socratic" as Mode, 
      label: "Socratic",
      icon: HelpCircle,
      description: "Explore through questions"
    },
    { 
      key: "worked_examples" as Mode, 
      label: "Examples",
      icon: BookOpen,
      description: "See practical applications"
    },
    { 
      key: "visual_summary" as Mode, 
      label: "Visual",
      icon: Layout,
      description: "Structured visual summary"
    },
    { 
      key: "active_practice" as Mode, 
      label: "Practice",
      icon: Target,
      description: "Hands-on exercises"
    },
    { 
      key: "story_mode" as Mode, 
      label: "Stories",
      icon: BookOpenText,
      description: "Learn through narratives"
    },
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

  const handleReplaceContent = useCallback(() => {
    if (result && onContentReplace) {
      onContentReplace(result);
      setOpen(false);
    }
  }, [result, onContentReplace]);

  const modalTitle = useMemo(() => {
    if (!mode) return "Learn it your way";
    if (mode === "mental_models") return "Mental model map";
    if (mode === "socratic") return "Socratic coach";
    if (mode === "worked_examples") return "Worked examples";
    if (mode === "visual_summary") return "Visual summary";
    if (mode === "active_practice") return "Active practice";
    if (mode === "story_mode") return "Story mode";
    return "Learn it your way";
  }, [mode]);

  return (
    <>
      <div className="mb-6 pb-4 border-b border-gray-200">
        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-gray-700">Learn it your way:</span>
          <div className="flex flex-wrap items-center gap-2">
          {buttons.map(b => {
            const Icon = b.icon;
            return (
              <Button 
                key={b.key} 
                size="sm" 
                variant="outline"
                onClick={() => startTransform(b.key)}
                className={cn(
                  "gap-2 border-gray-300 hover:border-brand-purple hover:text-brand-purple hover:bg-brand-purple/5 transition-colors",
                  isLoading && mode === b.key && "border-brand-purple text-brand-purple bg-brand-purple/10"
                )}
                disabled={isLoading}
              >
                <Icon className="h-4 w-4" />
                {b.label}
              </Button>
            );
          })}
          </div>
        </div>
      </div>

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
        onReplaceContent={onContentReplace ? handleReplaceContent : undefined}
      />
    </>
  );
}


