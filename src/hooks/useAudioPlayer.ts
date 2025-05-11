
import { useState, useEffect } from 'react';
import { useAudioGeneration } from './audio/useAudioGeneration';
import { useAudioPlayback } from './audio/useAudioPlayback';
import { useAudioControls } from './audio/useAudioControls';

export const useAudioPlayer = (initialScript: string = '', pathId?: string) => {
  const {
    isGenerating,
    audioUrl,
    error: generationError,
    localError: generationLocalError,
    setLocalError,
    generateAudio,
    retryGeneration,
    cleanup
  } = useAudioGeneration();

  const {
    audioRef,
    isPlaying,
    isMuted,
    isAudioLoaded,
    localError: playbackError,
    playAudio,
    pauseAudio,
    toggleMute
  } = useAudioPlayback(audioUrl);

  const {
    showControls,
    setShowControls
  } = useAudioControls();

  // Combined error from all sources
  const error = generationError || playbackError || generationLocalError;

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const handleTogglePlay = async (script?: string, currentPathId?: string) => {
    setLocalError(null);
    
    if (!audioUrl && !isGenerating && script && currentPathId) {
      await generateAudio(script, currentPathId);
    } else if (audioRef.current) {
      if (isPlaying) {
        pauseAudio();
      } else {
        playAudio();
      }
    }
  };

  const handleMuteToggle = () => {
    // Fix: Call toggleMute without any arguments
    toggleMute();
  };

  const handleRetry = async (script: string, currentPathId?: string) => {
    if (!isGenerating && currentPathId) {
      setLocalError(null);
      await retryGeneration(script, currentPathId);
    }
  };

  return {
    audioRef,
    isPlaying,
    isMuted,
    isAudioLoaded,
    showControls,
    isGenerating,
    audioUrl,
    error,
    setShowControls,
    handleTogglePlay,
    handleMuteToggle,
    handleRetry,
    handleAudioEnd: () => pauseAudio()
  };
};
