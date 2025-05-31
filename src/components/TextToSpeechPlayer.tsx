
import React, { useState } from 'react';
import { useTextToSpeech, OpenAIVoice } from '@/hooks/useTextToSpeech';
import { useAudioPlayerState } from '@/hooks/useAudioPlayerState';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Loader2 } from 'lucide-react';
import { BarLoader } from './ui/loader';

interface TextToSpeechPlayerProps {
  text: string;
  title: string;
  pathId?: string;
}

const TextToSpeechPlayer: React.FC<TextToSpeechPlayerProps> = ({ 
  text, 
  title,
  pathId = 'default'
}) => {
  const [selectedVoice, setSelectedVoice] = useState<OpenAIVoice>('nova');
  
  const { isGenerating, audioUrl, error, generateSpeech, cleanup } = useTextToSpeech();
  const {
    audioRef,
    isPlaying,
    isMuted,
    isAudioLoaded,
    handleTogglePlay,
    handleMuteToggle
  } = useAudioPlayerState(audioUrl);

  // Handle cleanup on unmount
  React.useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const handlePlayClick = async () => {
    if (!audioUrl && !isGenerating) {
      console.log("Generating speech...");
      try {
        await generateSpeech(text, pathId, { provider: 'openai', voice: selectedVoice });
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
        console.log("Regenerating speech...");
        await generateSpeech(text, pathId, { provider: 'openai', voice: selectedVoice });
      } catch (err) {
        console.error("Failed to generate speech:", err);
      }
    }
  };

  const handleVoiceChange = (value: string) => {
    setSelectedVoice(value as OpenAIVoice);
    // If we already have audio, clear it so we'll regenerate with the new voice
    if (audioUrl) {
      cleanup();
    }
  };

  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-4">
      {/* Header with Voice Selection */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-[#6D42EF] rounded-full"></div>
          <span className="text-sm font-medium text-gray-300">AI Voice</span>
        </div>
        
        <Select value={selectedVoice} onValueChange={handleVoiceChange}>
          <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-sm text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="nova">Nova</SelectItem>
            <SelectItem value="alloy">Alloy</SelectItem>
            <SelectItem value="echo">Echo</SelectItem>
            <SelectItem value="fable">Fable</SelectItem>
            <SelectItem value="onyx">Onyx</SelectItem>
            <SelectItem value="shimmer">Shimmer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Player Controls */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handlePlayClick}
          disabled={isGenerating && !audioUrl}
          size="icon"
          className="h-12 w-12 bg-[#6D42EF] hover:bg-[#5A35D1] text-white rounded-full"
        >
          {isGenerating ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>

        <div className="flex-1">
          <div className="text-sm font-medium text-white mb-1">
            {isGenerating ? 'Generating audio...' : (title || 'Listen to content')}
          </div>
          
          {isGenerating && <BarLoader className="w-full" />}
          
          {!isGenerating && audioUrl && (
            <div className="text-xs text-gray-400">
              {isPlaying ? 'Playing...' : (isAudioLoaded ? 'Ready to play' : 'Loading...')}
            </div>
          )}
        </div>

        {/* Additional Controls */}
        <div className="flex items-center gap-2">
          {audioUrl && !isGenerating && (
            <Button
              onClick={handleRetry}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            onClick={handleMuteToggle}
            variant="ghost" 
            size="icon"
            disabled={!audioUrl}
            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        controls={false}
        className="hidden"
      />
      
      {/* Error Display */}
      {error && (
        <div className="mt-3 p-3 bg-red-900/20 border border-red-700 rounded text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default TextToSpeechPlayer;
