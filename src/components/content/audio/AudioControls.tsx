
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { BarLoader } from '@/components/ui/loader';

interface AudioControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  isGenerating: boolean;
  isAudioLoaded: boolean;
  audioUrl: string | null;
  showControls: boolean;
  onTogglePlay: () => void;
  onMuteToggle: () => void;
  onRetry: () => void;
  onToggleControls: () => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  isMuted,
  isGenerating,
  isAudioLoaded,
  audioUrl,
  showControls,
  onTogglePlay,
  onMuteToggle,
  onRetry,
  onToggleControls
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 flex-grow">
        <Button
          onClick={onTogglePlay}
          disabled={isGenerating && !audioUrl}
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-white hover:bg-gray-800 bg-purple-800"
          title={audioUrl ? (isPlaying ? "Pause" : "Play") : "Generate audio"}
        >
          {isGenerating ? (
            <span className="h-5 w-5 animate-spin">⏳</span>
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
          
          {(isGenerating) && <BarLoader className="w-full mt-2" />}
          
          {/* Show audio status message */}
          {!isGenerating && audioUrl && (
            <div className="text-xs text-gray-400 mt-1">
              {isPlaying ? 'Playing audio...' : (isAudioLoaded ? 'Audio ready to play' : 'Loading audio...')}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          onClick={onRetry}
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-gray-800"
          title="Reset and start over"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        
        <Button
          onClick={onMuteToggle}
          variant="ghost" 
          size="icon"
          disabled={!audioUrl}
          className="h-8 w-8 text-white hover:bg-gray-800"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
        
        <Button
          onClick={onToggleControls}
          variant="ghost"
          size="sm"
          className="text-xs text-gray-400 hover:bg-gray-800"
        >
          {showControls ? "Hide Controls" : "Show Controls"}
        </Button>
      </div>
    </div>
  );
};

export default AudioControls;
