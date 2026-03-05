// Factory for STT engines with fallback support
import { createSTTEngine as originalCreate } from './whisper.js';
import type { STTConfig, STTEngine } from './base.js';
export type { STTEngine };


export function createSTTEngine(config: STTConfig): STTEngine {
  try {
    return originalCreate(config);
  } catch (e) {
    console.warn(`[STT] Engine '${config.engine}' failed to initialize, falling back to whisper-api`);
    const fallbackConfig = { ...config, engine: 'whisper-api' } as STTConfig;
    return originalCreate(fallbackConfig);
  }
}
