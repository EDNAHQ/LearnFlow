import { useMemo } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Brain, HelpCircle, BookOpen, Layout, Target, BookOpenText, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Mode } from "@/hooks/content/useContentModeToggle";

interface LearningModesToolbarProps {
  activeModes: Mode[];
  isLoadingMode: (mode: Mode) => boolean;
  getError: (mode: Mode) => string | null;
  onToggleMode: (mode: Mode) => void;
  onReset: () => void;
}

export default function LearningModesToolbar({ 
  activeModes,
  isLoadingMode,
  getError,
  onToggleMode,
  onReset,
}: LearningModesToolbarProps) {
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

  return (
    <div className="mb-6 pb-4 border-b border-gray-200">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Learn it your way:</span>
          {activeModes.length > 0 && (
            <button
              onClick={onReset}
              className="text-xs text-brand-purple hover:text-brand-pink underline transition-colors"
            >
              Reset to default
            </button>
          )}
        </div>
        <ToggleGroup
          type="multiple"
          value={activeModes}
          onValueChange={(values) => {
            const newModes = values as Mode[];
            // Find which mode was toggled
            const added = newModes.find(m => !activeModes.includes(m));
            const removed = activeModes.find(m => !newModes.includes(m));
            
            if (added) {
              onToggleMode(added);
            } else if (removed) {
              onToggleMode(removed);
            }
          }}
          className="flex flex-wrap gap-2"
        >
          {buttons.map(b => {
            const Icon = b.icon;
            const isLoading = isLoadingMode(b.key);
            const error = getError(b.key);
            const isActive = activeModes.includes(b.key);

            return (
              <div key={b.key} className="relative">
                <ToggleGroupItem
                  value={b.key}
                  aria-label={b.label}
                  className={cn(
                    "gap-2 border-gray-300 hover:border-brand-purple hover:text-brand-purple hover:bg-brand-purple/5 transition-colors",
                    isActive && "border-brand-purple text-brand-purple bg-brand-purple/10 data-[state=on]:bg-brand-purple/10",
                    isLoading && "opacity-60 cursor-wait"
                  )}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  {b.label}
                </ToggleGroupItem>
                {error && (
                  <div className="absolute -bottom-6 left-0 right-0 flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    <span className="truncate">{error}</span>
                  </div>
                )}
              </div>
            );
          })}
        </ToggleGroup>
      </div>
    </div>
  );
}
