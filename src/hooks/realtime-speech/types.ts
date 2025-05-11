
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface RealtimeSpeechOptions {
  topic?: string;
  voice?: string;
  initialPrompt?: string;
  pathId?: string;
  content?: string;
  instructions?: string;
  modalities?: string[];
}

export interface RealtimeSpeechSession {
  id: string;
  url: string;
  expires: string;
}

export interface RealtimeSpeechState {
  isConnecting: boolean;
  isConnected: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  messages: Message[];
  error: string | null;
}

export interface RealtimeSpeechContextOptions {
  topic: string;
  steps: Array<{
    id: string;
    title: string;
    content?: string;
  }>;
}
