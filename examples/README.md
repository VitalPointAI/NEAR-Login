# NEAR Login Examples

This folder contains organized examples showing different ways to use the `@vitalpointai/near-login` library.

## 🚀 Getting Started

**👉 [Visit the Interactive Demo Landing Page](http://localhost:5177/examples/) to explore all examples with a beautiful visual interface!**

Or browse the examples directly below:

## 📁 Folder Structure

### `/basic-usage/` - Getting Started Examples
Perfect for new users and common use cases:

- **`01-simple-wallet.tsx`** - Just wallet connection, no staking
- **`02-optional-staking.tsx`** - Staking provides benefits but isn't required  
- **`03-required-staking.tsx`** - Staking required for access
- **`04-beginner-friendly.tsx`** - Full educational experience for crypto newcomers

### `/advanced-features/` - Advanced Configuration Examples
For complex setups and enterprise use:

- **`multi-chain-auto.tsx`** - Multi-chain with automatic MPC contract selection
- **`mpc-contract-demo.tsx`** - Detailed MPC contract configuration  
- **`security-configurations.tsx`** - Production security settings

### `/interactive-demos/` - Live Demonstrations
Interactive demos you can run in the browser:

- **`demo-showcase.tsx`** - Complete interactive playground
- **`component-showcase.tsx`** - Individual component examples

## 🚀 Quick Start

### Option 1: Interactive Demo (Recommended)
```bash
# Run from the project root directory
cd /path/to/near-login-with-staking
pnpm run dev
# Then visit http://localhost:5177/examples/
```

### Option 2: Individual Examples
Copy any `.tsx` file from the folders above into your React app and customize as needed.

## 📋 Examples by Use Case

### **Just Need User Authentication?**
→ Use `basic-usage/01-simple-wallet.tsx`

### **Want to Incentivize Staking?** 
→ Use `basic-usage/02-optional-staking.tsx`

### **Need Staking for Premium Features?**
→ Use `basic-usage/03-required-staking.tsx`

### **Users New to Crypto?**
→ Use `basic-usage/04-beginner-friendly.tsx`

### **Need Multi-Chain Support?**
→ Use `advanced-features/multi-chain-auto.tsx`

### **Enterprise/Production Setup?**
→ Use `advanced-features/security-configurations.tsx`

## 🎯 Key Features Demonstrated

- ✅ **Automatic MPC Contract Selection** - Mainnet/testnet contracts chosen automatically
- ✅ **Educational Components** - Help tooltips and guides for crypto beginners  
- ✅ **Flexible Staking** - Optional, required, or no staking configurations
- ✅ **User Experience Modes** - Beginner vs experienced user interfaces
- ✅ **Security Configurations** - Production-ready security settings
- ✅ **Multi-Chain Support** - Cross-chain authentication with NEAR Chain Signatures

## 🌐 Multi-Chain & MPC Contract Features

### 🔄 Automatic MPC Contract Selection
The library automatically selects the correct MPC contract based on your network:
- **Mainnet**: Automatically uses `v1.signer`
- **Testnet**: Automatically uses `v1.signer-prod.testnet`
- **No manual configuration required** - just specify the network!

### 🛠️ Override Capability
- Developers can override with custom MPC contracts
- Useful for testing or private MPC deployments
- Access to `MPC_CONTRACTS` constants for manual configuration

### 👤 Experience Modes
- **Beginner Mode**: Full educational tooltips and guided experience
- **Experienced Mode**: Streamlined interface for crypto veterans
- **Bypass Option**: Quick authentication without educational overhead

## 🔧 Configuration Quick Reference

```tsx
// Basic wallet-only
const config = {
  nearConfig: { networkId: 'testnet' }
};

// With optional staking
const config = {
  nearConfig: { networkId: 'testnet' },
  requireStaking: false,
  validator: { poolId: 'your.pool.near', minStake: '1' }
};

// With required staking + educational features
const config = {
  nearConfig: { networkId: 'testnet' },
  requireStaking: true,
  validator: { poolId: 'your.pool.near', minStake: '5' }
};

// Multi-chain (MPC contract auto-selected)
const config = {
  nearConfig: { networkId: 'testnet' },
  chainSignature: {
    // contractId is automatically set based on networkId
    supportedChains: ['ethereum', 'bitcoin']
  }
};

// Custom MPC contract override
const config = {
  nearConfig: { networkId: 'testnet' },
  chainSignature: {
    contractId: 'my-custom-mpc.testnet', // Override default
    supportedChains: ['ethereum', 'bitcoin']
  }
};
```

### Accessing MPC Contract Constants
```typescript
import { MPC_CONTRACTS } from '@vitalpointai/near-login';

console.log(MPC_CONTRACTS.mainnet);  // 'v1.signer'
console.log(MPC_CONTRACTS.testnet);  // 'v1.signer-prod.testnet'
```

## 💡 Pro Tips

1. **Start Simple**: Begin with `01-simple-wallet.tsx` and add features as needed
2. **Use Educational Mode**: Enable `showHelp` and `showEducation` for mainstream users
3. **Test Networks**: Use `testnet` for development, `mainnet` for production
4. **MPC Contracts**: Let the library auto-select - no need to hardcode contract IDs
5. **Security**: Use settings from `security-configurations.tsx` for production apps

## 🏗️ Architecture Benefits

1. **Developer Experience**: No need to remember or look up MPC contract IDs
2. **Maintenance**: Centralized contract ID management
3. **Flexibility**: Easy to override for custom deployments
4. **User Experience**: Automatic selection reduces configuration errors
5. **Network Safety**: Prevents mainnet/testnet contract mixups

## 🧪 Testing

The examples include comprehensive tests for:
- Automatic contract selection
- Network-based routing
- Custom contract overrides
- User experience modes

Run tests with:
```bash
pnpm test -- examples
```

## 🎛️ Interactive Demo Features

The interactive demos showcase:

- **Demo Mode Selector**: Switch between different authentication configurations
- **User Experience Toggle**: Choose between guided and expert experience
- **Live Configuration Display**: See the exact props being passed to the widget
- **Toast Notifications**: Simulated feedback for user actions
- **Responsive Design**: Works on desktop and mobile
- **Modern UI**: Clean, professional appearance with smooth animations

## 📚 Real Implementation Example

```tsx
import { NEARLogin } from '@vitalpointai/near-login';

// Example: Required staking with guided experience
<NEARLogin
  stakingRequired={true}
  showHelp={true}
  helpTexts={{
    walletConnection: "Connect your NEAR wallet to get started.",
    staking: "This app requires staking to participate. Don't worry - we'll guide you through every step!",
    stakingAmount: "Start with the minimum amount while you learn."
  }}
  showEducation={true}
  educationTopics={['what-is-wallet', 'why-near', 'how-staking-works', 'security-tips']}
  useGuidedStaking={true}
  onToast={(toast) => {
    showToast(toast.type, toast.title, toast.message);
  }}
>
  <YourAppContent />
</NEARLogin>
```

## 🎯 Key Learnings

From these examples, you can see how the same widget can be configured for vastly different user experiences:

- **Beginners** get maximum guidance and education
- **Experts** get streamlined, minimal interfaces  
- **Optional features** can incentivize without requiring
- **Educational content** dramatically improves Web3 onboarding
- **Contextual help** reduces support burden

The examples show why having configurable educational features is crucial for Web3 adoption - it allows the same component to serve both newcomers and experienced users effectively.

## 💡 Use Cases

These examples are perfect for:

1. **Product Managers**: Understanding different user flows
2. **Developers**: Seeing implementation examples
3. **Designers**: Visualizing user experience variations
4. **Stakeholders**: Demonstrating the widget's flexibility
5. **Users**: Understanding what each mode provides

---

**Need help?** Check the main [README.md](../README.md) or open an issue on GitHub!
