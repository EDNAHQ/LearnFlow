
import React from "react";
import ConceptLink from "@/components/content/concepts/ConceptLink";
import { escapeRegExp } from "./textProcessors";

// Process text with concept links
export const processTextWithConcepts = (
  text: string, 
  concepts: any[], 
  onConceptClick: (concept: string) => void
): React.ReactNode => {
  if (!concepts || concepts.length === 0) {
    console.log("No concepts provided for highlighting");
    return text;
  }
  
  console.log(`Processing text with ${concepts.length} concepts`);
  
  // Sort concepts by length (longest first) to avoid nested replacements
  const sortedConcepts = [...concepts].sort((a, b) => b.term.length - a.term.length);
  
  // Track which concepts we've already processed to avoid duplicates
  const processedTerms = new Set();
  let replacementsCount = 0;
  
  // Process the text
  let processedText = text;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  // Find all positions where concepts appear in the text
  const positions: {start: number, end: number, concept: any}[] = [];
  
  for (const concept of sortedConcepts) {
    const conceptTerm = concept.term;
    
    // Skip empty, very short terms, or already processed terms
    if (!conceptTerm || conceptTerm.length < 3 || processedTerms.has(conceptTerm.toLowerCase())) {
      continue;
    }
    
    // Look for the concept term in the text (case insensitive)
    const regex = new RegExp(`\\b${escapeRegExp(conceptTerm)}\\b`, 'gi');
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      positions.push({
        start: match.index,
        end: match.index + match[0].length,
        concept
      });
      
      // Mark as processed to avoid duplicates
      processedTerms.add(conceptTerm.toLowerCase());
    }
  }
  
  // Sort positions by start index
  positions.sort((a, b) => a.start - b.start);
  
  // Build the final text with concept links
  for (let i = 0; i < positions.length; i++) {
    const { start, end, concept } = positions[i];
    
    // Skip if this position overlaps with a previous one
    if (i > 0 && start < positions[i-1].end) {
      continue;
    }
    
    // Add text before this concept
    if (start > lastIndex) {
      parts.push(text.substring(lastIndex, start));
    }
    
    // Add the concept link
    parts.push(
      <ConceptLink
        key={`concept-${replacementsCount}`}
        term={concept.term}
        definition={concept.definition}
        relatedConcepts={concept.relatedConcepts}
        onRelatedConceptClick={onConceptClick}
      >
        {text.substring(start, end)}
      </ConceptLink>
    );
    
    lastIndex = end;
    replacementsCount++;
  }
  
  // Add any remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  // If no replacements were made, return the original text
  if (replacementsCount === 0) {
    console.log("No concept replacements were made in the text");
    return text;
  }
  
  console.log(`Made ${replacementsCount} concept replacements`);
  
  return <>{parts}</>;
};
