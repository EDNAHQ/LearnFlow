
import { Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentLoadingProps {
  message?: string;
  goToProjects: () => void;
}

const ContentLoading = ({ message = "Loading learning steps...", goToProjects }: ContentLoadingProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800">
      <Loader2 className="w-10 h-10 animate-spin mb-4 text-learn-500" />
      <p className="text-lg">{message}</p>
      {goToProjects && (
        <Button 
          onClick={goToProjects} 
          className="bg-learn-600 hover:bg-learn-700 mt-4"
        >
          Go to Projects
        </Button>
      )}
    </div>
  );
};

export default ContentLoading;
