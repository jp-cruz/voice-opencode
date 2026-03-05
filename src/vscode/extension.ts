// VS Code extension integration point
import { createVoiceManager } from '../core/voice-manager';
import { loadConfig } from '../config/index';
import type { AppConfig } from '../config/index';

/**
 * Start the voice manager for a VS Code extension.
 * Returns an object with methods to control the voice service.
 */
export async function startVoiceService(): Promise<{
  speak: (text: string) => Promise<void>;
  stop: () => void;
  getHistory: () => string[];
}> {
  const config: AppConfig = loadConfig();
  const voiceManager = createVoiceManager(config, true, true);
  await voiceManager.initialize();
  return {
    speak: async (text: string) => voiceManager.speak(text),
    stop: () => voiceManager.stop(),
    getHistory: () => voiceManager.getConversationHistory(),
  };
}
