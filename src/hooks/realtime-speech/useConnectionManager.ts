import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { createRealtimeSpeechSession, RealtimeSpeechConnection } from '@/utils/realtime-speech';
import { Message } from './types';

/**
 * Hook to manage the connection to the realtime speech service
 */
export function useConnectionManager() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('Not connected');
  const [messages, setMessages] = useState<Message[]>([]);
  const connectionRef = useRef<RealtimeSpeechConnection | null>(null);

  /**
   * Handle messages from the AI assistant
   */
  const handleMessage = useCallback((message: any) => {
    console.log('Received message:', message);
    
    // Handle different message types from OpenAI
    if (message.type === 'transcript') {
      // Add user message to the chat with a unique ID
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'user',
        content: message.text
      }]);
    } else if (message.type === 'assistant_message') {
      // Add assistant message to the chat with a unique ID
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: message.content
      }]);
    } else if (message.type === 'speaking_start') {
      setIsSpeaking(true);
    } else if (message.type === 'speaking_end') {
      setIsSpeaking(false);
    }
  }, []);

  /**
   * Update the connection status
   */
  const handleStatusChange = useCallback((newStatus: string) => {
    setStatus(newStatus);
  }, []);

  /**
   * Connect to the realtime speech service
   */
  const connect = useCallback(async (instructions: string, initialPrompt?: string) => {
    try {
      setIsConnecting(true);
      
      // Create a session
      const session = await createRealtimeSpeechSession({
        instructions,
        modalities: ['audio', 'text'],
        voice: 'alloy'
      });
      
      // Create a new connection
      const connection = new RealtimeSpeechConnection();
      connectionRef.current = connection;
      
      // Set up callbacks
      connection.setCallbacks({
        onMessage: handleMessage,
        onStatusChange: handleStatusChange
      });
      
      // Connect to the session
      await connection.connect(session);
      setIsConnected(true);
      
      // Send initial prompt if provided
      if (initialPrompt) {
        await connection.sendText(initialPrompt);
      }
      
      toast.success('Connected to voice assistant');
      return true;
    } catch (err: any) {
      console.error('Failed to connect:', err);
      toast.error(`Connection failed: ${err.message}`);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [handleMessage, handleStatusChange]);

  
  /**
   * Disconnect from the realtime speech service
   */
  const disconnect = useCallback(() => {
    if (connectionRef.current) {
      connectionRef.current.disconnect();
      connectionRef.current = null;
      setIsConnected(false);
      setIsListening(false);
      setIsSpeaking(false);
      toast.info('Disconnected from voice assistant');
    }
  }, []);

  /**
   * Toggle the listening state
   */
  const toggleListening = useCallback(() => {
    setIsListening(prev => !prev);
    // This is a placeholder for the actual microphone streaming logic
  }, []);

  /**
   * Send text to the assistant
   */
  const sendText = useCallback(async (text: string) => {
    if (connectionRef.current) {
      await connectionRef.current.sendText(text);
    } else {
      toast.error('Not connected to voice assistant');
    }
  }, []);

  return {
    // State
    isConnecting,
    isConnected,
    isSpeaking,
    isListening,
    status,
    messages,
    
    // Methods
    connect,
    disconnect,
    toggleListening,
    sendText,
    
    // Refs
    connectionRef
  };
}
