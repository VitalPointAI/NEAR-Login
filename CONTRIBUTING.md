# Contributing to @vitalpointai/near-login

Thank you for your interest in contributing to @vitalpointai/near-login! This document provides guidelines and information for contributors.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/VitalPointAI/NEAR-Login.git
   cd NEAR-Login
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Build the package**
   ```bash
   pnpm build
   ```

## Development Workflow

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style and patterns
   - Add TypeScript types for any new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   pnpm build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: description of your changes"
   ```

5. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style Guidelines

- **TypeScript**: Use strict typing, avoid `any` when possible
- **Components**: Follow React best practices and hooks patterns
- **Exports**: Export all public APIs from `src/index.ts`
- **Documentation**: Update README.md for any API changes

### Commit Message Format

We use conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Build process or auxiliary tool changes

## Project Structure

```
src/
├── components/     # React components
├── hooks/         # Custom React hooks
├── store/         # Zustand store
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── index.ts       # Main exports
```

## Testing

Currently, the project focuses on TypeScript compilation and build validation. When adding new features:

1. Ensure TypeScript compilation passes
2. Test the build process
3. Verify exports work correctly

## Questions or Issues?

- Open an issue on GitHub for bugs or feature requests
- For questions, start a discussion in the GitHub repository

Thank you for contributing! 🚀
