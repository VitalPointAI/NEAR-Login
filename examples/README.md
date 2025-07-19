# Examples

This directory contains example implementations of @vitalpointai/near-login in different scenarios.

## Examples

### 1. wallet-only.tsx
Basic wallet authentication without any staking requirements. Perfect for simple NEAR dApps that just need wallet connection.
- **Use Case**: Simple authentication for dApps
- **Features**: Wallet connection, logout functionality
- **Authentication**: Wallet-only (no staking)

### 2. optional-staking.tsx  
Shows how to implement optional staking benefits where users can access the app without staking, but get additional features if they do stake.
- **Use Case**: Freemium model with staking benefits
- **Features**: Basic access + premium features for stakers
- **Authentication**: Wallet required, staking optional for benefits

### 3. required-staking.tsx
Demonstrates mandatory staking requirements where users must stake tokens to access the application.
- **Use Case**: Exclusive access for stakers only
- **Features**: VIP area, staking rewards, premium content
- **Authentication**: Both wallet and staking required

### 4. comprehensive-demo.tsx
Interactive demo with mode selector showing all three authentication modes in one app.
- **Use Case**: Testing and demonstration
- **Features**: Switch between all authentication modes
- **Authentication**: Configurable (wallet-only, optional staking, required staking)

### 5. security-configurations.tsx
Comprehensive security configuration examples showing different security levels for various use cases.
- **Use Case**: Production apps requiring secure session management
- **Features**: High, balanced, and development security configurations
- **Authentication**: Configurable with advanced security options
- **Security Levels**:
  - **High Security**: Financial apps, governance tools (7-day max, 4-hour idle)
  - **Balanced Security**: General apps, marketplaces (14-day max, 24-hour idle)  
  - **Development Mode**: Testing, demos (30-day max, minimal security)

## Usage

These examples are TypeScript React components that you can integrate into your application. 

**Note**: The import paths in these examples use the published package name `@vitalpointai/near-login`. If you're running these locally in development, you'll need to adjust the imports to use relative paths:

```tsx
// Published package (production)
import { NEARLogin, useNEARLogin } from '@vitalpointai/near-login';
import type { AuthConfig } from '@vitalpointai/near-login';

// Local development
import { NEARLogin, useNEARLogin } from '../src';
import type { AuthConfig } from '../src';
```

## Configuration

Each example includes a different configuration setup:

- **Wallet Only**: No validator specified, basic wallet connection
- **Optional Staking**: `authMode: 'optional-staking'` with validator config
- **Required Staking**: `authMode: 'required-staking'` with validator config
- **Security Configurations**: Advanced `SessionSecurityConfig` examples for different security levels

### Security Configuration Examples

The `security-configurations.tsx` example demonstrates three security levels:

**High Security (Financial Applications):**
```tsx
const highSecurity: SessionSecurityConfig = {
  maxAge: 7 * 24 * 60 * 60 * 1000,        // 7 days maximum
  idleTimeout: 4 * 60 * 60 * 1000,        // 4 hours idle timeout
  encryptStorage: true,                     // Always encrypt
  deviceFingerprinting: true,               // Bind to device
  validateInterval: 5 * 60 * 1000,         // Validate every 5 minutes
  rotateTokens: true,                       // Rotate session tokens
  requireReauth: 24 * 60 * 60 * 1000,      // Re-authenticate daily
  secureStorage: true,                      // Use secure storage
  preventConcurrent: true,                  // Single session only
}
```

**Balanced Security (General Applications):**
```tsx
const balancedSecurity: SessionSecurityConfig = {
  maxAge: 14 * 24 * 60 * 60 * 1000,       // 14 days maximum
  idleTimeout: 24 * 60 * 60 * 1000,       // 24 hours idle timeout
  encryptStorage: true,                     // Encrypt session data
  deviceFingerprinting: true,               // Basic device binding
  validateInterval: 30 * 60 * 1000,        // Validate every 30 minutes
  rotateTokens: false,                      // No token rotation
}
```

**Development Mode (Testing):**
```tsx
const devSecurity: SessionSecurityConfig = {
  maxAge: 30 * 24 * 60 * 60 * 1000,       // 30 days maximum
  idleTimeout: 7 * 24 * 60 * 60 * 1000,   // 7 days idle timeout
  encryptStorage: false,                    // No encryption for debugging
  deviceFingerprinting: false,              // No device binding
  validateInterval: undefined,              // No validation intervals
}
```

## Running Examples

To test these examples:

1. Install the package: `npm install @vitalpointai/near-login`
2. Copy the example code into your React application
3. Adjust the network configuration (`testnet` vs `mainnet`)  
4. Update the validator pool ID if using staking examples
5. Add your preferred toast notification library

## Toast Notifications

The examples use simple `alert()` calls for demonstrations. In production, you should integrate with a proper toast library like:

- [react-hot-toast](https://react-hot-toast.com/)
- [sonner](https://sonner.emilkowal.ski/)
- [react-toastify](https://fkhadra.github.io/react-toastify/)

## Need Help?

Check the main README.md for comprehensive documentation and API reference.
