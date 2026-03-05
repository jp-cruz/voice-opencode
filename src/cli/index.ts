#!/usr/bin/env bun

import { loadConfig, showHelp, showVersion, parseArgs } from '../config/index';
import { OpenCodeClient, type OpenCodeMessage } from '../opencode/client';
import { createVoiceManager } from '../core/voice-manager';

async function main() {
  const args = process.argv.slice(2);
  const cliArgs = parseArgs();
  
  // Handle help/version early
  if (args.includes('-h') || args.includes('--help')) {
    showHelp();
    process.exit(0);
  }
  
  if (args.includes('-v') || args.includes('--version')) {
    showVersion();
    process.exit(0);
  }

  const config = loadConfig();

  console.log('🎤 Voice OpenCode');
  console.log('================\n');

  console.log('Configuration:');
  console.log(`  OpenCode URL: ${config.opencode.url}`);
  console.log(`  STT Engine: ${config.stt.engine}`);
  console.log(`  TTS Engine: ${config.tts.engine}`);
  console.log('');

  // Initialize OpenCode client only if not skipped
  let client: OpenCodeClient | null = null;
  let fullResponse = '';
  
  if (!cliArgs.skipOpencode) {
    client = new OpenCodeClient({ url: config.opencode.url });

    console.log('Checking OpenCode server...');
    const healthy = await client.healthCheck();

    if (!healthy) {
      console.error('❌ OpenCode server is not running or not accessible');
      console.error(`   Make sure OpenCode is running at: ${config.opencode.url}`);
      console.error('   Run: opencode serve');
      console.error('   Or use --skip-opencode to skip this check');
      process.exit(1);
    }

    console.log('✅ OpenCode server is healthy\n');

    // Set up message handler
    client.onMessage((message: OpenCodeMessage) => {
      switch (message.type) {
        case 'text':
          if (message.content) {
            fullResponse += message.content + ' ';
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
          if (fullResponse.trim()) {
            voiceManager.speak(fullResponse.trim());
          }
          fullResponse = '';
          break;
      }
    });
  } else {
    console.log('⏭️  Skipping OpenCode server check (--skip-opencode)\n');
  }

  // Initialize Voice Manager
  const voiceManager = createVoiceManager(config, !cliArgs.noStt, !cliArgs.noTts);
  await voiceManager.initialize();
  if (config.daemon) {
    await voiceManager.listenForWakeWord(config.wakeWord || 'opencode');
  }

  // Check for command-line arguments
  const command = (cliArgs.command ?? '').toLowerCase();
  const message = args.slice(1).join(' ');

  if (command === 'speak' || command === 'say') {
      if (!message) {
        console.log('Usage: speak <text>');
        process.exit(1);
      }
      if (!client) {
        console.error('OpenCode server required for speak command (use without --skip-opencode)');
        process.exit(1);
      }
      console.log(`Sending: "${message}"`);
      await client.sendMessage(message);
    } else if (command === 'test' || command === 't') {
      console.log('Testing TTS...');
      await voiceManager.speak('Hello! This is a test of the voice opencode system.');
      console.log('Test complete!');
    } else if (command === 'voice' || command === 'v') {
      console.log('🎤 Starting voice recording...');
      const activationKey = config.audio.activationKey || 'ENTER';
      console.log(`Press ${activationKey} to stop recording`);
      // Start recording
      await voiceManager.startRecording();
      // Wait for user to press the activation key (using ENTER for simplicity)
      const rl = require('readline').createInterface({ input: process.stdin, output: process.stdout });
      await new Promise<void>((resolve) => rl.question('', () => { rl.close(); resolve(); }));
      // Stop recording and get audio buffer
      const audioBuffer = await voiceManager.stopRecording();
      // Transcribe
      const text = await voiceManager.transcribe(audioBuffer);
      console.log(`🗣️ You said: "${text}"`);
      if (client) {
        await client.sendMessage(text);
      } else {
        console.error('OpenCode server required for voice command (use without --skip-opencode)');
      }
    } else if (command === 'help' || command === 'h') {
      showHelp();
    } else {
      if (!client) {
        console.error('OpenCode server required (use without --skip-opencode)');
        process.exit(1);
      }
      console.log(`Sending: "${args.join(' ')}"`);
      await client.sendMessage(args.join(' '));
    }

    voiceManager.stop();
    if (client) client.disconnect();
    console.log('\n👋 Goodbye!');
    process.exit(0);
  }


main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
