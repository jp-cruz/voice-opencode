#!/usr/bin/env bun

import { loadConfig } from '../src/config/index';
import { createSTTEngine } from '../src/engines/stt/whisper';

const config = loadConfig();

console.log('Testing STT Engine...\n');

const stt = createSTTEngine(config.stt);

await stt.initialize();

console.log('STT engine initialized successfully.');
// Note: To fully test transcription, provide an audio buffer or use a recorded sample.
// This placeholder script ensures the engine loads without errors.
