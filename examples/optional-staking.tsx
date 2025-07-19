import React from 'react';
import { NEARLogin, useNEARLogin } from '../src';
import type { AuthConfig } from '../src';

// Optional staking configuration - users can access without staking
const config: AuthConfig = {
  nearConfig: {
    networkId: 'testnet', // or 'mainnet' for production
  },
  requireStaking: false, // Optional staking
  validator: {
    poolId: 'vitalpointai.poolv1.near',
    displayName: 'Vital Point AI',
    required: false, // Not required - gives benefits if staked
    minStake: '1', // Minimum stake amount in NEAR
  },
};

function OptionalStakingApp() {
  const { 
    accountId, 
    signOut, 
    isLoading, 
    isStaked, 
    stake, 
    getStakedAmount,
    getValidatorInfo 
  } = useNEARLogin();

  const validator = getValidatorInfo();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h2>Optional Staking Benefits</h2>
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
      
      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
        {/* Basic Access Card */}
        <div style={{ 
          padding: '20px',
          border: '2px solid #28a745',
          borderRadius: '8px',
          backgroundColor: '#d4edda'
        }}>
          <h3>✅ Basic Access (Free)</h3>
          <p>Welcome! You have wallet-only access to:</p>
          <ul>
            <li>Browse public content</li>
            <li>Basic account features</li>
            <li>Standard support</li>
          </ul>
        </div>

        {/* Staking Benefits Card */}
        <div style={{ 
          padding: '20px',
          border: isStaked ? '2px solid #ffc107' : '2px dashed #6c757d',
          borderRadius: '8px',
          backgroundColor: isStaked ? '#fff3cd' : '#f8f9fa',
          opacity: isStaked ? 1 : 0.7
        }}>
          <h3>
            {isStaked ? '🌟 Premium Benefits (Active)' : '💡 Premium Benefits (Available)'}
          </h3>
          
          {isStaked ? (
            <div>
              <p><strong>Status:</strong> You have {getStakedAmount()} NEAR staked!</p>
              <p>You now have access to:</p>
              <ul>
                <li>🚀 Priority features</li>
                <li>📊 Advanced analytics</li>
                <li>💬 Premium support</li>
                <li>🎁 Exclusive rewards</li>
              </ul>
            </div>
          ) : (
            <div>
              <p>Stake with <strong>{validator?.displayName}</strong> to unlock:</p>
              <ul>
                <li>🚀 Priority features</li>
                <li>📊 Advanced analytics</li>
                <li>💬 Premium support</li>
                <li>🎁 Exclusive rewards</li>
              </ul>
              
              <div style={{ marginTop: '15px' }}>
                <p><strong>Minimum stake:</strong> {validator?.minStake || '1'} NEAR</p>
                <button 
                  onClick={() => stake('2')}
                  disabled={isLoading}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.6 : 1,
                    marginTop: '10px'
                  }}
                >
                  {isLoading ? 'Staking...' : 'Stake 2 NEAR'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div style={{ 
        marginTop: '30px',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: 'white'
      }}>
        <h3>Your Dashboard</h3>
        <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: '1fr 1fr 1fr' }}>
          <div style={{ padding: '15px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
            <h4>📋 Basic Features</h4>
            <p>Available to all users</p>
          </div>
          
          <div style={{ 
            padding: '15px', 
            backgroundColor: isStaked ? '#fff3cd' : '#f8f9fa', 
            borderRadius: '4px',
            opacity: isStaked ? 1 : 0.5
          }}>
            <h4>⚡ Advanced Features</h4>
            <p>{isStaked ? 'Unlocked!' : 'Requires staking'}</p>
          </div>
          
          <div style={{ 
            padding: '15px', 
            backgroundColor: isStaked ? '#d1ecf1' : '#f8f9fa', 
            borderRadius: '4px',
            opacity: isStaked ? 1 : 0.5
          }}>
            <h4>🎁 Exclusive Content</h4>
            <p>{isStaked ? 'Access granted!' : 'Premium members only'}</p>
          </div>
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
        <OptionalStakingApp />
      </NEARLogin>
    </div>
  );
}

export default App;
