
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
        onClick={() => setMode("e-book")}
        className={cn(
          "text-gray-900 hover:text-gray-900 hover:bg-gray-200/70",
          mode === "e-book" && "bg-gray-200 text-gray-900 font-medium"
        )}
      >
        <BookOpen className="h-4 w-4 mr-2" />
        Read
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMode("presentation")}
        className={cn(
          "text-gray-900 hover:text-gray-900 hover:bg-gray-200/70",
          mode === "presentation" && "bg-gray-200 text-gray-900 font-medium"
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
          "text-gray-900 hover:text-gray-900 hover:bg-gray-200/70",
          mode === "podcast" && "bg-gray-200 text-gray-900 font-medium"
        )}
      >
        <Music className="h-4 w-4 mr-2" />
        Podcast
      </Button>
    </div>
  );
};
