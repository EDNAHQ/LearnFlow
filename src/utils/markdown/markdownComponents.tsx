import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { processTextWithQuestions } from "./textProcessors";
import { KeyIdeaCard } from "@/components/content/blocks/KeyIdeaCard";
import { CheckpointCard } from "@/components/content/blocks/CheckpointCard";
import { DeepDiveAccordion } from "@/components/content/blocks/DeepDiveAccordion";
import { SummaryBullets } from "@/components/content/blocks/SummaryBullets";

export const getMarkdownComponents = (
  topic?: string,
  onInsightRequest?: (question: string) => void,
  concepts?: any[],
  onConceptClick?: (concept: string) => void
) => {
  return {
    h1: ({ node, ...props }) => (
      <h1 className="text-3xl font-bold mt-8 mb-6 text-gradient-purple border-b pb-3 border-brand-purple/20" {...props} />
    ),
    h2: ({ node, children, ...props }: any) => {
      const title = typeof children === 'string' ? children : 
                   Array.isArray(children) ? children.join('') : '';
      const id = `section-${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
      return (
        <h2 id={id} className="text-2xl font-bold mt-8 mb-5 text-brand-purple" {...props}>
          {children}
        </h2>
      );
    },
    h3: ({ node, children, ...props }: any) => {
      const title = typeof children === 'string' ? children : 
                   Array.isArray(children) ? children.join('') : '';
      const id = `section-${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
      return (
        <h3 id={id} className="text-xl font-semibold mt-7 mb-4 text-brand-purple/90" {...props}>
          {children}
        </h3>
      );
    },
    h4: ({ node, ...props }) => (
      <h4 className="text-lg font-semibold mt-6 mb-3 text-brand-purple/80" {...props} />
    ),
    p: ({ node, children, ...props }) => {
      // Process paragraph content for questions if needed
      if (topic && onInsightRequest) {
        let processedContent: React.ReactNode = children;

        // Check if we have a string to process
        if (typeof children === 'string') {
          // Process for questions
          processedContent = processTextWithQuestions(children, topic, onInsightRequest);
        }

        return (
          <p className="my-5 text-lg leading-relaxed text-pretty relative group" {...props}>
            {processedContent}
          </p>
        );
      }
      return <p className="my-5 text-lg leading-relaxed text-pretty relative group" {...props}>{children}</p>;
    },
    ul: ({ node, ...props }) => (
      <ul className="my-6 pl-6 space-y-3 list-disc" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="my-6 pl-6 space-y-3 list-decimal" {...props} />
    ),
    li: ({ node, children, ordered, ...props }) => {
      return <li className="pl-2 text-lg leading-relaxed mb-2" {...props}>{children}</li>;
    },
    blockquote: ({ node, ...props }) => (
      <blockquote className="border-l-4 border-brand-purple pl-6 py-3 my-6 bg-brand-purple/5 italic rounded-r-lg" {...props} />
    ),
    pre: ({ node, children, ...props }) => {
      // Extract code element from pre
      const codeElement = React.Children.toArray(children).find(
        (child: any) => child?.type === 'code'
      ) as any;

      if (codeElement) {
        const className = codeElement.props?.className || '';
        const match = /language-(\w+)/.exec(className);
        const code = String(codeElement.props?.children || '').replace(/\n$/, '');
        const language = match?.[1] || 'text';

        return (
          <div className="relative my-8 group">
            {/* Language tag */}
            {language && language !== 'text' && (
              <div className="absolute top-0 right-0 z-10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white bg-brand-purple/90 rounded-tl-lg rounded-br-lg">
                {language}
              </div>
            )}
            
            {/* Code block with enhanced styling */}
            <div className="relative overflow-hidden rounded-xl border border-brand-purple/20 shadow-xl bg-gray-900">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/5 via-transparent to-brand-pink/5 pointer-events-none" />
              <SyntaxHighlighter
                style={atomDark}
                language={language}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  padding: '1.5rem',
                  background: 'transparent',
                  fontSize: '0.95rem',
                  lineHeight: '1.7',
                }}
                showLineNumbers={code.split('\n').length > 5}
                wrapLines={false}
                {...props}
              >
                {code}
              </SyntaxHighlighter>
            </div>
            
            {/* Code review link */}
            <div className="mt-3 flex items-center justify-end">
              <a
                href="https://mentor.enterprisedna.co/code-explainer"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-brand-purple hover:text-brand-pink transition-colors underline font-medium"
              >
                Review this code on Mentor
              </a>
            </div>
          </div>
        );
      }

      // Fallback for pre without code
      return <pre className="my-6 p-4 bg-gray-100 rounded-lg overflow-x-auto" {...props}>{children}</pre>;
    },
    code: ({ node, inline, className, children, ...props }) => {
      // Inline code
      if (inline) {
        return (
          <code className="px-2 py-1 rounded-md bg-brand-purple/10 font-mono text-brand-pink text-sm border border-brand-purple/20" {...props}>
            {children}
          </code>
        );
      }
      
      // Block code (handled by pre component)
      return <code className={className} {...props}>{children}</code>;
    },
    a: ({ node, children, href, ...props }) => {
      // Check if this is an "Explore Further" link (starts with #)
      if (href?.startsWith('#') && onInsightRequest) {
        const questionText = typeof children === 'string' ? children :
                           Array.isArray(children) ? children.join('') : '';
        return (
          <button
            onClick={(e) => {
              e.preventDefault();
              onInsightRequest(questionText);
            }}
            className="text-brand-purple hover:text-brand-pink underline transition-colors cursor-pointer text-left"
            {...props}
          >
            {children}
          </button>
        );
      }
      return <a href={href} className="text-brand-purple hover:text-brand-pink underline transition-colors" {...props}>{children}</a>;
    },
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
    tbody: ({ node, ...props }) => (
      <tbody {...props} />
    ),
    tr: ({ node, ...props }) => (
      <tr className="hover:bg-gray-50" {...props} />
    ),
    div: ({ node, children, ...props }: any) => {
      // Handle custom blocks with data-custom-block attribute
      const blockType = node?.properties?.['data-custom-block'];
      
      if (blockType) {
        // Extract raw markdown content from AST node children
        // This preserves markdown syntax before it's converted to React elements
        let content: string = '';
        
        if (node?.children && Array.isArray(node.children)) {
          // Extract raw markdown content from AST children
          // This preserves markdown syntax like **bold** before it's converted
          const extractFromAST = (astChildren: any[]): string => {
            return astChildren.map((child: any) => {
              if (child.type === 'text') {
                // Text nodes contain the raw markdown
                return child.value || '';
              }
              if (child.type === 'element') {
                // For HTML elements, reconstruct markdown syntax
                const tagName = child.tagName || '';
                const innerContent = child.children ? extractFromAST(child.children) : '';
                
                // Reconstruct common markdown patterns
                if (tagName === 'strong' || tagName === 'b') {
                  return `**${innerContent}**`;
                }
                if (tagName === 'em' || tagName === 'i') {
                  return `*${innerContent}*`;
                }
                if (tagName === 'code') {
                  return `\`${innerContent}\``;
                }
                if (tagName === 'p') {
                  return innerContent;
                }
                // For other elements, just return inner content
                return innerContent;
              }
              return '';
            }).join('');
          };
          content = extractFromAST(node.children).trim();
        } else if (typeof children === 'string') {
          content = children;
        } else if (Array.isArray(children)) {
          // Fallback: extract text from React children
          const extractText = (child: any): string => {
            if (typeof child === 'string') return child;
            if (typeof child === 'number') return String(child);
            if (React.isValidElement(child)) {
              if (child.props?.children) {
                return extractText(child.props.children);
              }
            }
            return '';
          };
          content = children.map(extractText).join('').trim();
        } else if (children) {
          content = String(children).trim();
        }

        // Render appropriate block component with markdown content
        switch (blockType) {
          case 'key-idea':
            return <KeyIdeaCard>{content}</KeyIdeaCard>;
          case 'checkpoint':
            return <CheckpointCard>{content}</CheckpointCard>;
          case 'deep-dive':
            return <DeepDiveAccordion>{content}</DeepDiveAccordion>;
          case 'summary':
            return <SummaryBullets>{content}</SummaryBullets>;
          default:
            return <div {...props}>{children}</div>;
        }
      }
      
      // Default div rendering
      return <div {...props}>{children}</div>;
    },
  };
};
