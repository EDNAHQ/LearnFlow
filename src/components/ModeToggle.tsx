
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
          "text-white hover:text-white border border-[#6D42EF]/30 hover:bg-[#6D42EF]/20",
          mode === "text" && "bg-[#6D42EF] text-white font-medium border-[#6D42EF]"
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
          "text-white hover:text-white border border-[#E84393]/30 hover:bg-[#E84393]/20",
          mode === "slides" && "bg-[#E84393] text-white font-medium border-[#E84393]"
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
          "text-white hover:text-white border border-[#F5B623]/30 hover:bg-[#F5B623]/20",
          mode === "podcast" && "bg-[#F5B623] text-white font-medium border-[#F5B623]"
        )}
      >
        <Music className="h-4 w-4 mr-2" />
        Podcast
      </Button>
    </div>
  );
};
