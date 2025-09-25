import { ReactNode } from "react";
import { X, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import AILoadingState from "./AILoadingState";
import AIErrorState from "./AIErrorState";
import { AI_STYLES, AI_DIALOG_SIZES } from "./constants";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

export type AIDialogType = "insight" | "concept" | "deep-dive" | "custom";

interface AIDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  type?: AIDialogType;
  size?: keyof typeof AI_DIALOG_SIZES;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  children?: ReactNode;
  content?: string;
  inputSection?: {
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    submitLabel?: string;
  };
  actions?: ReactNode;
  selectedText?: string;
}

const AIDialog = ({
  open,
  onOpenChange,
  title,
  description,
  type = "custom",
  size = "md",
  isLoading = false,
  error = null,
  onRetry,
  children,
  content,
  inputSection,
  actions,
  selectedText
}: AIDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(AI_DIALOG_SIZES[size], "max-h-[90vh] overflow-y-auto")}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className={cn("flex items-center gap-2", AI_STYLES.text.primary)}>
              <Sparkles className="h-5 w-5" />
              <span>{title}</span>
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {description && (
            <DialogDescription className={AI_STYLES.text.muted}>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="py-2">
          {selectedText && (
            <div className={cn(AI_STYLES.backgrounds.surface, "p-3 rounded-lg mb-3 text-sm", AI_STYLES.borders.default)}>
              <div className="text-xs mb-1 text-gray-500">Selected text:</div>
              <div className={cn("italic", AI_STYLES.text.body)}>
                "{selectedText.length > 150 ? selectedText.substring(0, 150) + "..." : selectedText}"
              </div>
            </div>
          )}

          {inputSection && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {inputSection.placeholder}
              </label>
              <Textarea
                placeholder={inputSection.placeholder}
                className="w-full resize-none"
                rows={3}
                value={inputSection.value}
                onChange={(e) => inputSection.onChange(e.target.value)}
              />
              <Button
                onClick={inputSection.onSubmit}
                className={cn("w-full mt-3", AI_STYLES.buttons.ai)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <AILoadingState variant="minimal" size="sm" message={null} />
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {inputSection.submitLabel || "Get AI Insight"}
                  </>
                )}
              </Button>
            </div>
          )}

          {isLoading && <AILoadingState variant="animated" />}

          {error && !isLoading && <AIErrorState message={error} onRetry={onRetry} />}

          {!isLoading && !error && content && (
            <div className={cn(AI_STYLES.backgrounds.surface, "p-4 rounded-lg", AI_STYLES.borders.default)}>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </div>
          )}

          {!isLoading && !error && children}

          {actions && (
            <div className="mt-4 flex justify-end gap-2">
              {actions}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIDialog;