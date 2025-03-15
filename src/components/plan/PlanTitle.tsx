
import { Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface PlanTitleProps {
  topic: string;
  pathTitle: string | null;
  generatingTitle: boolean;
  authError: boolean;
  loading: boolean;
  pathId: string | null;
  handleDeletePlan: () => void;
  isDeleting: boolean;
}

export const PlanTitle = ({ 
  topic, 
  pathTitle, 
  generatingTitle, 
  authError, 
  loading, 
  pathId,
  handleDeletePlan,
  isDeleting
}: PlanTitleProps) => {
  return (
    <div className="mb-10 text-center">
      <div className="inline-flex justify-center items-center mb-4">
        <div className="w-14 h-14 rounded-full bg-brand-purple/10 flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-brand-purple" />
        </div>
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold mb-3 text-brand-purple">
        {pathTitle || "Your Learning Journey"}
        {generatingTitle && (
          <span className="ml-2 inline-block w-4 h-4 rounded-full border-2 border-brand-purple/30 border-t-brand-purple animate-spin align-middle"></span>
        )}
      </h1>
      
      <p className="text-gray-600 max-w-lg mx-auto mb-2">
        A personalized 10-step plan to master <span className="text-brand-gold font-medium">{topic}</span>
      </p>
      
      {!loading && !authError && pathId && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-brand-pink hover:bg-brand-pink/10 hover:text-brand-pink border-brand-pink/30"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete Plan
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Learning Plan</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this learning plan and all its content.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-brand-pink hover:bg-brand-pink/90 text-white"
                onClick={handleDeletePlan}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Plan"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};
