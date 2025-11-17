import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useChat } from '@/hooks/content/useChat';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/auth';
import SafeReactMarkdown from '@/components/ui/SafeReactMarkdown';
import remarkGfm from 'remark-gfm';
import { getMarkdownComponents } from '@/utils/markdown/markdownComponents';
import { preprocessContent } from '@/utils/markdown/contentPreprocessor';

interface ChatModeDisplayProps {
  content: string;
  title: string;
  pathId: string;
  stepId: string;
  topic: string;
}

const ChatModeDisplay: React.FC<ChatModeDisplayProps> = ({
  content,
  title,
  pathId,
  stepId,
  topic,
}) => {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();

  const { messages, isLoading, error, sendMessage, clearMessages, suggestedPrompts, isLoadingPrompts } = useChat({
    topic,
    content,
    pathId,
  });

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const messageToSend = inputValue;
    setInputValue('');
    await sendMessage(messageToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };


  return (
    <div className="w-full h-[600px] flex flex-col">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {messages.length === 0 && suggestedPrompts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {suggestedPrompts.map((prompt, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors text-gray-700"
                onClick={() => setInputValue(prompt)}
              >
                {prompt}
              </motion.div>
            ))}
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex gap-3"
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {message.role === 'user' ? (
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.user_metadata?.avatar_url || ''}
                      alt={user?.user_metadata?.full_name || 'User'}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-brand-primary to-brand-accent text-white text-xs">
                      {user?.user_metadata?.full_name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-primary via-brand-accent to-brand-secondary flex items-center justify-center">
                    <span className="text-white font-bold text-sm">L</span>
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div
                className={cn(
                  'flex-1 rounded-lg px-6 py-4',
                  message.role === 'user'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-white border border-gray-200 text-gray-800'
                )}
              >
                <div className="text-base leading-relaxed">
                  {message.role === 'user' ? (
                    <span className="whitespace-pre-wrap break-words text-gray-800">{message.content}</span>
                  ) : (
                    <SafeReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={getMarkdownComponents(topic)}
                    >
                      {preprocessContent(message.content)}
                    </SafeReactMarkdown>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            {/* LearnFlow Avatar for loading state */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-primary via-brand-accent to-brand-secondary flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
            </div>
            <div className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
        >
          {error}
        </motion.div>
      )}

      {/* Input Area */}
      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          className="resize-none min-h-[60px] max-h-[120px]"
          disabled={isLoading}
        />
        <Button
          onClick={handleSend}
          disabled={!inputValue.trim() || isLoading}
          className="bg-gradient-to-r from-brand-primary to-brand-accent hover:from-brand-primary/90 hover:to-brand-accent/90 text-white px-6"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default ChatModeDisplay;
