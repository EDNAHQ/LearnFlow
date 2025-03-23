
import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { HelpCircle } from "lucide-react";
import ConceptLink from "@/components/content/ConceptLink";

// Helper component for question prompts
const QuestionPrompt = ({ 
  questionText, 
  topic,
  onInsightRequest 
}: { 
  questionText: string; 
  topic: string;
  onInsightRequest: (question: string) => void;
}) => {
  return (
    <span 
      className="inline-flex items-center text-[#6D42EF] underline cursor-pointer gap-1 group"
      onClick={() => onInsightRequest(questionText)}
    >
      {questionText}
      <HelpCircle className="h-3.5 w-3.5 inline-block opacity-70 group-hover:opacity-100" />
    </span>
  );
};

// Function to process text and identify potential question prompts
const processTextWithQuestions = (text: string, topic: string, onInsightRequest: (question: string) => void): React.ReactNode => {
  // This regex looks for text patterns that are likely to be questions
  // It matches text ending with "?" that is between 15-100 characters
  const questionRegex = /(\b[^.!?]{15,100}\?)/g;
  
  if (!questionRegex.test(text)) {
    return text;
  }
  
  // Replace questions with the interactive component
  const parts = text.split(questionRegex);
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 1) { // This is a question part
          return (
            <QuestionPrompt 
              key={i} 
              questionText={part} 
              topic={topic}
              onInsightRequest={onInsightRequest} 
            />
          );
        }
        return part;
      })}
    </>
  );
};

// Process text with concept links
const processTextWithConcepts = (text: string, concepts: any[], onConceptClick: (concept: string) => void): React.ReactNode => {
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

// Helper function to escape special regex characters
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

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

  return (
    <ReactMarkdown
      components={{
        h1: ({ node, ...props }) => (
          <h1 className="text-3xl font-bold mt-8 mb-4 text-gradient-purple border-b pb-2 border-brand-purple/20" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-2xl font-bold mt-7 mb-4 text-brand-purple" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-xl font-semibold mt-6 mb-3 text-brand-purple/90" {...props} />
        ),
        h4: ({ node, ...props }) => (
          <h4 className="text-lg font-semibold mt-5 mb-2 text-brand-purple/80" {...props} />
        ),
        p: ({ node, children, ...props }) => {
          // Process paragraph content for questions and concepts if needed
          if (topic && onInsightRequest && concepts && concepts.length > 0 && onConceptClick) {
            let processedContent: React.ReactNode = children;
            
            // Check if we have a string to process
            if (typeof children === 'string') {
              console.log(`Processing paragraph text (${children.length} chars) with ${concepts.length} concepts`);
              
              // First try to add concept links
              processedContent = processTextWithConcepts(children, concepts, onConceptClick);
              
              // If it's still a string (no concept matches were found), process for questions
              if (typeof processedContent === 'string') {
                processedContent = processTextWithQuestions(processedContent, topic, onInsightRequest);
              }
            }
            
            return (
              <p className="my-4 text-lg leading-relaxed text-pretty relative group" {...props}>
                {processedContent}
              </p>
            );
          }
          return <p className="my-4 text-lg leading-relaxed text-pretty relative group" {...props}>{children}</p>;
        },
        ul: ({ node, ...props }) => (
          <ul className="my-5 pl-6 space-y-3 list-disc" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="my-5 pl-6 space-y-3 list-decimal" {...props} />
        ),
        li: ({ node, children, ...props }) => {
          // Also process list items for concepts
          if (topic && concepts && concepts.length > 0 && onConceptClick && typeof children === 'string') {
            const withConcepts = processTextWithConcepts(children, concepts, onConceptClick);
            return (
              <li className="pl-2 text-lg leading-relaxed" {...props}>{withConcepts}</li>
            );
          }
          return <li className="pl-2 text-lg leading-relaxed" {...props}>{children}</li>;
        },
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-4 border-brand-purple pl-5 py-2 my-5 bg-brand-purple/5 italic rounded-r-lg" {...props} />
        ),
        code: ({ node, inline, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <div className="relative">
              {match[1] && (
                <div className="language-tag">
                  {match[1].toUpperCase()}
                </div>
              )}
              <SyntaxHighlighter
                style={atomDark}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-brand-pink text-sm" {...props}>
              {children}
            </code>
          );
        },
        a: ({ node, ...props }) => (
          <a className="text-brand-purple hover:text-brand-pink underline transition-colors" {...props} />
        ),
        img: ({ node, ...props }) => (
          <img className="rounded-lg border border-gray-200 shadow-sm my-4 max-w-full mx-auto" {...props} />
        ),
        hr: ({ node, ...props }) => (
          <hr className="my-8 border-t-2 border-brand-purple/20 rounded-full" {...props} />
        ),
        table: ({ node, ...props }) => (
          <div className="my-6 overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200" {...props} />
          </div>
        ),
        thead: ({ node, ...props }) => (
          <thead className="bg-brand-purple/10" {...props} />
        ),
        th: ({ node, ...props }) => (
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-purple" {...props} />
        ),
        td: ({ node, ...props }) => (
          <td className="px-4 py-3 text-sm border-t border-gray-100" {...props} />
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
};
