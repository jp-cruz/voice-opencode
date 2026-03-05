import OpenAI from 'openai';
import type { STTEngine, STTConfig, AudioDevice } from './base.js';

export type { STTEngine, STTConfig, AudioDevice } from './base.js';

export class WhisperAPIEngine implements STTEngine {
  private client: OpenAI | null = null;
  private config: STTConfig;
  private recording = false;
  private transcriptCallback: ((text: string) => void) | null = null;

  constructor(config: STTConfig) {
    this.config = config;
    if (config.apiKey) {
      this.client = new OpenAI({ apiKey: config.apiKey });
    }
  }

  async initialize(): Promise<void> {
    if (!this.client && this.config.apiKey) {
      this.client = new OpenAI({ apiKey: this.config.apiKey });
    }
    if (!this.client) {
      throw new Error('OpenAI API key required for Whisper STT');
    }
  }

  async transcribe(audioBuffer: ArrayBuffer): Promise<string> {
    if (!this.client) {
      throw new Error('STT engine not initialized');
    }

     
    const audioBlob: any = new Blob([audioBuffer], { type: 'audio/webm' });
    audioBlob.name = 'audio.webm';
    
    const response = await this.client.audio.transcriptions.create({
      file: audioBlob,
      model: 'whisper-1',
      language: this.config.language,
    });

    return response.text;
  }

  async start(): Promise<void> {
    this.recording = true;
  }

  stop(): void {
    this.recording = false;
  }

  isRecording(): boolean {
    return this.recording;
  }

  onTranscript(callback: (text: string) => void): void {
    this.transcriptCallback = callback;
  }

  getClient(): OpenAI | null {
    return this.client;
  }
}

export class WhisperLocalEngine implements STTEngine {
  private config: STTConfig;
  private recording = false;
  private transcriptCallback: ((text: string) => void) | null = null;

  constructor(config: STTConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    console.log('[STT] Local Whisper not yet implemented');
    console.log('[STT] Use whisper-api for cloud-based STT');
  }

  async transcribe(audioBuffer: ArrayBuffer): Promise<string> {
    throw new Error('Local Whisper not implemented. Use whisper-api.');
  }

  async start(): Promise<void> {
    this.recording = true;
  }

  stop(): void {
    this.recording = false;
  }

  isRecording(): boolean {
    return this.recording;
  }

  onTranscript(callback: (text: string) => void): void {
    this.transcriptCallback = callback;
  }
}

export function createSTTEngine(config: STTConfig): STTEngine {
  switch (config.engine) {
    case 'whisper-api':
      return new WhisperAPIEngine(config);
    case 'whisper':
      return new WhisperLocalEngine(config);
    default:
      throw new Error(`Unknown STT engine: ${config.engine}`);
  }
}
