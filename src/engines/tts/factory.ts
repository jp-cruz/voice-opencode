// Factory for TTS engines with fallback support
import { createTTSEngine as originalCreate } from './edge.js';
import type { TTSConfig, TTSEngine } from './base.js';

export function createTTSEngine(config: TTSConfig): TTSEngine {
  try {
    return originalCreate(config);
  } catch (e) {
    console.warn(`[TTS] Engine '${config.engine}' failed to initialize, falling back to Edge`);
    // Force edge engine for fallback
    const edgeConfig = { ...config, engine: 'edge' } as TTSConfig;
    return originalCreate(edgeConfig);
  }
}
