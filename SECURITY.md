# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within Voice OpenCode, please send an email to the maintainer. All security vulnerabilities will be promptly addressed.

Please include the following information:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue

## Security Best Practices

### API Keys

- Never commit API keys to version control
- Use environment variables (`.env` file) for sensitive credentials
- The `.env` file is already excluded from git via `.gitignore`
- Rotate your API keys periodically

### Network Security

- Use HTTPS when connecting to OpenCode servers in production
- The application will warn you when using HTTP connections
- For local development, `localhost` is considered secure

### Audio Input

- This application records audio from your microphone
- Audio is processed locally or sent to trusted cloud services (OpenAI, ElevenLabs)
- Always verify which services have access to your audio data

## Dependencies

This project uses the following dependencies. Please monitor their security advisories:

- [openai](https://github.com/openai/openai-node) - MIT/Apache-2.0
- [dotenv](https://github.com/motdotla/dotenv) - MIT
- [eventsource](https://github.com/EventSource/eventsource) - MIT

## Changelog

- **0.1.0**: Initial release with basic STT/TTS support
