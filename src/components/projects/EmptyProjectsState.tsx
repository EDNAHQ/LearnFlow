
import { Book } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyProjectsStateProps {
  onNewProject: () => void;
}

const EmptyProjectsState = ({ onNewProject }: EmptyProjectsStateProps) => {
  return (
    <div className="text-center py-16 glass-panel rounded-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white to-brand-purple/5 pointer-events-none"></div>
      <div className="relative z-10">
        <Book className="w-16 h-16 mx-auto mb-5 text-brand-purple opacity-50" />
        <h3 className="text-2xl font-medium mb-3">No learning projects yet</h3>
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
