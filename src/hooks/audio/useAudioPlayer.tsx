
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useAudioState } from './useAudioState';
import { useAudioEffects } from './useAudioEffects';
import { useAudioActions } from './useAudioActions';
import { UseAudioPlayerResult } from './types';

export const useAudioPlayer = (steps: any[], topic: string): UseAudioPlayerResult => {
  const { 
    isGenerating, 
    isGeneratingScript,
    audioUrl, 
    scriptContent,
    error, 
    generateSpeech, 
    generateScript,
    cleanup 
  } = useTextToSpeech();
  
  const { state, audioRef, setState } = useAudioState(scriptContent);
  
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

  return {
    audioRef,
    ...state,
    isGenerating,
    isGeneratingScript,
    audioUrl,
    scriptContent,
    error,
    ...actions
  };
};
