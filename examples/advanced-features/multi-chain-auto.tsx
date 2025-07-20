import React from 'react';
import { NEARLogin, MPC_CONTRACTS } from '../../src';

/**
 * Advanced Example: Multi-Chain with Auto MPC Selection
 * 
 * Demonstrates automatic MPC contract selection and multi-chain capabilities.
 * Contract ID is automatically chosen based on network (mainnet/testnet).
 */

function App() {
  const networkId = 'testnet' as const; // Change to 'mainnet' for production
  
  const config = {
    nearConfig: { networkId },
    // Multi-chain configuration with automatic MPC contract selection
    chainSignature: {
      // contractId is automatically set based on networkId:
      // - mainnet: 'v1.signer'  
      // - testnet: 'v1.signer-prod.testnet'
      supportedChains: ['ethereum', 'bitcoin']
    }
  };

  return (
    <NEARLogin config={config}>
      <div style={{ padding: '20px' }}>
        <h1>🔗 Multi-Chain Authentication</h1>
        <p>You're connected with multi-chain capabilities!</p>
        
        <div style={{ background: '#f0f8ff', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
          <h3>🛡️ MPC Contract Info</h3>
          <p><strong>Network:</strong> {networkId}</p>
          <p><strong>MPC Contract:</strong> <code>{MPC_CONTRACTS[networkId]}</code></p>
          <p><strong>Supported Chains:</strong> Ethereum, Bitcoin</p>
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <h3>✨ What You Can Do</h3>
          <ul style={{ textAlign: 'left' }}>
            <li>Sign transactions on multiple blockchains</li>
            <li>One identity across chains</li>
            <li>Access cross-chain DeFi protocols</li>
            <li>Automatic contract selection - no manual configuration needed!</li>
          </ul>
        </div>
      </div>
    </NEARLogin>
  );
}

export default App;
