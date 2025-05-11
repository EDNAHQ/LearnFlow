
import React, { useState } from 'react';
import { useTextToSpeech, OpenAIVoice } from '@/hooks/useTextToSpeech';
import { useAudioPlayerState } from '@/hooks/useAudioPlayerState';
import { AudioControlButtons } from './audio/AudioControlButtons';
import { AudioErrorDisplay } from './audio/AudioErrorDisplay';
import { BarLoader } from './ui/loader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { InfoIcon } from 'lucide-react';

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
    <div className="text-to-speech-player rounded-md border border-gray-700 bg-[#1A1A1A] text-white p-4 my-4">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">AI Voice</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">
                    Audio is generated using OpenAI's text-to-speech technology.
                    The voice you hear is AI-generated, not a human voice.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <Select value={selectedVoice} onValueChange={handleVoiceChange}>
            <SelectTrigger className="w-[140px] bg-gray-800 border-gray-700 text-sm">
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="nova">Nova</SelectItem>
              <SelectItem value="alloy">Alloy</SelectItem>
              <SelectItem value="echo">Echo</SelectItem>
              <SelectItem value="fable">Fable</SelectItem>
              <SelectItem value="onyx">Onyx</SelectItem>
              <SelectItem value="shimmer">Shimmer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-grow">
            <AudioControlButtons
              isGenerating={isGenerating}
              isPlaying={isPlaying}
              isMuted={isMuted}
              audioUrl={audioUrl}
              onTogglePlay={handlePlayClick}
              onMuteToggle={handleMuteToggle}
              onRetry={handleRetry}
            />
            
            <div className="flex-1">
              <div className="text-sm font-medium truncate">
                {isGenerating ? 'Generating audio...' : (title || 'Listen to content')}
              </div>
              
              <audio 
                ref={audioRef} 
                controls={false}
                className="w-full mt-2 hidden"
              />
              
              {isGenerating && <BarLoader className="w-full mt-2" />}
              
              {!isGenerating && audioUrl && (
                <div className="text-xs text-gray-400 mt-1">
                  {isPlaying ? 'Playing audio...' : (isAudioLoaded ? 'Audio ready to play' : 'Loading audio...')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <AudioErrorDisplay error={error} />
    </div>
  );
};

export default TextToSpeechPlayer;
