import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

interface ContentPageLayoutProps {
  children: ReactNode;
  onGoToProjects: () => void;
  topRef: React.RefObject<HTMLDivElement>;
}

const ContentPageLayout = ({ 
  children, 
  onGoToProjects,
  topRef 
}: ContentPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white w-full">
      <div ref={topRef}></div>
      
      {/* This is the navigation area - keeping it black */}
      <div className="bg-[#1A1A1A]">
        {/* The first child is expected to be the ContentHeader component */}
        {Array.isArray(children) ? children[0] : null}
      </div>
      
      {/* This is the content area - making it white */}
      <div className="bg-white text-gray-800">
        {/* The remaining children (content) */}
        {Array.isArray(children) ? children.slice(1) : children}
      </div>

      <div className="fixed bottom-6 right-6">
        <Button 
          onClick={onGoToProjects}
          className="bg-brand-purple text-white hover:bg-[#5835CB] shadow-md rounded-full p-3 h-auto"
        >
          <Home className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ContentPageLayout;
