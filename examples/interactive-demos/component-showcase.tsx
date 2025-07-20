import React from 'react';
import { NEARLogin, GuidedStakingWizard, WalletEducation, EducationTooltip } from '../src';
import type { AuthConfig } from '../src';

// Example showing individual educational components
const config: AuthConfig = {
  requireStaking: false, // Optional staking for this example
  nearConfig: {
    networkId: 'testnet'
  }
};

function ComponentShowcase() {
  const [showWizard, setShowWizard] = React.useState(false);
  const [showEducation, setShowEducation] = React.useState(false);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🎓 Educational Components Showcase</h1>
      
      {/* Wallet Education Component */}
      <section style={{ marginBottom: '40px' }}>
        <h2>💡 Wallet Education Component</h2>
        <p>Help new users understand crypto wallets and NEAR Protocol:</p>
        
        <button
          onClick={() => setShowEducation(!showEducation)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          {showEducation ? 'Hide' : 'Show'} Wallet Education
        </button>
        
        {showEducation && (
          <WalletEducation
            topics={['what-is-wallet', 'why-near', 'how-staking-works', 'security-tips']}
            showVideo={false}
            onComplete={() => setShowEducation(false)}
          />
        )}
      </section>

      {/* Education Tooltips */}
      <section style={{ marginBottom: '40px' }}>
        <h2>❓ Education Tooltips</h2>
        <p>Add helpful explanations anywhere in your UI:</p>
        
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
          <EducationTooltip
            content="A cryptocurrency wallet is like a secure digital keychain that stores your crypto and lets you sign transactions."
            title="What is a Crypto Wallet?"
            position="top"
            trigger="hover"
          >
            <button style={{ padding: '10px', backgroundColor: '#f0f8ff', border: '1px solid #ccc', borderRadius: '4px' }}>
              Hover for wallet info
            </button>
          </EducationTooltip>

          <EducationTooltip
            content="Staking means temporarily locking your NEAR tokens to help secure the network. In return, you earn rewards - typically 8-12% annually!"
            title="How Staking Works"
            position="bottom"
            trigger="click"
          >
            <button style={{ padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px' }}>
              Click for staking info
            </button>
          </EducationTooltip>

          <EducationTooltip
            content="Network fees on NEAR are incredibly low - usually less than $0.01 per transaction. These fees help keep the network secure and running smoothly."
            title="About Network Fees"
            position="left"
            trigger="hover"
          >
            <button style={{ padding: '10px', backgroundColor: '#d4edda', border: '1px solid #28a745', borderRadius: '4px' }}>
              Hover for fee info
            </button>
          </EducationTooltip>
        </div>
      </section>

      {/* Guided Staking Wizard */}
      <section style={{ marginBottom: '40px' }}>
        <h2>🚀 Guided Staking Wizard</h2>
        <p>Step-by-step wizard to help users through the staking process:</p>
        
        <button
          onClick={() => setShowWizard(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            marginBottom: '20px'
          }}
        >
          🧙‍♂️ Launch Staking Wizard
        </button>
        
        {showWizard && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GuidedStakingWizard
              validator={{
                poolId: 'demo.pool.near',
                displayName: 'Demo Validator',
                minStake: '1',
                description: 'A demonstration validator for testing'
              }}
              minStake="1"
              onComplete={async (amount: string) => {
                alert(`Demo complete! You would stake ${amount} NEAR`);
                setShowWizard(false);
              }}
              onCancel={() => setShowWizard(false)}
              helpTexts={{
                staking: "This is a demo of the staking process. In a real app, this would connect to your NEAR wallet and execute the staking transaction.",
                stakingAmount: "For this demo, any amount over 1 NEAR is valid. Start small while you learn!",
                rewards: "Staking rewards are typically 8-12% annually and compound automatically."
              }}
            />
          </div>
        )}
      </section>

      {/* Integration Example */}
      <section>
        <h2>🔗 Full Integration Example</h2>
        <p>See how these components work together in a real authentication flow:</p>
        
        <NEARLogin 
          config={config}
          showHelp={true}
          helpTexts={{
            walletConnection: "Connect your NEAR wallet to access this demo application. Your private keys always stay in your wallet!",
            staking: "Staking is optional for this demo, but it unlocks additional features and helps you earn rewards."
          }}
          showEducation={true}
          educationTopics={['what-is-wallet', 'why-near']}
        >
          <div style={{ 
            textAlign: 'center',
            padding: '40px',
            backgroundColor: '#f8f9ff',
            borderRadius: '12px',
            border: '2px solid #1976d2'
          }}>
            <h3>🎉 You're Connected!</h3>
            <p>This content is only visible to authenticated users.</p>
            <p>The educational components helped guide you through the process!</p>
          </div>
        </NEARLogin>
      </section>
    </div>
  );
}

export default ComponentShowcase;
