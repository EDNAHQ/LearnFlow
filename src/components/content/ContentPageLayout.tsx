
import { ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import RelatedTopicsSidebar from "./RelatedTopicsSidebar";
import { ContentInsightsManager } from "./ContentInsightsManager";

interface ContentPageLayoutProps {
  children: ReactNode;
  onGoToProjects: () => void;
  topRef: React.RefObject<HTMLDivElement>;
  topic: string | null;
  currentContent?: string | null;
  currentTitle?: string | null;
}

const ContentPageLayout = ({ 
  children, 
  onGoToProjects,
  topRef,
  topic,
  currentContent,
  currentTitle
}: ContentPageLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white w-full relative overflow-hidden">
      <div ref={topRef}></div>

      {/* Background decoration patterns */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-to-br from-[#6654f5]/3 to-[#ca5a8b]/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-br from-[#f2b347]/3 to-[#6654f5]/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-br from-[#ca5a8b]/3 to-[#f2b347]/3 rounded-full blur-3xl" />
      </div>

      {/* This is the navigation area - now with updated styling */}
      <div className="relative z-20">
        {/* The first child is expected to be the ContentHeader component */}
        {Array.isArray(children) ? children[0] : null}
      </div>

      {/* This is the content area - with subtle gradient background */}
      <div className="relative z-10 bg-transparent text-gray-800">
        {/* The remaining children (content) */}
        {Array.isArray(children) ? children.slice(1) : children}
      </div>

      {/* Add ContentInsightsManager to handle AI insight events */}
      {topic && <ContentInsightsManager topic={topic} />}

      {/* Related Topics Sidebar - now using Sheet component */}
      <RelatedTopicsSidebar
        topic={topic}
        content={currentContent}
        title={currentTitle}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />

      {/* Floating action buttons with better styling */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        {/* Scroll to top button */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        >
          <Button
            onClick={() => topRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-gray-600 hover:text-[#6654f5] hover:bg-gradient-to-r hover:from-[#6654f5]/10 hover:to-[#ca5a8b]/10 shadow-lg rounded-xl px-4 py-2 h-auto border border-gray-200 hover:border-[#6654f5]/30 transition-all duration-300 text-sm font-medium"
          >
            Top
          </Button>
        </motion.div>

        {/* Home button with gradient */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.1 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#6654f5] to-[#ca5a8b] rounded-xl blur opacity-50 group-hover:opacity-70 transition-opacity" />
          <Button
            onClick={onGoToProjects}
            className="relative brand-gradient text-white shadow-xl hover:shadow-2xl rounded-xl px-4 py-2 h-auto border-0 transition-all duration-300 text-sm font-medium"
          >
            Home
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ContentPageLayout;
