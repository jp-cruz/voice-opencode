# Project Summary

## Project Goals
- Add pre‑release features (hot‑word list, multi‑engine fallback, VS Code extension hook, session persistence, auto‑detect audio devices).
- Implement verification steps (tests, config schema validation, CI pipeline, version bump/changelog, cross‑platform audio tests).
- Harden security & stability (sandboxed processes, input sanitization, rate limiting, memory profiling, graceful error handling, fuzz testing, resource‑leak monitoring).

## Key Architectural Decisions
- **Engine Factory**: Central factory (`src/engines/tts/factory.ts`) creates TTS engine with fallback order (Edge → ElevenLabs → Google).
- **Session Persistence**: `src/core/session.ts` saves conversation history to `~/.voice-opencode-session.json` and loads on start.
- **Config Schema**: `src/config/index.ts` now includes `audio.autoDetect` and `audio.hotWords` with CLI flags `--auto-detect` / `--hot-word`.
- **VS Code Extension**: Stub entry point `src/vscode/extension.ts` exposing `startVoiceService`.
- **CLI Integration**: Updated `src/cli/index.ts` to parse new flags and pass them to `VoiceManager`.
- **Modular TTS Interfaces**: `src/engines/tts/base.ts` defines `TTSEngine`; each engine implements `speak(text): Promise<void>`.

## Current File Structure (relevant parts)
```
src/
  cli/
    index.ts
  config/
    index.ts
  core/
    voice-manager.ts
    session.ts
  engines/
    stt/
      whisper.ts
    tts/
      base.ts
      edge.ts
      google.ts
      factory.ts
  vscode/
    extension.ts

dist/
scripts/
README.md
memory.md   <-- added (git‑ignored)
```

## Open TODOs
- Resolve remaining LSP errors in `src/engines/tts/edge.ts` and CLI flag handling.
- Add unit/integration tests for:
  - Session persistence
  - Hot‑word detection
  - TTS fallback logic
  - Audio auto‑detect
- Implement config schema validation (e.g., using Zod).
- Set up CI pipeline (GitHub Actions) to run tests on push.
- Bump version and generate changelog.
- Add cross‑platform audio device tests.

## Known Bugs
- LSP errors: missing imports/types in `edge.ts` and `voice-manager.ts`.
- CLI flags `--auto-detect` and `--hot-word` not fully wired to config.
- VS Code extension stub lacks full activation events.

## Important Constraints
- Do not commit any secret keys or credentials.
- All code must be TypeScript‑compatible and pass lint/type‑check.
- Memory file is excluded from version control via `.gitignore`.
