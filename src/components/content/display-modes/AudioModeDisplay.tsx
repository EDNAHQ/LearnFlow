
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AI_STYLES } from '@/components/ai';
import { cn } from '@/lib/utils';
import { useTextToSpeech, OpenAIVoice } from '@/hooks/audio';
import { useAudioPlayerState } from '@/hooks/audio';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Loader2, MessageCircle } from 'lucide-react';
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

      {/* Two-column layout: player left, assistant right */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Audio Player Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700"
        >
          {/* Voice Selection (compact, no label) */}
          <div className="flex items-center justify-end mb-4">
            <Select value={selectedVoice} onValueChange={handleVoiceChange}>
              <SelectTrigger className="w-40 bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700/50 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="alloy">Alloy</SelectItem>
                <SelectItem value="echo">Echo</SelectItem>
                <SelectItem value="shimmer">Shimmer</SelectItem>
              </SelectContent>
            </Select>
          </div>

        {/* Player Controls */}
        <div className="flex items-center gap-6">
          {/* Play/Pause Button */}
          <Button
            onClick={handlePlayClick}
            disabled={isGenerating && !audioUrl}
            size="icon"
            className="h-16 w-16 bg-gradient-to-r from-brand-primary to-brand-accent hover:from-brand-primary/90 hover:to-brand-accent/90 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-7 w-7" />
            ) : (
              <Play className="h-7 w-7 ml-1" />
            )}
          </Button>

          {/* Info Section */}
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-white mb-2 truncate">
              {isGenerating ? 'Generating audio...' : (title || 'Audio Summary')}
            </div>

            {isGenerating && (
              <BarLoader className="w-full" />
            )}

            {!isGenerating && audioUrl && (
              <div className="text-sm text-gray-400">
                {isPlaying ? '▶ Playing...' : (isAudioLoaded ? '⏸ Ready to play' : '⏳ Loading...')}
              </div>
            )}

            {!isGenerating && !audioUrl && (
              <div className="text-sm text-gray-400">
                Click play to generate and listen
              </div>
            )}
          </div>

          {/* Additional Controls */}
          <div className="flex items-center gap-3">
            {audioUrl && !isGenerating && (
              <Button
                onClick={handleRetry}
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-all"
                title="Regenerate audio"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            )}

            <Button
              onClick={handleMuteToggle}
              variant="ghost"
              size="icon"
              disabled={!audioUrl}
              className="h-10 w-10 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-all disabled:opacity-30"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-900/20 border border-red-700/50 rounded-xl text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          controls={false}
          className="hidden"
        />
        </motion.div>

        {/* Interactive Voice Assistant Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="h-full"
        >
          <motion.div
            onClick={() => setShowVoiceOverlay(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group h-full cursor-pointer rounded-xl p-5 bg-white border border-gray-200 hover:border-brand-primary/30 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-brand-primary to-brand-accent rounded-full flex items-center justify-center text-white">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className={cn("text-base font-semibold", AI_STYLES.gradients.text)}>Voice Assistant</div>
                <div className="text-sm text-gray-500">Have a quick conversation about {topic}</div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-brand-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
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
