import React from 'react';
import { NEARLogin, useNEARLogin } from '@vitalpointai/near-login';
import type { AuthConfig } from '@vitalpointai/near-login';

// Wallet-only authentication - no staking required
const config: AuthConfig = {
  nearConfig: {
    networkId: 'testnet', // or 'mainnet' for production
  },
  // No validator specified = wallet-only authentication
};

function WalletOnlyApp() {
  const { accountId, signOut, isLoading } = useNEARLogin();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        padding: '10px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <h2>Welcome to our NEAR App!</h2>
        <div>
          <span style={{ marginRight: '10px' }}>
            Connected as: <strong>{accountId}</strong>
          </span>
          <button 
            onClick={signOut}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? 'Signing out...' : 'Logout'}
          </button>
        </div>
      </div>
      
      <div style={{ 
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px'
      }}>
        <h3>🎉 You're authenticated!</h3>
        <p>This content is only visible to users who have connected their NEAR wallet.</p>
        <p>No staking required - just a simple wallet connection.</p>
        
        <div style={{ marginTop: '20px' }}>
          <h4>What you can do:</h4>
          <ul>
            <li>Access wallet-gated content</li>
            <li>Sign transactions</li>
            <li>Interact with NEAR dApps</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function App() {
  const handleToast = ({ title, description, variant }: any) => {
    console.log(`${variant?.toUpperCase()}: ${title} - ${description}`);
    // In a real app, you'd show this in a toast notification
    alert(`${title}: ${description}`);
  };

  return (
    <div>
      <NEARLogin config={config} onToast={handleToast}>
        <WalletOnlyApp />
      </NEARLogin>
    </div>
  );
}

export default App;
