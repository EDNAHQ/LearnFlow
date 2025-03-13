
import { Book } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyProjectsStateProps {
  onNewProject: () => void;
}

const EmptyProjectsState = ({ onNewProject }: EmptyProjectsStateProps) => {
  return (
    <div className="text-center py-16 rounded-xl relative overflow-hidden border border-brand-purple/20 bg-gradient-to-br from-white to-brand-purple/5">
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm pointer-events-none"></div>
      <div className="relative z-10">
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-to-br from-brand-purple/20 to-brand-pink/20 flex items-center justify-center border border-brand-purple/30">
          <Book className="w-8 h-8 text-brand-purple" />
        </div>
        <h3 className="text-2xl font-medium mb-3 bg-gradient-to-r from-brand-purple to-brand-pink bg-clip-text text-transparent">No learning projects yet</h3>
        <p className="text-gray-600 mb-8">Start your learning journey by creating your first project</p>
        <Button 
          onClick={onNewProject} 
          className="gap-2 bg-brand-purple hover:bg-brand-purple/90 text-white btn-hover-effect"
        >
          Create Your First Project
        </Button>
      </div>
    </div>
  );
};

export default EmptyProjectsState;
