
import { useState, useEffect, useCallback } from 'react';
import { useLearningSteps } from '@/hooks/useLearningSteps';
import { useConnectionManager } from './useConnectionManager';
import { useLearningContext } from './useLearningContext';
import { RealtimeSpeechOptions } from './types';

/**
 * Hook for the realtime speech feature
 */
export function useRealtimeSpeech({ topic, initialPrompt, pathId }: RealtimeSpeechOptions) {
  const connection = useConnectionManager();
  const learningContext = useLearningContext();
  
  // Fetch learning steps to provide context to the AI
  const { steps, isLoading: stepsLoading } = useLearningSteps(pathId, topic);

  // Clean up connection on unmount
  useEffect(() => {
    return () => {
      connection.disconnect();
    };
  }, []);

  // Connect to the realtime speech service
  const handleConnect = useCallback(async () => {
    const instructions = learningContext.getAssistantInstructions({ topic, steps });
    
    // Get the prompt to send
    let promptToSend = initialPrompt;
    if (!initialPrompt && !stepsLoading && steps.length > 0) {
      promptToSend = learningContext.getDefaultInitialPrompt({ topic, steps });
    }
    
    return connection.connect(instructions, promptToSend);
  }, [topic, initialPrompt, steps, stepsLoading, connection, learningContext]);

  return {
    // Re-export connection state
    isConnecting: connection.isConnecting,
    isConnected: connection.isConnected,
    isSpeaking: connection.isSpeaking,
    isListening: connection.isListening,
    status: connection.status,
    messages: connection.messages,
    
    // Re-export connection methods
    handleConnect,
    handleDisconnect: connection.disconnect,
    toggleListening: connection.toggleListening,
    sendText: connection.sendText
  };
}

// Re-export for backward compatibility
export * from './types';
