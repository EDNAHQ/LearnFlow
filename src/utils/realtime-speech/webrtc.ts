// WebRTC implementation for OpenAI Realtime API
export class RealtimeWebRTC {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private localStream: MediaStream | null = null;
  private clientSecret: string;
  private onSpeakingChange?: (isSpeaking: boolean) => void;
  private onListeningChange?: (isListening: boolean) => void;
  private onMessage?: (message: any) => void;
  private onError?: (error: Error) => void;

  constructor(clientSecret: string, callbacks?: {
    onSpeakingChange?: (isSpeaking: boolean) => void;
    onListeningChange?: (isListening: boolean) => void;
    onMessage?: (message: any) => void;
    onError?: (error: Error) => void;
  }) {
    this.clientSecret = clientSecret;
    this.onSpeakingChange = callbacks?.onSpeakingChange;
    this.onListeningChange = callbacks?.onListeningChange;
    this.onMessage = callbacks?.onMessage;
    this.onError = callbacks?.onError;
  }

  async connect(): Promise<void> {
    try {
      console.log('Initializing WebRTC connection...');

      // Get user media (microphone)
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      console.log('Got microphone access');

      // Create peer connection
      this.peerConnection = new RTCPeerConnection();

      // Add local audio track
      this.localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });

      // Handle incoming audio
      this.peerConnection.ontrack = (event) => {
        console.log('Received remote audio track');
        if (!this.audioElement) {
          this.audioElement = new Audio();
          this.audioElement.autoplay = true;
        }
        this.audioElement.srcObject = event.streams[0];
        this.onSpeakingChange?.(true);
      };

      // Create data channel for events
      this.dataChannel = this.peerConnection.createDataChannel('oai-events');

      this.dataChannel.onopen = () => {
        console.log('Data channel opened');
      };

      this.dataChannel.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Received message:', message);
          this.onMessage?.(message);

          // Handle specific event types
          if (message.type === 'response.audio.delta') {
            this.onSpeakingChange?.(true);
          } else if (message.type === 'response.audio.done') {
            this.onSpeakingChange?.(false);
          }
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      };

      // Create offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      console.log('Created offer, sending to OpenAI...');

      // Send offer to OpenAI
      const response = await fetch('https://api.openai.com/v1/realtime/calls', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.clientSecret}`,
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
      });

      if (!response.ok) {
        throw new Error(`Failed to connect: ${response.status} ${response.statusText}`);
      }

      const answerSdp = await response.text();
      console.log('Received answer from OpenAI');

      // Set remote description
      await this.peerConnection.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp,
      });

      console.log('WebRTC connection established');
      this.onListeningChange?.(true);
    } catch (error) {
      console.error('WebRTC connection error:', error);
      this.onError?.(error as Error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    console.log('Disconnecting WebRTC...');

    // Close data channel
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Stop local media
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Stop audio
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.srcObject = null;
      this.audioElement = null;
    }

    this.onListeningChange?.(false);
    this.onSpeakingChange?.(false);
  }

  sendMessage(message: any): void {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(message));
    } else {
      console.warn('Data channel not ready');
    }
  }

  toggleMicrophone(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
      this.onListeningChange?.(enabled);
    }
  }
}
