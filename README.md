# @vitalpointai/near-login

[![Publish to npm](https://github.com/VitalPointAI/NEAR-Login/actions/workflows/publish.yml/badge.svg)](https://github.com/VitalPointAI/NEAR-Login/actions/workflows/publish.yml)
[![npm version](https://badge.fury.io/js/@vitalpointai%2Fnear-login.svg)](https://badge.fury.io/js/@vitalpointai%2Fnear-login)
[![npm downloads](https://img.shields.io/npm/dm/@vitalpointai/near-login.svg)](https://www.npmjs.com/package/@vitalpointai/near-login)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A flexible React authentication library for NEAR Protocol with optional staking validation, multi-chain support, and **educational onboarding features** designed to simplify Web3 for mainstream users.

## Features

- **🔐 NEAR Authentication**: Seamless wallet integration with NEAR Wallet Selector
- **🥩 Staking Validation**: Optional or required staking with configurable validator pools
- **🎓 Educational Components**: Built-in tooltips, guided wizards, and progressive onboarding for crypto beginners
- **🔗 Multi-Chain Support**: Chain signature functionality for cross-chain transactions
- **⚛️ React Components**: Ready-to-use components with customizable UI
- **🪝 React Hooks**: Powerful hooks for authentication state management
- **📱 Route Protection**: Built-in protected route components
- **🔒 Session Management**: Persistent sessions with security features
- **📘 TypeScript**: Full TypeScript support with comprehensive type definitions

## Installation

```bash
npm install @vitalpointai/near-login
# or
yarn add @vitalpointai/near-login
# or
pnpm add @vitalpointai/near-login
```

### Peer Dependencies

This library requires React and NEAR Wallet Selector:

```bash
npm install react react-dom @near-wallet-selector/core @near-wallet-selector/my-near-wallet
```

> **📦 Automated Publishing**: This package is automatically published to npm when new versions are pushed to the main branch. Releases include automated testing, building, and GitHub release creation.

## Quick Start

### Basic Wallet Authentication

```tsx
import { NEARLogin } from '@vitalpointai/near-login';

function App() {
  const config = {
    // Minimal configuration - only wallet connection required
    // No networkId required - defaults to 'testnet'
  };

  return (
    <NEARLogin config={config}>
      <div>
        <h1>My NEAR App</h1>
        <p>This content is shown when authenticated</p>
      </div>
    </NEARLogin>
  );
}
```

### With Educational Features (Recommended for New Users) 🎓

```tsx
import { NEARLogin } from '@vitalpointai/near-login';

function App() {
  const config = {
    nearConfig: { networkId: 'testnet' }
  };

  return (
    <NEARLogin 
      config={config}
      showHelp={true}  // Enable help tooltips
      helpTexts={{
        walletConnection: "Connect your NEAR wallet to access this app. Your keys never leave your wallet!",
        staking: "Staking helps secure the network and earns you rewards (typically 8-12% annually)."
      }}
      showEducation={true}  // Show educational content for beginners
      educationTopics={['what-is-wallet', 'why-near', 'security-tips']}
      useGuidedStaking={true}  // Use step-by-step staking wizard
    >
      <div>
        <h1>My NEAR App</h1>
        <p>This content is shown when authenticated</p>
      </div>
    </NEARLogin>
  );
}
```

### Individual Educational Components

```tsx
import { EducationTooltip, WalletEducation, GuidedStakingWizard } from '@vitalpointai/near-login';

function MyComponent() {
  return (
    <div>
      {/* Add helpful tooltips anywhere */}
      <EducationTooltip
        content="A crypto wallet is like a secure digital keychain for your tokens."
        title="What is a wallet?"
        position="top"
      >
        <button>Connect Wallet</button>
      </EducationTooltip>

      {/* Progressive education for beginners */}
      <WalletEducation
        topics={['what-is-wallet', 'why-near', 'how-staking-works']}
        onComplete={() => console.log('Education completed!')}
      />

      {/* Guided staking wizard */}
      <GuidedStakingWizard
        validator={{ poolId: 'validator.pool.near', displayName: 'My Validator' }}
        onComplete={(amount) => console.log(`Staking ${amount} NEAR`)}
        onCancel={() => console.log('Staking cancelled')}
      />
    </div>
  );
}
```

### With Network Selection

```tsx
import { NEARLogin } from '@vitalpointai/near-login';

function App() {
  const config = {
    nearConfig: {
      networkId: 'testnet'  // or 'mainnet'
    },
    walletConnectOptions: {
      contractId: 'your-contract.testnet'
    }
  };

  return (
    <NEARLogin config={config}>
      <div>
        <h1>My NEAR App</h1>
        <p>This content is shown when authenticated</p>
      </div>
    </NEARLogin>
  );
}
```

### With Staking Validation

```tsx
import { NEARLogin } from '@vitalpointai/near-login';

function App() {
  const config = {
    requireStaking: true,
    validator: {
      poolId: 'validator.pool.near',
      minStake: '100'  // Minimum 100 NEAR staked
    },
    nearConfig: {
      networkId: 'testnet'
    },
    walletConnectOptions: {
      contractId: 'your-contract.testnet'
    }
  };

  return (
    <NEARLogin 
      config={config}
      useGuidedStaking={true}  // Use the guided wizard for easier staking
      showHelp={true}
      helpTexts={{
        staking: "This app requires staking to access premium features. You'll earn rewards while staked!"
      }}
      onToast={(toast) => console.log('Notification:', toast)}
    >
      <div>
        <h1>Staking-Protected App</h1>
        <p>Only staked users can see this content</p>
      </div>
    </NEARLogin>
  );
}
```

### Using the Hook

```tsx
import { useNEARLogin } from '@vitalpointai/near-login';

function MyComponent() {
  const {
    isConnected,
    isAuthenticated, 
    isStaked,
    accountId,
    signIn,
    signOut,
    stake
  } = useNEARLogin();

  if (!isConnected) {
    return <button onClick={signIn}>Connect Wallet</button>;
  }

  return (
    <div>
      <p>Connected as: {accountId}</p>
      {isStaked ? (
        <p>✅ Staking validated</p>
      ) : (
        <button onClick={() => stake('100')}>
          Stake 100 NEAR
        </button>
      )}
      <button onClick={signOut}>Disconnect</button>
    </div>
  );
}
```

### Route Protection

```tsx
import { ProtectedRoute } from '@vitalpointai/near-login';

function App() {
  const config = {
    requireStaking: true,
    validator: { 
      poolId: 'validator.pool.near' 
    },
    nearConfig: {
      networkId: 'testnet'
    }
  };

  return (
    <ProtectedRoute config={config}>
      <div>This content requires authentication and staking</div>
    </ProtectedRoute>
  );
}
```

## Educational Features 🎓

This library includes comprehensive educational components to help onboard users who are new to Web3 and cryptocurrency:

### Educational Props on NEARLogin

```tsx
<NEARLogin 
  config={config}
  // Enable help tooltips throughout the UI
  showHelp={true}
  helpTexts={{
    walletConnection: "Your custom help text for wallet connection",
    staking: "Your custom help text for staking process",
    stakingAmount: "Your custom help text for choosing stake amount",
    rewards: "Your custom help text about staking rewards"
  }}
  
  // Show educational content for crypto beginners
  showEducation={true}
  educationTopics={[
    'what-is-wallet',      // Explains crypto wallets
    'why-near',            // Benefits of NEAR Protocol
    'how-staking-works',   // How staking generates rewards
    'security-tips'        // Best practices for wallet security
  ]}
  
  // Use guided wizard instead of direct staking UI
  useGuidedStaking={true}
>
  <YourAppContent />
</NEARLogin>
```

### Individual Educational Components

Import and use educational components anywhere in your app:

```tsx
import { 
  EducationTooltip, 
  WalletEducation, 
  GuidedStakingWizard 
} from '@vitalpointai/near-login';

// Helpful tooltips
<EducationTooltip
  content="Detailed explanation text..."
  title="Tooltip Title"
  position="top" // top, bottom, left, right
  trigger="hover" // hover, click
>
  <YourTriggerElement />
</EducationTooltip>

// Progressive education flow
<WalletEducation
  topics={['what-is-wallet', 'why-near']}
  showVideo={false} // Optional video content
  onComplete={() => console.log('Education completed')}
/>

// Step-by-step staking wizard
<GuidedStakingWizard
  validator={{
    poolId: 'your-validator.pool.near',
    displayName: 'Your Validator',
    minStake: '1',
    description: 'Description of your validator'
  }}
  minStake="1"
  onComplete={(amount) => handleStaking(amount)}
  onCancel={() => handleCancel()}
  helpTexts={{
    staking: "Custom help text for staking step",
    stakingAmount: "Custom help text for amount selection",
    rewards: "Custom help text about rewards"
  }}
/>
```

## Configuration

### AuthConfig Interface

```tsx
interface AuthConfig {
  // Validator configuration (optional)
  validator?: ValidatorConfig;
  
  // NEAR network configuration (optional - defaults provided)
  nearConfig?: Partial<NEARConfig>;
  
  // Backend integration (optional)
  backend?: AuthBackendConfig;
  
  // Wallet connection options (optional)
  walletConnectOptions?: {
    contractId?: string;
    theme?: 'auto' | 'light' | 'dark';
  };
  
  // Session configuration (optional)
  sessionConfig?: {
    duration?: number;        // Session duration in milliseconds (DEPRECATED - use sessionSecurity.maxAge)
    storageKey?: string;      // Local storage key for session
    rememberSession?: boolean; // Whether to persist sessions across browser sessions (default: true)
  };
  
  // Enhanced security configuration (optional)
  sessionSecurity?: SessionSecurityConfig;
  
  // Global staking requirement (optional)
  requireStaking?: boolean;   // Global flag to require staking (default: true if validator provided, false otherwise)
  
  // Multi-chain configuration (optional)
  chainSignature?: {
    contractId?: string;      // Optional - auto-selected: 'v1.signer' (mainnet) or 'v1.signer-prod.testnet' (testnet)
    supportedChains?: string[]; // Optional - chains to enable for multi-chain signatures
  };
}

interface NEARConfig {
  networkId: 'mainnet' | 'testnet';
  nodeUrl: string;
  walletUrl: string;
  helperUrl: string;
  explorerUrl: string;
}

interface ValidatorConfig {
  poolId: string;           // e.g., 'vitalpoint.pool.near'
  displayName?: string;     // Human-readable validator name
  description?: string;     // Validator description
  required?: boolean;       // Whether staking is required (default: true)
  minStake?: string;        // Minimum stake amount in NEAR
}

interface SessionSecurityConfig {
  // Session expiration and refresh
  maxAge?: number;          // Maximum session age in milliseconds (default: 7 days)
  idleTimeout?: number;     // Idle timeout in milliseconds (default: 24 hours)
  refreshThreshold?: number; // Refresh token when this close to expiration (default: 25% of maxAge)
  
  // Device and location binding
  deviceFingerprinting?: boolean; // Enable device fingerprinting (default: true)
  bindToIP?: boolean;       // Bind session to IP address (default: false - can break mobile)
  requireReauth?: number;   // Require re-authentication after this time in milliseconds
  
  // Storage security
  encryptStorage?: boolean; // Encrypt session data in localStorage (default: true)
  secureStorage?: boolean;  // Use sessionStorage instead of localStorage (default: false)
  
  // Session validation
  validateOnFocus?: boolean; // Validate session when window gains focus (default: true)
  validateInterval?: number; // Background validation interval in milliseconds (default: 5 minutes)
  validateWithBackend?: string; // Backend endpoint for session validation
  
  // Cleanup and rotation
  rotateTokens?: boolean;   // Rotate session tokens periodically (default: false)
  preventConcurrent?: boolean; // Prevent multiple concurrent sessions (default: false)
  clearOnError?: boolean;   // Clear session on authentication errors (default: true)
  
  // Event handlers
  onSecurityViolation?: (violation: SecurityViolation) => void;
  onSessionExpired?: () => void;
  
  // Development vs Production
  allowInsecure?: boolean;  // Allow insecure practices in development (default: false)
}

interface AuthBackendConfig {
  backendUrl?: string;
  sessionEndpoint?: string;
  verifyEndpoint?: string;
  stakingEndpoint?: string;
}
```

### Component Props

#### NEARLogin Props

```tsx
interface NEARLoginProps {
  config: AuthConfig;                    // Configuration object
  children: ReactNode;                   // Content to show when authenticated
  onToast?: (toast: ToastNotification) => void;  // Toast notifications
  renderLoading?: () => ReactNode;       // Custom loading component
  renderError?: (error: string, retry: () => void) => ReactNode;  // Custom error component
  renderUnauthorized?: (signIn: () => Promise<void>, stake?: (amount: string) => Promise<void>) => ReactNode;  // Custom unauthorized component
}
```

#### ProtectedRoute Props

```tsx
interface ProtectedRouteProps {
  config: AuthConfig;                    // Configuration object
  children: ReactNode;                   // Protected content
  fallback?: ReactNode;                  // Content to show when not authenticated
  requireStaking?: boolean;              // Override staking requirement
}
```
## Hooks

### useNEARLogin

The main hook for accessing NEAR authentication state:

```tsx
const {
  // Connection state
  isConnected,         // boolean - wallet connected
  isAuthenticated,     // boolean - wallet connected and session valid
  isStaked,           // boolean - has valid staking (if required)
  isLoading,          // boolean - loading state
  
  // Account info
  accountId,          // string | null - connected account ID
  stakingInfo,        // StakingInfo | null - staking details
  sessionToken,       // string | null - current session token
  error,              // string | null - current error message
  config,             // AuthConfig | null - current configuration
  
  // Actions
  signIn,             // () => Promise<void> - connect wallet
  signOut,            // () => Promise<void> - disconnect wallet
  stake,              // (amount: string) => Promise<void> - stake NEAR (renamed from stakeTokens)
  unstake,            // (amount: string) => Promise<void> - unstake NEAR (renamed from unstakeTokens)
  refresh,            // () => Promise<void> - refresh staking data
  initialize,         // (config: AuthConfig) => Promise<void> - initialize with config
  
  // Computed values
  canStake,           // boolean - can perform staking
  requiresStaking,    // boolean - staking is required by config
  
  // Utilities
  getStakedAmount,    // () => string - get staked amount
  getUnstakedAmount,  // () => string - get unstaked amount
  getValidatorInfo,   // () => ValidatorConfig | null - get validator info
} = useNEARLogin();
```

### Multi-Chain Authentication

For advanced multi-chain functionality:

```tsx
import { useMultiChainAuth } from '@vitalpointai/near-login';

const multiChain = useMultiChainAuth({
  config: nearConfig,
  near: nearConnection,
  selector: walletSelector
});
```

### Simplified Multi-Chain

```tsx
import { useSimpleMultiChainAuth } from '@vitalpointai/near-login';

const {
  isAuthenticated,
  connectChain,
  signAuthMessage
} = useSimpleMultiChainAuth(config, near, selector);
```

## Data Types

### Authentication State

```tsx
interface UseNEARLogin {
  // State
  isLoading: boolean;
  isConnected: boolean;
  accountId: string | null;
  isAuthenticated: boolean;
  isStaked: boolean;
  stakingInfo: StakingInfo | null;
  sessionToken: string | null;
  error: string | null;
  config: AuthConfig | null;
  
  // Actions
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  stake: (amount: string) => Promise<void>;
  unstake: (amount: string) => Promise<void>;
  refresh: () => Promise<void>;
  initialize: (config: AuthConfig) => Promise<void>;
  
  // Computed
  canStake: boolean;
  requiresStaking: boolean;
  
  // Utilities
  getStakedAmount: () => string;
  getUnstakedAmount: () => string;
  getValidatorInfo: () => ValidatorConfig | null;
}
```

### Staking Information

```tsx
interface StakingInfo {
  accountId: string;
  stakedAmount: string;          // Amount staked in yoctoNEAR
  unstakedAmount: string;        // Amount unstaked in yoctoNEAR
  availableForWithdrawal: string; // Amount available for withdrawal in yoctoNEAR
  rewards: string;               // Rewards earned in yoctoNEAR
  isStaking: boolean;            // Whether currently staking
  poolId: string;                // Validator pool ID
}
```

### Toast Notifications

```tsx
interface ToastNotification {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;  // Display duration in milliseconds
}
```

## Advanced Features

### Multi-Chain Authentication

The library supports cross-chain authentication using NEAR's chain signature functionality with automatic MPC contract selection:

```tsx
import { 
  useMultiChainAuth,
  MultiChainAuthManager,
  ChainSignatureContract,
  MPC_CONTRACTS,
  DEFAULT_CHAIN_CONFIGS 
} from '@vitalpointai/near-login';

// MPC contracts are automatically selected based on network:
// Mainnet: 'v1.signer'
// Testnet: 'v1.signer-prod.testnet'
console.log(MPC_CONTRACTS.mainnet);  // 'v1.signer'
console.log(MPC_CONTRACTS.testnet);  // 'v1.signer-prod.testnet'

// Basic setup - contract ID is auto-selected based on networkId
const config = {
  networkId: 'testnet', // or 'mainnet'
  chainSignature: {
    // contractId is automatically set to 'v1.signer-prod.testnet' for testnet
    // or 'v1.signer' for mainnet
    supportedChains: ['ethereum', 'bitcoin', 'solana'],
  }
};

// Optional: Override with custom MPC contract
const customConfig = {
  networkId: 'testnet',
  chainSignature: {
    contractId: 'my-custom-mpc.testnet', // Override default
    supportedChains: ['ethereum', 'bitcoin'],
  }
  }
};

const multiChain = useMultiChainAuth({
  config,
  near: nearConnection,
  selector: walletSelector
});

// Connect to multiple chains
await multiChain.connectMultipleChains(['ethereum', 'bitcoin']);

// Sign messages for different chains
const ethSignature = await multiChain.signAuthMessage('ethereum');
const btcSignature = await multiChain.signAuthMessage('bitcoin');
```

#### Automatic MPC Contract Selection

The library automatically selects the correct MPC contract based on your network configuration:

```tsx
// No need to specify contractId - automatically selected!
const config = {
  nearConfig: { networkId: 'mainnet' }, // Uses 'v1.signer'
  chainSignature: {
    supportedChains: ['ethereum', 'bitcoin']
  }
};

// Or for testnet
const testnetConfig = {
  nearConfig: { networkId: 'testnet' }, // Uses 'v1.signer-prod.testnet'
  chainSignature: {
    supportedChains: ['ethereum', 'bitcoin']
  }
};

// Access contract IDs directly if needed
import { MPC_CONTRACTS } from '@vitalpointai/near-login';
console.log(MPC_CONTRACTS.mainnet);  // 'v1.signer'
console.log(MPC_CONTRACTS.testnet);  // 'v1.signer-prod.testnet'
```

### Utility Functions

The library provides various utility functions:

```tsx
import {
  formatNearAmount,
  stakeTokens,
  unstakeTokens,
  getStakingInfo,
  validateStakingAmount,
  createNearConnection,
  DEFAULT_NEAR_CONFIG
} from '@vitalpointai/near-login';

// Format NEAR amounts
const formatted = formatNearAmount('1000000000000000000000000'); // "1 NEAR"

// Direct staking operations
await stakeTokens(near, 'validator.pool.near', '100');
await unstakeTokens(near, 'validator.pool.near', '50');

// Get staking information
const stakingInfo = await getStakingInfo(near, 'user.near', 'validator.pool.near');

// Validate stake amount
const isValid = validateStakingAmount('100', '1'); // amount >= minimum

// Create NEAR connection
const near = await createNearConnection(DEFAULT_NEAR_CONFIG.testnet);
```

### Custom Components

You can customize the authentication flow with custom render functions:

```tsx
<NEARLogin
  config={config}
  renderLoading={() => <div>Loading your custom spinner...</div>}
  renderError={(error, retry) => (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error}</p>
      <button onClick={retry}>Try Again</button>
    </div>
  )}
  renderUnauthorized={(signIn, stake) => (
    <div>
      <h2>Welcome!</h2>
      <button onClick={signIn}>Connect NEAR Wallet</button>
      {stake && (
        <button onClick={() => stake('100')}>
          Stake 100 NEAR
        </button>
      )}
    </div>
  )}
>
  <YourProtectedContent />
</NEARLogin>
```
## Examples

Explore complete examples in the `/examples` directory:

- **[educational-staking.tsx](./examples/educational-staking.tsx)** - Complete educational staking flow
- **[component-showcase.tsx](./examples/component-showcase.tsx)** - Individual educational components
- **[mpc-contract-demo.tsx](./examples/mpc-contract-demo.tsx)** - Automatic MPC contract selection demo
- **[basic-auth.tsx](./examples/basic-auth.tsx)** - Simple wallet authentication
- **[staking-validation.tsx](./examples/staking-validation.tsx)** - Required staking setup

### Complete App Example with Educational Features

```tsx
import React from 'react';
import { NEARLogin, useNEARLogin } from '@vitalpointai/near-login';

// Protected content component
function Dashboard() {
  const { accountId, isStaked, stakingInfo, stake, signOut } = useNEARLogin();

  return (
    <div>
      <h1>Welcome, {accountId}!</h1>
      
      {isStaked ? (
        <div>
          <p>✅ Staking Status: Active</p>
          <p>Staked Amount: {stakingInfo?.stakedAmount} yoctoNEAR</p>
          <p>Validator: {stakingInfo?.poolId}</p>
        </div>
      ) : (
        <div>
          <p>❌ Staking Required</p>
          <button onClick={() => stake('100')}>
            Stake 100 NEAR
          </button>
        </div>
      )}
      
      <button onClick={signOut}>Disconnect</button>
    </div>
  );
}

// Main app component with educational features
function App() {
  const config = {
    requireStaking: true,
    validator: {
      poolId: 'vitalpoint.pool.near',
      minStake: '100',
      displayName: 'VitalPoint Validator',
      required: true
    },
    nearConfig: {
      networkId: 'testnet'
    },
    walletConnectOptions: {
      contractId: 'your-contract.testnet'
    }
  };

  const handleToast = (toast) => {
    // Handle toast notifications (integrate with your toast library)
    console.log(`${toast.type}: ${toast.title} - ${toast.message}`);
  };

  return (
    <NEARLogin 
      config={config}
      onToast={handleToast}
      // Educational features for better user onboarding
      showHelp={true}
      helpTexts={{
        walletConnection: "Connect your NEAR wallet to access premium features. Your private keys never leave your wallet!",
        staking: "This app requires staking 100 NEAR to access. You'll earn ~10% annual rewards on your staked tokens.",
        stakingAmount: "Start with the minimum required amount. You can always add more later.",
        rewards: "Rewards are automatically compounded and can be claimed anytime."
      }}
      showEducation={true}
      educationTopics={['what-is-wallet', 'why-near', 'how-staking-works', 'security-tips']}
      useGuidedStaking={true}  // Use wizard instead of direct staking UI
    >
      <Dashboard />
    </NEARLogin>
  );
}

export default App;
```

### Using with Next.js

```tsx
```tsx
// pages/_app.tsx or app/layout.tsx
import { NEARLogin } from '@vitalpointai/near-login';

export default function MyApp({ Component, pageProps }) {
  const config = {
    requireStaking: false,  // Optional staking
    nearConfig: {
      networkId: 'mainnet'
    }
  };

  return (
    <NEARLogin config={config}>
      <Component {...pageProps} />
    </NEARLogin>
  );
}
```

// pages/protected.tsx
import { useNEARLogin, ProtectedRoute } from '@vitalpointai/near-login';

function ProtectedPage() {
  const { isAuthenticated, accountId } = useNEARLogin();

  if (!isAuthenticated) {
    return <div>This page is protected</div>;
  }

  return (
    <div>
      <h1>Protected Content</h1>
      <p>Hello, {accountId}!</p>
    </div>
  );
}

// Alternatively, use ProtectedRoute component
function AltProtectedPage() {
  const config = { 
    requireStaking: true,
    nearConfig: {
      networkId: 'mainnet'
    }
  };

  return (
    <ProtectedRoute config={config}>
      <div>This content requires staking</div>
    </ProtectedRoute>
  );
}
```

### Integration with Toast Libraries

```tsx
import { toast } from 'react-hot-toast'; // or your preferred toast library
import { NEARLogin } from '@vitalpointai/near-login';

function App() {
  const handleToast = (notification) => {
    switch (notification.type) {
      case 'success':
        toast.success(notification.message);
        break;
      case 'error':
        toast.error(notification.message);
        break;
      case 'warning':
        toast.warning(notification.message);
        break;
      default:
        toast(notification.message);
    }
  };

  return (
    <NEARLogin 
      config={config}
      onToast={handleToast}
    >
      <YourApp />
    </NEARLogin>
  );
}
```
```

## Development

### Setup

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

# Run tests in watch mode
pnpm test:watch

# Check test coverage
pnpm test:coverage

# Lint code
pnpm lint

# Build for production
pnpm build
```

### Project Structure

```
src/
├── components/        # React components
│   ├── NEARLogin.tsx     # Main authentication component
│   └── ProtectedRoute.tsx # Route protection component
├── hooks/            # React hooks
│   ├── useNEARLogin.ts   # Main authentication hook
│   └── useMultiChainAuth.ts # Multi-chain authentication
├── store/            # State management
│   └── auth.ts          # Authentication store
├── utils/            # Utility functions
│   ├── near.ts          # NEAR protocol utilities
│   ├── multi-chain-auth.ts # Multi-chain functionality
│   └── chain-signature-contract.ts # Chain signature contract
├── types/            # TypeScript type definitions
└── index.ts          # Main export file
```

### Testing

The library includes comprehensive tests:

- **Unit tests**: Individual function and component testing
- **Integration tests**: Full authentication flow testing  
- **Hook tests**: React hook behavior testing
- **Multi-chain tests**: Cross-chain functionality testing

Run tests with coverage:
```bash
pnpm test:coverage
```

### Building

The build process generates:
- **ESM bundle** (`dist/index.js`) - Modern ES modules
- **CommonJS bundle** (`dist/index.cjs`) - Node.js compatibility
- **TypeScript declarations** (`dist/index.d.ts`) - Full type support

## Troubleshooting

### Common Issues

#### TypeScript Errors
```tsx
// ❌ Incorrect - flat props
<NEARLogin networkId="testnet" contractId="test.near" />

// ✅ Correct - config object
<NEARLogin config={{ networkId: 'testnet', contractId: 'test.near' }} />
```

#### Missing Peer Dependencies
```bash
# Install required peer dependencies
npm install react react-dom @near-wallet-selector/core @near-wallet-selector/my-near-wallet
```

#### Session Not Persisting
- Check browser localStorage availability
- Ensure `maxAge` is set appropriately in config
- Verify no browser privacy settings blocking storage

#### Staking Validation Failing
- Verify validator pool ID is correct
- Check minimum stake amount configuration
- Ensure validator pool is active and accepting delegations

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
# For Vite/React apps
VITE_DEBUG_NEAR_LOGIN=true npm start

# For Next.js apps  
DEBUG_NEAR_LOGIN=true npm run dev
```

### Browser Compatibility

- **Modern browsers**: Chrome 88+, Firefox 78+, Safari 14+, Edge 88+
- **Required features**: ES2020, LocalStorage, Fetch API, WebCrypto
- **Polyfills**: May be needed for older browsers

## Contributing

We welcome contributions! Here's how to get started:

### Contributing Guidelines

1. **Fork the repository** and create a feature branch
2. **Follow the coding standards**: ESLint and Prettier configs provided
3. **Write tests** for new features and bug fixes
4. **Update documentation** including README and JSDoc comments
5. **Test your changes** with `pnpm test` and `pnpm lint`
6. **Submit a pull request** with a clear description of changes

### Code Standards

- **TypeScript**: Use strict TypeScript with full type coverage
- **React**: Use modern hooks and functional components
- **Testing**: Jest and React Testing Library for all tests
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier for consistent code formatting

### Development Workflow

```bash
# 1. Fork and clone
git clone https://github.com/your-username/NEAR-Login.git
cd NEAR-Login

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Install dependencies
pnpm install

# 4. Make changes and test
pnpm test
pnpm lint

# 5. Commit and push
git commit -m "feat: add your feature"
git push origin feature/your-feature-name

# 6. Create pull request
```

### Release Process

This project uses automated releases:
- **Version bumping**: Automatic semantic versioning
- **Testing**: All tests must pass before release
- **Building**: Automated build and type generation
- **Publishing**: Automatic npm publishing on merge to main
- **GitHub Releases**: Automated release notes generation

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Support

- **📚 Documentation**: This README and inline code documentation
- **🐛 Issues**: Report bugs on [GitHub Issues](https://github.com/VitalPointAI/NEAR-Login/issues)
- **💡 Feature Requests**: Use GitHub Issues with the `enhancement` label
- **📧 Contact**: Open an issue for questions and support

## Changelog

### v1.0.5 - Educational Features Release 🎓

**New Features:**
- **Educational Components**: Added `WalletEducation`, `EducationTooltip`, and `GuidedStakingWizard` components
- **Enhanced NEARLogin**: New props `showHelp`, `helpTexts`, `showEducation`, `educationTopics`, and `useGuidedStaking`
- **Progressive Onboarding**: Step-by-step education flow for crypto beginners
- **Guided Staking Wizard**: Three-step wizard to simplify the staking process
- **Contextual Help**: Tooltips and help text throughout the UI

**Improvements:**
- Better user experience for Web3 newcomers
- Reduced cognitive load with progressive disclosure
- Improved accessibility with proper ARIA labels
- Mobile-responsive educational components

See [CHANGELOG.md](./CHANGELOG.md) for complete version history and breaking changes.

---

**🚀 Ready to build?** Check out the [examples](./examples/) directory for more usage patterns and integration guides.
