
import { RefObject } from 'react';

export interface AudioPlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  showControls: boolean;
  showScriptEditor: boolean;
  editableScript: string;
  isAudioLoaded: boolean;
}

export interface AudioPlayerActions {
  setEditableScript: (script: string) => void;
  setShowScriptEditor: (show: boolean) => void;
  setShowControls: (show: boolean) => void;
  handleGenerateScript: () => Promise<void>;
  handleGenerateAudio: () => Promise<void>;
  handleTogglePlay: () => Promise<void>;
  handleMuteToggle: () => void;
  handleRetry: () => Promise<void>;
  handleAudioEnd: () => void;
}

export interface UseAudioPlayerResult extends AudioPlayerState, AudioPlayerActions {
  audioRef: RefObject<HTMLAudioElement | null>;
  isGenerating: boolean;
  isGeneratingScript: boolean;
  audioUrl: string | null;
  scriptContent: string | null;
  error: string | null;
}
