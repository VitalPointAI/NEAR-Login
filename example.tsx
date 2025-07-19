import React from 'react';
import { NEARLogin, useNEARLogin } from './src';
import type { AuthConfig } from './src';

// Example 1: Wallet-only authentication
const walletOnlyConfig: AuthConfig = {
  nearConfig: {
    networkId: 'testnet', // Use testnet for development
  },
  // No validator = wallet-only authentication
};

// Example 2: Optional staking
const optionalStakingConfig: AuthConfig = {
  nearConfig: {
    networkId: 'testnet',
  },
  requireStaking: false,
  validator: {
    poolId: 'vitalpointai.poolv1.near',
    displayName: 'Vital Point AI',
    required: false,
    minStake: '1',
  },
};

// Example 3: Required staking
const requiredStakingConfig: AuthConfig = {
  nearConfig: {
    networkId: 'testnet',
  },
  requireStaking: true,
  validator: {
    poolId: 'vitalpointai.poolv1.near',
    displayName: 'Vital Point AI',
    required: true,
    minStake: '5',
  },
};

function WalletOnlyExample() {
  const { accountId, signOut } = useNEARLogin();
  
  return (
    <div className="example">
      <h2>Wallet-Only Access</h2>
      <p>Welcome {accountId}! You only needed to connect your wallet.</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}

function OptionalStakingExample() {
  const { accountId, isStaked, stake, signOut, getStakedAmount } = useNEARLogin();
  
  return (
    <div className="example">
      <h2>Optional Staking Benefits</h2>
      <p>Welcome {accountId}!</p>
      
      {isStaked ? (
        <div className="staker-benefits">
          <p>🎉 Thanks for staking {getStakedAmount()} NEAR!</p>
          <p>✨ You have access to premium features!</p>
        </div>
      ) : (
        <div className="non-staker">
          <p>💡 Stake tokens to unlock additional features:</p>
          <ul>
            <li>Premium analytics</li>
            <li>Priority support</li>
            <li>Exclusive content</li>
          </ul>
          <button onClick={() => stake('2')}>Stake 2 NEAR</button>
        </div>
      )}
      
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}

function RequiredStakingExample() {
  const { accountId, signOut, getStakedAmount } = useNEARLogin();
  
  return (
    <div className="example">
      <h2>VIP Stakers Only</h2>
      <p>Welcome to the exclusive area, {accountId}!</p>
      <p>Your stake: {getStakedAmount()} NEAR</p>
      <p>🏆 This content is only available to stakers.</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}

// Main App component with mode selector
function App() {
  const [mode, setMode] = React.useState<'wallet' | 'optional' | 'required'>('wallet');
  
  const getConfig = () => {
    switch (mode) {
      case 'wallet': return walletOnlyConfig;
      case 'optional': return optionalStakingConfig;
      case 'required': return requiredStakingConfig;
      default: return walletOnlyConfig;
    }
  };
  
  const renderExample = () => {
    switch (mode) {
      case 'wallet': return <WalletOnlyExample />;
      case 'optional': return <OptionalStakingExample />;
      case 'required': return <RequiredStakingExample />;
      default: return <WalletOnlyExample />;
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>@vitalpointai/near-login Examples</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label>Authentication Mode: </label>
        <select 
          value={mode} 
          onChange={(e) => setMode(e.target.value as any)}
          style={{ marginLeft: '10px', padding: '5px' }}
        >
          <option value="wallet">Wallet Only</option>
          <option value="optional">Optional Staking</option>
          <option value="required">Required Staking</option>
        </select>
      </div>

      <NEARLogin 
        config={getConfig()}
        onToast={({ title, description, variant }) => {
          console.log(`${variant?.toUpperCase()}: ${title} - ${description}`);
        }}
      >
        {renderExample()}
      </NEARLogin>
    </div>
  );
}

export default App;
