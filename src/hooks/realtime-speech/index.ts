import { useState, useCallback, useEffect, useRef } from 'react';
import { createRealtimeSpeechSession } from '@/utils/realtime-speech/api';
import { RealtimeWebRTC } from '@/utils/realtime-speech/webrtc';
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

  const webrtcRef = useRef<RealtimeWebRTC | null>(null);

  // Handle connecting to the speech service
  const handleConnect = useCallback(async (): Promise<boolean> => {
    if (state.isConnecting) return false;

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      console.log("Attempting to connect to realtime speech service");

      // Initialize topic-specific instructions
      const initialInstructions = options.content || options.initialPrompt ||
        `Please provide information about ${options.topic || 'general knowledge'}`;

      // Create a session with the speech service to get client_secret
      const session = await createRealtimeSpeechSession({
        instructions: initialInstructions,
        voice: options.voice,
        topic: options.topic,
        initialPrompt: options.initialPrompt,
        pathId: options.pathId,
        content: options.content
      });

      if (!session.client_secret) {
        throw new Error('No client secret received from server');
      }

      console.log('Got client secret, establishing WebRTC connection...');

      // Create WebRTC connection
      webrtcRef.current = new RealtimeWebRTC(session.client_secret, {
        onSpeakingChange: (isSpeaking) => {
          setState(prev => ({ ...prev, isSpeaking }));
        },
        onListeningChange: (isListening) => {
          setState(prev => ({ ...prev, isListening }));
        },
        onMessage: (message) => {
          console.log('Received message from AI:', message);
          // Handle transcription and responses
          if (message.type === 'conversation.item.created' && message.item?.role === 'assistant') {
            setState(prev => ({
              ...prev,
              messages: [
                ...prev.messages,
                {
                  id: message.item.id,
                  role: 'assistant',
                  content: message.item.content?.[0]?.text || ''
                }
              ]
            }));
          }
        },
        onError: (error) => {
          console.error('WebRTC error:', error);
          setState(prev => ({
            ...prev,
            error: error.message,
            status: 'error'
          }));
        }
      });

      await webrtcRef.current.connect();

      setState(prev => ({
        ...prev,
        isConnecting: false,
        isConnected: true,
        status: 'connected',
        isListening: true
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
  }, [state.isConnecting, options.topic, options.initialPrompt, options.voice, options.pathId, options.content]);

  // Handle disconnecting
  const handleDisconnect = useCallback(async () => {
    if (webrtcRef.current) {
      await webrtcRef.current.disconnect();
      webrtcRef.current = null;
    }

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
    if (!state.isConnected || !webrtcRef.current) return;

    const newListeningState = !state.isListening;
    webrtcRef.current.toggleMicrophone(newListeningState);

    setState(prev => ({
      ...prev,
      isListening: newListeningState
    }));
  }, [state.isConnected, state.isListening]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (webrtcRef.current) {
        webrtcRef.current.disconnect();
      }
    };
  }, []);
  
  return {
    ...state,
    handleConnect,
    handleDisconnect,
    toggleListening
  };
}
