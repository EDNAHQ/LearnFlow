
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { UserNav } from "@/components/UserNav";

interface PlanPageHeaderProps {
  handleReset: () => void;
}

const PlanPageHeader = ({ handleReset }: PlanPageHeaderProps) => {
  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 text-gray-700 hover:text-brand-purple" 
              onClick={handleReset}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </div>
          
          <div className="text-brand-purple font-medium text-lg">
            LearnFlow
          </div>
          
          <div>
            <UserNav />
          </div>
        </div>
      </div>
    </header>
  );
};

export default PlanPageHeader;
