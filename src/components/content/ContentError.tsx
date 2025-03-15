
import { BookOpen } from "lucide-react";
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800">
      <BookOpen className="w-12 h-12 mb-4 text-brand-purple" />
      <p className="text-xl font-semibold mb-2">{message}</p>
      <p className="text-gray-500 mb-6">
        Please go back to the projects page and try again.
      </p>
      <Button onClick={goToProjects} className="bg-brand-purple hover:bg-[#5835CB]">
        Go to Projects
      </Button>
    </div>
  );
};

export default ContentError;
