import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { Play, Pause, Volume2, Loader2, VolumeX, RefreshCw, FileText } from 'lucide-react';
import { BarLoader } from '@/components/ui/loader';
import { useLearningSteps } from '@/hooks/useLearningSteps';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface AudioSummaryPlayerProps {
  pathId: string;
  topic: string;
}

const AudioSummaryPlayer: React.FC<AudioSummaryPlayerProps> = ({ pathId, topic }) => {
  const { steps, isLoading } = useLearningSteps(pathId, topic);
  const { 
    isGenerating, 
    isGeneratingScript,
    audioUrl, 
    scriptContent,
    error, 
    generateSpeech, 
    generateScript,
    cleanup 
  } = useTextToSpeech();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [editableScript, setEditableScript] = useState<string>('');
  const [showScriptEditor, setShowScriptEditor] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    if (scriptContent && !editableScript) {
      setEditableScript(scriptContent);
    }
  }, [scriptContent, editableScript]);

  // Create audio element when URL is available
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      setIsAudioLoaded(true);
      console.log("Audio URL loaded into player:", audioUrl);
    }
  }, [audioUrl]);

  const handleGenerateScript = async () => {
    if (!isGeneratingScript && steps.length > 0) {
      console.log("Generating script for entire project...");
      try {
        const script = await generateScript(steps, topic || 'this topic');
        if (script) {
          setShowScriptEditor(true);
        }
      } catch (err) {
        console.error("Failed to generate script:", err);
      }
    }
  };

  const handleGenerateAudio = async () => {
    if (!isGenerating && editableScript) {
      console.log("Generating audio from script...");
      try {
        await generateSpeech(editableScript);
      } catch (err) {
        console.error("Failed to generate audio:", err);
      }
    }
  };

  const handleTogglePlay = async () => {
    if (!audioUrl && !isGenerating) {
      // If no audio yet, check if we have a script
      if (editableScript) {
        await handleGenerateAudio();
      } else {
        // If no script, generate one first
        const script = await generateScript(steps, topic || 'this topic');
        if (script) {
          await generateSpeech(script);
        }
      }
    } else if (audioRef.current) {
      // If audio exists, toggle play/pause
      if (isPlaying) {
        console.log("Pausing audio");
        audioRef.current.pause();
      } else {
        console.log("Playing audio");
        audioRef.current.play().catch(err => {
          console.error("Error playing audio:", err);
        });
      }
    }
  };

  const handleMuteToggle = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleRetry = async () => {
    if (!isGenerating) {
      try {
        // Clean up existing audio
        cleanup();
        // Reset the script editor state
        setEditableScript('');
        setShowScriptEditor(false);
      } catch (err) {
        console.error("Failed to reset:", err);
      }
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  // Update play state when audio plays or pauses
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleAudioEnd);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleAudioEnd);
    };
  }, [audioUrl]);

  if (isLoading) {
    return <div className="text-center p-8"><BarLoader className="mx-auto" /><p>Loading learning content...</p></div>;
  }

  return (
    <div className="audio-summary-player rounded-md border border-gray-700 bg-[#1A1A1A] text-white p-4 my-4">
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Project Audio Summary</h3>
        <p className="text-sm text-gray-400">
          Generate and listen to an audio summary of the entire learning project.
        </p>
      </div>

      {!scriptContent && !showScriptEditor && (
        <div className="flex justify-center mb-4">
          <Button
            onClick={handleGenerateScript}
            disabled={isGeneratingScript || isLoading || steps.length === 0}
            className="bg-purple-700 hover:bg-purple-600 text-white"
          >
            {isGeneratingScript ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Script...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Project Summary Script
              </>
            )}
          </Button>
        </div>
      )}

      {scriptContent && showScriptEditor && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">Edit Summary Script</h4>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowScriptEditor(false)}
              className="text-xs"
            >
              Hide Editor
            </Button>
          </div>
          <Textarea
            value={editableScript}
            onChange={(e) => setEditableScript(e.target.value)}
            className="h-40 bg-gray-800 text-white border-gray-700"
            placeholder="Edit the generated script here..."
          />
          <div className="flex justify-end mt-2">
            <Button
              onClick={handleGenerateAudio}
              disabled={isGenerating || !editableScript}
              size="sm"
              className="bg-purple-700 hover:bg-purple-600 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Generate Audio</>
              )}
            </Button>
          </div>
        </div>
      )}

      {scriptContent && !showScriptEditor && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowScriptEditor(true)}
          className="mb-3 text-xs"
        >
          Edit Script
        </Button>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-grow">
          <Button
            onClick={handleTogglePlay}
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
              {isGenerating ? 'Generating audio...' : (isGeneratingScript ? 'Generating script...' : 'Project Audio Summary')}
            </div>
            
            {/* Audio element - always visible */}
            <audio 
              ref={audioRef} 
              onEnded={handleAudioEnd}
              controls={showControls}
              className="w-full mt-2"
            />
            
            {(isGenerating || isGeneratingScript) && <BarLoader className="w-full mt-2" />}
            
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
            onClick={handleRetry}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-gray-800"
            title="Reset and start over"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={handleMuteToggle}
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
            onClick={() => setShowControls(!showControls)}
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400 hover:bg-gray-800"
          >
            {showControls ? "Hide Controls" : "Show Controls"}
          </Button>
        </div>
      </div>
      
      {/* Error message display */}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}. Please try again.</AlertDescription>
        </Alert>
      )}

      {/* Info message when no steps */}
      {steps.length === 0 && (
        <Alert className="mt-4 bg-blue-900/20 border-blue-800">
          <Info className="h-4 w-4" />
          <AlertTitle>No Content Available</AlertTitle>
          <AlertDescription>
            There's no learning content available for this path yet. Please navigate to a learning path with content.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AudioSummaryPlayer;
