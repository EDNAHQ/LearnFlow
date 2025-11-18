import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useDeepDiveTopics } from "@/hooks/content";
import DeepDiveContentDialog from "./DeepDiveContentDialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DeepDiveSectionProps {
  topic: string | null;
  content?: string | null;
  title?: string | null;
}

const DeepDiveSection: React.FC<DeepDiveSectionProps> = ({
  topic,
  content,
  title
}) => {
  const {
    filteredTopics,
    isLoading,
    error,
    selectedTopic,
    deepDiveContent,
    isGenerating,
    dialogOpen,
    setDialogOpen,
    formatSimilarity,
    generateDeepDiveContent
  } = useDeepDiveTopics(topic, content, title);


  // Don't render if no topic
  if (!topic) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 rounded-xl bg-gradient-to-br from-brand-primary/5 via-brand-accent/5 to-brand-highlight/5 border border-gray-200"
      >
        <div className="text-sm text-gray-600">
          Loading topics...
        </div>
      </motion.div>
    );
  }

  // Show error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 rounded-xl bg-red-50 border border-red-200"
      >
        <div className="text-sm text-red-700">
          <p className="font-medium">Error loading topics</p>
          <p className="text-xs text-red-600 mt-1">{error}</p>
        </div>
      </motion.div>
    );
  }

  // Show empty state with helpful message
  if (filteredTopics.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 rounded-xl bg-gradient-to-br from-brand-primary/5 via-brand-accent/5 to-brand-highlight/5 border border-gray-200"
      >
        <div className="text-sm text-gray-600">
          <p className="font-medium text-gray-900">Generating topics...</p>
          <p className="text-xs mt-1">Related topics for deeper exploration</p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 rounded-xl bg-gradient-to-br from-brand-primary/5 via-brand-accent/5 to-brand-highlight/5 border border-gray-200"
      >
        <div className="mb-3">
          <h3 className="text-base font-semibold bg-gradient-to-r from-[#6654f5] via-[#ca5a8b] to-[#f2b347] bg-clip-text text-transparent">
            Related Topics
          </h3>
        </div>

        <div className="space-y-2">
          {filteredTopics.map((relatedTopic, index) => (
            <motion.div
              key={relatedTopic.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => generateDeepDiveContent(relatedTopic.id, relatedTopic.title)}
              className="group bg-white hover:bg-gradient-to-br hover:from-brand-primary/5 hover:to-brand-accent/5 rounded-lg p-3 cursor-pointer border border-gray-200 hover:border-brand-primary/30 transition-all duration-200 hover:shadow-sm"
            >
              <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2 group-hover:text-brand-primary transition-colors">
                {relatedTopic.title}
              </h4>
              <p className="text-xs text-gray-600 line-clamp-2 mb-1.5">
                {relatedTopic.description}
              </p>
              <Badge
                variant="outline"
                className="text-[10px] bg-brand-primary/10 text-brand-primary border-brand-primary/20"
              >
                {formatSimilarity(relatedTopic.similarity)} match
              </Badge>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <DeepDiveContentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        isGenerating={isGenerating}
        deepDiveContent={deepDiveContent}
        selectedTopic={selectedTopic}
        topic={topic}
      />
    </>
  );
};

export default DeepDiveSection;