#!/usr/bin/env bun

import { loadConfig } from '../config/index.ts';
import { OpenCodeClient, type OpenCodeMessage } from '../opencode/client.ts';

const config = loadConfig();

console.log('🎤 Voice OpenCode');
console.log('================\n');

console.log('Configuration:');
console.log(`  OpenCode URL: ${config.opencode.url}`);
console.log(`  STT Engine: ${config.stt.engine}`);
console.log(`  TTS Engine: ${config.tts.engine}`);
console.log('');

const client = new OpenCodeClient({ url: config.opencode.url });

console.log('Checking OpenCode server...');
const healthy = await client.healthCheck();

if (!healthy) {
  console.error('❌ OpenCode server is not running or not accessible');
  console.error(`   Make sure OpenCode is running at: ${config.opencode.url}`);
  console.error('   Run: opencode serve');
  process.exit(1);
}

console.log('✅ OpenCode server is healthy\n');

client.onMessage((message: OpenCodeMessage) => {
  switch (message.type) {
    case 'text':
      if (message.content) {
        console.log(`🤖: ${message.content}`);
      }
      break;
    case 'tool_call':
      console.log(`🔧 Tool: ${message.tool}`);
      break;
    case 'tool_result':
      console.log(`✅ Done: ${message.tool}`);
      break;
    case 'error':
      console.error(`❌ Error: ${message.content}`);
      break;
    case 'done':
      console.log('\n✨ Task complete!');
      break;
  }
});

console.log('Voice input not yet implemented - use CLI mode');
console.log('Enter messages one at a time (Ctrl+C to exit):\n');

const messages: string[] = [];

const sendMessages = async () => {
  for (const input of messages) {
    if (input.toLowerCase() === 'quit' || input.toLowerCase() === 'exit') {
      break;
    }
    if (input) {
      await client.sendMessage(input);
    }
  }
};

console.log('💡 Tip: For voice input, implement STT engine adapters');
console.log('💡 For now, this is a text-based OpenCode client');
console.log('');
console.log('Run with: bun run start');
console.log('');
console.log('Note: Interactive CLI mode not fully implemented in this version.');
console.log('See jpc-todos.md for remaining implementation tasks.');

client.disconnect();
