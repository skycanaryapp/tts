import {
  GoogleGenAI,
  LiveServerMessage,
  MediaResolution,
  Modality,
  Session,
} from '@google/genai';

export interface AudioChunk {
  data: string;
  mimeType: string;
  timestamp: number;
}

export interface GeminiLiveConfig {
  apiKey: string;
  agentId: string;
  userId: string;
  onAudioReceived: (audioChunk: AudioChunk) => void;
  onTextReceived: (text: string) => void;
  onError: (error: string) => void;
  onConnectionChange: (status: 'connecting' | 'connected' | 'disconnected') => void;
}

export class GeminiLiveService {
  private session: Session | undefined;
  private responseQueue: LiveServerMessage[] = [];
  private config: GeminiLiveConfig;
  private audioParts: string[] = [];
  private isProcessing = false;

  constructor(config: GeminiLiveConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      this.config.onConnectionChange('connecting');
      
      const ai = new GoogleGenAI({
        apiKey: this.config.apiKey,
      });

      const model = 'models/gemini-2.5-flash-preview-native-audio-dialog';

      const sessionConfig = {
        responseModalities: [Modality.AUDIO],
        mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'Laomedeia', // Can be customized per agent
            }
          }
        },
        contextWindowCompression: {
          triggerTokens: '25600',
          slidingWindow: { targetTokens: '12800' },
        },
        systemInstruction: {
          parts: [{
            text: this.getZokaSystemInstruction()
          }]
        },
      };

      this.session = await ai.live.connect({
        model,
        callbacks: {
          onopen: () => {
            console.debug('Gemini Live session opened');
            this.config.onConnectionChange('connected');
          },
          onmessage: (message: LiveServerMessage) => {
            this.responseQueue.push(message);
            if (!this.isProcessing) {
              this.processMessages();
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Gemini Live error:', e.message);
            this.config.onError(`Connection error: ${e.message}`);
            this.config.onConnectionChange('disconnected');
          },
          onclose: (e: CloseEvent) => {
            console.debug('Gemini Live session closed:', e.reason);
            this.config.onConnectionChange('disconnected');
          },
        },
        config: sessionConfig
      });

      // Send initial greeting
      await this.sendMessage("مرحبا");

    } catch (error) {
      console.error('Failed to connect to Gemini Live:', error);
      this.config.onError(`Failed to connect: ${error}`);
      this.config.onConnectionChange('disconnected');
      throw error;
    }
  }

  async sendMessage(text: string): Promise<void> {
    if (!this.session) {
      throw new Error('Session not connected');
    }

    try {
      await this.session.sendClientContent({
        turns: [text]
      });
    } catch (error) {
      console.error('Error sending message:', error);
      this.config.onError(`Failed to send message: ${error}`);
    }
  }

  async sendAudioData(audioData: ArrayBuffer): Promise<void> {
    if (!this.session) {
      throw new Error('Session not connected');
    }

    try {
      // Convert audio data to base64
      const base64Audio = this.arrayBufferToBase64(audioData);
      
      await this.session.sendClientContent({
        turns: [{
          inlineData: {
            mimeType: 'audio/wav',
            data: base64Audio
          }
        }]
      });
    } catch (error) {
      console.error('Error sending audio:', error);
      this.config.onError(`Failed to send audio: ${error}`);
    }
  }

  private async processMessages(): Promise<void> {
    this.isProcessing = true;

    while (this.responseQueue.length > 0) {
      const message = this.responseQueue.shift();
      if (message) {
        await this.handleMessage(message);
      }
    }

    this.isProcessing = false;
  }

  private async handleMessage(message: LiveServerMessage): Promise<void> {
    if (message.serverContent?.modelTurn?.parts) {
      const part = message.serverContent.modelTurn.parts[0];

      // Handle file data
      if (part?.fileData) {
        console.log(`File received: ${part.fileData.fileUri}`);
      }

      // Handle inline audio data
      if (part?.inlineData) {
        const inlineData = part.inlineData;
        this.audioParts.push(inlineData.data ?? '');

        // Process and emit audio chunk
        const audioChunk: AudioChunk = {
          data: inlineData.data ?? '',
          mimeType: inlineData.mimeType ?? 'audio/wav',
          timestamp: Date.now()
        };

        this.config.onAudioReceived(audioChunk);
      }

      // Handle text response
      if (part?.text) {
        console.log('Zoka response:', part.text);
        this.config.onTextReceived(part.text);
      }
    }
  }

  private getZokaSystemInstruction(): string {
    return `---

### 1. VOICE AGENT OVERVIEW

* **Agent Name**: لينا (Lina)
* **Agent Type**: Real-time conversational voice assistant for Zoka Café & Restaurant in Abdoun, Amman.
* **Primary Channel**: Live audio (text-to-speech) with optional text captions.

### 2. CORE PRINCIPLES

* **Hospitality First**: Emulate genuine Jordanian warmth and Ammani hospitality in every interaction.
* **User-Led Pricing**: Never speak about prices unless the user explicitly requests them. If asked, supply **exact** prices from the menu source.
* **Concise & Relevant**: Keep responses succinct; focus on user questions and the café experience.

### 3. VOICE SETTINGS & PARAMETERS

* **Language**: Arabic, Jordanian dialect (اللهجة الأردنية البيضاء)
* **Accent & Tone**: Clear, friendly, slightly upbeat; natural cadence with subtle local inflections.
* **Timbre**: Warm midrange voice, moderate speaking speed.
* **Pause Patterns**: Brief pauses before and after listing menu items or phone numbers.
* **Emojis & Non‑Verbal Cues**: Represent with short audio cues (e.g., light chime for greetings, soft exhale after menu lists).

### 4. DIALOGUE STRUCTURE

1. **Greeting**: Start every call with signature phrase and audio cue:
   * Spoken: "أهلاً وسهلاً في زوكا كافيه! أنا لينا، كيف بقدر أخدمك اليوم؟"
   * Cue: light welcoming chime.
2. **Clarification**: If the user's request is vague, prompt: "ممكن توضّح لي أكثر عشان أقدر أساعدك؟"
3. **Information Delivery**:
   * Answer directly and clearly.
   * For lists, speak items with numbered or bullet pauses.
4. **Closing**: Invite follow‑up and farewell:
   * "بأي خدمة تانية؟ بنتشرّف بزيارتك!"
   * Cue: soft closing tone.

### 5. ZOKA MENU & INFORMATION

**LOCATION**: Abdoun, Amman, Jordan
**PHONE**: 0797326665
**SPECIALTIES**: 
- Fresh pastries and manaqish
- Premium coffee selection
- Traditional Arabic breakfast
- International cuisine
- Terrace dining with sunset views

**POPULAR ITEMS**:
- Manqoushe with zaatar
- Arabic coffee and Turkish coffee
- Fresh saj bread
- Shakshuka and eggs
- Fresh juices and smoothies
- Knafeh and Arabic desserts

**HOURS**: 7:00 AM - 11:00 PM daily
**AMENITIES**: Free WiFi, Terrace seating, Parking available

### 6. PERSONA & BACKSTORY

* **Personality**: Cheerful, professional, sincerely passionate about Zoka's offerings.
* **Backstory**: Ammani local who grew up enjoying terrace sunsets at Zoka; sees every call as welcoming a friend.

### 7. KNOWLEDGE BOUNDARIES

* **Allowed Data**: Only use menu items, opening hours, location, amenities, and reservation policy from the supplied data.
* **Reservations & Orders**: Cannot process via voice—refer user to call or visit:
  > "بتشرّفونا! لأخذ الحجز تقدروا تتصلوا على 0797326665."
* **Unknown Topics**: If out of scope, respond:
  > "والله ما عندي فكرة أكيدة بهالمعلومة، الأفضل تتأكد من الكافيه على الرقم 0797326665."

### 8. BEHAVIORAL RULES & GUARDRAILS

* **No External Guesswork**: Do not invent details.
* **Respect User Leads**: Only introduce extras (e.g., terrace tip) when contextually relevant.
* **Ethical Responses**: Avoid sensitive topics unrelated to café service.

### 9. TECHNICAL INTEGRATION NOTES

* **Audio Input**: Accepts user speech, auto‑punctuated transcripts.
* **TTS Engine**: Integrate with approved TTS model supporting Arabic Jordanian dialect.
* **Fallback**: On speech recognition errors, prompt: "عذراً، ما سمعت تمام. ممكن تعيد سؤالك؟"

---`;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  async disconnect(): Promise<void> {
    if (this.session) {
      try {
        await this.session.close();
      } catch (error) {
        console.error('Error closing session:', error);
      }
      this.session = undefined;
    }
    this.audioParts = [];
    this.responseQueue = [];
    this.config.onConnectionChange('disconnected');
  }

  isConnected(): boolean {
    return this.session !== undefined;
  }

  // Utility method to convert accumulated audio parts to WAV
  getAccumulatedAudio(): ArrayBuffer | null {
    if (this.audioParts.length === 0) return null;

    try {
      const buffer = this.convertToWav(this.audioParts, 'audio/wav');
      return buffer;
    } catch (error) {
      console.error('Error converting audio:', error);
      return null;
    }
  }

  private convertToWav(rawData: string[], mimeType: string): ArrayBuffer {
    const options = this.parseMimeType(mimeType);
    const combinedData = rawData.join('');
    const buffer = Buffer.from(combinedData, 'base64');
    const wavHeader = this.createWavHeader(buffer.length, options);
    
    const wavBuffer = Buffer.concat([wavHeader, buffer]);
    return wavBuffer.buffer.slice(wavBuffer.byteOffset, wavBuffer.byteOffset + wavBuffer.byteLength);
  }

  private parseMimeType(mimeType: string) {
    const [fileType, ...params] = mimeType.split(';').map(s => s.trim());
    const [_, format] = fileType.split('/');

    const options = {
      numChannels: 1,
      bitsPerSample: 16,
      sampleRate: 24000, // Gemini outputs at 24kHz
    };

    if (format && format.startsWith('L')) {
      const bits = parseInt(format.slice(1), 10);
      if (!isNaN(bits)) {
        options.bitsPerSample = bits;
      }
    }

    for (const param of params) {
      const [key, value] = param.split('=').map(s => s.trim());
      if (key === 'rate') {
        options.sampleRate = parseInt(value, 10);
      }
    }

    return options;
  }

  private createWavHeader(dataLength: number, options: { numChannels: number; sampleRate: number; bitsPerSample: number }): Buffer {
    const { numChannels, sampleRate, bitsPerSample } = options;

    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const buffer = Buffer.alloc(44);

    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataLength, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20);
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(byteRate, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(bitsPerSample, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataLength, 40);

    return buffer;
  }
}