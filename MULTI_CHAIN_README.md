# Multi-Chain Authentication with NEAR Chain Signatures

This library now supports **Universal Wallet Authentication** using NEAR's Chain Signatures technology. Users can authenticate with **any wallet** (Ethereum, Bitcoin, Solana, XRP, Aptos, Sui, etc.) while leveraging NEAR's Multi-Party Computation (MPC) network for secure cross-chain operations.

## � Live Demo

Try the interactive multi-chain demo:
- **Development**: Run `npm run dev` and visit `http://localhost:5174/multi-chain-demo.html`
- **Features**: Connect to 6+ blockchains with universal wallet support
- **Interactive**: Experience the complete NEAR Chain Signatures MPC flow

## �🌟 What are NEAR Chain Signatures?

NEAR Chain Signatures enable users to control addresses and sign transactions on any blockchain using NEAR's decentralized MPC network. This means:

- **Universal Wallet Support**: Authenticate with any wallet type (MetaMask, Phantom, Ledger, etc.)
- **Cross-Chain Operations**: One authentication works across all supported blockchains
- **Zero Trust**: No single entity controls the signing process
- **NEAR-Powered Security**: Backed by NEAR Protocol's robust validator network

## 🚀 Quick Start

### Basic Multi-Chain Authentication

```typescript
import { useMultiChainAuth } from 'near-login-with-staking';

function MyApp() {
  const {
    isAuthenticated,
    connectedChains,
    connectChain,
    signAuthMessage
  } = useMultiChainAuth({
    config: {
      allowedChains: ['ethereum', 'bitcoin', 'solana'],
      chainSignature: {
        contractId: 'v1.signer-prod.testnet',
        networkId: 'testnet',
        supportedChains: {},
        derivationPaths: {},
      }
    },
    near,
    selector
  });

  const handleConnectEthereum = async () => {
    const address = await connectChain('ethereum');
    console.log('Ethereum address:', address.address);
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <h2>Connected to {connectedChains.length} chains</h2>
          <button onClick={() => signAuthMessage('ethereum')}>
            Sign with Ethereum
          </button>
        </div>
      ) : (
        <button onClick={handleConnectEthereum}>
          Connect Ethereum Wallet
        </button>
      )}
    </div>
  );
}
```

### Simplified Multi-Chain Auth

```typescript
import { useSimpleMultiChainAuth } from 'near-login-with-staking';

function SimpleApp() {
  const {
    isAuthenticated,
    connectChain,
    signAuthMessage
  } = useSimpleMultiChainAuth(
    {
      supportedChains: ['ethereum', 'bitcoin', 'solana'],
      networkId: 'testnet'
    },
    near,
    selector
  );

  return (
    <div>
      {!isAuthenticated ? (
        <button onClick={() => connectChain('ethereum')}>
          Connect Any Ethereum Wallet
        </button>
      ) : (
        <div>Authenticated! 🎉</div>
      )}
    </div>
  );
}
```

## 🔗 Supported Blockchains

| Chain | Status | Wallet Types Supported |
|-------|--------|----------------------|
| **Ethereum** | ✅ | MetaMask, WalletConnect, Coinbase, Ledger, Trezor |
| **Bitcoin** | ✅ | Electrum, Ledger, Trezor, Mobile wallets |
| **Solana** | ✅ | Phantom, Solflare, Ledger |
| **Polygon** | ✅ | MetaMask, WalletConnect, Coinbase |
| **Arbitrum** | ✅ | MetaMask, WalletConnect, Rainbow |
| **Optimism** | ✅ | MetaMask, WalletConnect |
| **BSC** | ✅ | MetaMask, Trust Wallet, Binance Wallet |
| **Avalanche** | ✅ | MetaMask, Avalanche Wallet |
| **XRP** | ✅ | XUMM, Ledger |
| **Aptos** | ✅ | Petra, Martian, Ledger |
| **Sui** | ✅ | Sui Wallet, Ethos Wallet |

## 🏗️ Advanced Configuration

### Multi-Chain Authentication Manager

