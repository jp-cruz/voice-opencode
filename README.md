# Voice OpenCode

A cross-platform voice interaction layer for OpenCode AI coding agent.

## Overview

Voice OpenCode enables bi-directional voice communication with OpenCode. Speak your coding instructions, hear AI responses - hands-free programming powered by AI.

## Features
- **Voice Input**: Speak naturally to direct OpenCode
- **Voice Output**: Hear AI responses and status updates
- **Cross-Platform**: macOS, Windows, Linux support
- **Modular Architecture**: Pluggable STT/TTS engines
- **OpenCode API Integration**: Works with any OpenCode-compatible backend
- **CLI Flags**: Full list of command‑line options (see below)
- **Daemon Mode**: Run as a background service with hot‑word activation
- **Session Persistence**: Conversation history saved to `~/.voice-opencode-session.json`


- **Voice Input**: Speak naturally to direct OpenCode
- **Voice Output**: Hear AI responses and status updates
- **Cross-Platform**: macOS, Windows, Linux support
- **Modular Architecture**: Pluggable STT/TTS engines
- **OpenCode API Integration**: Works with any OpenCode-compatible backend

## Phase 1 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Voice OpenCode CLI                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │   STT       │    │   Core      │    │   TTS               │ │
│  │  Engine     │───▶│   Logic     │───▶│   Engine            │ │
│  │  (Pluggable)│    │   (Bun)    │    │   (Pluggable)       │ │
│  └─────────────┘    └──────┬──────┘    └─────────────────────┘ │
│                            │                                    │
│                            ▼                                    │
│                   ┌─────────────────┐                          │
│                   │  OpenCode API   │                          │
│                   │  Client         │                          │
│                   └────────┬────────┘                          │
│                            │                                    │
│                            ▼                                    │
│                   ┌─────────────────┐                          │
│                   │  OpenCode       │                          │
│                   │  Server         │                          │
│                   └─────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

### Components

#### STT Engine (Speech-to-Text)
- **Local**: faster-whisper (CPU/GPU)
- **Cloud**: OpenAI Whisper API, Google STT
- **Interface**: Pluggable adapter pattern

#### Core Logic (Bun)
- Event-driven conversation flow
- Audio buffer management
- Session state handling
- Command parsing

#### TTS Engine (Text-to-Speech)
- **Local**: Coqui XTTS, Piper
- **Cloud**: Edge TTS, ElevenLabs, OpenAI TTS
- **Interface**: Pluggable adapter pattern

#### OpenCode API Client
- HTTP client for OpenCode server
- SSE streaming support
- Session management

## Installation

### Prerequisites

