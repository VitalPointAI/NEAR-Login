import React from 'react';
import { NEARLogin } from '../../src';

/**
 * Basic Example: Simple Wallet Connection
 * 
 * The simplest possible setup - just wallet connection, no staking required.
 * Perfect for dApps that only need user authentication.
 */

function App() {
  const config = {
    nearConfig: { 
      networkId: 'testnet' as const,
      nodeUrl: 'https://rpc.testnet.near.org',
      walletUrl: 'https://testnet.mynearwallet.com/',
      helperUrl: 'https://helper.testnet.near.org'
    } // or 'mainnet' for production
  };

  return (
    <div>
      {/* Back Button */}
      <div style={{ 
        position: 'fixed', 
        top: '20px', 
        left: '20px', 
        zIndex: 1000,
        background: 'white',
        padding: '10px 20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        cursor: 'pointer'
      }}
      onClick={() => {
        window.history.pushState({}, '', '/examples/');
        window.location.reload(); // Simple way to go back to landing page
      }}>
        ← Back to Examples
      </div>
      
      <NEARLogin config={config}>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>🎉 You're Connected!</h1>
          <p>This is the most basic NEAR authentication setup.</p>
        <p>Only wallet connection required - no staking needed.</p>
      </div>
    </NEARLogin>
    </div>
  );
}

export default App;
