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

export interface CLIArgs {
  help: boolean;
  version: boolean;
  opencodeUrl?: string;
  sttEngine?: string;
  ttsEngine?: string;
  ttsVoice?: string;
  ttsRate?: number;
  ttsVolume?: number;
  language?: string;
  noTts: boolean;
  noStt: boolean;
}

const VERSION = '0.1.0';

export function parseArgs(args: string[] = process.argv): CLIArgs {
  const result: CLIArgs = {
    help: false,
    version: false,
    noTts: false,
    noStt: false,
  };

  for (let i = 2; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case '-h':
      case '--help':
        result.help = true;
        break;
      case '-v':
      case '--version':
        result.version = true;
        break;
      case '-u':
      case '--url':
        if (next && !next.startsWith('-')) {
          result.opencodeUrl = next;
          i++;
        }
        break;
      case '--stt':
        if (next && !next.startsWith('-')) {
          result.sttEngine = next;
          i++;
        }
        break;
      case '--tts':
        if (next && !next.startsWith('-')) {
          result.ttsEngine = next;
          i++;
        }
        break;
      case '--voice':
        if (next && !next.startsWith('-')) {
          result.ttsVoice = next;
          i++;
        }
        break;
      case '--rate':
        if (next && !next.startsWith('-')) {
          result.ttsRate = parseFloat(next);
          i++;
        }
        break;
      case '--volume':
        if (next && !next.startsWith('-')) {
          result.ttsVolume = parseFloat(next);
          i++;
        }
        break;
      case '--lang':
        if (next && !next.startsWith('-')) {
          result.language = next;
          i++;
        }
        break;
      case '--no-tts':
        result.noTts = true;
        break;
      case '--no-stt':
        result.noStt = true;
        break;
    }
  }

  return result;
}

export function showHelp(): void {
  console.log(`
Voice OpenCode v${VERSION}

Usage: bun run start [options]

Options:
  -h, --help           Show this help message
  -v, --version        Show version number
  -u, --url <url>      OpenCode server URL (default: http://localhost:4096)
  --stt <engine>       STT engine: whisper, whisper-api, google
  --tts <engine>       TTS engine: edge, elevenlabs, coqui
  --voice <voice>      TTS voice name
  --rate <rate>        TTS rate (0.5-2.0)
  --volume <volume>    TTS volume (0.0-1.0)
  --lang <lang>       Language code (en, ko, etc.)
  --no-tts            Disable TTS
  --no-stt            Disable STT

Examples:
  bun run start
  bun run start --url http://localhost:4096
  bun run start --tts elevenlabs --voice Rachel
  bun run start --lang en --no-tts

Environment Variables:
  OPENCODE_URL         OpenCode server URL
  STT_ENGINE          Speech-to-text engine
  TTS_ENGINE          Text-to-speech engine
  TTS_VOICE           TTS voice
  OPENAI_API_KEY      API key for cloud STT/TTS

For more information, see: https://github.com/jp-cruz/voice-opencode
`);
}

export function showVersion(): void {
  console.log(`voice-opencode v${VERSION}`);
}

export function loadConfig(args?: string[]): AppConfig {
  const cliArgs = parseArgs(args);

  if (cliArgs.help) {
    showHelp();
    process.exit(0);
  }

  if (cliArgs.version) {
    showVersion();
    process.exit(0);
  }

  return {
    opencode: {
      url: cliArgs.opencodeUrl || process.env.OPENCODE_URL || 'http://localhost:4096',
    },
    stt: {
      engine: (cliArgs.sttEngine as AppConfig['stt']['engine']) 
        || (process.env.STT_ENGINE as AppConfig['stt']['engine']) 
        || 'whisper-api',
      model: process.env.STT_MODEL || 'base',
      language: cliArgs.language || process.env.STT_LANGUAGE,
      apiKey: process.env.OPENAI_API_KEY,
    },
    tts: {
      engine: (cliArgs.ttsEngine as AppConfig['tts']['engine'])
        || (process.env.TTS_ENGINE as AppConfig['tts']['engine'])
        || 'edge',
      voice: cliArgs.ttsVoice || process.env.TTS_VOICE || 'en-US-AriaNeural',
      rate: cliArgs.ttsRate ?? parseFloat(process.env.TTS_RATE || '1.0'),
      volume: cliArgs.ttsVolume ?? parseFloat(process.env.TTS_VOLUME || '1.0'),
      apiKey: process.env.OPENAI_API_KEY,
    },
    audio: {
      inputDevice: process.env.AUDIO_INPUT_DEVICE,
      outputDevice: process.env.AUDIO_OUTPUT_DEVICE,
    },
  };
}

export { VERSION };
