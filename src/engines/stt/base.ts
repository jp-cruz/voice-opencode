export interface STTEngine {
  initialize(): Promise<void>;
  transcribe(audioBuffer: ArrayBuffer): Promise<string>;
  start(): Promise<void>;
  stop(): void;
  isRecording(): boolean;
  onTranscript(callback: (text: string) => void): void;
}

export interface STTConfig {
  engine: 'whisper' | 'whisper-api' | 'google';
  model?: string;
  language?: string;
  apiKey?: string;
}

export interface AudioDevice {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface STTAdapter {
  initialize(): Promise<void>;
  listDevices(): Promise<AudioDevice[]>;
  setDevice(deviceId: string): void;
}
