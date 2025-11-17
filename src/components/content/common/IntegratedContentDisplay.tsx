import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserLearningProfile } from '@/hooks/personalization/useUserLearningProfile';
import { useAuth } from '@/hooks/auth';
import ContentSection from './ContentSection';
import ImagesModeDisplay from '../display-modes/ImagesModeDisplay';
import AudioModeDisplay from '../display-modes/AudioModeDisplay';
import ChatModeDisplay from '../display-modes/ChatModeDisplay';
import SlideModeDisplay from '../display-modes/SlideModeDisplay';
import { X, Image as ImageIcon, Volume2, MessageSquare, Presentation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface IntegratedContentDisplayProps {
  content?: string;
  index?: number;
  detailedContent?: string | null;
  pathId?: string;
  topic?: string;
  title?: string;
  stepId?: string;
  onQuestionClick?: (question: string, content?: string) => void;
}

const IntegratedContentDisplay: React.FC<IntegratedContentDisplayProps> = ({
  content,
  index = 0,
  detailedContent,
  pathId,
  topic,
  title,
  stepId,
  onQuestionClick
}) => {
  const { user, session } = useAuth();
  const isAuthenticated = !!(user && session && session.access_token);
  const { profile } = useUserLearningProfile({ enabled: isAuthenticated });
  const [showImages, setShowImages] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSlides, setShowSlides] = useState(false);

  useEffect(() => {
    if (profile) {
      if (profile.prefersVisual) {
        setShowImages(true);
      }
      if (profile.prefersAudio) {
        setShowAudio(true);
      }
    }
  }, [profile]);

  const displayContent = content || '';
  const displayTitle = title || '';
  const displayStepId = stepId || '';

  const handleQuestionClick = (question: string) => {
    if (onQuestionClick) {
      onQuestionClick(question, detailedContent || content);
    }
  };

  if (!content && !title && !stepId) {
    return <div>No content available.</div>;
  }

  return (
    <div className="w-full space-y-6">
      <ContentSection
        content={displayContent}
        title={displayTitle}
        index={index}
        detailedContent={detailedContent}
        pathId={pathId}
        topic={topic}
        onQuestionClick={handleQuestionClick}
      />

      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowImages(!showImages)}
          className={cn(
            "rounded-full",
            showImages && "bg-brand-purple/10 border-brand-purple text-brand-purple"
          )}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Images
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAudio(!showAudio)}
          className={cn(
            "rounded-full",
            showAudio && "bg-brand-purple/10 border-brand-purple text-brand-purple"
          )}
        >
          <Volume2 className="h-4 w-4 mr-2" />
          Audio
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowChat(!showChat)}
          className={cn(
            "rounded-full",
            showChat && "bg-brand-purple/10 border-brand-purple text-brand-purple"
          )}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Chat
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSlides(!showSlides)}
          className={cn(
            "rounded-full",
            showSlides && "bg-brand-purple/10 border-brand-purple text-brand-purple"
          )}
        >
          <Presentation className="h-4 w-4 mr-2" />
          Present
        </Button>
      </div>

      <AnimatePresence>
        {showImages && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Visual Concepts</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowImages(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ImagesModeDisplay
                stepId={displayStepId}
                title={displayTitle}
                topic={topic || ''}
                pathId={pathId || ''}
              />
            </div>
          </motion.div>
        )}

        {showAudio && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Audio Learning</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAudio(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <AudioModeDisplay
                content={detailedContent || displayContent}
                title={displayTitle}
                pathId={pathId || ''}
                stepId={displayStepId}
                topic={topic || ''}
              />
            </div>
          </motion.div>
        )}

        {showChat && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Ask Questions</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChat(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ChatModeDisplay
                content={detailedContent || displayContent}
                title={displayTitle}
                pathId={pathId || ''}
                stepId={displayStepId}
                topic={topic || ''}
              />
            </div>
          </motion.div>
        )}

        {showSlides && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Presentation View</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSlides(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <SlideModeDisplay
                content={detailedContent || displayContent}
                title={displayTitle}
                detailedContent={detailedContent}
                pathId={pathId}
                topic={topic}
                onQuestionClick={handleQuestionClick}
                onClose={() => setShowSlides(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntegratedContentDisplay;

