
import { useState, useRef, useEffect } from 'react';
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

  // Initialize script when content changes
  useEffect(() => {
    if (scriptContent && !editableScript) {
      setEditableScript(scriptContent);
    }
  }, [scriptContent, editableScript]);

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
    setState: {
      setIsPlaying,
      setIsMuted,
      setShowControls,
      setShowScriptEditor,
      setEditableScript,
      setIsAudioLoaded
    }
  };
};
