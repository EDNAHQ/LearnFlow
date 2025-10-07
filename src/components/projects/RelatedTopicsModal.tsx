import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";

interface RelatedTopic {
  id: string;
  title: string;
  description: string;
  difficulty?: string;
  relevance?: number;
}

interface RelatedTopicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
  projectDescription?: string;
}

export default function RelatedTopicsModal({
  isOpen,
  onClose,
  projectTitle,
  projectDescription,
}: RelatedTopicsModalProps) {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<RelatedTopic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchRelatedTopics = async () => {
    if (hasLoaded && topics.length > 0) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-related-topics', {
        body: {
          title: projectTitle,
          description: projectDescription
        }
      });

      if (error) throw error;

      if (data?.topics) {
        setTopics(data.topics);
        setHasLoaded(true);
      }
    } catch (error) {
      console.error('Error fetching related topics:', error);
      toast.error('Failed to generate related topics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicClick = (topic: RelatedTopic) => {
    // Store the selected topic for the plan page
    sessionStorage.setItem("learn-topic", topic.title);
    sessionStorage.setItem("topic-description", topic.description);

    // Close the modal
    onClose();

    // Navigate to the plan page to create a new project
    navigate("/plan");

    toast.success(`Creating project plan for: ${topic.title}`);
  };

  // Fetch topics when modal opens
  if (isOpen && !hasLoaded && !isLoading) {
    fetchRelatedTopics();
  }

  const getDifficultyStyle = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'border-l-4 border-l-[#6654f5]/30';
      case 'intermediate':
        return 'border-l-4 border-l-[#6654f5]/60';
      case 'advanced':
        return 'border-l-4 border-l-[#6654f5]';
      default:
        return 'border-l-4 border-l-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col p-0 border-0 [&>button]:hidden w-full sm:rounded-2xl rounded-none h-[100dvh] sm:h-auto">
        {/* Header with gradient */}
        <div className="relative sticky top-0 z-10">
          <div className="absolute inset-0 brand-gradient opacity-90" />
          <DialogHeader className="relative p-5 sm:p-6 text-white">
            <DialogTitle className="text-2xl font-bold">
              Explore Related Topics
            </DialogTitle>
            <DialogDescription className="text-white/90 mt-2">
              Discover new learning paths related to <span className="font-semibold">"{projectTitle}"</span>
            </DialogDescription>
          </DialogHeader>
          {/* Custom close button */}
          <DialogClose className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 disabled:pointer-events-none">
            <X className="h-5 w-5 text-white" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-4 border-[#6654f5]/20 animate-pulse" />
                <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-t-[#6654f5] animate-spin" />
              </div>
              <p className="mt-4 text-gray-600 font-medium">Generating personalized topics...</p>
            </div>
          ) : topics.length > 0 ? (
            <div className="grid gap-3 sm:gap-4">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => handleTopicClick(topic)}
                  className={`relative bg-white rounded-xl p-4 sm:p-5 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group ${getDifficultyStyle(topic.difficulty)}`}
                >
                  <div className="pl-2">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-base sm:text-lg font-semibold text-[#0b0c18] group-hover:text-[#6654f5] transition-colors">
                        {topic.title}
                      </h4>
                      {topic.relevance && (
                        <span className="text-xs font-medium text-[#6654f5] bg-[#6654f5]/10 px-2 py-1 rounded-full">
                          {Math.round(topic.relevance * 100)}% match
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed mb-2 sm:mb-3">
                      {topic.description}
                    </p>

                    {topic.difficulty && (
                      <span className="inline-block text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {topic.difficulty} level
                      </span>
                    )}
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#6654f5]/5 to-[#f2b347]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500">No related topics found. Try refreshing.</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 z-10 flex justify-between items-center p-4 sm:p-6 bg-white border-t">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancel
          </Button>
          <div className="flex gap-3">
            {topics.length > 0 && (
              <Button
                onClick={() => {
                  setHasLoaded(false);
                  setTopics([]);
                  fetchRelatedTopics();
                }}
                disabled={isLoading}
                className="relative overflow-hidden group"
              >
                <div className="absolute inset-0 brand-gradient opacity-90 group-hover:opacity-100 transition-opacity" />
                <span className="relative text-white font-medium">
                  Generate New Topics
                </span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}