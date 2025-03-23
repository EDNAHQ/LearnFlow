
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRelatedTopics } from "@/hooks/useRelatedTopics";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTitle,
  SidebarFooter,
  SidebarItem,
  SidebarItemIcon,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Book, ChevronLeft, ChevronRight, ArrowRight, Search, Tag } from "lucide-react";
import { toast } from "sonner";

interface RelatedTopicsSidebarProps {
  topic: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RelatedTopicsSidebar: React.FC<RelatedTopicsSidebarProps> = ({
  topic,
  open,
  onOpenChange
}) => {
  const navigate = useNavigate();
  const { relatedTopics, isLoading, error } = useRelatedTopics(topic);
  const [searchQuery, setSearchQuery] = useState("");

  const handleTopicSelect = (id: string) => {
    // Navigate to the new topic
    navigate(`/content/${id}/step/0`);
    toast.success("Started a new deep dive!");
    onOpenChange(false); // Close sidebar after selection
  };

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

  return (
    <>
      {/* Toggle button - fixed position */}
      <Button
        onClick={() => onOpenChange(!open)}
        variant="secondary"
        size="sm"
        className="fixed right-2 top-20 z-50 rounded-full h-10 w-10 p-0 bg-brand-purple text-white hover:bg-[#5835CB] shadow-md"
      >
        {open ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <Sidebar
        open={open}
        onOpenChange={onOpenChange}
        className={`right-0 left-auto w-80 bg-white text-gray-800 shadow-lg border-l border-gray-200 transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <SidebarHeader className="border-b border-gray-200">
          <SidebarTitle className="text-brand-purple flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Deep Dive Topics
          </SidebarTitle>
          <p className="text-sm text-gray-500 mt-1">
            Explore related content without starting over
          </p>
        </SidebarHeader>

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

        <SidebarContent>
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
                <SidebarItem 
                  key={relatedTopic.id}
                  className="bg-white hover:bg-gray-50 rounded-lg p-3 cursor-pointer border border-gray-100"
                  onClick={() => handleTopicSelect(relatedTopic.id)}
                >
                  <div className="flex items-center gap-3">
                    <SidebarItemIcon>
                      <Book className="h-5 w-5 text-brand-purple" />
                    </SidebarItemIcon>
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
                </SidebarItem>
              ))}
            </div>
          )}
        </SidebarContent>

        <SidebarFooter className="border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Topics are suggested based on your current learning path.
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  );
};

export default RelatedTopicsSidebar;
