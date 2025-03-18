
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useAudioState } from './useAudioState';
import { useAudioEffects } from './useAudioEffects';
import { useAudioActions } from './useAudioActions';
import { UseAudioPlayerResult } from './types';
import { useMemo, useEffect } from 'react';

export const useAudioPlayer = (steps: any[], topic: string, initialScript: string | null = null): UseAudioPlayerResult => {
  const { 
    isGenerating, 
    isGeneratingScript,
    audioUrl, 
    scriptContent,
    error, 
    generateSpeech, 
    generateScript,
    cleanup,
    setScriptContent 
  } = useTextToSpeech();
  
  const { state, audioRef, setState } = useAudioState(scriptContent || initialScript);
  
  // Set initial script if provided
  useEffect(() => {
    if (initialScript && !scriptContent) {
      setScriptContent(initialScript);
      setState.setEditableScript(initialScript);
    }
  }, [initialScript, scriptContent, setScriptContent, setState.setEditableScript]);
  
  useAudioEffects(
    audioRef, 
    audioUrl, 
    setState.setIsPlaying, 
    setState.setIsAudioLoaded, 
    cleanup
  );
  
  const actions = useAudioActions({
    audioRef,
    isPlaying: state.isPlaying,
    isMuted: state.isMuted,
    editableScript: state.editableScript,
    isGenerating,
    audioUrl,
    setEditableScript: setState.setEditableScript,
    setShowScriptEditor: setState.setShowScriptEditor,
    setShowControls: setState.setShowControls,
    setIsMuted: setState.setIsMuted,
    generateScript,
    generateSpeech,
    cleanup,
    steps,
    topic
  });

  // Memoize the result to prevent unnecessary re-renders
  const result = useMemo(() => ({
    audioRef,
    ...state,
    isGenerating,
    isGeneratingScript,
    audioUrl,
    scriptContent,
    error,
    ...actions,
    setScriptContent
  }), [
    audioRef, 
    state, 
    isGenerating, 
    isGeneratingScript, 
    audioUrl, 
    scriptContent, 
    error, 
    actions,
    setScriptContent
  ]);

  return result;
};
