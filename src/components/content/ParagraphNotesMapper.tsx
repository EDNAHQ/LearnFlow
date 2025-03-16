
import { useState, useEffect, useRef } from "react";
import { MarginNote } from "@/utils/marginNotesUtils";

interface ParagraphNotesMapperProps {
  contentRef: React.RefObject<HTMLDivElement>;
  marginNotes: MarginNote[];
  onMapComplete: (paragraphMap: Map<HTMLElement, MarginNote>) => void;
}

const ParagraphNotesMapper = ({ contentRef, marginNotes, onMapComplete }: ParagraphNotesMapperProps) => {
  const isUnmounting = useRef(false);
  const mappingComplete = useRef(false);
  
  useEffect(() => {
    return () => {
      isUnmounting.current = true;
    };
  }, []);

  // Reset mapping state when notes change
  useEffect(() => {
    mappingComplete.current = false;
  }, [marginNotes]);

  // Find paragraphs for notes and prepare for portal rendering
  useEffect(() => {
    // Skip if already mapped, content ref is missing, or no margin notes
    if (mappingComplete.current || !contentRef.current || marginNotes.length === 0 || isUnmounting.current) return;
    
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
          
          // Skip if this paragraph already has a note
          if (paragraph.classList.contains('has-margin-note')) {
            continue;
          }
          
          if (paragraphText.includes(paragraphFragment)) {
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
      
      // Mark mapping as complete to prevent multiple mappings
      mappingComplete.current = true;
      onMapComplete(newParagraphsWithNotes);
      
    }, 500);
    
    return () => clearTimeout(timer);
  }, [marginNotes, contentRef, onMapComplete]);

  return null;
};

export default ParagraphNotesMapper;
