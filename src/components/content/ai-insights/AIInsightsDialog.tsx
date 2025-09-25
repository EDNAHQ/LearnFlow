import { useState, useEffect } from "react";
import { Lightbulb, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface AIInsightsDialogProps {
  selectedText: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: string;
  question?: string;
}

const AIInsightsDialog = ({ 
  selectedText, 
  open, 
  onOpenChange,
  topic,
  question = ""
}: AIInsightsDialogProps) => {
  const [insight, setInsight] = useState<string>("");
  const [userQuestion, setUserQuestion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Set the user question from props when dialog opens
  useEffect(() => {
    if (open && question) {
      setUserQuestion(question);
      // Auto-generate insight when opened with a question
      generateInsight(question);
    } else if (!open) {
      setInsight("");
      setUserQuestion("");
      setError(null);
    }
  }, [open, question]);
  
  const generateInsight = async (questionText = userQuestion) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-ai-insight", {
        body: {
          selectedText: selectedText || "Current section content",
          topic: topic,
          question: questionText.trim() ? questionText : undefined,
        },
      });
      
      if (error) throw error;
      
      setInsight(data.insight || "Sorry, I couldn't generate an insight for this selection.");
    } catch (err) {
      console.error("Error generating AI insight:", err);
      setError("Failed to generate insight. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    setInsight("");
    setUserQuestion("");
    setError(null);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#6D42EF]">
            <Lightbulb className="h-5 w-5" />
            <span>AI Insights</span>
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4" 
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="py-2">
          {selectedText && (
            <div className="bg-gray-50 p-3 rounded-md mb-3 text-sm">
              <div className="text-gray-500 text-xs mb-1">Selected text:</div>
              <div className="text-gray-700 italic">
                "{selectedText.length > 150 
                  ? selectedText.substring(0, 150) + "..." 
                  : selectedText}"
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
              {question ? "Your question:" : "Ask something about this content:"}
            </label>
            <Textarea
              id="question"
              placeholder="E.g., Can you explain this concept further? How does this relate to...?"
              className="w-full resize-none"
              rows={3}
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
            />
          </div>
          
          {!insight && (
            <Button 
              onClick={() => generateInsight()}
              className="bg-[#6D42EF] hover:bg-[#6D42EF]/90 w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating insight...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Get AI Insight
                </>
              )}
            </Button>
          )}
          
          {error && (
            <div className="text-red-500 text-sm mt-2">{error}</div>
          )}
          
          {insight && (
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-700 mb-1">AI Insight:</div>
              <div className="p-4 bg-[#6D42EF]/5 border border-[#6D42EF]/20 rounded-md text-gray-800">
                {insight}
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={() => {
                    setInsight("");
                  }}
                  variant="outline" 
                  className="mr-2"
                >
                  Ask another question
                </Button>
                <Button onClick={handleClose} className="bg-[#6D42EF] hover:bg-[#6D42EF]/90">
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIInsightsDialog;


