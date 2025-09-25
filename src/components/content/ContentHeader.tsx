
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import { AI_STYLES } from "@/components/ai";
import { cn } from "@/lib/utils";

interface ContentHeaderProps {
  onHome: () => void;
  generatingContent: boolean;
  generatedSteps: number;
  totalSteps: number;
}

// ContentTopNavigation: top bar with logo, Projects button, and mode tabs
// Added explicit displayName and data attributes for easier discovery by tools/AI
const ContentHeader = ({
  onHome,
  generatingContent,
  generatedSteps,
  totalSteps
}: ContentHeaderProps) => {
  return (
    <header
      className="sticky top-0 z-50 w-full bg-white backdrop-blur-lg border-b-2 border-gray-100 shadow-md"
      data-component="ContentTopNavigation"
      data-testid="content-top-navigation"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/3 via-brand-accent/3 to-brand-highlight/3 pointer-events-none" />
      <div className="relative flex h-18 items-center py-3 px-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between w-full"
        >
          {/* Left Side - Logo and Navigation */}
          <div className="flex items-center gap-6">
            {/* Main Logo */}
            <Link to="/" className="flex items-center" aria-label="LearnFlow Home">
              <div className="flex flex-col">
                <span className={cn("text-2xl font-black tracking-tight", AI_STYLES.gradients.text)}>
                  LearnFlow
                </span>
                <span className="text-[10px] font-semibold text-gray-600 tracking-wide uppercase">
                  Learning Mode
                </span>
              </div>
            </Link>

            <div className="h-8 w-px bg-gray-300"></div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3" data-section="primary-actions">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  className="text-gray-700 border-gray-300 hover:text-brand-primary hover:border-brand-primary hover:bg-brand-primary/5 transition-all duration-200 rounded-full px-5 py-2.5 font-semibold"
                  onClick={onHome}
                >
                  <Home className="w-4 h-4 mr-2" />
                  <span>Projects</span>
                </Button>
              </motion.div>

            </div>
          </div>

          {/* Right Side - Status and Mode Toggle */}
          <div className="flex items-center gap-4" data-section="mode-switcher">
            <ModeToggle data-component="ContentModeTabs" />

            {/* Generation indicator with better styling */}
            {generatingContent && generatedSteps < totalSteps && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="flex items-center gap-2 text-sm bg-gradient-to-r from-brand-primary/20 to-brand-accent/20 px-4 py-2.5 rounded-full border-2 border-brand-primary/40"
              >
                <div className="w-4 h-4 rounded-full border-2 border-brand-accent border-t-transparent animate-spin" />
                <span className="font-semibold text-gray-700">
                  Generating Content ({generatedSteps}/{totalSteps})
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </header>
  );
};

ContentHeader.displayName = "ContentTopNavigation";

export default ContentHeader;
