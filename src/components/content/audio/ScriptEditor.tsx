
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface ScriptEditorProps {
  script: string;
  isGenerating: boolean;
  onScriptChange: (value: string) => void;
  onGenerateAudio: () => void;
  onToggleEditor: () => void;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  script,
  isGenerating,
  onScriptChange,
  onGenerateAudio,
  onToggleEditor,
}) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold">Edit Summary Script</h4>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onToggleEditor}
          className="text-xs"
        >
          Hide Editor
        </Button>
      </div>
      <Textarea
        value={script}
        onChange={(e) => onScriptChange(e.target.value)}
        className="h-40 bg-gray-800 text-white border-gray-700"
        placeholder="Edit the generated script here..."
      />
      <div className="flex justify-end mt-2">
        <Button
          onClick={onGenerateAudio}
          disabled={isGenerating || !script}
          size="sm"
          className="bg-purple-700 hover:bg-purple-600 text-white"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Processing...
            </>
          ) : (
            <>Generate Audio</>
          )}
        </Button>
      </div>
    </div>
  );
};
