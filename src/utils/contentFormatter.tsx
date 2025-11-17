
import React from "react";
import SafeReactMarkdown from "@/components/ui/SafeReactMarkdown";
import remarkGfm from "remark-gfm";
import { getMarkdownComponents } from "./markdown/markdownComponents";
import { preprocessContent } from "./markdown/contentPreprocessor";

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

  // Preprocess content to detect and format code blocks
  const processedText = preprocessContent(text);

  // Debug logging for concepts
  if (concepts && concepts.length > 0) {
    console.log(`formatContent received ${concepts.length} concepts for highlighting`);
  }

  // Get the markdown components with all required handlers
  const components = getMarkdownComponents(topic, onInsightRequest, concepts, onConceptClick);

  return (
    <SafeReactMarkdown 
      remarkPlugins={[remarkGfm]}
      components={components}
    >
      {processedText}
    </SafeReactMarkdown>
  );
};
