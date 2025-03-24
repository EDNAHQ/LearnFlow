
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ConceptDetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  concept: {
    term: string;
    definition: string;
  } | null;
  topic: string | null;
}

const ConceptDetailPopup: React.FC<ConceptDetailPopupProps> = ({
  isOpen,
  onClose,
  concept,
  topic
}) => {
  const [detailedExplanation, setDetailedExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Get a detailed explanation of the concept
  const fetchDetailedExplanation = async () => {
    if (!concept || !topic) return;
    
    // Don't fetch again if we already have the explanation
    if (detailedExplanation && retryCount === 0) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching explanation for "${concept.term}" in topic "${topic}"`);
      
      const { data, error: invokeError } = await supabase.functions.invoke('generate-concept-explanation', {
        body: {
          concept: concept.term,
          definition: concept.definition || "",
          topic
        }
      });
      
      if (invokeError) {
        console.error("Edge function error:", invokeError);
        throw new Error(invokeError.message);
      }
      
      if (!data) {
        throw new Error("No data received from the edge function");
      }
      
      if (data.error) {
        console.error("API error:", data.error);
        throw new Error(data.error);
      }
      
      if (data.explanation) {
        console.log("Explanation received, length:", data.explanation.length);
        setDetailedExplanation(data.explanation);
        setRetryCount(0); // Reset retry count on success
      } else {
        console.error("No explanation in response:", data);
        throw new Error("No explanation received");
      }
    } catch (err) {
      console.error("Failed to fetch concept explanation:", err);
      setError(`Couldn't load a detailed explanation at this time. ${err.message}`);
      toast.error("Failed to load concept explanation");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch explanation when popup opens
  React.useEffect(() => {
    if (isOpen && concept) {
      fetchDetailedExplanation();
    }
  }, [isOpen, concept?.term, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-0 top-0" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <DialogTitle className="text-xl text-brand-purple">
            {concept?.term || "Concept Details"}
          </DialogTitle>
          
          <DialogDescription>
            {topic ? `In the context of ${topic}` : "Understanding this concept in depth"}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {/* Basic definition */}
          <div className="mb-6 p-4 bg-purple-50 rounded-lg">
            <h3 className="text-sm uppercase text-gray-500 font-medium mb-1">Definition</h3>
            <p className="text-gray-800">{concept?.definition || "No definition available"}</p>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 text-brand-purple animate-spin mr-2" />
              <p className="text-gray-600">Loading detailed explanation...</p>
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <div className="text-center py-4 text-red-500">
              <p>{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2" 
                onClick={handleRetry}
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Detailed explanation */}
          {!isLoading && !error && detailedExplanation && (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <h3 className="text-lg font-medium text-brand-purple mb-3">Detailed Explanation</h3>
              <ReactMarkdown>{detailedExplanation}</ReactMarkdown>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConceptDetailPopup;
