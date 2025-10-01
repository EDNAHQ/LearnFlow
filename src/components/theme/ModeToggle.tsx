import { Button } from "@/components/ui/button";
import { BookOpen, Presentation, Image, Volume2, MessageSquare } from "lucide-react";
import { useContentMode } from "@/hooks/content";
import { cn } from "@/lib/utils";

export const ModeToggle = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { mode, setMode } = useContentMode();
  const inactiveClasses = "text-brand-primary hover:text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/15 border border-brand-primary/30 rounded-full px-4";
  const activeClasses = "bg-gradient-to-r from-brand-primary to-brand-accent text-white hover:text-brand-highlight font-medium border border-transparent rounded-full px-4 hover:brightness-105";

  return (
    <div className="flex items-center gap-2" data-component="ContentModeTabs" data-testid="content-mode-tabs" {...props}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMode("text")}
        className={cn(
          inactiveClasses,
          mode === "text" && activeClasses
        )}
        aria-pressed={mode === "text"}
      >
        <BookOpen className="h-4 w-4 mr-2" />
        Read
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMode("slides")}
        className={cn(
          inactiveClasses,
          mode === "slides" && activeClasses
        )}
        aria-pressed={mode === "slides"}
      >
        <Presentation className="h-4 w-4 mr-2" />
        Present
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMode("images")}
        className={cn(
          inactiveClasses,
          mode === "images" && activeClasses
        )}
        aria-pressed={mode === "images"}
      >
        <Image className="h-4 w-4 mr-2" />
        Images
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMode("podcast")}
        className={cn(
          inactiveClasses,
          mode === "podcast" && activeClasses
        )}
        aria-pressed={mode === "podcast"}
      >
        <Volume2 className="h-4 w-4 mr-2" />
        Audio
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMode("chat")}
        className={cn(
          inactiveClasses,
          mode === "chat" && activeClasses
        )}
        aria-pressed={mode === "chat"}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Chat
      </Button>
    </div>
  );
};

// Alias for AI/search discoverability
export const ContentModeTabs = ModeToggle;
// For better component identification in React DevTools and tooling
ModeToggle.displayName = "ContentModeTabs";



