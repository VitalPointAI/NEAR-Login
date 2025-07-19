import React from 'react';
import { NEARLogin, useNEARLogin } from '../src';
import type { AuthConfig } from '../src';

// Required staking configuration - users must stake to access
const config: AuthConfig = {
  nearConfig: {
    networkId: 'testnet', // or 'mainnet' for production
  },
  requireStaking: true, // Required staking
  validator: {
    poolId: 'vitalpointai.poolv1.near',
    displayName: 'Vital Point AI',
    required: true, // Must stake to access
    minStake: '5', // Minimum 5 NEAR required
  },
};

function RequiredStakingApp() {
  const { 
    accountId, 
    signOut, 
    isLoading, 
    getStakedAmount,
    getUnstakedAmount,
    getValidatorInfo 
  } = useNEARLogin();

  const validator = getValidatorInfo();
  const stakedAmount = getStakedAmount();
  const unstakedAmount = getUnstakedAmount();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#d4edda',
        borderRadius: '8px',
        border: '2px solid #28a745'
      }}>
        <div>
          <h2 style={{ margin: 0, color: '#155724' }}>🏆 VIP Stakers Only</h2>
          <p style={{ margin: '5px 0 0 0', color: '#155724' }}>
            Welcome to the exclusive staker area, <strong>{accountId}</strong>!
          </p>
        </div>
        <button 
          onClick={signOut}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
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

      {/* Staking Status */}
      <div style={{ 
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#fff3cd',
        borderRadius: '8px',
        border: '1px solid #ffeaa7'
      }}>
        <h3 style={{ marginTop: 0 }}>📊 Your Staking Status</h3>
        <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: '1fr 1fr 1fr' }}>
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#e67e22' }}>Staked Amount</h4>
            <p style={{ fontSize: '1.5em', fontWeight: 'bold', margin: 0, color: '#d63031' }}>
              {stakedAmount} NEAR
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#0984e3' }}>Unstaked Amount</h4>
            <p style={{ fontSize: '1.5em', fontWeight: 'bold', margin: 0, color: '#74b9ff' }}>
              {unstakedAmount} NEAR
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#00b894' }}>Validator</h4>
            <p style={{ fontSize: '1.2em', fontWeight: 'bold', margin: 0, color: '#00cec9' }}>
              {validator?.displayName}
            </p>
          </div>
        </div>
      </div>

      {/* Exclusive Content */}
      <div style={{ 
        padding: '25px',
        border: '2px solid #6f42c1',
        borderRadius: '12px',
        backgroundColor: '#f8f9ff',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#6f42c1', marginTop: 0 }}>🌟 Exclusive Staker Benefits</h3>
        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <h4>🚀 Priority Features</h4>
            <ul>
              <li>Early access to new features</li>
              <li>Enhanced transaction speeds</li>
              <li>Advanced analytics dashboard</li>
              <li>Custom validator insights</li>
            </ul>
          </div>
          <div>
            <h4>💎 Premium Services</h4>
            <ul>
              <li>24/7 priority support</li>
              <li>Dedicated account manager</li>
              <li>Custom API access</li>
              <li>Exclusive community access</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Rewards Section */}
      <div style={{ 
        padding: '20px',
        backgroundColor: '#e8f5e8',
        borderRadius: '8px',
        border: '1px solid #c3e6c3'
      }}>
        <h3 style={{ color: '#2d5a2d', marginTop: 0 }}>🎁 Staking Rewards</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: '5px 0', fontSize: '1.1em' }}>
              <strong>Current APY:</strong> <span style={{ color: '#28a745' }}>~10.5%</span>
            </p>
            <p style={{ margin: '5px 0', fontSize: '1.1em' }}>
              <strong>Estimated Monthly Rewards:</strong> <span style={{ color: '#28a745' }}>
                {(parseFloat(stakedAmount) * 0.105 / 12).toFixed(4)} NEAR
              </span>
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <button style={{
              padding: '12px 24px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1em',
              fontWeight: 'bold'
            }}>
              View Detailed Rewards
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        marginTop: '30px',
        textAlign: 'center',
        padding: '15px',
        backgroundColor: '#f1f3f4',
        borderRadius: '8px',
        fontSize: '0.9em',
        color: '#6c757d'
      }}>
        <p>
          Thank you for staking with {validator?.displayName}! 
          Your support helps secure the NEAR network and enables exclusive access to this content.
        </p>
      </div>
    </div>
  );
}

function App() {
  const handleToast = ({ title, description, variant }: { title?: string; description?: string; variant?: string }) => {
    console.log(`${variant?.toUpperCase()}: ${title} - ${description}`);
    // In a real app, you'd show this in a toast notification
    alert(`${title}: ${description}`);
  };

  return (
    <div>
      <NEARLogin config={config} onToast={handleToast}>
        <RequiredStakingApp />
      </NEARLogin>
    </div>
  );
}

export default App;
