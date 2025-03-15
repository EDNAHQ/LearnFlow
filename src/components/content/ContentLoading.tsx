
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentLoadingProps {
  message?: string;
  goToProjects: () => void;
}

const ContentLoading = ({ message = "Loading learning steps...", goToProjects }: ContentLoadingProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800">
      <div className="relative">
        <Loader2 className="w-16 h-16 animate-spin mb-6 text-[#6D42EF]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 bg-[#E84393] rounded-full opacity-50"></div>
        </div>
      </div>
      <h2 className="text-2xl font-semibold mb-4">{message}</h2>
      <p className="text-sm text-gray-500 mb-2 max-w-md text-center">This should only take a few seconds. If it takes longer, there might be an issue with our content generation service.</p>
      <p className="text-xs text-gray-400 mb-6 max-w-md text-center">You can try refreshing the page or go back to your projects and try again later.</p>
      <Button 
        onClick={goToProjects} 
        className="bg-[#6D42EF] hover:bg-[#5835CB] px-6 py-2 text-lg"
      >
        Go to Projects
      </Button>
    </div>
  );
};

export default ContentLoading;
