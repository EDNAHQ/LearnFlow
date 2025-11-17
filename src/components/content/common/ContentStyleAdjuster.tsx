import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/ui';
import { EDGE_FUNCTIONS } from '@/integrations/supabase/functions';

interface ContentStyleAdjusterProps {
  stepId: string;
  topic: string;
  title: string;
  stepNumber?: number;
  totalSteps?: number;
  pathId?: string;
  onContentUpdated?: (newContent: string) => void;
}

const STYLE_OPTIONS = [
  { value: 'conversational', label: 'Conversational', description: 'Friendly and personal' },
  { value: 'formal', label: 'Formal', description: 'Academic and professional' },
  { value: 'technical', label: 'Technical', description: 'Precise and detailed' },
  { value: 'storytelling', label: 'Storytelling', description: 'Narrative and engaging' },
  { value: 'practical', label: 'Practical', description: 'Action-oriented' },
];

const LENGTH_OPTIONS = [
  { value: 'brief', label: 'Brief', description: '300-400 words' },
  { value: 'standard', label: 'Standard', description: '600-700 words' },
  { value: 'detailed', label: 'Detailed', description: '800-1000 words' },
  { value: 'comprehensive', label: 'Comprehensive', description: '1000-1500 words' },
];

export const ContentStyleAdjuster = ({
  stepId,
  topic,
  title,
  stepNumber,
  totalSteps,
  pathId,
  onContentUpdated,
}: ContentStyleAdjusterProps) => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();

  const handleRegenerate = async (style?: string, length?: string) => {
    if (!stepId || !topic || !title) {
      toast({
        title: 'Error',
        description: 'Missing required information to regenerate content',
        variant: 'destructive',
      });
      return;
    }

    setIsRegenerating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const stylePreferences: { content_style?: string; content_length?: string } = {};
      if (style) stylePreferences.content_style = style;
      if (length) stylePreferences.content_length = length;

      const response = await supabase.functions.invoke(EDGE_FUNCTIONS.generateLearningContent, {
        body: {
          stepId,
          topic,
          title,
          stepNumber: stepNumber ?? 1,
          totalSteps: totalSteps ?? 10,
          regenerate: true,
          userId: user?.id,
          pathId,
          stylePreferences: Object.keys(stylePreferences).length > 0 ? stylePreferences : undefined,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to regenerate content');
      }

      const newContent = response.data?.content;
      if (!newContent) {
        throw new Error('No content returned from regeneration');
      }

      if (onContentUpdated) {
        onContentUpdated(newContent);
      }

      toast({
        title: 'Content regenerated',
        description: 'The content has been updated with your preferred style. Refreshing...',
      });

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error regenerating content:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to regenerate content',
        variant: 'destructive',
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={isRegenerating}
        >
          {isRegenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Adjust Style
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Writing Style</DropdownMenuLabel>
        {STYLE_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleRegenerate(option.value)}
            className="flex flex-col items-start gap-1 py-2"
          >
            <span className="font-medium">{option.label}</span>
            <span className="text-xs text-muted-foreground">{option.description}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Content Length</DropdownMenuLabel>
        {LENGTH_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleRegenerate(undefined, option.value)}
            className="flex flex-col items-start gap-1 py-2"
          >
            <span className="font-medium">{option.label}</span>
            <span className="text-xs text-muted-foreground">{option.description}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

