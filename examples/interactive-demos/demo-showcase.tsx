import React, { useState } from 'react';
import { NEARLogin, useNEARLogin, WalletEducation, GuidedStakingWizard } from '../../src';
import type { AuthConfig } from '../../src';

// Demo configurations for different scenarios
const demoConfigs = {
  walletOnly: {
    title: "Wallet Only",
    description: "Simple wallet connection, no staking required",
    config: {
      nearConfig: { networkId: 'testnet' as const },
    } as AuthConfig
  },
  
  optionalStaking: {
    title: "Optional Staking", 
    description: "Users can optionally stake for premium features",
    config: {
      requireStaking: false,
      validator: {
        poolId: 'demo.pool.near',
        displayName: 'Demo Validator',
        description: 'A demo validator for testing',
        minStake: '1',
        required: false
      },
      nearConfig: { networkId: 'testnet' as const }
    } as AuthConfig
  },
  
  requiredStaking: {
    title: "Required Staking",
    description: "Users must stake to access the application", 
    config: {
      requireStaking: true,
      validator: {
        poolId: 'demo.pool.near',
        displayName: 'Demo Validator',
        description: 'A demo validator for testing',
        minStake: '5',
        required: true
      },
      nearConfig: { networkId: 'testnet' as const }
    } as AuthConfig
  },
  
  educationalBeginner: {
    title: "Educational (Beginner Friendly)",
    description: "Full educational experience for crypto newcomers",
    config: {
      requireStaking: true,
      validator: {
        poolId: 'demo.pool.near',
        displayName: 'Demo Validator', 
        description: 'A beginner-friendly validator',
        minStake: '2',
        required: true
      },
      nearConfig: { networkId: 'testnet' as const }
    } as AuthConfig
  }
};

// User experience level selector
type UserLevel = 'beginner' | 'intermediate' | 'expert';

interface DemoSelectorProps {
  currentDemo: string;
  onDemoChange: (demo: string) => void;
  userLevel: UserLevel;
  onUserLevelChange: (level: UserLevel) => void;
}

const DemoSelector: React.FC<DemoSelectorProps> = ({
  currentDemo,
  onDemoChange,
  userLevel,
  onUserLevelChange
}) => (
  <div style={{ 
    padding: '20px', 
    backgroundColor: '#f8f9fa', 
    borderRadius: '8px', 
    marginBottom: '20px',
    border: '1px solid #dee2e6'
  }}>
    <h2 style={{ margin: '0 0 16px 0', color: '#1565c0' }}>
      🎮 NEAR Login Widget Demo
    </h2>
    
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
        👤 User Experience Level:
      </label>
      <select 
        value={userLevel}
        onChange={(e) => onUserLevelChange(e.target.value as UserLevel)}
        style={{
          padding: '8px 12px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          fontSize: '14px'
        }}
      >
        <option value="beginner">🌱 Beginner (New to crypto)</option>
        <option value="intermediate">🔧 Intermediate (Some crypto experience)</option>
        <option value="expert">⚡ Expert (Skip all tutorials)</option>
      </select>
    </div>

    <div>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
        📋 Demo Scenario:
      </label>
      <select
        value={currentDemo}
        onChange={(e) => onDemoChange(e.target.value)}
        style={{
          padding: '8px 12px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          fontSize: '14px',
          width: '100%'
        }}
      >
        {Object.entries(demoConfigs).map(([key, demo]) => (
          <option key={key} value={key}>
            {demo.title} - {demo.description}
          </option>
        ))}
      </select>
    </div>
    
    <div style={{ 
      marginTop: '12px', 
      padding: '12px', 
      backgroundColor: '#e3f2fd', 
      borderRadius: '4px',
      fontSize: '14px'
    }}>
      <strong>Current Config:</strong> {demoConfigs[currentDemo as keyof typeof demoConfigs]?.description}
    </div>
  </div>
);

