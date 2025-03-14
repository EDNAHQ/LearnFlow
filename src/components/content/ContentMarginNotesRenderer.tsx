
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import ReactDOM from 'react-dom';
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

  // Generate margin notes once content is loaded
  const generateContentMarginNotes = async () => {
    if (!content || !topic || marginNotesGenerated || loadingMarginNotes) {
      return;
    }
    
    setLoadingMarginNotes(true);
    try {
      console.log(`Generating margin notes for: ${topic}`);
      
      const notes = await generateMarginNotes(content, topic);
      
      console.log(`Generated ${notes.length} margin notes for: ${topic}`);
      
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
  };

  // Trigger margin notes generation once content is loaded
  useEffect(() => {
    if (content && topic) {
      if (!marginNotesGenerated && !loadingMarginNotes) {
        generateContentMarginNotes();
      }
    }
  }, [content, topic, marginNotesGenerated, loadingMarginNotes]);

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
            
            // Append the span to the paragraph
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
  }, [marginNotes, content, insightsAdded]);

  return null; // This is a non-visual component
};

export default ContentMarginNotesRenderer;
