
// Types for the realtime speech hook modules
import { RealtimeSpeechConnection } from '@/utils/realtime-speech';

export interface Message {
  role: string;
  content: string;
}

export interface RealtimeSpeechState {
  isConnecting: boolean;
  isConnected: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  status: string;
  messages: Message[];
}

export interface RealtimeSpeechOptions {
  topic: string;
  initialPrompt?: string;
  pathId?: string;
}

export interface RealtimeSpeechContextOptions {
  topic: string;
  steps: any[];
}
