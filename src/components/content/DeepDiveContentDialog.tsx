
import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";

interface DeepDiveContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isGenerating: boolean;
  deepDiveContent: string | null;
  selectedTopic: { id: string; title: string } | null;
  topic: string | null;
}

const DeepDiveContentDialog: React.FC<DeepDiveContentDialogProps> = ({
  open,
  onOpenChange,
  isGenerating,
  deepDiveContent,
  selectedTopic,
  topic
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-0 top-0" 
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-xl text-brand-purple">
            {selectedTopic?.title || "Deep Dive"}
          </DialogTitle>
          <DialogDescription>
            {topic ? `Related to ${topic}` : "Exploring a related concept"}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="animate-spin h-8 w-8 border-3 border-brand-purple border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-600">Generating deep dive content...</p>
            </div>
          ) : (
            <div className="prose prose-sm sm:prose max-w-none dark:prose-invert">
              {deepDiveContent ? (
                <ReactMarkdown>{deepDiveContent}</ReactMarkdown>
              ) : (
                <p>No content available</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeepDiveContentDialog;
