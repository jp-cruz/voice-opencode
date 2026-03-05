#!/usr/bin/env bun

import { loadConfig } from '../src/config/index';
import { createVoiceManager } from '../src/core/voice-manager';

const config = loadConfig();

const voiceManager = createVoiceManager(config, true, true);
await voiceManager.initialize();
await voiceManager.listenForWakeWord(config.wakeWord || 'opencode');

// After wake word, you could start normal CLI loop or exit
console.log('Wake word detected, ready for commands.');
