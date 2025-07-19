# @vitalpointai/near-login

[![Publish to npm](https://github.com/VitalPointAI/NEAR-Login/actions/workflows/publish.yml/badge.svg)](https://github.com/VitalPointAI/NEAR-Login/actions/workflows/publish.yml)
[![npm version](https://badge.fury.io/js/@vitalpointai%2Fnear-login.svg)](https://badge.fury.io/js/@vitalpointai%2Fnear-login)
[![npm downloads](https://img.shields.io/npm/dm/@vitalpointai/near-login.svg)](https://www.npmjs.com/package/@vitalpointai/near-login)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A flexible React component library for NEAR Protocol authentication with optional staking validation and comprehensive security features.

## Features

- **Flexible Authentication Modes**: Wallet-only, optional staking, or required staking validation
- **Security-First Design**: Comprehensive session management with encryption, device fingerprinting, and configurable timeouts
- **TypeScript Support**: Full TypeScript definitions with excellent IDE support
- **Modern React Patterns**: Built with React hooks and modern component patterns
- **Wallet Integration**: Support for multiple NEAR wallets via Wallet Selector
- **Configurable Security Levels**: From development-friendly to enterprise-grade security
- **Session Management**: Persistent sessions with automatic cleanup and validation

## Installation

```bash
npm install @vitalpointai/near-login
# or
yarn add @vitalpointai/near-login
# or
pnpm add @vitalpointai/near-login
```

> **📦 Automated Publishing**: This package is automatically published to npm when new versions are pushed to the main branch. Releases include automated testing, building, and GitHub release creation.

## Quick Start

### Basic Wallet Authentication

```tsx
import { NEARLogin } from '@vitalpointai/near-login'

function App() {
  return (
    <NEARLogin
      networkId="testnet"
      contractId="your-contract.testnet"
      onAuthStateChange={(user, isStaked) => {
        console.log('Auth state:', { user, isStaked })
      }}
    />
  )
}
```

### With Staking Validation

```tsx
import { NEARLogin } from '@vitalpointai/near-login'

function App() {
  return (
    <NEARLogin
      networkId="testnet"
      contractId="your-contract.testnet"
      authMode="required-staking" // Requires staking validation
      validatorPools={[
        "validator1.pool.near",
        "validator2.pool.near"
      ]}
      minimumStake="100" // Minimum 100 NEAR staked
      onAuthStateChange={(user, isStaked) => {
        if (isStaked) {
          console.log('User is authenticated and staked!')
        }
      }}
    />
  )
}
```

## Configuration Options

### AuthConfig Interface

```tsx
interface AuthConfig {
  networkId: 'mainnet' | 'testnet' | 'betanet'
  contractId?: string
  authMode?: 'wallet-only' | 'optional-staking' | 'required-staking'
  validatorPools?: string[]
  minimumStake?: string
  persistSession?: boolean
  sessionSecurity?: SessionSecurityConfig
  onAuthStateChange?: (user: User | null, isStaked: boolean) => void
  onError?: (error: Error) => void
}
```

### Authentication Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `wallet-only` | Basic wallet connection only | Simple dApps, public applications |
| `optional-staking` | Wallet connection with optional staking check | Apps with premium features |
| `required-staking` | Requires valid staking to access | Exclusive apps, governance tools |

## Security Features

### Session Security Configuration

The library provides comprehensive security options to protect user sessions:

```tsx
interface SessionSecurityConfig {
  // Core Security Settings
  maxAge?: number              // Maximum session duration (ms)
  idleTimeout?: number         // Auto-logout after inactivity (ms)
  encryptStorage?: boolean     // Encrypt session data in storage
  
  // Device & Network Security
  deviceFingerprinting?: boolean  // Bind session to device characteristics
  bindToIP?: boolean             // Bind session to IP address (optional)
  
  // Validation & Rotation
  validateInterval?: number      // How often to validate session (ms)
  rotateTokens?: boolean        // Periodically rotate session tokens
  validateWithBackend?: string  // Backend endpoint for session validation
  
  // Advanced Security
  requireReauth?: number        // Force re-authentication after time (ms)
  secureStorage?: boolean       // Use more secure storage methods
  preventConcurrent?: boolean   // Prevent multiple concurrent sessions
  
  // Error Handling
  onSecurityViolation?: (violation: SecurityViolation) => void
  onSessionExpired?: () => void
}
```

### Security Levels

#### High Security (Financial Apps)

```tsx
const highSecurity: SessionSecurityConfig = {
  maxAge: 7 * 24 * 60 * 60 * 1000,        // 7 days max
  idleTimeout: 4 * 60 * 60 * 1000,        // 4 hours idle timeout
  encryptStorage: true,                     // Always encrypt
  deviceFingerprinting: true,               // Bind to device
  validateInterval: 5 * 60 * 1000,         // Validate every 5 minutes
  rotateTokens: true,                       // Rotate tokens
  requireReauth: 24 * 60 * 60 * 1000,      // Re-auth daily
  secureStorage: true,                      // Use secure storage
  preventConcurrent: true,                  // One session only
}
```

#### Balanced Security (General Apps)

```tsx
const balancedSecurity: SessionSecurityConfig = {
  maxAge: 14 * 24 * 60 * 60 * 1000,       // 14 days max
  idleTimeout: 24 * 60 * 60 * 1000,       // 24 hours idle timeout
  encryptStorage: true,                     // Encrypt data
  deviceFingerprinting: true,               // Basic device binding
  validateInterval: 30 * 60 * 1000,        // Validate every 30 minutes
  rotateTokens: false,                      // No token rotation
}
```

#### Development Mode (Testing)

```tsx
const devSecurity: SessionSecurityConfig = {
  maxAge: 30 * 24 * 60 * 60 * 1000,       // 30 days max
  idleTimeout: 7 * 24 * 60 * 60 * 1000,   // 7 days idle timeout
  encryptStorage: false,                    // No encryption for debugging
  deviceFingerprinting: false,              // No device binding
  validateInterval: undefined,              // No validation
}
```

### Security Best Practices

1. **Choose Appropriate Security Level**: Match security settings to your application's risk profile
2. **Enable Encryption**: Always encrypt session data in production
3. **Set Reasonable Timeouts**: Balance security with user experience
4. **Use Device Fingerprinting**: Helps prevent session hijacking
5. **Validate Sessions**: Regular validation detects compromised sessions
6. **Handle Security Violations**: Implement proper error handling and user notification
7. **Monitor Session Activity**: Log and monitor authentication events

### Device Fingerprinting

The library uses a combination of browser characteristics for device fingerprinting:

- Canvas rendering patterns
- WebGL renderer information
- Screen resolution and color depth
- Timezone and language settings
- Available fonts
- Hardware concurrency

This creates a unique device identifier without requiring explicit permissions.

## API Reference

### NEARLogin Component Props

```tsx
interface NEARLoginProps {
  networkId: 'mainnet' | 'testnet' | 'betanet'
  contractId?: string
  authMode?: 'wallet-only' | 'optional-staking' | 'required-staking'
  validatorPools?: string[]
  minimumStake?: string
  persistSession?: boolean
  sessionSecurity?: SessionSecurityConfig
  className?: string
  style?: React.CSSProperties
  onAuthStateChange?: (user: User | null, isStaked: boolean) => void
  onError?: (error: Error) => void
}
```

### User Interface

```tsx
interface User {
  accountId: string
  balance: string
  isStaked?: boolean
  stakedAmount?: string
  validatorPool?: string
  sessionId?: string
  lastActivity?: number
}
```

### Hooks

#### useNEARAuth

```tsx
const {
  user,
  isAuthenticated,
  isStaked,
  loading,
  error,
  login,
  logout,
  checkStaking,
  refreshSession
} = useNEARAuth()
```

## Examples

### Route Protection

```tsx
import { useNEARAuth } from '@vitalpointai/near-login'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isStaked, loading } = useNEARAuth()

  if (loading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please connect your wallet</div>
  if (!isStaked) return <div>Staking required to access this content</div>

  return <>{children}</>
}
```

### Custom Security Configuration

```tsx
import { NEARLogin } from '@vitalpointai/near-login'

const customSecurity = {
  maxAge: 7 * 24 * 60 * 60 * 1000,     // 7 days
  idleTimeout: 2 * 60 * 60 * 1000,     // 2 hours
  encryptStorage: true,
  deviceFingerprinting: true,
  validateInterval: 10 * 60 * 1000,     // 10 minutes
  onSecurityViolation: (violation) => {
    console.warn('Security violation:', violation)
    // Handle security violation (logout, notify user, etc.)
  },
  onSessionExpired: () => {
    console.log('Session expired')
    // Handle session expiration
  }
}

function App() {
  return (
    <NEARLogin
      networkId="mainnet"
      authMode="required-staking"
      sessionSecurity={customSecurity}
      onAuthStateChange={(user, isStaked) => {
        console.log('Auth state:', { user, isStaked })
      }}
    />
  )
}
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development

```bash
# Clone the repository
git clone https://github.com/VitalPointAI/NEAR-Login.git
cd NEAR-Login

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## Security Considerations

- **Session Storage**: Sessions are encrypted by default in production
- **Device Binding**: Device fingerprinting helps prevent session hijacking
- **Automatic Cleanup**: Expired sessions are automatically cleaned up
- **Validation**: Regular session validation ensures integrity
- **Error Handling**: Comprehensive error handling for security violations

## Troubleshooting

### Common Issues

1. **Session not persisting**: Check that `persistSession` is enabled and browser storage is available
2. **Security violations**: Review security configuration and ensure settings are appropriate for your use case
3. **Staking validation fails**: Verify validator pool addresses and minimum stake amounts
4. **TypeScript errors**: Ensure you have the latest type definitions

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
VITE_DEBUG_NEAR_LOGIN=true
```

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and breaking changes.

---

**Need help?** Open an issue on [GitHub](https://github.com/VitalPointAI/NEAR-Login/issues) or check our [examples](./examples/) directory for more usage patterns.
