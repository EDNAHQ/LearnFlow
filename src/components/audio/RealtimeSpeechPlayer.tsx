
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Play, Square, Loader } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { createRealtimeSpeechSession, RealtimeSpeechConnection } from '@/utils/realtimeSpeech';
import { useLearningSteps } from '@/hooks/useLearningSteps';

interface RealtimeSpeechPlayerProps {
  topic?: string;
  initialPrompt?: string;
  pathId?: string;
}

const RealtimeSpeechPlayer: React.FC<RealtimeSpeechPlayerProps> = ({ 
  topic = 'general knowledge', 
  initialPrompt = '',
  pathId
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('Not connected');
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const connectionRef = useRef<RealtimeSpeechConnection | null>(null);
  
  // Fetch learning steps to provide context to the AI
  const { steps, isLoading: stepsLoading } = useLearningSteps(pathId, topic);
  
  // Create a learning context from the available steps
  const getLearningContext = () => {
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
  };

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

  return (
    <Card className="w-full bg-[#1A1A1A] text-white border border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">
          AI Voice Assistant
        </CardTitle>
        <Badge 
          variant={isConnected ? "outline" : "secondary"}
          className={isConnected ? "border-green-500 bg-green-500/10 text-green-500" : "bg-gray-600"}
        >
          {status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-4">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-gray-800 ml-10' 
                  : 'bg-purple-900 mr-10'
              }`}
            >
              {msg.content}
            </div>
          ))}
          
          {!messages.length && (
            <div className="text-center text-gray-400 py-6">
              {isConnected 
                ? "Start speaking or click the microphone button" 
                : "Connect to start using the voice assistant"}
            </div>
          )}
          
          {isSpeaking && (
            <div className="flex items-center justify-center space-x-1">
              <span className="bg-purple-600 h-3 w-1 animate-pulse rounded"></span>
              <span className="bg-purple-600 h-4 w-1 animate-pulse rounded delay-150"></span>
              <span className="bg-purple-600 h-6 w-1 animate-pulse rounded delay-300"></span>
              <span className="bg-purple-600 h-3 w-1 animate-pulse rounded delay-500"></span>
              <span className="ml-2">AI is speaking...</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-center space-x-4 pt-4">
          {!isConnected ? (
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting}
              className="bg-purple-700 hover:bg-purple-600"
            >
              {isConnecting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect to Voice Assistant"
              )}
            </Button>
          ) : (
            <>
              <Button 
                onClick={toggleListening} 
                variant={isListening ? "destructive" : "secondary"}
                className={isListening ? "bg-red-600 hover:bg-red-700" : ""}
              >
                {isListening ? (
                  <>
                    <MicOff className="mr-2 h-4 w-4" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" />
                    Start Listening
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleDisconnect}
                variant="outline"
                className="border-gray-600"
              >
                <Square className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RealtimeSpeechPlayer;

