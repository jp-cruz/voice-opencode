// Google Cloud Text-to-Speech Engine
// This is a minimal implementation using the Google Cloud TTS REST API.
// Requires GOOGLE_APPLICATION_CREDENTIALS env var pointing to a service account JSON.

import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { spawn } from 'child_process';
import type { TTSEngine, TTSConfig } from './base.js';

export class GoogleTTSEngine implements TTSEngine {
  private config: TTSConfig;
  private currentVoice: string;
  private rate: number;
  private volume: number;
  private speaking = false;
  private apiKey: string | undefined;

  constructor(config: TTSConfig) {
    this.config = config;
    this.currentVoice = config.voice || 'en-US-Wavenet-D';
    this.rate = config.rate || 1.0;
    this.volume = config.volume || 1.0;
    // Google uses a separate auth token; we will fetch it via metadata server if needed.
    this.apiKey = config.apiKey; // optional, can be omitted when using service account.
  }

  async initialize(): Promise<void> {
    console.log('[TTS] Google TTS initialized');
    console.log(`[TTS] Voice: ${this.currentVoice}`);
  }

  async speak(text: string): Promise<void> {
    this.speaking = true;
    try {
      const requestBody = {
        input: { text },
        voice: { languageCode: this.currentVoice.split('-')[0], name: this.currentVoice },
        audioConfig: { audioEncoding: 'MP3', speakingRate: this.rate, volumeGainDb: (this.volume - 1) * 10 }
      };
      const url = 'https://texttospeech.googleapis.com/v1/text:synthesize';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (this.apiKey) {
        headers['X-Goog-Api-Key'] = this.apiKey;
      }
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        throw new Error(`Google TTS error: ${response.statusText}`);
      }
      const data = await response.json() as any;
      const audioBase64 = data.audioContent as string;
      const audioBuffer = Buffer.from(audioBase64, 'base64');
      const tempFile = join(tmpdir(), `voice-opencode-${Date.now()}.mp3`);
      await writeFile(tempFile, audioBuffer);
      await this.playAudio(tempFile);
      await unlink(tempFile).catch(() => {});
    } finally {
      this.speaking = false;
    }
  }

  private async playAudio(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn('powershell', ['-NoProfile', '-Command', `(New-Object System.Media.SoundPlayer '${filePath}').PlaySync()`]);
      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Audio playback failed with code ${code}`));
      });
      proc.on('error', reject);
    });
  }

  stop(): void {
    this.speaking = false;
  }
  pause(): void {}
  resume(): void {}
  setVoice(voice: string): void { this.currentVoice = voice; }
  setRate(rate: number): void { this.rate = Math.max(0.5, Math.min(2.0, rate)); }
  setVolume(volume: number): void { this.volume = Math.max(0.0, Math.min(1.0, volume)); }
  isSpeaking(): boolean { return this.speaking; }
}
