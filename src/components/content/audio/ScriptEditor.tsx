
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, FileText } from 'lucide-react';

interface ScriptEditorProps {
  scriptContent: string | null;
  editableScript: string;
  showScriptEditor: boolean;
  isGenerating: boolean;
  isGeneratingScript: boolean;
  onEditScript: (value: string) => void;
  onToggleEditor: () => void;
  onGenerateAudio: () => void;
  onGenerateScript: () => void;
}

const ScriptEditor: React.FC<ScriptEditorProps> = ({
  scriptContent,
  editableScript,
  showScriptEditor,
  isGenerating,
  isGeneratingScript,
  onEditScript,
  onToggleEditor,
  onGenerateAudio,
  onGenerateScript
}) => {
  if (!scriptContent && !showScriptEditor) {
    return (
      <div className="flex justify-center mb-4">
        <Button
          onClick={onGenerateScript}
          disabled={isGeneratingScript}
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
  }

  if (scriptContent && showScriptEditor) {
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
          value={editableScript}
          onChange={(e) => onEditScript(e.target.value)}
          className="h-40 bg-gray-800 text-white border-gray-700"
          placeholder="Edit the generated script here..."
        />
        <div className="flex justify-end mt-2">
          <Button
            onClick={onGenerateAudio}
            disabled={isGenerating || !editableScript}
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
  }

  // Just show the editor toggle button
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onToggleEditor}
      className="mb-3 text-xs"
    >
      Edit Script
    </Button>
  );
};

export default ScriptEditor;
