
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Loader2 } from 'lucide-react';
import { BarLoader } from '@/components/ui/loader';
import { AudioControls } from './AudioControls';

interface AudioPlayerSectionProps {
  isGenerating: boolean;
  audioUrl: string | null;
  isPlaying: boolean;
  isMuted: boolean;
  showControls: boolean;
  isAudioLoaded: boolean;
  editableScript: string;
  scriptContent: string;
  pathId: string;
  handleTogglePlay: (script: string, pathId: string) => void;
  handleMuteToggle: () => void;
  handleRetry: (script: string, pathId: string) => void;
  setShowControls: (show: boolean) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export const AudioPlayerSection: React.FC<AudioPlayerSectionProps> = ({
  isGenerating,
  audioUrl,
  isPlaying,
  isMuted,
  showControls,
  isAudioLoaded,
  editableScript,
  scriptContent,
  pathId,
  handleTogglePlay,
  handleMuteToggle,
  handleRetry,
  setShowControls,
  audioRef,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 flex-grow">
        <Button
          onClick={() => handleTogglePlay(editableScript || scriptContent || '', pathId)}
          disabled={isGenerating && !audioUrl}
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-white hover:bg-gray-800 bg-purple-800"
          title={audioUrl ? (isPlaying ? "Pause" : "Play") : "Generate audio"}
        >
          {isGenerating ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>
        
        <div className="flex-1">
          <div className="text-sm font-medium truncate">
            {isGenerating ? 'Generating audio...' : 'Project Audio Summary'}
          </div>
          
          <audio 
            ref={audioRef} 
            controls={showControls}
            className="w-full mt-2"
          />
          
          {(isGenerating) && <BarLoader className="w-full mt-2" />}
          
          {!isGenerating && audioUrl && (
            <div className="text-xs text-gray-400 mt-1">
              {isPlaying ? 'Playing audio...' : (isAudioLoaded ? 'Audio ready to play' : 'Loading audio...')}
            </div>
          )}
        </div>
      </div>
      
      <AudioControls
        isPlaying={isPlaying}
        isMuted={isMuted}
        showControls={showControls}
        isGenerating={isGenerating}
        audioUrl={audioUrl}
        onPlayPause={() => handleTogglePlay(editableScript || scriptContent || '', pathId)}
        onMuteToggle={handleMuteToggle}
        onRetry={() => handleRetry(editableScript || scriptContent || '', pathId)}
        onToggleControls={() => setShowControls(!showControls)}
      />
    </div>
  );
};
