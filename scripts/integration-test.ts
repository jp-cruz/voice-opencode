#!/usr/bin/env bun

import { loadConfig } from '../src/config/index';
import { createVoiceManager } from '../src/core/voice-manager';

// Mock OpenCode client
class MockOpenCodeClient {
  async healthCheck() { return true; }
  onMessage(_handler: any) {}
  async sendMessage(msg: string) { console.log('[MockOpenCode] Received:', msg); }
  disconnect() {}
}

const config = loadConfig();
const voiceManager = createVoiceManager(config, true, true);
await voiceManager.initialize();

// Simulate a short audio buffer (empty) and transcription
const dummyAudio = new ArrayBuffer(0);
const text = await voiceManager.transcribe(dummyAudio);
console.log('Transcribed text:', text);

// Send to mock client
const client = new MockOpenCodeClient();
await client.sendMessage(text || 'test');

console.log('Integration test completed');
