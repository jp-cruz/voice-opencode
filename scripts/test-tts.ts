#!/usr/bin/env bun

import { loadConfig } from '../src/config/index';
import { createTTSEngine } from '../src/engines/tts/edge';

const config = loadConfig();

console.log('Testing TTS Engine...\n');

const tts = createTTSEngine(config.tts);

await tts.initialize();

console.log('Speaking test message...');

try {
  await tts.speak('Hello! This is a test of the voice opencode text to speech system.');
  console.log('TTS test completed successfully!');
} catch (error) {
  console.error('TTS test failed:', error);
}
