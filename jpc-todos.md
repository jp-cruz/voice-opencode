# JPC TODO List

## Project Setup ✅ COMPLETED

- [x] Review and finalize project name (voice-opencode)
- [x] Create GitHub repository
- [x] Add remote to local git
- [x] Verify initial commit and push

## Architecture Decisions ✅ COMPLETED

- [x] Choose initial STT engine (whisper-api with OpenAI)
- [x] Choose initial TTS engine (Edge TTS for Windows)
- [x] Define adapter interface contract
- [x] Decide on audio processing approach (buffered for MVP)

## Phase 1 Implementation

### Core ✅ COMPLETED

- [x] Initialize Bun project
- [ ] Set up logging infrastructure
- [x] Create CLI entry point
- [x] Implement event-driven conversation flow

### STT Integration ✅ COMPLETED

- [x] Create STT adapter base interface
- [x] Implement whisper-api adapter (cloud)
- [ ] Implement local whisper adapter (future)
- [ ] Add VAD (Voice Activity Detection)

### TTS Integration ✅ COMPLETED

- [x] Create TTS adapter base interface
- [x] Implement Edge TTS adapter
- [ ] Implement ElevenLabs adapter (code ready, needs API key)
- [ ] Add streaming TTS support

### OpenCode Integration ✅ COMPLETED

- [x] Implement OpenCode API client
- [x] Add SSE streaming support
- [x] Handle session management
- [ ] Add reconnection logic

### Audio ✅ COMPLETED (Basic)

- [x] Cross-platform audio input handling (basic)
- [x] Cross-platform audio output handling
- [ ] Audio buffer management
- [ ] Device selection

### Configuration ✅ COMPLETED

- [x] Create .env.example
- [x] Implement config loading
- [ ] Add CLI argument parsing
- [x] Document all config options

## Next Steps (Priority Order)

1. [ ] Implement real microphone recording (currently placeholder)
2. [ ] Integrate STT with microphone for voice input
3. [ ] Integrate TTS with OpenCode responses
4. [ ] Add VAD (Voice Activity Detection)
5. [ ] Test full voice loop: mic -> STT -> OpenCode -> TTS -> speaker

## Testing

- [x] Set up test framework (bun test)
- [x] Write test-tts script
- [x] Test TTS on Windows ✅ WORKING
- [ ] Test on macOS
- [ ] Test on Linux

## Documentation

- [x] Write README getting started
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
