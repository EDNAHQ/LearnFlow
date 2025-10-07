
import { Book } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyProjectsStateProps {
  onNewProject: () => void;
}

const EmptyProjectsState = ({ onNewProject }: EmptyProjectsStateProps) => {
  return (
    <div className="text-center py-10 sm:py-14 md:py-16 rounded-xl relative overflow-hidden border border-brand-purple/20 bg-gradient-to-br from-white to-brand-purple/5 px-4">
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm pointer-events-none"></div>
      <div className="relative z-10">
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-5 rounded-full bg-gradient-to-br from-brand-purple/20 to-brand-pink/20 flex items-center justify-center border border-brand-purple/30">
          <Book className="w-6 h-6 sm:w-8 sm:h-8 text-brand-purple" />
        </div>
        <h3 className="text-xl sm:text-2xl font-medium mb-2 sm:mb-3 bg-gradient-to-r from-brand-purple to-brand-pink bg-clip-text text-transparent">No learning projects yet</h3>
        <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">Start your learning journey by creating your first project</p>
        <Button 
          onClick={onNewProject} 
          className="gap-2 bg-brand-purple hover:bg-brand-purple/90 text-white btn-hover-effect w-full sm:w-auto"
        >
          Create Your First Project
        </Button>
      </div>
    </div>
  );
};

export default EmptyProjectsState;
