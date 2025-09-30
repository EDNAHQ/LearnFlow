
import React from "react";
import AIContentModal from "../modals/AIContentModal";

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
    <AIContentModal
      open={open}
      onOpenChange={onOpenChange}
      title={selectedTopic?.title || "Deep Dive"}
      subtitle={undefined}
      content={deepDiveContent || ""}
      isLoading={isGenerating}
      topic={topic || ""}
      widthVariant="halfRight"
      contentType="deep-dive"
    />
  );
};

export default DeepDiveContentDialog;
