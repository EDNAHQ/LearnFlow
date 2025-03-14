
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Loader2 } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";

interface ContentHeaderProps {
  onBack: () => void;
  onHome: () => void;
  generatingContent: boolean;
  generatedSteps: number;
  totalSteps: number;
}

const ContentHeader = ({
  onBack,
  onHome,
  generatingContent,
  generatedSteps,
  totalSteps
}: ContentHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-black">
      <div className="container flex h-14 items-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="flex items-center gap-1 text-white hover:bg-white/10"
              onClick={onHome}
            >
              <Home className="h-4 w-4" />
              <span>Projects</span>
            </Button>
            
            <div className="h-5 w-px bg-gray-600"></div>
            
            <Button
              variant="ghost"
              className="flex items-center gap-1 text-white hover:bg-white/10"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <ModeToggle />
            
            {generatingContent && (
              <div className="flex items-center gap-2 text-sm bg-[#6D42EF]/20 text-[#E84393] px-3 py-1 rounded-full">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Generating ({generatedSteps}/{totalSteps})</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </header>
  );
};

export default ContentHeader;
