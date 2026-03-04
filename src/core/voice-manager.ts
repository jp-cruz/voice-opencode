import { createSTTEngine, type STTEngine } from '../engines/stt/whisper';
import { createTTSEngine, type TTSEngine } from '../engines/tts/edge';
import { createMicrophone, createAudioPlayer, type AudioRecorder, type AudioPlayer } from '../audio/index';
import type { AppConfig } from '../config/index';

export { type STTEngine };
export { type TTSEngine };

export class VoiceManager {
  private stt: STTEngine;
  private tts: TTSEngine;
  private recorder: AudioRecorder;
  private player: AudioPlayer;
  private config: AppConfig;
  private transcriptCallback: ((text: string) => void) | null = null;

  constructor(config: AppConfig) {
    this.config = config;
    this.stt = createSTTEngine(config.stt);
    this.tts = createTTSEngine(config.tts);
    this.recorder = createMicrophone();
    this.player = createAudioPlayer();
  }

  async initialize(): Promise<void> {
    console.log('[Voice] Initializing voice system...');
    
    await this.stt.initialize();
    await this.tts.initialize();
    
    console.log('[Voice] Voice system ready');
  }

  async startRecording(): Promise<void> {
    await this.recorder.start();
    await this.stt.start();
    console.log('[Voice] Recording... (press SPACE to stop)');
  }

  async stopRecording(): Promise<string> {
    this.recorder.stop();
    this.stt.stop();
    console.log('[Voice] Processing audio...');
    
    // In a full implementation, we would:
    // 1. Get audio buffer from recorder
    // 2. Transcribe with STT
    // 3. Return text
    // For now, return empty as recording needs proper implementation
    
    return '';
  }

  async speak(text: string): Promise<void> {
    console.log(`[Voice] Speaking: ${text.substring(0, 50)}...`);
    await this.tts.speak(text);
  }

  onTranscript(callback: (text: string) => void): void {
    this.transcriptCallback = callback;
  }

  isRecording(): boolean {
    return this.recorder.isRecording();
  }

  isSpeaking(): boolean {
    return this.tts.isSpeaking();
  }

  stop(): void {
    this.recorder.stop();
    this.tts.stop();
  }
}

export function createVoiceManager(config: AppConfig): VoiceManager {
  return new VoiceManager(config);
}
