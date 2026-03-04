import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

export interface AppConfig {
  opencode: {
    url: string;
  };
  stt: {
    engine: 'whisper' | 'whisper-api' | 'google';
    model?: string;
    language?: string;
    apiKey?: string;
  };
  tts: {
    engine: 'edge' | 'elevenlabs' | 'coqui';
    voice?: string;
    rate?: number;
    volume?: number;
    apiKey?: string;
  };
  audio: {
    inputDevice?: string;
    outputDevice?: string;
  };
}

export function loadConfig(): AppConfig {
  return {
    opencode: {
      url: process.env.OPENCODE_URL || 'http://localhost:4096',
    },
    stt: {
      engine: (process.env.STT_ENGINE as AppConfig['stt']['engine']) || 'whisper',
      model: process.env.STT_MODEL || 'base',
      language: process.env.STT_LANGUAGE,
      apiKey: process.env.OPENAI_API_KEY,
    },
    tts: {
      engine: (process.env.TTS_ENGINE as AppConfig['tts']['engine']) || 'edge',
      voice: process.env.TTS_VOICE || 'en-US-AriaNeural',
      rate: parseFloat(process.env.TTS_RATE || '1.0'),
      volume: parseFloat(process.env.TTS_VOLUME || '1.0'),
      apiKey: process.env.OPENAI_API_KEY,
    },
    audio: {
      inputDevice: process.env.AUDIO_INPUT_DEVICE,
      outputDevice: process.env.AUDIO_OUTPUT_DEVICE,
    },
  };
}
