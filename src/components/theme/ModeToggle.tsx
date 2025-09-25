import { Button } from "@/components/ui/button";
import { BookOpen, Presentation, Volume2 } from "lucide-react";
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
          "text-[#6D42EF] bg-[#6D42EF]/10 hover:bg-[#6D42EF]/15 border border-[#6D42EF]/30 rounded-full px-4",
          mode === "text" && "bg-[#6D42EF] text-white font-medium border-[#6D42EF]"
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
          "text-[#E84393] bg-[#E84393]/10 hover:bg-[#E84393]/15 border border-[#E84393]/30 rounded-full px-4",
          mode === "slides" && "bg-[#E84393] text-white font-medium border-[#E84393]"
        )}
        aria-pressed={mode === "slides"}
      >
        <Presentation className="h-4 w-4 mr-2" />
        Present
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMode("podcast")}
        className={cn(
          "text-[#F5B623] bg-[#F5B623]/10 hover:bg-[#F5B623]/15 border border-[#F5B623]/30 rounded-full px-4",
          mode === "podcast" && "bg-[#F5B623] text-white font-medium border-[#F5B623]"
        )}
        aria-pressed={mode === "podcast"}
      >
        <Volume2 className="h-4 w-4 mr-2" />
        Audio
      </Button>
    </div>
  );
};



