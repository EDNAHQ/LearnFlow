
import { Button } from "@/components/ui/button";
import { BookOpen, Presentation, Music } from "lucide-react";
import { useContentMode } from "@/hooks/useContentMode";
import { cn } from "@/lib/utils";

export const ModeToggle = () => {
  const { mode, setMode } = useContentMode();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMode("text")}
        className={cn(
          "text-white hover:text-white border border-brand-purple/30 hover:bg-brand-purple/20",
          mode === "text" && "bg-brand-purple/20 text-white font-medium border-brand-purple"
        )}
      >
        <BookOpen className="h-4 w-4 mr-2" />
        Read
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMode("slides")}
        className={cn(
          "text-white hover:text-white border border-brand-purple/30 hover:bg-brand-purple/20",
          mode === "slides" && "bg-brand-purple/20 text-white font-medium border-brand-purple"
        )}
      >
        <Presentation className="h-4 w-4 mr-2" />
        Present
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMode("podcast")}
        className={cn(
          "text-white hover:text-white border border-brand-purple/30 hover:bg-brand-purple/20",
          mode === "podcast" && "bg-brand-purple/20 text-white font-medium border-brand-purple"
        )}
      >
        <Music className="h-4 w-4 mr-2" />
        Podcast
      </Button>
    </div>
  );
};
