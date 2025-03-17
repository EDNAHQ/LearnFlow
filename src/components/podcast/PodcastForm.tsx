
import React from 'react';
import { Info } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PodcastFormProps {
  transcript: string;
  isGenerating: boolean;
  charCount: number;
  onTranscriptChange: (value: string) => void;
}

const PodcastForm = ({ 
  transcript, 
  isGenerating, 
  charCount, 
  onTranscriptChange 
}: PodcastFormProps) => {
  const examples = `Host 1: Hello and welcome to our podcast!
Host 2: Today we're talking about...
Host 1: That sounds interesting!
Host 2: Let's get started!`;

  const placeholderText = `Host 1: Hello and welcome to our podcast!
Host 2: Today we're talking about code understanding.
Host 1: That sounds interesting!
Host 2: Let's get started!
Host 1: Understanding code starts with...`;

  return (
    <div className="space-y-4">
      <Alert className="bg-gray-50">
        <Info className="h-4 w-4 text-gray-500" />
        <AlertTitle>Format Example</AlertTitle>
        <AlertDescription className="text-xs text-gray-500 mt-2">
          <pre className="whitespace-pre-wrap font-mono text-sm">{examples}</pre>
        </AlertDescription>
      </Alert>
      
      <div className="space-y-2">
        <Textarea
          placeholder={placeholderText}
          value={transcript}
          onChange={(e) => onTranscriptChange(e.target.value)}
          className="min-h-[200px] h-[300px] resize-y font-mono text-sm p-4"
          disabled={isGenerating}
        />
      </div>
    </div>
  );
};

export default PodcastForm;
