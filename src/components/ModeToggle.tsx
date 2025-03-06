
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
          "text-gray-700 hover:text-gray-900",
          mode === "e-book" && "bg-gray-100 text-gray-900"
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
          "text-gray-700 hover:text-gray-900",
          mode === "presentation" && "bg-gray-100 text-gray-900"
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
          "text-gray-700 hover:text-gray-900",
          mode === "podcast" && "bg-gray-100 text-gray-900"
        )}
      >
        <Music className="h-4 w-4 mr-2" />
        Podcast
      </Button>
    </div>
  );
};
