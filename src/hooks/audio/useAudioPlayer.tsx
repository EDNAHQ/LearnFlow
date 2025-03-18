
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useAudioState } from './useAudioState';
import { useAudioEffects } from './useAudioEffects';
import { useAudioActions } from './useAudioActions';
import { UseAudioPlayerResult } from './types';
import { useMemo, useEffect, useCallback } from 'react';

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
  
  const { state, audioRef, setState } = useAudioState(initialScript || scriptContent);
  
  // Memoize setScriptContent to avoid creating a new function on each render
  const handleSetScriptContent = useCallback((content: string) => {
    if (content) {
      setScriptContent(content);
      setState.setEditableScript(content);
    }
  }, [setScriptContent, setState.setEditableScript]);
  
  // Set initial script if provided - in a controlled way
  useEffect(() => {
    if (initialScript && !scriptContent) {
      handleSetScriptContent(initialScript);
    }
  }, [initialScript, scriptContent, handleSetScriptContent]);
  
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
  return useMemo(() => ({
    audioRef,
    ...state,
    isGenerating,
    isGeneratingScript,
    audioUrl,
    scriptContent,
    error,
    ...actions,
    setScriptContent: handleSetScriptContent
  }), [
    audioRef, 
    state, 
    isGenerating, 
    isGeneratingScript, 
    audioUrl, 
    scriptContent, 
    error, 
    actions,
    handleSetScriptContent
  ]);
};
