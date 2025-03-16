
import { useEffect, useState, useRef } from "react";
import { createPortal } from 'react-dom';
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
  const [paragraphsWithNotes, setParagraphsWithNotes] = useState<Map<HTMLElement, MarginNote>>(new Map());
  const [renderPortals, setRenderPortals] = useState(false);
  const isUnmounting = useRef(false);

  // Reset states when content changes
  useEffect(() => {
    setMarginNotes([]);
    setMarginNotesGenerated(false);
    setParagraphsWithNotes(new Map());
    setRenderPortals(false);
    isUnmounting.current = false;

    return () => {
      isUnmounting.current = true;
    };
  }, [content, topic]);

  // Generate margin notes once content is loaded
  const generateContentMarginNotes = async () => {
    if (!content || !topic || marginNotesGenerated || loadingMarginNotes || isUnmounting.current) {
      return;
    }
    
    setLoadingMarginNotes(true);
    try {
      console.log(`Generating margin notes for: ${topic}`);
      
      const notes = await generateMarginNotes(content, topic);
      
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

  // Find paragraphs for notes and prepare for portal rendering
  useEffect(() => {
    if (!contentRef.current || marginNotes.length === 0 || isUnmounting.current || paragraphsWithNotes.size > 0) return;
    
    const timer = setTimeout(() => {
      if (isUnmounting.current || !contentRef.current) return;
      
      const contentDiv = contentRef.current;
      // Find all paragraphs in the content
      const paragraphs = contentDiv.querySelectorAll('p');
      if (paragraphs.length === 0) return;
      
      const newParagraphsWithNotes = new Map<HTMLElement, MarginNote>();
      
      // For each margin note, find a matching paragraph
      marginNotes.forEach((note) => {
        if (isUnmounting.current) return;
        
        const paragraphFragment = note.paragraph.substring(0, 50).toLowerCase();
        
        // Try to find a paragraph containing this fragment
        for (let i = 0; i < paragraphs.length; i++) {
          const paragraph = paragraphs[i];
          const paragraphText = paragraph.textContent?.toLowerCase() || '';
          
          if (paragraphText.includes(paragraphFragment)) {
            // Skip if this paragraph already has a note
            if ([...newParagraphsWithNotes.keys()].includes(paragraph)) {
              continue;
            }
            
            // Add the paragraph and note to our Map
            newParagraphsWithNotes.set(paragraph, note);
            paragraph.classList.add('has-margin-note');
            
            // Create a span to hold the portal
            const insightSpan = document.createElement('span');
            insightSpan.className = 'insight-indicator';
            insightSpan.setAttribute('data-note-id', note.id);
            paragraph.appendChild(insightSpan);
            
            break;
          }
        }
      });
      
      setParagraphsWithNotes(newParagraphsWithNotes);
      setRenderPortals(true);
      
    }, 500);
    
    return () => clearTimeout(timer);
  }, [marginNotes, contentRef]);

  // Render portals for each paragraph with a note
  if (!renderPortals) return null;

  return (
    <>
      {Array.from(paragraphsWithNotes.entries()).map(([paragraph, note]) => {
        // Find the insight span we created
        const insightSpan = paragraph.querySelector(`.insight-indicator[data-note-id="${note.id}"]`);
        
        // Only render if the span exists in the DOM
        if (insightSpan && document.body.contains(insightSpan)) {
          return createPortal(
            <ContentMarginNote insight={note.insight} key={note.id} />,
            insightSpan
          );
        }
        return null;
      })}
    </>
  );
};

export default ContentMarginNotesRenderer;
