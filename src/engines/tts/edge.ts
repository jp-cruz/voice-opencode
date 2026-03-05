// Edge, ElevenLabs, and Google TTS engine implementations
import { spawn } from 'child_process';
import { GoogleTTSEngine } from './google.js';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import type { TTSEngine, TTSConfig, TTSVoice } from './base.js';

/** Sanitize text for TTS */
function sanitizeText(input: string): string {
  return input.replace(/[\x00-\x1F\x7F]/g, '').slice(0, 10000);
}

/** Edge TTS implementation */
export class EdgeTTSEngine implements TTSEngine {
  private config: TTSConfig;
  private currentVoice: string;
  private rate: number;
  private volume: number;
  private speaking = false;

  constructor(config: TTSConfig) {
    this.config = config;
    this.currentVoice = config.voice || 'en-US-guyNeural';
    this.rate = config.rate || 1.0;
    this.volume = config.volume || 1.0;
  }

  async initialize(): Promise<void> {
    console.log('[TTS] Edge TTS initialized');
    console.log(`[TTS] Voice: ${this.currentVoice}`);
  }

  async speak(text: string): Promise<void> {
    this.speaking = true;
    try {
      const safeText = sanitizeText(text);
      await this.speakViaStdin(safeText);
    } finally {
      this.speaking = false;
    }
  }

  private async speakViaStdin(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const rateValue = Math.round((this.rate - 1) * 10);
      const volumeValue = Math.round(this.volume * 100);
      const psScript = `
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoice('${this.currentVoice}')
$synth.Rate = ${rateValue}
$synth.Volume = ${volumeValue}
$synth.Speak('${text.replace(/'/g, "''")}')
`;
      const proc = spawn('powershell', ['-NoProfile', '-NonInteractive', '-Command', psScript]);
      let stderr = '';
      proc.stderr.on('data', (data) => { stderr += data.toString(); });
      proc.on('close', (code) => {
        if (code === 0) resolve(); else reject(new Error(`TTS failed with code ${code}: ${stderr}`));
      });
      proc.on('error', reject);
    });
  }

  stop(): void { this.speaking = false; }
  pause(): void {}
  resume(): void {}
  setVoice(voice: string): void { this.currentVoice = voice; }
  setRate(rate: number): void { this.rate = Math.max(0.5, Math.min(2.0, rate)); }
  setVolume(volume: number): void { this.volume = Math.max(0.0, Math.min(1.0, volume)); }
  isSpeaking(): boolean { return this.speaking; }
  async listVoices(): Promise<TTSVoice[]> {
    return [
      { id: 'en-US-AriaNeural', name: 'Aria', language: 'en-US' },
      { id: 'en-US-JennyNeural', name: 'Jenny', language: 'en-US' },
      { id: 'en-GB-SoniaNeural', name: 'Sonia', language: 'en-GB' },
      { id: 'en-US-GuyNeural', name: 'Guy', language: 'en-US' },
    ];
  }
}

/** ElevenLabs TTS implementation */
export class ElevenLabsTTSEngine implements TTSEngine {
  private config: TTSConfig;
  private currentVoice: string;
  private rate: number;
  private volume: number;
  private speaking = false;
  private apiKey: string;

  constructor(config: TTSConfig) {
    this.config = config;
    this.currentVoice = config.voice || '21m00Tcm4TlvDq8ikWAM';
    this.rate = config.rate || 1.0;
    this.volume = config.volume || 1.0;
    this.apiKey = config.apiKey || '';
  }

  async initialize(): Promise<void> {
    if (!this.apiKey) console.warn('[TTS] ElevenLabs API key not set, TTS will not work');
  }

  async speak(text: string): Promise<void> {
    if (!this.apiKey) throw new Error('ElevenLabs API key required');
    const safeText = sanitizeText(text);
    this.speaking = true;
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.currentVoice}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'xi-api-key': this.apiKey },
        body: JSON.stringify({ text: safeText, model_id: 'eleven_monolingual_v1', voice_settings: { stability: 0.5, similarity_boost: 0.5 } })
      });
      if (!response.ok) throw new Error(`ElevenLabs API error: ${response.statusText}`);
      const audioBuffer = await response.arrayBuffer();
      const tempFile = join(tmpdir(), `voice-opencode-${Date.now()}.mp3`);
      await writeFile(tempFile, Buffer.from(audioBuffer));
      await this.playAudio(tempFile);
      await unlink(tempFile).catch(() => {});
    } finally {
      this.speaking = false;
    }
  }

  private async playAudio(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn('powershell', ['-NoProfile', '-Command', `(New-Object System.Media.SoundPlayer '${filePath}').PlaySync()`]);
      proc.on('close', (code) => code === 0 ? resolve() : reject(new Error(`Audio playback failed with code ${code}`)));
      proc.on('error', reject);
    });
  }

  stop(): void { this.speaking = false; }
  pause(): void {}
  resume(): void {}
  setVoice(voice: string): void { this.currentVoice = voice; }
  setRate(rate: number): void { this.rate = Math.max(0.5, Math.min(2.0, rate)); }
  setVolume(volume: number): void { this.volume = Math.max(0.0, Math.min(1.0, volume)); }
  isSpeaking(): boolean { return this.speaking; }
}

/** Factory to create a TTS engine with fallback */
export function createTTSEngine(config: TTSConfig): TTSEngine {
  switch (config.engine) {
    case 'edge': return new EdgeTTSEngine(config);
    case 'elevenlabs': return new ElevenLabsTTSEngine(config);
    case 'google': return new GoogleTTSEngine(config);
    default:
      console.warn(`[TTS] Unknown engine '${config.engine}', falling back to Edge`);
      return new EdgeTTSEngine(config);
  }
}
