
import { MutableRefObject } from "react";

export interface AudioState {
  isPlaying: boolean;
  isMuted: boolean;
  isAudioLoaded: boolean;
  showControls: boolean;
  showScriptEditor: boolean;
  editableScript: string;
}

export interface AudioStateActions {
  setIsPlaying: (isPlaying: boolean) => void;
  setIsMuted: (isMuted: boolean) => void;
  setIsAudioLoaded: (isAudioLoaded: boolean) => void;
  setShowControls: (showControls: boolean) => void;
  setShowScriptEditor: (showScriptEditor: boolean) => void;
  setEditableScript: (editableScript: string) => void;
}

export interface AudioActionOptions {
  audioRef: MutableRefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  isMuted: boolean;
  editableScript: string;
  isGenerating: boolean;
  audioUrl: string | null;
  setEditableScript: (script: string) => void;
  setShowScriptEditor: (show: boolean) => void;
  setShowControls: (show: boolean) => void;
  setIsMuted: (muted: boolean) => void;
  generateScript: (topic: string, steps: any[]) => Promise<string>;
  generateSpeech: (text: string) => Promise<void>;
  cleanup: () => void;
  steps: any[];
  topic: string;
}

export interface AudioActions {
  handleTogglePlay: () => void;
  handleMuteToggle: () => void;
  handleRetry: () => void;
  handleAudioEnd: () => void;
  handleGenerateScript: () => Promise<void>;
  handleGenerateAudio: () => Promise<void>;
}

export interface UseAudioPlayerResult extends AudioState, AudioActions {
  audioRef: MutableRefObject<HTMLAudioElement | null>;
  isGenerating: boolean;
  isGeneratingScript: boolean;
  audioUrl: string | null;
  scriptContent: string | null;
  error: string | null;
  setScriptContent: (content: string) => void;
}
