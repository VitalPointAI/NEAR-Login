import React from 'react';
import { NEARLogin, type AuthConfig } from './src/index';

// Example 1: Basic configuration
const basicConfig: AuthConfig = {
  requireStaking: false,
  nearConfig: {
    networkId: "testnet"
  }
};

// Example 2: Staking-required configuration 
const stakingConfig: AuthConfig = {
  requireStaking: true,
  validator: {
    poolId: "vitalpoint.pool.near",
    minStake: "100"
  },
  nearConfig: {
    networkId: "mainnet"
  },
  sessionConfig: {
    duration: 24 * 60 * 60 * 1000, // 24 hours
    rememberSession: true
  }
};

// Example usage that should work according to TypeScript definitions
export const TestComponent1 = () => (
  <NEARLogin config={basicConfig}>
    <div>Protected content - basic</div>
  </NEARLogin>
);

export const TestComponent2 = () => (
  <NEARLogin config={stakingConfig}>
    <div>Protected content - staking required</div>
  </NEARLogin>
);

// Example with all optional props
export const TestComponent3 = () => (
  <NEARLogin 
    config={stakingConfig}
    showHelp={true}
    showEducation={true}
    useGuidedStaking={true}
    onToast={(toast) => console.log('Toast:', toast)}
  >
    <div>Protected content with education</div>
  </NEARLogin>
);

export default TestComponent1;
