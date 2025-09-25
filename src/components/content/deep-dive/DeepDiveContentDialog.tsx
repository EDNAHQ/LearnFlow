
import React from "react";
import AIDialog from "@/components/ai/AIDialog";

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
    <AIDialog
      open={open}
      onOpenChange={onOpenChange}
      title={selectedTopic?.title || "Deep Dive"}
      description={topic ? `Related to ${topic}` : "Exploring a related concept"}
      type="deep-dive"
      size="xl"
      isLoading={isGenerating}
      content={deepDiveContent || undefined}
    />
  );
};

export default DeepDiveContentDialog;
