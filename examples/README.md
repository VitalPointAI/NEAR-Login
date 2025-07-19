# Examples

This directory contains example implementations of @vitalpointai/near-login in different scenarios.

## Examples

### 1. wallet-only.tsx
Basic wallet authentication without any staking requirements. Perfect for simple NEAR dApps that just need wallet connection.

### 2. optional-staking.tsx  
Shows how to implement optional staking benefits where users can access the app without staking, but get additional features if they do stake.

### 3. required-staking.tsx
Demonstrates mandatory staking requirements where users must stake tokens to access the application.

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

Each example includes a different `AuthConfig` setup:

- **Wallet Only**: No validator specified
- **Optional Staking**: `requireStaking: false` with validator config
- **Required Staking**: `requireStaking: true` with validator config

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
