
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteProjectDialogProps {
  projectId: string;
  projectTopic: string;
  onDeleteProject: (id: string) => void;
  isDeleting: boolean;
}

const DeleteProjectDialog = ({ 
  projectId, 
  projectTopic, 
  onDeleteProject, 
  isDeleting 
}: DeleteProjectDialogProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-7 h-7 rounded-full text-gray-400 hover:text-brand-pink hover:bg-brand-pink/10"
          onClick={(e) => e.stopPropagation()}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Learning Project</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete "{projectTopic}" and all its content.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-brand-pink hover:bg-brand-pink/90 text-white"
            onClick={() => onDeleteProject(projectId)}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Project"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteProjectDialog;
