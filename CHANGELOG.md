# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-07-19

### Added
- **Initial release** of @vitalpointai/near-login
- **Flexible Authentication Modes**: Support for wallet-only, optional staking, and required staking
- **NEARLogin Component**: Main authentication component with customizable UI
- **useNEARLogin Hook**: Programmatic access to authentication state and actions
- **Session Management**: Persistent authentication sessions with localStorage
- **TypeScript Support**: Comprehensive type definitions and strict typing
- **Multi-Wallet Support**: Compatible with MyNearWallet and Meteor Wallet
- **Toast Notifications**: Built-in notification system with custom handlers
- **Backend Integration**: Optional server-side session verification endpoints

### Technical Features
- Built with **Vite** for modern build tooling
- **Dual Output**: Both ESM and CommonJS builds
- **NEAR API v5.1.1** compatibility
- **Wallet Selector v9.1.0** integration
- **Zustand** for state management
- **React 18+** support

### Configuration Options
- **AuthConfig**: Flexible configuration for different authentication modes
- **ValidatorConfig**: Optional staking validation with customizable requirements  
- **SessionOptions**: Configurable session persistence and backend integration
- **WalletConnectOptions**: Customizable wallet connection themes and settings

### Developer Experience
- **Legacy Compatibility**: Deprecated exports maintain backward compatibility
- **Comprehensive Documentation**: README with examples for all authentication modes
- **TypeScript Declarations**: Full IntelliSense support
- **Example Code**: Complete working examples for different use cases

### Migration Path
- Provides migration guide from @vitalpointai/near-staking-auth v0.x
- Legacy component names (`NEARStakingAuth`, `useNEARStakingAuth`) available as deprecated exports
- Configuration updates clearly documented

## [0.x.x] - Previous Versions
Previous versions were released as @vitalpointai/near-staking-auth with mandatory staking requirements. See that package's changelog for historical changes.
