
import { supabase } from "@/integrations/supabase/client";

interface RealtimeSpeechSession {
  id: string;
  token: string;
  created_at: string;
  expires_at: string;
}

interface RealtimeSpeechOptions {
  instructions?: string;
  modalities?: string[];
  voice?: string;
}

export async function createRealtimeSpeechSession(options: RealtimeSpeechOptions = {}): Promise<RealtimeSpeechSession> {
  try {
    const { data, error } = await supabase.functions.invoke('realtime-speech', {
      body: options
    });

    if (error) {
      throw new Error(`Error invoking realtime-speech function: ${error.message}`);
    }

    if (!data.success || !data.session) {
      throw new Error('Failed to create speech session');
    }

    return data.session;
  } catch (err: any) {
    console.error('Failed to create realtime speech session:', err);
    throw err;
  }
}

export class RealtimeSpeechConnection {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private localStream: MediaStream | null = null;
  private onMessageCallback: ((message: any) => void) | null = null;
  private onStatusChangeCallback: ((status: string) => void) | null = null;
  
  constructor() {
    this.audioElement = new Audio();
    this.audioElement.autoplay = true;
  }

  setCallbacks(callbacks: {
    onMessage?: (message: any) => void;
    onStatusChange?: (status: string) => void;
  }) {
    if (callbacks.onMessage) {
      this.onMessageCallback = callbacks.onMessage;
    }
    
    if (callbacks.onStatusChange) {
      this.onStatusChangeCallback = callbacks.onStatusChange;
    }
  }
  
  private updateStatus(status: string) {
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(status);
    }
  }

  async connect(session: RealtimeSpeechSession): Promise<void> {
    try {
      this.updateStatus('Establishing connection...');
      
      // Create RTCPeerConnection
      this.pc = new RTCPeerConnection();
      
      // Set up data channel for messages
      this.dc = this.pc.createDataChannel('openai-channel');
      this.dc.onmessage = (event) => {
        if (this.onMessageCallback) {
          try {
            const data = JSON.parse(event.data);
            this.onMessageCallback(data);
          } catch (err) {
            console.error('Error parsing message:', err);
          }
        }
      };
      
      // Handle incoming audio track
      this.pc.ontrack = (event) => {
        if (this.audioElement) {
          this.audioElement.srcObject = event.streams[0];
          this.updateStatus('Connected - Audio ready');
        }
      };
      
      // Get local audio stream for microphone
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        
        // Add local audio track to peer connection
        this.localStream.getAudioTracks().forEach(track => {
          if (this.pc) this.pc.addTrack(track, this.localStream!);
        });
        
        this.updateStatus('Microphone access granted');
      } catch (err) {
        console.error('Error accessing microphone:', err);
        this.updateStatus('Microphone access denied');
        throw new Error('Microphone access denied');
      }
      
      // Create offer
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      
      if (!this.pc.localDescription || !this.pc.localDescription.sdp) {
        throw new Error('Failed to create local description');
      }
      
      // Connect to OpenAI's Realtime API using the token from our edge function
      this.updateStatus('Connecting to OpenAI...');
      
      const response = await fetch('https://api.openai.com/v1/realtime', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Content-Type': 'application/sdp'
        },
        body: this.pc.localDescription.sdp
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }
      
      // Get the SDP answer
      const answerSdp = await response.text();
      
      // Apply the remote description
      await this.pc.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp
      });
      
      this.updateStatus('Connection established');
    } catch (err: any) {
      console.error('Error connecting to real-time speech:', err);
      this.updateStatus(`Connection error: ${err.message}`);
      throw err;
    }
  }

  async sendAudio(audioData: ArrayBuffer): Promise<void> {
    if (!this.dc || this.dc.readyState !== 'open') {
      return;
    }
    
    // Send audio data to OpenAI
    this.dc.send(JSON.stringify({
      type: 'audio_data',
      data: btoa(String.fromCharCode(...new Uint8Array(audioData)))
    }));
  }
  
  async sendText(text: string): Promise<void> {
    if (!this.dc || this.dc.readyState !== 'open') {
      return;
    }
    
    // Send text message to OpenAI
    this.dc.send(JSON.stringify({
      type: 'text',
      content: text
    }));
  }
  
  disconnect(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    if (this.dc) {
      this.dc.close();
      this.dc = null;
    }
    
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    
    if (this.audioElement) {
      this.audioElement.srcObject = null;
    }
    
    this.updateStatus('Disconnected');
  }
}
