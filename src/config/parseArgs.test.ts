import { parseArgs } from './index';

test('parseArgs returns defaults and respects flags', () => {
  const args = ['node', 'script', '--no-tts', '--no-stt', '--skip-opencode'];
  const result = parseArgs(args);
  if (!result.noTts || !result.noStt || !result.skipOpencode) {
    throw new Error('Flags not parsed correctly');
  }
});
