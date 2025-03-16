
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
  const rootRefs = useRef<Map<string, { root: ReactDOM.Root, element: HTMLElement }>>(new Map());
  const isUnmounting = useRef(false);
  const cleanupTimeoutRef = useRef<number | null>(null);

  // Reset states when content changes
  useEffect(() => {
    setMarginNotes([]);
    setMarginNotesGenerated(false);
    setInsightsAdded(false);
    isUnmounting.current = false;
    
    // Clear any pending cleanup
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
      cleanupTimeoutRef.current = null;
    }
    
    return () => {
      isUnmounting.current = true;
      // Schedule cleanup for after this render cycle completes
      cleanupTimeoutRef.current = window.setTimeout(() => {
        safeCleanup();
      }, 100);
    };
  }, [content, topic]);
  
  const safeCleanup = () => {
    // Skip cleanup if component is already unmounting or being re-rendered
    if (isUnmounting.current) {
      console.log("Performing cleanup of React roots");
      
      // Use a more stable cleanup approach with setTimeout
      rootRefs.current.forEach(({ root, element }, id) => {
        try {
          // First unmount the React root
          root.unmount();
          
          // Then safely remove the DOM element if it still exists in the document
          if (element && document.body.contains(element) && element.parentNode) {
            setTimeout(() => {
              try {
                if (element.parentNode) {
                  element.parentNode.removeChild(element);
                }
              } catch (e) {
                console.error("Error removing DOM element during cleanup:", e);
              }
            }, 0);
          }
        } catch (e) {
          console.error(`Error during cleanup of React root ${id}:`, e);
        }
      });
      
      rootRefs.current.clear();
    }
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

  // Add insights inline to paragraphs - improved for stability
  useEffect(() => {
    if (!contentRef.current || marginNotes.length === 0 || insightsAdded || isUnmounting.current) return;
    
    // A longer delay to ensure DOM is fully rendered and stable
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
        marginNotes.forEach((note, index) => {
          if (isUnmounting.current) return;
          
          const paragraphFragment = note.paragraph.substring(0, 50).toLowerCase();
          const noteId = `note-${note.id}-${index}`;
          
          // Try to find a paragraph containing this fragment
          for (let i = 0; i < paragraphs.length; i++) {
            const paragraph = paragraphs[i];
            const paragraphText = paragraph.textContent?.toLowerCase() || '';
            
            if (paragraphText.includes(paragraphFragment)) {
              // Skip if this paragraph already has this note
              if (paragraph.querySelector(`[data-note-id="${noteId}"]`)) {
                continue;
              }
              
              // Add the insight button at the end of the paragraph
              paragraph.classList.add('has-margin-note');
              
              // Create a span to hold the insight button and ensure it's properly positioned
              const insightSpan = document.createElement('span');
              insightSpan.className = 'insight-indicator';
              insightSpan.setAttribute('data-note-id', noteId);
              insightSpan.style.display = 'inline-block';
              insightSpan.style.verticalAlign = 'middle';
              insightSpan.style.marginLeft = '8px';
              
              // Only proceed if paragraph still exists in DOM
              if (document.body.contains(paragraph)) {
                // Append the span to the paragraph
                paragraph.appendChild(insightSpan);
                
                // Use a unique key for each root to track it
                if (!isUnmounting.current) {
                  try {
                    const root = ReactDOM.createRoot(insightSpan);
                    rootRefs.current.set(noteId, { root, element: insightSpan });
                    root.render(<ContentMarginNote insight={note.insight} key={noteId} />);
                    notesAdded++;
                  } catch (error) {
                    console.error("Error rendering margin note:", error);
                  }
                }
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
    }, 800); // Increased timeout to ensure DOM stability
    
    return () => clearTimeout(timer);
  }, [marginNotes, content, insightsAdded]);

  return null; // This is a non-visual component
};

export default ContentMarginNotesRenderer;
