export interface TTSEngine {
  initialize(): Promise<void>;
  speak(text: string): Promise<void>;
  stop(): void;
  pause(): void;
  resume(): void;
  setVoice(voice: string): void;
  setRate(rate: number): void;
  setVolume(volume: number): void;
  isSpeaking(): boolean;
}

export interface TTSConfig {
  engine: 'edge' | 'elevenlabs' | 'coqui';
  voice?: string;
  rate?: number;
  volume?: number;
  apiKey?: string;
}

export interface TTSVoice {
  id: string;
  name: string;
  language: string;
  gender?: string;
}

export interface TTSAdapter {
  initialize(): Promise<void>;
  listVoices(): Promise<TTSVoice[]>;
  getAvailableEngines(): string[];
}
