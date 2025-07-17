import { GeminiLiveService, GeminiLiveConfig, AudioChunk } from './GeminiLiveService';

export interface AudioServiceConfig {
  apiKey: string;
  onTextReceived: (text: string) => void;
  onConnectionChange: (status: 'connecting' | 'connected' | 'disconnected') => void;
  onError: (error: string) => void;
}

export class EnhancedAudioService {
  private geminiService: GeminiLiveService | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private audioQueue: AudioChunk[] = [];
  private isPlaying = false;
  private config: AudioServiceConfig;

  constructor(config: AudioServiceConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      // Initialize audio context and media stream
      await this.initializeAudio();
      
      // Initialize Gemini Live service
      await this.initializeGeminiLive();
      
      console.log('Enhanced Audio Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Enhanced Audio Service:', error);
      throw error;
    }
  }

  private async initializeAudio(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.audioContext = new AudioContext({ sampleRate: 16000 });
      this.setupMediaRecorder();
    } catch (error) {
      throw new Error(`Failed to initialize audio: ${error}`);
    }
  }

  private async initializeGeminiLive(): Promise<void> {
    const geminiConfig: GeminiLiveConfig = {
      apiKey: this.config.apiKey,
      agentId: 'zoka',
      userId: 'user_session',
      onAudioReceived: (audioChunk: AudioChunk) => {
        this.handleAudioChunk(audioChunk);
      },
      onTextReceived: (text: string) => {
        this.config.onTextReceived(text);
      },
      onError: (error: string) => {
        this.config.onError(error);
      },
      onConnectionChange: (status) => {
        this.config.onConnectionChange(status);
      }
    };

    this.geminiService = new GeminiLiveService(geminiConfig);
  }

  async connect(): Promise<void> {
    if (!this.geminiService) {
      throw new Error('Gemini service not initialized');
    }

    try {
      await this.geminiService.connect();
    } catch (error) {
      console.error('Failed to connect to Gemini Live:', error);
      throw error;
    }
  }

  private setupMediaRecorder(): void {
    if (!this.stream) return;

    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: 'audio/webm;codecs=opus'
    });

    this.mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0 && this.geminiService?.isConnected()) {
        try {
          const arrayBuffer = await event.data.arrayBuffer();
          await this.geminiService.sendAudioData(arrayBuffer);
        } catch (error) {
          console.error('Error sending audio data:', error);
        }
      }
    };

    this.mediaRecorder.onerror = (event) => {
      console.error('MediaRecorder error:', event);
      this.config.onError('Microphone recording error');
    };
  }

  private async handleAudioChunk(audioChunk: AudioChunk): Promise<void> {
    this.audioQueue.push(audioChunk);
    
    if (!this.isPlaying) {
      await this.playNextAudioChunk();
    }
  }

  private async playNextAudioChunk(): Promise<void> {
    if (this.audioQueue.length === 0 || !this.audioContext) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const audioChunk = this.audioQueue.shift()!;

    try {
      // Convert base64 to ArrayBuffer
      const binaryString = atob(audioChunk.data);
      const arrayBuffer = new ArrayBuffer(binaryString.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }

      // Decode and play audio
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      source.onended = () => {
        // Play next chunk in queue
        setTimeout(() => this.playNextAudioChunk(), 50);
      };

      source.start();
    } catch (error) {
      console.error('Error playing audio chunk:', error);
      // Continue with next chunk even if this one failed
      setTimeout(() => this.playNextAudioChunk(), 100);
    }
  }

  async sendTextMessage(text: string): Promise<void> {
    if (!this.geminiService?.isConnected()) {
      throw new Error('Not connected to Gemini Live');
    }

    try {
      await this.geminiService.sendMessage(text);
    } catch (error) {
      console.error('Error sending text message:', error);
      throw error;
    }
  }

  startRecording(): void {
    if (this.mediaRecorder?.state === 'inactive') {
      try {
        this.mediaRecorder.start(250); // Send chunks every 250ms for smoother streaming
        console.log('Started recording audio');
      } catch (error) {
        console.error('Error starting recording:', error);
        this.config.onError('Failed to start recording');
      }
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder?.state === 'recording') {
      try {
        this.mediaRecorder.stop();
        console.log('Stopped recording audio');
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    }
  }

  async disconnect(): Promise<void> {
    try {
      // Stop recording
      this.stopRecording();

      // Stop audio playback
      this.isPlaying = false;
      this.audioQueue = [];

      // Close audio context
      if (this.audioContext && this.audioContext.state !== 'closed') {
        await this.audioContext.close();
      }

      // Stop media stream
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }

      // Disconnect Gemini service
      if (this.geminiService) {
        await this.geminiService.disconnect();
      }

      console.log('Enhanced Audio Service disconnected');
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  }

  isConnected(): boolean {
    return this.geminiService?.isConnected() ?? false;
  }

  // Get current audio queue length for UI feedback
  getQueueLength(): number {
    return this.audioQueue.length;
  }

  // Clear audio queue (useful for interrupting responses)
  clearAudioQueue(): void {
    this.audioQueue = [];
    this.isPlaying = false;
  }
}