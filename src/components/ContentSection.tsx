
import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { generateStepContent } from "@/utils/learningUtils";
import ContentLoader from "./content/ContentLoader";
import ContentHelperTip from "./ContentHelperTip";
import { formatContent } from "@/utils/contentFormatter";
import { useTextSelection } from "@/hooks/useTextSelection";
import AIInsightsDialog from "./AIInsightsDialog";
import TextSelectionButton from "./TextSelectionButton";
import ContentRelatedQuestions from "./ContentRelatedQuestions";
import ContentMarginNote from "./ContentMarginNote";
import { supabase } from "@/integrations/supabase/client";
import { generateMarginNotes, MarginNote } from "@/utils/marginNotesUtils";

interface ContentSectionProps {
  title: string;
  content: string;
  index: number;
  detailedContent?: string | null;
  pathId?: string;
  topic?: string;
}

const ContentSection = ({ title, content, index, detailedContent, topic }: ContentSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [loadedDetailedContent, setLoadedDetailedContent] = useState<string | null>(detailedContent || null);
  const [isLoading, setIsLoading] = useState(false);
  const [showInsightsDialog, setShowInsightsDialog] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsGenerated, setQuestionsGenerated] = useState(false);
  const [marginNotes, setMarginNotes] = useState<MarginNote[]>([]);
  const [loadingMarginNotes, setLoadingMarginNotes] = useState(false);
  const [marginNotesGenerated, setMarginNotesGenerated] = useState(false);
  
  const { 
    selectedText, 
    showSelectionButton,
    selectionPosition,
    handleTextSelection
  } = useTextSelection();
  
  const stepId = content.split(":")[0]; // Extract step ID from content

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 200);

    return () => clearTimeout(timer);
  }, [index]);

  // Reset questions and margin notes state when content or topic changes
  useEffect(() => {
    setRelatedQuestions([]);
    setQuestionsGenerated(false);
    setLoadingQuestions(false);
    setMarginNotes([]);
    setMarginNotesGenerated(false);
    setLoadingMarginNotes(false);
  }, [content, topic]);

  useEffect(() => {
    // Update loaded content when detailed content prop changes
    if (detailedContent) {
      setLoadedDetailedContent(detailedContent);
      setIsLoading(false);
    }
  }, [detailedContent]);

  // If no detailed content, try to load it directly
  useEffect(() => {
    if (!loadedDetailedContent && stepId && topic && !isLoading) {
      const loadContent = async () => {
        setIsLoading(true);
        try {
          const generatedContent = await generateStepContent(
            { id: stepId, title, description: content.split(":")[1] || "" },
            topic
          );
          setLoadedDetailedContent(generatedContent);
        } catch (error) {
          console.error("Error loading content:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadContent();
    }
  }, [loadedDetailedContent, stepId, title, content, topic, isLoading]);

  // Generate related questions once content is loaded - but only once per content
  const generateRelatedQuestions = useCallback(async () => {
    if (!loadedDetailedContent || !topic || questionsGenerated || loadingQuestions) {
      return;
    }
    
    setLoadingQuestions(true);
    try {
      console.log(`Generating questions for: ${title} (ID: ${stepId})`);
      
      const response = await supabase.functions.invoke('generate-learning-content', {
        body: {
          content: loadedDetailedContent,
          topic,
          title,
          generateQuestions: true
        }
      });
      
      if (response.data?.questions && Array.isArray(response.data.questions)) {
        console.log(`Received ${response.data.questions.length} questions for: ${title}`);
        setRelatedQuestions(response.data.questions);
      }
    } catch (error) {
      console.error("Error generating related questions:", error);
    } finally {
      setLoadingQuestions(false);
      setQuestionsGenerated(true);
    }
  }, [loadedDetailedContent, topic, title, stepId, questionsGenerated, loadingQuestions]);

  // Generate margin notes once content is loaded
  const generateContentMarginNotes = useCallback(async () => {
    if (!loadedDetailedContent || !topic || marginNotesGenerated || loadingMarginNotes) {
      return;
    }
    
    setLoadingMarginNotes(true);
    try {
      console.log(`Generating margin notes for: ${title}`);
      
      // Show loading state immediately with placeholders
      setMarginNotes([
        { id: 'loading-1', paragraph: '', insight: '' },
        { id: 'loading-2', paragraph: '', insight: '' }
      ]);
      
      const notes = await generateMarginNotes(loadedDetailedContent, topic);
      
      console.log(`Generated ${notes.length} margin notes for: ${title}`);
      setMarginNotes(notes);
    } catch (error) {
      console.error("Error generating margin notes:", error);
    } finally {
      setLoadingMarginNotes(false);
      setMarginNotesGenerated(true);
    }
  }, [loadedDetailedContent, topic, title, marginNotesGenerated, loadingMarginNotes]);

  // Trigger question and margin notes generation once content is loaded
  useEffect(() => {
    if (loadedDetailedContent && topic) {
      if (!questionsGenerated && !loadingQuestions) {
        generateRelatedQuestions();
      }
      
      if (!marginNotesGenerated && !loadingMarginNotes) {
        generateContentMarginNotes();
      }
    }
  }, [
    loadedDetailedContent, 
    topic, 
    questionsGenerated, 
    loadingQuestions, 
    generateRelatedQuestions,
    marginNotesGenerated,
    loadingMarginNotes,
    generateContentMarginNotes
  ]);

  const handleDialogOpenChange = (open: boolean) => {
    setShowInsightsDialog(open);
    if (!open) {
      setCurrentQuestion("");
    }
  };

  const handleShowInsights = () => {
    setShowInsightsDialog(true);
  };

  const handleQuestionClick = (question: string) => {
    setCurrentQuestion(question);
    setShowInsightsDialog(true);
  };

  // Create DOM references to paragraphs for positioning margin notes
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Position margin notes next to their respective paragraphs
  useEffect(() => {
    if (!contentRef.current || marginNotes.length === 0 || loadingMarginNotes) return;
    
    const contentDiv = contentRef.current;
    const paragraphs = contentDiv.querySelectorAll('p');
    
    if (paragraphs.length === 0) return;
    
    // For each margin note, find a matching paragraph and position the note
    marginNotes.forEach((note, index) => {
      if (note.id.startsWith('loading-')) return;
      
      // Find paragraphs that contain this note's text
      for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i];
        const paragraphText = paragraph.textContent || '';
        
        if (paragraphText.includes(note.paragraph.substring(0, 50))) {
          // Mark this paragraph
          paragraph.setAttribute('data-has-note', note.id);
          paragraph.classList.add('relative');
          break;
        }
      }
    });
  }, [marginNotes, loadingMarginNotes]);

  return (
    <div 
      className={cn(
        "transition-all duration-500 ease-in-out bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-8 mb-8 w-full max-w-[860px] mx-auto overflow-hidden",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      {!loadedDetailedContent || isLoading ? (
        <ContentLoader />
      ) : (
        <div 
          className="prose prose-gray max-w-none w-full"
          onMouseUp={handleTextSelection}
          onTouchEnd={handleTextSelection}
        >
          <div 
            className="content-section w-full relative"
            ref={contentRef}
          >
            {formatContent(loadedDetailedContent, topic, handleQuestionClick)}
            
            {/* Render margin notes */}
            {marginNotes.map((note, index) => {
              const paragraphEl = contentRef.current?.querySelector(`[data-has-note="${note.id}"]`);
              if (!paragraphEl) return null;
              
              // Position relative to the paragraph
              const containerTop = contentRef.current?.getBoundingClientRect().top || 0;
              const paragraphTop = paragraphEl.getBoundingClientRect().top || 0;
              const relativeTop = paragraphTop - containerTop;
              
              const style = {
                top: `${relativeTop}px`,
                right: '-60px',
              };
              
              return (
                <div 
                  key={note.id}
                  className="absolute transition-all duration-300 ease-in-out"
                  style={style}
                >
                  <ContentMarginNote 
                    insight={note.insight} 
                    isLoading={loadingMarginNotes && note.id.startsWith('loading-')}
                  />
                </div>
              );
            })}
          </div>
          
          <ContentRelatedQuestions 
            questions={relatedQuestions}
            isLoading={loadingQuestions}
            onQuestionClick={handleQuestionClick}
          />
          
          <ContentHelperTip />
        </div>
      )}
      
      {/* Floating Selection Button */}
      <TextSelectionButton 
        position={selectionPosition}
        onInsightRequest={handleShowInsights}
        visible={showSelectionButton}
      />
      
      {/* AI Insights Dialog */}
      {topic && (
        <AIInsightsDialog
          selectedText={selectedText}
          open={showInsightsDialog}
          onOpenChange={handleDialogOpenChange}
          topic={topic}
          question={currentQuestion}
        />
      )}
    </div>
  );
};

export default ContentSection;
