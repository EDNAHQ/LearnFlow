
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useLearningSteaks } from "@/hooks/useLearningSteaks";
import StreakIndicator from "@/components/user/StreakIndicator";
import SocialShareButtons from "@/components/content/SocialShareButtons";

interface ContentHeaderProps {
  title: string;
  pathId?: string;
}

// Add a ContentHeader component that includes streak and sharing functionality
const ContentHeader = ({ title, pathId }: ContentHeaderProps) => {
  const navigate = useNavigate();
  const { updateStreak } = useLearningSteaks();
  
  // Update streak when content is viewed
  React.useEffect(() => {
    if (title) {
      updateStreak();
    }
  }, [title]);

  return (
    <header className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 border-b mb-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="mr-4"
          onClick={() => navigate("/projects")}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-xl md:text-2xl font-bold">{title}</h1>
      </div>
      
      <div className="flex items-center space-x-3 mt-4 sm:mt-0">
        <StreakIndicator />
        <SocialShareButtons title={title} />
      </div>
    </header>
  );
};

export default ContentHeader;
