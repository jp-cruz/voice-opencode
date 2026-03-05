import { createVoiceManager } from './voice-manager';


test('VoiceManager initializes without errors', async () => {
  const config = {
    opencode: { url: 'http://localhost:4096' },
    stt: { engine: 'whisper-api', model: 'base', language: 'en', apiKey: '' },
    tts: { engine: 'edge', voice: 'en-US-AriaNeural', rate: 1, volume: 1, apiKey: '' },
    audio: { inputDevice: '', outputDevice: '' },
    daemon: false,
    wakeWord: 'opencode',
    version: '0.1.0',
    help: false,
    versionFlag: false,
    opencodeUrl: undefined,
    ttsEngine: undefined,
    sttEngine: undefined,
    ttsVoice: undefined,
    ttsRate: undefined,
    ttsVolume: undefined,
    language: undefined,
    noTts: false,
    noStt: false,
    skipOpencode: false,
    command: undefined,
  } as any;
  const vm = createVoiceManager(config, false, true);
  await vm.initialize();
});
