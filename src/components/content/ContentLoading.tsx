
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentLoadingProps {
  message?: string;
  goToProjects: () => void;
}

const ContentLoading = ({ message = "Loading learning steps...", goToProjects }: ContentLoadingProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1A1A1A] text-white">
      <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#6D42EF]" />
      <p className="text-lg">{message}</p>
      <Button 
        onClick={goToProjects} 
        className="bg-[#6D42EF] hover:bg-[#5835CB] mt-4"
      >
        Go to Projects
      </Button>
    </div>
  );
};

export default ContentLoading;