- [Bun](https://bun.sh/) runtime
- OpenCode server running (`opencode serve`)
- Note: The server provides SSE streaming by default; no extra flag is required.
- Audio input/output device

### Quick Start

```bash
# Clone the repository
git clone https://github.com/jp-cruz/voice-opencode.git
cd voice-opencode

# Install dependencies
bun install

# Configure (copy and edit)
cp .env.example .env

# Run
bun run start
```

### Configuration

See `.env.example` for configuration options:

```env
# OpenCode Server
OPENCODE_URL=http://localhost:4096

# STT Configuration
STT_ENGINE=whisper          # whisper, openai, google
STT_MODEL=base              # model size for local

# TTS Configuration
TTS_ENGINE=edge             # edge, elevenlabs, coqui, google
TTS_VOICE=en-US-AriaNeural  # voice for Edge TTS

# Audio Configuration
AUDIO_INPUT_DEVICE=default
AUDIO_OUTPUT_DEVICE=default
```

## Usage

- **Hot‑word activation** – configure a list of wake words (default `opencode`).
- **Session persistence** – conversation history is saved to `~/.voice-opencode-session.json` and restored on restart.
- **VS Code extension** – import `src/vscode/extension.ts` to embed voice commands directly in the editor.
- **Auto‑detect audio devices** – use `--auto-detect` to let the system choose the best microphone/speaker.

## Usage

### CLI Mode

```bash
# Start voice interaction
bun run start

# Test STT only
bun run test:stt

# Test TTS only
bun run test:tts

# Run with specific config
bun run start --tts=elevenlabs --stt=openai
# or using Google TTS
bun run start --tts=google --stt=openai
```

### Keyboard Controls

| Key | Action |
|-----|--------|
| Space | Push‑to‑talk (start/stop recording) |
| Enter | Configurable voice‑activation stop key (default) |
| Ctrl+C | Exit |
| M | Mute/unmute TTS |
| R | Reset session |

### Stopping / Restarting the Service

- The CLI runs in the foreground; press **Ctrl+C** to stop.
- To run it as a background service, use `bun run start &` (Linux/macOS) or `Start-Process bun -ArgumentList "run start"` (PowerShell). Stop with `kill <pid>` or `Stop‑Process -Id <pid>`.
- After stopping, you can restart with the same command.

### Troubleshooting

- **OpenCode server not reachable** – Ensure the server is running (`opencode serve`) and the URL in `.env` or `--url` matches.
- **Audio device errors** – Verify your microphone and speaker are recognized. Set `AUDIO_INPUT_DEVICE` / `AUDIO_OUTPUT_DEVICE` in `.env`.
- **Missing PowerShell permissions (Windows)** – Run the terminal as Administrator or enable script execution (`Set‑ExecutionPolicy RemoteSigned`).
- **API key issues** – Provide a valid `OPENAI_API_KEY` for Whisper or Edge TTS when using cloud engines.
- **Lint/Build failures** – Run `bun run lint --fix` and `bun run build` to see detailed errors.

## Development

### Project Structure

```
voice-opencode/
├── src/
│   ├── cli/              # CLI entry point
│   ├── core/             # Core conversation logic
│   ├── engines/          # STT/TTS engines
│   │   ├── stt/         # Speech‑to‑text adapters
│   │   └── tts/         # Text‑to‑speech adapters
│   ├── opencode/         # OpenCode API client
│   └── audio/           # Audio utilities
├── scripts/              # Build/dev scripts
├── package.json
└── bun.lock
```

### Running Tests

```bash
bun test
```

### Adding New STT/TTS Engines

Implement the adapter interface:

```typescript
// src/engines/stt/base.ts
interface STTEngine {
  transcribe(audioBuffer: Buffer): Promise<string>;
  start(): void;
  stop(): void;
}

// src/engines/tts/base.ts
interface TTSEngine {
  speak(text: string): Promise<void>;
  stop(): void;
  setVoice(voice: string): void;
}
```

## Roadmap

- [ ] Phase 1: CLI with basic voice I/O
- [ ] Phase 2: Web UI (like opencode‑web with voice)
- [ ] Phase 3: Mobile companion app

## Related Projects

- [opencode](https://github.com/sst/opencode) – AI coding agent
- [opencode‑web](https://github.com/chris‑tse/opencode‑web) – Web UI for OpenCode
- [Voice_opencode](https://github.com/Kit4Some/Voice_opencode) – Another voice wrapper

## License

This project is licensed under AGPLv3. See [LICENSE](LICENSE) for details.

## Attribution

### CLI Mode

```bash
# Start voice interaction
bun run start

# Test STT only
bun run test:stt

# Test TTS only
bun run test:tts

# Run with specific config
bun run start --tts=elevenlabs --stt=openai
# or using Google TTS
bun run start --tts=google --stt=openai
```

### Keyboard Controls

| Key | Action |
|-----|--------|
| Space | Push-to-talk (start/stop recording) |
| Ctrl+C | Exit |
| M | Mute/unmute TTS |
| R | Reset session |

## Development

### Project Structure

```
voice-opencode/
├── src/
│   ├── cli/              # CLI entry point
│   ├── core/             # Core conversation logic
│   ├── engines/          # STT/TTS engines
│   │   ├── stt/         # Speech-to-text adapters
│   │   └── tts/         # Text-to-speech adapters
│   ├── opencode/         # OpenCode API client
│   └── audio/           # Audio utilities
├── scripts/              # Build/dev scripts
├── package.json
└── bun.lock
```

### Running Tests

```bash
bun test
```

### Adding New STT/TTS Engines

Implement the adapter interface:

```typescript
// src/engines/stt/base.ts
interface STTEngine {
  transcribe(audioBuffer: Buffer): Promise<string>;
  start(): void;
  stop(): void;
}

// src/engines/tts/base.ts
interface TTSEngine {
  speak(text: string): Promise<void>;
  stop(): void;
  setVoice(voice: string): void;
}
```

## Roadmap

- [ ] Phase 1: CLI with basic voice I/O
- [ ] Phase 2: Web UI (like opencode-web with voice)
- [ ] Phase 3: Mobile companion app

## Related Projects

- [opencode](https://github.com/sst/opencode) - AI coding agent
- [opencode-web](https://github.com/chris-tse/opencode-web) - Web UI for OpenCode
- [Voice_opencode](https://github.com/Kit4Some/Voice_opencode) - Another voice wrapper

## License

This project is licensed under AGPLv3. See [LICENSE](LICENSE) for details.

## Attribution

This project includes attribution to John Paul "Jp" Cruz. See [LICENSE](LICENSE) for details.

### Project Dependencies

**OpenCode** - This project interacts with and extends [OpenCode](https://github.com/sst/opencode), an AI coding agent built by SST. Voice OpenCode is not affiliated with or endorsed by SST.

**Zen** - Inspired by the [Zen](https://github.com/sst/zen) project from SST, which provides a beautiful terminal interface for OpenCode.

**Big Pickle Model** - This project was conceptualized and developed with assistance from the Big Pickle AI model. The Big Pickle model is an AI coding assistant that helps developers build software.

### Third-Party Libraries

This project uses the following open-source libraries:
- [Bun](https://bun.sh/) - JavaScript runtime
- [OpenAI](https://openai.com/) - Whisper API for speech-to-text
- [Microsoft Edge TTS](https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/text-to-speech) - Text-to-speech engine
