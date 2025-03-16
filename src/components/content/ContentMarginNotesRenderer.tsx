
import { useEffect, useState, useRef } from "react";
import ReactDOM from 'react-dom/client';
import ContentMarginNote from "@/components/ContentMarginNote";
import { MarginNote, generateMarginNotes } from "@/utils/marginNotesUtils";

interface ContentMarginNotesRendererProps {
  content: string;
  topic: string;
  contentRef: React.RefObject<HTMLDivElement>;
}

const ContentMarginNotesRenderer = ({ content, topic, contentRef }: ContentMarginNotesRendererProps) => {
  const [marginNotes, setMarginNotes] = useState<MarginNote[]>([]);
  const [loadingMarginNotes, setLoadingMarginNotes] = useState(false);
  const [marginNotesGenerated, setMarginNotesGenerated] = useState(false);
  const [insightsAdded, setInsightsAdded] = useState(false);
  const rootRefs = useRef<Map<HTMLElement, ReactDOM.Root>>(new Map());
  const isUnmounting = useRef(false);

  // Reset states when content changes
  useEffect(() => {
    setMarginNotes([]);
    setMarginNotesGenerated(false);
    setInsightsAdded(false);
    isUnmounting.current = false;
    
    // Safe cleanup of previous React roots
    if (rootRefs.current.size > 0) {
      safeCleanup();
    }
    
    return () => {
      isUnmounting.current = true;
      // Defer cleanup to next tick to avoid React rendering conflicts
      setTimeout(() => {
        safeCleanup();
      }, 0);
    };
  }, [content, topic]);
  
  const safeCleanup = () => {
    // Unmount all React roots to prevent memory leaks
    rootRefs.current.forEach((root, element) => {
      try {
        root.unmount();
        // Only attempt DOM operations if the element is still in the document
        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
        }
      } catch (e) {
        console.error("Error during cleanup of React root:", e);
      }
    });
    rootRefs.current.clear();
  };

  // Generate margin notes once content is loaded
  const generateContentMarginNotes = async () => {
    if (!content || !topic || marginNotesGenerated || loadingMarginNotes || isUnmounting.current) {
      return;
    }
    
    setLoadingMarginNotes(true);
    try {
      console.log(`Generating margin notes for: ${topic}`);
      
      const notes = await generateMarginNotes(content, topic);
      
      // Check if component is still mounted before updating state
      if (isUnmounting.current) return;
      
      console.log(`Generated ${notes.length} margin notes for: ${topic}`);
      
      if (notes.length > 0) {
        setMarginNotes(notes);
      } else {
        setMarginNotes([]);
      }
    } catch (error) {
      console.error("Error generating margin notes:", error);
      if (!isUnmounting.current) {
        setMarginNotes([]);
      }
    } finally {
      if (!isUnmounting.current) {
        setLoadingMarginNotes(false);
        setMarginNotesGenerated(true);
      }
    }
  };

  // Trigger margin notes generation once content is loaded
  useEffect(() => {
    if (content && topic) {
      if (!marginNotesGenerated && !loadingMarginNotes && !isUnmounting.current) {
        // Small delay to ensure content is stable before generating notes
        const timer = setTimeout(() => {
          generateContentMarginNotes();
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [content, topic, marginNotesGenerated, loadingMarginNotes]);

  // Add insights inline to paragraphs - improved for cross-device compatibility
  useEffect(() => {
    if (!contentRef.current || marginNotes.length === 0 || insightsAdded || isUnmounting.current) return;
    
    // Defer adding insights to avoid React rendering conflicts
    const timer = setTimeout(() => {
      if (isUnmounting.current) return;
      
      const addInsightsToContent = () => {
        const contentDiv = contentRef.current;
        if (!contentDiv || isUnmounting.current) return;
        
        // Find all paragraphs in the content
        const paragraphs = contentDiv.querySelectorAll('p');
        if (paragraphs.length === 0) return;
        
        let notesAdded = 0;
        
        // For each margin note, find a matching paragraph and add the insight button
        marginNotes.forEach((note) => {
          if (isUnmounting.current) return;
          
          const paragraphFragment = note.paragraph.substring(0, 50).toLowerCase();
          
          // Try to find a paragraph containing this fragment
          for (let i = 0; i < paragraphs.length; i++) {
            const paragraph = paragraphs[i];
            const paragraphText = paragraph.textContent?.toLowerCase() || '';
            
            if (paragraphText.includes(paragraphFragment)) {
              // Add the insight button at the end of the paragraph
              paragraph.classList.add('has-margin-note');
              
              // Create a span to hold the insight button and ensure it's properly positioned
              const insightSpan = document.createElement('span');
              insightSpan.className = 'insight-indicator';
              insightSpan.style.display = 'inline-block';
              insightSpan.style.verticalAlign = 'middle';
              insightSpan.style.marginLeft = '8px';
              
              // Append the span to the paragraph
              paragraph.appendChild(insightSpan);
              
              // Use ReactDOM.createRoot instead of the deprecated render method
              try {
                if (!isUnmounting.current) {
                  const root = ReactDOM.createRoot(insightSpan);
                  rootRefs.current.set(insightSpan, root);
                  root.render(<ContentMarginNote insight={note.insight} key={note.id} />);
                  notesAdded++;
                }
              } catch (error) {
                console.error("Error rendering margin note:", error);
              }
              
              break;
            }
          }
        });
        
        if (!isUnmounting.current) {
          console.log(`Added ${notesAdded} insight indicators to content`);
          setInsightsAdded(true);
        }
      };
      
      addInsightsToContent();
    }, 800);
    
    return () => clearTimeout(timer);
  }, [marginNotes, content, insightsAdded]);

  return null; // This is a non-visual component
};

export default ContentMarginNotesRenderer;
