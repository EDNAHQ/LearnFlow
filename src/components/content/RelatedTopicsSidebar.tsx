
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { useDeepDiveTopics } from "@/hooks/content";
import DeepDiveTopicsList from "./deep-dive/DeepDiveTopicsList";
import DeepDiveContentDialog from "./deep-dive/DeepDiveContentDialog";

interface RelatedTopicsSidebarProps {
  topic: string | null;
  content?: string | null;
  title?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RelatedTopicsSidebar: React.FC<RelatedTopicsSidebarProps> = ({
  topic,
  content,
  title,
  open,
  onOpenChange
}) => {
  const navigate = useNavigate();
  const {
    filteredTopics,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    selectedTopic,
    deepDiveContent,
    isGenerating,
    dialogOpen,
    setDialogOpen,
    formatSimilarity,
    generateDeepDiveContent
  } = useDeepDiveTopics(topic, content, title);

  return (
    <>
      {/* Toggle button - fixed position */}
      <Button
        onClick={() => onOpenChange(!open)}
        variant="secondary"
        size="sm"
        className="fixed right-6 top-20 z-50 rounded-lg px-4 py-2 bg-brand-purple text-white hover:bg-[#5835CB] shadow-md text-sm font-medium"
      >
        Related Topics
      </Button>

      {/* Bottom sheet for related topics */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          overlayClassName="bg-transparent"
          className="p-0 bg-white border-t border-gray-200 z-[120] h-[25vh] md:h-[50vh] rounded-t-2xl flex flex-col w-full md:w-1/2 ml-auto"
          style={{ left: "auto" }}
        >
          <SheetHeader className="p-4 border-b border-gray-200">
            <div className="w-12 h-1.5 rounded-full bg-gray-300 mx-auto mb-2" />
            <SheetTitle className="text-brand-purple font-bold">
              Deep Dive Topics
            </SheetTitle>
            <SheetDescription className="text-gray-500">
              Explore related content to enhance your learning
            </SheetDescription>
          </SheetHeader>

          <div className="px-4 py-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search related topics..."
              className="w-full bg-gray-100 rounded-md py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="p-4 overflow-auto flex-1">
            <DeepDiveTopicsList
              isLoading={isLoading}
              error={error}
              filteredTopics={filteredTopics}
              searchQuery={searchQuery}
              formatSimilarity={formatSimilarity}
              onTopicClick={generateDeepDiveContent}
            />
          </div>

          <SheetFooter className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center w-full">
              Topics are AI-generated based on your current learning content.
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Deep Dive Content Dialog */}
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

export default RelatedTopicsSidebar;
