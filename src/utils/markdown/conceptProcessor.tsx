
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
  
  console.log("Processing text with concepts:", concepts.map(c => c.term));
  console.log("Text length:", text.length);
  
  // Sort concepts by length (longest first) to avoid nested replacements
  const sortedConcepts = [...concepts].sort((a, b) => b.term.length - a.term.length);
  
  let processedText = text;
  let placeholders: {[key: string]: React.ReactNode} = {};
  let placeholderCounter = 0;
  let replacementsCount = 0;
  
  for (const concept of sortedConcepts) {
    const conceptTerm = concept.term;
    
    // Skip empty or very short terms
    if (!conceptTerm || conceptTerm.length < 3) {
      console.log(`Skipping concept "${conceptTerm}" - too short`);
      continue;
    }
    
    // Check for exact matches first (case-sensitive)
    if (processedText.includes(conceptTerm)) {
      console.log(`Found exact match for concept: "${conceptTerm}"`);
      
      const placeholder = `__CONCEPT_PLACEHOLDER_${placeholderCounter++}__`;
      
      placeholders[placeholder] = (
        <ConceptLink
          key={concept.id || `concept-${placeholderCounter}`}
          term={concept.term}
          definition={concept.definition}
          relatedConcepts={concept.relatedConcepts}
          onRelatedConceptClick={onConceptClick}
        >
          {conceptTerm}
        </ConceptLink>
      );
      
      // Replace only the first occurrence
      processedText = processedText.replace(conceptTerm, placeholder);
      replacementsCount++;
      continue;
    }
    
    // Try case-insensitive match as fallback
    const caseInsensitiveRegex = new RegExp(`\\b${escapeRegExp(conceptTerm)}\\b`, 'i');
    const match = processedText.match(caseInsensitiveRegex);
    
    if (match && match[0]) {
      console.log(`Found case-insensitive match for "${conceptTerm}": "${match[0]}"`);
      
      const placeholder = `__CONCEPT_PLACEHOLDER_${placeholderCounter++}__`;
      
      placeholders[placeholder] = (
        <ConceptLink
          key={concept.id || `concept-${placeholderCounter}`}
          term={concept.term}
          definition={concept.definition}
          relatedConcepts={concept.relatedConcepts}
          onRelatedConceptClick={onConceptClick}
        >
          {match[0]}
        </ConceptLink>
      );
      
      // Replace only the first occurrence
      processedText = processedText.replace(match[0], placeholder);
      replacementsCount++;
    } else {
      console.log(`No match found for concept: "${conceptTerm}"`);
    }
  }
  
  // If no replacements were made, return the original text
  if (replacementsCount === 0) {
    console.log("No concept replacements were made in the text");
    return text;
  }
  
  console.log(`Made ${replacementsCount} concept replacements`);
  
  // Replace all placeholders with their corresponding components
  const parts = processedText.split(/(\_\_CONCEPT\_PLACEHOLDER\_\d+\_\_)/);
  
  return (
    <>
      {parts.map((part, i) => {
        if (placeholders[part]) {
          return placeholders[part];
        }
        return part;
      })}
    </>
  );
};
