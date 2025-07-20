import React from 'react';
import { NEARLogin } from '../../src';

/**
 * Basic Example: Beginner-Friendly Setup
 * 
 * Full educational experience for users new to crypto.
 * Includes tooltips, guides, and step-by-step wizards.
 */

function App() {
  const config = {
    nearConfig: { networkId: 'testnet' as const },
    requireStaking: false
  };

  return (
    <NEARLogin 
      config={config}
      // Enable all educational features
      showHelp={true}
      helpTexts={{
        walletConnection: "Connect your NEAR wallet to get started. Don't worry - your private keys never leave your wallet!",
        staking: "Staking means temporarily locking your NEAR tokens to help secure the network. In return, you earn rewards!"
      }}
      showEducation={true}
      educationTopics={['what-is-wallet', 'why-near', 'security-tips']}
    >
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>🎓 Welcome to NEAR!</h1>
        <p>Great job connecting your wallet! You're now part of the NEAR ecosystem.</p>
        <p>The educational features above helped guide you through the process.</p>
      </div>
    </NEARLogin>
  );
}

export default App;
