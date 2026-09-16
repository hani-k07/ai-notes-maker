# Contributing to AI Study Suite

First off, thank you for considering contributing to AI Study Suite! It's a project dedicated to private, offline AI-powered learning.

## How to Contribute

### 1. Setup
Follow the installation guide in the [README](README.md) to get the backend and frontend running locally.

### 2. Development Workflow
- **Branching**: Create a feature branch from `main` (e.g., `feat/pdf-export` or `fix/health-check`).
- **Commits**: We use [Conventional Commits](https://www.conventionalcommits.org/). Please use prefixes like `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, or `ci:`.
- **Coding Style**:
  - **C++**: Follow the existing style in `backend/src/`. Use `clang-format` if possible.
  - **React**: Use functional components and hooks. Follow the Tailwind CSS patterns used in the project.

### 3. Testing
Before submitting a PR, please ensure:
- Backend tests pass: `cd backend/build && ./backend_tests`.
- Frontend builds without errors: `cd frontend && npm run build`.

### 4. Pull Requests
- Provide a clear description of the change.
- Link any related issues.
- Include screenshots or GIFs for UI changes.

## Code of Conduct
Please refer to our [Code of Conduct](CODE_OF_CONDUCT.md) for our community guidelines.
