
export interface RealtimeSpeechSession {
  id: string;
  token: string;
  created_at: string;
  expires_at: string;
}

export interface RealtimeSpeechOptions {
  instructions?: string;
  modalities?: string[];
  voice?: string;
}

export interface RealtimeSpeechCallbacks {
  onMessage?: (message: any) => void;
  onStatusChange?: (status: string) => void;
}
