import React from 'react';
import { NEARLogin } from '../../src';

/**
 * Basic Example: Required Staking
 * 
 * Shows how to require staking for access. Users must stake
 * the minimum amount to access the application.
 */

function App() {
  const config = {
    nearConfig: { 
      networkId: 'testnet' as const,
      nodeUrl: 'https://rpc.testnet.near.org',
      walletUrl: 'https://testnet.mynearwallet.com/',
      helperUrl: 'https://helper.testnet.near.org'
    },
    requireStaking: true, // Key: staking is required
    validator: {
      poolId: 'staked.poolv1.near',
      displayName: 'Staked Pool',
      minStake: '5' // Minimum 5 NEAR required
    }
  };

  return (
    <NEARLogin 
      config={config}
      // Enable guided staking wizard for easier onboarding
      useGuidedStaking={true}
    >
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>🏆 Premium Access Granted!</h1>
        <p>You've successfully staked and gained access to premium features.</p>
        <p>🎉 You're earning rewards while you use the app!</p>
      </div>
    </NEARLogin>
  );
}

export default App;
