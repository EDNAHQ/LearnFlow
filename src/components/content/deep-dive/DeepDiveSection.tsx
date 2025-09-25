import React from "react";
import { motion } from "framer-motion";
import { useDeepDiveTopics } from "@/hooks/content";
import DeepDiveContentDialog from "./DeepDiveContentDialog";
import { Badge } from "@/components/ui/badge";
import { AI_STYLES } from "@/components/ai";
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

  if (!topic || isLoading || error || filteredTopics.length === 0) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-brand-primary/5 via-brand-accent/5 to-brand-highlight/5 border border-gray-200"
      >
        <div className="mb-4">
          <h3 className={cn("text-lg font-semibold", AI_STYLES.gradients.text)}>
            Related Topics to Explore
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTopics.map((relatedTopic, index) => (
            <motion.div
              key={relatedTopic.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => generateDeepDiveContent(relatedTopic.id, relatedTopic.title)}
              className="group bg-white hover:bg-gradient-to-br hover:from-brand-primary/5 hover:to-brand-accent/5 rounded-xl p-4 cursor-pointer border border-gray-200 hover:border-brand-primary/30 transition-all duration-200 hover:shadow-md"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-brand-primary transition-colors">
                  {relatedTopic.title}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {relatedTopic.description}
                </p>
                <Badge
                  variant="outline"
                  className="text-xs bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                >
                  {formatSimilarity(relatedTopic.similarity)} match
                </Badge>
              </div>
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