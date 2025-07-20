import React from 'react';
import { NEARLogin } from '../../src';
import type { AuthConfig } from '../../src';

// Example with educational tooltips and help text
const config: AuthConfig = {
  requireStaking: true,
  validator: {
    poolId: 'vitalpoint.pool.near',
    minStake: '10',
    displayName: 'VitalPoint Validator',
    description: 'A reliable validator with competitive rewards'
  },
  nearConfig: {
    networkId: 'testnet'
  }
};

function EducationalStakingApp() {
  const handleToast = ({ title, description, variant }: { title?: string; description?: string; variant?: string }) => {
    console.log(`${variant?.toUpperCase()}: ${title} - ${description}`);
    // In a real app, you'd show this in a toast notification
    alert(`${title}: ${description}`);
  };

  return (
    <NEARLogin 
      config={config}
      onToast={handleToast}
      
      // Enable educational features
      showHelp={true}
      helpTexts={{
        walletConnection: "Your NEAR wallet is like a secure digital keychain. It never shares your private keys with websites.",
        staking: "By staking NEAR tokens, you help secure the network and earn rewards. Think of it like earning interest on your savings!",
        stakingAmount: "Start small while learning! You can always stake more later. The minimum is usually 1-10 NEAR.",
        validatorSelection: "Validators are trusted nodes that process transactions. Choose one with good uptime and reasonable fees."
      }}
      showEducation={true}
      educationTopics={['what-is-wallet', 'why-near', 'how-staking-works', 'security-tips']}
      useGuidedStaking={true}
    >
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>🎉 Welcome to the Educational Staking App!</h1>
        <p>You've successfully completed the onboarding process and staked your NEAR tokens.</p>
        
        <div style={{ 
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#f0f8ff',
          borderRadius: '10px',
          border: '2px solid #1976d2'
        }}>
          <h2>🌟 Premium Features Unlocked!</h2>
          <ul style={{ textAlign: 'left', display: 'inline-block' }}>
            <li>✅ Access to exclusive content</li>
            <li>✅ Earn staking rewards (8-12% APY)</li>
            <li>✅ Priority support</li>
            <li>✅ Advanced analytics</li>
            <li>✅ Community governance voting</li>
          </ul>
        </div>
        
        <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          <p>
            💡 <strong>Pro tip:</strong> Your staking rewards compound automatically! 
            You can check your earnings in your NEAR wallet anytime.
          </p>
        </div>
      </div>
    </NEARLogin>
  );
}

export default EducationalStakingApp;
