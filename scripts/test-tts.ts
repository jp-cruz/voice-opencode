#!/usr/bin/env bun

import { loadConfig } from '../src/config/index';
import { createTTSEngine } from '../src/engines/tts/edge';

const config = loadConfig();

console.log('Testing TTS Engine...\n');

config.tts.voice = 'en-US-JennyNeural';
const tts = createTTSEngine(config.tts);
  tts.setVoice('en-US-JennyNeural');

await tts.initialize();

console.log('Speaking test message...');

try {
  await tts.speak('Hello World! Bienvenido a Voice OpenCode. Bienvenue à Voice OpenCode. Willkommen bei Voice OpenCode.');
  console.log('TTS test completed successfully!');
} catch (error) {
  console.error('TTS test failed:', error);
}
