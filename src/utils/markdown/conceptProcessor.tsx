
import React from "react";
import ConceptLink from "@/components/content/ConceptLink";
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
  
  // Create a map for the replacements
  const parts: React.ReactNode[] = [];
  let currentText = text;
  let lastIndex = 0;
  
  // Process each concept
  for (const concept of sortedConcepts) {
    const conceptTerm = concept.term;
    
    // Skip empty, very short terms, or already processed terms
    if (!conceptTerm || conceptTerm.length < 3 || processedTerms.has(conceptTerm.toLowerCase())) {
      continue;
    }
    
    // Create a regex that matches the concept term with word boundaries
    const regex = new RegExp(`\\b${escapeRegExp(conceptTerm)}\\b`, 'i');
    const match = currentText.match(regex);
    
    if (match && match.index !== undefined) {
      // Add the text before the match
      if (match.index > lastIndex) {
        parts.push(currentText.substring(lastIndex, match.index));
      }
      
      // Add the concept component
      parts.push(
        <ConceptLink
          key={`concept-${replacementsCount}`}
          term={concept.term}
          definition={concept.definition}
          relatedConcepts={concept.relatedConcepts}
          onRelatedConceptClick={onConceptClick}
        >
          {match[0]}
        </ConceptLink>
      );
      
      // Update lastIndex to after the match
      lastIndex = match.index + match[0].length;
      replacementsCount++;
      
      // Mark this term as processed
      processedTerms.add(conceptTerm.toLowerCase());
    }
  }
  
  // Add any remaining text
  if (lastIndex < currentText.length) {
    parts.push(currentText.substring(lastIndex));
  }
  
  // If no replacements were made, return the original text
  if (replacementsCount === 0) {
    console.log("No concept replacements were made in the text");
    return text;
  }
  
  console.log(`Made ${replacementsCount} concept replacements`);
  
  return <>{parts}</>;
};