```typescript
import { 
  MultiChainAuthManager,
  type MultiChainAuthConfig 
} from 'near-login-with-staking';

const config: MultiChainAuthConfig = {
  // Required: Which chains to allow
  allowedChains: ['ethereum', 'bitcoin', 'solana', 'polygon'],
  
  // Optional: Minimum number of chains to authenticate
  minimumChains: 2,
  requireMultipleChains: true,
  
  // Optional: Session configuration
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  enableSessionRefresh: true,
  enableAutoRefresh: true,
  
  // Chain Signatures configuration
  chainSignature: {
    contractId: 'v1.signer-prod.testnet', // or 'v1.signer' for mainnet
    networkId: 'testnet',
    supportedChains: {}, // Will use defaults
    derivationPaths: {}, // Will use defaults
  }
};

const authManager = new MultiChainAuthManager(
  config,
  near,
  selector,
  (state) => console.log('State updated:', state),
  (error) => console.error('Auth error:', error)
);

// Initialize
await authManager.initialize();

// Connect to multiple chains at once
const addresses = await authManager.connectMultipleChains([
  'ethereum', 'bitcoin', 'solana'
]);

// Sign authentication messages for all connected chains
const signatures = await authManager.signMultipleAuthMessages(
  ['ethereum', 'bitcoin', 'solana'],
  'Welcome to my dApp!'
);
```

### Custom Chain Configuration

```typescript
import { 
  MultiChainAddressDeriver,
  ChainSignatureContract,
  type ChainConfig 
} from 'near-login-with-staking';

// Custom derivation paths
const customConfig = {
  chainSignature: {
    contractId: 'v1.signer-prod.testnet',
    networkId: 'testnet',
    supportedChains: {
      ethereum: {
        name: 'Ethereum',
        chainId: 1,
        rpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/your-key',
        explorerUrl: 'https://etherscan.io',
        nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
        keyType: 'Ecdsa' as const,
      },
      // ... other chains
    },
    derivationPaths: {
      ethereum: "ethereum,1", // Custom path for Ethereum
      bitcoin: "bitcoin,0",   // Custom path for Bitcoin
      // ... other chains
    }
  }
};
```

## 🔐 Authentication Flow

1. **Connect NEAR Wallet**: User connects any NEAR wallet (MyNearWallet, Meteor, etc.)
2. **Derive Addresses**: Generate addresses for target blockchains using MPC
3. **Present Addresses**: Show user their addresses on each blockchain
4. **Sign Messages**: Create authentication signatures using NEAR's MPC network
5. **Verify Signatures**: Validate signatures on the target blockchain

```typescript
// Example: Complete authentication flow
const authFlow = async () => {
  // Step 1: Initialize
  await authManager.initialize();
  
  // Step 2: Connect to Ethereum
  const ethAddress = await authManager.connectChain('ethereum');
  console.log('Your Ethereum address:', ethAddress.address);
  
  // Step 3: Sign authentication message
  const signature = await authManager.signAuthMessage('ethereum', 'Login to MyDApp');
  
  // Step 4: Verify authentication
  if (authManager.isChainAuthenticated('ethereum')) {
    console.log('Successfully authenticated with Ethereum!');
  }
};
```

## 🛠️ Address Derivation

The library automatically derives blockchain-specific addresses from your NEAR account:

```typescript
import { MultiChainAddressDeriver } from 'near-login-with-staking';

const deriver = new MultiChainAddressDeriver(contract, config);

// Derive single address
const ethAddress = await deriver.deriveAddress('your-account.near', 'ethereum');

// Derive multiple addresses
const addresses = await deriver.deriveMultipleAddresses('your-account.near', [
  'ethereum', 'bitcoin', 'solana'
]);

console.log('Addresses:', addresses);
// {
//   ethereum: { address: '0x...', derivationPath: 'ethereum,1', publicKey: '...' },
//   bitcoin: { address: 'bc1q...', derivationPath: 'bitcoin,0', publicKey: '...' },
//   solana: { address: '5K...', derivationPath: 'solana,0', publicKey: '...' }
// }
```

## 🔄 Cross-Chain Transaction Signing

Beyond authentication, you can sign actual blockchain transactions:

```typescript
// Sign Ethereum transaction
const ethTx = {
  to: '0x742d35Cc6634C0532925a3b8D72Cb0c5db34c4',
  value: '1000000000000000000', // 1 ETH in wei
  gasLimit: '21000',
  gasPrice: '20000000000'
};

const ethSignature = await authManager.signTransaction('ethereum', ethTx);

// Sign Bitcoin transaction
const btcTx = {
  inputs: [{ txid: '...', vout: 0, value: 100000 }],
  outputs: [{ address: 'bc1q...', value: 90000 }],
  fee: 10000
};

const btcSignature = await authManager.signTransaction('bitcoin', btcTx);
```

## ⚙️ Configuration Options

### MultiChainAuthConfig

