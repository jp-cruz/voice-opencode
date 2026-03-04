# Contributing to Voice OpenCode

Thank you for your interest in contributing!

## Code of Conduct

We are committed to providing a welcoming, inclusive experience. Please read our full [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

## Ways to Contribute

### Bug Reports
- Use GitHub Issues
- Include steps to reproduce
- Mention your environment (OS, Bun version)
- Include relevant logs

### Feature Requests
- Open a GitHub Discussion first
- Describe the use case
- Consider alternatives
- Be patient while discussing

### Pull Requests
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add/update tests
5. Update documentation
6. Submit a PR

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/voice-opencode.git
cd voice-opencode

# Install dependencies
bun install

# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
# ...

# Push and create PR
git push origin feature/my-feature
```

## Coding Standards

- TypeScript with strict mode
- 2-space indentation
- Use Bun runtime
- ESLint + Prettier for formatting
- Write tests for new features

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new STT engine adapter
fix: resolve audio buffer overflow
docs: update README with new configuration
test: add tests for TTS engine
```

## Adding STT/TTS Engines

See `src/engines/` for examples:

1. Create new adapter in `src/engines/stt/` or `src/engines/tts/`
2. Implement the base interface
3. Add configuration options
4. Add tests
5. Update documentation

## Review Process

1. Maintainers review within 48 hours
2. Address feedback promptly
3. Squash commits before merge
4. Ensure CI passes

## Attribution

By contributing, you agree your contributions will be licensed under AGPLv3. See [LICENSE](LICENSE) for details.

## Questions?

- Open a GitHub Discussion
- Join our community chat (if available)
- Email the maintainer

We appreciate all contributions, from bug reports to new features!
