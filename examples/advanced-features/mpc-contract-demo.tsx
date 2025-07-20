import React, { useState } from 'react';
import { 
  NEARLogin, 
  useNEARLogin, 
  MPC_CONTRACTS,
  type AuthConfig 
} from '../../src';

/**
 * Demo showing automatic MPC contract selection based on network
 * 
 * Key features demonstrated:
 * 1. Automatic MPC contract selection (no need to specify contractId)
 * 2. Both mainnet and testnet configurations
 * 3. Override capability for custom MPC contracts
 * 4. Experienced user bypass options
 */
function MPCContractDemo() {
  const [networkId, setNetworkId] = useState<'mainnet' | 'testnet'>('testnet');
  const [useCustomContract, setUseCustomContract] = useState(false);
  const [customContractId, setCustomContractId] = useState('');
  const [showExperiencedMode, setShowExperiencedMode] = useState(false);

  // Configuration with automatic MPC contract selection
  const config: AuthConfig = {
    requireStaking: false, // Optional staking for this demo
    nearConfig: { networkId },
    chainSignature: {
      // contractId is automatically selected based on networkId:
      // - mainnet: 'v1.signer' 
      // - testnet: 'v1.signer-prod.testnet'
      ...(useCustomContract && customContractId ? { contractId: customContractId } : {}),
      supportedChains: ['ethereum', 'bitcoin']
    }
  };

  const selectedContractId = useCustomContract && customContractId 
    ? customContractId 
    : MPC_CONTRACTS[networkId];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🔗 MPC Contract Auto-Selection Demo</h1>
      
      {/* Configuration Controls */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '30px',
        border: '1px solid #dee2e6'
      }}>
        <h3>Configuration</h3>
        
        {/* Network Selection */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
            Network:
          </label>
          <div>
            <label style={{ marginRight: '20px' }}>
              <input
                type="radio"
                value="testnet"
                checked={networkId === 'testnet'}
                onChange={(e) => setNetworkId(e.target.value as 'mainnet' | 'testnet')}
              />
              <span style={{ marginLeft: '5px' }}>Testnet</span>
            </label>
            <label>
              <input
                type="radio"
                value="mainnet"
                checked={networkId === 'mainnet'}
                onChange={(e) => setNetworkId(e.target.value as 'mainnet' | 'testnet')}
              />
              <span style={{ marginLeft: '5px' }}>Mainnet</span>
            </label>
          </div>
        </div>

        {/* Contract Override */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
            <input
              type="checkbox"
              checked={useCustomContract}
              onChange={(e) => setUseCustomContract(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Override with custom MPC contract
          </label>
          {useCustomContract && (
            <input
              type="text"
              value={customContractId}
              onChange={(e) => setCustomContractId(e.target.value)}
              placeholder="your-custom-mpc.near"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginTop: '8px'
              }}
            />
          )}
        </div>

        {/* Experience Mode Toggle */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
            <input
              type="checkbox"
              checked={showExperiencedMode}
              onChange={(e) => setShowExperiencedMode(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Experienced user mode (bypass educational features)
          </label>
        </div>

        {/* Contract Information Display */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '15px', 
          borderRadius: '6px',
          border: '1px solid #e0e0e0',
          marginTop: '15px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Selected MPC Contract:</h4>
          <p style={{ 
            margin: '0', 
            fontFamily: 'monospace', 
            fontSize: '14px',
            padding: '8px',
            backgroundColor: '#f1f3f4',
            borderRadius: '4px'
          }}>
            <strong>{selectedContractId}</strong>
          </p>
          
          <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            <p style={{ margin: '5px 0' }}>
              📍 <strong>Automatic Selection:</strong>
            </p>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>Mainnet: <code>{MPC_CONTRACTS.mainnet}</code></li>
              <li>Testnet: <code>{MPC_CONTRACTS.testnet}</code></li>
            </ul>
          </div>
        </div>
      </div>

      {/* NEARLogin Component */}
      <div style={{ 
        border: '2px solid #007bff', 
        borderRadius: '12px', 
        padding: '20px',
        backgroundColor: 'white'
      }}>
        <h3 style={{ marginTop: '0', color: '#007bff' }}>
          NEARLogin Component {networkId === 'mainnet' ? '🟢' : '🔵'}
        </h3>
        
        <NEARLogin 
          config={config}
          // Educational features (can be bypassed)
          showHelp={!showExperiencedMode}
          helpTexts={!showExperiencedMode ? {
            walletConnection: `Connect your NEAR wallet to access multi-chain features. Using ${networkId} network with MPC contract: ${selectedContractId}`,
            staking: "Multi-chain features require wallet connection. Staking is optional for this demo."
          } : undefined}
          showEducation={!showExperiencedMode}
          educationTopics={!showExperiencedMode ? ['what-is-wallet', 'why-near'] as const : undefined}
        >
          <DemoContent networkId={networkId} contractId={selectedContractId} />
        </NEARLogin>
      </div>

      {/* Code Examples */}
      <div style={{ marginTop: '30px' }}>
        <h3>💻 Code Example</h3>
        <pre style={{ 
          backgroundColor: '#2d3748', 
          color: '#e2e8f0', 
          padding: '20px', 
          borderRadius: '8px', 
          overflow: 'auto',
          fontSize: '14px'
        }}>
{`// Automatic MPC contract selection
const config = {
  nearConfig: { networkId: '${networkId}' },
  chainSignature: {
    // contractId automatically set to:
    // mainnet: 'v1.signer'
    // testnet: 'v1.signer-prod.testnet'
    ${useCustomContract && customContractId 
      ? `contractId: '${customContractId}', // Override` 
      : '// contractId: automatically selected'
    }
    supportedChains: ['ethereum', 'bitcoin']
  }
};

// Access the constants directly
import { MPC_CONTRACTS } from '@vitalpointai/near-login';
console.log(MPC_CONTRACTS.mainnet);  // 'v1.signer'
console.log(MPC_CONTRACTS.testnet);  // 'v1.signer-prod.testnet'`}
        </pre>
      </div>
    </div>
  );
}

function DemoContent({ networkId, contractId }: { networkId: string, contractId: string }) {
  const { accountId, signOut } = useNEARLogin();

  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div style={{
        backgroundColor: '#e7f5e7',
        border: '2px solid #4caf50',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h3>🎉 Successfully Connected!</h3>
        <p><strong>Account:</strong> {accountId}</p>
        <p><strong>Network:</strong> {networkId}</p>
        <p><strong>MPC Contract:</strong> <code>{contractId}</code></p>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <p>Multi-chain signature capabilities are now available!</p>
        <p style={{ fontSize: '14px', color: '#666' }}>
          The MPC contract was automatically selected based on your network choice.
          {contractId.includes('custom') ? ' You are using a custom override.' : ''}
        </p>
        
        <button
          onClick={signOut}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}

export default MPCContractDemo;
