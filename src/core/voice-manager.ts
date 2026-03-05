import { createSTTEngine, type STTEngine } from '../engines/stt/whisper';
import { createTTSEngine } from '../engines/tts/edge';
import type { TTSEngine } from '../engines/tts/base';
import { createMicrophone, createAudioPlayer, type AudioRecorder, type AudioPlayer } from '../audio/index';
import type { AppConfig } from '../config/index';

import { loadSession, saveSession } from './session';
import type { Session } from './session';

export class VoiceManager {
  private stt: STTEngine | null = null;
  private tts: TTSEngine | null = null;
  private recorder: AudioRecorder;
  private player: AudioPlayer;
  private config: AppConfig;
  private isRecording = false;
  private isProcessing = false;
  private sttEnabled = true;
  private ttsEnabled = true;
  private session: Session;

  constructor(config: AppConfig, sttEnabled = true, ttsEnabled = true) {
    this.config = config;
    this.sttEnabled = sttEnabled;
    this.ttsEnabled = ttsEnabled;
    
    this.recorder = createMicrophone();
    this.player = createAudioPlayer();
    
    if (sttEnabled) {
      this.stt = createSTTEngine(config.stt);
    }
    if (ttsEnabled) {
      this.tts = createTTSEngine(config.tts);
    }
    // Load persisted session history
    this.session = { history: [] };
    loadSession().then(s => this.session = s);
  }

  async initialize(): Promise<void> {
    console.log('[Voice] Initializing voice system...');
    
    if (this.stt && this.sttEnabled) {
      await this.stt.initialize();
    }
    if (this.tts && this.ttsEnabled) {
      await this.tts.initialize();
    }
    
    console.log('[Voice] Voice system ready');
  }

  async startRecording(): Promise<void> {
    if (this.isRecording || this.isProcessing) return;
    
    this.isRecording = true;
    await this.recorder.start();
    console.log('[Voice] 🎤 Recording... (press SPACE to stop)');
  }

  async stopRecording(): Promise<ArrayBuffer> {
    if (!this.isRecording) {
      throw new Error('Not recording');
    }
    
    this.isRecording = false;
    this.isProcessing = true;
    
    try {
      const audioBuffer = await this.recorder.stop();
      console.log('[Voice] Processing audio...');
      return audioBuffer;
    } finally {
      this.isProcessing = false;
    }
  }

  async transcribe(audioBuffer: ArrayBuffer): Promise<string> {
    if (audioBuffer.byteLength === 0 || !this.stt) {
      return '';
    }
    
    const text = await this.stt.transcribe(audioBuffer);
    // Persist to session history
    if (text) {
      this.session.history.push(text);
      saveSession(this.session).catch(() => {});
    }
    return text;
  }

  async speak(text: string): Promise<void> {
    if (!text || !this.tts) return;
    
    console.log(`[Voice] 🔊 Speaking: ${text.substring(0, 50)}...`);
    await this.tts.speak(text);
    // Persist spoken text as well
    this.session.history.push(text);
    saveSession(this.session).catch(() => {});
  }

  getRecordingState(): boolean {
    return this.isRecording;
  }

  getProcessingState(): boolean {
    return this.isProcessing;
  }

  /** Return the full conversation history */
  getConversationHistory(): string[] {
    return [...this.session.history];
  }

  stop(): void {
    if (this.isRecording) {
      this.recorder.stop();
      this.isRecording = false;
    }
    if (this.tts) {
      this.tts.stop();
    }
  }

  /** Listen for a wake word and resolve when detected */
  async listenForWakeWord(wakeWord: string, maxDurationMs = 5000): Promise<void> {
    console.log(`[Voice] Listening for wake word "${wakeWord}"...`);
    while (true) {
      await this.startRecording();
      // Record for maxDurationMs then stop
      const audio = await new Promise<ArrayBuffer>((resolve) => {
        setTimeout(async () => {
          const buf = await this.stopRecording();
          resolve(buf);
        }, maxDurationMs);
      });
      const text = await this.transcribe(audio);
      if (text.toLowerCase().includes(wakeWord.toLowerCase())) {
        console.log(`[Voice] Wake word "${wakeWord}" detected`);
        break;
      }
    }
  }
}

export function createVoiceManager(config: AppConfig, sttEnabled = true, ttsEnabled = true): VoiceManager {
  return new VoiceManager(config, sttEnabled, ttsEnabled);
}
