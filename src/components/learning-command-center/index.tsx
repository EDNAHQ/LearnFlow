import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ArrowRight
} from 'lucide-react';
import { useLearningCommandStore } from '@/store/learningCommandStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateLearningPlan } from '@/utils/learning/generateLearningPlan';
import { useToast } from '@/hooks/ui';
import { useAuth } from '@/hooks/auth';
import { useRecommendedTopics } from '@/hooks/recommendations/useRecommendedTopics';

const trendingTopics = [
  'React Hooks',
  'TypeScript Generics',
  'System Design',
  'Machine Learning Basics',
  'REST API Design',
  'Cloud Architecture'
];

export const LearningCommandCenter: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const { recommendations, isLoading: isLoadingRecommendations } = useRecommendedTopics();

  const {
    isOpen,
    isMinimized,
    input,
    recentTopics,
    suggestions,
    isLoading,
    openWidget,
    closeWidget,
    toggleWidget,
    setInput,
    addRecentTopic,
    setSuggestions,
    setLoading,
    clearInput
  } = useLearningCommandStore();

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + L to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
        e.preventDefault();
        openWidget();
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        closeWidget();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, openWidget, closeWidget]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Generate suggestions based on input
  useEffect(() => {
    if (input.length > 2) {
      const filtered = [...trendingTopics, ...recentTopics]
        .filter(topic => topic.toLowerCase().includes(input.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [input, recentTopics, setSuggestions]);

  const handleSubmit = async (topic?: string) => {
    const finalTopic = topic || input;

    if (!finalTopic.trim()) {
      toast({
        title: "Please enter a topic",
        description: "What would you like to learn today?",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to create a learning path",
        variant: "destructive"
      });
      navigate('/sign-in');
      return;
    }

    setLoading(true);
    addRecentTopic(finalTopic);

    try {
      // Store topic in session storage
      sessionStorage.setItem('learn-topic', finalTopic);

      // Navigate to plan page
      navigate(`/plan?topic=${encodeURIComponent(finalTopic)}`);
      clearInput();
      closeWidget();
    } catch (error) {
      console.error('Error creating learning path:', error);
      toast({
        title: "Error",
        description: "Failed to create learning path. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // No FAB - the widget will be triggered from the + New Project button

  // Command Palette Overlay
  const commandPalette = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 flex items-start justify-center pt-20 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeWidget}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Command Palette */}
          <motion.div
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.95, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: -20 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Start Learning</h2>
                  <p className="text-sm text-gray-500">What would you like to master today?</p>
                </div>
                <button
                  onClick={closeWidget}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Input Field */}
              <div className="relative">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      handleSubmit();
                    }
                  }}
                  placeholder="Type a topic or choose a template..."
                  className="w-full px-4 pr-20 py-3 text-lg border-gray-200 focus:ring-2 focus:ring-[#6654f5]/20"
                  disabled={isLoading}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <kbd className="px-2 py-1 text-xs bg-gray-100 rounded text-gray-600">⌘L</kbd>
                  <Button
                    size="sm"
                    onClick={() => handleSubmit()}
                    disabled={isLoading || !input.trim()}
                    className="brand-gradient text-white hover:opacity-90"
                  >
                    {isLoading ? (
                      <span className="text-xs">...</span>
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 pt-4 max-h-[60vh] overflow-y-auto">
              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Suggestions</h3>
                  <div className="space-y-1">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setInput(suggestion);
                          inputRef.current?.focus();
                        }}
                        className="w-full p-3 rounded-lg text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
                      >
                        <span className="text-gray-700">{suggestion}</span>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#6654f5] transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Topics (Personalized) */}
              {!input && user && recommendations.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-[#6654f5] mb-3">
                    Recommended For You
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.map((rec, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSubmit(rec.topic)}
                        className="px-4 py-2 rounded-full border border-transparent bg-white text-sm font-medium text-gray-900 shadow-sm transition-all hover:shadow-md"
                        style={{
                          backgroundImage: 'linear-gradient(white, white), linear-gradient(90deg, #6654f5, #1EAEDB)',
                          backgroundOrigin: 'border-box',
                          backgroundClip: 'padding-box, border-box',
                          borderColor: 'transparent'
                        }}
                        title={rec.reason}
                      >
                        {rec.topic}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Topics */}
              {!input && recentTopics.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">
                    Recent Topics
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recentTopics.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => {
                          setInput(topic);
                          inputRef.current?.focus();
                        }}
                        className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-sm text-gray-700 transition-colors"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Topics */}
              {!input && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">
                    Trending Now
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {trendingTopics.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => {
                          setInput(topic);
                          inputRef.current?.focus();
                        }}
                        className="px-3 py-1.5 rounded-full border border-gray-200 hover:border-[#6654f5]/30 hover:bg-[#6654f5]/5 text-sm text-gray-700 transition-all"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>⌘L to open</span>
                <span>ESC to close</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Create portal for rendering outside of component tree
  const portalRoot = document.getElementById('portal-root') || document.body;

  return createPortal(
    commandPalette,
    portalRoot
  );
};