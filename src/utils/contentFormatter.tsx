
import React from "react";
import ReactMarkdown from "react-markdown";
import { getMarkdownComponents } from "./markdown/markdownComponents";

export const formatContent = (
  text: string, 
  topic?: string, 
  onInsightRequest?: (question: string) => void,
  concepts?: any[],
  onConceptClick?: (concept: string) => void
): React.ReactNode => {
  // Ensure text is actually a string
  if (typeof text !== 'string') {
    console.error("formatContent received non-string input:", text);
    text = String(text || "Content could not be displayed properly");
  }

  // Debug logging for concepts
  if (concepts && concepts.length > 0) {
    console.log(`formatContent received ${concepts.length} concepts for highlighting`);
  }

  // Get the markdown components with all required handlers
  const components = getMarkdownComponents(topic, onInsightRequest, concepts, onConceptClick);

  return (
    <ReactMarkdown components={components}>
      {text}
    </ReactMarkdown>
  );
};
