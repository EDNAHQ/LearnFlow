
import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export const formatContent = (text: string) => {
  return (
    <ReactMarkdown
      components={{
        h1: ({ node, ...props }) => (
          <h1 className="text-2xl font-bold mt-8 mb-4 text-gradient-purple" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-xl font-bold mt-6 mb-3 text-brand-purple" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-lg font-semibold mt-5 mb-2 text-brand-purple/90" {...props} />
        ),
        p: ({ node, ...props }) => (
          <p className="my-4 text-lg leading-relaxed text-pretty" {...props} />
        ),
        ul: ({ node, ...props }) => (
          <ul className="my-4 pl-5 space-y-2" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="my-4 pl-5 space-y-2 list-decimal" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="flex items-start text-lg" {...props}>
            <span className="inline-block text-brand-purple mr-2">•</span>
            <span>{props.children}</span>
          </li>
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-4 border-brand-purple pl-4 py-2 my-4 bg-brand-purple/5 rounded-r-lg" {...props} />
        ),
        code: ({ node, inline, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <div className="relative my-6">
              <div className="absolute -top-3 left-3 px-3 py-0.5 bg-brand-dark text-xs font-semibold text-white rounded-t-md border-t border-l border-r border-brand-purple/30">
                {match[1].toUpperCase()}
              </div>
              <SyntaxHighlighter
                style={atomDark}
                language={match[1]}
                PreTag="div"
                className="rounded-lg border border-brand-purple/30 shadow-lg"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className="px-1.5 py-0.5 rounded bg-gray-800 font-mono text-brand-pink text-sm" {...props}>
              {children}
            </code>
          );
        }
      }}
    >
      {text}
    </ReactMarkdown>
  );
};
