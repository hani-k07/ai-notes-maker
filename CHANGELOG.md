# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-09-16
### Added
- **Core Backend Hardening**: Server now binds to `127.0.0.1`, includes input validation, and structured JSON error responses.
- **Persistence Layer**: Integrated SQLite3 for local note storage with automatic versioning.
- **Voice-to-Note**: Local transcription using `whisper.cpp` integration.
- **Frontend Polish**: 
  - Added real-time system health monitoring banner.
  - Implemented AI Diff/Preview view for transparent rewrites.
  - Added response latency tracking.
  - Centralized API services layer.
- **Developer Experience**: 
  - Full CI/CD pipeline with GitHub Actions for build and test verification.
  - Unit tests for C++ backend and Vitest for frontend.
  - Professional project structure and documentation.
- **Professional Polish**: Added LICENSE, CONTRIBUTING, and Code of Conduct.
