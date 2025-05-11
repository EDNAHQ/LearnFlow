
import { useState, useCallback, useEffect } from 'react';
import { createRealtimeSpeechSession } from '@/utils/realtime-speech/api';
import { RealtimeSpeechOptions, RealtimeSpeechState, Message } from './types';

export function useRealtimeSpeech(options: RealtimeSpeechOptions = {}) {
  const [state, setState] = useState<RealtimeSpeechState>({
    isConnecting: false,
    isConnected: false,
    isSpeaking: false,
    isListening: false,
    status: 'disconnected',
    messages: [],
    error: null
  });

  // Handle connecting to the speech service
  const handleConnect = useCallback(async (): Promise<boolean> => {
    if (state.isConnecting) return false;
    
    setState(prev => ({ ...prev, isConnecting: true, error: null }));
    
    try {
      console.log("Attempting to connect to realtime speech service");
      
      // Initialize topic-specific instructions
      const initialInstructions = options.initialPrompt || 
        `Please provide information about ${options.topic || 'general knowledge'}`;
      
      // Create a session with the speech service
      await createRealtimeSpeechSession({
        instructions: initialInstructions,
        voice: options.voice || 'nova',
        topic: options.topic,
        pathId: options.pathId
      });
      
      // Add initial system message
      setState(prev => ({
        ...prev,
        isConnecting: false,
        isConnected: true,
        status: 'connected',
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            role: 'system',
            content: `Connected to AI assistant for ${options.topic || 'general knowledge'}`
          }
        ]
      }));
      
      return true;
    } catch (err: any) {
      console.error("Failed to connect to realtime speech service:", err);
      
      setState(prev => ({
        ...prev,
        isConnecting: false,
        isConnected: false,
        status: 'error',
        error: err.message || "Failed to connect to speech service"
      }));
      
      return false;
    }
  }, [state.isConnecting, options.topic, options.initialPrompt, options.voice, options.pathId]);
  
  // Handle disconnecting
  const handleDisconnect = useCallback(() => {
    setState(prev => ({
      ...prev,
      isConnected: false,
      isListening: false,
      isSpeaking: false,
      status: 'disconnected'
    }));
  }, []);
  
  // Toggle listening mode
  const toggleListening = useCallback(() => {
    if (!state.isConnected) return;
    
    setState(prev => ({
      ...prev,
      isListening: !prev.isListening
    }));
  }, [state.isConnected]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (state.isConnected) {
        handleDisconnect();
      }
    };
  }, [state.isConnected, handleDisconnect]);
  
  return {
    ...state,
    handleConnect,
    handleDisconnect,
    toggleListening
  };
}
