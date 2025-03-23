
import React from "react";
import { useNavigate } from "react-router-dom";
import { Tag, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { useDeepDiveTopics } from "@/hooks/useDeepDiveTopics";
import DeepDiveTopicsList from "./DeepDiveTopicsList";
import DeepDiveContentDialog from "./DeepDiveContentDialog";

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
        className="fixed right-6 top-20 z-50 rounded-full h-10 w-10 p-0 bg-brand-purple text-white hover:bg-[#5835CB] shadow-md"
      >
        <Tag className="h-5 w-5" />
      </Button>

      {/* Sheet from right side */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-80 p-0 bg-white border-l border-gray-200">
          <SheetHeader className="p-4 border-b border-gray-200">
            <SheetTitle className="text-brand-purple flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Deep Dive Topics
            </SheetTitle>
            <SheetDescription className="text-gray-500">
              Explore related content to enhance your learning
            </SheetDescription>
          </SheetHeader>

          <div className="px-4 py-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search related topics..."
                className="w-full bg-gray-100 rounded-md py-2 pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="p-4 overflow-auto max-h-[calc(100vh-150px)]">
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