// Dashboard component shown when authenticated
const Dashboard: React.FC = () => {
  const { 
    accountId, 
    isStaked, 
    stakingInfo, 
    signOut,
    getStakedAmount,
    getValidatorInfo
  } = useNEARLogin();

  const validator = getValidatorInfo();
  const stakedAmount = getStakedAmount();

  return (
    <div style={{ 
      padding: '32px',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#1565c0', margin: '0 0 8px 0' }}>
          ✅ Authentication Successful!
        </h1>
        <p style={{ color: '#666', margin: 0 }}>
          Welcome to the protected content area
        </p>
      </div>

      <div style={{ 
        backgroundColor: '#f8f9ff', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#1a1a1a' }}>
          🏦 Account Information
        </h3>
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <p><strong>Account ID:</strong> {accountId}</p>
          <p><strong>Authentication Status:</strong> <span style={{color: '#4caf50'}}>✓ Authenticated</span></p>
          <p><strong>Staking Status:</strong> {isStaked ? 
            <span style={{color: '#4caf50'}}>✓ Staked ({stakedAmount} NEAR)</span> : 
            <span style={{color: '#ff9800'}}>⚠ Not Staked</span>
          }</p>
          {validator && (
            <p><strong>Validator:</strong> {validator.displayName || validator.poolId}</p>
          )}
        </div>
      </div>

      {stakingInfo && (
        <div style={{ 
          backgroundColor: '#e8f5e8', 
          padding: '16px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>
            💰 Staking Details
          </h4>
          <div style={{ fontSize: '13px', color: '#1b5e20' }}>
            <p>Staked: {stakingInfo.stakedAmount} NEAR</p>
            <p>Rewards: {stakingInfo.rewards} NEAR</p>
            <p>Available for Withdrawal: {stakingInfo.availableForWithdrawal} NEAR</p>
          </div>
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#fff3e0', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
          <div style={{ fontSize: '13px', fontWeight: '600' }}>Analytics</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Available</div>
        </div>
        
        <div style={{ 
          padding: '16px', 
          backgroundColor: isStaked ? '#e8f5e8' : '#ffebee', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>
            {isStaked ? '🎁' : '🔒'}
          </div>
          <div style={{ fontSize: '13px', fontWeight: '600' }}>Premium</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {isStaked ? 'Unlocked' : 'Requires Staking'}
          </div>
        </div>
        
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#f3e5f5', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏆</div>
          <div style={{ fontSize: '13px', fontWeight: '600' }}>Rewards</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Earning</div>
        </div>
      </div>

      <button
        onClick={signOut}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500',
          transition: 'background-color 0.2s ease'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d32f2f'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f44336'}
      >
        🚪 Disconnect Wallet
      </button>
    </div>
  );
};

// Main demo application
export const NEARLoginDemo: React.FC = () => {
  const [currentDemo, setCurrentDemo] = useState('walletOnly');
  const [userLevel, setUserLevel] = useState<UserLevel>('intermediate');

  const getCurrentConfig = () => {
    return demoConfigs[currentDemo as keyof typeof demoConfigs]?.config || demoConfigs.walletOnly.config;
  };

  const getEducationalProps = () => {
    const config = getCurrentConfig();
    const isStakingRequired = config.requireStaking && config.validator?.required;
    
    switch (userLevel) {
      case 'beginner':
        return {
          showHelp: true,
          helpTexts: {
            walletConnection: "A crypto wallet safely stores your digital assets and lets you interact with blockchain apps. Think of it as a secure digital keychain.",
            staking: "Staking means temporarily locking your NEAR tokens to help secure the network. You earn rewards (typically 8-12% annually) and your tokens remain yours.",
            stakingAmount: "Start with the minimum amount while you learn. You can always stake more later. Your tokens remain safe in your wallet.",
            rewards: "Staking rewards are earned automatically and compound over time. Most validators distribute rewards daily.",
            validatorSelection: "Validators process transactions and secure the network. Choose one with good uptime and reasonable fees.",
            networkFees: "Network fees are very small on NEAR (usually less than $0.01) and help keep the network secure and fast."
          },
          showEducation: true,
          educationTopics: ['what-is-wallet', 'why-near', 'how-staking-works', 'security-tips'] as ('what-is-wallet' | 'why-near' | 'how-staking-works' | 'security-tips')[],
          useGuidedStaking: isStakingRequired
        };
      
      case 'intermediate':
        return {
          showHelp: true,
          helpTexts: {
            walletConnection: "Connect your NEAR wallet to get started. Don't have one? We'll help you choose the right option.",
          },
          showEducation: true,
          educationTopics: [] as ('what-is-wallet' | 'why-near' | 'how-staking-works' | 'security-tips')[],
          useGuidedStaking: false
        };
      
      case 'expert':
        return {
          showHelp: false,
          helpTexts: {},
          showEducation: false,
          educationTopics: [] as ('what-is-wallet' | 'why-near' | 'how-staking-works' | 'security-tips')[],
          useGuidedStaking: false // Expert users get direct staking interface
        };
      
      default:
        return {
          showHelp: false,
          helpTexts: {},
          showEducation: false,
          educationTopics: [] as ('what-is-wallet' | 'why-near' | 'how-staking-works' | 'security-tips')[],
          useGuidedStaking: false
        };
    }
  };

  const handleToast = (toast: any) => {
    console.log(`Toast: ${toast.type} - ${toast.title}: ${toast.message}`);
    // In a real app, you'd integrate with your toast notification system
    alert(`${toast.type.toUpperCase()}: ${toast.title}\n${toast.message}`);
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <DemoSelector
          currentDemo={currentDemo}
          onDemoChange={setCurrentDemo}
          userLevel={userLevel}
          onUserLevelChange={setUserLevel}
        />

        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            padding: '16px 24px',
            backgroundColor: '#1976d2',
            color: 'white'
          }}>
            <h3 style={{ margin: 0 }}>
              🎯 {demoConfigs[currentDemo as keyof typeof demoConfigs]?.title} Demo
            </h3>
            <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
              User Level: {userLevel.charAt(0).toUpperCase() + userLevel.slice(1)} | 
              {userLevel === 'expert' ? ' Direct UI (no tutorials)' : 
               userLevel === 'intermediate' ? ' Help tooltips enabled' : 
               ' Full educational experience'}
            </p>
          </div>

          <div style={{ padding: '24px' }}>
            <NEARLogin
              config={getCurrentConfig()}
              onToast={handleToast}
              {...getEducationalProps()}
            >
              <Dashboard />
            </NEARLogin>
          </div>
        </div>

        {/* Demo Information Panel */}
        <div style={{ 
          marginTop: '20px',
          padding: '16px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#1565c0' }}>
            ℹ️ Demo Information
          </h4>
          <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#666' }}>
            <p><strong>Current Configuration:</strong></p>
            <pre style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '8px', 
              borderRadius: '4px',
              fontSize: '12px',
              overflow: 'auto'
            }}>
              {JSON.stringify(getCurrentConfig(), null, 2)}
            </pre>
            <p><strong>Educational Props:</strong></p>
            <pre style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '8px', 
              borderRadius: '4px',
              fontSize: '12px',
              overflow: 'auto'
            }}>
              {JSON.stringify(getEducationalProps(), null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NEARLoginDemo;
