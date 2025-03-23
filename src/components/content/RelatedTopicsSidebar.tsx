
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRelatedTopics } from "@/hooks/useRelatedTopics";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Book, ArrowRight, Search, Tag, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";

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
  const { relatedTopics, isLoading, error } = useRelatedTopics(topic, content, title);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<{ id: string; title: string } | null>(null);
  const [deepDiveContent, setDeepDiveContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filter topics based on search query
  const filteredTopics = searchQuery
    ? relatedTopics.filter(topic => 
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : relatedTopics;

  // Format similarity score as percentage
  const formatSimilarity = (score: number) => {
    return `${Math.round(score * 100)}%`;
  };

  const generateDeepDiveContent = async (topicId: string, topicTitle: string) => {
    setSelectedTopic({ id: topicId, title: topicTitle });
    setIsGenerating(true);
    setDialogOpen(true);
    setDeepDiveContent(null);
    
    try {
      const selectedTopicDetails = relatedTopics.find(t => t.id === topicId);
      
      if (!selectedTopicDetails) {
        throw new Error("Topic details not found");
      }
      
      console.log(`Generating deep dive content for "${topicTitle}"...`);
      
      const { data, error } = await supabase.functions.invoke('generate-deep-dive-content', {
        body: {
          topic: topic,
          title: topicTitle,
          originalContent: content
        }
      });
      
      if (error) throw error;
      
      if (data && data.content) {
        setDeepDiveContent(data.content);
      } else {
        throw new Error("Invalid response format from AI service");
      }
    } catch (err) {
      console.error('Error generating deep dive content:', err);
      setDeepDiveContent(`# Error Generating Content\n\nWe couldn't generate deep dive content for "${topicTitle}" at this time. Please try again later.`);
    } finally {
      setIsGenerating(false);
    }
  };

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
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-5 w-5 border-2 border-brand-purple border-t-transparent rounded-full"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-gray-500">
                <p>Failed to load related topics</p>
                <Button 
                  variant="link" 
                  onClick={() => window.location.reload()}
                  className="text-brand-purple mt-2"
                >
                  Try again
                </Button>
              </div>
            ) : filteredTopics.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? "No matching topics found" : "No related topics available"}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTopics.map((relatedTopic) => (
                  <div 
                    key={relatedTopic.id}
                    className="bg-white hover:bg-gray-50 rounded-lg p-3 cursor-pointer border border-gray-100"
                    onClick={() => generateDeepDiveContent(relatedTopic.id, relatedTopic.title)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="shrink-0">
                        <Book className="h-5 w-5 text-brand-purple" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{relatedTopic.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{relatedTopic.description}</p>
                        <div className="flex items-center mt-1.5 gap-2">
                          <Badge variant="outline" className="text-xs bg-brand-purple/10 text-brand-purple border-brand-purple/20">
                            {formatSimilarity(relatedTopic.similarity)} match
                          </Badge>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <SheetFooter className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center w-full">
              Topics are AI-generated based on your current learning content.
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Deep Dive Content Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-0 top-0" 
              onClick={() => setDialogOpen(false)}
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
    </>
  );
};

export default RelatedTopicsSidebar;
