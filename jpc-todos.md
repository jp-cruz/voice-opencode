# JPC TODO List

## Project Setup

- [ ] Review and finalize project name (currently: voice-opencode)
- [ ] Create GitHub repository
- [ ] Add remote to local git
- [ ] Verify initial commit and push

## Architecture Decisions

- [ ] Choose initial STT engine (recommendation: faster-whisper for local, whisper-api for cloud)
- [ ] Choose initial TTS engine (recommendation: Edge TTS for Windows, coqui for local)
- [ ] Define adapter interface contract
- [ ] Decide on audio processing approach (streaming vs buffered)

## Phase 1 Implementation

### Core
- [ ] Initialize Bun project
- [ ] Set up logging infrastructure
- [ ] Create CLI entry point
- [ ] Implement event-driven conversation flow

### STT Integration
- [ ] Create STT adapter base interface
- [ ] Implement whisper adapter (local)
- [ ] Implement whisper-api adapter (cloud)
- [ ] Add VAD (Voice Activity Detection)

### TTS Integration  
- [ ] Create TTS adapter base interface
- [ ] Implement Edge TTS adapter
- [ ] Implement coqui/Piper adapter
- [ ] Add streaming TTS support

### OpenCode Integration
- [ ] Implement OpenCode API client
- [ ] Add SSE streaming support
- [ ] Handle session management
- [ ] Add reconnection logic

### Audio
- [ ] Cross-platform audio input handling
- [ ] Cross-platform audio output handling
- [ ] Audio buffer management
- [ ] Device selection

### Configuration
- [ ] Create .env.example
- [ ] Implement config loading
- [ ] Add CLI argument parsing
- [ ] Document all config options

## Testing

- [ ] Set up test framework
- [ ] Write unit tests for adapters
- [ ] Write integration tests for OpenCode client
- [ ] Test on Windows
- [ ] Test on macOS
- [ ] Test on Linux

## Documentation

- [ ] Write README getting started
- [ ] Document configuration options
- [ ] Document adding new engines
- [ ] Create architecture diagrams

## Phase 2 (Future)

- [ ] Add web UI
- [ ] Real-time streaming
- [ ] Session persistence

## Phase 3 (Future)

- [ ] Mobile companion app
- [ ] iOS support
- [ ] Android support
