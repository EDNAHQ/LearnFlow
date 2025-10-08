
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AI_STYLES } from '@/components/ai';
import { cn } from '@/lib/utils';
import { useTextToSpeech, OpenAIVoice } from '@/hooks/audio';
import { useAudioPlayerState } from '@/hooks/audio';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Loader2 } from 'lucide-react';
import { BarLoader } from '@/components/ui/loader';
import InteractiveVoiceOverlay from '@/components/audio/InteractiveVoiceOverlay';

interface AudioModeDisplayProps {
  content: string;
  title: string;
  pathId: string;
  stepId: string;
  topic: string;
}

const AudioModeDisplay: React.FC<AudioModeDisplayProps> = ({
  content,
  title,
  pathId,
  stepId,
  topic
}) => {
  const [selectedVoice, setSelectedVoice] = useState<OpenAIVoice>('alloy');
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);

  // Clean up content for text-to-speech
  const cleanedContent = useMemo(() => {
    if (!content) return "";

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);

    return contentStr
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/\n\n/g, '. ')
      .replace(/\n/g, ' ')
      .trim();
  }, [content]);

  const { isGenerating, audioUrl, error, generateSpeech, cleanup } = useTextToSpeech();
  const {
    audioRef,
    isPlaying,
    isMuted,
    isAudioLoaded,
    handleTogglePlay,
    handleMuteToggle
  } = useAudioPlayerState(audioUrl);

  React.useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const handlePlayClick = async () => {
    if (!audioUrl && !isGenerating) {
      try {
        await generateSpeech(cleanedContent, pathId, { provider: 'openai', voice: selectedVoice });
      } catch (err) {
        console.error("Failed to generate speech:", err);
      }
    } else {
      handleTogglePlay();
    }
  };

  const handleRetry = async () => {
    if (!isGenerating) {
      try {
        cleanup();
        await generateSpeech(cleanedContent, pathId, { provider: 'openai', voice: selectedVoice });
      } catch (err) {
        console.error("Failed to generate speech:", err);
      }
    }
  };

  const handleVoiceChange = (value: string) => {
    setSelectedVoice(value as OpenAIVoice);
    if (audioUrl) cleanup();
  };

  const initialPrompt = cleanedContent
    ? `This is the content: ${cleanedContent.substring(0, 200)}... Continue discussing this topic.`
    : `I'm learning about ${topic}. Can you help me understand this better?`;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="grid gap-8 md:grid-cols-2">
          {/* Audio Player Card - Minimalist Design */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 rounded-3xl p-10 overflow-hidden"
          >
            {/* Subtle background gradient accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-brand-accent/5" />

            <div className="relative z-10 space-y-8">
              {/* Title Section */}
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {title || 'Introduction to Database Fundamentals'}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    {isGenerating ? 'Preparing audio...' : audioUrl ? (isPlaying ? 'Now playing' : 'Ready to play') : 'Click play to generate and listen'}
                  </p>
                  <Select value={selectedVoice} onValueChange={handleVoiceChange}>
                    <SelectTrigger className="w-32 bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="alloy">Alloy</SelectItem>
                      <SelectItem value="echo">Echo</SelectItem>
                      <SelectItem value="shimmer">Shimmer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Progress/Loading Bar */}
              {isGenerating && (
                <div className="space-y-2">
                  <BarLoader className="w-full" />
                </div>
              )}

              {/* Play Button - Large and Central */}
              <div className="flex items-center justify-center pt-6 pb-4">
                <Button
                  onClick={handlePlayClick}
                  disabled={isGenerating && !audioUrl}
                  className="h-20 w-20 bg-gradient-to-br from-brand-primary to-brand-accent hover:from-brand-primary/90 hover:to-brand-accent/90 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <Loader2 className="h-9 w-9 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="h-9 w-9" />
                  ) : (
                    <Play className="h-9 w-9 ml-1" />
                  )}
                </Button>
              </div>

              {/* Secondary Controls - Minimal */}
              <div className="flex items-center justify-center gap-6">
                {audioUrl && !isGenerating && (
                  <Button
                    onClick={handleRetry}
                    variant="ghost"
                    className="text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all text-sm"
                  >
                    Regenerate
                  </Button>
                )}
                <Button
                  onClick={handleMuteToggle}
                  variant="ghost"
                  disabled={!audioUrl}
                  className="text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all disabled:opacity-20 text-sm"
                >
                  {isMuted ? "Unmute" : "Mute"}
                </Button>
              </div>

              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </div>

            {/* Hidden Audio Element */}
            <audio ref={audioRef} controls={false} className="hidden" />
          </motion.div>

          {/* Voice Assistant Card - Clean Design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="h-full"
          >
            <motion.div
              onClick={() => setShowVoiceOverlay(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group h-full cursor-pointer rounded-3xl p-10 bg-white hover:bg-gray-50 transition-all duration-300 flex flex-col justify-center"
            >
              <div className="space-y-4">
                <div>
                  <h3 className={cn("text-2xl font-bold tracking-tight mb-3", AI_STYLES.gradients.text)}>
                    Voice Assistant
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Have a quick conversation about {topic}
                  </p>
                </div>

                <div className="pt-4">
                  <div className="inline-flex items-center text-brand-primary group-hover:gap-3 gap-2 transition-all duration-300 font-medium">
                    <span>Start conversation</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Interactive Voice Overlay */}
      <InteractiveVoiceOverlay
        isOpen={showVoiceOverlay}
        onClose={() => setShowVoiceOverlay(false)}
        topic={topic}
        initialPrompt={initialPrompt}
        pathId={pathId}
        content={cleanedContent}
      />
    </>
  );
};

export default AudioModeDisplay;
