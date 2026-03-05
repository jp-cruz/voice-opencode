# Installation & End‑to‑End Test Guide

## 1. Prerequisites
- **Bun runtime** – download from https://bun.sh/ and add it to your PATH.
- **OpenCode server** – a running OpenCode instance (`opencode serve`).
- **Audio devices** – a working microphone and speaker/headphones.
- **Git** – for cloning the repository.

## 2. Clone the repository
```bash
# Choose a folder for the project
git clone https://github.com/jp-cruz/voice-opencode.git
cd voice-opencode
```

## 3. Install dependencies
```bash
bun install
```

## 4. Configure the environment
```bash
# Copy the example env file
cp .env.example .env
```
Edit `.env` with a text editor and set:
- `OPENCODE_URL` – URL of your OpenCode server (e.g., `http://localhost:4096`).
- `STT_ENGINE` and `TTS_ENGINE` – choose `whisper`, `openai`, `google`, `edge`, etc.
- API keys if required (e.g., `OPENAI_API_KEY`).
- Audio device names if you want to override the defaults (`AUDIO_INPUT_DEVICE`, `AUDIO_OUTPUT_DEVICE`).

## 5. Build the project (optional, but recommended)
```bash
bun run build
```
The build produces `dist/index.js`.

## 6. Run the voice CLI (end‑to‑end test)
```bash
# Basic start – uses defaults from .env
bun run start
```
You should see console output like:
```
[Voice] Initializing voice system...
[TTS] Edge TTS initialized
[Voice] Voice system ready
```

The CLI now supports voice input via the configured STT engine. Speak a command and the system will transcribe and process it.

## 7. Verify session persistence
- The CLI writes the conversation history to `~/.voice-opencode-session.json`.
- Stop the CLI with **Ctrl+C**, then restart `bun run start`. The previous session should be restored automatically.

## 8. Run the test suite (optional sanity check)
```bash
bun test
```
All tests should pass.
