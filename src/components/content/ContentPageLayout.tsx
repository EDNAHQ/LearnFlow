
import React, { ReactNode, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

interface ContentPageLayoutProps {
  children: ReactNode;
  onGoToProjects?: () => void;
}

const ContentPageLayout = forwardRef<HTMLDivElement, ContentPageLayoutProps>(({ 
  children, 
  onGoToProjects 
}, ref) => {
  return (
    <div className="min-h-screen bg-white text-gray-800 w-full">
      <div ref={ref}></div>
      
      {children}

      {onGoToProjects && (
        <div className="fixed bottom-6 right-6">
          <Button 
            onClick={onGoToProjects}
            className="bg-brand-purple text-white hover:bg-[#5835CB] shadow-md rounded-full p-3 h-auto"
          >
            <Home className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
});

ContentPageLayout.displayName = "ContentPageLayout";

export default ContentPageLayout;
