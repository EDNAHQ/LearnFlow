import React, { useEffect, useState, useCallback } from "react";
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
import { toast } from "sonner";
import ReactDOM from 'react-dom';

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
  const [insightsAdded, setInsightsAdded] = useState(false);
  
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
    setInsightsAdded(false);
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

  // Create DOM references to the content for processing
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Generate margin notes once content is loaded
  const generateContentMarginNotes = useCallback(async () => {
    if (!loadedDetailedContent || !topic || marginNotesGenerated || loadingMarginNotes) {
      return;
    }
    
    setLoadingMarginNotes(true);
    try {
      console.log(`Generating margin notes for: ${title}`);
      
      const notes = await generateMarginNotes(loadedDetailedContent, topic);
      
      console.log(`Generated ${notes.length} margin notes for: ${title}`);
      
      if (notes.length > 0) {
        setMarginNotes(notes);
        toast.success(`${notes.length} AI insights added to enhance your learning`, {
          position: "bottom-right",
        });
      } else {
        setMarginNotes([]);
      }
    } catch (error) {
      console.error("Error generating margin notes:", error);
      setMarginNotes([]);
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

  // Add insights inline to paragraphs
  useEffect(() => {
    if (!contentRef.current || marginNotes.length === 0 || insightsAdded) return;
    
    const addInsightsToContent = () => {
      const contentDiv = contentRef.current;
      if (!contentDiv) return;
      
      // Find all paragraphs in the content
      const paragraphs = contentDiv.querySelectorAll('p');
      if (paragraphs.length === 0) return;
      
      let notesAdded = 0;
      
      // For each margin note, find a matching paragraph and add the insight button
      marginNotes.forEach((note) => {
        const paragraphFragment = note.paragraph.substring(0, 50).toLowerCase();
        
        // Try to find a paragraph containing this fragment
        for (let i = 0; i < paragraphs.length; i++) {
          const paragraph = paragraphs[i];
          const paragraphText = paragraph.textContent?.toLowerCase() || '';
          
          if (paragraphText.includes(paragraphFragment)) {
            // Add the insight button at the end of the paragraph
            paragraph.classList.add('has-margin-note');
            
            // Create a span to hold the insight button
            const insightSpan = document.createElement('span');
            insightSpan.className = 'insight-indicator';
            
            // Render our React component into this span
            paragraph.appendChild(insightSpan);
            
            // Use React to render the ContentMarginNote component
            const root = React.createElement(ContentMarginNote, { 
              insight: note.insight, 
              key: note.id 
            });
            
            // Render the component
            ReactDOM.render(root, insightSpan);
            
            notesAdded++;
            break;
          }
        }
      });
      
      console.log(`Added ${notesAdded} insight indicators to content`);
      setInsightsAdded(true);
    };
    
    // Short delay to ensure content is fully rendered
    setTimeout(addInsightsToContent, 500);
  }, [marginNotes, loadedDetailedContent, insightsAdded]);

  // Use a different approach with React.createElement
  const renderContentWithInsights = useCallback(() => {
    if (!loadedDetailedContent) return null;
    
    // Process content and insert insight buttons
    const contentHtml = formatContent(loadedDetailedContent, topic, handleQuestionClick);
    
    // After content is rendered, process it to add insights
    useEffect(() => {
      if (marginNotes.length > 0 && contentRef.current && !insightsAdded) {
        const addInsights = () => {
          const paragraphs = contentRef.current?.querySelectorAll('p');
          if (!paragraphs || paragraphs.length === 0) return;
          
          marginNotes.forEach(note => {
            const searchText = note.paragraph.substring(0, 50).toLowerCase();
            
            for (const p of Array.from(paragraphs)) {
              const text = p.textContent?.toLowerCase() || '';
              if (text.includes(searchText)) {
                p.classList.add('has-margin-note');
                
                // Create container for the insight button
                const span = document.createElement('span');
                span.className = 'insight-indicator';
                p.appendChild(span);
                
                // Render React component into the container
                const insightElement = document.createElement('div');
                span.appendChild(insightElement);
                
                // Create a temporary container for the React component
                const tempDiv = document.createElement('div');
                ReactDOM.render(
                  <ContentMarginNote insight={note.insight} />,
                  tempDiv
                );
                
                // Move the rendered content to our target
                while (tempDiv.firstChild) {
                  insightElement.appendChild(tempDiv.firstChild);
                }
                
                break;
              }
            }
          });
          
          setInsightsAdded(true);
        };
        
        setTimeout(addInsights, 500);
      }
    }, [marginNotes, insightsAdded]);
    
    return (
      <div 
        className="content-section"
        ref={contentRef}
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    );
  }, [loadedDetailedContent, topic, marginNotes, insightsAdded, handleQuestionClick]);

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
            className="content-section relative"
            ref={contentRef}
            dangerouslySetInnerHTML={{ __html: formatContent(loadedDetailedContent, topic, handleQuestionClick) }}
          />
          
          {/* After content is rendered, find paragraphs and add insights */}
          {marginNotes.length > 0 && (
            <div className="hidden">
              {marginNotes.map(note => (
                <ContentMarginNote key={note.id} insight={note.insight} />
              ))}
            </div>
          )}
          
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
