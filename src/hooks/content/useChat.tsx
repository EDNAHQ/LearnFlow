import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePromptTracking } from '@/hooks/analytics';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseChatProps {
  topic: string;
  content: string;
  pathId: string;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  suggestedPrompts: string[];
  isLoadingPrompts: boolean;
}

export const useChat = ({ topic, content, pathId }: UseChatProps): UseChatReturn => {
  const { logPrompt } = usePromptTracking();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  const messageIdCounter = useRef(0);
  const hasGeneratedPrompts = useRef(false);

  const generateMessageId = useCallback(() => {
    messageIdCounter.current += 1;
    return `msg-${Date.now()}-${messageIdCounter.current}`;
  }, []);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    setIsLoading(true);
    setError(null);

    // Add user message
    const userChatMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userChatMessage]);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('chat-tutor', {
        body: {
          message: userMessage,
          context: {
            topic,
            content: content.substring(0, 2000), // Limit context size
            pathId,
          },
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        },
      });

      if (functionError) throw functionError;

      // Track the prompt for personalization
      logPrompt({
        promptText: userMessage,
        contextUsed: `${topic}: ${content.substring(0, 500)}`,
        pathId: pathId,
        responseLength: data.response?.length || 0,
        metadata: {
          conversationLength: messages.length + 1,
          topic
        }
      });

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');

      // Remove the user message if request failed
      setMessages(prev => prev.filter(m => m.id !== userChatMessage.id));
    } finally {
      setIsLoading(false);
    }
  }, [topic, content, pathId, messages, generateMessageId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  // Generate contextual prompts on mount
  useEffect(() => {
    const generatePrompts = async () => {
      if (hasGeneratedPrompts.current || messages.length > 0) return;

      hasGeneratedPrompts.current = true;

      // Start with some default prompts immediately
      const defaultPrompts = [
        `What are the key concepts in ${topic || 'this topic'}?`,
        `Can you give me a practical example of how this applies?`,
        `How does this connect to what we've learned so far?`,
        `What's the most important thing to remember here?`
      ];
      setSuggestedPrompts(defaultPrompts);
      setIsLoadingPrompts(true);

      try {
        const { data, error: functionError } = await supabase.functions.invoke('chat-tutor', {
          body: {
            message: 'Generate 4 contextual conversation starters',
            context: {
              topic: topic || 'learning',
              content: content?.substring(0, 1500) || '',
              pathId,
            },
            generatePrompts: true,
          },
        });

        if (functionError) {
          console.error('Function error:', functionError);
          throw functionError;
        }

        if (data?.suggestedPrompts && Array.isArray(data.suggestedPrompts) && data.suggestedPrompts.length > 0) {
          setSuggestedPrompts(data.suggestedPrompts);
        } else {
          console.warn('Invalid prompts response:', data);
        }
      } catch (err) {
        console.error('Failed to generate prompts:', err);
        // Keep the default prompts we already set
      } finally {
        setIsLoadingPrompts(false);
      }
    };

    // Small delay to ensure content is available
    const timer = setTimeout(() => {
      generatePrompts();
    }, 100);

    return () => clearTimeout(timer);
  }, [topic, content, pathId]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    suggestedPrompts,
    isLoadingPrompts,
  };
};
