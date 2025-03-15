
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
      
      {children}

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
