import React from 'react';
import { NEARLogin } from '../../src';

/**
 * Basic Example: Optional Staking
 * 
 * Shows how to make staking optional - users get benefits if they stake
 * but can still access the app without staking.
 */

function App() {
  const config = {
    nearConfig: { 
      networkId: 'testnet' as const,
      nodeUrl: 'https://rpc.testnet.near.org',
      walletUrl: 'https://testnet.mynearwallet.com/',
      helperUrl: 'https://helper.testnet.near.org'
    },
    requireStaking: false, // Key: staking is optional
    validator: {
      poolId: 'staked.poolv1.near',
      displayName: 'Staked Pool',
      minStake: '1'
    }
  };

  return (
    <NEARLogin config={config}>
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>💎 Premium Features Available</h1>
        <p>You're connected! You can access basic features.</p>
        <p>💡 <strong>Tip:</strong> Stake NEAR tokens to unlock premium features and earn rewards!</p>
      </div>
    </NEARLogin>
  );
}

export default App;
