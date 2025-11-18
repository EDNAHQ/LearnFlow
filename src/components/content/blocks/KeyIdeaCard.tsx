import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import SafeReactMarkdown from '@/components/ui/SafeReactMarkdown';
import remarkGfm from 'remark-gfm';
import { getMarkdownComponents } from '@/utils/markdown/markdownComponents';

interface KeyIdeaCardProps {
  children: string;
  className?: string;
}

export const KeyIdeaCard: React.FC<KeyIdeaCardProps> = ({ children, className }) => {
  return (
    <Card className={cn(
      "my-6 border-2 border-brand-purple/20 bg-white shadow-sm",
      className
    )}>
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <Badge 
              variant="outline" 
              className="bg-brand-purple/10 border-brand-purple/30 text-brand-purple"
            >
              <Lightbulb className="h-4 w-4 mr-1.5" />
              Key Idea
            </Badge>
          </div>
          <div className="flex-1 prose prose-lg max-w-none">
            <SafeReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={getMarkdownComponents()}
            >
              {children.trim()}
            </SafeReactMarkdown>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

