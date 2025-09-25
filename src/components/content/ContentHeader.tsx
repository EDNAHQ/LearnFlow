
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

interface ContentHeaderProps {
  onHome: () => void;
  generatingContent: boolean;
  generatedSteps: number;
  totalSteps: number;
}

const ContentHeader = ({
  onHome,
  generatingContent,
  generatedSteps,
  totalSteps
}: ContentHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white backdrop-blur-lg border-b-2 border-gray-100 shadow-md">
      <div className="absolute inset-0 bg-gradient-to-r from-[#6654f5]/3 via-[#ca5a8b]/3 to-[#f2b347]/3 pointer-events-none" />
      <div className="container relative flex h-18 items-center py-3">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between w-full"
        >
          {/* Left Side - Logo and Navigation */}
          <div className="flex items-center gap-6">
            {/* Main Logo */}
            <Link to="/" className="flex items-center">
              <div className="flex flex-col">
                <span className="text-2xl font-black bg-gradient-to-r from-[#6654f5] via-[#ca5a8b] to-[#f2b347] bg-clip-text text-transparent tracking-tight">
                  LearnFlow
                </span>
                <span className="text-[10px] font-semibold text-gray-600 tracking-wide uppercase">
                  Learning Mode
                </span>
              </div>
            </Link>

            <div className="h-8 w-px bg-gray-300"></div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  className="text-gray-700 border-gray-300 hover:text-[#6654f5] hover:border-[#6654f5] hover:bg-[#6654f5]/5 transition-all duration-200 rounded-full px-5 py-2.5 font-semibold"
                  onClick={onHome}
                >
                  <Home className="w-4 h-4 mr-2" />
                  <span>Projects</span>
                </Button>
              </motion.div>

            </div>
          </div>

          {/* Right Side - Status and Mode Toggle */}
          <div className="flex items-center gap-4">
            <ModeToggle />

            {/* Generation indicator with better styling */}
            {generatingContent && generatedSteps < totalSteps && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="flex items-center gap-2 text-sm bg-gradient-to-r from-[#6654f5]/20 to-[#ca5a8b]/20 px-4 py-2.5 rounded-full border-2 border-[#6654f5]/40"
              >
                <div className="w-4 h-4 rounded-full border-2 border-[#ca5a8b] border-t-transparent animate-spin" />
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

export default ContentHeader;
