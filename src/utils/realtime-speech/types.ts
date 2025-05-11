
export interface RealtimeSpeechSession {
  id: string;
  token: string;
  created_at: string;
  expires_at: string;
  url?: string;
  expires?: string;
}

export interface RealtimeSpeechOptions {
  instructions?: string;
  modalities?: string[];
  voice?: string;
  topic?: string;
  initialPrompt?: string;
  pathId?: string;
  content?: string;
}

export interface RealtimeSpeechCallbacks {
  onMessage?: (message: any) => void;
  onStatusChange?: (status: string) => void;
}
