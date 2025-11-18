import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import SafeReactMarkdown from '@/components/ui/SafeReactMarkdown';
import remarkGfm from 'remark-gfm';
import { getMarkdownComponents } from '@/utils/markdown/markdownComponents';

interface DeepDiveAccordionProps {
  children: string;
  className?: string;
}

export const DeepDiveAccordion: React.FC<DeepDiveAccordionProps> = ({ children, className }) => {
  const lines = children.trim().split('\n');
  const firstLine = lines[0] || '';
  const isTitle = firstLine.startsWith('**') && firstLine.endsWith('**');
  
  const title = isTitle ? firstLine.replace(/\*\*/g, '').trim() : 'Deep Dive';
  const content = isTitle ? lines.slice(1).join('\n').trim() : children.trim();

  return (
    <div className={cn("my-6", className)}>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="deep-dive" className="border-2 border-brand-purple/20 rounded-lg">
          <AccordionTrigger className="px-5 py-4 hover:no-underline">
            <div className="flex items-center gap-3 flex-1 text-left">
              <Badge 
                variant="outline" 
                className="bg-brand-purple/10 border-brand-purple/30 text-brand-purple"
              >
                Deep Dive
              </Badge>
              <span className="font-medium text-brand-purple">{title}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            <div className="prose prose-lg max-w-none pt-2">
              <SafeReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={getMarkdownComponents()}
              >
                {content}
              </SafeReactMarkdown>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

