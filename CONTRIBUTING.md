# Contributing to AI Study Suite

First off, thank you for considering contributing to AI Study Suite! We are building a future where students can harness the power of AI without sacrificing their data privacy.

## How to Contribute

### 1. Setup
Follow the installation guide in the [README](README.md) to get the backend and frontend running locally. We recommend using the `setup_app.bat` script for the fastest start.

### 2. Development Workflow
- **Branching**: Create a feature branch from `master` (e.g., `feat/pdf-export` or `fix/health-check`).
- **Commits**: We follow [Conventional Commits](https://www.conventionalcommits.org/). Use prefixes like `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, or `ci:`.
- **Coding Style**:
  - **C++**: We prioritize RAII and memory safety. Please avoid raw pointers for ownership.
  - **React**: We use a component-driven architecture with Tailwind CSS. Keep components small and focused.

### 3. Testing
Before submitting a PR, please ensure:
- Backend tests pass: \`cd backend/build && ./backend_tests\`.
- Frontend builds without errors: \`cd frontend && npm run build\`.

### 4. Pull Requests
- Provide a clear description of the change and why it's needed.
- Link any related issues.
- Include screenshots or GIFs for UI changes.

## Code of Conduct
Please refer to our [Code of Conduct](CODE_OF_CONDUCT.md) for our community guidelines.
