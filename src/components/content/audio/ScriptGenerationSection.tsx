
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { BarLoader } from '@/components/ui/loader';

interface ScriptGenerationSectionProps {
  isGeneratingScript: boolean;
  isLoading: boolean;
  steps: any[];
  handleGenerateScript: () => void;
}

export const ScriptGenerationSection: React.FC<ScriptGenerationSectionProps> = ({
  isGeneratingScript,
  isLoading,
  steps,
  handleGenerateScript,
}) => {
  if (isLoading) {
    return <div className="text-center p-8"><BarLoader className="mx-auto" /><p>Loading learning content...</p></div>;
  }

  return (
    <div className="flex justify-center mb-4">
      <Button
        onClick={handleGenerateScript}
        disabled={isGeneratingScript || isLoading || steps.length === 0}
        className="bg-purple-700 hover:bg-purple-600 text-white"
      >
        {isGeneratingScript ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Script...
          </>
        ) : (
          <>
            <FileText className="mr-2 h-4 w-4" />
            Generate Project Summary Script
          </>
        )}
      </Button>
    </div>
  );
};
