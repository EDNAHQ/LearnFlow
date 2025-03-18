
import { useState, useRef, useEffect, useCallback } from 'react';
import { AudioState } from './types';

export const useAudioState = (scriptContent: string | null): {
  state: AudioState;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  setState: {
    setIsPlaying: (isPlaying: boolean) => void;
    setIsMuted: (isMuted: boolean) => void;
    setShowControls: (showControls: boolean) => void;
    setShowScriptEditor: (showScriptEditor: boolean) => void;
    setEditableScript: (editableScript: string) => void;
    setIsAudioLoaded: (isAudioLoaded: boolean) => void;
  };
} => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [editableScript, setEditableScript] = useState<string>('');
  const [showScriptEditor, setShowScriptEditor] = useState(false);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize script when content changes - with a stable check to avoid loops
  useEffect(() => {
    if (scriptContent && !editableScript) {
      console.log("Setting editable script from content");
      setEditableScript(scriptContent);
    }
  }, [scriptContent]);  // Deliberately removed editableScript from deps to avoid loops

  // Create stable setState object with memoized setters
  const setters = useMemo(() => ({
    setIsPlaying,
    setIsMuted,
    setShowControls,
    setShowScriptEditor,
    setEditableScript,
    setIsAudioLoaded
  }), []);

  return {
    state: {
      isPlaying,
      isMuted,
      showControls,
      editableScript,
      showScriptEditor,
      isAudioLoaded
    },
    audioRef,
    setState: setters
  };
};