```typescript
interface MultiChainAuthConfig {
  allowedChains?: SupportedChain[];           // Which chains to enable
  minimumChains?: number;                     // Minimum chains required
  requireMultipleChains?: boolean;            // Require multiple chain auth
  maxAge?: number;                           // Session expiration (ms)
  enableSessionRefresh?: boolean;            // Enable session refresh
  enableAutoRefresh?: boolean;               // Auto-refresh sessions
  chainSignature: ChainSignatureConfig;      // Chain signature settings
}
```

### ChainSignatureConfig

```typescript
interface ChainSignatureConfig {
  contractId: string;                        // MPC contract ID
  networkId: 'mainnet' | 'testnet';         // NEAR network
  supportedChains: Record<SupportedChain, ChainConfig>;  // Chain configs
  derivationPaths: Record<SupportedChain, string>;       // Derivation paths
}
```

## 🎯 Use Cases

### DeFi Applications
- **Cross-chain yield farming**: Users authenticate once, farm on multiple chains
- **Multi-chain portfolio management**: View and manage assets across all chains
- **Bridge operations**: Seamless cross-chain transfers with unified authentication

### NFT Marketplaces
- **Universal wallet support**: Accept buyers with any wallet type
- **Cross-chain NFT trading**: Trade NFTs across different blockchains
- **Unified user profiles**: Single identity across multiple marketplaces

### Gaming & Metaverse
- **Multi-chain game assets**: Items usable across different blockchain games
- **Universal player identity**: Same avatar/profile across all games
- **Cross-chain rewards**: Earn tokens on one chain, spend on another

### Social & Identity
- **Decentralized identity**: Prove ownership of addresses across chains
- **Social authentication**: Login to Web2 apps using any Web3 wallet
- **Reputation systems**: Build reputation across multiple blockchain ecosystems

## 🔒 Security Features

- **MPC Security**: No single point of failure, distributed signing
- **Session Management**: Secure session handling with automatic refresh
- **Error Handling**: Comprehensive error handling with recovery
- **Rate Limiting**: Built-in protection against spam requests
- **Signature Validation**: Cryptographic verification of all signatures

## 🌐 Network Support

### Mainnet Configuration
```typescript
const mainnetConfig = {
  chainSignature: {
    contractId: 'v1.signer',
    networkId: 'mainnet'
  }
};
```

### Testnet Configuration (Recommended for Development)
```typescript
const testnetConfig = {
  chainSignature: {
    contractId: 'v1.signer-prod.testnet',
    networkId: 'testnet'
  }
};
```

## 📊 Analytics & Monitoring

Track multi-chain authentication usage:

```typescript
const authManager = new MultiChainAuthManager(config, near, selector,
  (state) => {
    // Track state changes
    analytics.track('multi_chain_state_change', {
      connectedChains: Object.keys(state.connectedChains).length,
      activeChain: state.activeChain,
      isAuthenticated: authManager.isAuthenticated()
    });
  },
  (error) => {
    // Track errors
    analytics.track('multi_chain_error', {
      errorCode: error.code,
      chain: error.chain,
      message: error.message
    });
  }
);
```

## 🤝 Contributing

We welcome contributions to expand multi-chain support! Priority areas:

1. **New Chain Integrations**: Add support for additional blockchains
2. **Wallet Connectors**: Integrate with more wallet types
3. **Documentation**: Improve examples and guides
4. **Testing**: Expand test coverage for edge cases
5. **Performance**: Optimize address derivation and signing

## 📚 Resources

- [NEAR Chain Signatures Documentation](https://docs.near.org/build/chain-abstraction/chain-signatures)
- [Multi-Party Computation Explained](https://docs.near.org/build/chain-abstraction/what-is)
- [Cross-Chain dApp Examples](https://github.com/near/near-examples)
- [NEAR MPC Recovery](https://docs.near.org/build/chain-abstraction/signatures)

## 🐛 Troubleshooting

### Common Issues

1. **"Chain not supported" error**
   - Ensure the chain is in your `allowedChains` configuration
   - Check that the chain has a valid configuration in `supportedChains`

2. **"MPC timeout" error**
   - Network congestion - retry after a few seconds
   - Check your internet connection
   - Verify NEAR network status

3. **"Invalid signature" error**
   - Ensure you're using the correct derivation path
   - Verify the message format matches the expected structure
   - Check that the chain configuration is correct

4. **Address derivation fails**
   - Confirm your NEAR account has the required permissions
   - Check that the MPC contract is accessible
   - Verify your account has sufficient NEAR balance for gas

### Getting Help

- 🐛 [Report Issues](https://github.com/your-repo/issues)
- 💬 [Join Discord](https://discord.gg/nearprotocol)
- 📖 [Read Documentation](https://docs.near.org)
- 🎓 [Learning Resources](https://near.university)
