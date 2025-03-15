
import { BookOpen, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentErrorProps {
  goToProjects: () => void;
  message?: string;
}

const ContentError = ({ 
  goToProjects, 
  message = "Oops! It seems like we couldn't retrieve the learning topic."
}: ContentErrorProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800 p-4">
      <div className="bg-red-50 rounded-xl p-8 max-w-md text-center border border-red-100 shadow-lg">
        <div className="bg-red-100 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">{message}</h2>
        <p className="text-gray-600 mb-8">
          There might be an issue with your connection or our servers. Please go back to your projects and try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={goToProjects} 
            className="bg-[#6D42EF] hover:bg-[#5835CB] text-white"
          >
            Go to Projects
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContentError;
