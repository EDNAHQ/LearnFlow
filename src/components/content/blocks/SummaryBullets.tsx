import React from 'react';
import { cn } from '@/lib/utils';
import SafeReactMarkdown from '@/components/ui/SafeReactMarkdown';
import remarkGfm from 'remark-gfm';
import { getMarkdownComponents } from '@/utils/markdown/markdownComponents';

interface SummaryBulletsProps {
  children: string;
  className?: string;
}

export const SummaryBullets: React.FC<SummaryBulletsProps> = ({ children, className }) => {
  return (
    <div className={cn("my-6 p-5 bg-brand-purple/5 border-l-4 border-brand-purple rounded-r-lg", className)}>
      <div className="mb-3">
        <span className="text-sm font-medium text-brand-purple uppercase tracking-wide">Summary</span>
      </div>
      <div className="prose prose-lg max-w-none">
        <SafeReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            ...getMarkdownComponents(),
            ul: ({ node, ...props }) => (
              <ul className="my-3 pl-6 space-y-2 list-disc marker:text-brand-purple" {...props} />
            ),
            li: ({ node, children, ...props }) => (
              <li className="text-lg leading-relaxed text-gray-800" {...props}>{children}</li>
            ),
          }}
        >
          {children.trim()}
        </SafeReactMarkdown>
      </div>
    </div>
  );
};

