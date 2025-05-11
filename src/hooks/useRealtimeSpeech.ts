
import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { createRealtimeSpeechSession, RealtimeSpeechConnection } from '@/utils/realtimeSpeech';
import { useLearningSteps } from '@/hooks/useLearningSteps';

interface RealtimeSpeechOptions {
  topic: string;
  initialPrompt?: string;
  pathId?: string;
}

interface Message {
  role: string;
  content: string;
}

export function useRealtimeSpeech({ topic, initialPrompt, pathId }: RealtimeSpeechOptions) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('Not connected');
  const [messages, setMessages] = useState<Message[]>([]);
  const connectionRef = useRef<RealtimeSpeechConnection | null>(null);
  
  // Fetch learning steps to provide context to the AI
  const { steps, isLoading: stepsLoading } = useLearningSteps(pathId, topic);
  
  // Create a learning context from the available steps
  const getLearningContext = useCallback(() => {
    if (!steps || steps.length === 0) {
      return `Topic: ${topic}`;
    }
    
    // Extract key information from steps to provide context
    const stepSummaries = steps.map((step, index) => 
      `Step ${index + 1}: ${step.title}`
    ).join('\n');
    
    return `
      Topic: ${topic}
      Learning Path Structure:
      ${stepSummaries}
      
      Use this learning path context to provide relevant answers. When answering questions,
      refer to specific learning steps when appropriate. If the user asks about topics covered
      in the learning path, mention which step contains that information.
    `;
  }, [steps, topic]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (connectionRef.current) {
        connectionRef.current.disconnect();
      }
    };
  }, []);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      
      // Create custom instructions based on topic and learning context
      const learningContext = getLearningContext();
      const instructions = `You are a friendly and helpful learning assistant specializing in ${topic}. ${learningContext} Keep answers conversational, engaging, and informative. Focus on helping the user understand concepts deeply and relate them to the learning materials.`;
      
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
        onMessage: (message) => {
          console.log('Received message:', message);
          
          // Handle different message types from OpenAI
          if (message.type === 'transcript') {
            // Add user message to the chat
            setMessages(prev => [...prev, {
              role: 'user',
              content: message.text
            }]);
          } else if (message.type === 'assistant_message') {
            // Add assistant message to the chat
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: message.content
            }]);
          } else if (message.type === 'speaking_start') {
            setIsSpeaking(true);
          } else if (message.type === 'speaking_end') {
            setIsSpeaking(false);
          }
        },
        onStatusChange: (newStatus) => {
          setStatus(newStatus);
        }
      });
      
      // Connect to the session
      await connection.connect(session);
      setIsConnected(true);
      
      // Create a contextual initial prompt if none provided
      let promptToSend = initialPrompt;
      if (!initialPrompt && !stepsLoading && steps.length > 0) {
        promptToSend = `I'm learning about ${topic}. This learning path has ${steps.length} steps, starting with "${steps[0]?.title}". Can you give me a brief introduction and explain how you can help me learn this topic?`;
      } else if (!initialPrompt) {
        promptToSend = `I'm learning about ${topic}. Can you give me a brief introduction and explain how you can help me learn this topic?`;
      }
      
      // Send initial prompt if provided
      if (promptToSend) {
        await connection.sendText(promptToSend);
      }
      
      toast.success('Connected to voice assistant');
    } catch (err: any) {
      console.error('Failed to connect:', err);
      toast.error(`Connection failed: ${err.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    if (connectionRef.current) {
      connectionRef.current.disconnect();
      connectionRef.current = null;
      setIsConnected(false);
      setIsListening(false);
      setIsSpeaking(false);
      toast.info('Disconnected from voice assistant');
    }
  };

  const toggleListening = () => {
    setIsListening(prev => !prev);
    // In a real implementation, we would start/stop streaming audio here
    // This is a placeholder for the actual microphone streaming logic
  };

  const sendText = async (text: string) => {
    if (connectionRef.current) {
      await connectionRef.current.sendText(text);
    } else {
      toast.error('Not connected to voice assistant');
    }
  };

  return {
    isConnecting,
    isConnected,
    isSpeaking,
    isListening,
    status,
    messages,
    handleConnect,
    handleDisconnect,
    toggleListening,
    sendText
  };
}
