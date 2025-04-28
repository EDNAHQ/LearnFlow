
import React from 'react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useAudioPlayerState } from '@/hooks/useAudioPlayerState';
import { AudioControlButtons } from './audio/AudioControlButtons';
import { AudioErrorDisplay } from './audio/AudioErrorDisplay';
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
        await generateSpeech(text, pathId);
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
        await generateSpeech(text, pathId);
      } catch (err) {
        console.error("Failed to generate speech:", err);
      }
    }
  };

  return (
    <div className="text-to-speech-player rounded-md border border-gray-700 bg-[#1A1A1A] text-white p-4 my-4">
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
              controls
              className="w-full mt-2"
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
      
      <AudioErrorDisplay error={error} />
    </div>
  );
};

export default TextToSpeechPlayer;
