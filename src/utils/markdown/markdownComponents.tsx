import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { processTextWithQuestions } from "./textProcessors";
import { processTextWithConcepts } from "./conceptProcessor";

export const getMarkdownComponents = (
  topic?: string, 
  onInsightRequest?: (question: string) => void,
  concepts?: any[],
  onConceptClick?: (concept: string) => void
) => {
  return {
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
      if (topic && onInsightRequest) {
        let processedContent: React.ReactNode = children;
        
        // Check if we have a string to process
        if (typeof children === 'string') {
          // Process for questions first if onInsightRequest is available
          processedContent = processTextWithQuestions(children, topic, onInsightRequest);
          
          // Then try to add concept links if we have concepts and a click handler
          if (typeof processedContent === 'string' && concepts && concepts.length > 0 && onConceptClick) {
            processedContent = processTextWithConcepts(processedContent, concepts, onConceptClick);
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
  };
};
