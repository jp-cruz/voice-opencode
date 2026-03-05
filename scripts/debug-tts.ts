#!/usr/bin/env bun
import { loadConfig } from '../src/config/index';
import { createTTSEngine } from '../src/engines/tts/edge';
const cfg = loadConfig();
cfg.tts.voice = 'en-US-JennyNeural';          // pick any voice you saw in the list
const tts = createTTSEngine(cfg.tts);
tts.setVoice(cfg.tts.voice);                  // **must be before init**
await tts.initialize();
console.log('--- ENGINE STATE ---');
console.log('Voice set to:', tts['currentVoice'] ?? '(none)');
console.log('Available voices:', tts['availableVoices']?.slice(0, 10) ?? 'none');
await tts.speak('Hello, this is a test of the new voice.');